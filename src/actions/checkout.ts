"use server";
import { cacheDel } from "@/lib/cache-helpers";
import { orderKeys } from "@/lib/cache-keys";
import { returnError } from "@/lib/utils";
import { stripeClient } from "@/server/better-auth/config";
import { getUser } from "@/server/better-auth/server";
import { db } from "@/server/db";
import {
  addresses,
  carts,
  discountCodes,
  orderItems,
  orders,
  payments,
} from "@/server/db/schema";
import {
  checkoutSchema,
  type CheckoutSchema,
} from "@/zod-schema/checkout-schema";
import { and, eq } from "drizzle-orm";

export const validateDiscountCode = async (code: string, subtotal: number) => {
  try {
    const discount = await db.query.discountCodes.findFirst({
      where: and(
        eq(discountCodes.code, code.toUpperCase().trim()),
        eq(discountCodes.isActive, true),
      ),
    });

    if (!discount) {
      return {
        success: false,
        data: null,
        message: "Invalid or expired discount code",
      };
    }

    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
      return {
        success: false,
        data: null,
        message: "This discount code has reached its usage limit",
      };
    }

    if (
      discount.minOrderAmount !== null &&
      subtotal < Number(discount.minOrderAmount)
    ) {
      return {
        success: false,
        data: null,
        message: `Minimum order of $${Number(discount.minOrderAmount).toFixed(2)} required for this code`,
      };
    }

    const discountAmount =
      discount.type === "percentage"
        ? (subtotal * Number(discount.value)) / 100
        : Math.min(Number(discount.value), subtotal);

    return {
      success: true,
      data: {
        id: discount.id,
        code: discount.code,
        type: discount.type,
        value: Number(discount.value),
        discountAmount: Math.round(discountAmount * 100) / 100,
      },
      message: `${discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`} discount applied`,
    };
  } catch (error) {
    return returnError(error, "Unable to validate discount code");
  }
};

const SHIPPING_RATE = 0;

export const createPaymentIntent = async (values: CheckoutSchema) => {
  try {
    const user = await getUser();
    const validated = checkoutSchema.parse(values);
    const {
      email,
      phone,
      fullName,
      line1,
      line2,
      city,
      state,
      postalCode,
      country,
      discountCode,
      saveAddress,
    } = validated;

    const cart = await db.query.carts.findFirst({
      where: and(eq(carts.userId, user.id)),
      with: {
        items: {
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                hasVariants: true,
                stock: true,
                vendorId: true,
                status: true,
              },
              with: {
                images: {
                  where: (img, { eq }) => eq(img.isPrimary, true),
                  limit: 1,
                  columns: { url: true },
                },
              },
            },
            variant: {
              columns: {
                id: true,
                name: true,
                price: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        data: null,
        message: "Your cart is empty",
      };
    }

    for (const item of cart.items) {
      if (item.product.status !== "active") {
        return {
          success: false,
          data: null,
          message: `"${item.product.name}" is no longer available`,
        };
      }
      const availableStock = item.product.hasVariants
        ? (item.variant?.stock ?? 0)
        : item.product.stock;

      if (availableStock < item.quantity) {
        return {
          success: false,
          data: null,
          message: `Only ${availableStock} of "${item.product.name}" in stock`,
        };
      }
    }

    const vendorIds = [...new Set(cart.items.map((i) => i.product.vendorId))];

    const vendors = await db.query.vendorProfiles.findMany({
      where: (vp, { inArray }) => inArray(vp.id, vendorIds),
      columns: {
        id: true,
        stripeAccountId: true,
        stripeOnboardingComplete: true,
        commissionRate: true,
      },
    });

    const vendorMap = Object.fromEntries(vendors.map((v) => [v.id, v]));

    for (const vendorId of vendorIds) {
      const vendor = vendorMap[vendorId];
      if (!vendor?.stripeOnboardingComplete) {
        return {
          success: false,
          data: null,
          message:
            "One or more items in your cart are from a vendor that cannot accept payments right now. Please remove them and try again.",
        };
      }
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.variant?.price
        ? Number(item.variant.price)
        : Number(item.product.basePrice);
      return sum + price * item.quantity;
    }, 0);

    let discountAmount = 0;
    let discountCodeId: string | null = null;
    let discountCodeUsed: string | null = null;

    if (discountCode) {
      const discountResult = await validateDiscountCode(discountCode, subtotal);
      if (!discountResult.success) {
        return {
          success: false,
          message: discountResult.message,
          data: null,
        };
      }
      discountAmount = Number(discountResult.data?.discountAmount);
      discountCodeId = discountResult.data?.id as string;
      discountCodeUsed = discountResult.data?.code as string;
    }

    const shippingAmount = SHIPPING_RATE;
    const total = Math.max(0, subtotal - discountAmount + shippingAmount);
    const totalInCents = Math.round(total * 100);

    if (totalInCents < 50) {
      return {
        success: false,
        data: null,
        message: "Order total must be at least $0.50",
      };
    }

    const addressSnapshot = JSON.stringify({
      fullName,
      line1,
      line2: line2 || null,
      city,
      state: state || null,
      postalCode,
      country,
      phone: phone || null,
    });

    const newOrder = await db.transaction(async (tx) => {
      const [order] = await db
        .insert(orders)
        .values({
          userId: user.id,
          guestEmail: null,
          status: "pending",
          subtotal: subtotal.toFixed(2),
          discountAmount: discountAmount.toFixed(2),
          shippingAmount: shippingAmount.toFixed(2),
          total: total.toFixed(2),
          shippingAddressSnapshot: addressSnapshot,
          discountCodeId,
          discountCodeUsed,
        })
        .returning();

      await tx.insert(orderItems).values(
        cart.items.map((item) => {
          const unitPrice = item.variant?.price
            ? Number(item.variant.price)
            : Number(item.product.basePrice);

          return {
            orderId: order?.id!,
            vendorId: item.product.vendorId,
            productId: item.product.id,
            variantId: item.variantId,
            productName: item.product.name,
            variantName: item.variant?.name ?? null,
            imageUrl: item.product.images?.[0]?.url ?? null,
            quantity: item.quantity,
            unitPrice: unitPrice.toFixed(2),
            totalPrice: (unitPrice * item.quantity).toFixed(2),
            status: "pending" as const,
          };
        }),
      );

      if (saveAddress) {
        const hasDefault = await tx.query.addresses.findFirst({
          where: and(
            eq(addresses.userId, user.id),
            eq(addresses.isDefault, true),
          ),
          columns: { id: true },
        });

        await tx.insert(addresses).values({
          userId: user.id,
          fullName,
          line1,
          line2: line2 || null,
          city,
          state: state || null,
          postalCode,
          country,
          phone: phone || null,
          isDefault: !hasDefault,
        });
      }
      return order;
    });

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: totalInCents,
      currency: "usd",
      receipt_email: email,
      metadata: {
        orderId: newOrder?.id!,
        userId: user.id,
        cartId: cart.id,
      },
      automatic_payment_methods: { enabled: true },
      transfer_group: newOrder?.id,
    });

    await db
      .update(orders)
      .set({
        stripePaymentIntentId: paymentIntent.id,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, newOrder?.id!));

    await db.insert(payments).values({
      orderId: newOrder?.id!,
      stripePaymentIntentId: paymentIntent.id,
      amount: total.toFixed(2),
      currency: "usd",
      status: "pending",
    });

    cacheDel(orderKeys.tags.all());

    return {
      success: true,
      message: "Order created",
      data: {
        clientSecret: paymentIntent.client_secret!,
        orderId: newOrder?.id,
        total,
        subtotal,
        discountAmount,
        shippingAmount,
      },
    };
  } catch (error) {
    return returnError(error, "Unable to create order");
  }
};

export const getCheckoutSummary = async () => {
  try {
    const user = await getUser();

    const cart = await db.query.carts.findFirst({
      where: eq(carts.userId, user.id),
      with: {
        items: {
          with: {
            product: {
              columns: {
                id: true,
                name: true,
                slug: true,
                basePrice: true,
                hasVariants: true,
              },
              with: {
                images: {
                  where: (img, { eq }) => eq(img.isPrimary, true),
                  limit: 1,
                  columns: { url: true },
                },
              },
            },
            variant: {
              columns: { id: true, name: true, price: true },
            },
          },
        },
        discountCode: {
          columns: { id: true, code: true, type: true, value: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        data: null,
        message: "Your cart is empty",
      };
    }

    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.variant?.price
        ? Number(item.variant.price)
        : Number(item.product.basePrice);
      return sum + price * item.quantity;
    }, 0);

    return {
      success: true,
      message: "Cart Summary",
      data: { cart, subtotal, itemCount: cart.items.length },
    };
  } catch (error) {
    return returnError(error, "Unable to load checkout summary");
  }
};

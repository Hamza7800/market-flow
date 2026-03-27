"use server";

import { env } from "@/env";
import { cacheDel } from "@/lib/cache-helpers";
import { orderKeys, vendorKeys } from "@/lib/cache-keys";
import { deriveOrderStatus, returnError } from "@/lib/utils";
import { stripeClient } from "@/server/better-auth/config";
import { getUser } from "@/server/better-auth/server";
import { db } from "@/server/db";
import {
  cartItems,
  orderItems,
  orders,
  payments,
  refunds,
  vendorProfiles,
  vendorTransfers,
} from "@/server/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import type Stripe from "stripe";

export const requireVendorProfile = async () => {
  const user = await getUser();

  const vendor = await db.query.vendorProfiles.findFirst({
    where: and(
      eq(vendorProfiles.userId, user.id),
      isNull(vendorProfiles.deletedAt),
    ),
  });

  if (!vendor) {
    return {
      success: false,
      message: "Vendor profile not found",
      data: null,
    };
  }

  return {
    success: true,
    vendor,
    user,
    message: null,
    data: null,
  };
};

export const createConnectAccount = async () => {
  const result = await requireVendorProfile();
  if (!result.success) {
    return {
      success: false,
      message: result.message,
      data: null,
    };
  }

  const { user, vendor } = result;

  if (!user && !vendor) {
    return {
      success: false,
      message: "Unable to connect with stripe right now",
      data: null,
    };
  }

  try {
    let stripeAccountId = vendor?.stripeAccountId;

    if (!stripeAccountId) {
      const account = await stripeClient.accounts.create({
        type: "express",
        email: user?.email,
        business_profile: {
          name: vendor?.storeName,
          // url: `${env.NEXT_PUBLIC_APP_URL}/vendor/${vendor?.id}/dashboard`,
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          vendorId: vendor.id,
          userId: user.id,
          storeSlug: vendor.storeSlug,
        },
      });

      stripeAccountId = account.id;

      await db
        .update(vendorProfiles)
        .set({
          stripeAccountId,
          updatedAt: new Date(),
        })
        .where(eq(vendorProfiles.id, vendor.id));

      cacheDel(
        vendorKeys.tags.byUser(user.id),
        vendorKeys.tags.detail(vendor.id),
      );
    }

    const linkResult = await _createOnboardingLink(stripeAccountId, vendor.id);
    if (!linkResult.success) {
      return { success: false, message: linkResult.message, data: null };
    }

    return {
      success: true,
      message: "Stripe account created",
      data: { url: linkResult.url, stripeAccountId },
    };
  } catch (error) {
    console.error("[createConnectAccount]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create Stripe account",
      data: null,
    };
  }
};

const _createOnboardingLink = async (
  stripeAccountId: string,
  vendorId: string,
) => {
  try {
    const baseUrl = env.NEXT_PUBLIC_APP_URL;
    const accountLink = await stripeClient.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${baseUrl}/vendor/${vendorId}/dashboard/stripe`,
      return_url: `${baseUrl}/vendor/${vendorId}/dashboard/stripe`,
      type: "account_onboarding",
    });

    return {
      success: true,
      message: "Account Link",
      url: accountLink.url,
    };
  } catch (error) {
    console.error("[createOnboardingLink]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create onboarding link",
    };
  }
};

export const createOnboardingLink = async () => {
  const result = await requireVendorProfile();
  if (!result.success) {
    return { success: false, message: result.message, data: null };
  }
  const { vendor } = result;
  if (!vendor) {
    return {
      success: false,
      message: "Unable to connect with stripe right now",
      data: null,
    };
  }

  if (!vendor.stripeAccountId) {
    return {
      success: false,
      message:
        "No Stripe account found. Please start the Connect flow from the beginning.",
      data: null,
    };
  }

  try {
    const linkResult = await _createOnboardingLink(
      vendor.stripeAccountId,
      vendor.storeSlug,
    );

    if (!linkResult.success) {
      return { success: false, message: linkResult.message, data: null };
    }

    return {
      success: true,
      message: "Onboarding link created",
      data: { url: linkResult.url },
    };
  } catch (error) {
    console.error("[createOnboardingLink]", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to generate onboarding link",
      data: null,
    };
  }
};

export const syncConnectAccountStatus = async (stripeAccountId: string) => {
  try {
    const account = await stripeClient.accounts.retrieve(stripeAccountId);
    const onboardingComplete =
      account.charges_enabled === true &&
      account.payouts_enabled === true &&
      account.details_submitted === true;

    await db
      .update(vendorProfiles)
      .set({
        stripeOnboardingComplete: onboardingComplete,
        updatedAt: new Date(),
      })
      .where(eq(vendorProfiles.stripeAccountId, stripeAccountId));

    const vendor = await db.query.vendorProfiles.findFirst({
      where: eq(vendorProfiles.stripeAccountId, stripeAccountId),
      columns: { userId: true, id: true },
    });

    if (vendor) {
      cacheDel(
        vendorKeys.tags.byUser(vendor.userId),
        vendorKeys.tags.detail(vendor.id),
        vendorKeys.tags.all(),
      );
    }

    return {
      success: true,
      message: onboardingComplete
        ? "Stripe onboarding complete"
        : "Stripe account updated — onboarding still incomplete",
      data: { onboardingComplete },
    };
  } catch (error) {
    console.error("[syncConnectAccountStatus]", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to sync Stripe status",
      data: null,
    };
  }
};

export const handleAccountUpdated = async (account: Stripe.Account) => {
  await syncConnectAccountStatus(account.id);
  console.log(
    `[stripe-webhook] account.updated → ${account.id}`,
    `charges_enabled=${account.charges_enabled}`,
    `payouts_enabled=${account.payouts_enabled}`,
  );
};

export const handleAccountDeauthorized = async (stripeAccountId: string) => {
  const vendor = await db.query.vendorProfiles.findFirst({
    where: eq(vendorProfiles.stripeAccountId, stripeAccountId),
    columns: { id: true, userId: true },
  });

  if (!vendor) {
    console.warn(
      `[stripe-webhook] account.application.deauthorized — no vendor found for ${stripeAccountId}`,
    );
    return;
  }

  await db
    .update(vendorProfiles)
    .set({
      stripeAccountId: null,
      stripeOnboardingComplete: false,
      updatedAt: new Date(),
    })
    .where(eq(vendorProfiles.id, vendor.id));

  cacheDel(
    vendorKeys.tags.byUser(vendor.userId),
    vendorKeys.tags.detail(vendor.id),
    vendorKeys.tags.all(),
  );

  console.log(
    `[stripe-webhook] account.application.deauthorized → vendor ${vendor.id} disconnected`,
  );
};

export const handlePaymentSucceeded = async (pi: Stripe.PaymentIntent) => {
  const { orderId, cartId } = pi.metadata ?? {};
  if (!orderId) {
    console.warn(
      "[webhook] payment_intent.succeeded — no orderId in metadata",
      pi.id,
    );
    return;
  }

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: {
      items: {
        with: {
          product: {
            columns: { vendorId: true },
            with: {
              vendor: {
                columns: {
                  id: true,
                  stripeAccountId: true,
                  commissionRate: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!order) {
    console.warn("[webhook] Order not found:", orderId);
    return;
  }

  if (order.status === "paid") {
    console.log("[webhook] Order already paid — skipping:", orderId);
    return;
  }

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        status: "paid",
        paidAt: new Date(),
        isPaid: true,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    await tx
      .update(payments)
      .set({
        status: "succeeded",
        stripeChargeId: (pi.latest_charge as string) ?? null,
        updatedAt: new Date(),
      })
      .where(eq(payments.stripePaymentIntentId, pi.id));

    await tx
      .update(orderItems)
      .set({
        status: "processing",
        updatedAt: new Date(),
      })
      .where(eq(orderItems.orderId, orderId));

    const chargeId =
      typeof pi.latest_charge === "string"
        ? pi.latest_charge
        : (pi.latest_charge?.id ??
          (
            await stripeClient.charges.list({
              payment_intent: pi.id,
              limit: 1,
            })
          ).data[0]?.id);

    if (!chargeId) {
      console.log(`No charge found for PaymentIntent ${pi.id}`);
    }

    await createVendorTransfers(orderId, pi.id, chargeId);

    if (cartId) {
      await clearCartAfterOrder(cartId);
    }
    console.log(`[webhook] Order ${orderId} marked paid. Transfers initiated.`);
  });
};

const createVendorTransfers = async (
  orderId: string,
  paymentIntentId: string,
  chargeId?: string,
) => {
  const items = await db.query.orderItems.findMany({
    where: eq(orderItems.orderId, orderId),
    with: {
      product: {
        with: {
          vendor: {
            columns: {
              id: true,
              stripeAccountId: true,
              commissionRate: true,
            },
          },
        },
      },
    },
  });

  const byVendor = new Map<
    string,
    {
      vendor: {
        id: string;
        stripeAccountId: string | null;
        commissionRate: string;
      };
      gross: number;
    }
  >();

  for (const item of items) {
    const vendor = item.product.vendor;
    if (!vendor?.stripeAccountId) continue;
    const existing = byVendor.get(vendor.id);
    const itemTotal = Number(item.totalPrice);

    if (existing) {
      existing.gross += itemTotal;
    } else {
      byVendor.set(vendor.id, { vendor, gross: itemTotal });
    }
  }

  for (const [, { vendor, gross }] of byVendor) {
    if (!vendor.stripeAccountId) continue;
    const commissionRate = Number(vendor.commissionRate);
    const commissionAmount = Math.round(gross * commissionRate * 100) / 100;
    const netAmount = Math.round((gross - commissionAmount) * 100) / 100;
    const netInCents = Math.round(netAmount * 100);

    if (netInCents <= 0) continue;

    let stripeTransferId: string | null = null;
    let transferStatus: "completed" | "failed" = "completed";
    let failureReason: string | null = null;

    try {
      const transfer = await stripeClient.transfers.create({
        amount: netInCents,
        currency: "usd",
        destination: vendor.stripeAccountId,
        source_transaction: chargeId,
        transfer_group: orderId,
        metadata: {
          orderId,
          vendorId: vendor.id,
        },
      });

      stripeTransferId = transfer.id;
    } catch (error) {
      console.error(
        `[webhook] Transfer failed for vendor ${vendor.id}:`,
        error,
      );
      transferStatus = "failed";
      failureReason =
        error instanceof Error ? error.message : "Transfer failed";
    }

    await db
      .insert(vendorTransfers)
      .values({
        orderId,
        vendorId: vendor.id,
        stripeAccountId: vendor.stripeAccountId,
        stripeTransferId,
        grossAmount: gross.toFixed(2),
        commissionAmount: commissionAmount.toFixed(2),
        netAmount: netAmount.toFixed(2),
        status: transferStatus,
        transferredAt: transferStatus === "completed" ? new Date() : null,
        failureReason,
      })
      .onConflictDoNothing();
  }
};

async function clearCartAfterOrder(cartId: string) {
  try {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  } catch (error) {
    console.error("[webhook] Failed to clear cart:", error);
  }
}

export const handlePaymentFailed = async (pi: Stripe.PaymentIntent) => {
  const { orderId } = pi.metadata ?? {};
  if (!orderId) return;

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(and(eq(orders.id, orderId), eq(orders.status, "pending")));

    await tx
      .update(payments)
      .set({
        status: "failed",
        updatedAt: new Date(),
      })
      .where(eq(payments.stripePaymentIntentId, pi.id));
  });

  console.log(`[webhook] Payment failed for order ${orderId}`);
};

export const requestItemRefund = async (orderItemId: string) => {
  try {
    const user = await getUser();

    const item = await db.query.orderItems.findFirst({
      where: eq(orderItems.id, orderItemId),
      with: {
        order: {
          columns: {
            id: true,
            userId: true,
            isPaid: true,
            total: true,
          },
          with: {
            items: {
              columns: { id: true, status: true },
            },
          },
        },
      },
    });

    if (!item) {
      return {
        message: "Order item not found",
        success: false,
        data: null,
      };
    }

    if (item.order.userId !== user.id) {
      return {
        message: "Access denied",
        data: null,
        success: false,
      };
    }

    if (!item.order.isPaid) {
      return {
        success: false,
        message: "Order has not been paid",
        data: null,
      };
    }

    const CANCELLABLE = ["pending", "processing"] as const;
    if (!CANCELLABLE.includes(item.status as any)) {
      const message =
        item.status === "shipped"
          ? "This item has already shipped and cannot be cancelled"
          : item.status === "delivered"
            ? "This item has been delivered and cannot be cancelled"
            : item.status === "cancelled"
              ? "This item is already cancelled"
              : item.status === "refunded"
                ? "This item has already been refunded"
                : "This item cannot be cancelled";

      return {
        success: false,
        data: null,
        message,
      };
    }

    const existingRefund = await db.query.refunds.findFirst({
      where: and(
        eq(refunds.orderItemId, orderItemId),
        eq(refunds.status, "pending"),
      ),
      columns: { id: true },
    });

    if (existingRefund) {
      return {
        success: false,
        data: null,
        message: "A refund request for this item is already pending",
      };
    }

    const updatedStatuses = item.order.items.map((i) =>
      i.id === orderItemId ? "cancelled" : i.status,
    );

    const newOrderStatus = deriveOrderStatus(updatedStatuses);
    await db.transaction(async (tx) => {
      await tx
        .update(orderItems)
        .set({
          status: "cancelled",
          updatedAt: new Date(),
        })
        .where(eq(orderItems.id, orderItemId));

      await tx
        .update(orders)
        .set({
          status: newOrderStatus,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, item.orderId));

      await tx.insert(refunds).values({
        orderId: item.orderId,
        orderItemId,
        stripeRefundId: null,
        amount: Number(item.totalPrice).toFixed(2),
        reason: "Customer requested cancellation",
        status: "pending",
      });
    });

    cacheDel(
      orderKeys.tags.detail(item.orderId),
      orderKeys.tags.byUser(user.id),
      orderKeys.tags.byVendor(item.vendorId),
    );

    return {
      success: true,
      message:
        "Refund requested. The vendor will review and process your refund.",
      data: null,
    };
  } catch (error) {
    return returnError(error, "Unable to request refund");
  }
};

const getVendor = async (userId: string) => {
  const vendor = await db.query.vendorProfiles.findFirst({
    where: and(
      eq(vendorProfiles.userId, userId),
      eq(vendorProfiles.status, "active"),
      isNull(vendorProfiles.deletedAt),
    ),
    columns: { id: true },
  });
  return vendor;
};

export const approveItemRefund = async (refundId: string) => {
  try {
    const user = await getUser();
    const vendor = await getVendor(user.id);

    if (!vendor) {
      return {
        success: false,
        message: "Vendor profile not found",
        data: null,
      };
    }

    const refund = await db.query.refunds.findFirst({
      where: and(eq(refunds.id, refundId), eq(refunds.status, "pending")),
      with: {
        orderItem: {
          columns: {
            id: true,
            vendorId: true,
            totalPrice: true,
            status: true,
          },
        },
        order: {
          with: {
            payment: {
              columns: {
                stripePaymentIntentId: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!refund) {
      return {
        success: false,
        message: "Refund request not found or already processed",
        data: null,
      };
    }

    if (refund.orderItem?.vendorId !== vendor.id) {
      return {
        success: false,
        message: "Access denied",
        data: null,
      };
    }

    if (!refund.order.payment || refund.order.payment.status !== "succeeded") {
      return {
        success: false,
        message: "No successful payment found for this order",
        data: null,
      };
    }

    const refundAmountCents = Math.round(Number(refund.amount) * 100);

    const stripeRefund = await stripeClient.refunds.create({
      payment_intent: refund.order.payment.stripePaymentIntentId,
      amount: refundAmountCents,
      reason: "requested_by_customer",
      metadata: {
        orderId: refund.orderId,
        orderItemId: refund.orderItemId ?? "",
        vendorId: vendor.id,
        refundId,
      },
    });

    await db
      .update(refunds)
      .set({
        stripeRefundId: stripeRefund.id,
        status: "succeeded",
        updatedAt: new Date(),
      })
      .where(eq(refunds.id, refundId));

    cacheDel(
      orderKeys.tags.detail(refund.orderId),
      orderKeys.tags.byVendor(vendor.id),
    );

    return {
      success: true,
      data: null,
      message:
        "Refund approved. Customer will receive funds in 5–10 business days.",
    };
  } catch (error) {
    return returnError(error, "Unable to approve refund");
  }
};

export const rejectItemRefund = async (refundId: string, reason?: string) => {
  try {
    const user = await getUser();
    const vendor = await getVendor(user.id);

    if (!vendor) {
      return {
        success: false,
        message: "Vendor profile not found",
        data: null,
      };
    }

    const refund = await db.query.refunds.findFirst({
      where: and(eq(refunds.id, refundId), eq(refunds.status, "pending")),
      with: {
        orderItem: {
          columns: { id: true, vendorId: true },
        },
        order: {
          with: {
            items: { columns: { id: true, status: true } },
          },
        },
      },
    });

    if (!refund) {
      return {
        success: false,
        message: "Refund request not found or already processed",
        data: null,
      };
    }

    if (refund.orderItem?.vendorId !== vendor.id) {
      return {
        success: false,
        message: "Access denied",
        data: null,
      };
    }

    const restoredStatuses = refund.order.items.map((i) =>
      i.id === refund.orderItemId ? "processing" : i.status,
    );

    const newOrderStatus = deriveOrderStatus(restoredStatuses as any);

    await db.transaction(async (tx) => {
      await tx
        .update(refunds)
        .set({
          status: "failed",
          reason: reason?.trim() || "Refund request rejected by vendor",
          updatedAt: new Date(),
        })
        .where(eq(refunds.id, refundId));

      if (refund.orderItemId) {
        await tx
          .update(orderItems)
          .set({ status: "processing", updatedAt: new Date() })
          .where(eq(orderItems.id, refund.orderItemId));
      }

      await tx
        .update(orders)
        .set({ status: newOrderStatus, updatedAt: new Date() })
        .where(eq(orders.id, refund.orderId));
    });

    cacheDel(
      orderKeys.tags.detail(refund.orderId),
      orderKeys.tags.byVendor(vendor.id),
    );

    return {
      success: true,
      data: null,
      message: "Refund request rejected.",
    };
  } catch (error) {
    return returnError(error, "Unable to reject refund");
  }
};

export async function getVendorRefundRequests(
  status: "pending" | "succeeded" | "failed" | "refunded",
) {
  try {
    const user = await getUser();

    const vendor = await getVendor(user.id);
    if (!vendor)
      return {
        message: "Vendor profile not found",
        data: null,
        success: false,
      };

    const pending = await db
      .select({
        refund: refunds,
        orderItem: {
          id: orderItems.id,
          productName: orderItems.productName,
          variantName: orderItems.variantName,
          quantity: orderItems.quantity,
          totalPrice: orderItems.totalPrice,
          imageUrl: orderItems.imageUrl,
        },
        order: {
          id: orders.id,
          createdAt: orders.createdAt,
        },
      })
      .from(refunds)
      .innerJoin(orderItems, eq(refunds.orderItemId, orderItems.id))
      .innerJoin(orders, eq(refunds.orderId, orders.id))
      .where(
        and(eq(refunds.status, status), eq(orderItems.vendorId, vendor.id)),
      )
      .orderBy(desc(refunds.createdAt));

    const vendorRefunds = pending.filter((r) => r.orderItem !== null);

    return {
      data: vendorRefunds,
      message: "Refund requests fetched",
      success: true,
    };
  } catch (error) {
    return returnError(error, "Unable to fetch refund requests");
  }
}

"use server";
import { returnError } from "@/lib/utils";
import { getUser } from "@/server/better-auth/server";
import { db } from "@/server/db";
import { cartItems, carts, products } from "@/server/db/schema";
import {
  type AddToCartInput,
  addToCartSchema,
  type UpdateCartItemInput,
  updateCartItemSchema,
} from "@/zod-schema/cart-schema";
import { and, eq, isNull } from "drizzle-orm";

export const getOrCreateCart = async (userId: string) => {
  const existing = await db.query.carts.findFirst({
    where: eq(carts.userId, userId),
  });

  if (existing) return existing;

  const [created] = await db.insert(carts).values({ userId }).returning();
  return created;
};

export const getCart = async () => {
  try {
    const user = await getUser();
    const cart = await getOrCreateCart(user.id);

    const data = await db.query.carts.findFirst({
      where: eq(carts.id, cart?.id!),
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
              },
              with: {
                images: {
                  where: (img, { eq }) => eq(img.isPrimary, true),
                  limit: 1,
                  columns: { url: true, altText: true },
                },
              },
            },
            variant: {
              columns: {
                id: true,
                name: true,
                price: true,
                stock: true,
                options: true,
              },
            },
          },
          orderBy: (item, { asc }) => [asc(item.createdAt)],
        },
        discountCode: {
          columns: {
            id: true,
            code: true,
            type: true,
            value: true,
          },
        },
      },
    });

    return {
      data,
      success: true,
      message: "User Cart",
    };
  } catch (error) {
    return returnError(error, "Unable to fetch cart");
  }
};

export const addToCart = async (input: AddToCartInput) => {
  try {
    const user = await getUser();
    const validated = addToCartSchema.parse(input);

    const { productId, variantId = null, quantity } = validated;

    const product = await db.query.products.findFirst({
      where: and(
        eq(products.id, productId),
        eq(products.status, "active"),
        isNull(products.deletedAt),
      ),
      columns: {
        id: true,
        basePrice: true,
        hasVariants: true,
        stock: true,
      },
      with: {
        variants: variantId
          ? {
              where: (v, { eq, isNull }) =>
                and(eq(v.id, variantId), isNull(v.deletedAt)),
            }
          : undefined,
      },
    });

    if (!product) {
      return {
        success: false,
        data: null,
        message: "Product not found or unavailable",
      };
    }

    let price: string = "0";
    let availableStock: number = 0;

    if (variantId && product.hasVariants) {
      const variant = product?.variants?.[0];
      if (!variant) {
        return {
          success: false,
          data: null,
          message: "Variant not found or unavailable",
        };
      }
      price = variant.price ?? product.basePrice;
      availableStock = variant.stock;
    } else {
      price = product.basePrice;
      availableStock = product.stock;
    }

    if (availableStock < quantity) {
      return {
        success: false,
        message: `Only ${availableStock} item${availableStock === 1 ? "" : "s"} available`,
        data: null,
      };
    }

    const cart = await getOrCreateCart(user.id);
    const existing = await db.query.cartItems.findFirst({
      where: and(
        eq(cartItems.cartId, cart?.id!),
        eq(cartItems.productId, productId),
        variantId
          ? eq(cartItems.variantId, variantId)
          : isNull(cartItems.variantId),
      ),
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > availableStock) {
        return {
          success: false,
          message: `Only ${availableStock} item${availableStock === 1 ? "" : "s"} in stock (you have ${existing.quantity} in cart)`,
          data: null,
        };
      }
      const [updated] = await db
        .update(cartItems)
        .set({
          quantity: newQty,
          updatedAt: new Date(),
        })
        .where(eq(cartItems.id, existing.id))
        .returning();

      return {
        success: true,
        data: updated,
        message: "Cart Updated",
      };
    }

    const [item] = await db
      .insert(cartItems)
      .values({
        cartId: cart?.id!,
        productId,
        variantId: variantId ?? null,
        quantity,
        priceAtAdd: price,
      })
      .returning();

    return {
      success: true,
      data: item,
      message: "Added to cart",
    };
  } catch (error) {
    return returnError(error, "Unable to add to cart");
  }
};

export const updateCartItem = async (input: UpdateCartItemInput) => {
  try {
    const user = await getUser();
    const validated = updateCartItemSchema.parse(input);
    const { cartItemId, quantity } = validated;

    const item = await db.query.cartItems.findFirst({
      where: and(eq(cartItems.id, cartItemId)),
      with: {
        cart: {
          columns: { userId: true },
        },
        product: {
          columns: { hasVariants: true, stock: true },
        },
        variant: { columns: { stock: true } },
      },
    });

    if (!item || item.cart.userId !== user.id) {
      return {
        success: false,
        message: "Cart item not found",
        data: null,
      };
    }

    if (quantity === 0) {
      await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
      return {
        success: true,
        message: "Item removed",
        data: null,
      };
    }

    const stock = item.product.hasVariants
      ? (item.variant?.stock ?? 0)
      : item.product.stock;

    if (quantity > stock) {
      return {
        success: false,
        message: `Only ${stock} item${stock === 1 ? "" : "s"} available`,
        data: null,
      };
    }

    const [updated] = await db
      .update(cartItems)
      .set({
        quantity,
        updatedAt: new Date(),
      })
      .where(eq(cartItems.id, cartItemId))
      .returning();

    return {
      success: true,
      message: "Cart Updated",
      data: updated,
    };
  } catch (error) {
    return returnError(error, "Unable to update cart");
  }
};

export const removeCartItem = async (cartItemId: string) => {
  try {
    const user = await getUser();
    const item = await db.query.cartItems.findFirst({
      where: eq(cartItems.id, cartItemId),
      with: {
        cart: { columns: { userId: true } },
      },
    });

    if (!item || item.cart.userId !== user.id) {
      return {
        success: false,
        message: "Cart item not found",
        data: null,
      };
    }

    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));

    return {
      data: null,
      message: "Item removed",
      success: true,
    };
  } catch (error) {
    return returnError(error, "Unable to remove item");
  }
};

export async function clearCart() {
  try {
    const user = await getUser();

    const cart = await db.query.carts.findFirst({
      where: eq(carts.userId, user.id),
      columns: { id: true },
    });

    if (!cart) {
      return {
        success: false,
        message: "Cart already empty",
        data: null,
      };
    }

    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    return {
      success: false,
      message: "Cart cleared",
      data: null,
    };
  } catch (error) {
    return returnError(error, "Unable to clear cart");
  }
}

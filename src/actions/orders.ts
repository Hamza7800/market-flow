"use server";

import { cacheWrap } from "@/lib/cache-helpers";
import { orderKeys } from "@/lib/cache-keys";
import { returnError } from "@/lib/utils";
import { getUser } from "@/server/better-auth/server";
import { db } from "@/server/db";
import { orders } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";

export const getUserOrders = async () => {
  try {
    const user = await getUser();
    const userOrders = await cacheWrap(
      orderKeys.tags.byUser(user.id),
      [orderKeys.tags.byUser(user.id)],
      async () => {
        console.log("DB_HIT_USER_ORDERS");
        return await db.query.orders.findMany({
          where: eq(orders.userId, user.id),
          with: {
            payment: {
              columns: {
                amount: true,
                status: true,
              },
            },
          },
        });
      },
    );

    return {
      success: true,
      data: userOrders,
      message: "User orders",
    };
  } catch (error) {
    return returnError(error, "Unable to get orders");
  }
};

export type OrdersType = Awaited<ReturnType<typeof getUserOrders>>;

export const getUserOrderDetails = async (orderId: string) => {
  try {
    const user = await getUser();
    const userOrder = await cacheWrap(
      orderKeys.tags.detail(orderId),
      [orderKeys.tags.detail(orderId)],
      async () => {
        console.log("DB_HIT_USER_ORDER_DETAILS");
        return await db.query.orders.findFirst({
          where: and(eq(orders.userId, user.id), eq(orders.id, orderId)),
          with: {
            items: {
              with: {
                product: {
                  columns: {
                    name: true,
                    id: true,
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
                  columns: { name: true, options: true },
                },
              },
            },
            payment: {
              columns: {
                amount: true,
                status: true,
                currency: true,
              },
            },
            refunds: {
              columns: {
                id: true,
                amount: true,
                reason: true,
                status: true,
                createdAt: true,
              },
            },
            discountCode: {
              columns: { code: true, type: true, value: true },
            },
          },
        });
      },
    );

    if (!userOrder)
      return { success: false, message: "Order not found", data: null };

    return {
      success: true,
      data: userOrder,
      message: "User order",
    };
  } catch (error) {
    return returnError(error, "Unable to get orders");
  }
};

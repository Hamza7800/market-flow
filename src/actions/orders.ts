"use server";

import { cacheWrap } from "@/lib/cache-helpers";
import { orderKeys } from "@/lib/cache-keys";
import { returnError } from "@/lib/utils";
import { getUser } from "@/server/better-auth/server";
import { db } from "@/server/db";
import { orderItems, orders, vendorProfiles } from "@/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { getVendorProfile } from "@/actions/vendor";
import type { OrderStatus } from "@/lib/nuqs/nuqs";

const LIMIT = 20;

export const getVendorOrders = async (
  status: OrderStatus,
  page: number = 1,
) => {
  try {
    const user = await getUser();
    const vendor = await db.query.vendorProfiles.findFirst({
      where: and(
        eq(vendorProfiles.userId, user.id),
        eq(vendorProfiles.status, "active"),
        isNull(vendorProfiles.deletedAt),
      ),
      columns: { id: true },
    });

    if (!vendor) {
      return {
        success: false,
        data: [],
        meta: null,
        message: "You need to be an active vendor",
      };
    }

    const offset = (page - 1) * LIMIT;

    const data = await cacheWrap(
      orderKeys.tags.vendorList(vendor.id, status, page),
      [
        orderKeys.tags.byVendor(vendor.id),
        orderKeys.tags.vendorList(vendor.id, status, page),
      ],
      async () => {
        return await db.query.orderItems.findMany({
          where: and(
            eq(orderItems.vendorId, vendor.id),
            eq(orderItems.status, status),
          ),
          limit: LIMIT,
          offset,
          orderBy: (oi, { desc }) => [desc(oi.createdAt)],
          with: {
            variant: {
              columns: { id: true, name: true, options: true },
            },
            order: {
              columns: {
                id: true,
                isPaid: true,
                shippingAddressSnapshot: true,
                createdAt: true,
                paidAt: true,
              },
              with: {
                refunds: {
                  where: (r, { eq }) => eq(r.status, "pending"),
                  columns: {
                    id: true,
                    amount: true,
                    reason: true,
                    createdAt: true,
                  },
                },
              },
            },
          },
        });
      },
      30,
    );

    return {
      data: data,
      success: true,
      message: "Vendor Orders",
      meta: {
        page,
        limit: LIMIT,
        hasMore: data.length === LIMIT,
        status,
      },
    };
  } catch (error) {
    return returnError(error, "Unable to get vendor orders");
  }
};

export type VendorOrders = Awaited<ReturnType<typeof getVendorOrders>>;

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
              with: {
                orderItem: {
                  columns: {
                    imageUrl: true,
                  },
                  with: {
                    product: {
                      columns: {
                        name: true,
                        id: true,
                      },
                    },
                  },
                },
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

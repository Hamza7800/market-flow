"use server";

import { cacheDel, cacheWrap } from "@/lib/cache-helpers";
import { orderKeys } from "@/lib/cache-keys";
import {
  canVendorTransitionTo,
  deriveOrderStatus,
  returnError,
} from "@/lib/utils";
import { getUser } from "@/server/better-auth/server";
import { db } from "@/server/db";
import { orderItems, orders, vendorProfiles } from "@/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";
// import { getVendorProfile } from "@/actions/vendor";
import type { OrderStatus } from "@/lib/nuqs/nuqs";
import {
  updateStatusSchema,
  type UpdateOrderItemStatusInput,
} from "@/zod-schema/order-item-schema";

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
            // variant: {
            //   columns: { id: true, name: true, options: true },
            // },
            order: {
              columns: {
                id: true,
                isPaid: true,
                // shippingAddressSnapshot: true,
                createdAt: true,
                // paidAt: true,
              },
              with: {
                refunds: {
                  where: (r, { eq }) => eq(r.status, "pending"),
                  columns: {
                    id: true,
                    // amount: true,
                    // reason: true,
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

export const getOrderDetails = async (orderItemId: string) => {
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
        data: null,
        meta: null,
        message: "You need to be an active vendor",
      };
    }

    const item = await db.query.orderItems.findFirst({
      where: and(
        eq(orderItems.id, orderItemId),
        eq(orderItems.vendorId, vendor.id),
      ),
      with: {
        order: {
          columns: {
            id: true,
            isPaid: true,
            shippingAddressSnapshot: true,
            createdAt: true,
            paidAt: true,
          },
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        variant: {
          columns: {
            id: true,
            name: true,
            options: true,
            price: true,
            sku: true,
          },
        },
        product: {
          columns: {
            id: true,
            name: true,
            slug: true,
            status: true,
            hasVariants: true,
            stock: true,
          },
        },
      },
    });

    if (!item)
      return { success: false, message: "Order not found", data: null };

    const shippingAddress = (() => {
      try {
        return JSON.parse(item.order.shippingAddressSnapshot);
      } catch {
        return null;
      }
    })();

    return {
      success: true,
      message: "Order detail fetched",
      data: { ...item, shippingAddress },
    };
  } catch (error) {
    return returnError(error, "Unable to get order detail");
  }
};

export const updateOrderItemStatus = async (
  orderItemId: string,
  input: UpdateOrderItemStatusInput,
) => {
  try {
    const user = await getUser();
    const validated = updateStatusSchema.parse(input);

    const vendor = await db.query.vendorProfiles.findFirst({
      where: and(
        eq(vendorProfiles.userId, user.id),
        eq(vendorProfiles.status, "active"),
        isNull(vendorProfiles.deletedAt),
      ),
      columns: { id: true },
    });
    if (!vendor)
      return {
        success: false,
        data: null,
        message: "Vendor profile not found",
      };

    const item = await db.query.orderItems.findFirst({
      where: and(
        eq(orderItems.vendorId, vendor.id),
        eq(orderItems.id, orderItemId),
      ),
      columns: {
        id: true,
        status: true,
        orderId: true,
      },
    });

    if (!item)
      return {
        success: false,
        data: null,
        message: "Order item not found or access denied",
      };

    if (!canVendorTransitionTo(item.status, validated.status)) {
      return {
        success: false,
        data: null,
        message: `Cannot move item from "${item.status}" to "${validated.status}"`,
      };
    }

    const updatePayload: Record<string, unknown> = {
      status: validated.status,
      updatedAt: new Date(),
    };

    if (validated.status === "shipped") {
      updatePayload.trackingNumber = validated.trackingNumber;
      updatePayload.trackingUrl = validated.trackingUrl;
      updatePayload.shippedAt = new Date();
    }

    if (validated.status === "delivered") {
      updatePayload.deliveredAt = new Date();
    }

    await db.transaction(async (tx) => {
      await tx
        .update(orderItems)
        .set(updatePayload)
        .where(eq(orderItems.id, orderItemId));

      const allItems = await tx.query.orderItems.findMany({
        where: eq(orderItems.orderId, item.orderId),
        columns: { id: true, status: true },
      });

      const derived = deriveOrderStatus(
        allItems.map((i) =>
          i.id === orderItemId ? validated.status : i.status,
        ) as any,
      );

      await tx
        .update(orders)
        .set({ status: derived, updatedAt: new Date() })
        .where(eq(orders.id, item.orderId));
    });

    cacheDel(
      orderKeys.tags.detail(item.orderId),
      orderKeys.tags.byVendor(vendor.id),
      `orders:vendor:${vendor.id}:${item.status}`,
      `orders:vendor:${vendor.id}:${validated.status}`,
    );
    return {
      success: true,
      data: {
        orderItemId,
        newStatus: validated.status,
        oldStatus: item.status,
      },
      message: "Status updated",
    };
  } catch (error) {
    return returnError(error, "Unable to update order item status");
  }
};

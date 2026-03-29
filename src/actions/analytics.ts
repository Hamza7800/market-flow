"use server";

import { getUser } from "@/server/better-auth/server";
import { db } from "@/server/db";
import {
  orderItems,
  orders,
  products,
  productVariants,
  refunds,
  reviews,
  vendorProfiles,
  vendorTransfers,
} from "@/server/db/schema";
import { analyticsKeys } from "@/lib/cache-keys";
import { cacheWrap } from "@/lib/cache-helpers";
import { and, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { cache } from "react";
import {
  monthConds,
  returnError,
  round2,
  toNum,
  type MonthFilter,
} from "@/lib/utils";

const requireVendor = cache(async () => {
  const user = await getUser();
  const vendor = await db.query.vendorProfiles.findFirst({
    where: and(
      eq(vendorProfiles.userId, user.id),
      isNull(vendorProfiles.deletedAt),
    ),
  });
  if (!vendor) throw new Error("Vendor profile not found");
  return { vendor, user };
});

export const getOverviewStats = async (filter: MonthFilter = null) => {
  try {
    const { vendor } = await requireVendor();
    const fKey = filter ? `${filter.year}-${filter.month}` : "all";

    const data = await cacheWrap(
      analyticsKeys.tags.sales(vendor.id, `overview-${fKey}`),
      [analyticsKeys.tags.byVendor(vendor.id), analyticsKeys.tags.all()],
      async () => {
        const timeConds = monthConds(orders.paidAt, filter);

        // Revenue, orders, items sold
        const [revenue] = await db
          .select({
            totalRevenue: sql<string>`COALESCE(SUM(${orderItems.totalPrice}::numeric), 0)`,
            totalItemsSold: sql<string>`COALESCE(SUM(${orderItems.quantity}), 0)`,
            totalOrders: sql<string>`COUNT(DISTINCT ${orderItems.orderId})`,
            avgOrderValue: sql<string>`COALESCE(AVG(${orderItems.totalPrice}::numeric), 0)`,
          })
          .from(orderItems)
          .innerJoin(orders, eq(orderItems.orderId, orders.id))
          .where(
            and(
              eq(orderItems.vendorId, vendor.id),
              eq(orders.isPaid, true),
              ...timeConds,
            ),
          );

        // Pending items in vendor queue
        const [pending] = await db
          .select({ count: sql<string>`COUNT(*)` })
          .from(orderItems)
          .where(
            and(
              eq(orderItems.vendorId, vendor.id),
              eq(orderItems.status, "pending"),
            ),
          );

        // Pending refund requests
        const [pendingRefunds] = await db
          .select({
            count: sql<string>`COUNT(*)`,
            totalAmount: sql<string>`COALESCE(SUM(${refunds.amount}::numeric), 0)`,
          })
          .from(refunds)
          .innerJoin(orderItems, eq(refunds.orderItemId, orderItems.id))
          .where(
            and(
              eq(orderItems.vendorId, vendor.id),
              eq(refunds.status, "pending"),
            ),
          );

        // Succeeded refunds
        const [refundsPaid] = await db
          .select({
            count: sql<string>`COUNT(*)`,
            totalAmount: sql<string>`COALESCE(SUM(${refunds.amount}::numeric), 0)`,
          })
          .from(refunds)
          .innerJoin(orderItems, eq(refunds.orderItemId, orderItems.id))
          .where(
            and(
              eq(orderItems.vendorId, vendor.id),
              eq(refunds.status, "succeeded"),
              ...monthConds(refunds.createdAt, filter),
            ),
          );

        // Net paid out
        const [transfers] = await db
          .select({
            totalNet: sql<string>`COALESCE(SUM(${vendorTransfers.netAmount}::numeric), 0)`,
            totalGross: sql<string>`COALESCE(SUM(${vendorTransfers.grossAmount}::numeric), 0)`,
          })
          .from(vendorTransfers)
          .where(
            and(
              eq(vendorTransfers.vendorId, vendor.id),
              eq(vendorTransfers.status, "completed"),
              ...monthConds(vendorTransfers.transferredAt, filter),
            ),
          );

        return {
          totalRevenue: round2(toNum(revenue?.totalRevenue)),
          totalItemsSold: toNum(revenue?.totalItemsSold),
          totalOrders: toNum(revenue?.totalOrders),
          avgOrderValue: round2(toNum(revenue?.avgOrderValue)),
          pendingOrders: toNum(pending?.count),
          pendingRefunds: toNum(pendingRefunds?.count),
          pendingRefundAmount: round2(toNum(pendingRefunds?.totalAmount)),
          totalRefunded: round2(toNum(refundsPaid?.totalAmount)),
          totalRefundCount: toNum(refundsPaid?.count),
          totalNetPayout: round2(toNum(transfers?.totalNet)),
          totalGrossPayout: round2(toNum(transfers?.totalGross)),
        };
      },
      120,
    );

    return {
      data,
      success: true,
      message: "Vendor Analytics",
    };
  } catch (error) {
    return returnError(error, "Unable to fetch overview stats");
  }
};

export async function getRevenueByMonth() {
  try {
    const { vendor } = await requireVendor();

    const data = await cacheWrap(
      analyticsKeys.tags.sales(vendor.id, "revenue-by-month"),
      [analyticsKeys.tags.byVendor(vendor.id)],
      async () => {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

        const rows = await db
          .select({
            year: sql<string>`EXTRACT(YEAR  FROM ${orders.paidAt})::int`,
            month: sql<string>`EXTRACT(MONTH FROM ${orders.paidAt})::int`,
            revenue: sql<string>`COALESCE(SUM(${orderItems.totalPrice}::numeric), 0)`,
            orders: sql<string>`COUNT(DISTINCT ${orderItems.orderId})`,
            items: sql<string>`COALESCE(SUM(${orderItems.quantity}), 0)`,
          })
          .from(orderItems)
          .innerJoin(orders, eq(orderItems.orderId, orders.id))
          .where(
            and(
              eq(orderItems.vendorId, vendor.id),
              eq(orders.isPaid, true),
              gte(orders.paidAt, twelveMonthsAgo),
            ),
          )
          .groupBy(
            sql`EXTRACT(YEAR FROM ${orders.paidAt})`,
            sql`EXTRACT(MONTH FROM ${orders.paidAt})`,
          )
          .orderBy(
            sql`EXTRACT(YEAR FROM ${orders.paidAt}) ASC`,
            sql`EXTRACT(MONTH FROM ${orders.paidAt}) ASC`,
          );

        return rows.map((r) => ({
          year: toNum(r.year),
          month: toNum(r.month),
          label: new Date(toNum(r.year), toNum(r.month) - 1).toLocaleString(
            "default",
            { month: "short", year: "numeric" },
          ),
          revenue: round2(toNum(r.revenue)),
          orders: toNum(r.orders),
          items: toNum(r.items),
        }));
      },
      300,
    );

    return {
      data,
      success: true,
      message: "Revenue Month",
    };
  } catch (error) {
    return returnError(error, "Unable to fetch revenue by month");
  }
}

export async function getTopProducts(filter: MonthFilter = null, limit = 5) {
  try {
    const { vendor } = await requireVendor();
    const fKey = filter ? `${filter.year}-${filter.month}` : "all";

    const data = await cacheWrap(
      analyticsKeys.tags.topProducts(vendor.id) + `:${fKey}`,
      [
        analyticsKeys.tags.byVendor(vendor.id),
        analyticsKeys.tags.topProducts(vendor.id),
      ],
      async () => {
        const timeConds = monthConds(orders.paidAt, filter);

        const rows = await db
          .select({
            productId: orderItems.productId,
            productName: orderItems.productName,
            imageUrl: orderItems.imageUrl,
            revenue: sql<string>`COALESCE(SUM(${orderItems.totalPrice}::numeric), 0)`,
            unitsSold: sql<string>`COALESCE(SUM(${orderItems.quantity}), 0)`,
            orderCount: sql<string>`COUNT(DISTINCT ${orderItems.orderId})`,
          })
          .from(orderItems)
          .innerJoin(orders, eq(orderItems.orderId, orders.id))
          .where(
            and(
              eq(orderItems.vendorId, vendor.id),
              eq(orders.isPaid, true),
              ...timeConds,
            ),
          )
          .groupBy(
            orderItems.productId,
            orderItems.productName,
            orderItems.imageUrl,
          )
          .orderBy(sql`SUM(${orderItems.totalPrice}::numeric) DESC`)
          .limit(limit);

        return rows.map((r) => ({
          ...r,
          revenue: round2(toNum(r.revenue)),
          unitsSold: toNum(r.unitsSold),
          orderCount: toNum(r.orderCount),
        }));
      },
      300,
    );

    return {
      success: true,
      data,
      message: "Top Products",
    };
  } catch (error) {
    return returnError(error, "Unable to fetch top products");
  }
}

export async function getOrderStatusBreakdown(filter: MonthFilter = null) {
  try {
    const { vendor } = await requireVendor();
    const fKey = filter ? `${filter.year}-${filter.month}` : "all";

    const data = await cacheWrap(
      analyticsKeys.tags.sales(vendor.id, `status-breakdown-${fKey}`),
      [analyticsKeys.tags.byVendor(vendor.id)],
      async () => {
        const rows = await db
          .select({
            status: orderItems.status,
            count: sql<string>`COUNT(*)`,
          })
          .from(orderItems)
          .where(
            and(
              eq(orderItems.vendorId, vendor.id),
              ...monthConds(orderItems.createdAt, filter),
            ),
          )
          .groupBy(orderItems.status);

        const map: Record<string, number> = {};
        for (const r of rows) map[r.status] = toNum(r.count);

        return {
          pending: map["pending"] ?? 0,
          processing: map["processing"] ?? 0,
          shipped: map["shipped"] ?? 0,
          delivered: map["delivered"] ?? 0,
          cancelled: map["cancelled"] ?? 0,
          refunded: map["refunded"] ?? 0,
          total: Object.values(map).reduce((a, b) => a + b, 0),
        };
      },
      60,
    );

    return {
      success: true,
      data,
      message: "Order Status Breakdown",
    };
  } catch (error) {
    return returnError(error, "Unable to fetch order status breakdown");
  }
}

export async function getReviewStats(filter: MonthFilter = null) {
  try {
    const { vendor } = await requireVendor();
    const fKey = filter ? `${filter.year}-${filter.month}` : "all";

    const data = await cacheWrap(
      analyticsKeys.tags.sales(vendor.id, `reviews-${fKey}`),
      [analyticsKeys.tags.byVendor(vendor.id)],
      async () => {
        // All-time totals (always show regardless of filter)
        const [allTime] = await db
          .select({
            total: sql<string>`COUNT(*)`,
            avgRating: sql<string>`COALESCE(AVG(${reviews.rating}::numeric), 0)`,
          })
          .from(reviews)
          .innerJoin(orderItems, eq(reviews.orderItemId, orderItems.id))
          .where(
            and(
              eq(orderItems.vendorId, vendor.id),
              eq(reviews.status, "approved"),
            ),
          );

        // Rating distribution (always all-time for accuracy)
        const distRows = await db
          .select({
            rating: reviews.rating,
            count: sql<string>`COUNT(*)`,
          })
          .from(reviews)
          .innerJoin(orderItems, eq(reviews.orderItemId, orderItems.id))
          .where(
            and(
              eq(orderItems.vendorId, vendor.id),
              eq(reviews.status, "approved"),
            ),
          )
          .groupBy(reviews.rating)
          .orderBy(desc(reviews.rating));

        const totalReviews = toNum(allTime?.total);
        const distMap: Record<number, number> = {};
        for (const r of distRows) distMap[r.rating] = toNum(r.count);

        const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
          star,
          count: distMap[star] ?? 0,
          percent:
            totalReviews > 0
              ? Math.round(((distMap[star] ?? 0) / totalReviews) * 100)
              : 0,
        }));

        // Period-scoped new reviews
        const [period] = await db
          .select({
            count: sql<string>`COUNT(*)`,
            avgRating: sql<string>`COALESCE(AVG(${reviews.rating}::numeric), 0)`,
          })
          .from(reviews)
          .innerJoin(orderItems, eq(reviews.orderItemId, orderItems.id))
          .where(
            and(
              eq(orderItems.vendorId, vendor.id),
              eq(reviews.status, "approved"),
              ...monthConds(reviews.createdAt, filter),
            ),
          );

        // Pending moderation
        const [pending] = await db
          .select({ count: sql<string>`COUNT(*)` })
          .from(reviews)
          .innerJoin(orderItems, eq(reviews.orderItemId, orderItems.id))
          .where(
            and(
              eq(orderItems.vendorId, vendor.id),
              eq(reviews.status, "pending"),
            ),
          );

        // 5 most recent approved
        const recent = await db
          .select({
            id: reviews.id,
            rating: reviews.rating,
            title: reviews.title,
            body: reviews.body,
            createdAt: reviews.createdAt,
            productName: orderItems.productName,
          })
          .from(reviews)
          .innerJoin(orderItems, eq(reviews.orderItemId, orderItems.id))
          .where(
            and(
              eq(orderItems.vendorId, vendor.id),
              eq(reviews.status, "approved"),
            ),
          )
          .orderBy(desc(reviews.createdAt))
          .limit(5);

        return {
          totalReviews,
          avgRating: round2(toNum(allTime?.avgRating)),
          pendingReviews: toNum(pending?.count),
          ratingDist,
          periodReviews: toNum(period?.count),
          periodAvg: round2(toNum(period?.avgRating)),
          recent,
        };
      },
      180,
    );

    return {
      success: true,
      data,
      message: "Review Stats",
    };
  } catch (error) {
    return returnError(error, "Unable to fetch review stats");
  }
}

export async function getInventoryStats(lowStockThreshold = 5) {
  try {
    const { vendor } = await requireVendor();

    const data = await cacheWrap(
      analyticsKeys.tags.sales(vendor.id, "inventory"),
      [analyticsKeys.tags.byVendor(vendor.id)],
      async () => {
        // Product counts by status
        const statusRows = await db
          .select({
            status: products.status,
            count: sql<string>`COUNT(*)`,
          })
          .from(products)
          .where(
            and(eq(products.vendorId, vendor.id), isNull(products.deletedAt)),
          )
          .groupBy(products.status);

        const statusMap: Record<string, number> = {};
        for (const r of statusRows) statusMap[r.status] = toNum(r.count);

        // Simple product stock issues using FILTER (PostgreSQL specific)
        const [simpleStock] = await db
          .select({
            outOfStock: sql<string>`COUNT(*) FILTER (WHERE ${products.stock} = 0)`,
            lowStock: sql<string>`COUNT(*) FILTER (WHERE ${products.stock} > 0 AND ${products.stock} <= ${lowStockThreshold})`,
          })
          .from(products)
          .where(
            and(
              eq(products.vendorId, vendor.id),
              eq(products.hasVariants, false),
              eq(products.status, "active"),
              isNull(products.deletedAt),
            ),
          );

        // Variant stock issues
        const [variantStock] = await db
          .select({
            outOfStock: sql<string>`COUNT(*) FILTER (WHERE ${productVariants.stock} = 0)`,
            lowStock: sql<string>`COUNT(*) FILTER (WHERE ${productVariants.stock} > 0 AND ${productVariants.stock} <= ${lowStockThreshold})`,
          })
          .from(productVariants)
          .innerJoin(products, eq(productVariants.productId, products.id))
          .where(
            and(
              eq(products.vendorId, vendor.id),
              eq(products.status, "active"),
              isNull(products.deletedAt),
              isNull(productVariants.deletedAt),
            ),
          );

        // Low stock product list for alert panel
        const lowStockItems = await db.query.products.findMany({
          where: and(
            eq(products.vendorId, vendor.id),
            eq(products.status, "active"),
            isNull(products.deletedAt),
          ),
          columns: {
            id: true,
            name: true,
            slug: true,
            stock: true,
            hasVariants: true,
          },
          with: {
            images: {
              where: (img, { eq }) => eq(img.isPrimary, true),
              limit: 1,
              columns: { url: true },
            },
            variants: {
              where: (v, { and, lte, isNull }) =>
                and(lte(v.stock, lowStockThreshold), isNull(v.deletedAt)),
              columns: { id: true, name: true, stock: true },
            },
          },
          limit: 10,
          orderBy: (p, { asc }) => [asc(p.stock)],
        });

        return {
          products: {
            total: Object.values(statusMap).reduce((a, b) => a + b, 0),
            active: statusMap["active"] ?? 0,
            draft: statusMap["draft"] ?? 0,
            archived: statusMap["archived"] ?? 0,
            outOfStock: toNum(simpleStock?.outOfStock),
            lowStock: toNum(simpleStock?.lowStock),
          },
          variants: {
            outOfStock: toNum(variantStock?.outOfStock),
            lowStock: toNum(variantStock?.lowStock),
          },
          lowStockItems: lowStockItems.filter((p) =>
            p.hasVariants
              ? p.variants.length > 0
              : p.stock <= lowStockThreshold,
          ),
        };
      },
      120,
    );

    return { data, success: true, message: "Inventory Stats" };
  } catch (error) {
    return returnError(error, "Unable to fetch inventory stats");
  }
}

export async function getPayoutStats(filter: MonthFilter = null) {
  try {
    const { vendor } = await requireVendor();
    const fKey = filter ? `${filter.year}-${filter.month}` : "all";

    const data = await cacheWrap(
      analyticsKeys.tags.sales(vendor.id, `payouts-${fKey}`),
      [analyticsKeys.tags.byVendor(vendor.id)],
      async () => {
        const timeConds = monthConds(vendorTransfers.transferredAt, filter);

        const [totals] = await db
          .select({
            totalGross: sql<string>`COALESCE(SUM(${vendorTransfers.grossAmount}::numeric), 0)`,
            totalCommission: sql<string>`COALESCE(SUM(${vendorTransfers.commissionAmount}::numeric), 0)`,
            totalNet: sql<string>`COALESCE(SUM(${vendorTransfers.netAmount}::numeric), 0)`,
            transferCount: sql<string>`COUNT(*)`,
          })
          .from(vendorTransfers)
          .where(
            and(
              eq(vendorTransfers.vendorId, vendor.id),
              eq(vendorTransfers.status, "completed"),
              ...timeConds,
            ),
          );

        const [failed] = await db
          .select({ count: sql<string>`COUNT(*)` })
          .from(vendorTransfers)
          .where(
            and(
              eq(vendorTransfers.vendorId, vendor.id),
              eq(vendorTransfers.status, "failed"),
            ),
          );

        const [pending] = await db
          .select({
            count: sql<string>`COUNT(*)`,
            totalAmount: sql<string>`COALESCE(SUM(${vendorTransfers.netAmount}::numeric), 0)`,
          })
          .from(vendorTransfers)
          .where(
            and(
              eq(vendorTransfers.vendorId, vendor.id),
              eq(vendorTransfers.status, "pending"),
            ),
          );

        const recentTransfers = await db.query.vendorTransfers.findMany({
          where: eq(vendorTransfers.vendorId, vendor.id),
          orderBy: [desc(vendorTransfers.createdAt)],
          limit: 10,
          columns: {
            id: true,
            grossAmount: true,
            commissionAmount: true,
            netAmount: true,
            status: true,
            transferredAt: true,
            failureReason: true,
          },
          with: { order: { columns: { id: true, createdAt: true } } },
        });

        return {
          stripeConnected: vendor.stripeOnboardingComplete,
          stripeAccountId: vendor.stripeAccountId,
          commissionRate: Number(vendor.commissionRate),
          totalGross: round2(toNum(totals?.totalGross)),
          totalCommission: round2(toNum(totals?.totalCommission)),
          totalNet: round2(toNum(totals?.totalNet)),
          transferCount: toNum(totals?.transferCount),
          failedTransfers: toNum(failed?.count),
          pendingCount: toNum(pending?.count),
          pendingAmount: round2(toNum(pending?.totalAmount)),
          recentTransfers,
        };
      },
      120,
    );

    return {
      data,
      success: true,
      message: "Payout Stats",
    };
  } catch (error) {
    return returnError(error, "Unable to fetch payout stats");
  }
}

// ---------------------------------------------------------------------------
// 8. getDashboardSummary — fires all in parallel
// ---------------------------------------------------------------------------

export async function getDashboardSummary(filter: MonthFilter = null) {
  try {
    const [
      overview,
      revenueByMonth,
      topProducts,
      statusBreakdown,
      reviewStats,
      inventoryStats,
      payoutStats,
    ] = await Promise.all([
      getOverviewStats(filter),
      getRevenueByMonth(),
      getTopProducts(filter),
      getOrderStatusBreakdown(filter),
      getReviewStats(filter),
      getInventoryStats(),
      getPayoutStats(filter),
    ]);

    return {
      success: true,
      message: "Dashboard summary",
      data: {
        overview: overview.data,
        revenueByMonth: revenueByMonth.data,
        topProducts: topProducts.data,
        statusBreakdown: statusBreakdown.data,
        reviewStats: reviewStats.data,
        inventoryStats: inventoryStats.data,
        payoutStats: payoutStats.data,
        filter,
      },
    };
  } catch (error) {
    return returnError(error, "Unable to fetch dashboard summary");
  }
}

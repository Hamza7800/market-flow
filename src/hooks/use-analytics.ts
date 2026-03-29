"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsKeys } from "@/lib/cache-keys";
import { fKey, type MonthFilter } from "@/lib/utils";
import {
  getDashboardSummary,
  getInventoryStats,
  getOrderStatusBreakdown,
  getOverviewStats,
  getPayoutStats,
  getRevenueByMonth,
  getReviewStats,
  getTopProducts,
} from "@/actions/analytics";

const STALE = {
  overview: 1000 * 60 * 2,
  chart: 1000 * 60 * 5,
  inventory: 1000 * 60 * 2,
  reviews: 1000 * 60 * 3,
  payouts: 1000 * 60 * 2,
};

export function useOverviewStats(vendorId: string, filter: MonthFilter = null) {
  return useQuery({
    queryKey: [...analyticsKeys.byVendor(vendorId), "overview", fKey(filter)],
    queryFn: async () => {
      const r = await getOverviewStats(filter);
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
    enabled: !!vendorId,
    staleTime: STALE.overview,
  });
}

export function useRevenueByMonth(vendorId: string) {
  return useQuery({
    queryKey: [...analyticsKeys.byVendor(vendorId), "revenue-by-month"],
    queryFn: async () => {
      const r = await getRevenueByMonth();
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
    enabled: !!vendorId,
    staleTime: STALE.chart,
  });
}

export function useTopProducts(vendorId: string, filter: MonthFilter = null) {
  return useQuery({
    queryKey: [...analyticsKeys.topProducts(vendorId), fKey(filter)],
    queryFn: async () => {
      const r = await getTopProducts(filter);
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
    enabled: !!vendorId,
    staleTime: STALE.chart,
  });
}

export function useOrderStatusBreakdown(
  vendorId: string,
  filter: MonthFilter = null,
) {
  return useQuery({
    queryKey: [
      ...analyticsKeys.byVendor(vendorId),
      "status-breakdown",
      fKey(filter),
    ],
    queryFn: async () => {
      const r = await getOrderStatusBreakdown(filter);
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
    enabled: !!vendorId,
    staleTime: STALE.overview,
  });
}

export function useReviewStats(vendorId: string, filter: MonthFilter = null) {
  return useQuery({
    queryKey: [...analyticsKeys.byVendor(vendorId), "reviews", fKey(filter)],
    queryFn: async () => {
      const r = await getReviewStats(filter);
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
    enabled: !!vendorId,
    staleTime: STALE.reviews,
  });
}

export function useInventoryStats(vendorId: string) {
  return useQuery({
    queryKey: [...analyticsKeys.byVendor(vendorId), "inventory"],
    queryFn: async () => {
      const r = await getInventoryStats();
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
    enabled: !!vendorId,
    staleTime: STALE.inventory,
  });
}

export function usePayoutStats(vendorId: string, filter: MonthFilter = null) {
  return useQuery({
    queryKey: [...analyticsKeys.byVendor(vendorId), "payouts", fKey(filter)],
    queryFn: async () => {
      const r = await getPayoutStats(filter);
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
    enabled: !!vendorId,
    staleTime: STALE.payouts,
  });
}

export function useDashboardSummary(
  vendorId: string,
  filter: MonthFilter = null,
) {
  return useQuery({
    queryKey: [
      ...analyticsKeys.byVendor(vendorId),
      "dashboard-summary",
      fKey(filter),
    ],
    queryFn: async () => {
      const r = await getDashboardSummary(filter);
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
    enabled: !!vendorId,
    staleTime: STALE.overview,
  });
}

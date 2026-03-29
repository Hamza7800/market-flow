import {
  getInventoryStats,
  getOrderStatusBreakdown,
  getOverviewStats,
  getRevenueByMonth,
  getTopProducts,
} from "@/actions/analytics";
import { OrderStatusChart } from "@/app/(dashboard)/_components/overview/charts/order-status-chart";
import { RevenueChart } from "@/app/(dashboard)/_components/overview/charts/revenue-chart";
import { TopProductsChart } from "@/app/(dashboard)/_components/overview/charts/top-products-charts";
import { RecentOrdersTable } from "@/app/(dashboard)/_components/overview/order-status";
import { OverviewHeader } from "@/app/(dashboard)/_components/overview/over-header";
import { StatCards } from "@/app/(dashboard)/_components/overview/stat-cards";
import { analyticsKeys } from "@/lib/cache-keys";
import { fKey, type MonthFilter } from "@/lib/utils";
import { Skeleton } from "@heroui/react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";

type PageProps = {
  params: Promise<{ vendorId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseMonthFilter(
  sp: Record<string, string | string[] | undefined>,
): MonthFilter {
  const year = Number(sp["year"]);
  const month = Number(sp["month"]);
  if (year && month) return { year, month };
  return null;
}

// TODO: CACHE CLEAR ANALYTICS

async function Content({
  vendorId,
  filter,
}: {
  vendorId: string;
  filter: MonthFilter;
}) {
  const queryClient = new QueryClient();
  const fk = fKey(filter);

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: [...analyticsKeys.byVendor(vendorId), "overview", fk],
      queryFn: () => getOverviewStats(filter).then((r) => r.data),
    }),
    queryClient.prefetchQuery({
      queryKey: [...analyticsKeys.byVendor(vendorId), "revenue-by-month"],
      queryFn: () => getRevenueByMonth().then((r) => r.data),
    }),
    queryClient.prefetchQuery({
      queryKey: [...analyticsKeys.topProducts(vendorId), fk],
      queryFn: () => getTopProducts(filter).then((r) => r.data),
    }),
    queryClient.prefetchQuery({
      queryKey: [...analyticsKeys.byVendor(vendorId), "status-breakdown", fk],
      queryFn: () => getOrderStatusBreakdown(filter).then((r) => r.data),
    }),
    queryClient.prefetchQuery({
      queryKey: [...analyticsKeys.byVendor(vendorId), "inventory"],
      queryFn: () => getInventoryStats().then((r) => r.data),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <StatCards vendorId={vendorId} filter={filter} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart vendorId={vendorId} />
        </div>
        <OrderStatusChart vendorId={vendorId} filter={filter} />
      </div>

      {/* Row 3 — Top products + Recent orders */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentOrdersTable vendorId={vendorId} filter={filter} />
        </div>
        <TopProductsChart vendorId={vendorId} filter={filter} />
      </div>
    </HydrationBoundary>
  );
}

const OverViewPage = async ({ params, searchParams }: PageProps) => {
  const [{ vendorId }, sp] = await Promise.all([params, searchParams]);
  const filter = parseMonthFilter(sp);

  return (
    <div className="space-y-5">
      <OverviewHeader vendorId={vendorId} filter={filter} />
      <Suspense fallback={<DashboardSkeleton />}>
        <Content vendorId={vendorId} filter={filter} />
      </Suspense>
    </div>
  );
};

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[120px] rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="col-span-2 h-[320px] rounded-2xl" />
        <Skeleton className="h-[320px] rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-[280px] rounded-2xl" />
        <Skeleton className="col-span-2 h-[280px] rounded-2xl" />
      </div>
    </div>
  );
}

export default OverViewPage;

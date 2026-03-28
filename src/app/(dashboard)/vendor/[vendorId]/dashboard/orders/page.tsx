import { getVendorOrders } from "@/actions/orders";
import { LoadingState } from "@/components/loading-state";
import { loadOrderSearchParams, type OrderStatus } from "@/lib/nuqs";
import { Surface } from "@heroui/react";
import { Suspense } from "react";
import OrdersNavHeader from "./_components/orders-nav-header";
import { OrdersTable } from "./_components/orders-table";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { orderKeys } from "@/lib/cache-keys";

const Content = async ({
  vendorId,
  status,
  page,
}: {
  vendorId: string;
  page: number;
  status: OrderStatus;
}) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: orderKeys.vendorList(vendorId, status, page),
    queryFn: async () => {
      const result = await getVendorOrders(status, page);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
  });

  // const result = await getVendorOrders(status, page);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersTable vendorId={vendorId} status={status} page={page} />
      {/* <pre>{JSON.stringify(result.data, null, 2)}</pre> */}
    </HydrationBoundary>
  );
};

type PageProps = {
  params: Promise<{ vendorId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const OrdersPage = async ({ params, searchParams }: PageProps) => {
  const [{ vendorId }, { status, page }] = await Promise.all([
    params,
    loadOrderSearchParams(searchParams),
  ]);

  return (
    <div>
      <OrdersNavHeader status={status} />
      <Suspense fallback={<LoadingState />}>
        <Content vendorId={vendorId} status={status} page={page} />
      </Suspense>
    </div>
  );
};

export default OrdersPage;

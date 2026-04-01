import { getOrderDetails, getVendorOrders } from "@/actions/orders";
import { LoadingState } from "@/components/loading-state";
import { Suspense } from "react";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import OderDetails from "./_components/oder-details";

const Content = async ({ vendorId, id }: { vendorId: string; id: string }) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["order-item-details", id],
    queryFn: async () => {
      const result = await getOrderDetails(id);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result.data;
    },
  });

  // const result = await getVendorOrders(status, page);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OderDetails vendorId={vendorId} id={id} />
      {/* <pre>{JSON.stringify(result.data, null, 2)}</pre> */}
    </HydrationBoundary>
  );
};

type PageProps = {
  params: Promise<{ vendorId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const OrderItemDetails = async ({ params, searchParams }: PageProps) => {
  const [{ vendorId }, { id }] = await Promise.all([params, searchParams]);

  return (
    <div>
      <Suspense fallback={<LoadingState />}>
        <Content vendorId={vendorId} id={id as string} />
      </Suspense>
    </div>
  );
};

export default OrderItemDetails;

import { LoadingState } from "@/components/loading-state";
import { REFUND_REQUESTS_KEY } from "@/lib/cache-keys";
import { loadRefundSearchParams, type RefundStatus } from "@/lib/nuqs";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import RefundsRequest from "./_components/refund-requests";
import { getVendorRefundRequests } from "@/actions/stripe";
import RefundNavHeader from "@/app/(dashboard)/vendor/[vendorId]/dashboard/refunds/_components/refund-nav-header";

const Content = async ({
  vendorId,
  status,
  page,
}: {
  vendorId: string;
  page: number;
  status: RefundStatus;
}) => {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: [...REFUND_REQUESTS_KEY, vendorId, status],
    queryFn: async () => {
      const result = await getVendorRefundRequests(status);
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RefundsRequest urlStatus={status} />
    </HydrationBoundary>
  );
};

type PageProps = {
  params: Promise<{ vendorId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const RefundsPage = async ({ params, searchParams }: PageProps) => {
  const [{ vendorId }, { status, page }] = await Promise.all([
    params,
    loadRefundSearchParams(searchParams),
  ]);

  return (
    <div>
      <RefundNavHeader status={status} />
      <Suspense fallback={<LoadingState />}>
        <Content vendorId={vendorId} status={status} page={page} />
      </Suspense>
    </div>
  );
};

export default RefundsPage;

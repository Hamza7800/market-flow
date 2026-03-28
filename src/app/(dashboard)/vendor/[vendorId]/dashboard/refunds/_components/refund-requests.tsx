"use client";

import { useVendorRefundRequests } from "@/hooks/use-refund";
import { type RefundStatus } from "@/lib/nuqs";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { RefundsTable } from "@/app/(dashboard)/vendor/[vendorId]/dashboard/refunds/_components/refunds-table";

const RefundsRequest = ({ urlStatus }: { urlStatus: RefundStatus }) => {
  const { data, isPending, isError, error, refetch } =
    useVendorRefundRequests(urlStatus);

  if (isPending) {
    return <LoadingState />;
  }

  if (isError) {
    <ErrorState
      title={"No Requests"}
      message={error.message}
      onRetry={refetch}
      homeHref={"/"}
    />;
  }

  return (
    <div className="mt-6">
      <RefundsTable data={data} />
    </div>
  );
};

export default RefundsRequest;

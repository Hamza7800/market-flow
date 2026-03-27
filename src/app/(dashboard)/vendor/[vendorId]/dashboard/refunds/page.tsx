"use client";

import { useVendorRefundRequests } from "@/hooks/use-refund";
import { RefundsTable } from "./_components/refunds-table";
import { refundSearchParams } from "@/lib/nuqs";
import { useQueryStates } from "nuqs";
import { Button } from "@heroui/react";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { EmptyState } from "@/components/empty-state";
import { AlertCircle } from "lucide-react";

const STATUS_LABELS: Record<any, string> = {
  pending: "Pending",
  succeeded: "succeeded",
  failed: "failed",
};

const Layout = () => {
  const [{ status: urlStatus }, setQuery] = useQueryStates(refundSearchParams, {
    history: "push",
    shallow: false,
  });

  const activeStatus = urlStatus;

  const setStatus = (nextStatus: any) => {
    setQuery({ status: nextStatus, page: 1 });
  };

  return (
    <div>
      <div className="mt-5 flex flex-wrap gap-2">
        {(["pending", "succeeded", "failed"] as const).map((item) => {
          const selected = item === activeStatus;

          return (
            <Button key={item} size="sm" onPress={() => setStatus(item)}>
              {STATUS_LABELS[item]}
            </Button>
          );
        })}
      </div>
      <div className="mt-10">
        <RefundsRequest urlStatus={urlStatus} />
      </div>
    </div>
  );
};

const RefundsRequest = ({
  urlStatus,
}: {
  urlStatus: "pending" | "succeeded" | "failed" | "refunded";
}) => {
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

  // if (!data?.length) {
  //   return (
  //     <EmptyState
  //       icon={AlertCircle}
  //       title="No Requests"
  //       description="No Refund Requests Yet"
  //       action={{
  //         label: "Refresh",
  //         onClick: refetch,
  //       }}
  //     />
  //   );
  // }

  return <RefundsTable data={data} />;
};

export default Layout;

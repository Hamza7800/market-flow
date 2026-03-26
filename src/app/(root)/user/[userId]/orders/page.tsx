"use client";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useUserOrders } from "@/hooks/use-orders";
import { AlertCircle } from "lucide-react";
import OrdersTable from "../../_components/user-orders-table";

const UserOrders = () => {
  const { data, isPending, isError, error, refetch } = useUserOrders();

  if (isPending) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState message={error?.message} onRetry={refetch} homeHref={"/"} />
    );
  }

  if (!data?.length) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No Orders"
        description="No orders placed yet"
        action={{
          label: "Refresh",
          onClick: refetch,
        }}
      />
    );
  }

  return (
    <div>
      <OrdersTable orders={data} />
    </div>
  );
};

export default UserOrders;

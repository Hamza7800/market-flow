"use client";

import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useUserOrders } from "@/hooks/use-orders";
import { AlertCircle } from "lucide-react";
import OrdersTable from "@/app/(root)/user/_components/user-orders-table";

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
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Your Orders
          </h1>
          <p className="text-muted mt-1 text-sm">Manage your orders info.</p>
        </div>
      </div>
      <OrdersTable orders={data} />
    </div>
  );
};

export default UserOrders;

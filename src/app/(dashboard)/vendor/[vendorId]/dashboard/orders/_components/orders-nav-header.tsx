"use client";

import { Button, Card, Chip } from "@heroui/react";
import { orderSearchParams, type OrderStatus } from "@/lib/nuqs/nuqs";
import { useQueryStates } from "nuqs";

const STATUS_LABELS: Record<any, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

const OrdersNavHeader = ({ status }: { status: OrderStatus }) => {
  const [{ status: urlStatus, page: urlPage }, setQuery] = useQueryStates(
    orderSearchParams,
    {
      history: "push",
      shallow: false,
    },
  );

  const setStatus = (nextStatus: OrderStatus) => {
    setQuery({ status: nextStatus, page: 1 });
  };

  const activeStatus = urlStatus ?? status;

  return (
    <Card className="mb-4">
      {/* <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Chip>Orders</Chip>
        </div>
      </div> */}

      <div className="flex flex-wrap gap-2">
        {(
          [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "refunded",
            "cancelled",
          ] as const
        ).map((item) => {
          const selected = item === activeStatus;

          return (
            <Button
              variant={selected ? "secondary" : "primary"}
              key={item}
              size="sm"
              onPress={() => setStatus(item)}
            >
              {STATUS_LABELS[item]}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default OrdersNavHeader;

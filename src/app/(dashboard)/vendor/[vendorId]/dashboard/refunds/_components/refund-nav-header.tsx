"use client";

import { refundSearchParams, type RefundStatus } from "@/lib/nuqs/nuqs";
import { Button, Card, Chip } from "@heroui/react";
import { useQueryStates } from "nuqs";

const STATUS_LABELS: Record<any, string> = {
  pending: "Pending",
  succeeded: "Succeeded",
  failed: "Failed",
};

const RefundNavHeader = ({ status }: { status: RefundStatus }) => {
  const [{ status: urlStatus, page: urlPage }, setQuery] = useQueryStates(
    refundSearchParams,
    {
      history: "push",
      shallow: false,
    },
  );

  const setStatus = (nextStatus: RefundStatus) => {
    setQuery({ status: nextStatus, page: 1 });
  };

  const activeStatus = urlStatus ?? status;

  return (
    <Card className="mb-4 shadow-none">
      <Card.Content className="flex-row justify-between">
        <h2 className="text-2xl">Refunds Management</h2>
        {/* <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Chip>Refunds</Chip>
        </div>
      </div> */}

        <div className="flex flex-wrap gap-2">
          {(["pending", "succeeded", "failed"] as const).map((item) => {
            const selected = item === activeStatus;

            return (
              <Button
                variant={selected ? "secondary" : "outline"}
                key={item}
                size="sm"
                onPress={() => setStatus(item)}
              >
                {STATUS_LABELS[item]}
              </Button>
            );
          })}
        </div>
      </Card.Content>
    </Card>
  );
};

export default RefundNavHeader;

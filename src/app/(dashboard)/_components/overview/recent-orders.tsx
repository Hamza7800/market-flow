"use client";

import { Card, Chip, Separator, Skeleton } from "@heroui/react";
import Link from "next/link";

import { ArrowUpRightIcon, PackageIcon } from "lucide-react";
import type { MonthFilter } from "@/lib/utils";
import { useVendorOrders } from "@/hooks/use-orders";

// const STATUS_CONFIG: StatusConfig[] = [
//   { key: "pending", label: "Pending", color: "#F5A524", icon: ClockIcon },
//   {
//     key: "processing",
//     label: "Processing",
//     color: "#006FEE",
//     icon: PackageIcon,
//   },
//   { key: "shipped", label: "Shipped", color: "#7828C8", icon: TruckIcon },
//   {
//     key: "delivered",
//     label: "Delivered",
//     color: "#17C964",
//     icon: CheckCircle2Icon,
//   },
//   { key: "cancelled", label: "Cancelled", color: "#F31260", icon: XCircleIcon },
//   { key: "refunded", label: "Refunded", color: "#889096", icon: RotateCcwIcon },
// ];

const ITEM_STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color:
      | "default"
      | "primary"
      | "success"
      | "warning"
      | "danger"
      | "secondary";
  }
> = {
  pending: { label: "Pending", color: "warning" },
  processing: { label: "Processing", color: "primary" },
  shipped: { label: "Shipped", color: "secondary" },
  delivered: { label: "Delivered", color: "success" },
  cancelled: { label: "Cancelled", color: "danger" },
  refunded: { label: "Refunded", color: "default" },
};

export function RecentOrdersTable({
  vendorId,
  filter,
}: {
  vendorId: string;
  filter: MonthFilter;
}) {
  const { data: pendingData, isLoading: pendingLoading } = useVendorOrders(
    vendorId,
    "pending",
    1,
  );
  const { data: processingData, isLoading: processingLoading } =
    useVendorOrders(vendorId, "processing", 1);

  const isLoading = pendingLoading || processingLoading;

  const items = [...(pendingData?.data ?? []), ...(processingData?.data ?? [])]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 8);

  function timeAgo(date: Date | string): string {
    const ms = Date.now() - new Date(date).getTime();
    const mins = Math.floor(ms / 60000);
    const hours = Math.floor(ms / 3600000);
    const days = Math.floor(ms / 86400000);
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  return (
    <Card className="h-full">
      <Card.Content className="">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-foreground text-sm font-semibold">
              Recent Orders
            </p>
            <p className="text-default-400 mt-0.5 text-xs">
              Pending &amp; processing items
            </p>
          </div>
          <Link
            href={`/vendor/${vendorId}/dashboard/orders`}
            className="text-primary flex items-center gap-1 text-xs font-medium hover:underline"
          >
            View all <ArrowUpRightIcon className="h-3 w-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-xl" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/4 rounded" />
                  <Skeleton className="h-2.5 w-1/2 rounded" />
                </div>
                <Skeleton className="h-5 w-16 rounded-lg" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="bg-default-50 flex h-[200px] flex-col items-center justify-center gap-2 rounded-xl">
            <PackageIcon className="text-default-300 h-8 w-8" />
            <p className="text-default-400 text-xs">No active orders</p>
          </div>
        ) : (
          <>
            {/* Column headers */}
            <div className="mb-2 grid grid-cols-[4fr_1fr_1fr_1fr] gap-3 px-1">
              {["Activity", "Amount", "Time", "Status"].map((h) => (
                <p
                  key={h}
                  className="text-default-400 text-[10px] font-semibold tracking-wide uppercase"
                >
                  {h}
                </p>
              ))}
            </div>
            <Separator />

            <div className="divide-default-100 divide-y">
              {items.map((item) => {
                const cfg =
                  ITEM_STATUS_CONFIG[item.status] ?? ITEM_STATUS_CONFIG.pending;
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[4fr_1fr_1fr_1fr] items-center gap-3 py-2.5"
                  >
                    {/* Activity */}
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="bg-default-100 flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <PackageIcon className="text-default-400 h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-foreground truncate text-xs font-medium">
                          {item.productName}
                        </p>
                        {item.variantName && (
                          <p className="text-default-400 truncate text-[10px]">
                            {item.variantName}
                          </p>
                        )}
                        <p className="text-default-400 text-[10px]">
                          Qty {item.quantity}
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <p className="text-foreground text-xs font-semibold">
                      ${Number(item.totalPrice).toFixed(2)}
                    </p>

                    {/* Time */}
                    <p className="text-default-400 text-[10px] tabular-nums">
                      {timeAgo(item.createdAt)}
                    </p>

                    {/* Status */}
                    <Chip
                      size="sm"
                      // color={cfg.color}
                      // variant="flat"
                      className="h-5 w-fit text-[10px] font-medium"
                    >
                      {cfg?.label}
                    </Chip>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card.Content>
    </Card>
  );
}

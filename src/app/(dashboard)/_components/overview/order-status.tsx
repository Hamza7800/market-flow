"use client";

/**
 * _components/order-status-chart.tsx
 * _components/recent-orders-table.tsx
 */

import { Card, Chip, Skeleton } from "@heroui/react";
import {
  Cell,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import Link from "next/link";

import {
  ArrowUpRightIcon,
  CheckCircle2Icon,
  ClockIcon,
  PackageIcon,
  TruckIcon,
  XCircleIcon,
  RotateCcwIcon,
} from "lucide-react";
import type { MonthFilter } from "@/lib/utils";
import { useOrderStatusBreakdown } from "@/hooks/use-analytics";
import { useVendorOrders } from "@/hooks/use-orders";

// ============================================================================
// OrderStatusChart — radial bar + horizontal breakdown
// ============================================================================

type StatusConfig = {
  key: string;
  label: string;
  color: string;
  icon: React.ElementType;
};

const STATUS_CONFIG: StatusConfig[] = [
  { key: "pending", label: "Pending", color: "#F5A524", icon: ClockIcon },
  {
    key: "processing",
    label: "Processing",
    color: "#006FEE",
    icon: PackageIcon,
  },
  { key: "shipped", label: "Shipped", color: "#7828C8", icon: TruckIcon },
  {
    key: "delivered",
    label: "Delivered",
    color: "#17C964",
    icon: CheckCircle2Icon,
  },
  { key: "cancelled", label: "Cancelled", color: "#F31260", icon: XCircleIcon },
  { key: "refunded", label: "Refunded", color: "#889096", icon: RotateCcwIcon },
];

export function OrderStatusChart({
  vendorId,
  filter,
}: {
  vendorId: string;
  filter: MonthFilter;
}) {
  const { data, isLoading } = useOrderStatusBreakdown(vendorId, filter);

  const radialData = STATUS_CONFIG.map((s) => ({
    name: s.label,
    value: data?.[s.key as keyof typeof data] ?? 0,
    fill: s.color,
  })).filter((d) => d.value > 0);

  const total = data?.total ?? 0;

  return (
    <Card className="border-default-100 bg-background rounded-2xl border shadow-sm">
      <Card.Content className="p-5">
        <p className="text-foreground mb-1 text-sm font-semibold">
          Order Breakdown
        </p>
        <p className="text-default-400 mb-4 text-xs">By fulfillment status</p>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-7 rounded-lg" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="bg-default-50 flex h-[240px] flex-col items-center justify-center gap-2 rounded-xl">
            <PackageIcon className="text-default-300 h-8 w-8" />
            <p className="text-default-400 text-xs">No orders yet</p>
          </div>
        ) : (
          <>
            {/* Radial chart */}
            <div className="relative mx-auto h-[160px] w-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="35%"
                  outerRadius="100%"
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={4}
                    background={{ fill: "hsl(var(--heroui-default-100))" }}
                  >
                    {radialData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </RadialBar>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0];
                      return (
                        <div className="border-default-200 bg-background rounded-xl border px-3 py-2 shadow-lg">
                          <p className="text-xs font-semibold">{p?.name}</p>
                          <p className="text-default-400 text-xs">
                            {p?.value} orders
                          </p>
                        </div>
                      );
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-foreground text-xl font-bold">
                  {total}
                </span>
                <span className="text-default-400 text-[10px]">Total</span>
              </div>
            </div>

            {/* Status rows */}
            <div className="mt-4 space-y-2">
              {STATUS_CONFIG.map((s) => {
                const count = data?.[s.key as keyof typeof data] ?? 0;
                const percent =
                  total > 0 ? Math.round((count / total) * 100) : 0;
                if (count === 0) return null;

                return (
                  <div key={s.key} className="flex items-center gap-2">
                    {/* Progress bar */}
                    <div className="flex-1">
                      <div className="mb-0.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <s.icon
                            className="h-3 w-3"
                            style={{ color: s.color }}
                          />
                          <span className="text-default-500 text-xs">
                            {s.label}
                          </span>
                        </div>
                        <span className="text-foreground text-xs font-semibold">
                          {count}
                        </span>
                      </div>
                      <div className="bg-default-100 h-1.5 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: s.color,
                          }}
                        />
                      </div>
                    </div>
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

// ============================================================================
// RecentOrdersTable — latest order items
// ============================================================================

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
  // Fetch pending + processing for recent activity
  const { data: pendingData, isLoading: pendingLoading } = useVendorOrders(
    vendorId,
    "pending",
    1,
  );
  const { data: processingData, isLoading: processingLoading } =
    useVendorOrders(vendorId, "processing", 1);

  const isLoading = pendingLoading || processingLoading;

  // Merge + take latest 8
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
    <Card className="border-default-100 bg-background h-full rounded-2xl border shadow-sm">
      <Card.Content className="p-5">
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
            href={`/vendor/${vendorId}/orders`}
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
            <div className="mb-2 grid grid-cols-[1fr_auto_auto_auto] gap-3 px-1">
              {["Activity", "Amount", "Time", "Status"].map((h) => (
                <p
                  key={h}
                  className="text-default-400 text-[10px] font-semibold tracking-wide uppercase"
                >
                  {h}
                </p>
              ))}
            </div>

            <div className="divide-default-100 divide-y">
              {items.map((item) => {
                const cfg =
                  ITEM_STATUS_CONFIG[item.status] ?? ITEM_STATUS_CONFIG.pending;
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 py-2.5"
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
                      className="h-5 text-[10px] font-medium"
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

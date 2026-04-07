"use client";

import {
  ClockIcon,
  PackageIcon,
  TruckIcon,
  CheckCircle2Icon,
  XCircleIcon,
  RotateCcwIcon,
} from "lucide-react";
import {
  Pie,
  PieChart,
  Tooltip,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, Label, Meter, ProgressBar, Skeleton } from "@heroui/react";
import { useOrderStatusBreakdown } from "@/hooks/use-analytics";
import type { MonthFilter } from "@/lib/utils";

// ─── Config ───────────────────────────────────────────────────────────────────

type StatusKey =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

type StatusConfig = {
  key: StatusKey;
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

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: {
    name: string;
    value: number;
    payload: { label: string; color: string };
  }[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]!;
  return (
    <div className="bg-background border-default-200 rounded-xl border px-3 py-2 shadow-lg">
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: entry.payload.color }}
        />
        <p className="text-foreground text-xs font-semibold">
          {entry.payload.label}
        </p>
      </div>
      <p className="text-default-400 mt-0.5 text-xs">{entry.value} orders</p>
    </div>
  );
}

// ─── Custom legend ────────────────────────────────────────────────────────────

function CustomLegend({
  payload,
}: {
  payload?: { value: string; payload: { label: string; color: string } }[];
}) {
  if (!payload?.length) return null;
  return (
    <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.payload.color }}
          />
          <span className="text-default-500 text-[11px]">
            {entry.payload.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrderStatusChart({
  vendorId,
  filter,
}: {
  vendorId: string;
  filter: MonthFilter;
}) {
  const { data, isLoading } = useOrderStatusBreakdown(vendorId, filter);

  const total = data?.total ?? 0;

  // Raw hex color in the data — no CSS vars needed, no ChartContainer needed
  const pieData = STATUS_CONFIG.flatMap((s) => {
    const count = data?.[s.key] ?? 0;
    if (count === 0) return [];
    return [{ name: s.key, label: s.label, value: count, color: s.color }];
  });

  return (
    <Card className="border-border border shadow-none">
      <Card.Content className="">
        <p className="text-foreground mb-1 text-sm font-semibold">
          Order Breakdown
        </p>
        <p className="text-default-400 mb-4 text-xs">By fulfillment status</p>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="mx-auto h-[200px] w-[200px] rounded-full" />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-5 rounded-lg" />
            ))}
          </div>
        ) : total === 0 ? (
          <div className="bg-default-50 flex h-[240px] flex-col items-center justify-center gap-2 rounded-xl">
            <PackageIcon className="text-default-300 h-8 w-8" />
            <p className="text-default-400 text-xs">No orders yet</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={2}
                  cornerRadius={3}
                  stroke="none"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2.5">
              {STATUS_CONFIG.map((s) => {
                const count = data?.[s.key] ?? 0;
                if (count === 0) return null;

                return (
                  <Meter
                    key={s.key}
                    value={count}
                    minValue={0}
                    maxValue={total}
                    className="w-full"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <Label>
                        <div className="flex items-center gap-1.5">
                          <s.icon
                            className="h-3 w-3"
                            style={{ color: s.color }}
                          />
                          <span className="text-default-500 text-xs">
                            {s.label}
                          </span>
                        </div>
                      </Label>
                      <div className="flex items-center gap-1.5">
                        <Meter.Output className="text-foreground w-6 text-right text-xs font-semibold" />
                      </div>
                    </div>
                    <Meter.Track className="bg-default-100 h-1.5 overflow-hidden rounded-full">
                      <Meter.Fill
                        className="h-full rounded-full transition-all duration-500"
                        style={{ backgroundColor: s.color }}
                      />
                    </Meter.Track>
                  </Meter>
                );
              })}
            </div>

            <div className="border-default-100 mt-4 flex items-center justify-between border-t pt-3">
              <span className="text-default-400 text-xs">Total orders</span>
              <span className="text-foreground text-sm font-bold">{total}</span>
            </div>
          </>
        )}
      </Card.Content>
    </Card>
  );
}

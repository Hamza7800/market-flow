"use client";

import { useRevenueByMonth, useTopProducts } from "@/hooks/use-analytics";
import type { MonthFilter } from "@/lib/utils";
/**
 * _components/revenue-chart.tsx
 * _components/top-products-chart.tsx
 */

import { Card, Chip, Skeleton } from "@heroui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ============================================================================
// Shared tooltip style
// ============================================================================

function ChartTooltip({ active, payload, label, valuePrefix = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="border-default-200 bg-background rounded-xl border px-3 py-2.5 shadow-lg">
      <p className="text-default-500 mb-1.5 text-xs font-semibold">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-default-500 capitalize">{p.name}</span>
          <span className="text-foreground ml-auto font-semibold">
            {valuePrefix}
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// RevenueChart — monthly revenue bar chart (last 12 months)
// ============================================================================

export function RevenueChart({ vendorId }: { vendorId: string }) {
  const { data, isLoading } = useRevenueByMonth(vendorId);

  return (
    <Card className="border-default-100 bg-background rounded-2xl border shadow-sm">
      <Card.Content className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-foreground text-sm font-semibold">
              Sales &amp; Orders Analytics
            </p>
            <p className="text-default-400 mt-0.5 text-xs">
              Last 12 months · Revenue &amp; order volume
            </p>
          </div>
          {data && data.length > 0 && (
            <Chip
              size="sm"
              // variant="flat" color="primary"
              className="text-xs"
            >
              {data.length} months
            </Chip>
          )}
        </div>

        {isLoading ? (
          <Skeleton className="h-[240px] w-full rounded-xl" />
        ) : !data || data.length === 0 ? (
          <EmptyChart message="No revenue data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              barCategoryGap="30%"
              barGap={2}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--heroui-default-200))"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "hsl(var(--heroui-default-400))" }}
                axisLine={false}
                tickLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--heroui-default-400))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                }
              />
              <Tooltip
                content={<ChartTooltip valuePrefix="$" />}
                cursor={{ fill: "hsl(var(--heroui-default-100))", radius: 6 }}
              />
              <Bar
                dataKey="revenue"
                name="Revenue"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
                fill="hsl(var(--heroui-primary))"
                fillOpacity={0.85}
              />
              <Bar
                dataKey="orders"
                name="Orders"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
                fill="hsl(var(--heroui-secondary))"
                fillOpacity={0.6}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Legend */}
        {!isLoading && data && data.length > 0 && (
          <div className="mt-3 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="bg-primary h-2.5 w-2.5 rounded-sm opacity-85" />
              <span className="text-default-400 text-xs">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-secondary h-2.5 w-2.5 rounded-sm opacity-60" />
              <span className="text-default-400 text-xs">Orders</span>
            </div>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}

// ============================================================================
// TopProductsChart — horizontal bar chart
// ============================================================================

const PRODUCT_COLORS = [
  "hsl(var(--heroui-primary))",
  "hsl(var(--heroui-secondary))",
  "hsl(var(--heroui-success))",
  "hsl(var(--heroui-warning))",
  "hsl(var(--heroui-danger))",
];

export function TopProductsChart({
  vendorId,
  filter,
}: {
  vendorId: string;
  filter: MonthFilter;
}) {
  const { data, isLoading } = useTopProducts(vendorId, filter);

  // Truncate long product names for chart display
  const chartData = data?.map((p) => ({
    ...p,
    shortName:
      p.productName.length > 14
        ? p.productName.slice(0, 14) + "…"
        : p.productName,
  }));

  return (
    <Card className="border-default-100 bg-background rounded-2xl border shadow-sm">
      <Card.Content className="p-5">
        <div className="mb-5">
          <p className="text-foreground text-sm font-semibold">
            Top Selling Products
          </p>
          <p className="text-default-400 mt-0.5 text-xs">By revenue</p>
        </div>

        {isLoading ? (
          <Skeleton className="h-[220px] w-full rounded-xl" />
        ) : !chartData || chartData.length === 0 ? (
          <EmptyChart message="No sales data yet" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--heroui-default-200))"
                vertical={false}
              />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 10, fill: "hsl(var(--heroui-default-400))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(var(--heroui-default-400))" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                }
              />
              <Tooltip
                content={<ChartTooltip valuePrefix="$" />}
                cursor={{ fill: "hsl(var(--heroui-default-100))", radius: 6 }}
              />
              <Bar
                dataKey="revenue"
                name="Revenue"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              >
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={PRODUCT_COLORS[i % PRODUCT_COLORS.length]}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Product list below chart */}
        {!isLoading && chartData && chartData.length > 0 && (
          <div className="mt-4 space-y-2">
            {chartData.map((p, i) => (
              <div key={p.productId} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: PRODUCT_COLORS[i % PRODUCT_COLORS.length],
                  }}
                />
                <span className="text-default-500 flex-1 truncate text-xs">
                  {p.productName}
                </span>
                <span className="text-foreground text-xs font-semibold">
                  ${p.revenue.toLocaleString()}
                </span>
                <span className="text-default-400 text-[10px]">
                  {p.unitsSold} sold
                </span>
              </div>
            ))}
          </div>
        )}
      </Card.Content>
    </Card>
  );
}

// ============================================================================
// Shared empty state
// ============================================================================

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="bg-default-50 flex h-[220px] flex-col items-center justify-center gap-2 rounded-xl">
      <div className="text-2xl">📊</div>
      <p className="text-default-400 text-xs">{message}</p>
    </div>
  );
}

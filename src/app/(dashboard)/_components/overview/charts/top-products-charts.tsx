"use client";

import { LoadingState } from "@/components/loading-state";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useTopProducts } from "@/hooks/use-analytics";
import type { MonthFilter } from "@/lib/utils";
import { Card } from "@heroui/react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

const MAX_PRODUCTS = 3;

export function TopProductsChart({
  vendorId,
  filter,
}: {
  vendorId: string;
  filter: MonthFilter;
}) {
  const { data, isLoading } = useTopProducts(vendorId, filter);

  const chartData = useMemo(() => {
    if (!data) return [];

    const sorted = [...data].sort((a, b) => b.revenue - a.revenue);
    const top = sorted.slice(0, MAX_PRODUCTS);

    while (top.length < MAX_PRODUCTS) {
      top.push({
        productId: `placeholder-${top.length}`,
        productName: "—",
        revenue: 0,
        unitsSold: 0,
        orderCount: 0,
        imageUrl: null,
      });
    }

    return top.map((p) => ({
      ...p,
      shortName:
        p.productName.length > 14
          ? p.productName.slice(0, 14) + "…"
          : p.productName,
    }));
  }, [data]);

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  if (isLoading) return <LoadingState />;

  if (!chartData.length) {
    return (
      <Card>
        <Card.Content className="flex h-[250px] items-center justify-center">
          <p className="text-muted-foreground text-sm">No sales data yet</p>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2">
      <Card.Header>
        <Card.Title>Top Selling Products</Card.Title>
        <Card.Description>By revenue</Card.Description>
      </Card.Header>

      <Card.Content>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <BarChart data={chartData} barCategoryGap="25%">
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="shortName"
              tickLine={false}
              axisLine={false}
              interval={0}
            />

            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ChartContainer>

        {/* Clean list */}
        <div className="mt-4 space-y-2">
          {chartData
            .filter((p) => p.revenue > 0)
            .map((p) => (
              <div
                key={p.productId}
                className="flex items-center justify-between text-xs"
              >
                <span className="text-muted-foreground truncate">
                  {p.productName}
                </span>
                <span className="text-muted-foreground truncate">
                  sold {p.unitsSold}
                </span>
                <span className="font-semibold">
                  ${p.revenue.toLocaleString()}
                </span>
              </div>
            ))}
        </div>
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

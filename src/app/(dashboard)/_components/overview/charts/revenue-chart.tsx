"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useRevenueByMonth } from "@/hooks/use-analytics";
import { LoadingState } from "@/components/loading-state";
import { Card } from "@heroui/react";

export const description = "A multiple bar chart";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const chartConfig = {
  orders: {
    label: "Orders",
    color: "pink",
  },
  revenue: {
    label: "Revenue",
    color: "green",
  },
} satisfies ChartConfig;

export const RevenueChart = ({ vendorId }: { vendorId: string }) => {
  const { data, isLoading } = useRevenueByMonth(vendorId);

  const chartData = useMemo(() => {
    const emptyMonths = monthNames.map((monthLabel, index) => ({
      month: index + 1,
      monthLabel: monthLabel.slice(0, 3),
      orders: 0,
      revenue: 0,
    }));

    if (!data?.length) return emptyMonths;

    return emptyMonths.map((monthItem) => {
      const found = data.find((item) => item.month === monthItem.month);

      return {
        ...monthItem,
        orders: found?.orders ?? 0,
        revenue: found?.revenue ?? 0,
      };
    });
  }, [data]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (!chartData.length) {
    return <h2>NO DATA</h2>;
  }

  return (
    <Card className="h-full">
      <Card.Header>
        <Card.Title>Revenue Chart</Card.Title>
        <Card.Description>Monthly orders and revenue</Card.Description>
      </Card.Header>

      <Card.Content>
        <ChartContainer className="h-full" config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            barGap={4}
            barCategoryGap="25%"
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              interval={0}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            {/* <Bar dataKey="orders" fill="pink" radius={4} maxBarSize={18} /> */}
            <Bar dataKey="revenue" fill="#006fee" radius={4} maxBarSize={18} />
          </BarChart>
        </ChartContainer>
      </Card.Content>
    </Card>
  );
};

"use client";

import { useInventoryStats, useOverviewStats } from "@/hooks/use-analytics";
import { monthLabel, type MonthFilter } from "@/lib/utils";

import { Chip, Card, Skeleton } from "@heroui/react";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BarChart2Icon,
  ShoppingBagIcon,
  TrendingUpIcon,
} from "lucide-react";
import Link from "next/link";

type StatCardProps = {
  title: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  delta?: number;
  href: string | null;
  loading?: boolean;
};

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  iconColor,
  iconBg,
  delta,
  href,
  loading,
}: StatCardProps) {
  const isUp = (delta ?? 0) >= 0;

  return (
    <Card className="border-border border shadow-none">
      <Card.Content>
        <div className="flex items-start justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          {href && (
            <Link
              href={href}
              className="border-default-200 text-default-400 hover:border-primary hover:text-primary flex h-7 w-7 items-center justify-center rounded-lg border transition-colors"
            >
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        <div className="mt-4">
          <p className="text-default-400 text-xs font-medium">{title}</p>

          {loading ? (
            <Skeleton className="mt-1.5 h-8 w-28 rounded-lg" />
          ) : (
            <div className="mt-1 flex items-end gap-2">
              <span className="text-foreground text-2xl font-bold tracking-tight">
                {value}
              </span>
              {delta !== undefined && (
                <Chip
                  size="sm"
                  // variant="flat"
                  color={isUp ? "success" : "danger"}
                  className="mb-0.5 h-5 text-[11px] font-semibold"
                >
                  {Math.abs(delta)}%
                </Chip>
              )}
            </div>
          )}

          {loading ? (
            <Skeleton className="mt-2 h-3.5 w-40 rounded" />
          ) : (
            <p className="text-default-400 mt-1.5 text-xs">{sub}</p>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}

export const StatCards = ({
  vendorId,
  filter,
}: {
  vendorId: string;
  filter: MonthFilter;
}) => {
  const { data: overview, isLoading: overviewLoading } = useOverviewStats(
    vendorId,
    filter,
  );
  const { data: inventory, isLoading: inventoryLoading } =
    useInventoryStats(vendorId);

  const label = filter ? monthLabel(filter) : "all time";

  const cards: StatCardProps[] = [
    {
      title: "Total Revenue",
      value: `$${(overview?.totalRevenue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: `${overview?.totalOrders ?? 0} orders · ${overview?.totalItemsSold ?? 0} items sold`,
      icon: BarChart2Icon,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      delta: undefined,
      href: null,
      loading: overviewLoading,
    },
    {
      title: "Active Orders",
      value: String(overview?.pendingOrders ?? 0),
      sub: `${overview?.totalOrders ?? 0} total · avg $${(overview?.avgOrderValue ?? 0).toFixed(2)}`,
      icon: ShoppingBagIcon,
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
      delta: undefined,
      href: `/vendor/${vendorId}/dashboard/orders`,
      loading: overviewLoading,
    },
    {
      title: "Low Stock Items",
      value: `${(inventory?.products.lowStock ?? 0) + (inventory?.variants.lowStock ?? 0)}`,
      sub: `${(inventory?.products.outOfStock ?? 0) + (inventory?.variants.outOfStock ?? 0)} out of stock`,
      icon: AlertTriangleIcon,
      iconColor: "text-warning",
      iconBg: "bg-warning/10",
      delta: undefined,
      href: `/vendor/${vendorId}/dashboard/products`,
      loading: inventoryLoading,
    },
    {
      title: "Net Payouts",
      value: `$${(overview?.totalNetPayout ?? 0).toLocaleString()}`,
      sub: `$${(overview?.totalRefunded ?? 0).toFixed(2)} refunded · ${overview?.pendingRefunds ?? 0} pending`,
      icon: TrendingUpIcon,
      iconColor: "text-success",
      iconBg: "bg-success/10",
      delta: undefined,
      href: null,
      loading: overviewLoading,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
};

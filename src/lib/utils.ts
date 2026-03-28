import type { orderItems, orders } from "@/server/db/schema";
import { clsx, type ClassValue } from "clsx";
import type { InferSelectModel } from "drizzle-orm";
import { twMerge } from "tailwind-merge";
import z from "zod";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const returnError = (error: any, message: string) => {
  console.error(message, error);

  let errorMessage = message;

  if (error?.body?.message) {
    errorMessage = error.body.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error instanceof z.ZodError) {
    errorMessage = error.message;
  }

  return {
    success: false,
    message: errorMessage,
    data: null,
  };
};

export const formatMoney = (value: string) => `$${Number(value).toFixed(2)}`;

type OrderItemStatus = InferSelectModel<typeof orderItems>["status"];
type OrderStatus = InferSelectModel<typeof orders>["status"];
export function deriveOrderStatus(
  itemStatuses: OrderItemStatus[],
): OrderStatus {
  if (itemStatuses.length === 0) return "processing";

  const counts = {
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    refunded: 0,
    cancelled: 0,
  };

  for (const s of itemStatuses) counts[s]++;

  const total = itemStatuses.length;
  const terminal = counts.refunded + counts.cancelled;
  const active = total - terminal;

  // All items terminal
  if (terminal === total) {
    if (counts.cancelled === total) return "cancelled";
    // Any refunds (even mixed with cancellations) → refunded
    return "refunded";
  }

  // All active items are delivered (some may be refunded/cancelled)
  if (counts.delivered === active) return "delivered";

  // All active items are shipped or delivered
  if (counts.shipped + counts.delivered === active) return "shipped";

  // At least one shipped but not all
  if (counts.shipped > 0 || counts.delivered > 0) return "partially_shipped";

  // At least one processing
  if (counts.processing > 0) return "processing";

  // Everything is pending — order was just paid
  return "processing";
}

export function getPageItems(page: number, totalPages: number) {
  const pages: Array<number | "..."> = [];

  const add = (item: number | "...") => {
    const last = pages[pages.length - 1];
    if (item === "..." && last === "...") return;
    pages.push(item);
  };

  add(1);

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) add("...");

  for (let p = start; p <= end; p++) add(p);

  if (end < totalPages - 1) add("...");

  if (totalPages > 1) add(totalPages);

  return pages;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calcDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

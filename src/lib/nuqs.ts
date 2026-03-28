import {
  createLoader,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs/server";

export const productSearchParams = {
  status: parseAsStringLiteral(["draft", "active", "archived"]).withDefault(
    "active",
  ),
  page: parseAsInteger.withDefault(1),
};

export const refundSearchParams = {
  status: parseAsStringLiteral([
    "pending",
    "succeeded",
    "failed",
    "refunded",
  ]).withDefault("pending"),
  page: parseAsInteger.withDefault(1),
};

export const orderSearchParams = {
  status: parseAsStringLiteral([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "refunded",
    "cancelled",
  ]).withDefault("pending"),
  page: parseAsInteger.withDefault(1),
};

export const loadProductSearchParams = createLoader(productSearchParams);
export const loadRefundSearchParams = createLoader(refundSearchParams);
export const loadOrderSearchParams = createLoader(orderSearchParams);

export type ProductStatus = "draft" | "active" | "archived";
export type RefundStatus = "pending" | "succeeded" | "failed" | "refunded";
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "refunded"
  | "cancelled";

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

export const loadProductSearchParams = createLoader(productSearchParams);

export type ProductStatus = "draft" | "active" | "archived";

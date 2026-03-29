import {
  createLoader,
  createSearchParamsCache,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs/server";

export type ProductStatus = "draft" | "active" | "archived";
export type PriceSort = "none" | "asc" | "desc";
export type MinRating = "none" | "3" | "4" | "4.5";

const STATUSES = ["active", "draft", "archived"] as const;
const PRICE_SORTS = ["none", "asc", "desc"] as const;
const MIN_RATINGS = ["none", "3", "4", "4.5"] as const;

// export const productSearchParams = {
//   status: parseAsStringLiteral(["draft", "active", "archived"]).withDefault(
//     "active",
//   ),
//   page: parseAsInteger.withDefault(1),
// };

export const serverProductParams = {
  status: parseAsStringLiteral(STATUSES).withDefault("active"),
  page: parseAsInteger.withDefault(1),
};

export const clientProductParams = {
  search: parseAsStringLiteral([] as string[]).withDefault("" as string),
  priceSort: parseAsStringLiteral(PRICE_SORTS).withDefault("none"),
  minRating: parseAsStringLiteral(MIN_RATINGS).withDefault("none"),
};

export const loadProductSearchParams = createLoader(serverProductParams);
export const productSearchParamsCache = createSearchParamsCache({
  ...serverProductParams,
  priceSort: parseAsStringLiteral(PRICE_SORTS).withDefault("none"),
  minRating: parseAsStringLiteral(MIN_RATINGS).withDefault("none"),
});

import {
  createSearchParamsCache,
  createLoader,
  parseAsInteger,
  parseAsString,
  parseAsFloat,
  parseAsStringLiteral,
} from "nuqs/server";

// ── Types ────────────────────────────────────────────────────────────────────

export const SORT_OPTIONS = [
  "newest",
  "price_asc",
  "price_desc",
  "rating",
] as const;

export const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  rating: "Top Rated",
};
export type SortOption = (typeof SORT_OPTIONS)[number];

const IN_STOCK_OPTIONS = ["true", "false"] as const;

// ── Browse page ──────────────────────────────────────────────────────────────

export const browseServerParams = {
  page: parseAsInteger.withDefault(1),
  category: parseAsString.withDefault(""),
  sort: parseAsStringLiteral(SORT_OPTIONS).withDefault("newest"),
  inStock: parseAsStringLiteral(IN_STOCK_OPTIONS).withDefault("true"),
};

export const browseClientParams = {
  minPrice: parseAsFloat.withDefault(0),
  maxPrice: parseAsFloat.withDefault(0),
  search: parseAsString.withDefault(""),
};

export const browseParamsCache = createSearchParamsCache({
  ...browseServerParams,
  ...browseClientParams,
});

export const loadBrowseParams = createLoader(browseServerParams);

export type BrowseParams = Awaited<ReturnType<typeof browseParamsCache.parse>>;

// ── Home page ────────────────────────────────────────────────────────────────

export const homeServerParams = {
  category: parseAsString.withDefault(""),
  page: parseAsInteger.withDefault(1),
};

export const homeParamsCache = createSearchParamsCache(homeServerParams);
export const loadHomeParams = createLoader(homeServerParams);

// ── Store page ───────────────────────────────────────────────────────────────

export const storeServerParams = {
  page: parseAsInteger.withDefault(1),
};

export const storeParamsCache = createSearchParamsCache(storeServerParams);

// ── Orders page ──────────────────────────────────────────────────────────────

export const ordersServerParams = {
  page: parseAsInteger.withDefault(1),
};

export const ordersParamsCache = createSearchParamsCache(ordersServerParams);

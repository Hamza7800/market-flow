const toTag = (segments: string[]): string => segments.join(":");

export type ProductFilters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "rating";
  search?: string;
  inStock?: boolean;
  // page?: number;
};

function filtersToString(filters: ProductFilters): string {
  return Object.entries(filters)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
}

const productSegments = {
  all: () => ["products"],
  lists: () => ["products", "list"],
  list: (page: number, filters: ProductFilters) => [
    "products",
    "list",
    page.toString(),
    filtersToString(filters),
  ],
  infinityList: (filters: ProductFilters) => [
    "products",
    "list",
    filtersToString(filters),
  ],
  detail: (slug: string) => ["products", "detail", slug],
  byVendor: (vendorId: string) => ["products", "vendor", vendorId],
  byCategory: (categoryId: string) => ["products", "category", categoryId],
  byVendorAndStatus: (vendorId: string, status: string) => [
    "products",
    "vendor",
    vendorId,
    "status",
    status,
  ],
};

export const productKeys = {
  all: () => productSegments.all(),
  lists: () => productSegments.lists(),
  list: (page: number, filters: ProductFilters) =>
    productSegments.list(page, filters),
  infinityList: (filters: ProductFilters) =>
    productSegments.infinityList(filters),
  detail: (productId: string) => productSegments.detail(productId),
  byVendor: (vendorId: string) => productSegments.byVendor(vendorId),
  byCategory: (categoryId: string) => productSegments.byCategory(categoryId),
  byVendorAndStatus: (vendorId: string, status: string) =>
    productSegments.byVendorAndStatus(vendorId, status),

  tags: {
    all: () => toTag(productSegments.all()),
    lists: () => toTag(productSegments.lists()),
    list: (page: number, filters: ProductFilters) =>
      toTag(productSegments.list(page, filters)),
    infinityList: (filters: ProductFilters) =>
      toTag(productSegments.infinityList(filters)),
    detail: (productId: string) => toTag(productSegments.detail(productId)),
    byVendor: (vendorId: string) => toTag(productSegments.byVendor(vendorId)),
    byCategory: (categoryId: string) =>
      toTag(productSegments.byCategory(categoryId)),
    byVendorAndStatus: (vendorId: string, status: string) =>
      toTag(productSegments.byVendorAndStatus(vendorId, status)),
  },
};

const vendorSegments = {
  all: () => ["vendors"],
  lists: () => ["vendors", "list"],
  detail: (vendorId: string) => ["vendors", "detail", vendorId],
  byUser: (userId: string) => ["vendors", "user", userId],
};

export const vendorKeys = {
  all: () => vendorSegments.all(),
  lists: () => vendorSegments.lists(),
  detail: (vendorId: string) => vendorSegments.detail(vendorId),
  byUser: (userId: string) => vendorSegments.byUser(userId),

  tags: {
    all: () => toTag(vendorSegments.all()),
    lists: () => toTag(vendorSegments.lists()),
    detail: (vendorId: string) => toTag(vendorSegments.detail(vendorId)),
    byUser: (userId: string) => toTag(vendorSegments.byUser(userId)),
  },
};

const categorySegments = {
  all: () => ["categories"],
  tree: () => ["categories", "tree"],
  list: () => ["categories", "list"],
};

export const categoryKeys = {
  all: () => categorySegments.all(),
  tree: () => categorySegments.tree(),
  list: () => categorySegments.list(),

  tags: {
    all: () => toTag(categorySegments.all()),
    tree: () => toTag(categorySegments.tree()),
    list: () => toTag(categorySegments.list()),
  },
};

export const cartKeys = {
  all: () => ["cart"],
  byUser: (userId: string) => ["cart", userId],
  items: (userId: string) => ["cart", userId, "items"],
};

const orderSegments = {
  all: () => ["orders"],
  byUser: (userId: string) => ["orders", "user", userId],
  userList: (userId: string, page: number) => [
    "orders",
    "user",
    userId,
    "page",
    page.toString(),
  ],
  byVendor: (vendorId: string) => ["orders", "vendor", vendorId],
  vendorList: (vendorId: string, status: string, page: number) => [
    "orders",
    "vendor",
    vendorId,
    status,
    page.toString(),
  ],
  detail: (orderId: string) => ["orders", "detail", orderId],
};

export const orderKeys = {
  all: () => orderSegments.all(),
  byUser: (userId: string) => orderSegments.byUser(userId),
  userList: (userId: string, page: number) =>
    orderSegments.userList(userId, page),
  byVendor: (vendorId: string) => orderSegments.byVendor(vendorId),
  vendorList: (vendorId: string, status: string, page: number) =>
    orderSegments.vendorList(vendorId, status, page),
  detail: (orderId: string) => orderSegments.detail(orderId),

  tags: {
    all: () => toTag(orderSegments.all()),
    byUser: (userId: string) => toTag(orderSegments.byUser(userId)),
    userList: (userId: string, page: number) =>
      toTag(orderSegments.userList(userId, page)),
    byVendor: (vendorId: string) => toTag(orderSegments.byVendor(vendorId)),
    vendorList: (vendorId: string, status: string, page: number) =>
      toTag(orderSegments.vendorList(vendorId, status, page)),
    detail: (orderId: string) => toTag(orderSegments.detail(orderId)),
  },
};

const reviewSegments = {
  all: () => ["reviews"],
  byProduct: (productId: string) => ["reviews", "product", productId],
  byUser: (userId: string) => ["reviews", "user", userId],
};

export const reviewKeys = {
  all: () => reviewSegments.all(),
  byProduct: (productId: string) => reviewSegments.byProduct(productId),
  byUser: (userId: string) => reviewSegments.byUser(userId),

  tags: {
    all: () => toTag(reviewSegments.all()),
    byProduct: (productId: string) =>
      toTag(reviewSegments.byProduct(productId)),
    byUser: (userId: string) => toTag(reviewSegments.byUser(userId)),
  },
};

export const wishlistKeys = {
  all: () => ["wishlist"],
  byUser: (userId: string) => ["wishlist", userId],
};

const discountSegments = {
  all: () => ["discounts"],
  byVendor: (vendorId: string) => ["discounts", "vendor", vendorId],
  validate: (code: string) => ["discounts", "validate", code],
};

export const discountKeys = {
  all: () => discountSegments.all(),
  byVendor: (vendorId: string) => discountSegments.byVendor(vendorId),
  validate: (code: string) => discountSegments.validate(code),

  tags: {
    all: () => toTag(discountSegments.all()),
    byVendor: (vendorId: string) => toTag(discountSegments.byVendor(vendorId)),
    validate: (code: string) => toTag(discountSegments.validate(code)),
  },
};

export const analyticsKeys = {
  all: () => ["analytics"],
  byVendor: (vendorId: string) => ["analytics", "vendor", vendorId],
  sales: (vendorId: string, period: string) => [
    "analytics",
    "vendor",
    vendorId,
    "sales",
    period,
  ],
  topProducts: (vendorId: string) => [
    "analytics",
    "vendor",
    vendorId,
    "top-products",
  ],
  tags: {
    all: () => toTag(["analytics"]),
    byVendor: (vendorId: string) => toTag(["analytics", "vendor", vendorId]),
    sales: (vendorId: string, period: string) =>
      toTag(["analytics", "vendor", vendorId, "sales", period]),
    topProducts: (vendorId: string) =>
      toTag(["analytics", "vendor", vendorId, "top-products"]),
  },
};

export const REFUND_REQUESTS_KEY = ["vendor", "refund-requests"] as const;

import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTableCreator,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `${name}`);

const createdAt = timestamp("created_at", { withTimezone: true })
  .$defaultFn(() => new Date())
  .notNull();

const updatedAt = timestamp("updated_at", { withTimezone: true })
  .defaultNow()
  .$onUpdate(() => new Date());

const softDelete = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

export const user = createTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  stripeCustomerId: text("stripe_customer_id"),
});

export const session = createTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = createTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = createTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  vendorProfile: one(vendorProfiles, {
    fields: [user.id],
    references: [vendorProfiles.userId],
  }),
  wishlists: many(wishlists),
  cart: one(carts, {
    fields: [user.id],
    references: [carts.userId],
  }),
  addresses: many(addresses),
  orders: many(orders),
  reviews: many(reviews),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const vendorStatusEnum = pgEnum("vendor_status", [
  "pending",
  "active",
  "suspended",
]);

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "processing",
  "partially_shipped",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const orderItemStatusEnum = pgEnum("order_item_status", [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "refunded",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);

export const transferStatusEnum = pgEnum("transfer_status", [
  "pending",
  "completed",
  "failed",
  "reversed",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "approved",
  "rejected",
]);

export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed",
]);

export const vendorProfiles = createTable(
  "vendor_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    storeName: text("store_name").notNull(),
    storeSlug: text("store_slug").notNull().unique(),
    description: text("description"),
    logoUrl: text("logo_url"),
    bannerUrl: text("banner_url"),
    stripeAccountId: text("stripe_account_id").unique(),
    stripeOnboardingComplete: boolean("stripe_onboarding_complete")
      .notNull()
      .default(false),
    // Per-vendor commission override — defaults to 10%
    commissionRate: decimal("commission_rate", { precision: 4, scale: 2 })
      .notNull()
      .default("0.10"),
    status: vendorStatusEnum("status").notNull().default("active"),
    contactEmail: text("contact_email"),
    returnPolicy: text("return_policy"),
    createdAt,
    updatedAt,
    ...softDelete,
  },
  (t) => [
    uniqueIndex("vendor_slug_idx").on(t.storeSlug),
    index("vendor_user_idx").on(t.userId),
    index("vendor_status_idx").on(t.status),
  ],
);

export const categories = createTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    // Self-referencing FK — null means top-level category
    parentId: uuid("parent_id").references((): any => categories.id, {
      onDelete: "set null",
    }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt,
    updatedAt,
  },
  (t) => [
    index("category_parent_idx").on(t.parentId),
    uniqueIndex("category_slug_idx").on(t.slug),
  ],
);

export const products = createTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendorProfiles.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
    // true  → price + stock live on productVariants
    // false → price + stock live on this row (stock column below)
    hasVariants: boolean("has_variants").notNull().default(false),
    stock: integer("stock").notNull().default(0),
    status: productStatusEnum("status").notNull().default("draft"),

    averageRating: decimal("average_rating", { precision: 3, scale: 2 }),
    reviewCount: integer("review_count").notNull().default(0),
    totalSold: integer("total_sold").notNull().default(0),
    createdAt,
    updatedAt,
    ...softDelete,
  },
  (t) => [
    index("product_vendor_idx").on(t.vendorId),
    index("product_category_idx").on(t.categoryId),
    index("product_status_idx").on(t.status),
    index("product_vendor_status_idx").on(t.vendorId, t.status),
    uniqueIndex("product_slug_idx").on(t.slug),
  ],
);

export const productImages = createTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    altText: text("alt_text"),
    sortOrder: integer("sort_order").notNull().default(0),
    isPrimary: boolean("is_primary").notNull().default(false),
    key: text("key"),
    createdAt,
  },
  (t) => [index("image_product_idx").on(t.productId)],
);

export const productVariants = createTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    options: text("options").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }),
    stock: integer("stock").notNull().default(0),
    sku: text("sku").unique(),
    imageUrl: text("image_url"),
    createdAt,
    updatedAt,
    ...softDelete,
  },
  (t) => [
    index("variant_product_idx").on(t.productId),
    index("variant_sku_idx").on(t.sku),
  ],
);

export const tags = createTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
});

export const productTags = createTable(
  "product_tags",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("product_tag_unique_idx").on(t.productId, t.tagId),
    index("product_tags_tag_idx").on(t.tagId),
  ],
);

export const discountCodes = createTable(
  "discount_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    vendorId: uuid("vendor_id").references(() => vendorProfiles.id, {
      onDelete: "cascade",
    }),
    code: text("code").notNull().unique(),
    type: discountTypeEnum("type").notNull(),
    value: decimal("value", { precision: 10, scale: 2 }).notNull(),
    minOrderAmount: decimal("min_order_amount", { precision: 10, scale: 2 }),
    maxUses: integer("max_uses"),
    usedCount: integer("used_count").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt,
    updatedAt,
  },
  (t) => [
    uniqueIndex("discount_code_idx").on(t.code),
    index("discount_vendor_idx").on(t.vendorId),
  ],
);

export const wishlists = createTable(
  "wishlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt,
  },
  (t) => [
    index("wishlist_user_idx").on(t.userId),
    uniqueIndex("wishlist_unique_idx").on(t.userId, t.productId),
  ],
);

export const carts = createTable(
  "carts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    discountCodeId: uuid("discount_code_id").references(
      () => discountCodes.id,
      { onDelete: "set null" },
    ),
    createdAt,
    updatedAt,
  },
  (t) => [index("cart_user_idx").on(t.userId)],
);

export const cartItems = createTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    // null when product.hasVariants = false
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "cascade",
    }),
    quantity: integer("quantity").notNull().default(1),
    priceAtAdd: decimal("price_at_add", { precision: 10, scale: 2 }).notNull(),
    createdAt,
    updatedAt,
  },
  (t) => [
    index("cart_item_cart_idx").on(t.cartId),
    uniqueIndex("cart_item_unique_idx").on(t.cartId, t.productId, t.variantId),
  ],
);

export const addresses = createTable(
  "addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text("city").notNull(),
    state: text("state"),
    postalCode: text("postal_code").notNull(),
    country: text("country").notNull(),
    phone: text("phone"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt,
    updatedAt,
  },
  (t) => [index("address_user_idx").on(t.userId)],
);

export const orders = createTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    guestEmail: text("guest_email"),
    status: orderStatusEnum("status").notNull().default("pending"),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    shippingAmount: decimal("shipping_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    total: decimal("total", { precision: 10, scale: 2 }).notNull(),
    stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
    shippingAddressSnapshot: text("shipping_address_snapshot").notNull(),
    discountCodeId: uuid("discount_code_id").references(
      () => discountCodes.id,
      { onDelete: "set null" },
    ),
    discountCodeUsed: text("discount_code_used"),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt,
    updatedAt,
    ...softDelete,
  },
  (t) => [
    index("order_user_idx").on(t.userId),
    index("order_status_idx").on(t.status),
    index("order_stripe_idx").on(t.stripePaymentIntentId),
    index("order_user_status_idx").on(t.userId, t.status),
  ],
);

export const orderItems = createTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendorProfiles.id, { onDelete: "restrict" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "restrict" }),
    variantId: uuid("variant_id").references(() => productVariants.id, {
      onDelete: "restrict",
    }),

    productName: text("product_name").notNull(),
    variantName: text("variant_name"),
    imageUrl: text("image_url"),
    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
    status: orderItemStatusEnum("status").notNull().default("pending"),
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (t) => [
    index("order_item_order_idx").on(t.orderId),
    index("order_item_vendor_idx").on(t.vendorId),
    index("order_item_product_idx").on(t.productId),
    index("order_item_vendor_status_idx").on(t.vendorId, t.status),
  ],
);

export const payments = createTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .unique()
      .references(() => orders.id, { onDelete: "restrict" }),
    stripePaymentIntentId: text("stripe_payment_intent_id").notNull().unique(),
    stripeChargeId: text("stripe_charge_id"),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("usd"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    // Raw Stripe event stored for idempotency checks + debugging
    stripeEventSnapshot: text("stripe_event_snapshot"),
    createdAt,
    updatedAt,
  },
  (t) => [
    index("payment_order_idx").on(t.orderId),
    index("payment_stripe_idx").on(t.stripePaymentIntentId),
  ],
);

export const vendorTransfers = createTable(
  "vendor_transfers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    vendorId: uuid("vendor_id")
      .notNull()
      .references(() => vendorProfiles.id, { onDelete: "restrict" }),
    stripeAccountId: text("stripe_account_id").notNull(),
    stripeTransferId: text("stripe_transfer_id").unique(),
    grossAmount: decimal("gross_amount", { precision: 10, scale: 2 }).notNull(),
    commissionAmount: decimal("commission_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
    status: transferStatusEnum("status").notNull().default("pending"),
    transferredAt: timestamp("transferred_at", { withTimezone: true }),
    failureReason: text("failure_reason"),
    createdAt,
    updatedAt,
  },
  (t) => [
    index("transfer_order_idx").on(t.orderId),
    index("transfer_vendor_idx").on(t.vendorId),
    uniqueIndex("transfer_unique_idx").on(t.orderId, t.vendorId),
  ],
);

export const refunds = createTable(
  "refunds",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    orderItemId: uuid("order_item_id").references(() => orderItems.id, {
      onDelete: "restrict",
    }),
    stripeRefundId: text("stripe_refund_id").unique(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    reason: text("reason"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    createdAt,
    updatedAt,
  },
  (t) => [index("refund_order_idx").on(t.orderId)],
);

export const reviews = createTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    orderItemId: uuid("order_item_id")
      .notNull()
      .unique()
      .references(() => orderItems.id, { onDelete: "restrict" }),
    rating: integer("rating").notNull(),
    title: text("title"),
    body: text("body"),
    status: reviewStatusEnum("status").notNull().default("pending"),
    createdAt,
    updatedAt,
    ...softDelete,
  },
  (t) => [
    index("review_product_idx").on(t.productId),
    index("review_user_idx").on(t.userId),
    index("review_status_idx").on(t.status),
  ],
);

export const vendorProfilesRelations = relations(
  vendorProfiles,
  ({ one, many }) => ({
    user: one(user, {
      fields: [vendorProfiles.userId],
      references: [user.id],
    }),
    products: many(products),
    orderItems: many(orderItems),
    transfers: many(vendorTransfers),
    discountCodes: many(discountCodes),
  }),
);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "subcategories",
  }),
  subcategories: many(categories, { relationName: "subcategories" }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  vendor: one(vendorProfiles, {
    fields: [products.vendorId],
    references: [vendorProfiles.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  variants: many(productVariants),
  productTags: many(productTags),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  reviews: many(reviews),
  wishlists: many(wishlists),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    cartItems: many(cartItems),
    orderItems: many(orderItems),
  }),
);

export const tagsRelations = relations(tags, ({ many }) => ({
  productTags: many(productTags),
}));

export const productTagsRelations = relations(productTags, ({ one }) => ({
  product: one(products, {
    fields: [productTags.productId],
    references: [products.id],
  }),
  tag: one(tags, {
    fields: [productTags.tagId],
    references: [tags.id],
  }),
}));

export const discountCodesRelations = relations(
  discountCodes,
  ({ one, many }) => ({
    vendor: one(vendorProfiles, {
      fields: [discountCodes.vendorId],
      references: [vendorProfiles.id],
    }),
    carts: many(carts),
    orders: many(orders),
  }),
);

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(user, { fields: [wishlists.userId], references: [user.id] }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(user, { fields: [carts.userId], references: [user.id] }),
  items: many(cartItems),
  discountCode: one(discountCodes, {
    fields: [carts.discountCodeId],
    references: [discountCodes.id],
  }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, { fields: [cartItems.cartId], references: [carts.id] }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(user, { fields: [addresses.userId], references: [user.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(user, { fields: [orders.userId], references: [user.id] }),
  items: many(orderItems),
  payment: one(payments, {
    fields: [orders.id],
    references: [payments.orderId],
  }),
  transfers: many(vendorTransfers),
  refunds: many(refunds),
  discountCode: one(discountCodes, {
    fields: [orders.discountCodeId],
    references: [discountCodes.id],
  }),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  vendor: one(vendorProfiles, {
    fields: [orderItems.vendorId],
    references: [vendorProfiles.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
  review: one(reviews, {
    fields: [orderItems.id],
    references: [reviews.orderItemId],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const vendorTransfersRelations = relations(
  vendorTransfers,
  ({ one }) => ({
    order: one(orders, {
      fields: [vendorTransfers.orderId],
      references: [orders.id],
    }),
    vendor: one(vendorProfiles, {
      fields: [vendorTransfers.vendorId],
      references: [vendorProfiles.id],
    }),
  }),
);

export const refundsRelations = relations(refunds, ({ one }) => ({
  order: one(orders, {
    fields: [refunds.orderId],
    references: [orders.id],
  }),
  orderItem: one(orderItems, {
    fields: [refunds.orderItemId],
    references: [orderItems.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(user, { fields: [reviews.userId], references: [user.id] }),
  orderItem: one(orderItems, {
    fields: [reviews.orderItemId],
    references: [orderItems.id],
  }),
}));

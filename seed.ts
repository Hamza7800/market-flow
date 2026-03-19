"use server";
/**
 * seed.ts  —  Multi-vendor ecom dev seed
 *
 * Run with:
 *   npx tsx src/server/db/seed.ts
 *
 * Creates:
 *   • 1 buyer user  (buyer@dev.com / password123)
 *   • 1 vendor user (vendor@dev.com / password123)
 *   • 1 vendor profile + store
 *   • Category tree  (3 top-level → sub-categories)
 *   • 6 products  (mix of simple & variant, various statuses)
 *   • Product images, variants, tags
 *   • Buyer address
 *
 * Skips: orders, payments, transfers, refunds (Stripe placeholders)
 */

import { auth } from "@/server/better-auth";
import { db } from "@/server/db";
import {
  user,
  vendorProfiles,
  categories,
  products,
  productImages,
  productVariants,
  tags,
  productTags,
  addresses,
} from "@/server/db/schema";
import { eq, isNull } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slug(name: string, suffix?: string) {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return suffix ? `${base}-${suffix}` : base;
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------

export async function main() {
  console.log("🌱  Starting seed...\n");

  // ── 1. Users via Better Auth ─────────────────────────────────────────────
  // signUpEmail is idempotent here: if the user already exists we just look
  // them up so re-runs don't blow up.

  const seedUsers = [
    { name: "Alex Buyer", email: "buyer@dev.com", password: "password123" },
    { name: "Sam Vendor", email: "vendor@dev.com", password: "password123" },
  ];

  const userIds: Record<string, string> = {};

  console.log("Creating users:");
  for (const u of seedUsers) {
    try {
      const res = await auth.api.signUpEmail({
        body: { name: u.name, email: u.email, password: u.password },
      });
      userIds[u.email] = res.user.id;
      console.log(`  ✓ ${u.name} (created)`);
    } catch {
      const existing = await db.query.user.findFirst({
        where: (t, { eq }) => eq(t.email, u.email),
      });
      if (!existing) throw new Error(`Cannot find or create user ${u.email}`);
      userIds[u.email] = existing.id;
      console.log(`  ~ ${u.name} (already exists)`);
    }
  }

  const buyerId = userIds["buyer@dev.com"];
  const vendorUserId = userIds["vendor@dev.com"];

  console.log("✅  Users ready");

  // ── 2. Vendor Profile ────────────────────────────────────────────────────

  const [vendorProfile] = await db
    .insert(vendorProfiles)
    .values({
      userId: vendorUserId,
      storeName: "Artisan Goods Co.",
      storeSlug: "artisan-goods-co",
      description:
        "Handcrafted everyday items — minimal, purposeful, built to last.",
      logoUrl: "https://api.dicebear.com/8.x/identicon/svg?seed=artisan",
      bannerUrl: "https://picsum.photos/seed/artisan-banner/1200/400",
      // Stripe fields left as placeholder — onboarding incomplete
      stripeAccountId: null,
      stripeOnboardingComplete: false,
      commissionRate: "0.10",
      status: "active",
      contactEmail: "hello@artisangoods.dev",
      returnPolicy:
        "We accept returns within 30 days of delivery for unused items in original packaging.",
    })
    .returning();

  console.log(
    `✅  Vendor profile created → store: "${vendorProfile.storeName}"`,
  );

  // ── 3. Categories (tree) ─────────────────────────────────────────────────
  //
  //  Electronics
  //    ├── Accessories
  //    └── Audio
  //  Clothing
  //    ├── Men
  //    └── Women
  //  Home & Living
  //    └── Kitchen

  const catData = [
    { name: "Electronics", slug: "electronics", parentId: null, sortOrder: 1 },
    { name: "Clothing", slug: "clothing", parentId: null, sortOrder: 2 },
    {
      name: "Home & Living",
      slug: "home-living",
      parentId: null,
      sortOrder: 3,
    },
  ] as const;

  const insertedTopLevel = await db
    .insert(categories)
    .values(catData.map((c) => ({ ...c })))
    .returning();

  const catMap: Record<string, string> = {};
  for (const c of insertedTopLevel) catMap[c.slug] = c.id;

  const subCatData = [
    {
      name: "Accessories",
      slug: "accessories",
      parentId: catMap["electronics"],
      sortOrder: 1,
    },
    {
      name: "Audio",
      slug: "audio",
      parentId: catMap["electronics"],
      sortOrder: 2,
    },
    { name: "Men", slug: "men", parentId: catMap["clothing"], sortOrder: 1 },
    {
      name: "Women",
      slug: "women",
      parentId: catMap["clothing"],
      sortOrder: 2,
    },
    {
      name: "Kitchen",
      slug: "kitchen",
      parentId: catMap["home-living"],
      sortOrder: 1,
    },
  ];

  const insertedSubs = await db
    .insert(categories)
    .values(subCatData)
    .returning();

  for (const c of insertedSubs) catMap[c.slug] = c.id;

  console.log("✅  Categories seeded (3 top-level + 5 sub-categories)");

  // ── 4. Tags ──────────────────────────────────────────────────────────────

  const tagNames = [
    "handmade",
    "eco-friendly",
    "bestseller",
    "new-arrival",
    "limited-edition",
  ];

  const insertedTags = await db
    .insert(tags)
    .values(tagNames.map((name) => ({ name, slug: slug(name) })))
    .onConflictDoNothing()
    .returning();

  const tagMap: Record<string, string> = {};
  for (const t of insertedTags) tagMap[t.name] = t.id;

  console.log(`✅  Tags seeded (${insertedTags.length} tags)`);

  // ── 5. Products ──────────────────────────────────────────────────────────

  const vendorId = vendorProfile.id;

  // ---------- 5a. Simple product — active ──────────────────────────────────
  const [woodenBowl] = await db
    .insert(products)
    .values({
      vendorId,
      categoryId: catMap["kitchen"],
      name: "Walnut Serving Bowl",
      slug: slug("Walnut Serving Bowl", "wsb01"),
      description:
        "Hand-turned from solid black walnut. Food-safe oil finish. Each bowl is unique — grain patterns vary.",
      basePrice: "68.00",
      hasVariants: false,
      stock: 14,
      status: "active",
      averageRating: "4.80",
      reviewCount: 22,
      totalSold: 58,
    })
    .returning();

  await db.insert(productImages).values([
    {
      productId: woodenBowl.id,
      url: "https://picsum.photos/seed/bowl1/800/800",
      altText: "Walnut Serving Bowl — top view",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      productId: woodenBowl.id,
      url: "https://picsum.photos/seed/bowl2/800/800",
      altText: "Walnut Serving Bowl — side view",
      sortOrder: 1,
      isPrimary: false,
    },
  ]);

  await linkTags(
    woodenBowl.id,
    ["handmade", "eco-friendly", "bestseller"],
    tagMap,
  );

  // ---------- 5b. Variant product — active (T-shirt with size + colour) ────
  const [tshirt] = await db
    .insert(products)
    .values({
      vendorId,
      categoryId: catMap["men"],
      name: "Classic Crew Tee",
      slug: slug("Classic Crew Tee", "cct01"),
      description:
        "100 % organic cotton. Pre-shrunk. Relaxed fit. Screen-printed logo.",
      basePrice: "34.00",
      hasVariants: true,
      stock: 0, // stock lives on variants
      status: "active",
      averageRating: "4.60",
      reviewCount: 9,
      totalSold: 33,
    })
    .returning();

  await db.insert(productImages).values([
    {
      productId: tshirt.id,
      url: "https://picsum.photos/seed/tee-white/800/800",
      altText: "Classic Crew Tee — white",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      productId: tshirt.id,
      url: "https://picsum.photos/seed/tee-black/800/800",
      altText: "Classic Crew Tee — black",
      sortOrder: 1,
      isPrimary: false,
    },
  ]);

  const tshirtVariants = [
    {
      name: "White / S",
      options: { color: "White", size: "S" },
      price: "34.00",
      stock: 8,
      sku: "CCT-WHT-S",
    },
    {
      name: "White / M",
      options: { color: "White", size: "M" },
      price: "34.00",
      stock: 12,
      sku: "CCT-WHT-M",
    },
    {
      name: "White / L",
      options: { color: "White", size: "L" },
      price: "34.00",
      stock: 6,
      sku: "CCT-WHT-L",
    },
    {
      name: "Black / S",
      options: { color: "Black", size: "S" },
      price: "34.00",
      stock: 5,
      sku: "CCT-BLK-S",
    },
    {
      name: "Black / M",
      options: { color: "Black", size: "M" },
      price: "34.00",
      stock: 10,
      sku: "CCT-BLK-M",
    },
    {
      name: "Black / L",
      options: { color: "Black", size: "L" },
      price: "34.00",
      stock: 0,
      sku: "CCT-BLK-L",
    },
  ];

  await db.insert(productVariants).values(
    tshirtVariants.map((v) => ({
      productId: tshirt.id,
      name: v.name,
      options: JSON.stringify(v.options),
      price: v.price,
      stock: v.stock,
      sku: v.sku,
    })),
  );

  await linkTags(tshirt.id, ["eco-friendly", "new-arrival"], tagMap);

  // ---------- 5c. Simple product — active (candle) ─────────────────────────
  const [candle] = await db
    .insert(products)
    .values({
      vendorId,
      categoryId: catMap["home-living"],
      name: "Soy Wax Pillar Candle",
      slug: slug("Soy Wax Pillar Candle", "swpc01"),
      description:
        "70-hour burn time. Lead-free cotton wick. Scents: cedar + vanilla.",
      basePrice: "22.00",
      hasVariants: false,
      stock: 40,
      status: "active",
      averageRating: "4.95",
      reviewCount: 41,
      totalSold: 120,
    })
    .returning();

  await db.insert(productImages).values({
    productId: candle.id,
    url: "https://picsum.photos/seed/candle1/800/800",
    altText: "Soy Wax Pillar Candle",
    sortOrder: 0,
    isPrimary: true,
  });

  await linkTags(candle.id, ["handmade", "bestseller"], tagMap);

  // ---------- 5d. Variant product — active (headphones: wired/wireless) ────
  const [headphones] = await db
    .insert(products)
    .values({
      vendorId,
      categoryId: catMap["audio"],
      name: "Studio Monitor Headphones",
      slug: slug("Studio Monitor Headphones", "smh01"),
      description:
        "40 mm dynamic drivers, 20 Hz–20 kHz response. Available wired or Bluetooth.",
      basePrice: "89.00",
      hasVariants: true,
      stock: 0,
      status: "active",
      averageRating: "4.40",
      reviewCount: 7,
      totalSold: 19,
    })
    .returning();

  await db.insert(productImages).values([
    {
      productId: headphones.id,
      url: "https://picsum.photos/seed/hp1/800/800",
      altText: "Studio Monitor Headphones — wired",
      sortOrder: 0,
      isPrimary: true,
    },
    {
      productId: headphones.id,
      url: "https://picsum.photos/seed/hp2/800/800",
      altText: "Studio Monitor Headphones — wireless",
      sortOrder: 1,
      isPrimary: false,
    },
  ]);

  await db.insert(productVariants).values([
    {
      productId: headphones.id,
      name: "Wired",
      options: JSON.stringify({ type: "Wired" }),
      price: "89.00",
      stock: 15,
      sku: "SMH-WIRED",
    },
    {
      productId: headphones.id,
      name: "Bluetooth",
      options: JSON.stringify({ type: "Bluetooth" }),
      price: "129.00",
      stock: 8,
      sku: "SMH-BT",
    },
  ]);

  await linkTags(headphones.id, ["new-arrival", "limited-edition"], tagMap);

  // ---------- 5e. Draft product (not published yet) ────────────────────────
  const [draftProduct] = await db
    .insert(products)
    .values({
      vendorId,
      categoryId: catMap["accessories"],
      name: "Leather Card Wallet",
      slug: slug("Leather Card Wallet", "lcw01"),
      description:
        "Full-grain vegetable-tanned leather. Holds 6 cards + cash slot. Ages beautifully.",
      basePrice: "45.00",
      hasVariants: false,
      stock: 0,
      status: "draft",
    })
    .returning();

  await db.insert(productImages).values({
    productId: draftProduct.id,
    url: "https://picsum.photos/seed/wallet1/800/800",
    altText: "Leather Card Wallet",
    sortOrder: 0,
    isPrimary: true,
  });

  await linkTags(draftProduct.id, ["handmade", "limited-edition"], tagMap);

  // ---------- 5f. Archived product ─────────────────────────────────────────
  await db.insert(products).values({
    vendorId,
    categoryId: catMap["kitchen"],
    name: "Bamboo Cutting Board (Discontinued)",
    slug: slug("Bamboo Cutting Board", "bcb-old"),
    description: "No longer in production.",
    basePrice: "38.00",
    hasVariants: false,
    stock: 0,
    status: "archived",
    totalSold: 210,
  });

  console.log("✅  Products seeded (4 active, 1 draft, 1 archived)");

  // ── 6. Buyer address ─────────────────────────────────────────────────────

  await db.insert(addresses).values({
    userId: buyerId,
    fullName: "Alex Buyer",
    line1: "42 Maple Street",
    line2: "Apt 3B",
    city: "Brooklyn",
    state: "NY",
    postalCode: "11201",
    country: "US",
    phone: "+1-555-010-2020",
    isDefault: true,
  });

  console.log("✅  Buyer address seeded");

  // ── Done ─────────────────────────────────────────────────────────────────

  console.log(`
╔══════════════════════════════════════════════════╗
║              Seed complete 🎉                    ║
╠══════════════════════════════════════════════════╣
║  Buyer   → buyer@dev.com  / password123          ║
║  Vendor  → vendor@dev.com / password123          ║
╠══════════════════════════════════════════════════╣
║  Categories   : 8  (3 top + 5 sub)               ║
║  Tags         : 5                                ║
║  Products     : 6  (4 active, 1 draft, 1 archived║
║  Variants     : 8  (tee × 6, headphones × 2)     ║
║  Addresses    : 1  (buyer default)               ║
╚══════════════════════════════════════════════════╝
`);
}

// ---------------------------------------------------------------------------
// Util: bulk-link tags to a product, ignore if tag wasn't seeded
// ---------------------------------------------------------------------------
async function linkTags(
  productId: string,
  tagNames: string[],
  tagMap: Record<string, string>,
) {
  const rows = tagNames
    .filter((n) => tagMap[n])
    .map((n) => ({ productId, tagId: tagMap[n] }));

  if (rows.length) {
    await db.insert(productTags).values(rows).onConflictDoNothing();
  }
}

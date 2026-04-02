// // // @ts-nocheck
// // "use server";
// // /**
// //  * seed.ts  —  Multi-vendor ecom dev seed
// //  *
// //  * Run with:
// //  *   npx tsx src/server/db/seed.ts
// //  *
// //  * Creates:
// //  *   • 1 buyer user  (buyer@dev.com / password123)
// //  *   • 1 vendor user (vendor@dev.com / password123)
// //  *   • 1 vendor profile + store
// //  *   • Category tree  (3 top-level → sub-categories)
// //  *   • 6 products  (mix of simple & variant, various statuses)
// //  *   • Product images, variants, tags
// //  *   • Buyer address
// //  *
// //  * Skips: orders, payments, transfers, refunds (Stripe placeholders)
// //  */

// // import { auth } from "@/server/better-auth";
// // import { db } from "@/server/db";
// // import {
// //   user,
// //   vendorProfiles,
// //   categories,
// //   products,
// //   productImages,
// //   productVariants,
// //   tags,
// //   productTags,
// //   addresses,
// // } from "@/server/db/schema";
// // import { eq, isNull } from "drizzle-orm";

// // // ---------------------------------------------------------------------------
// // // Helpers
// // // ---------------------------------------------------------------------------

// // function slug(name: string, suffix?: string) {
// //   const base = name
// //     .toLowerCase()
// //     .trim()
// //     .replace(/[^a-z0-9\s-]/g, "")
// //     .replace(/\s+/g, "-")
// //     .replace(/-+/g, "-");
// //   return suffix ? `${base}-${suffix}` : base;
// // }

// // // ---------------------------------------------------------------------------
// // // Seed
// // // ---------------------------------------------------------------------------

// // export async function main() {
// //   console.log("🌱  Starting seed...\n");

// //   // ── 1. Users via Better Auth ─────────────────────────────────────────────
// //   // signUpEmail is idempotent here: if the user already exists we just look
// //   // them up so re-runs don't blow up.

// //   const seedUsers = [
// //     { name: "Alex Buyer", email: "buyer@dev.com", password: "password123" },
// //     { name: "Sam Vendor", email: "vendor@dev.com", password: "password123" },
// //   ];

// //   const userIds: Record<string, string> = {};

// //   console.log("Creating users:");
// //   for (const u of seedUsers) {
// //     try {
// //       const res = await auth.api.signUpEmail({
// //         body: { name: u.name, email: u.email, password: u.password },
// //       });
// //       userIds[u.email] = res.user.id;
// //       console.log(`  ✓ ${u.name} (created)`);
// //     } catch {
// //       const existing = await db.query.user.findFirst({
// //         where: (t, { eq }) => eq(t.email, u.email),
// //       });
// //       if (!existing) throw new Error(`Cannot find or create user ${u.email}`);
// //       userIds[u.email] = existing.id;
// //       console.log(`  ~ ${u.name} (already exists)`);
// //     }
// //   }

// //   const buyerId = userIds["buyer@dev.com"];
// //   const vendorUserId = userIds["vendor@dev.com"];

// //   console.log("✅  Users ready");

// //   // ── 2. Vendor Profile ────────────────────────────────────────────────────

// //   const [vendorProfile] = await db
// //     .insert(vendorProfiles)
// //     .values({
// //       userId: vendorUserId,
// //       storeName: "Artisan Goods Co.",
// //       storeSlug: "artisan-goods-co",
// //       description:
// //         "Handcrafted everyday items — minimal, purposeful, built to last.",
// //       logoUrl: "https://api.dicebear.com/8.x/identicon/svg?seed=artisan",
// //       bannerUrl: "https://picsum.photos/seed/artisan-banner/1200/400",
// //       // Stripe fields left as placeholder — onboarding incomplete
// //       stripeAccountId: null,
// //       stripeOnboardingComplete: false,
// //       commissionRate: "0.10",
// //       status: "active",
// //       contactEmail: "hello@artisangoods.dev",
// //       returnPolicy:
// //         "We accept returns within 30 days of delivery for unused items in original packaging.",
// //     })
// //     .returning();

// //   console.log(
// //     `✅  Vendor profile created → store: "${vendorProfile.storeName}"`,
// //   );

// //   // ── 3. Categories (tree) ─────────────────────────────────────────────────
// //   //
// //   //  Electronics
// //   //    ├── Accessories
// //   //    └── Audio
// //   //  Clothing
// //   //    ├── Men
// //   //    └── Women
// //   //  Home & Living
// //   //    └── Kitchen

// //   const catData = [
// //     { name: "Electronics", slug: "electronics", parentId: null, sortOrder: 1 },
// //     { name: "Clothing", slug: "clothing", parentId: null, sortOrder: 2 },
// //     {
// //       name: "Home & Living",
// //       slug: "home-living",
// //       parentId: null,
// //       sortOrder: 3,
// //     },
// //   ] as const;

// //   const insertedTopLevel = await db
// //     .insert(categories)
// //     .values(catData.map((c) => ({ ...c })))
// //     .returning();

// //   const catMap: Record<string, string> = {};
// //   for (const c of insertedTopLevel) catMap[c.slug] = c.id;

// //   const subCatData = [
// //     {
// //       name: "Accessories",
// //       slug: "accessories",
// //       parentId: catMap["electronics"],
// //       sortOrder: 1,
// //     },
// //     {
// //       name: "Audio",
// //       slug: "audio",
// //       parentId: catMap["electronics"],
// //       sortOrder: 2,
// //     },
// //     { name: "Men", slug: "men", parentId: catMap["clothing"], sortOrder: 1 },
// //     {
// //       name: "Women",
// //       slug: "women",
// //       parentId: catMap["clothing"],
// //       sortOrder: 2,
// //     },
// //     {
// //       name: "Kitchen",
// //       slug: "kitchen",
// //       parentId: catMap["home-living"],
// //       sortOrder: 1,
// //     },
// //   ];

// //   const insertedSubs = await db
// //     .insert(categories)
// //     .values(subCatData)
// //     .returning();

// //   for (const c of insertedSubs) catMap[c.slug] = c.id;

// //   console.log("✅  Categories seeded (3 top-level + 5 sub-categories)");

// //   // ── 4. Tags ──────────────────────────────────────────────────────────────

// //   const tagNames = [
// //     "handmade",
// //     "eco-friendly",
// //     "bestseller",
// //     "new-arrival",
// //     "limited-edition",
// //   ];

// //   const insertedTags = await db
// //     .insert(tags)
// //     .values(tagNames.map((name) => ({ name, slug: slug(name) })))
// //     .onConflictDoNothing()
// //     .returning();

// //   const tagMap: Record<string, string> = {};
// //   for (const t of insertedTags) tagMap[t.name] = t.id;

// //   console.log(`✅  Tags seeded (${insertedTags.length} tags)`);

// //   // ── 5. Products ──────────────────────────────────────────────────────────

// //   const vendorId = vendorProfile.id;

// //   // ---------- 5a. Simple product — active ──────────────────────────────────
// //   const [woodenBowl] = await db
// //     .insert(products)
// //     .values({
// //       vendorId,
// //       categoryId: catMap["kitchen"],
// //       name: "Walnut Serving Bowl",
// //       slug: slug("Walnut Serving Bowl", "wsb01"),
// //       description:
// //         "Hand-turned from solid black walnut. Food-safe oil finish. Each bowl is unique — grain patterns vary.",
// //       basePrice: "68.00",
// //       hasVariants: false,
// //       stock: 14,
// //       status: "active",
// //       averageRating: "4.80",
// //       reviewCount: 22,
// //       totalSold: 58,
// //     })
// //     .returning();

// //   await db.insert(productImages).values([
// //     {
// //       productId: woodenBowl.id,
// //       url: "https://picsum.photos/seed/bowl1/800/800",
// //       altText: "Walnut Serving Bowl — top view",
// //       sortOrder: 0,
// //       isPrimary: true,
// //     },
// //     {
// //       productId: woodenBowl.id,
// //       url: "https://picsum.photos/seed/bowl2/800/800",
// //       altText: "Walnut Serving Bowl — side view",
// //       sortOrder: 1,
// //       isPrimary: false,
// //     },
// //   ]);

// //   await linkTags(
// //     woodenBowl.id,
// //     ["handmade", "eco-friendly", "bestseller"],
// //     tagMap,
// //   );

// //   // ---------- 5b. Variant product — active (T-shirt with size + colour) ────
// //   const [tshirt] = await db
// //     .insert(products)
// //     .values({
// //       vendorId,
// //       categoryId: catMap["men"],
// //       name: "Classic Crew Tee",
// //       slug: slug("Classic Crew Tee", "cct01"),
// //       description:
// //         "100 % organic cotton. Pre-shrunk. Relaxed fit. Screen-printed logo.",
// //       basePrice: "34.00",
// //       hasVariants: true,
// //       stock: 0, // stock lives on variants
// //       status: "active",
// //       averageRating: "4.60",
// //       reviewCount: 9,
// //       totalSold: 33,
// //     })
// //     .returning();

// //   await db.insert(productImages).values([
// //     {
// //       productId: tshirt.id,
// //       url: "https://picsum.photos/seed/tee-white/800/800",
// //       altText: "Classic Crew Tee — white",
// //       sortOrder: 0,
// //       isPrimary: true,
// //     },
// //     {
// //       productId: tshirt.id,
// //       url: "https://picsum.photos/seed/tee-black/800/800",
// //       altText: "Classic Crew Tee — black",
// //       sortOrder: 1,
// //       isPrimary: false,
// //     },
// //   ]);

// //   const tshirtVariants = [
// //     {
// //       name: "White / S",
// //       options: { color: "White", size: "S" },
// //       price: "34.00",
// //       stock: 8,
// //       sku: "CCT-WHT-S",
// //     },
// //     {
// //       name: "White / M",
// //       options: { color: "White", size: "M" },
// //       price: "34.00",
// //       stock: 12,
// //       sku: "CCT-WHT-M",
// //     },
// //     {
// //       name: "White / L",
// //       options: { color: "White", size: "L" },
// //       price: "34.00",
// //       stock: 6,
// //       sku: "CCT-WHT-L",
// //     },
// //     {
// //       name: "Black / S",
// //       options: { color: "Black", size: "S" },
// //       price: "34.00",
// //       stock: 5,
// //       sku: "CCT-BLK-S",
// //     },
// //     {
// //       name: "Black / M",
// //       options: { color: "Black", size: "M" },
// //       price: "34.00",
// //       stock: 10,
// //       sku: "CCT-BLK-M",
// //     },
// //     {
// //       name: "Black / L",
// //       options: { color: "Black", size: "L" },
// //       price: "34.00",
// //       stock: 0,
// //       sku: "CCT-BLK-L",
// //     },
// //   ];

// //   await db.insert(productVariants).values(
// //     tshirtVariants.map((v) => ({
// //       productId: tshirt.id,
// //       name: v.name,
// //       options: JSON.stringify(v.options),
// //       price: v.price,
// //       stock: v.stock,
// //       sku: v.sku,
// //     })),
// //   );

// //   await linkTags(tshirt.id, ["eco-friendly", "new-arrival"], tagMap);

// //   // ---------- 5c. Simple product — active (candle) ─────────────────────────
// //   const [candle] = await db
// //     .insert(products)
// //     .values({
// //       vendorId,
// //       categoryId: catMap["home-living"],
// //       name: "Soy Wax Pillar Candle",
// //       slug: slug("Soy Wax Pillar Candle", "swpc01"),
// //       description:
// //         "70-hour burn time. Lead-free cotton wick. Scents: cedar + vanilla.",
// //       basePrice: "22.00",
// //       hasVariants: false,
// //       stock: 40,
// //       status: "active",
// //       averageRating: "4.95",
// //       reviewCount: 41,
// //       totalSold: 120,
// //     })
// //     .returning();

// //   await db.insert(productImages).values({
// //     productId: candle.id,
// //     url: "https://picsum.photos/seed/candle1/800/800",
// //     altText: "Soy Wax Pillar Candle",
// //     sortOrder: 0,
// //     isPrimary: true,
// //   });

// //   await linkTags(candle.id, ["handmade", "bestseller"], tagMap);

// //   // ---------- 5d. Variant product — active (headphones: wired/wireless) ────
// //   const [headphones] = await db
// //     .insert(products)
// //     .values({
// //       vendorId,
// //       categoryId: catMap["audio"],
// //       name: "Studio Monitor Headphones",
// //       slug: slug("Studio Monitor Headphones", "smh01"),
// //       description:
// //         "40 mm dynamic drivers, 20 Hz–20 kHz response. Available wired or Bluetooth.",
// //       basePrice: "89.00",
// //       hasVariants: true,
// //       stock: 0,
// //       status: "active",
// //       averageRating: "4.40",
// //       reviewCount: 7,
// //       totalSold: 19,
// //     })
// //     .returning();

// //   await db.insert(productImages).values([
// //     {
// //       productId: headphones.id,
// //       url: "https://picsum.photos/seed/hp1/800/800",
// //       altText: "Studio Monitor Headphones — wired",
// //       sortOrder: 0,
// //       isPrimary: true,
// //     },
// //     {
// //       productId: headphones.id,
// //       url: "https://picsum.photos/seed/hp2/800/800",
// //       altText: "Studio Monitor Headphones — wireless",
// //       sortOrder: 1,
// //       isPrimary: false,
// //     },
// //   ]);

// //   await db.insert(productVariants).values([
// //     {
// //       productId: headphones.id,
// //       name: "Wired",
// //       options: JSON.stringify({ type: "Wired" }),
// //       price: "89.00",
// //       stock: 15,
// //       sku: "SMH-WIRED",
// //     },
// //     {
// //       productId: headphones.id,
// //       name: "Bluetooth",
// //       options: JSON.stringify({ type: "Bluetooth" }),
// //       price: "129.00",
// //       stock: 8,
// //       sku: "SMH-BT",
// //     },
// //   ]);

// //   await linkTags(headphones.id, ["new-arrival", "limited-edition"], tagMap);

// //   // ---------- 5e. Draft product (not published yet) ────────────────────────
// //   const [draftProduct] = await db
// //     .insert(products)
// //     .values({
// //       vendorId,
// //       categoryId: catMap["accessories"],
// //       name: "Leather Card Wallet",
// //       slug: slug("Leather Card Wallet", "lcw01"),
// //       description:
// //         "Full-grain vegetable-tanned leather. Holds 6 cards + cash slot. Ages beautifully.",
// //       basePrice: "45.00",
// //       hasVariants: false,
// //       stock: 0,
// //       status: "draft",
// //     })
// //     .returning();

// //   await db.insert(productImages).values({
// //     productId: draftProduct.id,
// //     url: "https://picsum.photos/seed/wallet1/800/800",
// //     altText: "Leather Card Wallet",
// //     sortOrder: 0,
// //     isPrimary: true,
// //   });

// //   await linkTags(draftProduct.id, ["handmade", "limited-edition"], tagMap);

// //   // ---------- 5f. Archived product ─────────────────────────────────────────
// //   await db.insert(products).values({
// //     vendorId,
// //     categoryId: catMap["kitchen"],
// //     name: "Bamboo Cutting Board (Discontinued)",
// //     slug: slug("Bamboo Cutting Board", "bcb-old"),
// //     description: "No longer in production.",
// //     basePrice: "38.00",
// //     hasVariants: false,
// //     stock: 0,
// //     status: "archived",
// //     totalSold: 210,
// //   });

// //   console.log("✅  Products seeded (4 active, 1 draft, 1 archived)");

// //   // ── 6. Buyer address ─────────────────────────────────────────────────────

// //   await db.insert(addresses).values({
// //     userId: buyerId,
// //     fullName: "Alex Buyer",
// //     line1: "42 Maple Street",
// //     line2: "Apt 3B",
// //     city: "Brooklyn",
// //     state: "NY",
// //     postalCode: "11201",
// //     country: "US",
// //     phone: "+1-555-010-2020",
// //     isDefault: true,
// //   });

// //   console.log("✅  Buyer address seeded");

// //   // ── Done ─────────────────────────────────────────────────────────────────

// //   console.log(`
// // ╔══════════════════════════════════════════════════╗
// // ║              Seed complete 🎉                    ║
// // ╠══════════════════════════════════════════════════╣
// // ║  Buyer   → buyer@dev.com  / password123          ║
// // ║  Vendor  → vendor@dev.com / password123          ║
// // ╠══════════════════════════════════════════════════╣
// // ║  Categories   : 8  (3 top + 5 sub)               ║
// // ║  Tags         : 5                                ║
// // ║  Products     : 6  (4 active, 1 draft, 1 archived║
// // ║  Variants     : 8  (tee × 6, headphones × 2)     ║
// // ║  Addresses    : 1  (buyer default)               ║
// // ╚══════════════════════════════════════════════════╝
// // `);
// // }

// // // ---------------------------------------------------------------------------
// // // Util: bulk-link tags to a product, ignore if tag wasn't seeded
// // // ---------------------------------------------------------------------------
// // async function linkTags(
// //   productId: string,
// //   tagNames: string[],
// //   tagMap: Record<string, string>,
// // ) {
// //   const rows = tagNames
// //     .filter((n) => tagMap[n])
// //     .map((n) => ({ productId, tagId: tagMap[n] }));

// //   if (rows.length) {
// //     await db.insert(productTags).values(rows).onConflictDoNothing();
// //   }
// // }

// "use server";
// // scripts/seed-vendor-catalog.ts
// import { db } from "@/server/db";
// import {
//   categories,
//   productImages,
//   products,
//   productTags,
//   tags,
//   vendorProfiles,
// } from "@/server/db/schema";
// import { eq, inArray } from "drizzle-orm";

// // Adjust these imports to match your project structure

// type CategorySeed = {
//   name: string;
//   slug: string;
//   sortOrder: number;
// };

// type TagSeed = {
//   name: string;
//   slug: string;
// };

// type ProductSeed = {
//   name: string;
//   categorySlug: string;
//   basePrice: string;
//   stock: number;
//   description: string;
//   tagSlugs: string[];
//   imageQuery: string;
// };

// const categorySeeds: CategorySeed[] = [
//   { name: "Electronics", slug: "electronics", sortOrder: 1 },
//   { name: "Fashion", slug: "fashion", sortOrder: 2 },
//   { name: "Home & Kitchen", slug: "home-kitchen", sortOrder: 3 },
//   { name: "Beauty", slug: "beauty", sortOrder: 4 },
//   { name: "Sports", slug: "sports", sortOrder: 5 },
//   { name: "Books", slug: "books", sortOrder: 6 },
//   { name: "Toys", slug: "toys", sortOrder: 7 },
//   { name: "Grocery", slug: "grocery", sortOrder: 8 },
//   { name: "Automotive", slug: "automotive", sortOrder: 9 },
//   { name: "Pet Supplies", slug: "pet-supplies", sortOrder: 10 },
//   { name: "Office Supplies", slug: "office-supplies", sortOrder: 11 },
//   { name: "Baby", slug: "baby", sortOrder: 12 },
//   { name: "Health", slug: "health", sortOrder: 13 },
//   { name: "Tools", slug: "tools", sortOrder: 14 },
//   { name: "Garden", slug: "garden", sortOrder: 15 },
//   { name: "Travel", slug: "travel", sortOrder: 16 },
//   { name: "Musical Instruments", slug: "musical-instruments", sortOrder: 17 },
//   { name: "Gaming", slug: "gaming", sortOrder: 18 },
//   { name: "Jewelry", slug: "jewelry", sortOrder: 19 },
//   { name: "Footwear", slug: "footwear", sortOrder: 20 },
//   { name: "Watches", slug: "watches", sortOrder: 21 },
// ];

// const tagSeeds: TagSeed[] = [
//   { name: "Wireless", slug: "wireless" },
//   { name: "Premium", slug: "premium" },
//   { name: "Compact", slug: "compact" },
//   { name: "Portable", slug: "portable" },
//   { name: "Eco Friendly", slug: "eco-friendly" },
//   { name: "Best Seller", slug: "best-seller" },
//   { name: "New Arrival", slug: "new-arrival" },
//   { name: "Durable", slug: "durable" },
//   { name: "Minimal", slug: "minimal" },
//   { name: "Gift Idea", slug: "gift-idea" },
//   { name: "Comfort", slug: "comfort" },
//   { name: "Fitness", slug: "fitness" },
//   { name: "Healthy", slug: "healthy" },
//   { name: "Organic", slug: "organic" },
//   { name: "Performance", slug: "performance" },
//   { name: "Professional", slug: "professional" },
//   { name: "Smart", slug: "smart" },
//   { name: "Home Essential", slug: "home-essential" },
//   { name: "Kitchen", slug: "kitchen" },
//   { name: "Travel Gear", slug: "travel-gear" },
//   { name: "Giftable", slug: "giftable" },
//   { name: "Everyday Use", slug: "everyday-use" },
//   { name: "Stylish", slug: "stylish" },
//   { name: "Modern", slug: "modern" },
//   { name: "Outdoor", slug: "outdoor" },
//   { name: "Office", slug: "office" },
//   { name: "Audio", slug: "audio" },
//   { name: "Gaming", slug: "gaming" },
//   { name: "Baby Care", slug: "baby-care" },
//   { name: "Pet Care", slug: "pet-care" },
//   { name: "Gift Ready", slug: "gift-ready" },
// ];

// const productSeeds: ProductSeed[] = [
//   // Electronics
//   {
//     name: "Sony WH-1000XM5 Wireless Headphones",
//     categorySlug: "electronics",
//     basePrice: "349.99",
//     stock: 28,
//     description:
//       "Noise-cancelling wireless headphones with long battery life and premium sound.",
//     tagSlugs: ["wireless", "premium", "audio", "smart"],
//     imageQuery: "wireless headphones",
//   },
//   {
//     name: "Apple Watch Series Style Smartwatch",
//     categorySlug: "electronics",
//     basePrice: "299.99",
//     stock: 18,
//     description:
//       "A sleek smartwatch for tracking fitness, notifications, and everyday productivity.",
//     tagSlugs: ["smart", "fitness", "premium", "modern"],
//     imageQuery: "smartwatch",
//   },
//   {
//     name: "Bluetooth Portable Speaker",
//     categorySlug: "electronics",
//     basePrice: "79.99",
//     stock: 40,
//     description:
//       "Compact portable speaker with rich sound for home, travel, and outdoor use.",
//     tagSlugs: ["wireless", "portable", "compact", "audio"],
//     imageQuery: "portable bluetooth speaker",
//   },

//   // Fashion
//   {
//     name: "Classic Denim Jacket",
//     categorySlug: "fashion",
//     basePrice: "64.99",
//     stock: 35,
//     description:
//       "A versatile denim jacket that works with casual and streetwear looks.",
//     tagSlugs: ["stylish", "everyday-use", "modern", "giftable"],
//     imageQuery: "denim jacket",
//   },
//   {
//     name: "Linen Button-Up Shirt",
//     categorySlug: "fashion",
//     basePrice: "49.99",
//     stock: 42,
//     description:
//       "Breathable linen shirt designed for warm weather and relaxed styling.",
//     tagSlugs: ["comfort", "minimal", "stylish", "everyday-use"],
//     imageQuery: "linen shirt",
//   },
//   {
//     name: "Crossbody Sling Bag",
//     categorySlug: "fashion",
//     basePrice: "39.99",
//     stock: 55,
//     description:
//       "A compact crossbody bag for daily essentials, travel, and city use.",
//     tagSlugs: ["compact", "portable", "stylish", "travel-gear"],
//     imageQuery: "crossbody bag",
//   },

//   // Home & Kitchen
//   {
//     name: "Programmable Coffee Maker",
//     categorySlug: "home-kitchen",
//     basePrice: "89.99",
//     stock: 22,
//     description:
//       "A convenient coffee maker for fresh brews at home every morning.",
//     tagSlugs: ["kitchen", "home-essential", "everyday-use", "modern"],
//     imageQuery: "coffee maker",
//   },
//   {
//     name: "Air Fryer",
//     categorySlug: "home-kitchen",
//     basePrice: "119.99",
//     stock: 16,
//     description:
//       "A family-friendly air fryer for quick, crispy meals with less oil.",
//     tagSlugs: ["kitchen", "healthy", "home-essential", "popular"],
//     imageQuery: "air fryer",
//   },
//   {
//     name: "Microfiber Bed Sheet Set",
//     categorySlug: "home-kitchen",
//     basePrice: "34.99",
//     stock: 60,
//     description:
//       "Soft, durable sheet set made for comfort and easy maintenance.",
//     tagSlugs: ["comfort", "home-essential", "everyday-use", "durable"],
//     imageQuery: "bed sheets",
//   },

//   // Beauty
//   {
//     name: "Vitamin C Face Serum",
//     categorySlug: "beauty",
//     basePrice: "24.99",
//     stock: 48,
//     description:
//       "A brightening serum for daily skincare routines and healthy-looking skin.",
//     tagSlugs: ["healthy", "minimal", "new-arrival", "giftable"],
//     imageQuery: "face serum",
//   },
//   {
//     name: "Protective Daily Sunscreen",
//     categorySlug: "beauty",
//     basePrice: "19.99",
//     stock: 65,
//     description: "Lightweight sunscreen for everyday face and body protection.",
//     tagSlugs: ["healthy", "everyday-use", "minimal", "premium"],
//     imageQuery: "sunscreen bottle",
//   },

//   // Sports
//   {
//     name: "Yoga Mat",
//     categorySlug: "sports",
//     basePrice: "29.99",
//     stock: 50,
//     description:
//       "Non-slip yoga mat for workouts, stretching, and home exercise.",
//     tagSlugs: ["fitness", "comfort", "portable", "outdoor"],
//     imageQuery: "yoga mat",
//   },
//   {
//     name: "Adjustable Dumbbells",
//     categorySlug: "sports",
//     basePrice: "149.99",
//     stock: 14,
//     description:
//       "Space-saving adjustable dumbbells for strength training at home.",
//     tagSlugs: ["fitness", "performance", "durable", "home-essential"],
//     imageQuery: "dumbbells",
//   },
//   {
//     name: "Running Hydration Belt",
//     categorySlug: "sports",
//     basePrice: "24.99",
//     stock: 33,
//     description:
//       "Lightweight belt with room for water and essentials during runs.",
//     tagSlugs: ["fitness", "portable", "outdoor", "performance"],
//     imageQuery: "running belt",
//   },

//   // Books
//   {
//     name: "Hardcover Productivity Planner",
//     categorySlug: "books",
//     basePrice: "18.99",
//     stock: 70,
//     description:
//       "A practical planner for daily goals, habits, and weekly structure.",
//     tagSlugs: ["office", "minimal", "giftable", "everyday-use"],
//     imageQuery: "planner notebook",
//   },
//   {
//     name: "Modern Home Cookbook",
//     categorySlug: "books",
//     basePrice: "26.99",
//     stock: 32,
//     description:
//       "A cookbook packed with easy meals and practical kitchen inspiration.",
//     tagSlugs: ["kitchen", "giftable", "home-essential", "modern"],
//     imageQuery: "cookbook",
//   },

//   // Toys
//   {
//     name: "Building Blocks Set",
//     categorySlug: "toys",
//     basePrice: "39.99",
//     stock: 44,
//     description:
//       "Creative building blocks set for imaginative play and learning.",
//     tagSlugs: ["giftable", "durable", "new-arrival", "family"],
//     imageQuery: "building blocks",
//   },
//   {
//     name: "Family Board Game",
//     categorySlug: "toys",
//     basePrice: "29.99",
//     stock: 38,
//     description:
//       "A fun board game for game night, family time, and gatherings.",
//     tagSlugs: ["gift idea", "giftable", "family", "best-seller"],
//     imageQuery: "board game",
//   },

//   // Grocery
//   {
//     name: "Extra Virgin Olive Oil",
//     categorySlug: "grocery",
//     basePrice: "17.99",
//     stock: 80,
//     description: "Kitchen staple for cooking, dressing, and healthy meal prep.",
//     tagSlugs: ["organic", "healthy", "kitchen", "everyday-use"],
//     imageQuery: "olive oil bottle",
//   },
//   {
//     name: "Premium Roasted Coffee Beans",
//     categorySlug: "grocery",
//     basePrice: "22.99",
//     stock: 68,
//     description: "Fresh roasted beans for a rich and aromatic coffee routine.",
//     tagSlugs: ["premium", "kitchen", "everyday-use", "giftable"],
//     imageQuery: "coffee beans",
//   },

//   // Automotive
//   {
//     name: "Portable Tire Inflator",
//     categorySlug: "automotive",
//     basePrice: "54.99",
//     stock: 27,
//     description:
//       "Compact tire inflator for emergencies, road trips, and maintenance.",
//     tagSlugs: ["portable", "durable", "travel-gear", "everyday-use"],
//     imageQuery: "tire inflator",
//   },
//   {
//     name: "Car Phone Mount",
//     categorySlug: "automotive",
//     basePrice: "19.99",
//     stock: 58,
//     description:
//       "Easy-to-use mount for safer navigation and hands-free driving.",
//     tagSlugs: ["compact", "portable", "modern", "everyday-use"],
//     imageQuery: "car phone mount",
//   },

//   // Pet Supplies
//   {
//     name: "Orthopedic Dog Bed",
//     categorySlug: "pet-supplies",
//     basePrice: "74.99",
//     stock: 19,
//     description: "Supportive dog bed designed for comfort and joint relief.",
//     tagSlugs: ["pet-care", "comfort", "durable", "premium"],
//     imageQuery: "dog bed",
//   },
//   {
//     name: "Cat Litter Box",
//     categorySlug: "pet-supplies",
//     basePrice: "34.99",
//     stock: 41,
//     description:
//       "Practical litter box with easy cleaning and everyday convenience.",
//     tagSlugs: ["pet-care", "everyday-use", "durable", "home-essential"],
//     imageQuery: "cat litter box",
//   },

//   // Office Supplies
//   {
//     name: "LED Desk Lamp",
//     categorySlug: "office-supplies",
//     basePrice: "27.99",
//     stock: 46,
//     description:
//       "Adjustable LED desk lamp for study, work, and late-night tasks.",
//     tagSlugs: ["office", "modern", "minimal", "everyday-use"],
//     imageQuery: "desk lamp",
//   },
//   {
//     name: "Premium Notebook Set",
//     categorySlug: "office-supplies",
//     basePrice: "21.99",
//     stock: 75,
//     description: "A clean notebook set for notes, planning, and journaling.",
//     tagSlugs: ["office", "minimal", "giftable", "everyday-use"],
//     imageQuery: "notebook set",
//   },
//   {
//     name: "Wireless Mouse",
//     categorySlug: "office-supplies",
//     basePrice: "24.99",
//     stock: 54,
//     description:
//       "Responsive wireless mouse for work, study, and travel setups.",
//     tagSlugs: ["wireless", "office", "portable", "modern"],
//     imageQuery: "wireless mouse",
//   },

//   // Baby
//   {
//     name: "Smart Baby Monitor",
//     categorySlug: "baby",
//     basePrice: "129.99",
//     stock: 12,
//     description: "Baby monitor with clear video and peace of mind for parents.",
//     tagSlugs: ["baby-care", "smart", "premium", "modern"],
//     imageQuery: "baby monitor",
//   },
//   {
//     name: "Feeding Bottle Set",
//     categorySlug: "baby",
//     basePrice: "16.99",
//     stock: 64,
//     description: "Easy-clean feeding bottle set for everyday baby care.",
//     tagSlugs: ["baby-care", "everyday-use", "durable", "home-essential"],
//     imageQuery: "baby bottle",
//   },

//   // Health
//   {
//     name: "Fitness Tracker Band",
//     categorySlug: "health",
//     basePrice: "49.99",
//     stock: 31,
//     description:
//       "Simple health tracker for steps, activity, and daily progress.",
//     tagSlugs: ["fitness", "smart", "healthy", "modern"],
//     imageQuery: "fitness tracker",
//   },
//   {
//     name: "Posture Corrector",
//     categorySlug: "health",
//     basePrice: "29.99",
//     stock: 29,
//     description:
//       "Wearable posture support for daily comfort and better alignment.",
//     tagSlugs: ["healthy", "comfort", "everyday-use", "minimal"],
//     imageQuery: "posture corrector",
//   },

//   // Tools
//   {
//     name: "Cordless Drill",
//     categorySlug: "tools",
//     basePrice: "89.99",
//     stock: 23,
//     description: "Powerful cordless drill for home repairs and DIY projects.",
//     tagSlugs: ["performance", "durable", "professional", "everyday-use"],
//     imageQuery: "cordless drill",
//   },
//   {
//     name: "Screwdriver Set",
//     categorySlug: "tools",
//     basePrice: "24.99",
//     stock: 52,
//     description:
//       "Multi-piece screwdriver set for household fixes and workshops.",
//     tagSlugs: ["durable", "home-essential", "everyday-use", "professional"],
//     imageQuery: "screwdriver set",
//   },
//   {
//     name: "Tape Measure",
//     categorySlug: "tools",
//     basePrice: "12.99",
//     stock: 85,
//     description:
//       "Reliable tape measure for construction, crafts, and home projects.",
//     tagSlugs: ["durable", "compact", "everyday-use", "professional"],
//     imageQuery: "tape measure",
//   },

//   // Garden
//   {
//     name: "Decorative Watering Can",
//     categorySlug: "garden",
//     basePrice: "18.99",
//     stock: 47,
//     description: "Stylish watering can for indoor plants and garden care.",
//     tagSlugs: ["outdoor", "minimal", "everyday-use", "stylish"],
//     imageQuery: "watering can",
//   },
//   {
//     name: "Plant Pot Set",
//     categorySlug: "garden",
//     basePrice: "26.99",
//     stock: 39,
//     description: "Set of plant pots for home gardening and decor.",
//     tagSlugs: ["outdoor", "home-essential", "minimal", "giftable"],
//     imageQuery: "plant pots",
//   },

//   // Travel
//   {
//     name: "Carry-On Luggage",
//     categorySlug: "travel",
//     basePrice: "119.99",
//     stock: 21,
//     description:
//       "Durable carry-on suitcase built for short trips and weekend travel.",
//     tagSlugs: ["travel-gear", "portable", "durable", "premium"],
//     imageQuery: "carry on luggage",
//   },
//   {
//     name: "Memory Foam Neck Pillow",
//     categorySlug: "travel",
//     basePrice: "24.99",
//     stock: 63,
//     description:
//       "Comfortable neck pillow for flights, road trips, and long commutes.",
//     tagSlugs: ["travel-gear", "comfort", "portable", "giftable"],
//     imageQuery: "neck pillow",
//   },

//   // Musical Instruments
//   {
//     name: "Acoustic Guitar",
//     categorySlug: "musical-instruments",
//     basePrice: "179.99",
//     stock: 11,
//     description:
//       "Beginner-friendly acoustic guitar with warm sound and classic style.",
//     tagSlugs: ["giftable", "premium", "performance", "modern"],
//     imageQuery: "acoustic guitar",
//   },
//   {
//     name: "Ukulele",
//     categorySlug: "musical-instruments",
//     basePrice: "49.99",
//     stock: 26,
//     description: "Portable ukulele for beginners, travel, and casual practice.",
//     tagSlugs: ["portable", "giftable", "compact", "stylish"],
//     imageQuery: "ukulele",
//   },

//   // Gaming
//   {
//     name: "Wireless Game Controller",
//     categorySlug: "gaming",
//     basePrice: "59.99",
//     stock: 37,
//     description: "Comfortable wireless controller for console and PC gaming.",
//     tagSlugs: ["wireless", "gaming", "performance", "modern"],
//     imageQuery: "game controller",
//   },
//   {
//     name: "RGB Gaming Headset",
//     categorySlug: "gaming",
//     basePrice: "69.99",
//     stock: 24,
//     description:
//       "Immersive gaming headset with clear audio and a comfortable fit.",
//     tagSlugs: ["gaming", "audio", "premium", "performance"],
//     imageQuery: "gaming headset",
//   },
//   {
//     name: "Large Gaming Mouse Pad",
//     categorySlug: "gaming",
//     basePrice: "19.99",
//     stock: 71,
//     description:
//       "Smooth mouse pad for better desk control and gaming setup comfort.",
//     tagSlugs: ["gaming", "office", "modern", "minimal"],
//     imageQuery: "gaming mouse pad",
//   },

//   // Jewelry
//   {
//     name: "Silver Pendant Necklace",
//     categorySlug: "jewelry",
//     basePrice: "44.99",
//     stock: 15,
//     description: "Simple pendant necklace for everyday wear or gifting.",
//     tagSlugs: ["stylish", "giftable", "premium", "minimal"],
//     imageQuery: "silver necklace",
//   },
//   {
//     name: "Stud Earrings",
//     categorySlug: "jewelry",
//     basePrice: "29.99",
//     stock: 20,
//     description: "Minimal stud earrings with a clean everyday look.",
//     tagSlugs: ["minimal", "stylish", "gift ready", "premium"],
//     imageQuery: "stud earrings",
//   },

//   // Footwear
//   {
//     name: "Running Shoes",
//     categorySlug: "footwear",
//     basePrice: "89.99",
//     stock: 33,
//     description: "Lightweight running shoes built for comfort and performance.",
//     tagSlugs: ["fitness", "comfort", "performance", "sport"],
//     imageQuery: "running shoes",
//   },
//   {
//     name: "Slip-On Casual Sneakers",
//     categorySlug: "footwear",
//     basePrice: "59.99",
//     stock: 47,
//     description: "Easy slip-on shoes for everyday wear and casual outings.",
//     tagSlugs: ["comfort", "everyday-use", "stylish", "minimal"],
//     imageQuery: "casual sneakers",
//   },
//   {
//     name: "Leather Loafers",
//     categorySlug: "footwear",
//     basePrice: "99.99",
//     stock: 19,
//     description: "Classic loafers for smart-casual and office-ready outfits.",
//     tagSlugs: ["stylish", "premium", "professional", "giftable"],
//     imageQuery: "leather loafers",
//   },

//   // Watches
//   {
//     name: "Minimal Analog Watch",
//     categorySlug: "watches",
//     basePrice: "79.99",
//     stock: 27,
//     description: "Clean analog watch with a timeless everyday design.",
//     tagSlugs: ["minimal", "stylish", "giftable", "premium"],
//     imageQuery: "analog watch",
//   },
//   {
//     name: "Sport Digital Watch",
//     categorySlug: "watches",
//     basePrice: "64.99",
//     stock: 34,
//     description:
//       "Durable digital watch with sport-focused features and a bold look.",
//     tagSlugs: ["sport", "performance", "durable", "modern"],
//     imageQuery: "digital sports watch",
//   },
// ];

// function slugify(value: string) {
//   return value
//     .toLowerCase()
//     .trim()
//     .replace(/&/g, "and")
//     .replace(/['".]/g, "")
//     .replace(/[^a-z0-9]+/g, "-")
//     .replace(/^-+|-+$/g, "");
// }

// // function imageFor(query: string) {
// //   // Public query-based image source.
// //   // Replace with your own product CDN/S3/Cloudinary URLs for exact SKU photos.
// //   return `https://source.unsplash.com/featured/1200x900/?${encodeURIComponent(
// //     query,
// //   )}`;
// // }

// function imageFor(query: string, seed: string) {
//   return `https://picsum.photos/seed/${encodeURIComponent(seed)}/1200/900`;
// }

// export async function seedVendorCatalog(vendorId: string) {
//   return db.transaction(async (tx) => {
//     const vendor = await tx.query.vendorProfiles.findFirst({
//       where: eq(vendorProfiles.id, vendorId),
//     });

//     if (!vendor) {
//       throw new Error(`Vendor not found: ${vendorId}`);
//     }

//     // 1) Categories
//     await tx.insert(categories).values(categorySeeds).onConflictDoNothing();

//     const categoryRows = await tx
//       .select({
//         id: categories.id,
//         slug: categories.slug,
//       })
//       .from(categories)
//       .where(
//         inArray(
//           categories.slug,
//           categorySeeds.map((c) => c.slug),
//         ),
//       );

//     const categoryMap = new Map(categoryRows.map((c) => [c.slug, c.id]));

//     // 2) Tags
//     await tx.insert(tags).values(tagSeeds).onConflictDoNothing();

//     const tagRows = await tx
//       .select({
//         id: tags.id,
//         slug: tags.slug,
//       })
//       .from(tags)
//       .where(
//         inArray(
//           tags.slug,
//           tagSeeds.map((t) => t.slug),
//         ),
//       );

//     const tagMap = new Map(tagRows.map((t) => [t.slug, t.id]));

//     // 3) Products
//     const productValues = productSeeds.map((p) => ({
//       vendorId,
//       categoryId: categoryMap.get(p.categorySlug) ?? null,
//       name: p.name,
//       slug: slugify(p.name),
//       description: p.description,
//       basePrice: p.basePrice,
//       hasVariants: false,
//       stock: p.stock,
//       status: "active" as const,
//     }));

//     await tx.insert(products).values(productValues).onConflictDoNothing();

//     const productRows = await tx
//       .select({
//         id: products.id,
//         slug: products.slug,
//       })
//       .from(products)
//       .where(
//         inArray(
//           products.slug,
//           productValues.map((p) => p.slug),
//         ),
//       );

//     const productMap = new Map(productRows.map((p) => [p.slug, p.id]));
//     const productIds = productRows.map((p) => p.id);

//     // 4) Clean and re-seed images/tags for these products
//     if (productIds.length > 0) {
//       await tx
//         .delete(productImages)
//         .where(inArray(productImages.productId, productIds));
//       await tx
//         .delete(productTags)
//         .where(inArray(productTags.productId, productIds));
//     }

//     // 5) Product images + product tags
//     const imageValues: Array<{
//       productId: string;
//       url: string;
//       altText: string | null;
//       sortOrder: number;
//       isPrimary: boolean;
//       key: string | null;
//     }> = [];

//     const productTagValues: Array<{
//       productId: string;
//       tagId: string;
//     }> = [];

//     for (const seed of productSeeds) {
//       const productId = productMap.get(slugify(seed.name));
//       if (!productId) continue;

//       imageValues.push({
//         productId,
//         url: imageFor(seed.imageQuery, seed.name),
//         altText: seed.name,
//         sortOrder: 0,
//         isPrimary: true,
//         key: null,
//       });

//       for (const tagSlug of seed.tagSlugs) {
//         const tagId = tagMap.get(tagSlug);
//         if (!tagId) continue;
//         productTagValues.push({ productId, tagId });
//       }
//     }

//     if (imageValues.length > 0) {
//       await tx.insert(productImages).values(imageValues);
//     }

//     if (productTagValues.length > 0) {
//       await tx
//         .insert(productTags)
//         .values(productTagValues)
//         .onConflictDoNothing();
//     }

//     return {
//       vendorId,
//       categoriesInserted: categorySeeds.length,
//       tagsInserted: tagSeeds.length,
//       productsInserted: productValues.length,
//       imagesInserted: imageValues.length,
//       productTagsInserted: productTagValues.length,
//     };
//   });
// }

// // Optional direct runner for local use
// export async function seed(vendorId: string) {
//   // const vendorId = process.argv[2];
//   if (!vendorId) {
//     throw new Error("Usage: tsx scripts/seed-vendor-catalog.ts <vendorId>");
//   }

//   const result = await seedVendorCatalog(vendorId);
//   console.log("Seed completed:", result);
// }

// // if (process.argv[1]?.includes("seed-vendor-catalog")) {
// //   main()
// //     .then(() => process.exit(0))
// //     .catch((error) => {
// //       console.error(error);
// //       process.exit(1);
// //     });
// // }
"use server";
import { db } from "@/server/db";
import {
  categories,
  tags,
  products,
  productImages,
  productTags,
} from "@/server/db/schema";
import { faker } from "@faker-js/faker";
import slugify from "slugify";

// --- 1. CONFIGURATION & REALISTIC DATA DICTIONARIES ---

const VENDORS = [
  "0c76469b-cf5f-4aee-a25f-fa49333b2404",
  "d61f0fbf-568a-414c-a312-6edb51ea7daa",
];

const PRODUCTS_PER_VENDOR = 500;
const BATCH_SIZE = 100;

const REAL_CATEGORIES = [
  "Electronics",
  "Home & Kitchen",
  "Men's Clothing",
  "Women's Clothing",
  "Sports & Outdoors",
  "Beauty & Personal Care",
  "Books",
  "Toys & Games",
  "Health & Household",
  "Automotive",
  "Grocery",
  "Pet Supplies",
  "Office Products",
  "Tools & Home Improvement",
  "Garden & Outdoor",
  "Baby Products",
  "Musical Instruments",
  "Industrial & Scientific",
  "Arts, Crafts & Sewing",
  "Video Games",
];

const REAL_TAGS = [
  "Wireless",
  "Bluetooth",
  "Smart",
  "Eco-Friendly",
  "Organic",
  "Vegan",
  "Handmade",
  "Vintage",
  "Waterproof",
  "Portable",
  "Durable",
  "Lightweight",
  "Ergonomic",
  "Bestseller",
  "New Arrival",
  "Limited Edition",
  "Clearance",
  "Sale",
  "Premium",
  "Budget",
  "Kids",
  "Adults",
  "Unisex",
  "Mens",
  "Womens",
  "Tech",
  "Gaming",
  "Fitness",
  "Travel",
  "Home",
];

// Mapping categories to realistic base product names
const PRODUCT_TEMPLATES: Record<string, string[]> = {
  Electronics: [
    "Wireless Headphones",
    "4K Smart TV",
    "Bluetooth Speaker",
    "Gaming Mouse",
    "Mechanical Keyboard",
    "Smartphone",
    "Tablet",
    "Power Bank",
  ],
  "Home & Kitchen": [
    "Coffee Maker",
    "Air Fryer",
    "Blender",
    "Robot Vacuum",
    "Ceramic Cookware Set",
    "Memory Foam Pillow",
    "Desk Lamp",
  ],
  "Men's Clothing": [
    "Classic Cotton T-Shirt",
    "Slim Fit Jeans",
    "Leather Jacket",
    "Running Shoes",
    "Winter Beanie",
    "Polo Shirt",
  ],
  "Women's Clothing": [
    "Floral Summer Dress",
    "Yoga Leggings",
    "Denim Jacket",
    "Ankle Boots",
    "Silk Blouse",
    "Wool Coat",
  ],
  "Sports & Outdoors": [
    "Yoga Mat",
    "Dumbbell Set",
    "Camping Tent",
    "Sleeping Bag",
    "Water Bottle",
    "Resistance Bands",
    "Hiking Backpack",
  ],
  "Beauty & Personal Care": [
    "Vitamin C Serum",
    "Moisturizing Lotion",
    "Matte Lipstick",
    "Eyeshadow Palette",
    "Hair Dryer",
    "Beard Oil",
  ],
  "Video Games": [
    "Wireless Controller",
    "Gaming Headset",
    "Console Charging Station",
    "Mechanical Switch Tester",
    "VR Headset",
  ],
  // Fallback for others
  default: [
    "Premium Product",
    "Essential Item",
    "Luxury Goods",
    "Everyday Basic",
    "Pro Edition",
  ],
};

// --- 2. HELPER FUNCTIONS ---

const generateSlug = (name: string) => {
  return slugify(`${name}-${faker.string.alphanumeric(6)}`, {
    lower: true,
    strict: true,
  });
};

const getRandomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// --- 3. MAIN SEED FUNCTION ---

export async function seedProducts() {
  console.log("🌱 Starting realistic product seed...");

  try {
    // 1. Seed Categories
    console.log("📦 Seeding Categories...");
    const categoryInserts = REAL_CATEGORIES.map((name) => ({
      name,
      slug: generateSlug(name),
      sortOrder: faker.number.int({ min: 0, max: 100 }),
    }));
    const insertedCategories = await db
      .insert(categories)
      .values(categoryInserts)
      .returning({ id: categories.id, name: categories.name })
      .onConflictDoNothing();

    // 2. Seed Tags
    console.log("🏷️ Seeding Tags...");
    const tagInserts = REAL_TAGS.map((name) => ({
      name,
      slug: generateSlug(name),
    }));
    const insertedTags = await db
      .insert(tags)
      .values(tagInserts)
      .returning({ id: tags.id })
      .onConflictDoNothing();

    // 3. Seed Products per Vendor
    for (const vendorId of VENDORS) {
      console.log(`\n🏪 Seeding products for vendor: ${vendorId}`);

      let vendorProductCount = 0;

      // Process in batches to avoid overwhelming the database
      while (vendorProductCount < PRODUCTS_PER_VENDOR) {
        const batchSize = Math.min(
          BATCH_SIZE,
          PRODUCTS_PER_VENDOR - vendorProductCount,
        );

        const productsBatch = [];
        const imagesBatch = [];
        const productTagsBatch = [];

        // Generate Batch Data
        for (let i = 0; i < batchSize; i++) {
          const category = faker.helpers.arrayElement(insertedCategories);
          const templateList =
            PRODUCT_TEMPLATES[category.name] || PRODUCT_TEMPLATES["default"];
          const baseName = faker.helpers.arrayElement(templateList);

          // Make name unique (e.g., "Wireless Headphones V2 Pro")
          const adjective = faker.commerce.productAdjective();
          const suffix = faker.helpers.arrayElement([
            "Pro",
            "Max",
            "Ultra",
            "Lite",
            "V2",
            "Plus",
            "Essential",
            "Premium",
          ]);
          const productName = `${adjective} ${baseName} ${suffix}`;

          const productId = faker.string.uuid();

          // Construct Product
          productsBatch.push({
            id: productId,
            vendorId: vendorId,
            categoryId: category.id,
            name: productName,
            slug: generateSlug(productName),
            description: faker.commerce.productDescription(),
            basePrice: faker.commerce.price({ min: 10, max: 1000, dec: 2 }),
            hasVariants: false,
            stock: faker.number.int({ min: 0, max: 500 }),
            status: "active" as const,
            averageRating: faker.number
              .float({ min: 3.0, max: 5.0, fractionDigits: 2 })
              .toString(),
            reviewCount: faker.number.int({ min: 0, max: 200 }),
            totalSold: faker.number.int({ min: 0, max: 1000 }),
          });

          // Construct 1-3 Images for this product
          const imageCount = faker.number.int({ min: 1, max: 3 });
          const keyword = encodeURIComponent(
            baseName?.split(" ")[0].toLowerCase(),
          );
          for (let imgIdx = 0; imgIdx < imageCount; imgIdx++) {
            imagesBatch.push({
              productId: productId,
              // Using loremflickr with a keyword based on the product name for realism
              url: `https://loremflickr.com/800/800/${keyword}?lock=${faker.number.int({ min: 1, max: 1000 })}`,
              altText: `${productName} image ${imgIdx + 1}`,
              sortOrder: imgIdx,
              isPrimary: imgIdx === 0,
            });
          }

          // Construct 2-4 Tags for this product
          const selectedTags = getRandomItems(
            insertedTags,
            faker.number.int({ min: 2, max: 4 }),
          );
          for (const tag of selectedTags) {
            productTagsBatch.push({
              productId: productId,
              tagId: tag.id,
            });
          }
        }

        // Insert Batch into DB sequentially to respect foreign key constraints
        await db.insert(products).values(productsBatch);
        await db.insert(productImages).values(imagesBatch);
        await db.insert(productTags).values(productTagsBatch);

        vendorProductCount += batchSize;
        console.log(
          `   ...inserted ${vendorProductCount}/${PRODUCTS_PER_VENDOR} products.`,
        );
      }
    }

    console.log("\n✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
  }
}

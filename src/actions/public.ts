"use server";

import { cacheWrap } from "@/lib/cache-helpers";
import {
  categoryKeys,
  productKeys,
  vendorKeys,
  type ProductFilters,
} from "@/lib/cache-keys";
import { returnError } from "@/lib/utils";
import { db } from "@/server/db";
import {
  categories,
  productImages,
  products,
  productVariants,
  reviews,
  vendorProfiles,
} from "@/server/db/schema";
import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";

const LIMIT = 20;

export const getProducts = async (
  page: number = 0,
  filters: ProductFilters = {},
) => {
  try {
    const { category, inStock, maxPrice, minPrice, search, sort } = filters;
    const offset = page * LIMIT;

    const conditions = [
      eq(products.status, "active"),
      isNull(products.deletedAt),
      category ? eq(products.categoryId, category) : undefined,
      minPrice !== undefined
        ? gte(products.basePrice, minPrice.toString())
        : undefined,
      maxPrice !== undefined
        ? lte(products.basePrice, maxPrice.toString())
        : undefined,
      search
        ? or(
            ilike(products.name, `%${search}%`),
            ilike(products.description, `%${search}%`),
          )
        : undefined,
      inStock
        ? or(
            and(eq(products.hasVariants, false), gte(products.stock, 1)),
            and(
              eq(products.hasVariants, true),
              inArray(
                products.id,
                db
                  .select({ productId: productVariants.productId })
                  .from(productVariants)
                  .where(gte(productVariants.stock, 1)),
              ),
            ),
          )
        : undefined,
    ].filter(Boolean);

    const data = await cacheWrap(
      productKeys.tags.list(page, filters),
      [productKeys.tags.lists(), productKeys.tags.all()],
      async () => {
        return await db.query.products.findMany({
          where: and(...conditions),
          orderBy: buildOrderBy(sort),
          with: {
            images: {
              where: eq(productImages.isPrimary, true),
              limit: 1,
            },
            vendor: {
              columns: {
                storeName: true,
                storeSlug: true,
                logoUrl: true,
              },
            },
            variants: {
              where: isNull(productVariants.deletedAt),
              columns: {
                id: true,
                price: true,
                stock: true,
                name: true,
                options: true,
              },
            },
          },
          limit: LIMIT + 1,
          offset,
        });
      },
      120,
    );

    const hasMore = data.length > LIMIT;
    const pageData = hasMore ? data.slice(0, LIMIT) : data;
    return {
      success: true as const,
      message: "Products fetched",
      data: pageData,
      meta: {
        page,
        limit: LIMIT,
        hasMore,
      },
    };
  } catch (error) {
    return returnError(error, "Unable to fetch products");
  }
};

export type ProductSort = "newest" | "oldest" | "price-asc" | "price-desc";

function buildOrderBy(sort?: ProductFilters["sort"]) {
  switch (sort) {
    case "price_asc":
      return [asc(products.basePrice), asc(products.id)]; // tiebreaker
    case "price_desc":
      return [desc(products.basePrice), asc(products.id)]; // tiebreaker
    case "rating":
      return [desc(products.averageRating), asc(products.id)]; // tiebreaker
    case "newest":
    default:
      return [desc(products.createdAt), asc(products.id)]; // tiebreaker
  }
}
export type Products = Awaited<ReturnType<typeof getProducts>>["data"];

export async function getCategories() {
  try {
    const data = await cacheWrap(
      categoryKeys.tags.tree(),
      [categoryKeys.tags.all()],
      async () => {
        const all = await db.query.categories.findMany({
          orderBy: [asc(categories.sortOrder), asc(categories.name)],
          with: {
            subcategories: {
              orderBy: [asc(categories.sortOrder), asc(categories.name)],
            },
          },
        });
        return all.filter((c) => c.parentId === null);
      },
      3600,
    );

    return {
      data,
      success: true,
      message: "Categories",
    };
  } catch (error) {
    return returnError(error, "Unable to fetch categories");
  }
}

export async function getProductById(productId: string) {
  try {
    const data = await cacheWrap(
      productKeys.tags.detail(productId),
      [productKeys.tags.detail(productId), productKeys.tags.all()],
      async () => {
        return db.query.products.findFirst({
          where: and(
            eq(products.id, productId),
            eq(products.status, "active"),
            isNull(products.deletedAt),
          ),
          with: {
            images: {
              orderBy: [asc(productImages.sortOrder)],
            },
            variants: {
              where: isNull(productVariants.deletedAt),
              orderBy: [asc(productVariants.name)],
              columns: {
                id: true,
                name: true,
                options: true,
                price: true,
                stock: true,
                sku: true,
                //  TODO: FIX IMAGE
                // imageUrl: true,
              },
            },
            vendor: {
              columns: {
                id: true,
                storeName: true,
                // storeSlug: true,
                description: true,
                logoUrl: true,
                bannerUrl: true,
                returnPolicy: true,
                contactEmail: true,
              },
            },
            category: {
              columns: { id: true, name: true, slug: true },
            },
            productTags: {
              with: { tag: { columns: { id: true, name: true, slug: true } } },
            },
            reviews: {
              where: (r, { eq }) => eq(r.status, "approved"),
              limit: 10,
              orderBy: [desc(reviews.createdAt)],
              with: {
                user: { columns: { name: true, image: true } },
              },
              columns: {
                id: true,
                rating: true,
                title: true,
                body: true,
                createdAt: true,
              },
            },
          },
        });
      },
      300,
    );

    if (!data)
      return {
        message: "Product not found",
        data: null,
        success: false,
      };

    return {
      message: "Product",
      data,
      success: true,
    };
  } catch (error) {
    return returnError(error, "Unable to fetch product");
  }
}

export type ProductDetail = NonNullable<
  Awaited<ReturnType<typeof getProductById>>["data"]
>;

export async function getVendorById(vendorId: string) {
  try {
    const data = await cacheWrap(
      vendorKeys.tags.detail(vendorId),
      [vendorKeys.tags.detail(vendorId), vendorKeys.tags.all()],
      async () => {
        return db.query.vendorProfiles.findFirst({
          where: and(
            eq(vendorProfiles.id, vendorId),
            eq(vendorProfiles.status, "active"),
            isNull(vendorProfiles.deletedAt),
          ),
          columns: {
            id: true,
            storeName: true,
            description: true,
            logoUrl: true,
            bannerUrl: true,
            returnPolicy: true,
            contactEmail: true,
          },
        });
      },
      300,
    );

    if (!data)
      return {
        success: false,
        message: "Store not found",
        data: null,
      };
    return {
      data,
      success: true,
      message: "Vendor",
    };
  } catch (error) {
    return returnError(error, "Unable to fetch store");
  }
}

export async function getVendorPublicProducts(vendorId: string, page = 1) {
  const LIMIT = 20;
  const offset = (page - 1) * LIMIT;

  try {
    const data = await cacheWrap(
      productKeys.tags.byVendor(vendorId) + `:public:page:${page}`,
      [productKeys.tags.byVendor(vendorId), productKeys.tags.all()],
      async () => {
        return db.query.products.findMany({
          where: and(
            eq(products.vendorId, vendorId),
            eq(products.status, "active"),
            isNull(products.deletedAt),
          ),
          limit: LIMIT,
          offset,
          orderBy: [desc(products.createdAt)],
          with: {
            images: {
              where: eq(productImages.isPrimary, true),
              limit: 1,
            },
            variants: {
              where: isNull(productVariants.deletedAt),
              columns: { price: true, stock: true },
            },
          },
        });
      },
      120,
    );

    return {
      success: true,
      data,
      message: "Vendor products",
    };
  } catch (error) {
    return returnError(error, "Unable to fetch vendor products");
  }
}

export const getPublicVendors = async () => {
  try {
    const ratingExpr = sql<number>`ROUND(AVG(CAST(${products.averageRating} AS FLOAT))::numeric, 1)`;
    const countExpr = sql<number>`COUNT(${products.id})`;

    const data = await db
      .select({
        id: vendorProfiles.id,
        storeName: vendorProfiles.storeName,
        description: vendorProfiles.description,
        rating: ratingExpr,
        productCount: countExpr,
        logo: vendorProfiles.logoUrl,
      })
      .from(vendorProfiles)
      .leftJoin(
        products,
        and(
          eq(products.vendorId, vendorProfiles.id),
          eq(products.status, "active"),
        ),
      )
      .where(eq(vendorProfiles.status, "active"))
      .groupBy(
        vendorProfiles.id,
        vendorProfiles.storeName,
        vendorProfiles.description,
      )
      .orderBy(desc(ratingExpr));

    return {
      data: data.map((v) => ({
        ...v,
        rating: Number(v.rating) || 0,
        productCount: Number(v.productCount) || 0,
      })),
      message: "Vendors",
      success: true,
    };
  } catch (error) {
    return returnError(error, "Unable to get Vendors");
  }
};

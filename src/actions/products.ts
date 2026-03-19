"use server";
import { cacheWrap, cacheDel } from "@/lib/cache-helpers";
import { productKeys, type ProductFilters } from "@/lib/cache-keys";
import { returnError } from "@/lib/utils";
import { getUser } from "@/server/better-auth/server";
import { db } from "@/server/db";
import {
  productImages,
  products,
  productTags,
  productVariants,
  vendorProfiles,
} from "@/server/db/schema";
import { eq, isNull, gte, lte, or, ilike, and, asc, desc } from "drizzle-orm";
import z from "zod";

export const getProducts = async (
  page: number = 1,
  filters: ProductFilters = {},
) => {
  try {
    const { category, inStock, maxPrice, minPrice, search, sort } = filters;

    const LIMIT = 20;
    const offset = (page - 1) * LIMIT;

    const data = await cacheWrap(
      productKeys.tags.list(page, filters),
      [productKeys.tags.lists(), productKeys.tags.all()],
      async () => {
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
          inStock && !products.hasVariants ? gte(products.stock, 1) : undefined,
        ].filter(Boolean) as any[];

        console.log("DB HIT");

        return db.query.products.findMany({
          where: and(...conditions),
          limit: LIMIT,
          offset,
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
                price: true,
                stock: true,
              },
            },
          },
        });
      },
    );

    return {
      success: true,
      message: "Products fetched",
      data,
      meta: {
        page,
        limit: LIMIT,
        hasMore: data.length === LIMIT,
      },
    };
  } catch (error) {
    return returnError(error, "Unable to fetch products");
  }
};

function buildOrderBy(sort?: ProductFilters["sort"]) {
  switch (sort) {
    case "price_asc":
      return [asc(products.basePrice)];
    case "price_desc":
      return [desc(products.basePrice)];
    case "rating":
      return [desc(products.averageRating)];
    case "newest":
    default:
      return [desc(products.createdAt)];
  }
}

export const getVendorProducts = async (
  status: "draft" | "active" | "archived" = "active",
  page: number = 1,
) => {
  try {
    const user = await getUser();

    const vendor = await db.query.vendorProfiles.findFirst({
      where: and(
        eq(vendorProfiles.userId, user.id),
        isNull(vendorProfiles.deletedAt),
      ),
      columns: { id: true },
    });

    if (!vendor) {
      return {
        success: false,
        data: null,
        message: "Vendor profile not found",
      };
    }

    const LIMIT = 20;
    const offset = (page - 1) * LIMIT;

    const data = await cacheWrap(
      productKeys.tags.byVendorAndStatus(vendor.id, status) + `:page:${page}`,
      [
        productKeys.tags.byVendor(vendor.id),
        productKeys.tags.byVendorAndStatus(vendor.id, status),
      ],
      async () => {
        return db.query.products.findMany({
          where: and(
            eq(products.vendorId, vendor.id),
            eq(products.status, status),
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
              columns: { stock: true, price: true },
            },
          },
        });
      },
      30,
    );

    return {
      success: true,
      message: "Vendor products fetched",
      data,
      meta: { page, limit: LIMIT, hasMore: data.length === LIMIT },
    };
  } catch (error) {
    return returnError(error, "Unable to get products");
  }
};

// export const createProduct = async (values:CreateProductSchemaType) => {
//   try {
//     const user = await getUser();
//     const validatedData = createProductSchema.parse(values);

//      const vendor = await db.query.vendorProfiles.findFirst({
//       where: and(
//         eq(vendorProfiles.userId, user.id),
//         eq(vendorProfiles.status, "active"),
//         isNull(vendorProfiles.deletedAt)
//       ),
//     });

//     if (!vendor) {
//       return {
//         success: false,
//         data: null,
//         message: "You must have an active vendor profile to create products",
//       };
//     }

//      if (!vendor.stripeOnboardingComplete) {
//       return {
//         success: false,
//         data: null,
//         message: "Complete your Stripe Connect setup before listing products",
//       };
//     }

//     const newProduct = await db.transaction(async (tx) => {
//       const [createdProduct] = await tx.insert(products).values({
//         vendorId: vendor.id,
//         categoryId: validatedData.categoryId,
//         name: validatedData.name,
//         slug: generateSlug(validatedData.name),
//         description: validatedData.description,
//         basePrice: validatedData.basePrice.toString(),
//         hasVariants: validatedData.hasVariants,
//         // Stock only applies to simple products
//         stock: validatedData.hasVariants ? 0 : (validatedData.stock ?? 0),
//         status: "draft",
//       }).returning()

//       if (validatedData.images?.length) {
//         await tx.insert(productImages).values(
//           validatedData.images.map((img, index) => ({
//             productId: createdProduct?.id,
//             url: img.url,
//             altText: img.altText ?? validatedData.name,
//             sortOrder: index,
//             isPrimary: index === 0,
//           }))
//         )
//       }

//       if (validatedData.hasVariants && validatedData.variants?.length) {
//         await tx.insert(productVariants).values(
//           validatedData.variants.map((variant) => ({
//             productId: createdProduct?.id,
//             name: variant.name,
//             options: JSON.stringify(variant.options),
//             price: variant.price?.toString(),
//             stock: variant.stock ?? 0,
//             sku: variant.sku,
//           }))
//         );
//       }
//       if (validatedData.tagIds?.length) {
//         await tx.insert(productTags).values(
//           validatedData.tagIds.map((tagId) => ({
//             productId: createdProduct?.id,
//             tagId,
//           }))
//         );
//       }

//       return createdProduct;

//     });

//     cacheDel(
//       productKeys.tags.lists(),
//       productKeys.tags.byVendor(vendor.id),
//       productKeys.tags.byVendorAndStatus(vendor.id, "draft"),
//       ...(validatedData.categoryId
//         ? [productKeys.tags.byCategory(validatedData.categoryId)]
//         : [])
//     )

//       return {
//       success: true,
//       message: "Product created",
//       data: newProduct,
//     };

//   } catch (error) {
//      return returnError(error, "Unable to create product");
//   }

// function generateSlug(name: string): string {
//   return (
//     name
//       .toLowerCase()
//       .trim()
//       .replace(/[^a-z0-9\s-]/g, "")
//       .replace(/\s+/g, "-")
//       .replace(/-+/g, "-") +
//     "-" +
//     Math.random().toString(36).slice(2, 7)
//   );
// }
// }

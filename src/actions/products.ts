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
import {
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
  type CreateProductSchema,
  type UpdateProductSchema,
  type UpdateProductStatusSchema,
} from "@/zod-schema/product-schema";
import {
  eq,
  isNull,
  gte,
  lte,
  or,
  ilike,
  and,
  asc,
  desc,
  count,
  inArray,
} from "drizzle-orm";
import z from "zod";
import { deleteUploadThingFiles } from "./images";

export const getProducts = async (
  page: number = 1,
  filters: ProductFilters = {
    inStock: true,
  },
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
                id: true,
                price: true,
                stock: true,
                name: true,
                options: true,
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

export type Products = Awaited<ReturnType<typeof getProducts>>["data"];

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

export const getVendorProductById = async (productId: string) => {
  try {
    const { vendor } = await requireActiveVendor();
    if (!vendor)
      return {
        success: true,
        message: "You need to be an active vendor",
      };

    const product = await db.query.products.findFirst({
      where: and(
        eq(products.id, productId),
        eq(products.vendorId, vendor.id),
        isNull(products.deletedAt),
      ),
      with: {
        images: { orderBy: [asc(productImages.sortOrder)] },
        variants: {
          where: isNull(productVariants.deletedAt),
          orderBy: [asc(productVariants.name)],
        },
        productTags: { with: { tag: true } },
        category: { columns: { id: true, name: true, slug: true } },
      },
    });

    return {
      message: "Product Detail",
      data: product,
      success: true,
    };
  } catch (error) {
    return returnError(error, "Unable to get product");
  }
};

export const getVendorProducts = async (
  status: "draft" | "active" | "archived" = "active",
  page: number = 1,
) => {
  try {
    const { vendor } = await requireActiveVendor();

    if (!vendor) {
      return {
        success: false,
        data: null,
        message: "Vendor profile not found",
      };
    }

    const LIMIT = 20;
    const offset = (page - 1) * LIMIT;

    const [data, totalCount] = await Promise.all([
      cacheWrap(
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
      ),
      db
        .select({ count: count() })
        .from(products)
        .where(
          and(
            eq(products.vendorId, vendor.id),
            eq(products.status, status),
            isNull(products.deletedAt),
          ),
        )
        .then((res) => res[0]?.count ?? 0),
    ]);

    return {
      success: true,
      message: "Vendor products fetched",
      data,
      meta: {
        hasMore: data.length === LIMIT,
        page,
        limit: LIMIT,
        totalCount,
        totalPages: Math.ceil(totalCount / LIMIT),
      },
    };
  } catch (error) {
    return {
      ...returnError(error, "Unable to get products"),
      meta: null,
    };
  }
};

export type VendorProducts = Awaited<ReturnType<typeof getVendorProducts>>;

async function requireActiveVendor() {
  const user = await getUser();

  const vendor = await db.query.vendorProfiles.findFirst({
    where: and(
      eq(vendorProfiles.userId, user.id),
      eq(vendorProfiles.status, "active"),
      isNull(vendorProfiles.deletedAt),
    ),
  });

  if (!vendor) return { vendor: null, user };
  return { vendor, user };
}

export const createProduct = async (values: CreateProductSchema) => {
  try {
    const { vendor } = await requireActiveVendor();

    if (!vendor) {
      return {
        success: false,
        data: null,
        message: "You must have an active vendor profile to create products",
      };
    }

    if (!vendor.stripeOnboardingComplete) {
      return {
        success: false,
        data: null,
        message: "Complete your Stripe Connect setup before listing products",
      };
    }

    const validatedData = createProductSchema.parse(values);

    const newProduct = await db.transaction(async (tx) => {
      const [createdProduct] = await tx
        .insert(products)
        .values({
          vendorId: vendor.id,
          categoryId: validatedData.categoryId,
          name: validatedData.name,
          slug: generateSlug(validatedData.name),
          description: validatedData.description,
          basePrice: validatedData.basePrice.toString(),
          hasVariants: validatedData.hasVariants,
          // Stock only applies to simple products
          stock: validatedData.hasVariants ? 0 : (validatedData.stock ?? 0),
          status: "draft",
        })
        .returning();

      if (validatedData.images?.length > 0 && createdProduct?.id) {
        await tx.insert(productImages).values(
          validatedData.images.map((img, index) => ({
            productId: createdProduct.id,
            url: img.url,
            altText: img.altText ?? validatedData.name,
            sortOrder: index,
            isPrimary: index === 0,
            key: img.key,
          })),
        );
      }

      if (
        validatedData.hasVariants &&
        validatedData.variants?.length > 0 &&
        createdProduct?.id
      ) {
        await tx.insert(productVariants).values(
          validatedData.variants.map((variant) => ({
            productId: createdProduct.id,
            name: variant.name,
            options: JSON.stringify(variant.options),
            price: variant.price?.toString(),
            stock: variant.stock ?? 0,
            sku: variant.sku,
          })),
        );
      }
      if (validatedData.tagIds?.length > 0 && createdProduct?.id) {
        await tx.insert(productTags).values(
          validatedData.tagIds.map((tagId) => ({
            productId: createdProduct.id,
            tagId,
          })),
        );
      }

      return createdProduct;
    });

    cacheDel(
      productKeys.tags.lists(),
      productKeys.tags.byVendor(vendor.id),
      productKeys.tags.byVendorAndStatus(vendor.id, "draft"),
      ...(validatedData.categoryId
        ? [productKeys.tags.byCategory(validatedData.categoryId)]
        : []),
    );

    return {
      success: true,
      message: "Product created",
      data: newProduct,
    };
  } catch (error) {
    return returnError(error, "Unable to create product");
  }
};

function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-") +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}

export const updateProduct = async (
  productId: string,
  values: UpdateProductSchema,
) => {
  try {
    const { vendor } = await requireActiveVendor();
    if (!vendor) {
      return {
        success: false,
        data: null,
        message: "You must have an active vendor profile to create products",
      };
    }

    const validated = updateProductSchema.parse(values);
    const existing = await db.query.products.findFirst({
      where: and(
        eq(products.id, productId),
        eq(products.vendorId, vendor.id),
        isNull(products.deletedAt),
      ),
      with: {
        images: true,
        variants: { where: isNull(productVariants.deletedAt) },
        productTags: true,
      },
    });

    if (!existing) {
      return {
        success: false,
        data: null,
        message: "Product not found or access denied",
      };
    }

    const updatedProduct = await db.transaction(async (tx) => {
      const productUpdates: Record<string, unknown> = {
        updatedAt: new Date(),
      };

      if (validated.name !== undefined) {
        productUpdates.name = validated.name;
        if (validated.name !== existing.name) {
          productUpdates.slug = generateSlug(validated.name);
        }
      }
      if (validated.description !== undefined) {
        productUpdates.description = validated.description || null;
      }

      if (validated.categoryId !== undefined) {
        productUpdates.categoryId = validated.categoryId;
      }

      if (validated.basePrice !== undefined) {
        productUpdates.basePrice = validated.basePrice.toString();
      }
      if (validated.status !== undefined) {
        productUpdates.status = validated.status;
      }

      if (validated.hasVariants !== undefined) {
        productUpdates.hasVariants = validated.hasVariants;
        if (!validated.hasVariants) {
          productUpdates.stock = validated.stock ?? 0;
        } else {
          productUpdates.stock = 0;
        }
      } else if (validated.stock !== undefined && !existing.hasVariants) {
        productUpdates.stock = validated.stock;
      }

      const [updated] = await tx
        .update(products)
        .set(productUpdates)
        .where(eq(products.id, productId))
        .returning();

      if (validated.images !== undefined) {
        const normalizedImages = validated.images.map((img, i) => ({
          ...img,
          sortOrder: i,
          isPrimary: i === 0,
        }));

        if (existing.images.length > 0) {
          await tx
            .delete(productImages)
            .where(eq(productImages.productId, productId));

          const keysToDelete = existing.images
            .map((img) => extractUploadThingKey(img.url))
            .filter(Boolean) as string[];

          if (keysToDelete.length > 0) {
            deleteUploadThingFiles(keysToDelete)
              .then((r) => console.log("Delete Success", r))
              .catch((e) => console.error("UploadThing cleanup failed:", e));
          }
        }
        if (normalizedImages.length > 0) {
          await tx.insert(productImages).values(
            normalizedImages.map((img) => ({
              productId,
              url: img.url,
              altText: img.altText || null,
              sortOrder: img.sortOrder,
              isPrimary: img.isPrimary,
              key: img.key,
            })),
          );
        }
      }
      if (validated.variants !== undefined) {
        const incomingVariantIds = validated.variants
          .filter((v) => v.id)
          .map((v) => v.id!);

        const existingVariantIds = existing.variants.map((v) => v.id);

        const toSoftDelete = existingVariantIds.filter(
          (id) => !incomingVariantIds.includes(id),
        );

        if (toSoftDelete.length > 0) {
          await tx
            .update(productVariants)
            .set({ deletedAt: new Date() })
            .where(
              and(
                eq(productVariants.productId, productId),
                inArray(productVariants.id, toSoftDelete),
              ),
            );
        }

        for (const v of validated.variants) {
          if (v.id) {
            await tx
              .update(productVariants)
              .set({
                name: v.name,
                options: JSON.stringify(v.options),
                price: v.price?.toString() ?? null,
                stock: v.stock ?? 0,
                sku: v.sku || null,
                imageUrl: v.imageUrl || null,
                updatedAt: new Date(),
                deletedAt: null,
              })
              .where(
                and(
                  eq(productVariants.id, v.id),
                  eq(productVariants.productId, productId),
                ),
              );
          } else {
            await tx.insert(productVariants).values({
              productId,
              name: v.name,
              options: JSON.stringify(v.options),
              price: v.price?.toString() ?? null,
              stock: v.stock ?? 0,
              sku: v.sku || null,
              imageUrl: v.imageUrl || null,
            });
          }
        }
      }

      if (validated.tagIds !== undefined) {
        const existingTagIds = existing.productTags.map((pt) => pt.tagId);

        const toAddTagIds = validated.tagIds.filter(
          (id) => !existingTagIds.includes(id),
        );
        const toRemoveTagIds = existingTagIds.filter(
          (id) => !validated.tagIds!.includes(id),
        );

        if (toRemoveTagIds.length > 0) {
          await tx
            .delete(productTags)
            .where(
              and(
                eq(productTags.productId, productId),
                inArray(productTags.tagId, toRemoveTagIds),
              ),
            );
        }
        if (toAddTagIds.length > 0) {
          await tx
            .insert(productTags)
            .values(toAddTagIds.map((tagId) => ({ productId, tagId })));
        }
      }
      return updated;
    });

    cacheDel(
      productKeys.tags.detail(updatedProduct?.id!),
      productKeys.tags.lists(),
      productKeys.tags.byVendor(vendor.id),
      productKeys.tags.byVendorAndStatus(vendor.id, updatedProduct?.status!),
      ...(validated.status && validated.status !== existing.status
        ? [productKeys.tags.byVendorAndStatus(vendor.id, existing.status)]
        : []),
      ...(existing.categoryId
        ? [productKeys.tags.byCategory(existing.categoryId)]
        : []),
      ...(validated.categoryId && validated.categoryId !== existing.categoryId
        ? [productKeys.tags.byCategory(validated.categoryId)]
        : []),
    );

    // TODO: SKU DUP FIX
    return {
      success: true,
      data: updatedProduct,
      message: "Product updated success",
    };
  } catch (error) {
    return returnError(error, "Unable to update product");
  }
};

function extractUploadThingKey(url: string): string | null {
  const match = url.match(/\/f\/([^/?#]+)/);
  return match?.[1] ?? null;
}

export const deleteProduct = async (productId: string) => {
  try {
    const { vendor } = await requireActiveVendor();
    if (!vendor) {
      return {
        success: false,
        data: null,
        message: "You must have an active vendor profile to create products",
      };
    }

    const existing = await db.query.products.findFirst({
      where: and(
        eq(products.id, productId),
        eq(products.vendorId, vendor.id),
        isNull(products.deletedAt),
      ),
      with: {
        images: true,
      },
      columns: { id: true, slug: true, status: true, categoryId: true },
    });

    if (!existing) {
      return {
        success: false,
        data: null,
        message: "Product not found or access denied",
      };
    }

    if (existing.images.length > 0) {
      const keysToDelete = existing.images
        .map((img) => extractUploadThingKey(img.url))
        .filter(Boolean) as string[];

      if (keysToDelete.length > 0) {
        deleteUploadThingFiles(keysToDelete)
          .then((r) => console.log("Delete IMAGE Success", r))
          .catch((e) => console.error("UploadThing cleanup failed:", e));
      }
    }

    await db
      .update(products)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(products.id, productId));

    cacheDel(
      productKeys.tags.detail(existing.id),
      productKeys.tags.lists(),
      productKeys.tags.byVendor(vendor.id),
      productKeys.tags.byVendorAndStatus(vendor.id, existing.status),
      ...(existing.categoryId
        ? [productKeys.tags.byCategory(existing.categoryId)]
        : []),
    );

    return {
      success: true,
      message: "Product Deleted",
      data: existing,
    };
  } catch (error) {
    return returnError(error, "Unable to delete product");
  }
};

export const updateProductStatus = async (
  productId: string,
  values: UpdateProductStatusSchema,
) => {
  try {
    const { vendor } = await requireActiveVendor();
    if (!vendor) {
      return {
        success: false,
        data: null,
        message: "You must have an active vendor profile to create products",
      };
    }
    const validated = updateProductStatusSchema.parse(values);

    const existing = await db.query.products.findFirst({
      where: and(
        eq(products.id, productId),
        eq(products.vendorId, vendor.id),
        isNull(products.deletedAt),
      ),
      columns: { id: true, slug: true, status: true, categoryId: true },
    });

    if (!existing) {
      return {
        success: false,
        data: null,
        message: "Product not found or access denied",
      };
    }

    if (validated.status === "active" && !vendor.stripeOnboardingComplete) {
      return {
        success: false,
        data: null,
        message:
          "Complete your Stripe Connect setup before publishing products",
      };
    }

    const [updated] = await db
      .update(products)
      .set({ status: validated.status, updatedAt: new Date() })
      .where(eq(products.id, productId))
      .returning({ id: products.id, status: products.status });

    cacheDel(
      productKeys.tags.detail(existing.id),
      productKeys.tags.lists(),
      productKeys.tags.byVendor(vendor.id),
      productKeys.tags.byVendorAndStatus(vendor.id, validated.status),
      productKeys.tags.byVendorAndStatus(vendor.id, existing.status),
      ...(existing.categoryId
        ? [productKeys.tags.byCategory(existing.categoryId)]
        : []),
    );

    return {
      success: true,
      message: `Product ${validated.status}`,
      data: updated,
    };
  } catch (error) {
    return returnError(error, "Unable to update status");
  }
};

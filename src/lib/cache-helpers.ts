import { revalidateTag, unstable_cache } from "next/cache";
import {
  categoryKeys,
  discountKeys,
  productKeys,
  reviewKeys,
  vendorKeys,
} from "@/lib/cache-keys";

export const invalidate = {
  product: {
    updated: (slug: string, vendorId: string, categoryId?: string) => {
      revalidateTag(productKeys.tags.detail(slug), "max");
      revalidateTag(productKeys.tags.lists(), "max");
      revalidateTag(productKeys.tags.byVendor(vendorId), "max");
      if (categoryId) {
        revalidateTag(productKeys.tags.byCategory(categoryId), "max");
      }
    },

    statusChanged: (slug: string, vendorId: string, status: string) => {
      revalidateTag(productKeys.tags.detail(slug), "max");
      revalidateTag(
        productKeys.tags.byVendorAndStatus(vendorId, status),
        "max",
      );
      revalidateTag(productKeys.tags.lists(), "max");
    },

    sold: (slug: string, vendorId: string) => {
      revalidateTag(productKeys.tags.detail(slug), "max");
      revalidateTag(productKeys.tags.byVendor(vendorId), "max");
    },
  },

  vendor: {
    // Call after store name, logo, description update
    updated: (vendorId: string, userId: string) => {
      revalidateTag(vendorKeys.tags.detail(vendorId), "max");
      revalidateTag(vendorKeys.tags.byUser(userId), "max");
      revalidateTag(vendorKeys.tags.lists(), "max");
    },
  },

  review: {
    updated: (productId: string, productSlug: string, userId: string) => {
      revalidateTag(reviewKeys.tags.byProduct(productId), "max");
      revalidateTag(reviewKeys.tags.byUser(userId), "max");
      revalidateTag(productKeys.tags.detail(productSlug), "max");
    },
  },

  category: {
    updated: () => {
      revalidateTag(categoryKeys.tags.all(), "max");
    },
  },

  discount: {
    updated: (vendorId?: string) => {
      revalidateTag(discountKeys.tags.all(), "max");
      if (vendorId) {
        revalidateTag(discountKeys.tags.byVendor(vendorId), "max");
      }
    },
  },
};

type CacheConfig = {
  key: string;
  tags: string[];
  revalidate?: number;
};

export function cachedFetch<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  getConfig: (...args: TArgs) => CacheConfig,
) {
  return (...args: TArgs): Promise<TResult> => {
    const config = getConfig(...args);

    return unstable_cache(() => fn(...args), [config.key], {
      tags: config.tags,
      revalidate: config.revalidate ?? 120,
    })();
  };
}

export const cacheWrap = <T>(
  key: string,
  tags: string[],
  fn: () => Promise<T>,
  revalidate = 60,
): Promise<T> => cachedFetch(fn, () => ({ key, tags, revalidate }))();

export const cacheDel = (...tagList: string[]) => {
  tagList.forEach((tag) => {
    const { revalidateTag } = require("next/cache");
    revalidateTag(tag);
  });
};

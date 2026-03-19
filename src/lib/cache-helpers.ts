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
      revalidateTag(productKeys.tags.detail(slug));
      revalidateTag(productKeys.tags.lists());
      revalidateTag(productKeys.tags.byVendor(vendorId));
      if (categoryId) {
        revalidateTag(productKeys.tags.byCategory(categoryId));
      }
    },

    statusChanged: (slug: string, vendorId: string, status: string) => {
      revalidateTag(productKeys.tags.detail(slug));
      revalidateTag(productKeys.tags.byVendorAndStatus(vendorId, status));
      revalidateTag(productKeys.tags.lists());
    },

    sold: (slug: string, vendorId: string) => {
      revalidateTag(productKeys.tags.detail(slug));
      revalidateTag(productKeys.tags.byVendor(vendorId));
    },
  },

  vendor: {
    // Call after store name, logo, description update
    updated: (slug: string, userId: string) => {
      revalidateTag(vendorKeys.tags.detail(slug));
      revalidateTag(vendorKeys.tags.byUser(userId));
      revalidateTag(vendorKeys.tags.lists());
    },
  },

  review: {
    updated: (productId: string, productSlug: string, userId: string) => {
      revalidateTag(reviewKeys.tags.byProduct(productId));
      revalidateTag(reviewKeys.tags.byUser(userId));
      revalidateTag(productKeys.tags.detail(productSlug));
    },
  },

  category: {
    updated: () => {
      revalidateTag(categoryKeys.tags.all());
    },
  },

  discount: {
    updated: (vendorId?: string) => {
      revalidateTag(discountKeys.tags.all());
      if (vendorId) {
        revalidateTag(discountKeys.tags.byVendor(vendorId));
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

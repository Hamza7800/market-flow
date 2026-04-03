import {
  getCategories,
  getProductById,
  getProducts,
  getPublicVendors,
  getVendorById,
  getVendorPublicProducts,
} from "@/actions/public";
import {
  categoryKeys,
  productKeys,
  vendorKeys,
  type ProductFilters,
} from "@/lib/cache-keys";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.tree(),
    queryFn: async () => {
      const r = await getCategories();
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
    staleTime: 1000 * 60 * 60,
  });
}

export function useProducts(filters: ProductFilters = {}) {
  return useInfiniteQuery({
    queryKey: ["public-products", ...productKeys.infinityList(filters)],
    // queryKey: ["public-products"],
    queryFn: async ({ pageParam = 0 }) => {
      const r = await getProducts(pageParam, filters);
      if (!r.success) throw new Error(r.message);
      return r;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta?.hasMore) return undefined;
      return lastPage.meta.page + 1;
    },
    initialPageParam: 0,
    // staleTime: 1000 * 60,
  });
}

export function useProductDetail(productId: string) {
  return useQuery({
    queryKey: productKeys.detail(productId),
    queryFn: async () => {
      const r = await getProductById(productId);
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useVendorPublic(vendorId: string) {
  return useQuery({
    queryKey: vendorKeys.detail(vendorId),
    queryFn: async () => {
      const r = await getVendorById(vendorId);
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
    enabled: !!vendorId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useVendorPublicProducts(vendorId: string) {
  return useInfiniteQuery({
    queryKey: [...productKeys.byVendor(vendorId), "public"],
    queryFn: async ({ pageParam }) => {
      const r = await getVendorPublicProducts(vendorId, pageParam);
      if (!r.success) throw new Error(r.message);
      return r;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta?.hasMore) return undefined;
      return lastPage.meta.page + 1;
    },
    // enabled: !!vendorId,
    staleTime: 1000 * 60 * 2,
    initialPageParam: 0,
    // placeholderData: (prev) => prev,
  });
}

export function usePublicVendors() {
  return useQuery({
    queryKey: ["vendors", "public-list"],
    queryFn: async () => {
      const r = await getPublicVendors();
      if (!r.success) {
        throw new Error(r.message);
      }
      return r.data;
    },
  });
}

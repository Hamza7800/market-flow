import {
  createProduct,
  deleteProduct,
  getVendorProducts,
  updateProduct,
  updateProductStatus,
} from "@/actions/products";
import { productKeys } from "@/lib/cache-keys";
import type { ProductStatus } from "@/lib/nuqs";
import type {
  CreateProductSchema,
  UpdateProductSchema,
} from "@/zod-schema/product-schema";
import { toast } from "@heroui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useVendorProducts = (
  vendorId: string,
  page: number,
  status: ProductStatus,
) => {
  return useQuery({
    queryKey: [...productKeys.byVendorAndStatus(vendorId, status), page],
    queryFn: async () => {
      const result = await getVendorProducts(status, page);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
  });
};

export const useCreateProduct = (vendorId: string) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateProductSchema) => {
      const result = await createProduct(values);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: (result, variables) => {
      if (!result.success) return;

      if (result.data) {
        qc.setQueryData(
          [...productKeys.detail(result.data.id), "vendor"],
          result,
        );
      }

      qc.invalidateQueries({ queryKey: productKeys.lists() });
      qc.invalidateQueries({ queryKey: productKeys.byVendor(vendorId) });
      qc.invalidateQueries({
        queryKey: productKeys.byVendorAndStatus(vendorId, "draft"),
      });
      if (variables.categoryId) {
        qc.invalidateQueries({
          queryKey: productKeys.byCategory(variables.categoryId),
        });
      }
      toast.success(result?.message);
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
};

export const useUpdateProduct = (vendorId: string, productId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: UpdateProductSchema) => {
      const result = await updateProduct(productId, values);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onMutate: async (variables) => {
      // TODO: Optimistic update;
      await qc.cancelQueries({
        queryKey: [...productKeys.detail(productId), "vendor"],
      });
      const snapshot = qc.getQueryData([
        ...productKeys.detail(productId),
        "vendor",
      ]);
      return { snapshot };
    },
    onSuccess: (result, variables) => {
      if (!result.success) return;
      qc.invalidateQueries({ queryKey: productKeys.detail(productId) });
      qc.invalidateQueries({ queryKey: productKeys.lists() });
      qc.invalidateQueries({ queryKey: productKeys.byVendor(vendorId) });

      if (variables.categoryId) {
        qc.invalidateQueries({
          queryKey: productKeys.byCategory(variables.categoryId),
        });
      }
      if (variables.status) {
        qc.invalidateQueries({
          queryKey: productKeys.byVendorAndStatus(vendorId, variables.status),
        });
      }
      toast.success(result.message);
    },
    onError: (err, _vars, context) => {
      if (context?.snapshot) {
        qc.setQueryData(
          [...productKeys.detail(productId), "vendor"],
          context.snapshot,
        );
      }
      toast.danger(err.message);
    },
  });
};

export const useUpdateProductStatus = (
  vendorId: string,
  productId: string,
  currentStatus: "draft" | "active" | "archived",
) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      status,
    }: {
      status: "draft" | "active" | "archived";
    }) => {
      const result = await updateProductStatus(productId, { status });
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onMutate: async ({ status: newStatus }) => {
      await qc.cancelQueries({
        queryKey: productKeys.byVendorAndStatus(vendorId, currentStatus),
      });

      const snapshot = qc.getQueryData(
        productKeys.byVendorAndStatus(vendorId, currentStatus),
      );

      qc.setQueryData(
        productKeys.byVendorAndStatus(vendorId, currentStatus),
        (old: any) => {
          if (!old?.data) return old;
          return {
            ...old,
            data: old.data.filter((p: any) => p.id !== productId),
          };
        },
      );

      return { snapshot };
    },
    onSuccess: (result, { status: newStatus }) => {
      if (!result.success) return;

      qc.invalidateQueries({ queryKey: productKeys.detail(productId) });
      qc.invalidateQueries({ queryKey: productKeys.lists() });
      qc.invalidateQueries({
        queryKey: productKeys.byVendorAndStatus(vendorId, currentStatus),
      });
      qc.invalidateQueries({
        queryKey: productKeys.byVendorAndStatus(vendorId, newStatus),
      });

      toast.success(result.message);
    },

    onError: (err, _vars, context) => {
      if (context?.snapshot) {
        qc.setQueryData(
          productKeys.byVendorAndStatus(vendorId, currentStatus),
          context.snapshot,
        );
      }
      toast.danger(err.message);
    },
  });
};

export const useDeleteProduct = (
  vendorId: string,
  productId: string,
  status: "draft" | "active" | "archived",
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (productId: string) => {
      const result = await deleteProduct(productId);
      if (!result.success) {
        throw new Error(result.message);
      }
      return result;
    },
    onSuccess: (result) => {
      if (!result.success) return;

      qc.removeQueries({ queryKey: productKeys.detail(productId) });

      qc.invalidateQueries({ queryKey: productKeys.lists() });
      qc.invalidateQueries({ queryKey: productKeys.byVendor(vendorId) });
      qc.invalidateQueries({
        queryKey: productKeys.byVendorAndStatus(vendorId, status),
      });
      toast.success(result.message);
    },
    onError: (err) => {
      toast.danger(err.message);
    },
  });
};

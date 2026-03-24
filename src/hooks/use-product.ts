import { createProduct } from "@/actions/products";
import { productKeys } from "@/lib/cache-keys";
import type {
  CreateProductSchema,
  UpdateProductSchema,
} from "@/zod-schema/product-schema";
import { toast } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
    },
    onError: (error) => {
      toast.danger(error.message);
    },
  });
};

export const useUpdateProduct = (vendorId: string, productId: string) => {
  return useMutation({
    mutationFn: async (values: UpdateProductSchema) => {
      console.log(values);
      return values;
    },
  });
};

export const useUpdateProductStatus = (
  vendorId: string,
  productId: string,
  currentStatus: "draft" | "active" | "archived",
) => {
  return useMutation({
    mutationFn: async ({
      status,
    }: {
      status: "draft" | "active" | "archived";
    }) => {},
  });
};

export const useDeleteProduct = (
  vendorId: string,
  productId: string,
  currentStatus: "draft" | "active" | "archived",
) => {
  return useMutation({
    mutationFn: async (productId: string) => {},
  });
};

import type {
  CreateProductSchema,
  UpdateProductSchema,
} from "@/zod-schema/product-schema";
import { useMutation } from "@tanstack/react-query";

export const useCreateProduct = (vendorId: string) => {
  return useMutation({
    mutationFn: async (values: CreateProductSchema) => {
      console.log(values);
      return values;
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

import type { VendorProducts } from "@/actions/products";
import type { ProductStatus } from "@/lib/nuqs/product";
import type { SortDescriptor } from "@heroui/react";
import type { SortingState } from "@tanstack/react-table";

type Products = NonNullable<VendorProducts>["data"];
export type ProductRow = NonNullable<Products>[number];

export const STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};

export const STATUS_COLOR: Record<
  ProductStatus,
  "success" | "danger" | "default"
> = {
  active: "success",
  draft: "danger",
  archived: "default",
};

export const toSortDescriptor = (
  sorting: SortingState,
): SortDescriptor | undefined => {
  const first = sorting[0];
  if (!first) return undefined;
  return {
    column: first.id,
    direction: first.desc ? "descending" : "ascending",
  };
};

export const toSortingState = (descriptor: SortDescriptor): SortingState => {
  return [
    {
      id: descriptor.column as string,
      desc: descriptor.direction === "descending",
    },
  ];
};

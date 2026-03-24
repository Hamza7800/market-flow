"use client";

import { Button, Card, Chip, Input, Pagination, Table } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useQueryStates } from "nuqs";
import { productSearchParams, type ProductStatus } from "@/lib/nuqs";
import type { VendorProducts } from "@/actions/products";

const STATUS_LABELS: Record<ProductStatus, string> = {
  active: "Active",
  draft: "Draft",
  archived: "Archived",
};

const STATUS_COLOR: Record<ProductStatus, "success" | "warning" | "default"> = {
  active: "success",
  draft: "warning",
  archived: "default",
};

const PAGE_SIZE = 10;

function getPageItems(page: number, totalPages: number) {
  const pages: Array<number | "..."> = [];

  const add = (item: number | "...") => {
    const last = pages[pages.length - 1];
    if (item === "..." && last === "...") return;
    pages.push(item);
  };

  add(1);

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) add("...");

  for (let p = start; p <= end; p++) add(p);

  if (end < totalPages - 1) add("...");

  if (totalPages > 1) add(totalPages);

  return pages;
}

export default function ProductsTable({
  vendorId,
  status,
  page,
  result,
}: {
  vendorId: string;
  status: ProductStatus;
  page: number;
  result: VendorProducts;
}) {
  const items = result.data ?? [];
  const totalItems = result?.meta?.totalCount ?? items.length;
  const totalPages =
    result?.meta?.totalPages ?? Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const [{ status: urlStatus, page: urlPage }, setQuery] = useQueryStates(
    productSearchParams,
    {
      history: "push",
      shallow: false,
    },
  );

  const activeStatus = urlStatus ?? status;
  const activePage = urlPage ?? page;

  const start = totalItems === 0 ? 0 : (activePage - 1) * PAGE_SIZE + 1;
  const end = Math.min(activePage * PAGE_SIZE, totalItems);

  const pageItems = useMemo(
    () => getPageItems(activePage, totalPages),
    [activePage, totalPages],
  );

  const setStatus = (nextStatus: ProductStatus) => {
    setQuery({ status: nextStatus, page: 1 });
  };

  const setPage = (nextPage: number) => {
    setQuery({ page: nextPage });
  };

  return (
    <div className="space-y-6">
      <Card className="border-default-200 bg-content1/80 border p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Chip>Products</Chip>
              <Chip color={STATUS_COLOR[activeStatus]}>
                {STATUS_LABELS[activeStatus]}
              </Chip>
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Product catalog
              </h1>
              <p className="text-default-500 mt-1 text-sm">
                Manage products, switch status, and jump between pages without
                losing URL state.
              </p>
            </div>
          </div>

          <Link href={`/vendor/${vendorId}/dashboard/products/form`}>
            Create product
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {(["active", "draft", "archived"] as const).map((item) => {
            const selected = item === activeStatus;

            return (
              <Button key={item} size="sm" onPress={() => setStatus(item)}>
                {STATUS_LABELS[item]}
              </Button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="border-default-200 border p-4 shadow-none">
            <p className="text-default-500 text-xs tracking-wide uppercase">
              Total products
            </p>
            <p className="mt-2 text-2xl font-semibold">{totalItems}</p>
          </Card>

          <Card className="border-default-200 border p-4 shadow-none">
            <p className="text-default-500 text-xs tracking-wide uppercase">
              Current page
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {activePage} / {totalPages}
            </p>
          </Card>

          <Card className="border-default-200 border p-4 shadow-none">
            <p className="text-default-500 text-xs tracking-wide uppercase">
              Showing
            </p>
            <p className="mt-2 text-2xl font-semibold">
              {start}-{end}
            </p>
          </Card>

          <Card className="border-default-200 border p-4 shadow-none">
            <p className="text-default-500 text-xs tracking-wide uppercase">
              Status
            </p>
            <p className="text-default-500 mt-2 text-sm">
              Filtered by {STATUS_LABELS[activeStatus].toLowerCase()}
            </p>
          </Card>
        </div>
      </Card>

      <Card className="border-default-200 border p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            aria-label="Search products"
            placeholder="Search products..."
          />

          <div className="text-default-500 text-sm">
            {totalItems} {totalItems === 1 ? "product" : "products"}
          </div>
        </div>

        <Table variant="secondary" className="w-full">
          <Table.ScrollContainer>
            <Table.Content aria-label="Vendor products">
              <Table.Header>
                <Table.Column isRowHeader>Product</Table.Column>
                <Table.Column>Price</Table.Column>
                <Table.Column>Stock</Table.Column>
                <Table.Column>Rating</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column>Action</Table.Column>
              </Table.Header>

              <Table.Body
                items={items}
                renderEmptyState={() => (
                  <div className="py-12 text-center">
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-default-500 mt-1 text-sm">
                      Try another filter or create a new product.
                    </p>
                    <div className="mt-4">
                      <Link
                        href={`/vendor/${vendorId}/dashboard/products/form`}
                      >
                        <Button>Create product</Button>
                      </Link>
                    </div>
                  </div>
                )}
              >
                {(product) => {
                  const primaryImage =
                    product.images?.[0]?.url ??
                    "https://picsum.photos/seed/artisan-banner/120/120";

                  const price = product.hasVariants
                    ? Math.min(
                        ...(product.variants ?? []).map((v) => Number(v.price)),
                      )
                    : Number(product.basePrice);

                  const totalStock = product.hasVariants
                    ? (product.variants ?? []).reduce(
                        (acc, v) => acc + v.stock,
                        0,
                      )
                    : product.stock;

                  const rating = Number(product.averageRating ?? 0);
                  const reviews = Number(product.reviewCount ?? 0);

                  return (
                    <Table.Row id={product.id}>
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <div className="border-default-200 bg-default-100 relative h-14 w-14 overflow-hidden rounded-2xl border">
                            <Image
                              src={primaryImage}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {product.name}
                            </p>
                            <p className="text-default-500 line-clamp-1 text-sm">
                              {product.description || "No description added."}
                            </p>
                          </div>
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <div className="space-y-1">
                          <p className="font-medium">${price.toFixed(2)}</p>
                          {product.hasVariants ? (
                            <p className="text-default-500 text-xs">
                              Starting price
                            </p>
                          ) : (
                            <p className="text-default-500 text-xs">
                              Base price
                            </p>
                          )}
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        {totalStock > 0 ? (
                          <Chip color="success" size="sm">
                            In stock · {totalStock}
                          </Chip>
                        ) : (
                          <Chip color="danger" size="sm">
                            Out of stock
                          </Chip>
                        )}
                      </Table.Cell>

                      <Table.Cell>
                        <div className="space-y-1">
                          <p className="font-medium">⭐ {rating.toFixed(1)}</p>
                          <p className="text-default-500 text-xs">
                            {reviews} review{reviews === 1 ? "" : "s"}
                          </p>
                        </div>
                      </Table.Cell>

                      <Table.Cell>
                        <Chip color={STATUS_COLOR[product.status]}>
                          {STATUS_LABELS[product.status]}
                        </Chip>
                      </Table.Cell>

                      <Table.Cell>
                        <Link
                          href={`/vendor/${vendorId}/dashboard/products/form?productId=${product.id}`}
                          className="text-primary text-sm font-medium hover:underline"
                        >
                          Edit
                        </Link>
                      </Table.Cell>
                    </Table.Row>
                  );
                }}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>

          <Table.Footer className="pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Pagination className="w-full">
                <Pagination.Summary className="text-default-500 text-sm">
                  {totalItems === 0
                    ? "No results"
                    : `Showing ${start}-${end} of ${totalItems}`}
                </Pagination.Summary>

                <Pagination.Content className="justify-end">
                  <Pagination.Item>
                    <Pagination.Previous
                      isDisabled={activePage <= 1}
                      onPress={() => setPage(Math.max(1, activePage - 1))}
                    >
                      <Pagination.PreviousIcon />
                    </Pagination.Previous>
                  </Pagination.Item>

                  {pageItems.map((item, index) =>
                    item === "..." ? (
                      <Pagination.Item key={`ellipsis-${index}`}>
                        <Pagination.Ellipsis />
                      </Pagination.Item>
                    ) : (
                      <Pagination.Item key={item}>
                        <Pagination.Link
                          isActive={item === activePage}
                          onPress={() => setPage(item)}
                        >
                          {item}
                        </Pagination.Link>
                      </Pagination.Item>
                    ),
                  )}

                  <Pagination.Item>
                    <Pagination.Next
                      isDisabled={activePage >= totalPages}
                      onPress={() =>
                        setPage(Math.min(totalPages, activePage + 1))
                      }
                    >
                      <Pagination.NextIcon />
                    </Pagination.Next>
                  </Pagination.Item>
                </Pagination.Content>
              </Pagination>
            </div>
          </Table.Footer>
        </Table>
      </Card>
    </div>
  );
}

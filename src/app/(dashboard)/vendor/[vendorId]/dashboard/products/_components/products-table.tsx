"use client";

import type { SortingState } from "@tanstack/react-table";

import {
  Button,
  Chip,
  Pagination,
  Separator,
  Table,
  Tooltip,
} from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import {
  serverProductParams,
  clientProductParams,
  type ProductStatus,
} from "@/lib/nuqs/product";
import { useVendorProducts } from "@/hooks/use-product";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import {
  AlertCircle,
  Archive,
  ChevronUp,
  PackageSearch,
  Trash2,
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
  STATUS_COLOR,
  STATUS_LABELS,
  toSortDescriptor,
  toSortingState,
  type ProductRow,
} from "@/lib/consts/product";
import { LinkButton } from "@/components/link-button";
import { Pencil } from "@gravity-ui/icons";
import ProductActions from "./product-actions";

const PAGE_SIZE = 20;

const columnHelper = createColumnHelper<ProductRow>();

function SortableHeader({
  children,
  sortDirection,
}: {
  children: React.ReactNode;
  sortDirection?: "ascending" | "descending";
}) {
  return (
    <span className="flex items-center gap-1.5">
      {children}
      {sortDirection && (
        <ChevronUp
          size={12}
          className={cn(
            "text-default-400 transition-transform duration-150",
            sortDirection === "descending" && "rotate-180",
          )}
        />
      )}
    </span>
  );
}

export default function ProductsTable({
  vendorId,
  status: statusProp,
  page: pageProp,
}: {
  vendorId: string;
  status: ProductStatus;
  page: number;
}) {
  const router = useRouter();
  const [{ status: urlStatus, page: urlPage }, setServerQuery] = useQueryStates(
    serverProductParams,
    { history: "push", shallow: false },
  );

  // const activeStatus = urlStatus ?? statusProp;
  // const activePage = urlPage ?? pageProp;

  const [{ search, priceSort, minRating }, setClientQuery] = useQueryStates(
    clientProductParams,
    { history: "replace", shallow: true },
  );

  const [sorting, setSorting] = useState<SortingState>([]);
  const { data: products, isPending } = useVendorProducts(
    vendorId,
    pageProp,
    statusProp,
  );

  const rawItems = products?.data ?? [];
  const totalItems = products?.meta?.totalCount ?? rawItems.length;
  const totalPages =
    products?.meta?.totalPages ??
    Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "product",
        header: "Product",
        enableSorting: false,
        cell: ({ row }) => {
          const p = row.original;
          const img =
            p.images?.[0]?.url ??
            "https://picsum.photos/seed/placeholder/120/120";
          return (
            <div className="flex items-center gap-3">
              <div className="border-default-100 bg-default-50 relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border">
                <Image
                  src={img}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <div className="min-w-0">
                <p className="text-default-900 truncate text-sm font-medium">
                  {p.name}
                </p>
                <p className="text-default-400 truncate text-xs">
                  {p.description || "No description"}
                </p>
              </div>
            </div>
          );
        },
      }),

      columnHelper.accessor(
        (row) =>
          row.hasVariants
            ? Math.min(...(row.variants ?? []).map((v) => Number(v.price ?? 0)))
            : Number(row.basePrice),
        {
          id: "price",
          header: "Price",
          cell: ({ row, getValue }) => (
            <div>
              <p className="text-default-900 text-sm font-semibold">
                ${getValue().toFixed(2)}
              </p>
              <p className="text-default-400 text-[11px]">
                {row.original.hasVariants ? "Starting" : "Base"}
              </p>
            </div>
          ),
        },
      ),

      columnHelper.accessor(
        (row) =>
          row.hasVariants
            ? (row.variants ?? []).reduce((a, v) => a + v.stock, 0)
            : row.stock,
        {
          id: "stock",
          header: "Stock",
          cell: ({ getValue }) => {
            const stock = getValue();
            return stock > 0 ? (
              <Chip size="sm" color="success">
                {stock} in stock
              </Chip>
            ) : (
              <Chip size="sm" color="danger">
                Out of stock
              </Chip>
            );
          },
        },
      ),

      columnHelper.accessor((row) => Number(row.averageRating ?? 0), {
        id: "rating",
        header: "Rating",
        cell: ({ getValue, row }) => {
          const rating = getValue();
          const reviews = Number(row.original.reviewCount ?? 0);
          return (
            <div>
              <p className="text-default-900 text-sm font-medium">
                {rating > 0 ? `⭐ ${rating.toFixed(1)}` : "—"}
              </p>
              <p className="text-default-400 text-[11px]">
                {reviews} review{reviews !== 1 ? "s" : ""}
              </p>
            </div>
          );
        },
      }),

      columnHelper.accessor("status", {
        id: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ getValue }) => {
          const s = getValue();
          return (
            <Chip size="sm" color={STATUS_COLOR[s]}>
              {STATUS_LABELS[s]}
            </Chip>
          );
        },
      }),

      columnHelper.display({
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <ProductActions
            status={row.original.status}
            vendorId={vendorId}
            productId={row.original.id}
          />
        ),
      }),
    ],
    [vendorId],
  );

  const filteredData = useMemo(() => {
    let data = rawItems;

    if (search?.trim()) {
      const q = search.toLowerCase();
      data = data.filter((p) => p.name.toLowerCase().includes(q));
    }

    if (minRating && minRating !== "none") {
      const min = parseFloat(minRating);
      data = data.filter((p) => Number(p.averageRating ?? 0) >= min);
    }

    return data;
  }, [rawItems, search, minRating]);

  const effectiveSorting: SortingState = useMemo(() => {
    if (priceSort === "asc") return [{ id: "price", desc: false }];
    if (priceSort === "desc") return [{ id: "price", desc: true }];
    return sorting;
  }, [priceSort, sorting]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting: effectiveSorting },
    onSortingChange: (updater) => {
      if (!priceSort || priceSort === "none") {
        setSorting(typeof updater === "function" ? updater(sorting) : updater);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const sortDescriptor = useMemo(
    () => toSortDescriptor(effectiveSorting),
    [effectiveSorting],
  );

  const rows = table.getRowModel().rows;
  // const start = totalItems === 0 ? 0 : (activePage - 1) * PAGE_SIZE + 1;
  // const end = Math.min(activePage * PAGE_SIZE, totalItems);

  if (isPending) return <LoadingState label="Products" />;

  if (!rawItems.length) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No Products"
        description="No products yet for this status"
        action={{
          label: "Create product",
          onClick: () =>
            router.push(`/vendor/${vendorId}/dashboard/products/form`),
        }}
      />
    );
  }

  console.log(filteredData);

  return (
    <Table className="w-full">
      <Table.ScrollContainer>
        <Table.Content
          aria-label="Vendor products"
          className="min-w-[700px]"
          sortDescriptor={sortDescriptor}
          onSortChange={(d) => {
            if (!priceSort || priceSort === "none") {
              setSorting(toSortingState(d));
            }
          }}
        >
          <Table.Header>
            {table.getHeaderGroups()[0]!.headers.map((header) => (
              <Table.Column
                key={header.id}
                id={header.id}
                allowsSorting={header.column.getCanSort()}
                // isRowHeader={header.id === "product"}
                isRowHeader
                className={cn(
                  "bg-default-50 text-default-500 text-xs font-semibold tracking-wide uppercase first:pl-5 last:pr-5",
                  header.id === "product" && "w-full", // 👈 full width
                  header.id === "actions" && "min-w-[140px]",
                  header.id === "status" && "min-w-[80px]",
                  header.id === "rating" && "min-w-[150px]",
                  header.id === "stock" && "min-w-[120px]",
                  header.id === "price" && "min-w-[120px]",
                )}
                // className="bg-default-50 text-default-500 text-xs font-semibold tracking-wide uppercase first:pl-5 last:pr-5"
              >
                {({ sortDirection }) => (
                  <SortableHeader sortDirection={sortDirection}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </SortableHeader>
                )}
              </Table.Column>
            ))}
          </Table.Header>

          <Table.Body
            items={rows}
            renderEmptyState={() => (
              <div className="flex flex-col items-center justify-center gap-3 py-16">
                <PackageSearch size={36} className="text-default-300" />
                <div className="text-center">
                  <p className="text-default-600 text-sm font-medium">
                    No products match your filters
                  </p>
                  <p className="text-default-400 mt-0.5 text-xs">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
                <Button
                  size="sm"
                  onPress={() => {
                    setClientQuery({
                      search: null,
                      priceSort: null,
                      minRating: null,
                    });
                  }}
                >
                  Clear filters
                </Button>
              </div>
            )}
          >
            {(row) => (
              <Table.Row
                key={row.id}
                id={row.id}
                className="border-default-100 hover:bg-default-50/60 border-b transition-colors last:border-0"
              >
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell
                    key={cell.id}
                    className="py-3 first:pl-5 last:pr-5"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
      <Separator className="mt-2" />
      <Table.Footer className="px-5 pb-3">
        <div className="flex w-full flex-col justify-between gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Pagination size="sm">
            <Pagination.Content className="justify-end">
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={pageProp <= 1}
                  onPress={() =>
                    setServerQuery({ page: Math.max(1, pageProp - 1) })
                  }
                >
                  <Pagination.PreviousIcon />
                </Pagination.Previous>
              </Pagination.Item>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Pagination.Item key={p}>
                  <Pagination.Link
                    isActive={p === pageProp}
                    onPress={() => setServerQuery({ page: p })}
                  >
                    {p}
                  </Pagination.Link>
                </Pagination.Item>
              ))}

              <Pagination.Item>
                <Pagination.Next
                  isDisabled={pageProp >= totalPages}
                  onPress={() =>
                    setServerQuery({
                      page: Math.min(totalPages, pageProp + 1),
                    })
                  }
                >
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
          <Button
            size="sm"
            onPress={() => {
              setClientQuery({
                search: null,
                priceSort: null,
                minRating: null,
              });
            }}
          >
            Clear filters
          </Button>
        </div>
      </Table.Footer>
    </Table>
  );
}

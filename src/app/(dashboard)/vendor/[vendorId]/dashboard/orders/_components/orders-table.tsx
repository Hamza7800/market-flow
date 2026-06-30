"use client";

import type { SortDescriptor } from "@heroui/react";
import type { SortingState } from "@tanstack/react-table";

import { Chip, cn, Pagination, Table } from "@heroui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useQueryStates } from "nuqs";
import { orderSearchParams, type OrderStatus } from "@/lib/nuqs/nuqs";
import { useVendorOrders } from "@/hooks/use-orders";
import type { VendorOrders } from "@/actions/orders";
import { LoadingState } from "@/components/loading-state";
import OrderActions from "./order-actions";

type VendorOrder = NonNullable<VendorOrders>;
type OrderItem = NonNullable<VendorOrder["data"]>[number];

const columnHelper = createColumnHelper<OrderItem>();

const STATUS_COLOR: Record<
  OrderItem["status"],
  "warning" | "primary" | "success" | "danger" | "default"
> = {
  pending: "warning",
  processing: "primary",
  shipped: "primary",
  delivered: "success",
  cancelled: "danger",
  refunded: "success",
};

const columns = [
  columnHelper.accessor("productName", {
    header: "Product",
    cell: (info) => {
      const row = info.row.original;

      return (
        <div className="flex items-center gap-3">
          <img
            src={row.imageUrl ?? ""}
            alt={row.productName}
            className="h-10 w-10 rounded-md object-cover"
          />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{row.productName}</span>
            <span className="text-default-500 text-xs">{row.variantName}</span>
          </div>
        </div>
      );
    },
  }),
  // columnHelper.accessor("variant", {
  //   header: "Variant",
  //   cell: ({ getValue }) => {
  //     const variant = getValue();
  //     if (!variant) return <Chip>No available</Chip>;
  //     let label = variant.name;

  //     try {
  //       const options = JSON.parse(variant.options) as Record<string, string>;
  //       const optionText = Object.entries(options)
  //         .map(([k, v]) => `${k}: ${v}`)
  //         .join(", ");
  //       if (optionText) label = `${variant.name} (${optionText})`;
  //     } catch {
  //       // fall back to variant name only
  //     }

  //     return <span className="text-sm">{label}</span>;
  //   },
  // }),
  columnHelper.accessor("quantity", {
    header: "Qty",
  }),
  columnHelper.accessor("unitPrice", {
    header: "Unit Price",
    cell: (info) => `$ ${info.getValue()}`,
  }),
  columnHelper.accessor("totalPrice", {
    header: "Total",
    cell: (info) => `$ ${info.getValue()}`,
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <Chip
        size="sm"
        variant="soft"
        // color={STATUS_COLOR[info.getValue()]}
      >
        {info.getValue()}
      </Chip>
    ),
  }),
  columnHelper.accessor("order", {
    header: "Is Paid",
    cell: (info) => {
      const order = info.getValue();
      const isPaid = order.isPaid;
      return (
        <Chip
          size="sm"
          color={isPaid ? "success" : "danger"}

          // color={STATUS_COLOR[info.getValue()]}
        >
          {isPaid ? "Paid" : "Not Paid"}
        </Chip>
      );
    },
  }),

  columnHelper.accessor("createdAt", {
    header: "Created",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
  columnHelper.display({
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <OrderActions vendorId={row.original.vendorId} id={row.original.id} />
    ),
  }),
];

function toSortDescriptor(sorting: SortingState): SortDescriptor | undefined {
  const first = sorting[0];
  if (!first) return undefined;

  return {
    column: first.id,
    direction: first.desc ? "descending" : "ascending",
  };
}

function toSortingState(descriptor: SortDescriptor): SortingState {
  return [
    {
      id: descriptor.column as string,
      desc: descriptor.direction === "descending",
    },
  ];
}

const PAGE_SIZE = 20;

export function OrdersTable({
  vendorId,
  status,
  page,
}: {
  vendorId: string;
  status: OrderStatus;
  page: number;
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [{}, setQuery] = useQueryStates(orderSearchParams, {
    history: "push",
    shallow: false,
  });

  const { data: orders, isPending } = useVendorOrders(vendorId, status, page);

  const rows = orders?.data ?? [];

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    // pageCount: totalPages,
  });

  const sortDescriptor = useMemo(() => toSortDescriptor(sorting), [sorting]);

  const activePage = page;
  const hasMore = orders?.meta?.hasMore ?? false;

  const setPage = (nextPage: number) => {
    setQuery({ page: nextPage });
  };

  if (isPending) {
    return <LoadingState />;
  }

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="Orders table"
          sortDescriptor={sortDescriptor}
          onSortChange={(d) => setSorting(toSortingState(d))}
        >
          <Table.Header>
            {table.getHeaderGroups()[0]!.headers.map((header) => (
              <Table.Column
                key={header.id}
                id={header.id}
                allowsSorting={header.column.getCanSort()}
                isRowHeader={header.id === "productName"}
                className={cn(
                  "bg-default-50 text-default-500 text-xs font-semibold tracking-wide uppercase first:pl-5 last:pr-5",
                  header.id === "productName" && "w-full min-w-[300px]",
                  header.id === "actions" && "min-w-[70px]",
                  header.id === "status" && "min-w-[100px]",
                  header.id === "quantity" && "min-w-[50px]",
                  header.id === "unitPrice" && "min-w-[120px]",
                  header.id === "totalPrice" && "min-w-[120px]",
                  header.id === "order" && "min-w-[100px]",
                  header.id === "createdAt" && "min-w-[100px]",
                )}
              >
                {({ sortDirection }) => (
                  <span className="flex items-center justify-between">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {!!sortDirection && (
                      <span>{sortDirection === "descending" ? "↓" : "↑"}</span>
                    )}
                  </span>
                )}
              </Table.Column>
            ))}
          </Table.Header>

          <Table.Body
            // isLoading={isLoading}
            // loadingContent={<div className="py-8 text-center">Loading orders...</div>}
            renderEmptyState={() => (
              <div className="py-12 text-center">
                <p className="text-lg font-medium">No Orders Yet</p>
              </div>
            )}
          >
            {table.getRowModel().rows.map((row) => (
              <Table.Row key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>

      <Table.Footer>
        <Pagination size="sm">
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous
                isDisabled={activePage <= 1}
                onPress={() => setPage(activePage - 1)}
              >
                Previous
              </Pagination.Previous>
            </Pagination.Item>

            {/* ONLY current page */}
            <Pagination.Item>
              <Pagination.Link isActive>{activePage}</Pagination.Link>
            </Pagination.Item>

            <Pagination.Item>
              <Pagination.Next
                isDisabled={!hasMore}
                onPress={() => setPage(activePage + 1)}
              >
                Next
              </Pagination.Next>
            </Pagination.Item>
          </Pagination.Content>
        </Pagination>
      </Table.Footer>
    </Table>
  );
}

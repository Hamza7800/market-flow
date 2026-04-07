"use client";

import type { SortDescriptor } from "@heroui/react";
import type { SortingState } from "@tanstack/react-table";

import { Button, Chip, EmptyState, Pagination, Table, cn } from "@heroui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import RejectRefund from "@/app/(dashboard)/vendor/[vendorId]/dashboard/refunds/_components/reject-refund";
import ApproveRefund from "@/app/(dashboard)/vendor/[vendorId]/dashboard/refunds/_components/approve-refund";
import { FloppyDisk } from "@gravity-ui/icons";

// TODO:FIX TYPES
// ---------------- TYPES ----------------
interface RefundRow {
  refund: {
    id: string;
    amount: string;
    reason: string;
    status: string;
    createdAt: string;
  };
  orderItem: {
    productName: string;
    variantName: string;
    quantity: number;
    totalPrice: string;
    imageUrl: string;
  };
  order: {
    id: string;
    createdAt: string;
  };
}

// ---------------- HELPERS ----------------
const formatMoney = (v: string) => `$${Number(v).toFixed(2)}`;

const statusColorMap: Record<string, any> = {
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

// ---------------- COLUMNS ----------------
const columnHelper = createColumnHelper<RefundRow>();

const columns = [
  columnHelper.accessor((row) => row.orderItem, {
    id: "product",
    header: "Product",
    cell: (info) => {
      const item = info.getValue();
      return (
        <div className="flex items-center gap-3">
          <img
            src={item.imageUrl}
            className="h-12 w-12 rounded-lg object-cover"
          />
          <div>
            <p className="text-sm font-medium">{item.productName}</p>
            <p className="text-default-500 text-xs">{item.variantName}</p>
          </div>
        </div>
      );
    },
  }),

  // columnHelper.accessor((row) => row.order.id, {
  //   id: "order",
  //   header: "Order",
  //   cell: (info) => (
  //     <span className="font-mono text-xs">
  //       {info.getValue().slice(0, 8)}...
  //     </span>
  //   ),
  // }),

  columnHelper.accessor((row) => row.refund.amount, {
    id: "amount",
    header: "Amount",
    cell: (info) => formatMoney(info.getValue()),
  }),

  columnHelper.accessor((row) => row.orderItem.quantity, {
    id: "qty",
    header: "Qty",
  }),

  columnHelper.accessor((row) => row.refund.reason, {
    id: "reason",
    header: "Reason",
    cell: (info) => (
      <p className="max-w-[200px] truncate text-sm">{info.getValue()}</p>
    ),
  }),

  columnHelper.accessor((row) => row.refund.status, {
    id: "status",
    header: "Status",
    cell: (info) => (
      <Chip
        size="sm"
        variant="soft"
        color={statusColorMap[info.getValue()] || "default"}
      >
        {info.getValue()}
      </Chip>
    ),
  }),

  // ---------------- ACTIONS ----------------
  columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => {
      const row = info.row.original;
      const isPending = row.refund.status === "pending";
      if (!isPending) {
        return;
      }
      return (
        <div className="flex gap-2">
          <ApproveRefund refundId={row.refund.id} />
          <RejectRefund refundId={row.refund.id} />
        </div>
      );
    },
  }),
];

// ---------------- SORT BRIDGE ----------------
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

const PAGE_SIZE = 10;

export function RefundsTable({ data }: { data: any }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
    onSortingChange: setSorting,
    initialState: {
      pagination: { pageSize: PAGE_SIZE },
    },
  });

  const sortDescriptor = useMemo(() => toSortDescriptor(sorting), [sorting]);

  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="Refunds Table"
          sortDescriptor={sortDescriptor}
          onSortChange={(d) => setSorting(toSortingState(d))}
        >
          <Table.Header>
            {table?.getHeaderGroups()[0]!.headers.map((header) => (
              <Table.Column
                key={header.id}
                isRowHeader
                id={header.id}
                allowsSorting={header.column.getCanSort()}
                className={cn(
                  "bg-default-50 text-default-500 text-xs font-semibold tracking-wide uppercase first:pl-5 last:pr-5",
                  header.id === "product" && "w-full min-w-[300px]",
                  header.id === "reason" && "w-full min-w-[300px]",
                  header.id === "amount" && "min-w-[100px]",
                  header.id === "qty" && "min-w-[90px]",
                  header.id === "status" && "min-w-[100px]",
                  header.id === "actions" && "min-w-[100px]",
                )}
              >
                {({ sortDirection }) => (
                  <span className="flex items-center justify-between">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </span>
                )}
              </Table.Column>
            ))}
          </Table.Header>

          <Table.Body
            renderEmptyState={() => {
              return (
                <EmptyState className="mt-6 flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                  <FloppyDisk />
                  <span className="text-muted text-sm">No results found</span>
                </EmptyState>
              );
            }}
          >
            {table.getRowModel().rows.map((row) => (
              <Table.Row key={row.id} id={row.id}>
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
                isDisabled={!table.getCanPreviousPage()}
                onPress={() => table.previousPage()}
              >
                Previous
              </Pagination.Previous>
            </Pagination.Item>

            {pages.map((p) => (
              <Pagination.Item key={p}>
                <Pagination.Link
                  isActive={p === pageIndex + 1}
                  onPress={() => table.setPageIndex(p - 1)}
                >
                  {p}
                </Pagination.Link>
              </Pagination.Item>
            ))}

            <Pagination.Item>
              <Pagination.Next
                isDisabled={!table.getCanNextPage()}
                onPress={() => table.nextPage()}
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

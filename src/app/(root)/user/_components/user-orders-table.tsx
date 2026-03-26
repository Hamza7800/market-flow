"use client";

import type { SortDescriptor } from "@heroui/react";
import type { SortingState } from "@tanstack/react-table";

import { Chip, Pagination, Table } from "@heroui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import type { OrdersType } from "@/actions/orders";
import { useRouter } from "nextjs-toploader/app";
import { useParams } from "next/navigation";
import { formatMoney } from "@/lib/utils";

type Orders = NonNullable<OrdersType["data"]>;
type Order = Orders[number];

const parseAddress = (snapshot: string) => {
  try {
    const data = JSON.parse(snapshot);
    return data.city || "—";
  } catch {
    return "—";
  }
};

const statusColorMap: Record<string, any> = {
  pending: "warning",
  paid: "success",
  failed: "danger",
};

const columnHelper = createColumnHelper<Order>();

const columns = [
  columnHelper.accessor("createdAt", {
    header: "Date",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),

  columnHelper.accessor("shippingAddressSnapshot", {
    header: "City",
    cell: (info) => parseAddress(info.getValue()),
  }),

  columnHelper.accessor("total", {
    header: "Total",
    cell: (info) => formatMoney(info.getValue()),
  }),

  columnHelper.accessor("status", {
    header: "Order Status",
    cell: (info) => (
      <Chip
        color={statusColorMap[info.getValue()] || "default"}
        size="sm"
        variant="soft"
      >
        {info.getValue()}
      </Chip>
    ),
  }),

  columnHelper.accessor((row) => row.payment?.status || "unpaid", {
    id: "payment",
    header: "Payment",
    cell: (info) => {
      const value = info.getValue();
      return (
        <Chip
          color={
            value === "succeeded"
              ? "success"
              : value === "pending"
                ? "warning"
                : "danger"
          }
          size="sm"
          variant="secondary"
        >
          {value}
        </Chip>
      );
    },
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

const OrdersTable = ({ orders }: { orders: Orders }) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const { userId } = useParams<{ userId: string }>();

  const table = useReactTable({
    columns,
    data: orders,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: { pageSize: PAGE_SIZE },
    },
    state: { sorting },
    onSortingChange: setSorting,
  });

  const sortDescriptor = useMemo(() => toSortDescriptor(sorting), [sorting]);

  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  const start = pageIndex * PAGE_SIZE + 1;
  const end = Math.min((pageIndex + 1) * PAGE_SIZE, orders.length);

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          aria-label="User Orders"
          className="min-w-[700px]"
          sortDescriptor={sortDescriptor}
          onSortChange={(d) => setSorting(toSortingState(d))}
        >
          <Table.Header>
            {table.getHeaderGroups()[0]!.headers.map((header) => (
              <Table.Column
                key={header.id}
                isRowHeader
                id={header.id}
                allowsSorting={header.column.getCanSort()}
              >
                {({ sortDirection }) => (
                  <span className="flex items-center justify-between">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {/* {!!sortDirection && (
                      <Icon
                        icon="gravity-ui:chevron-up"
                        className={cn(
                          "size-3 transition-transform",
                          sortDirection === "descending" && "rotate-180"
                        )}
                      />
                    )} */}
                  </span>
                )}
              </Table.Column>
            ))}
          </Table.Header>

          <Table.Body>
            {table.getRowModel().rows.map((row) => (
              <Table.Row
                href={`/user/${userId}/orders/${row.original.id}`}
                key={row.id}
                id={row.id}
              >
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
          <Pagination.Summary>
            {start} to {end} of {orders.length} orders
          </Pagination.Summary>

          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous
                isDisabled={!table.getCanPreviousPage()}
                onPress={() => table.previousPage()}
              >
                Prev
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
};

export default OrdersTable;

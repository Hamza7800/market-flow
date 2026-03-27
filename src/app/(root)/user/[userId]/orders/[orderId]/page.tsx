"use client";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useUserOrdersDetails } from "@/hooks/use-orders";
import { formatMoney } from "@/lib/utils";
import { Button, Card, Chip, Separator } from "@heroui/react";
import { AlertCircle } from "lucide-react";
import CancelOrder from "@/app/(root)/user/_components/cancel-order";

const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "danger";
    default:
      return "default";
  }
};

const OrderDetails = () => {
  const { data, isPending, isError, error, refetch } = useUserOrdersDetails();

  console.log(data);

  if (isPending) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState message={error?.message} onRetry={refetch} homeHref={"/"} />
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No Order"
        description="No order found"
        action={{
          label: "Refresh",
          onClick: refetch,
        }}
      />
    );
  }

  const address = JSON.parse(data.shippingAddressSnapshot);

  return (
    <div className="space-y-6">
      {/* ---------------- ORDER HEADER ---------------- */}
      <Card>
        <Card.Header className="">
          <div className="flex gap-2">
            {/* <Chip variant="primary">{data?.isPaid ? "paid" : "unpaid"}</Chip> */}

            <Chip color={data?.isPaid ? "success" : "warning"} variant="soft">
              {data?.isPaid ? "paid" : "unpaid"}
            </Chip>
          </div>
        </Card.Header>

        <Card.Content className="flex flex-col gap-4 md:flex-row md:justify-between">
          <div>
            <p className="text-default-500 text-sm">Placed On</p>
            <p>{new Date(data.createdAt).toLocaleString()}</p>
          </div>

          <div>
            <p className="text-default-500 text-sm">Paid At</p>
            <p>{data.paidAt ? new Date(data.paidAt).toLocaleString() : "—"}</p>
          </div>

          <div>
            <p className="text-default-500 text-sm">Total</p>
            <p className="text-lg font-semibold">{formatMoney(data.total)}</p>
          </div>
        </Card.Content>
      </Card>

      {/* ---------------- ITEMS ---------------- */}
      <Card>
        <Card.Header>
          <h3 className="font-semibold">Items</h3>
        </Card.Header>

        <Card.Content className="space-y-4">
          {data.items.map((item: any) => {
            const options = item.variant?.options
              ? JSON.parse(item.variant.options)
              : {};

            return (
              <div
                key={item.id}
                className="flex items-start gap-4 border-b pb-4 last:border-none"
              >
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="h-20 w-20 rounded-xl object-cover"
                />

                <div className="flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-default-500 text-sm">{item.variantName}</p>

                  {/* Variant options */}
                  <div className="mt-1 flex flex-wrap gap-2">
                    {Object.entries(options).map(([k, v]) => (
                      <Chip key={k} size="sm" variant="soft">
                        {k}: {String(v)}
                      </Chip>
                    ))}
                  </div>

                  <p className="text-default-500 mt-2 text-sm">
                    Qty: {item.quantity}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-medium">{formatMoney(item.totalPrice)}</p>
                  <p className="text-default-500 text-xs">
                    {formatMoney(item.unitPrice)} each
                  </p>

                  <Chip size="sm" variant="soft" className="my-2">
                    {item.status}
                  </Chip>
                  {["pending", "processing"].includes(item.status) &&
                    data.isPaid && <CancelOrder orderId={data.id} />}
                </div>
              </div>
            );
          })}
        </Card.Content>
      </Card>

      {/* ---------------- SHIPPING + SUMMARY ---------------- */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* SHIPPING */}
        <Card>
          <Card.Header>
            <h3 className="font-semibold">Shipping</h3>
          </Card.Header>

          <Card.Content className="space-y-1 text-sm">
            <p className="font-medium">{address.fullName}</p>
            <p>{address.line1}</p>
            {address.line2 && <p>{address.line2}</p>}
            <p>
              {address.city}, {address.state}
            </p>
            <p>{address.postalCode}</p>
            <p>{address.country}</p>
            <p className="text-default-500 pt-2">{address.phone}</p>
          </Card.Content>
        </Card>

        {/* PRICE BREAKDOWN */}
        <Card>
          <Card.Header>
            <h3 className="font-semibold">Summary</h3>
          </Card.Header>

          <Card.Content className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(data.subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{formatMoney(data.shippingAmount)}</span>
            </div>

            <div className="flex justify-between">
              <span>Discount</span>
              <span>-{formatMoney(data.discountAmount)}</span>
            </div>

            <Separator />

            <div className="flex justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatMoney(data.total)}</span>
            </div>
          </Card.Content>
        </Card>
      </div>
      <>
        <div>
          <h3 className="font-semibold">Refunds</h3>
        </div>

        <Card.Content className="space-y-1 text-sm">
          {data.refunds.length ? (
            data.refunds.map((refund) => {
              return (
                <Card key={refund.id}>
                  <Card.Header>
                    <Chip className="w-fit">{refund.status}</Chip>
                  </Card.Header>
                  <Card.Content>
                    <img
                      src={refund.orderItem?.imageUrl ?? ""}
                      alt={refund.orderItem?.product.name}
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                    {refund.orderItem?.product.name}
                  </Card.Content>
                  <Card.Footer>{refund.reason}</Card.Footer>
                </Card>
              );
            })
          ) : (
            <h2>No Refunds Request</h2>
          )}
        </Card.Content>
      </>
    </div>
  );
};

export default OrderDetails;

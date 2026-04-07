"use client";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useUserOrdersDetails } from "@/hooks/use-orders";
import { formatMoney } from "@/lib/utils";
import { Button, Card, Chip, Separator } from "@heroui/react";
import { AlertCircle, ArrowLeftIcon } from "lucide-react";
import CancelOrder from "@/app/(root)/user/_components/cancel-order";
import { OrderItemReview } from "@/components/review-components";
import Link from "next/link";
import { authClient } from "@/server/better-auth/client";

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
  const { data: userAuth } = authClient.useSession();
  const userId = userAuth?.user.id;

  if (isPending) {
    return <LoadingState />;
  }

  if (isError) {
    return (
      <ErrorState message={error?.message} onRetry={refetch} homeHref={"/"} />
    );
  }

  if (!data) {
    if (isPending) {
      return;
    }
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
      <div className="mt-2 mb-6">
        <Link
          href={`/user/${userId}/orders`}
          className="text-accent mb-2 flex w-fit items-center gap-2 text-sm hover:underline"
        >
          <ArrowLeftIcon size={13} /> Back to orders
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight">Order Details</h1>
      </div>
      <Card>
        <Card.Header className="">
          <div className="flex gap-2">
            {/* <Chip variant="primary">{data?.isPaid ? "paid" : "unpaid"}</Chip> */}

            {/* <Chip color={data?.isPaid ? "success" : "warning"} variant="soft">
              {data?.isPaid ? "paid" : "unpaid"}
            </Chip> */}
          </div>
        </Card.Header>

        <Card.Content className="flex flex-col gap-4 md:flex-row md:justify-between">
          <div>
            <p className="text-default-500 text-sm">Placed On</p>
            <p>{new Date(data.createdAt).toLocaleString()}</p>
          </div>

          <div>
            <p className="text-default-500 text-sm">Paid At</p>
            <p>
              {data.paidAt ? new Date(data.paidAt).toLocaleString() : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-default-500 text-sm">Total</p>
            <p className="text-lg font-semibold">{formatMoney(data.total)}</p>
          </div>
        </Card.Content>
      </Card>

      <Card className="bg-transparent p-0 shadow-none">
        <Card.Header>
          <h3 className="font-semibold">Items</h3>
        </Card.Header>

        <Card.Content className="space-y-4">
          {data.items.map((item: any) => {
            const options = item.variant?.options;
            // ? JSON.parse(item?.variant?.options)
            // : {};

            return (
              <Card key={item.id} className="gap-4 border pb-4">
                <Card.Content className="sm:flex-row">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="mr-2 h-20 w-20 rounded-xl object-cover"
                  />

                  <div className="flex-1">
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-default-500 text-sm">
                      {item.variantName}
                    </p>

                    {/* Variant options */}
                    {/* <div className="mt-1 flex flex-wrap gap-2">
                    {Object.entries(options).map(([k, v]) => (
                      <Chip key={k} size="sm" variant="soft">
                        {k}: {String(v)}
                      </Chip>
                    ))}
                  </div> */}

                    <p className="text-default-500 mt-2 text-sm">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <div className="">
                    <p className="font-medium">
                      {formatMoney(item.totalPrice)}
                    </p>
                    <p className="text-default-500 text-xs">
                      {formatMoney(item.unitPrice)} each
                    </p>
                    {/* <p>{item.id}</p> */}
                    <Chip size="sm" variant="soft" className="my-2">
                      {item.status}
                    </Chip>
                    {["pending", "processing"].includes(item.status) &&
                      data.isPaid && (
                        <CancelOrder orderId={data.id} orderItemId={item.id} />
                      )}
                  </div>
                </Card.Content>
                <Card.Footer className="w-full">
                  {item.status === "delivered" && (
                    <OrderItemReview
                      orderItemId={item.id}
                      productId={item.productId}
                      productName={item.productName}
                      orderId={data.id}
                      // userId={session.user.id}
                    />
                  )}
                </Card.Footer>
              </Card>
            );
          })}
        </Card.Content>
      </Card>

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
      <Card className="p-0 shadow-none">
        <div>
          <h3 className="font-semibold">Refunds</h3>
        </div>

        <Card.Content className="space-y-1 text-sm">
          {data.refunds.length ? (
            data.refunds.map((refund) => {
              return (
                <Card
                  key={refund.id}
                  className="border-border border shadow-none"
                >
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
      </Card>
    </div>
  );
};

export default OrderDetails;

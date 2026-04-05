"use client";
import { useOrderItemDetails } from "@/hooks/use-orders";
import { Button, Card, Chip, Separator } from "@heroui/react";
import Image from "next/image";
import { UpdateOrderItemStatus } from "./update-order-item-status";
import { defaultImage } from "@/lib/consts/constants";
import { LoadingState } from "@/components/loading-state";
import { EmptyState } from "@/components/empty-state";
import { useRouter } from "nextjs-toploader/app";
import { Box } from "lucide-react";

const OderDetails = ({ vendorId, id }: { vendorId: string; id: string }) => {
  const { data, isPending } = useOrderItemDetails(id);
  const router = useRouter();

  if (isPending) {
    return (
      <div className="h-dvh">
        <LoadingState />
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={Box}
        title="No Product"
        description="Order not found"
        action={{
          label: "Go Back",
          onClick: () => router.push(`/vendor/${vendorId}/dashboard/orders`),
        }}
      />
    );
  }

  return (
    <div className="grid gap-6 p-6 lg:grid-cols-3">
      {/* Product Card */}
      <Card className="rounded-2xl shadow-sm lg:col-span-2">
        <Card.Content className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-xl border">
              <Image
                src={data.imageUrl || defaultImage}
                alt={data.productName}
                fill
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold">
                {data.productName}
              </h2>
              {data.variantName && (
                <p className="text-default-400 text-xs">
                  Variant: {data.variantName}
                </p>
              )}
              <p className="text-default-500 text-sm">Qty: {data.quantity}</p>
            </div>

            <Chip
            // color={statusColorMap[data.status] || "default"}
            >
              {data.status}
            </Chip>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-default-500">Unit Price</p>
              <p className="font-medium">${data.unitPrice}</p>
            </div>
            <div>
              <p className="text-default-500">Total</p>
              <p className="text-lg font-semibold">${data.totalPrice}</p>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Order Info */}
      <Card className="rounded-2xl shadow-sm">
        <Card.Content className="flex flex-col gap-4">
          <h3 className="font-semibold">Order Info</h3>

          {/* <div className="flex justify-between text-sm">
            <span className="text-default-500">Payment</span>
            <Chip color={data.order.isPaid ? "success" : "warning"} size="sm">
              {data.order.isPaid ? "Paid" : "Pending"}
            </Chip>
          </div> */}

          <div className="flex justify-between text-sm">
            <span className="text-default-500">Created</span>
            <span>{new Date(data.createdAt).toLocaleDateString()}</span>
          </div>

          {data.order.paidAt && (
            <div className="flex justify-between text-sm">
              <span className="text-default-500">Paid At</span>
              <span>{new Date(data.order.paidAt).toLocaleDateString()}</span>
            </div>
          )}

          <Separator />

          <div>
            <p className="text-default-500 text-sm">Customer</p>
            <p className="font-medium">{data?.order?.user?.name}</p>
            <p className="text-default-400 text-xs">
              {data?.order?.user?.email}
            </p>
          </div>
        </Card.Content>
      </Card>

      {/* Shipping */}
      <Card className="rounded-2xl shadow-sm lg:col-span-3">
        <Card.Content className="flex flex-col gap-3">
          <h3 className="font-semibold">Shipping Address</h3>

          <div className="text-default-600 text-sm">
            <p className="font-medium">{data.shippingAddress.fullName}</p>
            <p>{data.shippingAddress.line1}</p>
            {data.shippingAddress.line2 && <p>{data.shippingAddress.line2}</p>}
            <p>
              {data.shippingAddress.city}, {data.shippingAddress.state}
            </p>
            <p>{data.shippingAddress.postalCode}</p>
            <p>{data.shippingAddress.country}</p>
            <p className="mt-1">📞 {data.shippingAddress.phone}</p>
          </div>
        </Card.Content>
      </Card>

      {/* Tracking */}
      {(data.trackingNumber || data.trackingUrl) && (
        <Card className="rounded-2xl shadow-sm lg:col-span-3">
          <Card.Content className="flex flex-col gap-3">
            <h3 className="font-semibold">Tracking</h3>

            {data.trackingNumber && (
              <p className="text-sm">
                Tracking #:{" "}
                <span className="font-medium">{data.trackingNumber}</span>
              </p>
            )}

            {data.trackingUrl && (
              <a
                href={data.trackingUrl}
                target="_blank"
                className="text-primary text-sm underline"
              >
                Track Shipment
              </a>
            )}
          </Card.Content>
        </Card>
      )}

      <UpdateOrderItemStatus
        orderItemId={id}
        vendorId={vendorId}
        orderId={data.orderId}
        itemStatus={data.status}
        trigger={<Button>Update Status</Button>}
      />
    </div>
  );
};

export default OderDetails;

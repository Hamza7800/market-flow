import { useMemo, useState, type ReactNode } from "react";
import { StatusConfirmModal } from "./item-confirm-model";
import { useUpdateOrderItemStatus } from "@/hooks/use-orders";
import {
  canVendorTransitionTo,
  VENDOR_TRANSITIONS,
  type OrderItemStatus,
} from "@/lib/utils";
import {
  ErrorMessage,
  FieldError,
  Input,
  Label,
  ListBox,
  Select,
  TextField,
} from "@heroui/react";

export function UpdateOrderItemStatus({
  orderItemId,
  vendorId,
  orderId,
  trigger,
  itemStatus,
  page = 1,
}: {
  orderItemId: string;
  vendorId: string;
  orderId: string;
  trigger: ReactNode;
  itemStatus: OrderItemStatus;
  page?: number;
}) {
  const { mutateAsync, isPending } = useUpdateOrderItemStatus(
    vendorId,
    orderId,
    page,
  );

  const nextStatuses = useMemo(() => {
    return VENDOR_TRANSITIONS[itemStatus] ?? [];
  }, [itemStatus]);

  // const nextStatuses = VENDOR_TRANSITIONS[itemStatus] ?? [];

  const [status, setStatus] = useState<OrderItemStatus>(
    nextStatuses[0] ?? itemStatus,
  );
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isShipping = status === "shipped";

  if (!nextStatuses.length) return null;

  const handleConfirm = async (close: () => void) => {
    setError(null);

    if (!canVendorTransitionTo(itemStatus, status)) {
      setError(`Cannot transition from "${itemStatus}" to "${status}"`);
      return;
    }

    if (isShipping && !trackingNumber.trim()) {
      setError("Tracking number is required");
      return;
    }

    close();

    await mutateAsync({
      orderItemId,
      // @ts-expect-error no valid Status
      input: isShipping
        ? {
            status: "shipped",
            trackingNumber: trackingNumber.trim(),
            trackingUrl: trackingUrl.trim(),
          }
        : { status },
    });

    setTrackingNumber("");
    setTrackingUrl("");
    setError(null);
  };

  return (
    <StatusConfirmModal
      title={isShipping ? "Ship Order Item" : "Update Status"}
      description={
        isShipping
          ? "Add tracking details before marking as shipped."
          : `Move this item from "${itemStatus}" to "${status}".`
      }
      confirmText={isShipping ? "Ship Item" : "Confirm"}
      isLoading={isPending}
      trigger={trigger}
      content={
        <div className="flex flex-col gap-4">
          <Select
            value={status}
            onChange={(key) => {
              setStatus(key as OrderItemStatus);
              setError(null);
            }}
            className="w-full"
          >
            <Label>New status</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {nextStatuses.map((s) => (
                  <ListBox.Item key={s} id={s} textValue={s}>
                    <Label className="capitalize">{s}</Label>
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>

          {isShipping && (
            <>
              <TextField
                isRequired
                isInvalid={!!error && !trackingNumber.trim()}
                className="w-full"
              >
                <Label>Tracking number</Label>
                <Input
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="1Z999AA10123456784"
                />
                <FieldError>Tracking number is required</FieldError>
              </TextField>

              <TextField className="w-full">
                <Label>
                  Tracking URL{" "}
                  <span className="text-default-400 text-xs">(optional)</span>
                </Label>
                <Input
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://ups.com/track?..."
                />
              </TextField>
            </>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}
        </div>
      }
      onConfirm={handleConfirm}
    />
  );
}

import { ConfirmModal } from "@/components/confirm-modal";
import { useRequestItemRefund } from "@/hooks/use-refund";
import { Button } from "@heroui/react";

const CancelOrder = ({
  orderId,
  orderItemId,
}: {
  orderItemId: string;
  orderId: string;
}) => {
  const requestRefund = useRequestItemRefund(orderId ?? "");

  return (
    <ConfirmModal
      title="Cancel order"
      description="You are about to cancel this order and request a refund. This action is irreversible and cannot be undone once submitted. The vendor will review your request and has full authority to approve or reject it. Proceed only if you are certain."
      confirmText="Cancel"
      isLoading={requestRefund?.isPending}
      onConfirm={(close) => {
        requestRefund?.mutateAsync(orderItemId, {
          onSuccess: () => {
            close();
          },
        });
      }}
      trigger={
        <Button fullWidth variant="danger-soft">
          Cancel
        </Button>
      }
    />
  );
};

export default CancelOrder;

import { ConfirmModal } from "@/components/confirm-modal";
import { useRejectItemRefund } from "@/hooks/use-refund";
import { Button } from "@heroui/react";
import { X } from "lucide-react";

const RejectRefund = ({ refundId }: { refundId: string }) => {
  const rejectRefund = useRejectItemRefund();

  return (
    <ConfirmModal
      title="Reject Refund Request"
      description="You are about to reject this refund request. The customer will not receive a refund for this item. Make sure this decision follows your refund policy."
      confirmText="Reject Request"
      isLoading={rejectRefund?.isPending}
      onConfirm={(close) => {
        rejectRefund?.mutateAsync(
          { refundId },
          {
            onSuccess: () => {
              close();
            },
          },
        );
      }}
      trigger={
        <Button isIconOnly variant="danger-soft">
          <X />
        </Button>
      }
    />
  );
};

export default RejectRefund;

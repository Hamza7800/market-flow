import { ConfirmModal } from "@/components/confirm-modal";
import { useApproveItemRefund } from "@/hooks/use-refund";
import { Button } from "@heroui/react";
import { CheckIcon } from "lucide-react";

const ApproveRefund = ({ refundId }: { refundId: string }) => {
  const approveRefund = useApproveItemRefund();

  return (
    <ConfirmModal
      title="Approve Refund"
      description="You are about to approve this refund request. The customer will be refunded, and this action cannot be undone. Please confirm that the request is valid before proceeding."
      confirmText="Approve & Refund"
      isLoading={approveRefund?.isPending}
      onConfirm={(close) => {
        approveRefund?.mutateAsync(refundId, {
          onSuccess: () => {
            close();
          },
        });
      }}
      trigger={
        <Button isIconOnly variant="secondary">
          <CheckIcon />
        </Button>
      }
    />
  );
};

export default ApproveRefund;

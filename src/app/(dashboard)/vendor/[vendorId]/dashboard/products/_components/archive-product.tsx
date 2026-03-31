import { ConfirmModal } from "@/components/confirm-modal";
import { useUpdateProductStatus } from "@/hooks/use-product";
import type { ReactNode } from "react";

const ArchiveProduct = ({
  isEdit,
  productId,
  vendorId,
  status,
  trigger,
}: {
  isEdit: boolean;
  productId: string;
  vendorId: string;
  trigger: ReactNode;
  status: "draft" | "active" | "archived";
}) => {
  const statusMutation = isEdit
    ? useUpdateProductStatus(vendorId, productId, status)
    : null;

  return (
    <ConfirmModal
      title="Archive Product"
      description="This action will archive your product."
      confirmText="Archive"
      isLoading={statusMutation?.isPending}
      onConfirm={(close) => {
        statusMutation?.mutateAsync(
          { status: "archived" },
          {
            onSuccess: () => {
              close();
            },
          },
        );
      }}
      trigger={trigger}
    />
  );
};

export default ArchiveProduct;

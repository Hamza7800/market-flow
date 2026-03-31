import { ConfirmModal } from "@/components/confirm-modal";
import { useDeleteProduct } from "@/hooks/use-product";
import { useRouter } from "nextjs-toploader/app";
import type { ReactNode } from "react";

const DeleteProduct = ({
  isEdit,
  productId,
  vendorId,
  status,
  trigger,
  isTable = false,
}: {
  isEdit: boolean;
  isTable?: boolean;
  productId: string;
  vendorId: string;
  trigger: ReactNode;
  status: "draft" | "active" | "archived";
}) => {
  const router = useRouter();
  const deleteMutation = isEdit
    ? useDeleteProduct(vendorId, productId, status)
    : null;

  return (
    <ConfirmModal
      title="Delete Product Permanently"
      description="This action will delete your product and all related data."
      confirmText="Delete Product"
      isLoading={deleteMutation?.isPending}
      onConfirm={(close) => {
        deleteMutation?.mutateAsync(productId, {
          onSuccess: () => {
            close();
            if (isTable) return;
            router.back();
          },
        });
      }}
      trigger={trigger}
    />
  );
};

export default DeleteProduct;

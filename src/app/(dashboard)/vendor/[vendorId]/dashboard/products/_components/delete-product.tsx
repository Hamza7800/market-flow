import { ConfirmModal } from "@/components/confirm-modal";
import { useDeleteProduct } from "@/hooks/use-product";
import { Button } from "@heroui/react";
import { useParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

const DeleteProduct = ({
  isEdit,
  productId,
  vendorId,
  status,
}: {
  isEdit: boolean;
  productId: string;
  vendorId: string;
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
            // router.push(`/${slug}/my-issues/assigned`);
            router.back();
          },
        });
      }}
      trigger={
        <Button fullWidth variant="danger-soft">
          Delete Product
        </Button>
      }
    />
  );
};

export default DeleteProduct;

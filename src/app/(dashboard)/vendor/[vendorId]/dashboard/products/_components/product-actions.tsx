import { LinkButton } from "@/components/link-button";
import { Pencil } from "@gravity-ui/icons";
import { Button, Tooltip } from "@heroui/react";
import { Archive, Trash2 } from "lucide-react";
import DeleteProduct from "./delete-product";
import ArchiveProduct from "./archive-product";

const ProductActions = ({
  vendorId,
  productId,
  status,
}: {
  vendorId: string;
  productId: string;
  status: "draft" | "active" | "archived";
}) => {
  return (
    <div className="flex items-center justify-between">
      {/* <Button
        onClick={() => {
          syncProductRating(productId);
        }}
      >
        Sync
      </Button> */}
      <Tooltip delay={500}>
        <LinkButton
          size="sm"
          radius="full"
          isIconOnly
          className="h-7 w-7 rounded-full px-3 text-xs font-medium"
          href={`/vendor/${vendorId}/dashboard/products/form?productId=${productId}`}
        >
          <Pencil />
        </LinkButton>
        <Tooltip.Content>Edit</Tooltip.Content>
      </Tooltip>
      <DeleteProduct
        isTable
        isEdit={true}
        productId={productId}
        vendorId={vendorId}
        status={status}
        trigger={
          <Tooltip delay={500}>
            <Button
              size="sm"
              isIconOnly
              variant="danger"
              className="h-7 w-7 rounded-full px-3 text-xs font-medium"
              // href={`/vendor/${vendorId}/dashboard/products/form?productId=${row.original.id}`}
            >
              <Trash2 />
            </Button>
            <Tooltip.Content>Delete</Tooltip.Content>
          </Tooltip>
        }
      />

      <ArchiveProduct
        isEdit={true}
        productId={productId}
        vendorId={vendorId}
        status={status}
        trigger={
          <Tooltip delay={500}>
            <Button
              size="sm"
              isIconOnly
              variant="danger-soft"
              className="h-7 w-7 rounded-full px-3 text-xs font-medium"
              // href={`/vendor/${vendorId}/dashboard/products/form?productId=${row.original.id}`}
            >
              <Archive />
            </Button>
            <Tooltip.Content>Archive</Tooltip.Content>
          </Tooltip>
        }
      />
    </div>
  );
};

export default ProductActions;

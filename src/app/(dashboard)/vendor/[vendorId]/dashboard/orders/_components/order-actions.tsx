import { LinkButton } from "@/components/link-button";
import { Eye } from "@gravity-ui/icons";
import { Tooltip } from "@heroui/react";

const OrderActions = ({ vendorId, id }: { vendorId: string; id: string }) => {
  return (
    <div className="flex items-center justify-between">
      <Tooltip delay={500}>
        <LinkButton
          size="sm"
          radius="full"
          isIconOnly
          className="h-7 w-7 rounded-full px-3 text-xs font-medium"
          href={`/vendor/${vendorId}/dashboard/orders/order-item?id=${id}`}
        >
          <Eye />
        </LinkButton>
        <Tooltip.Content>View</Tooltip.Content>
      </Tooltip>
    </div>
  );
};

export default OrderActions;

"use client";

import { LinkButton } from "@/components/link-button";
import { Button, Card, Chip } from "@heroui/react";
import { STATUS_COLOR, STATUS_LABELS } from "./products-table";
import { productSearchParams, type ProductStatus } from "@/lib/nuqs";
import { useQueryStates } from "nuqs";

const ProductNavHeader = ({
  status,
  vendorId,
}: {
  status: ProductStatus;
  vendorId: string;
}) => {
  const [{ status: urlStatus, page: urlPage }, setQuery] = useQueryStates(
    productSearchParams,
    {
      history: "push",
      shallow: false,
    },
  );

  const setStatus = (nextStatus: ProductStatus) => {
    setQuery({ status: nextStatus, page: 1 });
  };

  const activeStatus = urlStatus ?? status;

  return (
    <Card className="">
      {/* <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Chip>Products</Chip>
          <Chip color={STATUS_COLOR[activeStatus]}>
            {STATUS_LABELS[activeStatus]}
          </Chip>
        </div>

        <LinkButton href={`/vendor/${vendorId}/dashboard/products/form`}>
          Create product
        </LinkButton>
      </div> */}

      <div className="mt-5 flex flex-wrap gap-2">
        {(["active", "draft", "archived"] as const).map((item) => {
          const selected = item === activeStatus;

          return (
            <Button
              variant={selected ? "primary" : "secondary"}
              key={item}
              size="sm"
              onPress={() => setStatus(item)}
            >
              {STATUS_LABELS[item]}
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default ProductNavHeader;

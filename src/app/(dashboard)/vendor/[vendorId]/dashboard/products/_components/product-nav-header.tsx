"use client";

import { Button } from "@heroui/react";
import { serverProductParams, type ProductStatus } from "@/lib/nuqs/product";
import { useQueryStates } from "nuqs";
import { STATUS_LABELS } from "@/lib/consts/product";
import { useRouter } from "nextjs-toploader/app";

const ProductNavHeader = ({
  status,
  vendorId,
}: {
  status: ProductStatus;
  vendorId: string;
}) => {
  const router = useRouter();
  const [{ status: urlStatus, page: urlPage }, setQuery] = useQueryStates(
    serverProductParams,
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
    <div className="w-full">
      <div className="flex w-full items-center gap-2">
        {(["active", "draft", "archived"] as const).map((item) => {
          const selected = item === activeStatus;

          return (
            <Button
              variant={selected ? "primary" : "outline"}
              key={item}
              // size="sm"
              fullWidth
              className={"text-sm"}
              onPress={() => setStatus(item)}
            >
              {STATUS_LABELS[item]}
            </Button>
          );
        })}
        {/* <Button
          variant="outline"
          size="sm"
          fullWidth
          className="h-8 shadow-none"
          onClick={() =>
            router.push(`/vendor/${vendorId}/dashboard/products/form`)
          }
        >
          Create
        </Button> */}
      </div>
    </div>
  );
};

export default ProductNavHeader;

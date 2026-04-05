"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  RadioGroup,
  Label,
  Radio,
  Description,
  Spinner,
} from "@heroui/react";
import { useAddToCart } from "@/hooks/use-cart";
import type { AddToCartInput } from "@/zod-schema/cart-schema";
import clsx from "clsx";
import { ShoppingCart } from "@gravity-ui/icons";

type Variant = {
  id: string;
  name: string;
  stock: number;
  options: string;
  price: string | null;
};

type Props = {
  variants: Variant[];
  productId: string;
  quantity?: number;
};

export default function AddToCartWithVariant({
  variants,
  productId,
  quantity = 1,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const { mutate: addToCart, isPending } = useAddToCart();

  const selectedVariant = variants.find((v) => v.id === selected);

  const handlePress = () => {
    if (!selectedVariant) {
      return;
    }
    const input: AddToCartInput = {
      productId,
      variantId: selectedVariant.id ?? null,
      quantity,
    };

    addToCart(input);
  };

  return (
    <Modal>
      <Button className="bg-primary hover:bg-primary/90 text-primary-foreground group w-full font-semibold transition-all">
        <ShoppingCart className="mr-2" />
        Select Variant
      </Button>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-lg">
            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Heading className="text-xl font-bold">
                Select Variant
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body className="">
              <RadioGroup
                value={selected ?? undefined}
                onChange={setSelected}
                className=""
              >
                {variants.map((variant) => {
                  const isOutOfStock = variant.stock <= 0;

                  return (
                    <Radio
                      key={variant.id}
                      value={variant.id}
                      isDisabled={isOutOfStock}
                      className={clsx(
                        "group relative flex w-full cursor-pointer flex-col rounded-xl border-2 px-5 py-4 shadow-sm transition-all",
                        "border-border bg-surface hover:border-default-400 hover:bg-default-50/50",
                        "data-[selected=true]:border-accent data-[selected=true]:bg-accent/5 data-[selected=true]:shadow-md",
                        "data-[focus-visible=true]:ring-accent data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-offset-2",
                        isOutOfStock &&
                          "hover:border-border hover:bg-surface cursor-not-allowed opacity-50 grayscale",
                      )}
                    >
                      <Radio.Control className="absolute top-5 right-5 size-5">
                        <Radio.Indicator />
                      </Radio.Control>

                      <Radio.Content className="flex w-full flex-col gap-1 pr-8">
                        <div className="flex w-full items-start justify-between">
                          <Label className="text-foreground cursor-pointer text-base font-semibold tracking-tight">
                            {variant.name}
                          </Label>
                          <span className="text-foreground text-lg font-bold">
                            ${variant.price ?? "—"}
                          </span>
                        </div>

                        <Description className="text-muted-foreground text-sm">
                          {variant.options}
                        </Description>

                        <div className="mt-2 flex items-center gap-2 text-sm font-medium">
                          <span
                            className={clsx(
                              "size-2 rounded-full",
                              isOutOfStock ? "bg-danger" : "bg-emerald-500",
                            )}
                          />
                          <span
                            className={
                              isOutOfStock
                                ? "text-danger"
                                : "text-emerald-600 dark:text-emerald-500"
                            }
                          >
                            {isOutOfStock
                              ? "Out of stock"
                              : `${variant.stock} in stock`}
                          </span>
                        </div>
                      </Radio.Content>
                    </Radio>
                  );
                })}
              </RadioGroup>
            </Modal.Body>

            {/* FOOTER */}
            <Modal.Footer className="border-border bg-default-50/50 flex items-center justify-between border-t py-4">
              <div className="text-muted-foreground text-sm">
                {selectedVariant ? (
                  <div className="flex flex-col">
                    <span className="text-xs tracking-wider uppercase">
                      Total
                    </span>
                    <span className="text-foreground text-lg font-bold">
                      ${selectedVariant.price ?? "—"}
                    </span>
                  </div>
                ) : (
                  "Select a variant to continue"
                )}
              </div>

              <Button
                // isDisabled={!selectedVariant || isPending}
                onPress={handlePress}
                className={clsx(
                  "font-semibold",
                  selectedVariant
                    ? "bg-accent text-accent-foreground hover:bg-accent/90 shadow-md"
                    : "bg-default-200 text-default-500",
                )}
              >
                Add to Cart
                {/* {isPending ? (
                  <Spinner color="current" size="sm" />
                ) : (
                  <ShoppingCart className="mr-2 size-4" />
                )}
                {isPending ? "Adding..." : "Add to Cart"} */}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

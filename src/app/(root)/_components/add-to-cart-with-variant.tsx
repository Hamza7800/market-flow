"use client";

import { useState } from "react";
import {
  Button,
  Modal,
  Chip,
  RadioGroup,
  Label,
  Radio,
  Description,
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
};

export default function AddToCartWithVariant({ variants, productId }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const { mutate: addToCart, isPending } = useAddToCart();

  const handlePress = () => {
    if (!selectedVariant) {
      return;
    }
    const input: AddToCartInput = {
      productId,
      variantId: selectedVariant.id ?? null,
      quantity: 1,
    };

    addToCart(input);
  };

  const selectedVariant = variants.find((v) => v.id === selected);

  return (
    <Modal>
      <Button
        size="sm"
        className="bg-primary hover:bg-primary/90 text-primary-foreground group w-full font-semibold"
      >
        <ShoppingCart className="mr-2" />
        Add to Cart
      </Button>

      <Modal.Backdrop>
        <Modal.Container>
          <Modal.Dialog className="max-w-lg">
            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Heading>Select Variant</Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <RadioGroup value={selected ?? undefined} onChange={setSelected}>
                {variants.map((variant) => {
                  const isOutOfStock = variant.stock <= 0;

                  return (
                    <Radio
                      key={variant.id}
                      value={variant.id}
                      isDisabled={isOutOfStock}
                      className={clsx(
                        "group bg-surface relative flex-col gap-4 rounded-xl border px-5 py-4 transition-all",
                        "data-[selected=true]:border-accent data-[selected=true]:bg-accent/10",
                        "data-[focus-visible=true]:border-accent data-[focus-visible=true]:bg-accent/10",
                        isOutOfStock && "opacity-50",
                      )}
                    >
                      {/* radio indicator */}
                      <Radio.Control className="absolute top-3 right-4 size-5">
                        <Radio.Indicator />
                      </Radio.Control>

                      {/* content */}
                      <Radio.Content className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label>{variant.name}</Label>
                          </div>

                          <div className="text-right"></div>
                        </div>
                        <Description>{variant.options}</Description>

                        {/* stock */}
                        <div className="text-default-500 flex items-center gap-3 text-xs">
                          {isOutOfStock
                            ? "Out of stock"
                            : `${variant.stock} in stock`}
                          <p className="text-sm font-semibold">
                            ${variant.price ?? "—"}
                          </p>
                        </div>
                      </Radio.Content>
                    </Radio>
                  );
                })}
              </RadioGroup>
            </Modal.Body>

            {/* FOOTER */}
            <Modal.Footer className="flex items-center justify-between">
              <div className="text-default-500 text-sm">
                {selectedVariant ? (
                  <>
                    Selected:{" "}
                    <span className="font-medium">{selectedVariant.name}</span>
                  </>
                ) : (
                  "Select a variant"
                )}
              </div>

              <Button
                isDisabled={!selectedVariant || isPending}
                onPress={handlePress}
              >
                Add to Cart
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

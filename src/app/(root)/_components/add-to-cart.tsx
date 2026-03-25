"use client";

import { Button } from "@heroui/react";
import { useAddToCart } from "@/hooks/use-cart";
import type { AddToCartInput } from "@/zod-schema/cart-schema";

type AddToCartButtonProps = {
  productId: string;
  variantId?: string;
  quantity?: number;
  disabled?: boolean;
  fullWidth?: boolean;
  label?: string;
};

export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  disabled = false,
  fullWidth = false,
  label = "Add to cart",
}: AddToCartButtonProps) {
  const { mutate: addToCart, isPending } = useAddToCart();

  const handlePress = () => {
    const input: AddToCartInput = {
      productId,
      variantId: variantId ?? null,
      quantity,
    };

    addToCart(input);
  };
  return (
    <Button
      fullWidth={fullWidth}
      isDisabled={disabled || isPending}
      onPress={handlePress}
      className="font-medium"
    >
      {isPending ? "Adding..." : label}
    </Button>
  );
}

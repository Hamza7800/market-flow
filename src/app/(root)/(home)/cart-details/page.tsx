"use client";
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItems,
} from "@/hooks/use-cart";
import { Button, Spinner } from "@heroui/react";
import { CartItemRow } from "../../_components/cart-item";
import { LoadingState } from "@/components/loading-state";
import MaxWidthContainer from "@/components/max-w-container";

const CartDetails = () => {
  const { data: cart, isPending } = useCart();
  const clearItems = useClearCart();

  const updateItem = useUpdateCartItems();
  const removeItem = useRemoveCartItem();

  if (isPending) {
    return (
      <div className="h-dvh">
        <LoadingState />
      </div>
    );
  }

  const items = cart?.items;

  if (!items?.length) {
    return <h2>No Items</h2>;
  }

  return (
    <MaxWidthContainer className="pb-10">
      {items.map((item) => (
        <CartItemRow
          key={item.id}
          item={item}
          onUpdate={(qty) =>
            updateItem.mutate({
              cartItemId: item.id,
              quantity: qty,
            })
          }
          onRemove={() => removeItem.mutate(item.id)}
          isPending={updateItem.isPending || removeItem.isPending}
        />
      ))}

      <div className="flex items-center justify-end gap-3">
        <Button variant="secondary">Checkout</Button>
        <Button size="sm" onPress={() => clearItems.mutate()}>
          Clear cart
        </Button>
      </div>
    </MaxWidthContainer>
  );
};

export default CartDetails;

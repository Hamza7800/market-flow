"use client";
import { Badge, Button, Chip, Drawer, Skeleton } from "@heroui/react";
import { ShoppingBag } from "@gravity-ui/icons";
import { LinkButton } from "@/components/link-button";
import {
  getCartItemCount,
  getCartSubtotal,
  getItemPrice,
  getItemTotal,
  useCart,
  useRemoveCartItem,
  useUpdateCartItems,
} from "@/hooks/use-cart";
import { useCartStore } from "@/zustand/cart-store";
import Image from "next/image";
import { MinusIcon, PlusIcon, ShoppingBagIcon, Trash2Icon } from "lucide-react";
import type { CartItem } from "@/lib/types";
import Link from "next/link";
import { CartItemRow } from "./cart-item";

const CartDrawer = () => {
  const { isOpen, closeCart, setIsOpen } = useCartStore();
  const { data: cart, isLoading } = useCart();

  const updateItem = useUpdateCartItems();
  const removeItem = useRemoveCartItem();

  const items = cart?.items ?? [];
  const subtotal = getCartSubtotal(items);
  const isEmpty = items.length === 0;

  return (
    <Drawer isOpen={isOpen} onOpenChange={setIsOpen}>
      <Badge.Anchor>
        <Button variant="outline">
          <ShoppingBag />
        </Button>
        <Badge color="accent" size="sm">
          {getCartItemCount(items)}
        </Badge>
      </Badge.Anchor>

      <Drawer.Backdrop>
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>
                <div className="flex items-center gap-2">
                  <ShoppingBagIcon className="h-5 w-5" />
                  <span className="text-base font-semibold">Your cart</span>
                  {items.length > 0 && (
                    <Chip size="sm" className="h-5 px-1.5 text-xs">
                      {getCartItemCount(items)}
                    </Chip>
                  )}
                </div>
              </Drawer.Heading>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body>
              {isLoading && (
                <div className="space-y-4 pt-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-20 w-20 shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-2 pt-1">
                        <Skeleton className="h-4 w-3/4 rounded" />
                        <Skeleton className="h-3 w-1/2 rounded" />
                        <Skeleton className="h-3 w-1/4 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isLoading && isEmpty && (
                <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
                  <div className="bg-default-100 flex h-16 w-16 items-center justify-center rounded-full">
                    <ShoppingBagIcon className="text-default-400 h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-foreground font-medium">
                      Your cart is empty
                    </p>
                    <p className="text-default-400 mt-1 text-sm">
                      Add something to get started
                    </p>
                  </div>
                  <Button size="sm" onPress={closeCart}>
                    Browse products
                  </Button>
                </div>
              )}

              {!isLoading && !isEmpty && (
                <div className="divide-divider divide-y">
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
                </div>
              )}
            </Drawer.Body>
            <Drawer.Footer className="flex-col items-start">
              <div className="flex w-full items-center justify-between gap-3 text-sm">
                <span className="text-default-500">Subtotal</span>
                <span className="text-lg font-semibold">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <p className="text-default-400 text-xs">
                Taxes and shipping calculated at checkout
              </p>
              {/* <Button fullWidth variant="secondary">
                Checkout
              </Button> */}
              {/* <Button size="sm" fullWidth onPress={() => clearItems.mutate()}>
                Clear cart
              </Button> */}
              <LinkButton
                href="/cart-details"
                onClick={closeCart}
                size="md"
                fullWidth
              >
                View full cart
              </LinkButton>
            </Drawer.Footer>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
};

export default CartDrawer;

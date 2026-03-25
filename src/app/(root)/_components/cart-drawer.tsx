"use client";
import {
  Badge,
  Button,
  Chip,
  Drawer,
  Separator,
  Skeleton,
} from "@heroui/react";
import { Minus, Plus, ShoppingBag } from "@gravity-ui/icons";
import { LinkButton } from "@/components/link-button";
import {
  getCartItemCount,
  getCartSubtotal,
  getItemPrice,
  getItemTotal,
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItems,
} from "@/hooks/use-cart";
import {
  selectIsRemoving,
  selectIsUpdating,
  useCartStore,
} from "@/zustand/cart-store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  Trash2,
  Trash2Icon,
} from "lucide-react";
import type { CartItem } from "@/lib/types";
import Link from "next/link";

const CartDrawer = () => {
  const { isOpen, closeCart, setIsOpen } = useCartStore();
  const { data: cart, isLoading } = useCart();

  const updateItem = useUpdateCartItems();
  const removeItem = useRemoveCartItem();
  const clearItems = useClearCart();

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

type CartItemRowProps = {
  item: CartItem;
  onUpdate: (qty: number) => void;
  onRemove: () => void;
  isPending: boolean;
};

function CartItemRow({
  item,
  onUpdate,
  onRemove,
  isPending,
}: CartItemRowProps) {
  const price = getItemPrice(item);
  const total = getItemTotal(item);
  const image = item.product.images?.[0];
  const isOptimistic = item.id.startsWith("optimistic-");

  return (
    <div
      className={[
        "flex gap-3 py-4 transition-opacity",
        isPending || isOptimistic ? "opacity-60" : "",
      ].join(" ")}
    >
      {/* Thumbnail */}
      <div className="bg-default-100 relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
        {image ? (
          <Image
            src={
              image.url ?? "https://picsum.photos/seed/artisan-banner/1200/400"
            }
            alt={image.altText ?? item.product.name}
            className="h-full w-full object-cover"
            fill
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBagIcon className="text-default-300 h-6 w-6" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={`/products/${item.product.slug}`}
          className="line-clamp-1 text-sm font-medium hover:underline"
        >
          {isOptimistic ? (
            <Skeleton className="h-4 w-3/4 rounded" />
          ) : (
            item.product.name
          )}
        </Link>

        {item.variant && (
          <p className="text-default-400 text-xs">{item.variant.name}</p>
        )}

        <div className="flex items-center justify-between">
          <p className="text-default-500 text-xs">${price.toFixed(2)} ea.</p>
          <p className="text-sm font-semibold">${total.toFixed(2)}</p>
        </div>

        {/* Quantity controls + remove */}
        <div className="mt-1 flex items-center gap-2">
          <div className="border-divider flex items-center gap-1 rounded-lg border p-0.5">
            <Button
              isIconOnly
              size="sm"
              className="h-6 w-6 min-w-6"
              onPress={() => onUpdate(item.quantity - 1)}
              isDisabled={isPending || isOptimistic}
              aria-label="Decrease quantity"
            >
              <MinusIcon className="h-3 w-3" />
            </Button>
            <span className="min-w-[20px] text-center text-xs font-medium tabular-nums">
              {item.quantity}
            </span>
            <Button
              isIconOnly
              size="sm"
              className="h-6 w-6 min-w-6"
              onPress={() => onUpdate(item.quantity + 1)}
              isDisabled={isPending || isOptimistic}
              aria-label="Increase quantity"
            >
              <PlusIcon className="h-3 w-3" />
            </Button>
          </div>

          <Button
            isIconOnly
            size="sm"
            className="h-6 w-6 min-w-6"
            onPress={onRemove}
            isDisabled={isPending || isOptimistic}
            aria-label="Remove item"
          >
            <Trash2Icon className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

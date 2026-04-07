"use client";
import {
  Badge,
  Button,
  Chip,
  Drawer,
  Skeleton,
  useOverlayState,
} from "@heroui/react";
import { ShoppingBag } from "@gravity-ui/icons";
import { LinkButton } from "@/components/link-button";
import {
  getCartItemCount,
  getCartSubtotal,
  // getItemPrice,
  // getItemTotal,
  useCart,
  // useRemoveCartItem,
  // useUpdateCartItems,
} from "@/hooks/use-cart";
import { useCartStore } from "@/zustand/cart-store";
import Image from "next/image";
import {
  AlertCircleIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  Trash2Icon,
} from "lucide-react";
// import type { CartItem } from "@/lib/types";
import Link from "next/link";
import CartItemRow from "./cart-item";
import { useRouter } from "nextjs-toploader/app";
import { usePathname } from "next/navigation";
import { authClient } from "@/server/better-auth/client";
import { EmptyState } from "@/components/empty-state";

const CartDrawer = () => {
  const router = useRouter();
  const state = useOverlayState();
  const pathname = usePathname();
  const { data: userAuth, isPending } = authClient.useSession();
  const userId = userAuth?.user.id;

  // const { isOpen, closeCart, setIsOpen } = useCartStore();
  const { data: cart, isLoading } = useCart();

  // const updateItem = useUpdateCartItems();
  // const removeItem = useRemoveCartItem();

  const items = cart?.items ?? [];
  const subtotal = getCartSubtotal(items);
  const isEmpty = items.length === 0;

  const drawerBody = () => {
    if (!isPending && !userId) {
      return (
        <EmptyState
          icon={AlertCircleIcon}
          title="Login"
          className="h-full"
          description="Please login to continue"
          action={{
            label: "Sign In",
            onClick: () =>
              router.push(`/sign-in?${encodeURIComponent(pathname)}`),
          }}
        />
      );
    }

    if (!isLoading && isEmpty) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="bg-default-100 flex h-16 w-16 items-center justify-center rounded-full">
            <ShoppingBagIcon className="text-default-400 h-7 w-7" />
          </div>
          <div>
            <p className="text-foreground font-medium">Your cart is empty</p>
            <p className="text-default-400 mt-1 text-sm">
              Add something to get started
            </p>
          </div>
          <Button size="sm" onPress={state.close}>
            Browse products
          </Button>
        </div>
      );
    }

    if (!isLoading && !isEmpty) {
      return (
        <div className="divide-divider divide-y">
          {items.map((item) => (
            <CartItemRow
              onClick={state.close}
              key={item.id}
              item={item}
              variant="drawer"
            />
          ))}
        </div>
      );
    }
  };

  return (
    <Drawer isOpen={state.isOpen} onOpenChange={state.setOpen}>
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

              {drawerBody()}
            </Drawer.Body>
            {userId && (
              <Drawer.Footer className="flex-col items-start">
                <div className="flex w-full items-center justify-between gap-3 text-sm">
                  <span className="text-default-500">Subtotal</span>
                  <span className="text-lg font-semibold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                {/* <p className="text-default-400 text-xs">
                Taxes and shipping calculated at checkout
              </p> */}
                <div className="flex w-full items-center gap-2">
                  <LinkButton
                    href="/cart-details"
                    onClick={state.close}
                    size="md"
                    fullWidth
                    variant="outline"
                  >
                    View cart
                  </LinkButton>
                  <LinkButton
                    href="/checkout"
                    onClick={state.close}
                    size="md"
                    fullWidth
                  >
                    Checkout
                  </LinkButton>
                </div>
              </Drawer.Footer>
            )}
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
};

export default CartDrawer;

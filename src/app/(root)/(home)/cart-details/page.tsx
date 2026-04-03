"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Ship,
  Lock,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "nextjs-toploader/app";
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItems,
  getItemPrice,
  getItemTotal,
} from "@/hooks/use-cart";
import { LoadingState } from "@/components/loading-state";
import { Button, Card } from "@heroui/react";
import { LinkButton } from "@/components/link-button";
import CartItemRow from "../../_components/cart-item";

export default function CartDetails() {
  const router = useRouter();
  const { data: cart, isPending } = useCart();
  const clearItems = useClearCart();
  // const updateItem = useUpdateCartItems();
  // const removeItem = useRemoveCartItem();

  // const [promoCode, setPromoCode] = useState("");
  // const [showPromoInput, setShowPromoInput] = useState(false);

  // Loading State
  if (isPending) {
    return (
      <div className="flex h-dvh items-center justify-center">
        <LoadingState />
      </div>
    );
  }

  const items = cart?.items || [];

  // Derived Values
  const subtotal = items.reduce((sum, item) => sum + getItemTotal(item), 0);
  // const shipping = subtotal > 100 ? 0 : 9.99;
  // const tax = subtotal * 0.08;

  // Handle applied discount from your cart schema
  let discount = 0;
  if (cart?.discountCode) {
    const value = parseFloat(cart.discountCode.value);
    if (cart.discountCode.type === "fixed") {
      discount = value;
    } else if (cart.discountCode.type === "percentage") {
      discount = subtotal * (value / 100);
    }
  }

  const total = Math.max(0, subtotal - discount);

  // Empty State
  if (items.length === 0) {
    return (
      <main className="min-h-screen">
        <div className="px-4 py-8 md:px-8">
          <div className="mx-auto max-w-6xl">
            <Link
              href="/"
              className="text-accent flex w-fit items-center gap-2 text-sm hover:underline"
            >
              <ArrowLeft size={13} /> Back to Home
            </Link>

            <div className="py-16 text-center">
              <ShoppingCart
                size={64}
                className="text-muted mx-auto mb-4 opacity-50"
              />
              <h1 className="text-foreground mb-3 text-3xl font-bold">
                Your cart is empty
              </h1>
              <p className="text-muted-foreground mb-8">
                Start shopping to add items to your cart
              </p>
              <Link
                href="/products"
                className="bg-accent hover:bg-accent/90 text-accent-foreground inline-flex cursor-pointer items-center gap-2 rounded-lg px-8 py-3 font-semibold transition-colors"
              >
                Continue Shopping
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Populated Cart State
  return (
    <main className="min-h-screen py-3 pb-16">
      <div className="mb-8 flex flex-col justify-between gap-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-accent flex w-fit items-center gap-2 text-sm hover:underline"
          >
            <ArrowLeft size={13} /> Back to Home
          </Link>
          <Button
            onClick={() => clearItems.mutate()}
            isDisabled={clearItems.isPending}
            variant="danger-soft"
            size="sm"
            // className="cursor-pointer text-sm text-red-500 transition-colors hover:text-red-600 hover:underline disabled:opacity-50"
          >
            Clear Cart
          </Button>
        </div>
        <h1 className="text-foreground mt-4 flex items-center gap-3 text-3xl font-bold md:text-4xl">
          <ShoppingCart size={32} className="text-accent" />
          Shopping Cart
        </h1>
        <p className="text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"} in your cart
        </p>
      </div>

      {/* TRUST BADGES */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="bg-surface border-border flex items-center gap-3 rounded-lg border p-4">
          <Ship size={20} className="text-accent" />
          <div>
            <div className="text-foreground text-sm font-semibold">
              Free Shipping
            </div>
            <div className="text-muted text-xs">On all Orders</div>
          </div>
        </div>
        <div className="bg-surface border-border flex items-center gap-3 rounded-lg border p-4">
          <Lock size={20} className="text-accent" />
          <div>
            <div className="text-foreground text-sm font-semibold">
              Secure Checkout
            </div>
            <div className="text-muted text-xs">SSL encrypted payment</div>
          </div>
        </div>
        <div className="bg-surface border-border flex items-center gap-3 rounded-lg border p-4">
          <AlertCircle size={20} className="text-accent" />
          <div>
            <div className="text-foreground text-sm font-semibold">
              30-Day Returns
            </div>
            <div className="text-muted text-xs">Hassle-free returns</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* CART ITEMS */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            return <CartItemRow key={item.id} item={item} />;
          })}
        </div>

        {/* PRICE SUMMARY */}
        <div className="lg:col-span-1">
          <Card className="border-border sticky top-14 border p-0">
            <Card.Header className="border-border border-b p-6">
              <h2 className="text-foreground mb-6 text-xl font-bold">
                Order Summary
              </h2>

              <div className="mb-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-foreground font-semibold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                {cart?.discountCode && discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount{" "}
                      {cart.discountCode.type === "percentage" &&
                        `(${cart.discountCode.value}%)`}
                    </span>
                    <span className="font-semibold">
                      -${discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted">
                    Shipping{" "}
                    {subtotal > 100 && (
                      <span className="text-green-600">(Free)</span>
                    )}
                  </span>
                  {/* <span className="text-foreground font-semibold">
                        {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                      </span> */}
                </div>
                {/* <div className="flex justify-between">
                      <span className="text-muted">Tax</span>
                      <span className="text-foreground font-semibold">
                        ${tax.toFixed(2)}
                      </span>
                    </div> */}
              </div>
            </Card.Header>

            <Card.Content className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <span className="text-foreground text-lg font-semibold">
                  Total
                </span>
                <span className="text-accent text-3xl font-bold">
                  ${total.toFixed(2)}
                </span>
              </div>

              <LinkButton
                href="/checkout"
                fullWidth
                // onClick={() => router.push("/checkout")}
                // className="bg-accent hover:bg-accent/90 text-accent-foreground mb-2 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold transition-colors"
              >
                Proceed to Checkout
                <ArrowRight size={18} />
              </LinkButton>

              <LinkButton
                href="/products"
                fullWidth
                variant="outline"
                className="shadow-none"
                // className="border-border text-foreground hover:bg-muted block w-full cursor-pointer rounded-lg border px-6 py-3 text-center font-semibold transition-colors"
              >
                Continue Shopping
              </LinkButton>
            </Card.Content>

            {/* FEATURES */}
            <Card.Footer className="border-border flex-col items-start space-y-3 border-t px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <span className="text-xs font-bold text-green-600">✓</span>
                </div>
                <p className="text-muted text-xs">
                  All products verified and authentic
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <span className="text-xs font-bold text-green-600">✓</span>
                </div>
                <p className="text-muted text-xs">Secure payment processing</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                  <span className="text-xs font-bold text-green-600">✓</span>
                </div>
                <p className="text-muted text-xs">24/7 customer support</p>
              </div>
            </Card.Footer>
          </Card>
        </div>
      </div>
    </main>
  );
}

// "use client";
// import {
//   useCart,
//   useClearCart,
//   useRemoveCartItem,
//   useUpdateCartItems,
// } from "@/hooks/use-cart";
// import { Button, Spinner } from "@heroui/react";
// import { CartItemRow } from "../../_components/cart-item";
// import { LoadingState } from "@/components/loading-state";
// import MaxWidthContainer from "@/components/max-w-container";
// import { useRouter } from "nextjs-toploader/app";

// const CartDetails = () => {
//   const router = useRouter();
//   const { data: cart, isPending } = useCart();
//   const clearItems = useClearCart();

//   const updateItem = useUpdateCartItems();
//   const removeItem = useRemoveCartItem();

//   if (isPending) {
//     return (
//       <div className="h-dvh">
//         <LoadingState />
//       </div>
//     );
//   }

//   const items = cart?.items;

//   if (!items?.length) {
//     return <h2>No Items</h2>;
//   }

//   return (
//     <MaxWidthContainer className="pb-10">
//       {items.map((item) => (
//         <CartItemRow
//           key={item.id}
//           item={item}
//           onUpdate={(qty) =>
//             updateItem.mutate({
//               cartItemId: item.id,
//               quantity: qty,
//             })
//           }
//           onRemove={() => removeItem.mutate(item.id)}
//           isPending={updateItem.isPending || removeItem.isPending}
//         />
//       ))}

//       <div className="flex items-center justify-end gap-3">
//         <Button onClick={() => router.push("/checkout")} variant="secondary">
//           Checkout
//         </Button>
//         <Button size="sm" onPress={() => clearItems.mutate()}>
//           Clear cart
//         </Button>
//       </div>
//     </MaxWidthContainer>
//   );
// };

// export default CartDetails;

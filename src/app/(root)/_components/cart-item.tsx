import {
  getItemPrice,
  getItemTotal,
  useRemoveCartItem,
  useUpdateCartItems,
} from "@/hooks/use-cart";
import type { CartItem } from "@/lib/types";
import { Button, Card, Skeleton } from "@heroui/react";
import { MinusIcon, PlusIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const CartItemRow = ({
  item,
  variant = "default",
}: {
  item: CartItem;
  variant?: "default" | "drawer";
}) => {
  const updateItem = useUpdateCartItems();
  const removeItem = useRemoveCartItem();

  const handleUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty < 1) {
      removeItem.mutate(cartItemId);
      return;
    }
    updateItem.mutate({ cartItemId, quantity: newQty });
  };

  const price = getItemPrice(item);
  const total = getItemTotal(item);
  const image = item.product.images?.[0];
  const isOptimistic = item.id.startsWith("optimistic-");
  const isItemPending =
    updateItem.isPending || removeItem.isPending || isOptimistic;

  if (variant === "drawer") {
    return (
      <div
        key={item.id}
        className={`border-border flex items-start gap-3 border-b py-4 transition-all last:border-b-0`}
      >
        {/* PRODUCT IMAGE (Shrunken for Drawer) */}
        <div className="border-border relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-white/30">
          <Image
            src={
              image?.url ?? "https://picsum.photos/seed/artisan-banner/1200/400"
            }
            alt={image?.altText ?? item.product.name}
            className="object-cover"
            fill
            sizes="64px"
          />
        </div>

        {/* DETAILS SECTION */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-col gap-0.5">
              {isOptimistic ? (
                <Skeleton className="h-4 w-24 rounded" />
              ) : (
                <Link
                  href={`/products/${item.product.id}`}
                  className="text-foreground hover:text-accent line-clamp-1 text-sm font-medium transition-colors"
                >
                  {item.product.name}
                </Link>
              )}
              {item.variant && (
                <p className="text-muted-foreground truncate text-xs">
                  {item.variant.name}
                </p>
              )}
            </div>

            {/* REMOVE BUTTON (Compact in Drawer) */}
            <Button
              isIconOnly
              size="sm"
              variant="danger-soft"
              className="hover:bg-danger-50 h-7 w-7 min-w-7"
              onClick={() => removeItem.mutate(item.id)}
              // isDisabled={isItemPending}
              aria-label="Remove item"
            >
              <Trash2 size={14} />
            </Button>
          </div>

          {/* QUANTITY & PRICE ROW */}
          <div className="flex items-center justify-between gap-2">
            {/* Minimalist Quantity Controls */}
            <div className="flex items-center gap-0.5 p-0.5">
              <Button
                isIconOnly
                size="sm"
                variant="outline"
                className="h-6 w-6 min-w-6 rounded-[4px]"
                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                // isDisabled={isItemPending}
                aria-label="Decrease quantity"
              >
                <MinusIcon size={12} className="text-foreground" />
              </Button>

              <span className="text-foreground w-6 text-center text-xs font-semibold tabular-nums">
                {item.quantity}
              </span>

              <Button
                // variant="light"
                isIconOnly
                variant="outline"
                size="sm"
                className="h-6 w-6 min-w-6 rounded-[4px]"
                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                // isDisabled={isItemPending}
                aria-label="Increase quantity"
              >
                <PlusIcon size={12} className="text-foreground" />
              </Button>
            </div>

            {/* TOTAL PRICE (Smaller in Drawer) */}
            <div className="text-foreground font-boldtabular-nums text-sm">
              ${total.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "default")
    return (
      <Card
        key={item.id}
        className={`border-border overflow-hidden border p-0 transition-all ${
          isItemPending ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <Card.Content className="flex gap-6 p-6 sm:flex-row">
          {/* PRODUCT IMAGE */}
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-white/30">
            <Image
              src={
                image?.url ??
                "https://picsum.photos/seed/artisan-banner/1200/400"
              }
              alt={image?.altText ?? item.product.name}
              className="object-cover"
              fill
            />
          </div>

          {/* PRODUCT DETAILS */}
          <div className="flex flex-1 flex-col justify-between">
            <div>
              <Link
                href={`/products/${item.product.id}`}
                className="text-foreground hover:text-accent line-clamp-1 w-fit text-lg font-semibold transition-colors"
              >
                {item.product.name}
              </Link>

              {item.variant && (
                <div className="text-muted mt-2 text-xs">
                  Variant: {item.variant.name}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-foreground text-2xl font-bold">
                ${price.toFixed(2)}
              </div>
              <div className="flex items-center gap-3">
                <div className="border-border flex items-center gap-2 rounded-lg border p-1">
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity - 1)
                    }
                    disabled={isItemPending}
                    className="hover:bg-background cursor-pointer rounded p-1 transition-colors disabled:opacity-50"
                    aria-label="Decrease quantity"
                  >
                    <MinusIcon size={16} className="text-foreground" />
                  </button>
                  <span className="text-foreground w-8 text-center font-semibold tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.id, item.quantity + 1)
                    }
                    disabled={isItemPending}
                    className="hover:bg-background cursor-pointer rounded p-1 transition-colors disabled:opacity-50"
                    aria-label="Increase quantity"
                  >
                    <PlusIcon size={16} className="text-foreground" />
                  </button>
                </div>
                <Button
                  variant="danger-soft"
                  isIconOnly
                  size="sm"
                  onClick={() => removeItem.mutate(item.id)}
                  isDisabled={isItemPending}
                  // className="border-border cursor-pointer rounded-lg border p-2 text-red-500 transition-colors hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          </div>
        </Card.Content>

        {/* ITEM TOTAL */}
        <Card.Footer className="bg-accent/5 border-border flex items-center justify-between border-t px-6 py-3">
          <span className="text-muted text-sm">Item Total</span>
          <span className="text-foreground font-bold">${total.toFixed(2)}</span>
        </Card.Footer>
      </Card>
    );
};

export default CartItemRow;

// type CartItemRowProps = {
//   item: CartItem;
//   onUpdate: (qty: number) => void;
//   onRemove: () => void;
//   isPending: boolean;
// };

// export function CartItemRow({
//   item,
//   onUpdate,
//   onRemove,
//   isPending,
// }: CartItemRowProps) {
//   const price = getItemPrice(item);
//   const total = getItemTotal(item);
//   const image = item.product.images?.[0];
//   const isOptimistic = item.id.startsWith("optimistic-");

//   return (
//     <div
//       className={[
//         "flex gap-3 py-4 transition-opacity",
//         isPending || isOptimistic ? "opacity-60" : "",
//       ].join(" ")}
//     >
//       {/* Thumbnail */}
//       <div className="bg-default-100 relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
//         {image ? (
//           <Image
//             src={
//               image.url ?? "https://picsum.photos/seed/artisan-banner/1200/400"
//             }
//             alt={image.altText ?? item.product.name}
//             className="h-full w-full object-cover"
//             fill
//           />
//         ) : (
//           <div className="flex h-full w-full items-center justify-center">
//             <ShoppingBagIcon className="text-default-300 h-6 w-6" />
//           </div>
//         )}
//       </div>

//       {/* Info */}
//       <div className="flex min-w-0 flex-1 flex-col gap-1">
//         <Link
//           href={`/products/${item.product.slug}`}
//           className="line-clamp-1 text-sm font-medium hover:underline"
//         >
//           {isOptimistic ? (
//             <Skeleton className="h-4 w-3/4 rounded" />
//           ) : (
//             item.product.name
//           )}
//         </Link>

//         {item.variant && (
//           <p className="text-default-400 text-xs">{item.variant.name}</p>
//         )}

//         <div className="flex items-center justify-between">
//           <p className="text-default-500 text-xs">${price.toFixed(2)}</p>
//           <p className="text-sm font-semibold">${total.toFixed(2)}</p>
//         </div>

//         {/* Quantity controls + remove */}
//         <div className="mt-1 flex items-center gap-2">
//           <div className="border-divider flex items-center gap-1 rounded-lg border p-0.5">
//             <Button
//               isIconOnly
//               size="sm"
//               className="h-6 w-6 min-w-6"
//               onPress={() => onUpdate(item.quantity - 1)}
//               isDisabled={isPending || isOptimistic}
//               aria-label="Decrease quantity"
//             >
//               <MinusIcon className="h-3 w-3" />
//             </Button>
//             <span className="min-w-[20px] text-center text-xs font-medium tabular-nums">
//               {item.quantity}
//             </span>
//             <Button
//               isIconOnly
//               size="sm"
//               className="h-6 w-6 min-w-6"
//               onPress={() => onUpdate(item.quantity + 1)}
//               isDisabled={isPending || isOptimistic}
//               aria-label="Increase quantity"
//             >
//               <PlusIcon className="h-3 w-3" />
//             </Button>
//           </div>

//           <Button
//             isIconOnly
//             size="sm"
//             className="h-6 w-6 min-w-6"
//             onPress={onRemove}
//             isDisabled={isPending || isOptimistic}
//             aria-label="Remove item"
//           >
//             <Trash2Icon className="h-3 w-3" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }

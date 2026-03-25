import { getItemPrice, getItemTotal } from "@/hooks/use-cart";
import type { CartItem } from "@/lib/types";
import { Skeleton, Button } from "@heroui/react";
import { ShoppingBagIcon, MinusIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type CartItemRowProps = {
  item: CartItem;
  onUpdate: (qty: number) => void;
  onRemove: () => void;
  isPending: boolean;
};

export function CartItemRow({
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

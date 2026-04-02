"use client";

import type { Products } from "@/actions/public";
import { Card, Chip, Button } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";

export function ProductCard({
  product,
}: {
  product: NonNullable<Products>[number];
}) {
  const primaryImage = product.images?.[0]?.url;

  const price = product.hasVariants
    ? Math.min(...product.variants.map((v: any) => Number(v.price)))
    : Number(product.basePrice);

  const totalStock = product.hasVariants
    ? product.variants.reduce((acc: number, v: any) => acc + v.stock, 0)
    : product.stock;

  return (
    <Card className="w-full">
      {/* IMAGE */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={primaryImage || "https://picsum.photos/seed/product/400/400"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500"
        />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          <Chip
            size="sm"
            color={totalStock > 0 ? "success" : "danger"}
            // variant="flat"
          >
            {totalStock > 0 ? `${totalStock} in stock` : "Out"}
          </Chip>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col gap-2 p-4">
        {/* NAME */}
        <Link
          href={`/products/${product.id}`}
          className="text-default-900 line-clamp-1 text-sm font-semibold hover:underline"
        >
          {product.name}
        </Link>

        {/* VENDOR */}
        <p className="text-default-500 text-xs">{product.vendor?.storeName}</p>

        {/* DESCRIPTION */}
        <p className="text-default-400 line-clamp-2 text-xs">
          {product.description}
        </p>

        {/* RATING */}
        <div className="text-warning flex items-center gap-1 text-xs">
          ⭐ {Number(product.averageRating ?? 0).toFixed(1)}
          <span className="text-default-400">({product.reviewCount ?? 0})</span>
        </div>

        {/* PRICE + SOLD */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-end gap-1">
            <span className="text-base font-semibold">${price}</span>
            {product.hasVariants && (
              <span className="text-default-400 text-xs">starting</span>
            )}
          </div>

          <span className="text-default-400 text-xs">
            {product.totalSold ?? 0} sold
          </span>
        </div>
      </div>

      {/* ACTION */}
      <div className="p-3 pt-0">
        <Button
          fullWidth
          size="sm"
          // radius="lg"
          isDisabled={!totalStock}
        >
          {totalStock ? "Add to cart" : "Out of stock"}
        </Button>
      </div>
    </Card>
  );
}

export function ProductsGrid({
  products,
}: {
  products: NonNullable<Products>;
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

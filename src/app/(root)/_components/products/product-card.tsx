"use client";

import type { Products } from "@/actions/public";
import { Button, Card, Chip } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";
import AddToCartWithVariant from "@/app/(root)/_components/add-to-cart-with-variant";
import { AddToCartButton } from "@/app/(root)/_components/add-to-cart";
import { Heart, ShoppingCart, Star } from "@gravity-ui/icons";
import { useState } from "react";

export function ProductCard({
  product,
}: {
  product: NonNullable<Products>[number];
}) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images?.[0]?.url;
  const price = product.hasVariants
    ? Math.min(...(product.variants?.map((v) => Number(v.price)) || []))
    : Number(product.basePrice);

  const totalStock = product.hasVariants
    ? product.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0
    : product.stock || 0;

  const rating = Number(product.averageRating ?? 0);
  const inStock = totalStock > 0;

  return (
    <Card className="group h-full w-full border p-0">
      {/* <Link href={`/products/${product.id}`} className="block h-full"> */}
      <div className="flex h-full flex-col overflow-hidden rounded-lg transition-all duration-300 hover:shadow-lg">
        {/* IMAGE SECTION */}
        <div
          className="bg-muted relative aspect-square flex-shrink-0 overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Image
            src={primaryImage || "https://picsum.photos/seed/product/400/400"}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-transform duration-500 ${
              isHovered ? "scale-110" : "scale-100"
            }`}
          />

          {/* STOCK BADGE */}
          <div className="absolute top-3 right-3">
            <div
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                inStock
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {inStock ? `${totalStock} in stock` : "Out of Stock"}
            </div>
          </div>

          {/* FAVORITE BUTTON */}
          {/* <button
            onClick={(e) => {
              e.preventDefault();
              setIsFavorited(!isFavorited);
            }}
            className="absolute top-3 left-3 rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
          >
            <Heart
              // size={18}
              className={`transition-colors ${
                isFavorited ? "fill-red-500 text-red-500" : "text-gray-400"
              }`}
            />
          </button> */}
        </div>

        {/* CONTENT SECTION */}
        <div className="flex flex-1 flex-col p-4">
          {/* VENDOR INFO */}
          <div className="mb-2">
            <p className="text-primary text-xs font-medium tracking-wide uppercase">
              {product.vendor?.storeName || "Vendor"}
            </p>
          </div>

          {/* PRODUCT NAME */}
          <Link href={`/products/${product.id}`} className="hover:underline">
            <h3 className="text-foreground group-hover:text-primary mb-2 line-clamp-2 text-sm font-semibold transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* DESCRIPTION */}
          {product.description && (
            <p className="text-muted-foreground mb-3 line-clamp-2 text-xs">
              {product.description}
            </p>
          )}

          {/* RATING & REVIEWS */}
          <div className="mb-3 flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  // size={14}
                  className={`${
                    i < Math.round(rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-muted-foreground text-xs">
              {rating.toFixed(1)} ({product.reviewCount || 0})
            </span>
          </div>

          {/* SPACER */}
          <div className="flex-1" />

          {/* PRICE & SOLD */}
          <div className="mb-3 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-foreground text-2xl font-bold">
                ${price.toFixed(2)}
              </span>
              {product.hasVariants && (
                <span className="text-muted-foreground text-xs">
                  Starting price
                </span>
              )}
            </div>
            {product.totalSold !== undefined && (
              <span className="text-muted-foreground text-xs">
                {product.totalSold} sold
              </span>
            )}
          </div>
        </div>

        {/* ADD TO CART BUTTON */}
        {/* {inStock && (
          <div className="p-4 pt-0">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground group w-full font-semibold"
              size="sm"
            >
              <ShoppingCart
                className="mr-2"
              />
              Add to Cart
            </Button>
          </div>
        )} */}
        <div className="p-4 pt-0">
          {!!totalStock &&
            (product.hasVariants ? (
              <AddToCartWithVariant
                productId={product.id}
                variants={product.variants}
              />
            ) : (
              <AddToCartButton productId={product.id} />
            ))}
        </div>
      </div>
      {/* </Link> */}
    </Card>
  );

  // return (
  //   <Card className="w-full p-0">
  //     <Card.Header className="p-0">
  //       <div className="relative aspect-square overflow-hidden">
  //         <Image
  //           src={primaryImage || "https://picsum.photos/seed/product/400/400"}
  //           alt={product.name}
  //           fill
  //           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  //           className="object-cover transition-transform duration-500"
  //         />
  //         {/* Stock Badge */}
  //         <div className="absolute top-3 right-3">
  //           <Chip
  //             size="sm"
  //             color={totalStock > 0 ? "success" : "danger"}
  //             // variant="flat"
  //           >
  //             {totalStock > 0 ? `${totalStock} in stock` : "Out"}
  //           </Chip>
  //         </div>
  //       </div>
  //     </Card.Header>
  //     <Card.Content>
  //       {/* CONTENT */}
  //       <div className="flex flex-col gap-2 p-4">
  //         {/* NAME */}
  //         <Link
  //           href={`/products/${product.id}`}
  //           className="text-default-900 line-clamp-1 text-sm font-semibold hover:underline"
  //         >
  //           {product.name}
  //         </Link>

  //         {/* VENDOR */}
  //         <p className="text-default-500 text-xs">
  //           {product.vendor?.storeName}
  //         </p>

  //         {/* DESCRIPTION */}
  //         <p className="text-default-400 line-clamp-2 text-xs">
  //           {product.description}
  //         </p>

  //         {/* RATING */}
  //         <div className="text-warning flex items-center gap-1 text-xs">
  //           ⭐ {Number(product.averageRating ?? 0).toFixed(1)}
  //           <span className="text-default-400">
  //             ({product.reviewCount ?? 0})
  //           </span>
  //         </div>

  //         {/* PRICE + SOLD */}
  //         <div className="mt-2 flex items-center justify-between">
  //           <div className="flex items-end gap-1">
  //             <span className="text-base font-semibold">${price}</span>
  //             {product.hasVariants && (
  //               <span className="text-default-400 text-xs">starting</span>
  //             )}
  //           </div>

  //           <span className="text-default-400 text-xs">
  //             {product.totalSold ?? 0} sold
  //           </span>
  //         </div>
  //       </div>
  //     </Card.Content>
  //     <Card.Footer>
  // {!!totalStock &&
  //   (product.hasVariants ? (
  //     <AddToCartWithVariant
  //       productId={product.id}
  //       variants={product.variants}
  //     />
  //   ) : (
  //     <AddToCartButton productId={product.id} />
  //   ))}
  //     </Card.Footer>
  //   </Card>
  // );
}

export function ProductsGrid({
  products,
}: {
  products: NonNullable<Products>;
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

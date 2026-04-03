"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useProductDetail } from "@/hooks/use-public";
import { RotateCcw, Star, Truck } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ProductVariants } from "./product-variants";
import { ShoppingCart } from "@gravity-ui/icons";
import ProductVendorCard from "./product-vendor";
import ProductReviews from "./product-reviews";
import ProductsList from "@/app/(root)/_components/products/products-list";
import AddToCartWithVariant from "@/app/(root)/_components/add-to-cart-with-variant";
import { AddToCartButton } from "@/app/(root)/_components/add-to-cart";
import { EmptyState } from "@/components/empty-state";
import { Card, Label, NumberField, Separator } from "@heroui/react";
import Link from "next/link";

// TODO: FIX UI
const ProductDetails = ({ productId }: { productId: string }) => {
  const { data, isPending, isError, error, refetch } =
    useProductDetail(productId);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [mainImage, setMainImage] = useState(data?.images[0]);
  // const [quantity, setQuantity] = useState(1);
  const [quantity, setQuantity] = useState(1);

  const displayPrice = selectedVariant
    ? Number(selectedVariant.price)
    : Number(data?.basePrice);

  // const availableStock = selectedVariant ? selectedVariant.stock : data?.stock;

  const totalStock = data?.hasVariants
    ? data?.variants?.reduce((acc: number, v: any) => acc + v.stock, 0) || 0
    : data?.stock || 0;

  if (isPending) {
    return <LoadingState />;
  }

  if (isError) {
    <ErrorState
      title={"No Product Available"}
      message={error.message}
      onRetry={refetch}
      homeHref={"/"}
    />;
  }

  if (!data) {
    return <EmptyState title="No Product Found" description="" />;
  }

  return (
    <main className="mb-20 min-h-screen">
      {/* BREADCRUMB */}
      <div className="border-border border-b py-4">
        <div className="text-muted mx-auto flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="hover:text-foreground cursor-pointer transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <Link
            href="/products"
            className="hover:text-foreground cursor-pointer transition-colors"
          >
            {data?.category?.name}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate font-medium">
            {data?.name}
          </span>
        </div>
      </div>

      {/* PRODUCT DETAILS SECTION */}
      <section className="py-8">
        <div className="mx-auto grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LEFT: IMAGES */}
          <div className="space-y-4 lg:col-span-2">
            {/* MAIN IMAGE */}
            <div className="bg-muted relative aspect-square overflow-hidden rounded-lg">
              <Image
                src={
                  mainImage?.url || "https://picsum.photos/seed/product/400/400"
                }
                alt={data?.name ?? ""}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* THUMBNAIL GALLERY */}
            <div className="flex gap-2 overflow-x-auto">
              {data?.images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setMainImage(image)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    mainImage?.url === image.url
                      ? "border-accent"
                      : "border-border hover:border-accent/50"
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`View ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO */}
          <Card className="h-fit">
            {/* HEADER INFO */}
            <div>
              <Link
                href={`/vendor/${data?.vendor?.id}`}
                className="text-primary hover:text-accent mb-2 inline-block text-sm font-medium tracking-wide uppercase transition-colors"
              >
                {data?.vendor?.storeName || "Vendor"}
              </Link>
              <h1 className="text-foreground mb-3 text-2xl font-bold md:text-3xl">
                {data?.name}
              </h1>

              {/* RATING */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${
                        i < Math.floor(Number(data?.averageRating))
                          ? "fill-accent text-accent"
                          : "text-border"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted text-sm">
                  {data?.averageRating} ({data?.reviewCount} reviews)
                </span>
              </div>

              {/* SOLD COUNT */}
              <p className="text-muted mb-4 text-sm">
                {data?.totalSold?.toLocaleString()} sold
              </p>
            </div>

            {/* PRICE */}
            <div className="bg-surface border-border rounded-lg border p-4">
              <p className="text-muted mb-2 text-sm">Price</p>
              <div className="flex items-baseline gap-3">
                <span className="text-accent text-3xl font-bold">
                  ${displayPrice.toFixed(2)}
                </span>
                {data?.hasVariants && selectedVariant && (
                  <span className="text-muted text-sm line-through">
                    ${Number(data?.basePrice).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* VARIANTS */}
            {/* <ProductVariants
              variants={data?.variants || []}
              hasVariants={data?.hasVariants}
              basePrice={data?.basePrice}
              onVariantSelect={setSelectedVariant}
            /> */}

            {/* STOCK STATUS */}
            <div className="bg-surface border-border rounded-lg border p-4">
              <div
                className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                  totalStock > 0
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {totalStock > 0 ? `${totalStock} in stock` : "Out of Stock"}
              </div>
            </div>

            {/* QUANTITY AND CTA */}
            <div className="flex items-end gap-3">
              <div>
                <NumberField
                  minValue={1}
                  className={"w-full shadow-none"}
                  name="quantity"
                  value={quantity}
                  onChange={(value) => {
                    setQuantity(Math.min(totalStock, Math.max(1, value || 1)));
                  }}
                >
                  <Label>Quantity</Label>
                  <NumberField.Group
                    className={"border-border border shadow-none"}
                  >
                    <NumberField.DecrementButton />
                    <NumberField.Input />
                    <NumberField.IncrementButton />
                  </NumberField.Group>
                </NumberField>
              </div>

              <div className="pt-0">
                {!!totalStock &&
                  (data.hasVariants ? (
                    <AddToCartWithVariant
                      quantity={quantity}
                      productId={data.id}
                      variants={data.variants}
                    />
                  ) : (
                    <AddToCartButton quantity={quantity} productId={data.id} />
                  ))}
              </div>
            </div>

            {/* TRUST BADGES */}
            <div className="border-border space-y-3 border-t pt-4">
              <div className="flex items-center gap-3 text-sm">
                <Truck size={20} className="text-accent" />
                <span className="text-muted">
                  Free shipping on orders over $50
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw size={20} className="text-accent" />
                <span className="text-muted">30-day money-back guarantee</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* DESCRIPTION AND SPECS */}
      <section className="border-border border-t px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* DESCRIPTION */}
            <div className="lg:col-span-2">
              <h2 className="text-foreground mb-4 text-2xl font-bold">
                About This Product
              </h2>
              <p className="text-muted mb-6 leading-relaxed">
                {data?.description}
              </p>

              {/* KEY FEATURES */}
              <h3 className="text-foreground mb-3 text-lg font-semibold">
                Key Features
              </h3>
              <ul className="text-muted space-y-2">
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Active Noise Cancellation with ambient mode</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>30-hour battery life with fast charging</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Premium comfort padding for extended wear</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-accent font-bold">•</span>
                  <span>Wireless connectivity with multipoint pairing</span>
                </li>
              </ul>
            </div>

            {/* VENDOR CARD */}
            <div>
              <ProductVendorCard vendor={data?.vendor} />
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="py-8">
        <Separator />
        <div className="mx-auto py-14">
          <ProductReviews
            reviews={data?.reviews}
            averageRating={data?.averageRating}
            reviewCount={data?.reviewCount}
          />
        </div>
        <Separator />
      </section>

      {/* SIMILAR PRODUCTS */}
      <div>
        <h2>Similar Products</h2>
        <ProductsList
          category={data?.category?.id ?? ""}
          filters={{
            category: data?.categoryId ?? "",
          }}
        />
      </div>
    </main>
  );

  // return (
  //   <div>
  //     <pre>{JSON.stringify(data, null, 2)}</pre>
  //   </div>
  // );
};

export default ProductDetails;

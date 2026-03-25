import { getProducts } from "@/actions/products";
import { Card, Chip } from "@heroui/react";
import Image from "next/image";
import { AddToCartButton } from "@/app/(root)/_components/add-to-cart";
import AddToCartWithVariant from "@/app/(root)/_components/add-to-cart-with-variant";

export default async function Home() {
  const res = await getProducts();
  const products = res.data;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="mb-8 text-2xl font-semibold">Products</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products?.map((product) => {
          const primaryImage = product.images?.[0]?.url;

          const price = product.hasVariants
            ? Math.min(...product.variants.map((v) => Number(v.price)))
            : Number(product.basePrice);

          const totalStock = product.hasVariants
            ? product.variants.reduce((acc, v) => acc + v.stock, 0)
            : product.stock;

          return (
            <Card
              key={product.id}
              className="group bg-content1 border-none p-0 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {/* IMAGE */}
              <Card.Header className="p-0">
                <div className="relative aspect-square overflow-hidden">
                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                      src={
                        primaryImage ??
                        "https://picsum.photos/seed/artisan-banner/1200/400"
                      }
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* STOCK BADGE */}
                  <div className="absolute top-3 right-3">
                    {totalStock > 0 ? (
                      <Chip size="sm" color="success" variant="secondary">
                        In Stock {totalStock}
                      </Chip>
                    ) : (
                      <Chip size="sm" color="danger" variant="tertiary">
                        Out of Stock {totalStock}
                      </Chip>
                    )}
                  </div>
                </div>
              </Card.Header>

              {/* CONTENT */}
              <Card.Content className="flex flex-col items-start gap-2 p-4">
                {/* NAME */}
                <h3 className="line-clamp-1 text-sm font-semibold">
                  {product.name}
                </h3>

                {/* VENDOR */}
                <p className="text-default-500 text-xs">
                  {product.vendor.storeName}
                </p>

                {/* DESCRIPTION */}
                <p className="text-default-400 line-clamp-2 text-xs">
                  {product.description}
                </p>

                {/* RATING */}
                <div className="text-warning flex items-center gap-1 text-xs">
                  ⭐ {product.averageRating} ({product.reviewCount})
                </div>

                {/* PRICE */}
                <div className="mt-2 flex w-full items-center justify-between">
                  <span className="text-sm font-semibold">
                    ${price}
                    {product.hasVariants && (
                      <span className="text-default-400 ml-1 text-xs">
                        starting
                      </span>
                    )}
                  </span>

                  <span className="text-default-400 text-xs">
                    {product.totalSold} sold
                  </span>
                </div>
              </Card.Content>
              <Card.Footer className="p-2">
                {!!totalStock &&
                  (product.hasVariants ? (
                    <AddToCartWithVariant
                      productId={product.id}
                      variants={product.variants}
                    />
                  ) : (
                    <AddToCartButton productId={product.id} />
                  ))}
              </Card.Footer>
            </Card>
          );
        })}
      </div>
    </main>
  );
}

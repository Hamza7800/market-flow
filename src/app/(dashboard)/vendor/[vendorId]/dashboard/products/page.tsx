import { getVendorProducts } from "@/actions/products";
import { Card, Chip } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";

type s = "draft" | "active" | "archived";

const ProductsPage = async ({
  params,
  searchParams,
}: {
  params: Promise<{ vendorId: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { page, status } = await searchParams;

  const data = await getVendorProducts(status as s, Number(page));
  const { vendorId } = await params;
  const products = data.data;

  return (
    <main className="mx-auto w-full max-w-7xl px-6">
      <div className="flex gap-2">
        <Link
          href={`/vendor/${vendorId}/dashboard/products?status=active&page=1`}
        >
          Active
        </Link>
        <Link
          href={`/vendor/${vendorId}/dashboard/products?status=draft&page=1`}
        >
          Draft
        </Link>
        <Link
          href={`/vendor/${vendorId}/dashboard/products?status=archived&page=1`}
        >
          Archived
        </Link>
        <Link href={`/vendor/${vendorId}/dashboard/products/form`}>Create</Link>
      </div>

      <h1 className="mb-8 text-2xl font-semibold">Products</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
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

                  <div className="absolute top-3 left-3">
                    <Chip size="sm" color="success" variant="secondary">
                      {product.status}
                    </Chip>
                  </div>
                  {/* STOCK BADGE */}
                  <div className="absolute top-3 right-3">
                    {totalStock > 0 ? (
                      <Chip size="sm" color="success" variant="secondary">
                        In Stock
                      </Chip>
                    ) : (
                      <Chip size="sm" color="danger" variant="tertiary">
                        Out of Stock
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
              <Card.Footer>
                <Link
                  href={`/vendor/${vendorId}/dashboard/products/form?productId=${product.id}`}
                >
                  EDIT
                </Link>
              </Card.Footer>
            </Card>
          );
        })}
      </div>
    </main>
  );
};

export default ProductsPage;

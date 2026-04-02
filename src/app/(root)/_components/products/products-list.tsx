"use client";
import { useProducts } from "@/hooks/use-public";
import { Button, Card, Chip, Spinner } from "@heroui/react";
import { AddToCartButton } from "../add-to-cart";
import AddToCartWithVariant from "../add-to-cart-with-variant";
import Image from "next/image";
import { PUBLIC_ROUTES } from "@/lib/consts/constants";
import Link from "next/link";
import { LinkButton } from "@/components/link-button";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import { ProductsGrid } from "./product-card";
import { EmptyState } from "@/components/empty-state";
import { Box } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useQueryStates } from "nuqs";
import { browseClientParams, browseServerParams } from "@/lib/nuqs/public";
import { useMemo, useTransition } from "react";
import { seedStore } from "seed";
import type { ProductFilters } from "@/lib/cache-keys";
import { LoadMoreButton } from "./load-more";

const ProductsList = ({
  category,
  // page,
  filters,
  isHomePage = false,
}: {
  isHomePage?: boolean;
  category: string;
  // page: number;
  filters: ProductFilters;
}) => {
  const router = useRouter();
  const {
    data,
    isError,
    error,
    refetch,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProducts(filters);

  const products = data?.pages.flatMap((page) => page.data) ?? [];
  const safeProducts = products.filter(
    (p): p is NonNullable<typeof p> => p != null,
  );
  // const [{ minPrice, maxPrice, search }] = useQueryStates(browseClientParams);
  // const products = useMemo(() => {
  //   if (!data?.pages) return [];

  //   const seenIds = new Set();
  //   const allProducts = data.pages.flatMap((page) => page.data);

  //   return allProducts.filter((product) => {
  //     if (seenIds.has(product?.id)) return false;
  //     seenIds.add(product?.id);
  //     return true;
  //   });
  // }, [data?.pages]);

  // const filteredProducts = useMemo(() => {
  //   return (
  //     products?.filter((product) => {
  //       // 🔎 SEARCH
  //       if (search?.trim()) {
  //         const q = search.toLowerCase();
  //         const matches =
  //           product?.name.toLowerCase().includes(q) ||
  //           product?.description?.toLowerCase().includes(q);

  //         if (!matches) return false;
  //       }

  //       // 💰 PRICE (handle variants properly)
  //       const price = product?.hasVariants
  //         ? Math.min(...product?.variants.map((v) => Number(v.price)))
  //         : Number(product?.basePrice);

  //       if (minPrice && price < minPrice) return false;
  //       if (maxPrice && price > maxPrice) return false;

  //       return true;
  //     }) ?? []
  //   );
  // }, [products, search, minPrice, maxPrice]);

  if (isPending) {
    return <LoadingState />;
  }

  if (isError) {
    <ErrorState
      title={"No Products"}
      message={error.message}
      onRetry={refetch}
      homeHref={"/"}
    />;
  }

  if (!safeProducts?.length) {
    return (
      <>
        {/* <Button
          onClick={() => {
            seedProducts();
          }}
        >
          Seed
        </Button> */}
        <EmptyState
          icon={Box}
          title="No Products"
          description="No products available yet"
          action={{
            label: "Home",
            onClick: () => router.push("/"),
          }}
        />
      </>
    );
  }

  return (
    <main className="w-full">
      {/* <Button
        onClick={() => {
          seedStore();
        }}
      >
        Seed
      </Button> */}
      <ProductsGrid products={safeProducts} />
      {isHomePage ? (
        <div className="mt-10 flex items-center justify-center">
          <LinkButton
            href={
              category
                ? PUBLIC_ROUTES.browseCategory(category)
                : PUBLIC_ROUTES.browse
            }
          >
            View All Products
          </LinkButton>
        </div>
      ) : (
        <LoadMoreButton
          // hasMore={products.meta.hasMore} isLoading={isPending}
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
          onClick={fetchNextPage}
        />
      )}
    </main>
  );
};

export default ProductsList;

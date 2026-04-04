"use client";

import { LoadMoreButton } from "@/app/(root)/_components/products/load-more";
import { ProductsGrid } from "@/app/(root)/_components/products/product-card";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LinkButton } from "@/components/link-button";
import PublicProductsLoading from "@/components/loading-skeletons/public-products-loading";
import { LoadingState } from "@/components/loading-state";
import { useVendorPublic, useVendorPublicProducts } from "@/hooks/use-public";
import { PUBLIC_ROUTES } from "@/lib/consts/constants";
import { Box } from "@gravity-ui/icons";
import { BoxIcon, Store } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

const VendorProducts = ({ vendorId }: { vendorId: string }) => {
  const { data: vendor, isError: vendorError } = useVendorPublic(vendorId);
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
  } = useVendorPublicProducts(vendorId);
  const products = data?.pages.flatMap((page) => page.data) ?? [];
  const safeProducts = products.filter(
    (p): p is NonNullable<typeof p> => p != null,
  );

  if (isPending) {
    return <PublicProductsLoading />;
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
      <EmptyState
        icon={BoxIcon}
        title="No Products"
        description="No products available yet"
        action={{
          label: "Home",
          onClick: () => router.push("/"),
        }}
      />
    );
  }

  if (vendorError) {
    return null;
  }

  if (!vendor) {
    return (
      <EmptyState
        icon={Store}
        title="Vendor not found"
        action={{
          label: "Back to vendors",
          onClick: () => router.push("/vendors"),
        }}
      />
    );
  }

  return (
    <main className="w-full">
      <h2 className="text-foreground mb-5 text-3xl font-bold md:text-4xl">
        Featured Products
      </h2>
      <ProductsGrid
        // @ts-expect-error type error
        products={safeProducts}
      />
      <div className="mt-10 flex items-center justify-center gap-4">
        <LoadMoreButton
          // hasMore={products.meta.hasMore} isLoading={isPending}
          hasMore={hasNextPage}
          isLoading={isFetchingNextPage}
          onClick={fetchNextPage}
        />
      </div>
    </main>
  );
};

export default VendorProducts;

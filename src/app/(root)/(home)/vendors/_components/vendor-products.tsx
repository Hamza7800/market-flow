"use client";

import { LoadMoreButton } from "@/app/(root)/_components/products/load-more";
import { ProductsGrid } from "@/app/(root)/_components/products/product-card";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { LinkButton } from "@/components/link-button";
import { LoadingState } from "@/components/loading-state";
import { useVendorPublicProducts } from "@/hooks/use-public";
import { PUBLIC_ROUTES } from "@/lib/consts/constants";
import { Box } from "@gravity-ui/icons";
import { BoxIcon } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";

const VendorProducts = ({ vendorId }: { vendorId: string }) => {
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

  return (
    <main className="w-full">
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

import { getVendorProducts } from "@/actions/products";
import ProductsTable from "./_components/products-table";
import {
  loadProductSearchParams,
  type ProductStatus,
} from "@/lib/nuqs/product";
import { Suspense } from "react";
import { LoadingState } from "@/components/loading-state";
import ProductNavHeader from "./_components/product-nav-header";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { productKeys } from "@/lib/cache-keys";
import ProductFilters from "./_components/product-filters";
import { Card, Surface } from "@heroui/react";

type PageProps = {
  params: Promise<{ vendorId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const Content = async ({
  vendorId,
  status,
  page,
}: {
  vendorId: string;
  page: number;
  status: ProductStatus;
}) => {
  // await new Promise((res) => setTimeout(res, 2000));
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: [...productKeys.byVendorAndStatus(vendorId, status), page],
    queryFn: async () => {
      const result = await getVendorProducts(status, page);
      if (!result.success) throw new Error(result.message);
      return result;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductsTable vendorId={vendorId} status={status} page={page} />
    </HydrationBoundary>
  );
};

export default async function ProductsPage({
  params,
  searchParams,
}: PageProps) {
  const [{ vendorId }, { status, page }] = await Promise.all([
    params,
    loadProductSearchParams(searchParams),
  ]);

  return (
    <div>
      <Surface className="mb-2 flex flex-row items-center justify-between rounded-lg p-1">
        <ProductFilters vendorId={vendorId} />
        <ProductNavHeader status={status} vendorId={vendorId} />
      </Surface>
      <Suspense fallback={<LoadingState />}>
        <Content vendorId={vendorId} page={page} status={status} />
      </Suspense>
    </div>
  );
}

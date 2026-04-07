import { getVendorProducts } from "@/actions/products";
import ProductsTable from "@/app/(dashboard)/vendor/[vendorId]/dashboard/products/_components/products-table";
import {
  loadProductSearchParams,
  type ProductStatus,
} from "@/lib/nuqs/product";
import { Suspense } from "react";
import { LoadingState } from "@/components/loading-state";
import ProductNavHeader from "@/app/(dashboard)/vendor/[vendorId]/dashboard/products/_components/product-nav-header";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { productKeys } from "@/lib/cache-keys";
import ProductFilters from "@/app/(dashboard)/vendor/[vendorId]/dashboard/products/_components/product-filters";
import { Surface } from "@heroui/react";
import { LinkButton } from "@/components/link-button";

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
      if (!result.success) {
        throw new Error(result.message);
      }
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
      <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Products
          </h1>
          <p className="text-muted mt-1 text-sm">
            Manage your inventory, track status, and optimize your listings.
          </p>
        </div>

        {/* CTA */}
        <div className="flex gap-2">
          <LinkButton
            className="w-full"
            href={`/vendor/${vendorId}/dashboard/products/form`}
            // className="bg-accent text-accent-foreground rounded-lg px-4 py-2 text-sm font-medium transition hover:opacity-90"
          >
            + Add Product
          </LinkButton>
        </div>
      </div>

      {/* <h2 className="mb-4 text-2xl">Products Management</h2> */}
      <Surface className="mb-4 flex flex-col items-center justify-between gap-4 rounded-lg p-1 md:flex-row">
        <ProductFilters vendorId={vendorId} />
        <ProductNavHeader status={status} vendorId={vendorId} />
      </Surface>
      <Suspense fallback={<LoadingState />}>
        <Content vendorId={vendorId} page={page} status={status} />
      </Suspense>
    </div>
  );
}

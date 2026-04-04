import { getProducts } from "@/actions/public";
import MaxWidthContainer from "@/components/max-w-container";
import { productKeys } from "@/lib/cache-keys";
import { browseParamsCache, type BrowseParams } from "@/lib/nuqs/public";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import ProductsList from "@/app/(root)/_components/products/products-list";
import { FiltersContent } from "@/app/(root)/_components/filters-content";
import ProductFilters from "@/app/(root)/_components/product-filters";
import PublicProductsLoading from "@/components/loading-skeletons/public-products-loading";
import ProductFiltersSkeleton from "@/components/loading-skeletons/filters-loading";

const Content = async ({ params }: { params: BrowseParams }) => {
  const p = params;
  const filters = {
    category: p.category || undefined,
    sort: p.sort as any,
    minPrice: p.minPrice || undefined,
    maxPrice: p.maxPrice || undefined,
    search: p.search || undefined,
    inStock: p.inStock === "true",
  };

  const qc = new QueryClient();

  await qc.prefetchInfiniteQuery({
    queryKey: ["public-products", productKeys.infinityList(filters)],
    queryFn: async ({ pageParam = 0 }) => {
      const r = await getProducts(pageParam, filters);
      if (!r.success) throw new Error(r.message);
      return r;
    },
    initialPageParam: 0,
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <ProductsList filters={filters} category={p.category} />
    </HydrationBoundary>
  );
};

const ProductsPage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) => {
  const params = browseParamsCache.parse(await searchParams);

  return (
    <MaxWidthContainer className="flex flex-col px-5 py-5">
      <Suspense fallback={<ProductFiltersSkeleton />}>
        <FiltersContent>
          <ProductFilters />
        </FiltersContent>
      </Suspense>
      <Suspense fallback={<PublicProductsLoading />}>
        <Content params={params} />
      </Suspense>
    </MaxWidthContainer>
  );
};

export default ProductsPage;

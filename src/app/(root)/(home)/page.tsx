import { getProducts, getPublicVendors } from "@/actions/public";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import { homeParamsCache } from "@/lib/nuqs/public";
import { productKeys } from "@/lib/cache-keys";
import MaxWidthContainer from "@/components/max-w-container";
import ProductsList from "@/app/(root)/_components/products/products-list";
// import { LinkButton } from "@/components/link-button";
// import { PUBLIC_ROUTES } from "@/lib/consts/constants";
import { FiltersContent } from "@/app/(root)/_components/filters-content";
import CategoriesList from "@/app/(root)/_components/categories-list";
import { HeroBanner } from "@/app/(root)/_components/hero-banner";
import { Footer } from "@/app/(root)/_components/footer";
import Vendors from "@/app/(root)/_components/vendors";

type Props = {
  page: number;
  category: string;
};

const ProductsContent = async ({ category, page }: Props) => {
  // await new Promise((res) => setTimeout(res, 5000));
  const qc = new QueryClient();
  const filters = {
    category: category || undefined,
    inStock: true as const,
  };

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
      <ProductsList isHomePage filters={filters} category={category} />
    </HydrationBoundary>
  );
};

const VendorsContent = async () => {
  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: ["vendors", "public-list"],
    queryFn: async () => {
      const r = await getPublicVendors();
      if (!r.success) {
        throw new Error(r.message);
      }
      return r.data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <Vendors slice={6} />
    </HydrationBoundary>
  );
};

const HomePage = async ({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) => {
  const { category, page } = homeParamsCache.parse(await searchParams);

  return (
    <MaxWidthContainer>
      <HeroBanner />
      <Suspense fallback={<h2>Loading Categories....</h2>}>
        <FiltersContent page={page} category={category}>
          <CategoriesList />
        </FiltersContent>
      </Suspense>
      <Suspense fallback={<h2>Loading Products....</h2>}>
        <ProductsContent page={page} category={category} />
      </Suspense>
      <Suspense fallback={<h2>Loading Vendors....</h2>}>
        <VendorsContent />
      </Suspense>
      <Footer />
    </MaxWidthContainer>
  );
};

export default HomePage;

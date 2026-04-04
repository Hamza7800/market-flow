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
import Vendors from "@/app/(root)/_components/vendors";
import HomeCategoriesLoading from "@/components/loading-skeletons/home-categories-loading";
import PublicProductsLoading from "@/components/loading-skeletons/public-products-loading";
import PublicVendorsLoading from "@/components/loading-skeletons/public-vendors-loading";

type Props = {
  page: number;
  category: string;
};

const ProductsContent = async () => {
  // await new Promise((res) => setTimeout(res, 5000));
  const qc = new QueryClient();
  const filters = {
    category: undefined,
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
      <ProductsList isHomePage filters={filters} category={""} />
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

const HomePage = () => {
  return (
    <MaxWidthContainer>
      <HeroBanner />
      <Suspense fallback={<HomeCategoriesLoading />}>
        <FiltersContent>
          <CategoriesList />
        </FiltersContent>
      </Suspense>
      <Suspense fallback={<PublicProductsLoading />}>
        <ProductsContent />
      </Suspense>
      <Suspense fallback={<PublicVendorsLoading />}>
        <div className="py-16">
          <VendorsContent />
        </div>
      </Suspense>
    </MaxWidthContainer>
  );
};

export default HomePage;

import MaxWidthContainer from "@/components/max-w-container";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import VendorDetails from "../_components/vendor-details";
import { productKeys, vendorKeys } from "@/lib/cache-keys";
import { getVendorById, getVendorPublicProducts } from "@/actions/public";
import VendorProducts from "../_components/vendor-products";

const VendorContent = async ({ vendorId }: { vendorId: string }) => {
  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: vendorKeys.detail(vendorId),
    queryFn: async () => {
      const r = await getVendorById(vendorId);
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <VendorDetails vendorId={vendorId} />
    </HydrationBoundary>
  );
};

const VendorProductsContent = async ({ vendorId }: { vendorId: string }) => {
  const qc = new QueryClient();

  await qc.prefetchInfiniteQuery({
    queryKey: [...productKeys.byVendor(vendorId), "public"],
    queryFn: async ({ pageParam = 0 }) => {
      const r = await getVendorPublicProducts(vendorId, pageParam);
      if (!r.success) throw new Error(r.message);
      return r;
    },
    initialPageParam: 0,
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <VendorProducts vendorId={vendorId} />
    </HydrationBoundary>
  );
};

type Props = { params: Promise<{ vendorId: string }> };

const VendorDetailsPage = async ({ params }: Props) => {
  const { vendorId } = await params;
  return (
    <MaxWidthContainer>
      <Suspense fallback={<h2>Loading....vendor</h2>}>
        <VendorContent vendorId={vendorId} />
      </Suspense>
      <Suspense fallback={<h2>Loading....products</h2>}>
        <VendorProductsContent vendorId={vendorId} />
      </Suspense>
    </MaxWidthContainer>
  );
};

export default VendorDetailsPage;

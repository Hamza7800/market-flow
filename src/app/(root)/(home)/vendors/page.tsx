import { getPublicVendors } from "@/actions/public";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import AllVendors from "./_components/allvendors";
import PublicVendorsLoading from "@/components/loading-skeletons/public-vendors-loading";

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
      <AllVendors />
    </HydrationBoundary>
  );
};

const VendorsPage = () => {
  return (
    <Suspense fallback={<PublicVendorsLoading />}>
      <VendorsContent />
    </Suspense>
  );
};

export default VendorsPage;

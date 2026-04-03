import { getPublicVendors } from "@/actions/public";
import MaxWidthContainer from "@/components/max-w-container";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import AllVendors from "./_components/allvendors";

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
    <MaxWidthContainer>
      <Suspense fallback={<h2>Loading Vendors....</h2>}>
        <VendorsContent />
      </Suspense>
    </MaxWidthContainer>
  );
};

export default VendorsPage;

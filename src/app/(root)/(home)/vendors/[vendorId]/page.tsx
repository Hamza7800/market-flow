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
import { ArrowRight } from "lucide-react";
import Link from "next/link";

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
    <>
      <MaxWidthContainer>
        <Suspense fallback={<h2>Loading....vendor</h2>}>
          <VendorContent vendorId={vendorId} />
        </Suspense>
        <Suspense fallback={<h2>Loading....products</h2>}>
          <VendorProductsContent vendorId={vendorId} />
        </Suspense>
      </MaxWidthContainer>
      <section className="bg-accent/5 border-border mt-10 border-t px-4 py-16 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-foreground mb-4 text-3xl font-bold">
            Start Shopping Now
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Discover premium products from this trusted seller
          </p>
          <Link
            href={`/products`}
            className="bg-accent hover:bg-accent/90 text-accent-foreground inline-flex cursor-pointer items-center gap-2 rounded-lg px-8 py-3 font-semibold transition-colors"
          >
            Browse All Products
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  );
};

export default VendorDetailsPage;

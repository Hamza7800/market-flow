import { getProductById } from "@/actions/public";
import { productKeys } from "@/lib/cache-keys";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Suspense } from "react";
import ProductDetails from "./_components/product-details";
import MaxWidthContainer from "@/components/max-w-container";

const Content = async ({ productId }: { productId: string }) => {
  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: productKeys.detail(productId),
    queryFn: async () => {
      const r = await getProductById(productId);
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <ProductDetails productId={productId} />
    </HydrationBoundary>
  );
};

type Props = { params: Promise<{ productId: string }> };

const ProductDetailsPage = async ({ params }: Props) => {
  const { productId } = await params;
  return (
    <MaxWidthContainer>
      <Suspense fallback={<h2>Loading...</h2>}>
        <Content productId={productId} />
      </Suspense>
    </MaxWidthContainer>
  );
};

export default ProductDetailsPage;

export async function generateMetadata({ params }: Props) {
  const { productId } = await params;
  const result = await getProductById(productId);
  if (!result.success || !result.data) return { title: "Product not found" };
  return {
    title: result.data.name,
    description: result.data.description ?? undefined,
    openGraph: {
      images: result.data.images?.[0]?.url ? [result.data.images[0].url] : [],
    },
  };
}

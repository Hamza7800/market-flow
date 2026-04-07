import { EmptyState } from "@/components/empty-state";
import ProductForm from "../_components/product-form";
import { getVendorProductById } from "@/actions/products";

const ProductFormPage = async ({
  searchParams,
  params,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
  params: Promise<{ vendorId: string }>;
}) => {
  const { productId } = await searchParams;
  const { vendorId } = await params;

  if (productId) {
    const product = await getVendorProductById(productId);

    if (!product) {
      return <EmptyState title={"Product Not found"} />;
    }

    return (
      <ProductForm
        currentStatus={product.data?.status ?? "draft"}
        mode="edit"
        productId={productId}
        vendorId={vendorId}
        defaultValues={{
          name: product.data?.name,
          description: product.data?.description ?? "",
          basePrice: Number(product.data?.basePrice),
          stock: product.data?.stock,
          categoryId: product?.data?.category?.id,
          images: product.data?.images.map((img) => ({
            url: img.url,
            altText: img.altText ?? "",
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
            key: img.key ?? "",
          })),
          hasVariants: product.data?.hasVariants,
          tagIds: product.data?.productTags?.map((tag) => tag?.tagId),
          // @ts-expect-error error
          variants:
            product.data?.variants?.map((v) => ({
              id: v.id,
              name: v.name,
              options: {},
              // options: JSON.parse(v.options),
              price: v.price,
              stock: v.stock,
              sku: v.sku,
              imageUrl: v.imageUrl ?? "",
            })) ?? [],
        }}
      />
    );
  } else {
    return <ProductForm mode="create" vendorId={vendorId} />;
  }
};

export default ProductFormPage;

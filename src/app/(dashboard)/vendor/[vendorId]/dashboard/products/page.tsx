import ProductForm from "./_components/product-form";

const ProductsPage = async ({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) => {
  const { vendorId } = await params;
  return (
    <div>
      <ProductForm
        mode="create"
        vendorId={vendorId}
        categories={[
          {
            id: "id",
            name: "Cat One",
          },
          {
            id: "i2d",
            name: "Two",
          },
        ]}
        availableTags={[
          {
            id: "dawdawd",
            name: "Tag One",
            slug: "slug",
          },
          {
            id: "dawdawdwad",
            name: "Tag Two",
            slug: "slug",
          },
        ]}
      />
    </div>
  );
};

export default ProductsPage;

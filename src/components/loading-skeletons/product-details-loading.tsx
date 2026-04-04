import { Card, Skeleton, Separator } from "@heroui/react";

const ProductDetailsSkeleton = () => {
  return (
    <main className="mb-20 min-h-screen">
      {/* BREADCRUMB SKELETON */}
      <div className="border-border border-b py-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12 rounded" />
          <span className="text-default-300">/</span>
          <Skeleton className="h-4 w-20 rounded" />
          <span className="text-default-300">/</span>
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>

      {/* PRODUCT DETAILS SECTION */}
      <section className="py-8">
        <div className="mx-auto grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* LEFT: IMAGES */}
          <div className="space-y-4 lg:col-span-2">
            {/* MAIN IMAGE */}
            <Skeleton className="aspect-square w-full rounded-lg" />

            {/* THUMBNAIL GALLERY */}
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  className="h-20 w-20 flex-shrink-0 rounded-lg"
                />
              ))}
            </div>
          </div>

          {/* RIGHT: PRODUCT INFO CARD */}
          <Card className="h-fit space-y-6 p-6">
            <div>
              <Skeleton className="mb-3 h-4 w-24 rounded" />
              <Skeleton className="mb-4 h-10 w-3/4 rounded-lg" />

              {/* RATING SKELETON */}
              <div className="mb-4 flex items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-4 w-4 rounded-full" />
                  ))}
                </div>
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <Skeleton className="h-4 w-16 rounded" />
            </div>

            {/* PRICE CARD SKELETON */}
            <div className="border-border flex items-start justify-between rounded-lg border p-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-10 rounded" />
                <Skeleton className="h-8 w-24 rounded" />
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            {/* QUANTITY & ADD TO CART */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
              <Skeleton className="h-10 w-32 rounded-lg" />
            </div>

            {/* TRUST BADGES */}
            <div className="border-border space-y-4 border-t pt-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-48 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 w-40 rounded" />
              </div>
            </div>

            <Separator />

            {/* VENDOR MINI CARD */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* DESCRIPTION SECTION */}
      <section className="border-border border-t px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-2/3 rounded" />
              </div>

              <Skeleton className="mt-6 h-6 w-32 rounded-lg" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductDetailsSkeleton;

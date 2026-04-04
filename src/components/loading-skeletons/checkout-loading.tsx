import { Card, Skeleton, Separator } from "@heroui/react";

const CheckoutSkeleton = () => {
  return (
    <div className="pt-3 pb-20">
      {/* BACK BUTTON & TITLE */}
      <div className="mb-6 space-y-4">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-9 w-48 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* LEFT COLUMN: FORM AREA */}
        <div className="space-y-6">
          <Card className="space-y-6 border p-4">
            {/* STEP HEADER */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-5 w-40 rounded" />
            </div>

            {/* CONTACT FIELDS */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Skeleton className="h-3 w-12 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>

            <Separator />

            {/* ADDRESS FIELDS */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Skeleton className="h-3 w-28 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-10 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-14 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20 rounded" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>
          </Card>

          {/* BUTTON SKELETON */}
          <Skeleton className="mt-6 h-12 w-full rounded-xl sm:w-48" />
        </div>

        {/* RIGHT COLUMN: ORDER SUMMARY */}
        <aside className="space-y-4">
          <Card className="border p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-32 rounded" />
              </div>
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>

            {/* SUMMARY ITEMS */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-14 w-14 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-3/4 rounded" />
                    <Skeleton className="h-2.5 w-1/2 rounded" />
                    <Skeleton className="mt-1 h-3 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* TOTALS */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-3 w-12 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-3 w-10 rounded" />
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <Skeleton className="h-5 w-12 rounded" />
                <Skeleton className="h-6 w-20 rounded" />
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default CheckoutSkeleton;

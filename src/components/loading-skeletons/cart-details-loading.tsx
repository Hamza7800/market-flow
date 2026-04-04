import { Skeleton } from "@heroui/react";

const CartSkeleton = () => {
  return (
    <main className="min-h-screen py-3 pb-16">
      <div className="mb-8 flex flex-col justify-between gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-40 rounded" />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="border-border flex items-center gap-3 rounded-lg border p-4"
          >
            <Skeleton className="h-5 w-5 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="border-border flex items-center gap-4 rounded-xl border p-4"
            >
              <Skeleton className="h-24 w-24 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-1/2 rounded" />
                <Skeleton className="h-4 w-1/3 rounded" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
              <Skeleton className="h-6 w-16 shrink-0 rounded" />
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="border-border space-y-6 rounded-xl border p-6">
            <Skeleton className="h-6 w-40 rounded" />
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            </div>
            <div className="border-border border-t pt-6">
              <div className="mb-6 flex items-center justify-between">
                <Skeleton className="h-6 w-16 rounded" />
                <Skeleton className="h-8 w-24 rounded-lg" />
              </div>
              <Skeleton className="mb-4 h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CartSkeleton;

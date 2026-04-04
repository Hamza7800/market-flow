import { Skeleton } from "@heroui/react";

const ProductFiltersSkeleton = () => {
  return (
    <div className="mb-6 w-full">
      {/* SEARCH / SORT / PRICE ROW SKELETON */}
      <div className="flex w-full items-end gap-2 overflow-hidden">
        {/* Search Input Placeholder */}
        {/* <div className="hidden w-full md:block">
          <Skeleton className="mb-1.5 h-3 w-12 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div> */}

        {/* Sort Select Placeholder */}
        {/* <div className="w-full max-w-[200px]">
          <Skeleton className="mb-1.5 h-3 w-16 rounded" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div> */}

        {/* Price Fields Placeholder */}
        {/* <div className="hidden gap-2 lg:flex">
          <div className="w-24">
            <Skeleton className="mb-1.5 h-3 w-14 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="w-24">
            <Skeleton className="mb-1.5 h-3 w-14 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div> */}

        {/* Clear Button Placeholder */}
        {/* <Skeleton className="h-10 w-28 rounded-xl" /> */}
      </div>

      {/* CATEGORIES TAGS SKELETON */}
      <div className="space-y-3">
        {/* <Skeleton className="h-3 w-20 rounded" /> */}
        <div className="flex flex-wrap gap-2">
          {/* Mimicking the "All" tag + dynamic categories */}
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ProductFiltersSkeleton;

import { Skeleton } from "@heroui/react";

const VendorHeaderSkeleton = () => {
  return (
    <section className="pb-16">
      {/* BANNER AREA SKELETON */}
      <Skeleton className="relative h-48 w-full rounded-2xl md:h-64 lg:h-80" />

      {/* CONTENT AREA */}
      <div className="container mx-auto px-4">
        <div className="relative flex flex-col items-start gap-6 md:flex-row">
          {/* OVERLAPPING LOGO SKELETON */}
          <Skeleton className="relative -mt-12 h-32 w-32 shrink-0 rounded-2xl border-2 md:-mt-16 md:h-40 md:w-40" />

          {/* VENDOR INFO SKELETON */}
          <div className="mt-4 flex-1 space-y-4 md:mt-6">
            <div className="space-y-2">
              {/* Store Name */}
              <Skeleton className="h-10 w-64 rounded-lg md:h-12" />
              {/* Email/Meta */}
              <Skeleton className="h-4 w-40 rounded" />
            </div>

            {/* Description Lines */}
            <div className="max-w-3xl space-y-2">
              <Skeleton className="h-4 w-full rounded" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VendorHeaderSkeleton;

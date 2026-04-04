import { Skeleton } from "@heroui/react";

const PublicVendorsLoading = () => {
  return (
    <div className="py-4">
      <div className="mb-8">
        <Skeleton className="mb-4 h-10 w-sm" />
        <Skeleton className="h-10 w-lg" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((s, indx) => (
          <Skeleton key={indx} className="h-[235px] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
};

export default PublicVendorsLoading;

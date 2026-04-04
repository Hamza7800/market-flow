import { Skeleton } from "@heroui/react";

const HomeCategoriesLoading = () => {
  return (
    <div className="py-10">
      <div className="mb-8">
        <Skeleton className="mb-4 h-10 w-sm" />
        <Skeleton className="h-10 w-lg" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((s, indx) => (
          <Skeleton key={indx} className="h-36 w-full" />
        ))}
      </div>
    </div>
  );
};

export default HomeCategoriesLoading;

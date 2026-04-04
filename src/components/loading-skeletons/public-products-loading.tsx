import { Skeleton } from "@heroui/react";

const PublicProductsLoading = () => {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((s, indx) => (
        <Skeleton key={indx} className="h-[450px] w-full rounded-2xl" />
      ))}
    </div>
  );
};

export default PublicProductsLoading;

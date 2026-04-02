import { getCategories } from "@/actions/taxonomy";
import { categoryKeys } from "@/lib/cache-keys";
import {
  QueryClient,
  HydrationBoundary,
  dehydrate,
} from "@tanstack/react-query";
import CategoriesList from "./categories-list";
import type { ReactNode } from "react";

type Props = {
  page: number;
  category: string;
  children: ReactNode;
};

export const FiltersContent = async ({ category, page, children }: Props) => {
  // await new Promise((res) => setTimeout(res, 2000));
  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: categoryKeys.tree(),
    queryFn: async () => {
      const r = await getCategories();
      if (!r.success) throw new Error(r.message);
      return r.data;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      {/* <CategoriesList /> */}
      {children}
    </HydrationBoundary>
  );
};

import { getCategories, getTags } from "@/actions/taxonomy";
import { categoryKeys } from "@/lib/cache-keys";
import { useQuery } from "@tanstack/react-query";

export const useCategories = () => {
  return useQuery({
    queryKey: categoryKeys.all(),
    queryFn: async () => {
      const result = await getCategories();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });
};

export const useTags = () => {
  return useQuery({
    queryKey: ["platform-tags"],
    queryFn: async () => {
      const result = await getTags();
      if (!result.success) throw new Error(result.message);
      return result.data;
    },
  });
};

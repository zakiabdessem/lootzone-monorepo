import { api } from "@lootzone/trpc-shared";

export const useCategories = () => {
  const {
    data: categories = [],
    isLoading: loading,
    error,
    refetch,
  } = api.category.getAll.useQuery();

  return {
    categories,
    loading,
    error: error ? error.message : null,
    refetch,
  };
};

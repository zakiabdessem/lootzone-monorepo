import { api } from "@lootzone/trpc-shared";

export const useCategoryMutations = () => {
  const utils = api.useContext();

  const createCategory = api.category.create.useMutation({
    onSuccess: () => utils.category.getAll.invalidate(),
  });

  const updateCategory = api.category.update.useMutation({
    onSuccess: () => utils.category.getAll.invalidate(),
  });

  const deleteCategory = api.category.delete.useMutation({
    onSuccess: () => utils.category.getAll.invalidate(),
  });

  const toggleCategoryActive = api.category.toggleActive.useMutation({
    onSuccess: () => utils.category.getAll.invalidate(),
  });

  return {
    createCategory: createCategory.mutateAsync,
    updateCategory: updateCategory.mutateAsync,
    deleteCategory: deleteCategory.mutateAsync,
    toggleCategoryActive: toggleCategoryActive.mutateAsync,
    createLoading: createCategory.isLoading,
    updateLoading: updateCategory.isLoading,
    deleteLoading: deleteCategory.isLoading,
    toggleLoading: toggleCategoryActive.isLoading,
  };
};

// Shared types for tRPC

export interface Category {
  id: string;
  name: string;
  slug?: string;
  parentId?: string | null;
  displayOrder?: number | null;
  isActive?: boolean;
}

export interface ProductCategoryLink {
  id: string;
  categoryId: string;
  category: Category;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  categories: ProductCategoryLink[];
}

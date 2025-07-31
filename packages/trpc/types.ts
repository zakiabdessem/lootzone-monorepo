// Shared types for tRPC

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
  displayOrder?: number;
  isActive?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
}

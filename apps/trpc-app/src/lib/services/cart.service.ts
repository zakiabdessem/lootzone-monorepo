import type { Cart, CartItemInput } from "~/types/order";

export interface ICartService {
  getActiveCart(cartId: string, userId?: string): Promise<Cart>;
  addItem(cartId: string, item: CartItemInput): Promise<Cart>;
  updateItemQuantity(cartId: string, itemId: string, quantity: number): Promise<Cart>;
  removeItem(cartId: string, itemId: string): Promise<Cart>;
  clearCart(cartId: string): Promise<void>;
  recalculate(cartId: string): Promise<Cart>;
}

export const cartService: ICartService = {
  async getActiveCart() {
    throw new Error("cartService not wired");
  },
  async addItem() {
    throw new Error("cartService not wired");
  },
  async updateItemQuantity() {
    throw new Error("cartService not wired");
  },
  async removeItem() {
    throw new Error("cartService not wired");
  },
  async clearCart() {
    throw new Error("cartService not wired");
  },
  async recalculate() {
    throw new Error("cartService not wired");
  },
};
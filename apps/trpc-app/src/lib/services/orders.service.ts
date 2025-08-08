import type { CreateOrderFromCartInput, CreateOrderSingleProductInput, Order, PaginatedOrders } from "~/types/order";

export interface IOrdersService {
  createOrderFromCart(input: CreateOrderFromCartInput): Promise<Order>;
  createOrderForSingleProduct(input: CreateOrderSingleProductInput): Promise<Order>;
  getOrderById(orderId: string): Promise<Order>;
  getOrders(params?: { cursor?: string; limit?: number; status?: string }): Promise<PaginatedOrders>;
  cancelOrder(orderId: string): Promise<void>;
}

export const ordersService: IOrdersService = {
  async createOrderFromCart() {
    throw new Error("ordersService not wired");
  },
  async createOrderForSingleProduct() {
    throw new Error("ordersService not wired");
  },
  async getOrderById() {
    throw new Error("ordersService not wired");
  },
  async getOrders() {
    throw new Error("ordersService not wired");
  },
  async cancelOrder() {
    throw new Error("ordersService not wired");
  },
};
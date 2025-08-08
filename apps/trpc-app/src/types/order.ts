import { OrderStatus, PaymentMethod, PaymentStatus } from "~/constants/enums";

export interface CartItemInput {
  productId: string;
  variantId?: string;
  title: string;
  unitPrice: number;
  quantity: number;
}

export interface CartItem extends CartItemInput {
  id: string;
  total: number;
}

export interface CartTotals {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  grandTotal: number;
}

export interface Cart extends CartTotals {
  id: string;
  userId?: string;
  currency: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  fullName: string;
  email: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod;
  providerRef?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface Order extends CartTotals {
  id: string;
  orderNumber: string;
  userId?: string;
  email: string;
  billingAddress: Address;
  shippingAddress?: Address;
  currency: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  meta?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedOrders {
  items: Order[];
  nextCursor?: string;
}

export interface CreateOrderFromCartInput {
  cartId: string;
  email: string;
  billing: Address;
  shipping?: Address;
  paymentMethod: PaymentMethod;
}

export interface CreateOrderSingleProductInput {
  productId: string;
  variantId?: string;
  quantity: number;
  email: string;
  billing: Address;
  shipping?: Address;
  paymentMethod: PaymentMethod;
}
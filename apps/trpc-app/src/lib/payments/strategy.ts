export type PaymentKind = "CASH" | "CARD" | "WALLET" | string;

export interface PaymentPayload {
  orderId: string;
  amount: number;
  currency: string;
  email?: string;
  meta?: Record<string, unknown>;
}

export interface PaymentAuthResult {
  status: "PENDING" | "PAID" | "FAILED";
  providerRef?: string;
  meta?: Record<string, unknown>;
}

export interface PaymentStrategy {
  readonly type: PaymentKind;
  authorize(payload: PaymentPayload): Promise<PaymentAuthResult>;
  capture?(paymentId: string): Promise<void>;
  cancel?(paymentId: string): Promise<void>;
  refund?(paymentId: string, amount: number): Promise<void>;
}
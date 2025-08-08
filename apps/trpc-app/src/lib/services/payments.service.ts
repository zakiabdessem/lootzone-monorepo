import type { Order, Payment } from "~/types/order";
import type { PaymentStrategy } from "~/lib/payments/strategy";

export interface IPaymentsService {
  authorizeOrCreate(order: Order, strategy: PaymentStrategy): Promise<Payment>;
}

export const paymentsService: IPaymentsService = {
  async authorizeOrCreate() {
    throw new Error("paymentsService not wired");
  },
};
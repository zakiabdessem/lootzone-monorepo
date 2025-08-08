import type { PaymentAuthResult, PaymentPayload, PaymentStrategy } from "../strategy";

export class CashPaymentStrategy implements PaymentStrategy {
  readonly type = "CASH" as const;

  async authorize(_payload: PaymentPayload): Promise<PaymentAuthResult> {
    return { status: "PENDING" };
  }
}
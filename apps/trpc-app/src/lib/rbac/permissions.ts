import type { UserRole } from "~/constants/enums";

export const PERMISSIONS = {
  CART: {
    VIEW: "cart.view",
    UPDATE: "cart.update",
    CLEAR: "cart.clear",
  },
  CHECKOUT: {
    START: "checkout.start",
    PLACE: "checkout.place",
  },
  ORDERS: {
    VIEW: "orders.view",
    CREATE: "orders.create",
    UPDATE: "orders.update",
    CANCEL: "orders.cancel",
  },
  PAYMENTS: {
    VIEW: "payments.view",
    CAPTURE: "payments.capture",
    REFUND: "payments.refund",
  },
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS][keyof (typeof PERMISSIONS)[keyof typeof PERMISSIONS]];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    PERMISSIONS.CART.VIEW,
    PERMISSIONS.CART.UPDATE,
    PERMISSIONS.CART.CLEAR,
    PERMISSIONS.CHECKOUT.START,
    PERMISSIONS.CHECKOUT.PLACE,
    PERMISSIONS.ORDERS.VIEW,
    PERMISSIONS.ORDERS.CREATE,
    PERMISSIONS.ORDERS.UPDATE,
    PERMISSIONS.ORDERS.CANCEL,
    PERMISSIONS.PAYMENTS.VIEW,
    PERMISSIONS.PAYMENTS.CAPTURE,
    PERMISSIONS.PAYMENTS.REFUND,
  ],
  user: [
    PERMISSIONS.CART.VIEW,
    PERMISSIONS.CART.UPDATE,
    PERMISSIONS.CART.CLEAR,
    PERMISSIONS.CHECKOUT.START,
    PERMISSIONS.CHECKOUT.PLACE,
    PERMISSIONS.ORDERS.VIEW,
  ],
  moderator: [
    PERMISSIONS.ORDERS.VIEW,
    PERMISSIONS.ORDERS.UPDATE,
  ],
} as unknown as Record<UserRole, string[]>;
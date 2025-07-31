/**
 * User roles enum - replace magic strings
 */
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator",
}

/**
 * Order status enum
 */
export enum OrderStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

/**
 * Payment method enum
 */
export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  PAYPAL = "paypal",
  CRYPTO = "crypto",
  BARIDI = "baridi",
}

/**
 * Product platform enum
 */
export enum Platform {
  STEAM = "Steam",
  XBOX = "Xbox Live",
  PLAYSTATION = "PlayStation",
  NINTENDO = "Nintendo",
  ROCKSTAR = "Rockstar",
  MOBILE = "Mobile",
}

/**
 * Product region enum
 */
export enum Region {
  GLOBAL = "GLOBAL",
  US = "US",
  EU = "EU",
  NA = "NA",
  ASIA = "ASIA",
}

/**
 * Product category enum
 */
export enum ProductCategory {
  SMART = "smart",
  UTILITY = "utility",
  PRODUCT = "product",
  SIMPLE = "simple",
}

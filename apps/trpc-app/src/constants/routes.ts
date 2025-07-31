/**
 * Application route constants
 * Centralize all route definitions to avoid magic strings
 */

export const ROUTES = {
  // Public routes
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (slug: string) => `/product/${slug}`,
  ABOUT: "/about",
  CONTACT: "/contact",

  // Auth routes
  SIGN_IN: "/auth/signin",
  SIGN_UP: "/auth/signup",
  SIGN_OUT: "/auth/signout",

  // User routes
  PROFILE: "/profile",
  ORDERS: "/orders",
  ORDER_DETAIL: (orderId: string) => `/orders/${orderId}`,
  FAVORITES: "/favorites",

  // Admin routes
  ADMIN: "/admin",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_USERS: "/admin/users",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_ANALYTICS: "/admin/analytics",

  // API routes
  API: {
    TRPC: "/api/trpc",
    AUTH: "/api/auth",
  },
} as const;

/**
 * Check if a route requires authentication
 */
export function isProtectedRoute(pathname: string): boolean {
  const protectedRoutes = ["/profile", "/orders", "/favorites", "/admin"];

  return protectedRoutes.some((route) => pathname.startsWith(route));
}

/**
 * Check if a route requires admin access
 */
export function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

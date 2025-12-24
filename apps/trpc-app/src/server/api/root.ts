import { authRouter } from '~/server/api/routers/auth';
import { categoryRouter } from '~/server/api/routers/category';
import { checkoutRouter } from '~/server/api/routers/checkout';
import { couponRouter } from '~/server/api/routers/coupon';
import { guestSessionRouter } from '~/server/api/routers/guest-session';
import { heroSlideRouter } from '~/server/api/routers/hero-slide';
import { netflixRouter } from '~/server/api/routers/netflix';
import { orderRouter } from '~/server/api/routers/order';
import { productRouter } from '~/server/api/routers/product';
import { searchRouter } from '~/server/api/routers/search';
import { sessionRouter } from '~/server/api/routers/session';
import { siteSettingsRouter } from '~/server/api/routers/site-settings';
import { userRouter } from '~/server/api/routers/user';
import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  product: productRouter,
  user: userRouter,
  order: orderRouter,
  category: categoryRouter,
  auth: authRouter,
  session: sessionRouter,
  guestSession: guestSessionRouter,
  heroSlide: heroSlideRouter,
  siteSettings: siteSettingsRouter,
  checkout: checkoutRouter,
  search: searchRouter,
  coupon: couponRouter,
  netflix: netflixRouter,
});

console.log('✅ [tRPC] Root router created with keys:', Object.keys(appRouter._def.record ?? {}));

console.log('✅ [tRPC] Root router created with keys:', Object.keys(appRouter._def.record ?? {}));

if (process.env.NODE_ENV === 'development') {
  const routerDef = appRouter as unknown as {
    _def?: {
      record?: Record<string, unknown>;
      procedures?: Record<string, unknown>;
    };
  };

  const registeredRouters = Object.keys(routerDef._def?.record ?? routerDef._def?.procedures ?? {});
  console.log('[tRPC] registered routers:', registeredRouters.join(', '));
}

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

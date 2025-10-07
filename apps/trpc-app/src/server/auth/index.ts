import NextAuth, { type NextAuthResult } from "next-auth";
import { cache } from "react";

import { authConfig } from "./config";

const nextAuthResult: NextAuthResult = NextAuth(authConfig);
const auth = cache(nextAuthResult.auth);
const handlers = nextAuthResult.handlers;
// Cast to portable function types to avoid referencing internal provider types
const signIn: (provider?: string, options?: unknown) => Promise<never> =
  nextAuthResult.signIn as unknown as (provider?: string, options?: unknown) => Promise<never>;
const signOut: (options?: unknown) => Promise<never> =
  nextAuthResult.signOut as unknown as (options?: unknown) => Promise<never>;

export { auth, handlers, signIn, signOut };

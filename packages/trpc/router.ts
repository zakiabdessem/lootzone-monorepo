// Shared tRPC router export (placeholder)
// Replace with your actual appRouter export from your backend

import { initTRPC } from "@trpc/server";
import { z } from "zod";
import type { Category, Product } from "./types";

const t = initTRPC.create();

export const appRouter = t.router({
  // Example procedure
  getCategory: t.procedure.query((): Category[] => []),
  getProduct: t.procedure.query((): Product[] => []),
});

export type AppRouter = typeof appRouter;

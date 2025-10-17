"use client";

import { TRPCProvider as SharedTRPCProvider } from "@lootzone/trpc-shared";

// Re-export as both named and default to satisfy any import style
export { SharedTRPCProvider as TRPCProvider };
export default SharedTRPCProvider;

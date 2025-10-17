"use client";

import { QueryClientProvider, type QueryClient } from "@tanstack/react-query";
import { httpBatchStreamLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import { useState } from "react";

// Import the AppRouter type from the trpc-app. This is a type-only import and
// will be removed in the compiled JavaScript, so it's safe to reach across
// the workspace.
// Note: Using dynamic approach to avoid path resolution issues in monorepo
import type { AppRouter } from "../../../apps/trpc-app/src/server/api/root";

import SuperJSON from "superjson";
import { createQueryClient } from "./query-client";

let clientQueryClientSingleton: QueryClient | undefined;
const getQueryClient = () => {
  if (typeof window === "undefined") {
    return createQueryClient();
  }
  clientQueryClientSingleton ??= createQueryClient();
  return clientQueryClientSingleton;
};

export const api = createTRPCReact<AppRouter>();

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    api.createClient({
      links: [
        loggerLink({
          enabled: (op) =>
            (op.direction === "down" && op.result instanceof Error),
        }),
        httpBatchStreamLink({
          transformer: SuperJSON,
          url: `${getBaseUrl()}/api/trpc`,
          headers: () => {
            const headers = new Headers();
            headers.set("x-trpc-source", "admin-dashboard");
            if (typeof window !== "undefined") {
              const token =
                window.localStorage.getItem("accessToken") ||
                document.cookie
                  .split("; ")
                  .find((row) => row.startsWith("accessToken="))?.split("=")[1];
              if (token) {
                headers.set("Authorization", `Bearer ${token}`);
              }
            }
            return headers;
          },
        }),
      ],
    })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>
  );
}

function getBaseUrl() {
  if (typeof window !== "undefined") {
    // In the browser, if we're on localhost, hard-code the tRPC server port.
    // If we're on admin.lootzone.digital, use lootzone.digital for the API.
    if (window.location.hostname === "localhost") {
      return "http://localhost:3000";
    }
    if (window.location.hostname === "admin.lootzone.digital") {
      return "https://lootzone.digital";
    }
    return window.location.origin;
  }

  // For server-side rendering, use Vercel's URL if available.
  // if (process.env.VERCEL_URL) {
  //   return `https://${process.env.VERCEL_URL}`;
  // }

  // Otherwise, assume we're running locally and hard-code the tRPC server port.
  return "http://localhost:3000";
}

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../../apps/trpc-app/src/server/api/root";

// Re-declare the public surface of the shared package for the Admin TS compiler

declare module "@lootzone/trpc-shared" {
  const api: typeof import("../../../packages/trpc-shared/src/react").api;
  const TRPCProvider: (props: { children: React.ReactNode }) => JSX.Element;
  type RouterInputs = inferRouterInputs<AppRouter>;
  type RouterOutputs = inferRouterOutputs<AppRouter>;
  export { api, RouterInputs, RouterOutputs, TRPCProvider };
}

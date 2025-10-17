import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../apps/trpc-app/src/server/api/types";
export declare const api: "The property 'useContext' in your router collides with a built-in method, rename this router or procedure on your backend." | "The property 'useUtils' in your router collides with a built-in method, rename this router or procedure on your backend." | "The property 'Provider' in your router collides with a built-in method, rename this router or procedure on your backend." | "The property 'createClient' in your router collides with a built-in method, rename this router or procedure on your backend." | "The property 'useQueries' in your router collides with a built-in method, rename this router or procedure on your backend." | "The property 'useSuspenseQueries' in your router collides with a built-in method, rename this router or procedure on your backend.";
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
export declare function TRPCProvider({ children }: {
    children: React.ReactNode;
}): import("react").JSX.Element;
//# sourceMappingURL=react.d.ts.map
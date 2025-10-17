"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchStreamLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import SuperJSON from "superjson";
import { createQueryClient } from "./query-client";
var clientQueryClientSingleton;
var getQueryClient = function () {
    if (typeof window === "undefined") {
        return createQueryClient();
    }
    clientQueryClientSingleton !== null && clientQueryClientSingleton !== void 0 ? clientQueryClientSingleton : (clientQueryClientSingleton = createQueryClient());
    return clientQueryClientSingleton;
};
export var api = createTRPCReact();
export function TRPCProvider(_a) {
    var children = _a.children;
    var queryClient = getQueryClient();
    var trpcClient = useState(function () {
        return api.createClient({
            links: [
                loggerLink({
                    enabled: function (op) {
                        return (op.direction === "down" && op.result instanceof Error);
                    },
                }),
                httpBatchStreamLink({
                    transformer: SuperJSON,
                    url: "".concat(getBaseUrl(), "/api/trpc"),
                    headers: function () {
                        var _a;
                        var headers = new Headers();
                        headers.set("x-trpc-source", "admin-dashboard");
                        if (typeof window !== "undefined") {
                            var token = window.localStorage.getItem("accessToken") ||
                                ((_a = document.cookie
                                    .split("; ")
                                    .find(function (row) { return row.startsWith("accessToken="); })) === null || _a === void 0 ? void 0 : _a.split("=")[1]);
                            if (token) {
                                headers.set("Authorization", "Bearer ".concat(token));
                            }
                        }
                        return headers;
                    },
                }),
            ],
        });
    })[0];
    return (<QueryClientProvider client={queryClient}>
      <api.Provider client={trpcClient} queryClient={queryClient}>
        {children}
      </api.Provider>
    </QueryClientProvider>);
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

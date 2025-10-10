import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a HTTP request (e.g. when you make requests from Client Components).
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://admin.lootzone.digital",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization,x-trpc-source",
  "Access-Control-Allow-Credentials": "true",
};

const createContext = async (req: NextRequest) => {
  return createTRPCContext({
    headers: req.headers,
  });
};

async function addCorsHeadersToNextResponse(response: Response) {
  // Clone the body as an arrayBuffer to avoid stream lock issues
  const body = response.body ? await response.arrayBuffer() : undefined;
  const res = new NextResponse(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.headers.set(key, value);
  });
  return res;
}

async function handler(req: NextRequest) {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "https://admin.lootzone.digital",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-trpc-source",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  const response = await fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

  // Add CORS headers to tRPC response
  return await addCorsHeadersToNextResponse(response);
}

export { handler as GET, handler as OPTIONS, handler as POST };

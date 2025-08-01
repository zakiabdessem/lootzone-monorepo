// Auth service now delegates directly to the shared tRPC client
import { api, RouterInputs, RouterOutputs } from "@lootzone/trpc-shared";

export type LoginInput = RouterInputs["auth"]["login"];
export type LoginOutput = RouterOutputs["auth"]["login"];

export class AuthService {
  async login(input: LoginInput): Promise<LoginOutput> {
    // We call the mutation directly; the shared TRPC client is already
    // configured with auth headers via TRPCProvider.
    return api.auth.login.useMutation().mutateAsync(input);
  }

  /**
   * Token verification still hits the REST endpoint until a tRPC procedure
   * is implemented on the backend.
   */
  async verifyToken(token: string) {
    const res = await fetch(`/api/auth/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      throw new Error("Token verification failed");
    }
    return res.json();
  }
}

export const authService = new AuthService();

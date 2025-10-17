import { RouterInputs, RouterOutputs } from "@lootzone/trpc-shared";

export type LoginInput = RouterInputs["auth"]["login"];
export type LoginOutput = RouterOutputs["auth"]["login"];

export class AuthService {
  async login(input: LoginInput): Promise<LoginOutput> {
    // Use direct HTTP call to the tRPC endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trpc/auth.login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        json: input,
      }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const result = await response.json();
    return result.result.data;
  }

  /**
   * Token verification using direct API call instead of React hooks
   */
  async verifyToken(token: string) {
    try {
      // Use a direct API call instead of React hooks
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        return { valid: false, message: "Invalid token" };
      }

      const result = await response.json();
      return { valid: true, user: result.user };
    } catch (error) {
      console.log({error});
      return { valid: false, message: "Invalid token" };
    }
  }
}

export const authService = new AuthService();

// Auth service for LootZone API integration
export class AuthService {
  private baseUrl =
    process.env.NEXT_PUBLIC_T3_API_URL || "http://localhost:3000";

      async login(email: string, password: string) {
    try {
      // Dynamically import to avoid circular deps
      const { api } = await import("@/utils/api");
      // Call the tRPC API
      const response = await api.auth.login({ email, password });

      // Handle tRPC response format based on successful login response
      if (response.result?.data?.json) {
        const { success, token, user } = response.result.data.json;

        if (success && user && token) {
          return {
            success: true,
            token,
            user: {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`.trim(),
              role: user.role,
            }
          };
        } else {
          return {
            success: false,
            error: "Login failed"
          };
        }
      } else if (response.error) {
        return {
          success: false,
          error: response.error.json.message || "Login failed"
        };
      } else {
        // Try to handle direct response format
        if (response.success) {
          return { success: true, ...response };
        } else if (response.error) {
          return { success: false, error: response.error };
        } else {
          return { success: false, error: "Invalid response format" };
        }
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Login failed" };
    }
  }



  async verifyToken(token: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Token verification failed");
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();

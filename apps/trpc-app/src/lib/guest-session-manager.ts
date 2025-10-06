/**
 * Global guest session manager to prevent multiple session creation
 */

const GUEST_SESSION_COOKIE = 'guest_session_token';

class GuestSessionManager {
  private static instance: GuestSessionManager;
  private sessionPromise: Promise<string> | null = null;
  private currentToken: string | null = null;

  private constructor() {}

  public static getInstance(): GuestSessionManager {
    if (!GuestSessionManager.instance) {
      GuestSessionManager.instance = new GuestSessionManager();
    }
    return GuestSessionManager.instance;
  }

  public async getOrCreateSession(createSessionFn: (existingToken?: string) => Promise<string>): Promise<string> {
    // Check localStorage for existing token first
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(GUEST_SESSION_COOKIE);
      if (storedToken && !this.currentToken) {
        this.currentToken = storedToken;
      }
    }

    // Always validate the session with the server instead of just returning the token
    // If session creation is already in progress, wait for it
    if (this.sessionPromise) {
      return this.sessionPromise;
    }

    // Create or validate session
    this.sessionPromise = this.createSession(() => createSessionFn(this.currentToken || undefined));
    const token = await this.sessionPromise;
    this.sessionPromise = null;
    this.currentToken = token;

    return token;
  }

  private async createSession(createSessionFn: () => Promise<string>): Promise<string> {
    try {
      const token = await createSessionFn();
      
      // Store in localStorage and set cookie
      if (typeof window !== 'undefined') {
        localStorage.setItem(GUEST_SESSION_COOKIE, token);
        document.cookie = `${GUEST_SESSION_COOKIE}=${token}; path=/; max-age=${
          30 * 24 * 60 * 60
        }; SameSite=Lax`;
      }
      
      return token;
    } catch (error) {
      console.error('Failed to create guest session:', error);
      // Clear invalid session data on error
      this.clearSession();
      throw error;
    }
  }

  public clearSession(): void {
    this.currentToken = null;
    this.sessionPromise = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GUEST_SESSION_COOKIE);
      document.cookie = `${GUEST_SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }

  public clearInvalidSession(): void {
    console.log('🧹 Clearing invalid session data');
    this.clearSession();
  }

  public getCurrentToken(): string | null {
    return this.currentToken;
  }
}

export const guestSessionManager = GuestSessionManager.getInstance();

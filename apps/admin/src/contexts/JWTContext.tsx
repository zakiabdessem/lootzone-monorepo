"use client";

import { createContext, ReactNode, useEffect, useReducer } from "react";

import { ActionMap, AuthState, AuthUser, JWTContextType } from "@/types/auth";
import { isValidToken, setSession } from "@/utils/jwt";
import { api } from "@lootzone/trpc-shared";

// Note: If you're trying to connect JWT to your own backend, don't forget
// to remove the Axios mocks in the `/src/pages/_app.tsx` file.

const INITIALIZE = "INITIALIZE";
const SIGN_IN = "SIGN_IN";
const SIGN_OUT = "SIGN_OUT";
const SIGN_UP = "SIGN_UP";

type AuthActionTypes = {
  [INITIALIZE]: {
    isAuthenticated: boolean;
    user: AuthUser;
  };
  [SIGN_IN]: {
    user: AuthUser;
  };
  [SIGN_OUT]: undefined;
  [SIGN_UP]: {
    user: AuthUser;
  };
};

const initialState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const JWTReducer = (
  state: AuthState,
  action: ActionMap<AuthActionTypes>[keyof ActionMap<AuthActionTypes>]
) => {
  switch (action.type) {
    case INITIALIZE:
      return {
        isAuthenticated: action.payload.isAuthenticated,
        isInitialized: true,
        user: action.payload.user,
      };
    case SIGN_IN:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case SIGN_OUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };

    case SIGN_UP:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };

    default:
      return state;
  }
};

const AuthContext = createContext<JWTContextType | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const loginMutation = api.auth.login.useMutation();
  const [state, dispatch] = useReducer(JWTReducer, initialState);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Only run on client side to avoid hydration mismatches
        if (typeof window === 'undefined') {
          dispatch({
            type: INITIALIZE,
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
          return;
        }

        // Check both localStorage and cookies for token
        const accessToken = window.localStorage.getItem("accessToken") ||
          document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];

        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);

          try {
            // Verify token using tRPC
            const response = await api.session.verifyToken.query({ token: accessToken });
            
            dispatch({
              type: INITIALIZE,
              payload: {
                isAuthenticated: true,
                user: {
                  id: response.user.userId,
                  email: response.user.email,
                  name: response.user.name || null,
                  role: response.user.role,
                },
              },
            });
          } catch (error) {
            // Token is invalid, remove it
            window.localStorage.removeItem("accessToken");
            document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            dispatch({
              type: INITIALIZE,
              payload: {
                isAuthenticated: false,
                user: null,
              },
            });
          }
        } else {
          dispatch({
            type: INITIALIZE,
            payload: {
              isAuthenticated: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        // Remove invalid token
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem("accessToken");
          document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        dispatch({
          type: INITIALIZE,
          payload: {
            isAuthenticated: false,
            user: null,
          },
        });
      }
    };

    initialize();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await loginMutation.mutateAsync({ email, password });

    if (response.success) {
      const { token, user } = response;

      // Store token in both localStorage and cookies for middleware compatibility
      // Only do this on the client side to avoid hydration mismatches
      if (typeof window !== 'undefined') {
        window.localStorage.setItem("accessToken", token);
        // In dev over HTTP, the Secure flag prevents the cookie from being set.
        // We add it only when we're actually using HTTPS.
        const baseCookie = [
          `accessToken=${token}`,
          "path=/",
          `max-age=${7 * 24 * 60 * 60}`,
          "samesite=strict",
        ];
        if (window.location.protocol === "https:") {
          baseCookie.push("secure");
        }
        document.cookie = baseCookie.join("; ");
        setSession(token);
      }

      dispatch({
        type: SIGN_IN,
        payload: {
          user: {
            id: user.id,
            email: user.email,
            name: user.firstName + " " + user.lastName || null,
            role: user.role,
          },
        },
      });
    } else {
      throw new Error("Login failed");
    }
  };

  const signOut = async () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem("accessToken");
      // Remove token from cookies as well
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      setSession(null);
    }
    dispatch({ type: SIGN_OUT });
  };

  // Admin dashboard doesn't need signup functionality
  const signUp = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => {
    throw new Error("Registration is not available for admin dashboard");
  };

  const resetPassword = (email: string) => {
    // This would typically redirect to a password reset page
    // or call a password reset API endpoint
    console.log("Password reset requested for:", email);
    // You can implement this later if needed
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "jwt",
        signIn,
        signOut,
        signUp,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };

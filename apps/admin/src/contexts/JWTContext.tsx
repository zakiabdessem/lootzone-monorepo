"use client";

import { ActionMap, AuthState, AuthUser, JWTContextType } from "@/types/auth";
import { isValidToken, setSession } from "@/utils/jwt";
import { api } from "@lootzone/trpc-shared";
import { createContext, ReactNode, useEffect, useReducer } from "react";

const INITIALIZE = "INITIALIZE";
const SIGN_IN = "SIGN_IN";
const SIGN_OUT = "SIGN_OUT";
const SIGN_UP = "SIGN_UP";
const ACCESS_TOKEN_KEY = "accessToken";

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
    case SIGN_UP:
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
    default:
      return state;
  }
};

const AuthContext = createContext<JWTContextType | null>(null);

const setToken = (token: string) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);

  const cookieOptions = [
    `path=/`,
    `max-age=${7 * 24 * 60 * 60}`,
    window.location.protocol === "https:" ? "secure" : "",
    window.location.hostname.includes("localhost")
      ? "samesite=lax"
      : "samesite=strict"
  ].filter(Boolean).join("; ");

  document.cookie = `${ACCESS_TOKEN_KEY}=${token}; ${cookieOptions}`;
};

const removeToken = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

function AuthProvider({ children }: { children: ReactNode }) {
  const loginMutation = api.auth.login.useMutation();
  const [state, dispatch] = useReducer(JWTReducer, initialState);

  const verifySession = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) throw new Error('Session verification failed');
      return await response.json();
    } catch (error) {
      throw new Error('Session verification failed');
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        if (typeof window === "undefined") {
          dispatch({
            type: INITIALIZE,
            payload: { isAuthenticated: false, user: null },
          });
          return;
        }

        const accessToken =
          window.localStorage.getItem(ACCESS_TOKEN_KEY) ||
          document.cookie
            .split("; ")
            .find(row => row.startsWith(`${ACCESS_TOKEN_KEY}=`))
            ?.split("=")[1] ||
          null;

        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);

          try {
            await verifySession(accessToken);
            const decoded = JSON.parse(atob(accessToken.split('.')[1]));

            dispatch({
              type: INITIALIZE,
              payload: {
                isAuthenticated: true,
                user: {
                  id: decoded.userId,
                  email: decoded.email,
                  role: decoded.role,
                },
              },
            });

            const sessionCheckInterval = setInterval(async () => {
              try {
                await verifySession(accessToken);
              } catch {
                removeToken();
                dispatch({ type: SIGN_OUT });
                clearInterval(sessionCheckInterval);
                window.location.href = "/auth/sign-in";
              }
            }, 30000);

            return () => clearInterval(sessionCheckInterval);
          } catch {
            removeToken();
            dispatch({
              type: INITIALIZE,
              payload: { isAuthenticated: false, user: null },
            });
          }
        } else {
          dispatch({
            type: INITIALIZE,
            payload: { isAuthenticated: false, user: null },
          });
        }
      } catch (err) {
        removeToken();
        dispatch({
          type: INITIALIZE,
          payload: { isAuthenticated: false, user: null },
        });
      }
    };

    initialize();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await loginMutation.mutateAsync({ email, password });

      if (response.success) {
        const { token, user } = response;
        setToken(token);

        dispatch({
          type: SIGN_IN,
          payload: {
            user: {
              id: user.id,
              email: user.email,
              name: `${user.firstName} ${user.lastName}`,
              role: user.role,
            },
          },
        });
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    removeToken();
    setSession(null);
    dispatch({ type: SIGN_OUT });
  };

  const resetPassword = (email: string) => {
    console.log("Password reset requested for:", email);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "jwt",
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };

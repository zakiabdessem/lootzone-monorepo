"use client";

import { AuthContextType, AuthState, AuthUser, ActionMap, AuthActionTypes } from "@/types/auth";
import { isValidToken, setSession, removeToken, getToken } from "@/lib/auth";
import { api } from "@lootzone/trpc-shared";
import { createContext, ReactNode, useEffect, useReducer } from "react";

const INITIALIZE = "INITIALIZE";
const SIGN_IN = "SIGN_IN";
const SIGN_OUT = "SIGN_OUT";
const SIGN_UP = "SIGN_UP";

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

const AuthContext = createContext<AuthContextType | null>(null);

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

        const accessToken = getToken();

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
                window.location.href = "/auth/login";
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
        setSession(token);

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

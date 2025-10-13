export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  user: AuthUser | null;
}

export interface AuthContextType extends AuthState {
  method: string;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => void;
}

export interface AuthActionTypes {
  INITIALIZE: {
    isAuthenticated: boolean;
    user: AuthUser | null;
  };
  SIGN_IN: {
    user: AuthUser;
  };
  SIGN_OUT: undefined;
  SIGN_UP: {
    user: AuthUser;
  };
}

export type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      };
};

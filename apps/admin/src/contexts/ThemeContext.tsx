"use client";

import React, { useEffect, useState } from "react";

import { THEMES } from "@/constants";

const initialState = {
  theme: THEMES.DEFAULT,
  setTheme: (theme: string) => {},
};
const ThemeContext = React.createContext(initialState);

type ThemeProviderProps = {
  children: React.ReactNode;
};

function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, _setTheme] = useState<string>(initialState.theme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only access localStorage on the client
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem("theme");
      if (storedTheme) {
        try {
          _setTheme(JSON.parse(storedTheme));
        } catch (e) {
          console.error('Failed to parse stored theme:', e);
        }
      }
    }
  }, []);

  const setTheme = (theme: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("theme", JSON.stringify(theme));
    }
    _setTheme(theme);
  };

  // Return a minimal shell during SSR to avoid hydration mismatches
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: initialState.theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export { ThemeProvider, ThemeContext };

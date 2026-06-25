"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const defaultContext: {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
} = {
  theme: "light",
  setTheme: () => {},
  toggle: () => {},
};

const ThemeContext = createContext(defaultContext);

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem("wv_theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const initial = getInitialTheme();
    setThemeState(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("wv_theme", t);
    document.documentElement.setAttribute("data-theme", t);
    void fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "theme", value: t }),
    }).catch(() => undefined);
  }

  function toggle() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

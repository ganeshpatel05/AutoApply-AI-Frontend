import { useEffect, useState, useCallback } from "react";

const THEME_CHANGE_EVENT = "autoapply-theme-change";

function getInitialTheme(): "light" | "dark" {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
  }
  return "light";
}

function applyThemeToDocument(theme: "light" | "dark") {
  if (typeof window === "undefined") return;
  const root = window.document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    // Ensure document reflects current theme on mount
    applyThemeToDocument(theme);

    const handleThemeChange = (e: CustomEvent<"light" | "dark">) => {
      if (e.detail && (e.detail === "light" || e.detail === "dark")) {
        setThemeState(e.detail);
        applyThemeToDocument(e.detail);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "theme" && (e.newValue === "light" || e.newValue === "dark")) {
        setThemeState(e.newValue);
        applyThemeToDocument(e.newValue);
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT as any, handleThemeChange as EventListener);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT as any, handleThemeChange as EventListener);
      window.removeEventListener("storage", handleStorage);
    };
  }, [theme]);

  const setTheme = useCallback((newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    applyThemeToDocument(newTheme);
    localStorage.setItem("theme", newTheme);
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: newTheme }));
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = (typeof window !== "undefined" && document.documentElement.classList.contains("dark")) ? "light" : "dark";
    setTheme(nextTheme);
  }, [setTheme]);

  return { theme, toggleTheme, setTheme };
}

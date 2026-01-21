"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

export type Theme = "light" | "dark";

type UIState = {
  theme: Theme;
  sidebarOpen: boolean;
};

type UIAction =
  | { type: "HYDRATE_THEME"; theme: Theme }
  | { type: "SET_THEME"; theme: Theme }
  | { type: "TOGGLE_THEME" }
  | { type: "SET_SIDEBAR"; open: boolean }
  | { type: "TOGGLE_SIDEBAR" };

export type UIContextType = {
  theme: Theme;
  sidebarOpen: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
};

const STORAGE_KEY = "sms_theme";
const UIContext = createContext<UIContextType | null>(null);

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}

function readStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === "light" || raw === "dark") return raw;
  return null;
}

function writeStoredTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, theme);
}

function reducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case "HYDRATE_THEME":
      return { ...state, theme: action.theme };
    case "SET_THEME":
      return { ...state, theme: action.theme };
    case "TOGGLE_THEME":
      return { ...state, theme: state.theme === "dark" ? "light" : "dark" };
    case "SET_SIDEBAR":
      return { ...state, sidebarOpen: action.open };
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };
    default:
      return state;
  }
}

const initialState: UIState = {
  theme: "light",
  sidebarOpen: false,
};

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate theme once on mount.
  useEffect(() => {
    const stored = readStoredTheme();
    const initial = stored ?? "light";
    dispatch({ type: "HYDRATE_THEME", theme: initial });
    applyTheme(initial);
  }, []);

  // Apply theme + persist on change.
  useEffect(() => {
    applyTheme(state.theme);
    writeStoredTheme(state.theme);
  }, [state.theme]);

  const setTheme = useCallback((theme: Theme) => {
    dispatch({ type: "SET_THEME", theme });
    if (process.env.NODE_ENV !== "production") {
      console.log("[ui] setTheme", theme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    dispatch({ type: "TOGGLE_THEME" });
    if (process.env.NODE_ENV !== "production") {
      console.log("[ui] toggleTheme");
    }
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    dispatch({ type: "SET_SIDEBAR", open });
    if (process.env.NODE_ENV !== "production") {
      console.log("[ui] sidebar", open ? "open" : "close");
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
    if (process.env.NODE_ENV !== "production") {
      console.log("[ui] toggleSidebar");
    }
  }, []);

  const value = useMemo<UIContextType>(
    () => ({
      theme: state.theme,
      sidebarOpen: state.sidebarOpen,
      setTheme,
      toggleTheme,
      setSidebarOpen,
      toggleSidebar,
      openSidebar: () => setSidebarOpen(true),
      closeSidebar: () => setSidebarOpen(false),
    }),
    [
      state.theme,
      state.sidebarOpen,
      setTheme,
      toggleTheme,
      setSidebarOpen,
      toggleSidebar,
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUIContext() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUIContext must be used within UIProvider");
  return ctx;
}

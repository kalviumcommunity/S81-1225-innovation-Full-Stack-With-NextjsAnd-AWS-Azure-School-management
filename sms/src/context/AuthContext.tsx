"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiFetch } from "@/utils/api-client";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
};

export type AuthContextType = {
  token: string | null;
  user: AuthUser | null;
  loading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: boolean; message: string }>;
  signup: (input: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
  }) => Promise<{ ok: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const TOKEN_KEY = "sms_token";
const AuthContext = createContext<AuthContextType | null>(null);

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function writeToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const t = readToken();
    if (!t) {
      setUser(null);
      return;
    }

    const res = await apiFetch<AuthUser>("/users/me", { token: t });
    if (res.success && res.data) {
      setUser(res.data);
      return;
    }

    // Token invalid/expired
    writeToken(null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const t = readToken();
    setToken(t);
    refreshMe().finally(() => setLoading(false));
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ user: AuthUser; token: string }>(
      "/auth/login",
      {
        method: "POST",
        body: { email, password },
      }
    );

    if (!res.success || !res.data) {
      return { ok: false, message: res.message || "Login failed" };
    }

    writeToken(res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);

    if (process.env.NODE_ENV !== "production") {
      console.log("[auth] login", res.data.user.email);
    }

    return { ok: true, message: res.message || "Login successful" };
  }, []);

  const signup = useCallback(
    async (input: {
      email: string;
      password: string;
      confirmPassword: string;
      firstName: string;
      lastName: string;
    }) => {
      const res = await apiFetch<{ user: AuthUser; token: string }>(
        "/auth/signup",
        {
          method: "POST",
          body: input,
        }
      );

      if (!res.success || !res.data) {
        return { ok: false, message: res.message || "Signup failed" };
      }

      writeToken(res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);

      if (process.env.NODE_ENV !== "production") {
        console.log("[auth] signup", res.data.user.email);
      }

      return { ok: true, message: res.message || "Signup successful" };
    },
    []
  );

  const logout = useCallback(async () => {
    const t = readToken();
    if (t) {
      await apiFetch<null>("/auth/logout", { method: "POST", token: t });
    }
    writeToken(null);
    setToken(null);
    setUser(null);

    if (process.env.NODE_ENV !== "production") {
      console.log("[auth] logout");
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({ token, user, loading, login, signup, logout, refreshMe }),
    [token, user, loading, login, signup, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
}

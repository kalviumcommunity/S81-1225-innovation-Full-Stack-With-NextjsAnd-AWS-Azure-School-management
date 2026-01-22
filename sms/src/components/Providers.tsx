"use client";

import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import { SWRConfig } from "swr";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        refreshWhenHidden: false,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        errorRetryInterval: 2000,
        dedupingInterval: 2000,
      }}
    >
      <AuthProvider>
        <UIProvider>{children}</UIProvider>
      </AuthProvider>
    </SWRConfig>
  );
}

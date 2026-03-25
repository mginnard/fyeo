"use client";

import React, { createContext, useContext, useMemo } from "react";

const FyeoContext = createContext<{
  flags: Record<string, unknown>;
  isReady: boolean;
}>({ flags: {}, isReady: true });

export function FyeoProvider({
  children,
  flags,
}: {
  children: React.ReactNode;
  flags: Record<string, unknown>;
}) {
  const value = useMemo(
    () => ({ flags: flags ?? {}, isReady: true }),
    [flags]
  );
  return (
    <FyeoContext.Provider value={value}>
      {children}
    </FyeoContext.Provider>
  );
}

export function useFyeo(): {
  flags: Record<string, unknown>;
  isReady: boolean;
} {
  const ctx = useContext(FyeoContext);
  return ctx ?? { flags: {}, isReady: true };
}

export function useFlag<T = boolean>(key: string, defaultValue?: T): T {
  const { flags } = useFyeo();
  const raw = flags[key];
  if (raw === undefined) return defaultValue as T;
  return raw as T;
}

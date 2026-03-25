"use client";

import React, { createContext, useContext, useMemo } from "react";

const GatehouseContext = createContext<{
  flags: Record<string, unknown>;
  isReady: boolean;
}>({ flags: {}, isReady: true });

export function GatehouseProvider({
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
    <GatehouseContext.Provider value={value}>
      {children}
    </GatehouseContext.Provider>
  );
}

export function useGatehouse(): {
  flags: Record<string, unknown>;
  isReady: boolean;
} {
  const ctx = useContext(GatehouseContext);
  return ctx ?? { flags: {}, isReady: true };
}

export function useFlag<T = boolean>(key: string, defaultValue?: T): T {
  const { flags } = useGatehouse();
  const raw = flags[key];
  if (raw === undefined) return defaultValue as T;
  return raw as T;
}

// AuthProvider.tsx — add a ref guard so hydrate only runs once
"use client";
import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    hydrate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
}

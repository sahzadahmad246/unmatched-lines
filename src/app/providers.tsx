// app/providers.tsx
"use client";

import type React from "react";
import { SessionProvider } from "next-auth/react";
import { ColorTransitionProvider } from "@/lib/color-transition-provider"; // Adjust path as needed

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ColorTransitionProvider>
        {children}
      </ColorTransitionProvider>
    </SessionProvider>
  );
}
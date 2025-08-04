// src/app/components/ClientProviders.tsx
"use client";

import type React from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
interface ClientProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();
export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
         <ReactQueryDevtools initialIsOpen={false} />
        <SessionProvider>{children}</SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

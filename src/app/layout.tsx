// app/layout.tsx
import type React from "react";
import { Providers } from "./providers";
import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import { Toaster } from "sonner";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import ClientLayout from "./client-layout"; // New client component

export const metadata: Metadata = {
  title: {
    default: "Unmatched Lines - Poetry Collection",
    template: "%s | Unmatched Lines - Poetry Collection",
  },
  description: "Discover beautiful poetry from renowned poets across different languages and traditions. Explore classic and contemporary poems in our curated collection.",
  keywords: "poetry, poems, famous poets, multilingual poetry, poetry collection, classic poetry, contemporary poetry",
  authors: [{ name: "Unmatched Lines Team" }],
  openGraph: {
    title: "Unmatched Lines - Poetry Collection",
    description: "Explore a diverse collection of beautiful poetry from famous poets across languages and cultures.",
    url: "https://unmatched-lines.vercel.app",
    siteName: "Unmatched Lines",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unmatched Lines - Poetry Collection",
    description: "Discover poetry from renowned poets in multiple languages at Unmatched Lines.",
    creator: "@shahzadahmad246",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
    },
  },
  metadataBase: new URL("https://unmatched-lines.vercel.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
import type React from "react";
import { Providers } from "./providers";
import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import ClientLayout from "./client-layout";

export const metadata: Metadata = {
  title: {
    default: "Unmatched Lines - Poetry Collection",
    template: "%s | Unmatched Lines - Poetry Collection",
  },
  description:
    "Discover beautiful poetry from renowned poets across different languages and traditions. Explore classic and contemporary poems in our curated collection.",
  keywords:
    "poetry, poems, famous poets, multilingual poetry, poetry collection, classic poetry, contemporary poetry",
  authors: [{ name: "Unmatched Lines Team" }],
  openGraph: {
    title: "Unmatched Lines - Poetry Collection",
    description:
      "Explore a diverse collection of beautiful poetry from famous poets across languages and cultures.",
    url: "https://unmatchedlines.com",
    siteName: "Unmatched Lines",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/images/image1.jpg",
        width: 1200,
        height: 630,
        alt: "Unmatched Lines Poetry Collection",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unmatched Lines - Poetry Collection",
    description:
      "Discover poetry from renowned poets in multiple languages at Unmatched Lines.",
    creator: "@shahzadahmad246",
    images: ["/images/image1.jpg"],
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
  metadataBase: new URL("https://unmatchedlines.com"),
  icons: {
    icon: "/icon.ico", // Updated to new name
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="UHyWmr1AgyMlb5wkC2f7Ep-sMZTbskO6ZSGpwsLgLCM"
        />
      </head>
      <body>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}

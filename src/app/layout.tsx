import type React from "react";
import { Inter, Noto_Nastaliq_Urdu } from "next/font/google";
import ClientProviders from "@/components/ClientProviders";
import ConditionalNavigation from "@/components/navigation/conditional-navigation";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";

// Configure Inter font for Latin text
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Configure Noto Nastaliq Urdu font for Urdu text
const notoNastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-noto-nastaliq",
});

export const metadata: Metadata = {
  title: "Unmatched Lines",
  description:
    "Discover a soulful collection of timeless Urdu, Hindi, and Roman poetry. Read famous ghazals, nazms, and sher by legendary poets like Ghalib, Faiz, Faraz, and more.",
  keywords: [
    "Urdu poetry",
    "Hindi poetry",
    "Roman Urdu poetry",
    "Ghazals",
    "Nazms",
    "Shayari",
    "Mirza Ghalib",
    "Faiz Ahmed Faiz",
    "Ahmad Faraz",
    "Unmatched Lines",
    "Poetry website",
    "Romantic poetry",
    "Sad poetry",
  ],
  openGraph: {
    title: "Unmatched Lines | Explore Ghazals, Nazms & Shayari",
    description:
      "Unmatched Lines offers an immersive collection of classical and modern poetry in Urdu, Hindi, and Roman scripts.",
    url: "https://unmatchedlines.com",
    siteName: "Unmatched Lines",
    images: [
      {
        url: "https://unmatchedlines.com/placeholder.svg",
        width: 1200,
        height: 630,
        alt: "Unmatched Lines Poetry Banner",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unmatched Lines | Timeless Poetry in Urdu, Hindi & Roman",
    description:
      "Read the finest ghazals, nazms, and sher from iconic poets across generations. Dive into the world of unmatched poetry.",
    images: ["https://unmatchedlines.com/placeholder.svg"],
  },
  authors: [
    { name: "Unmatched Lines Team", url: "https://unmatchedlines.com" },
  ],
  creator: "Shahzad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="UHyWmr1AgyMlb5wkC2f7Ep-sMZTbskO6ZSGpwsLgLCM"
        />
        <meta name="monetag" content="ef92b2440c3c127cea97f1959018612a" />
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className={`${inter.variable} ${notoNastaliq.variable}`}>
        <ClientProviders>
          <Suspense>
            <ConditionalNavigation>{children}</ConditionalNavigation>
            <Toaster richColors />
          </Suspense>
        </ClientProviders>
      </body>
    </html>
  );
}
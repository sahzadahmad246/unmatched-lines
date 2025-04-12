import type { Metadata } from "next";
import Home from "@/components/home/home"; // Adjust path as needed

export const metadata: Metadata = {
  title: "Unmatched Lines | Home of Poetry and Literature",
  description:
    "Welcome to Unmatched Lines, your home for exploring poems and poets. Dive into ghazals, shers, nazms, and multilingual poetry collections.",
  keywords: [
    "poetry",
    "poems",
    "poets",
    "ghazals",
    "shers",
    "nazms",
    "literature",
    "multilingual poetry",
    "unmatched lines",
  ].join(", "),
  openGraph: {
    title: "Unmatched Lines | Home of Poetry and Literature",
    description:
      "Welcome to Unmatched Lines, your home for exploring poems and poets. Dive into ghazals, shers, nazms, and multilingual poetry collections.",
    url: "https://unmatched-lines.vercel.app",
    siteName: "Unmatched Lines",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/default-home-image.jpg",
        width: 800,
        height: 400,
        alt: "Unmatched Lines Homepage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unmatched Lines | Home of Poetry and Literature",
    description:
      "Welcome to Unmatched Lines, your home for exploring poems and poets.",
    images: ["/default-home-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://unmatched-lines.vercel.app"),
  alternates: {
    canonical: "https://unmatched-lines.vercel.app", // Added canonical URL
    languages: {
      "en-US": "https://unmatched-lines.vercel.app", // Hreflang for English
      // Add hi-IN, ur-PK if other language pages exist, e.g.:
      // "hi-IN": "https://unmatched-lines.vercel.app/hi",
      // "ur-PK": "https://unmatched-lines.vercel.app/ur",
    },
  },
  icons: {
    apple: "/apple-touch-icon.png", // Ensure this file exists in /public
  },
};

export default function Page() {
  return <Home />;
}
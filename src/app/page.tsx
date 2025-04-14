import type { Metadata } from "next";
import Home from "@/components/home/home";

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
    url: "https://unmatchedlines.com",
    siteName: "Unmatched Lines",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/images/image1.jpg", // Static image
        width: 1200,
        height: 630,
        alt: "Unmatched Lines Homepage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unmatched Lines | Home of Poetry and Literature",
    description:
      "Welcome to Unmatched Lines, your home for exploring poems and poets.",
    images: ["/images/image1.jpg"], // Static image
  },
  alternates: {
    canonical: "https://unmatchedlines.com",
    languages: {
      "en-US": "https://unmatchedlines.com",
    },
  },
  icons: {
    icon: "/icon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function Page() {
  return <Home />;
}

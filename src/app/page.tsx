import type { Metadata } from "next";
import HomePage from "@/components/home/home";

// Static metadata for build time
export const metadata: Metadata = {
  title: "Unmatched Lines | Home of Poetry and Literature",
  description: "Welcome to Unmatched Lines, your home for exploring poems and poets. Dive into ghazals, shers, nazms, and multilingual poetry collections.",
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
    description: "Welcome to Unmatched Lines, your home for exploring poems and poets. Dive into ghazals, shers, nazms, and multilingual poetry collections.",
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
    description: "Welcome to Unmatched Lines, your home for exploring poems and poets.",
    images: ["/default-home-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://unmatched-lines.vercel.app"),
};

export default function Home() {
  return (
    <>
      <HomePage />
    </>
  );
}
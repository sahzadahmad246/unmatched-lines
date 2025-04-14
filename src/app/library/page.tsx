import type { Metadata } from "next";
import Library from "@/components/poems/library";

// Static metadata for build time
export const metadata: Metadata = {
  title: "Poetry Library | Explore Poems and Poets",
  description: "Discover our collection of poems and poets. Explore ghazals, shers, nazms, and more in our multilingual poetry library.",
  keywords: [
    "poetry",
    "poems",
    "poets",
    "ghazals",
    "shers",
    "nazms",
    "literature",
    "multilingual poetry",
  ].join(", "),
  openGraph: {
    title: "Poetry Library | Explore Poems and Poets",
    description: "Discover our collection of poems and poets in our multilingual poetry library.",
    url: "https://unmatchedlines.com/library",
    siteName: "Your Site Name",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/default-library-image.jpg",
        width: 800,
        height: 400,
        alt: "Poetry Library",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Poetry Library | Explore Poems and Poets",
    description: "Discover our collection of poems and poets in our multilingual poetry library.",
    images: ["/default-library-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://unmatchedlines.com/library"),
};

export default function LibraryPage() {
  return <Library />;
}
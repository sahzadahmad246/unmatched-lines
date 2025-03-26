// src/app/library/page.tsx
import type { Metadata } from "next";
import Library from "@/components/poems/library";

// Fetch basic library data for metadata (optional, depending on your needs)
async function fetchLibraryData(): Promise<{ poemCount: number; poetCount: number }> {
  try {
    const [poemsRes, poetsRes] = await Promise.all([
      fetch(`${process.env.NEXTAUTH_URL}/api/poem`, { cache: "no-store" }),
      fetch(`${process.env.NEXTAUTH_URL}/api/authors`, { cache: "no-store" }),
    ]);

    if (!poemsRes.ok || !poetsRes.ok) {
      throw new Error("Failed to fetch library data");
    }

    const poemsData = await poemsRes.json();
    const poetsData = await poetsRes.json();

    return {
      poemCount: poemsData.poems?.length || 0,
      poetCount: poetsData.authors?.length || 0,
    };
  } catch (error) {
    console.error("Error fetching library data for metadata:", error);
    return { poemCount: 0, poetCount: 0 };
  }
}

// Generate metadata dynamically
export async function generateMetadata(): Promise<Metadata> {
  const { poemCount, poetCount } = await fetchLibraryData();

  const title = "Poetry Library | Explore Poems and Poets";
  const description = `Discover a collection of ${poemCount} poems and ${poetCount} poets. Explore ghazals, shers, nazms, and more in our multilingual poetry library.`;

  return {
    title,
    description,
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
      title,
      description,
      url: "https://unmatched-lines.vercel.app/library",
      siteName: "Your Site Name",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/default-library-image.jpg", // Replace with your default image
          width: 800,
          height: 400,
          alt: "Poetry Library",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/default-library-image.jpg"], // Replace with your default image
    },
    robots: {
      index: true,
      follow: true,
    },
    metadataBase: new URL("https://unmatched-lines.vercel.app"),
  };
}

export default function LibraryPage() {
  return <Library />;
}
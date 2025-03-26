// src/app/page.tsx
import type { Metadata } from "next";
import HomePage from "@/components/home/home";

// Fetch basic data for metadata (optional, depending on your needs)
async function fetchHomeData(): Promise<{ poemCount: number; poetCount: number }> {
  try {
    const [poemsRes, poetsRes] = await Promise.all([
      fetch(`${process.env.NEXTAUTH_URL}/api/poem`, { cache: "no-store" }),
      fetch(`${process.env.NEXTAUTH_URL}/api/authors`, { cache: "no-store" }),
    ]);

    if (!poemsRes.ok || !poetsRes.ok) {
      throw new Error("Failed to fetch home data");
    }

    const poemsData = await poemsRes.json();
    const poetsData = await poetsRes.json();

    return {
      poemCount: poemsData.poems?.length || 0,
      poetCount: poetsData.authors?.length || 0,
    };
  } catch (error) {
    console.error("Error fetching home data for metadata:", error);
    return { poemCount: 0, poetCount: 0 };
  }
}

// Generate metadata dynamically
export async function generateMetadata(): Promise<Metadata> {
  const { poemCount, poetCount } = await fetchHomeData();

  const title = "Unmatched Lines | Home of Poetry and Literature";
  const description = `Welcome to Unmatched Lines, your home for exploring ${poemCount} poems and ${poetCount} poets. Dive into ghazals, shers, nazms, and multilingual poetry collections.`;

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
      "unmatched lines",
    ].join(", "),
    openGraph: {
      title,
      description,
      url: "https://unmatched-lines.vercel.app",
      siteName: "Unmatched Lines",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/default-home-image.jpg", // Replace with your homepage image
          width: 800,
          height: 400,
          alt: "Unmatched Lines Homepage",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/default-home-image.jpg"], // Replace with your homepage image
    },
    robots: {
      index: true,
      follow: true,
    },
    metadataBase: new URL("https://unmatched-lines.vercel.app"),
  };
}

export default function Home() {
  return (
    <>
      <HomePage />
    </>
  );
}
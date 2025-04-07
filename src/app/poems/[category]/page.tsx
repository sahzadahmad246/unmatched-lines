// src/app/poems/[category]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPoems from "@/components/poems/CategoryPoems ";
import { Poem } from "@/types/poem";

async function fetchPoemsByCategory(category: string): Promise<Poem[] | null> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/poem?category=${category}`, {
      cache: "force-cache", // Consistent with your poem page
    });
    if (!res.ok) throw new Error(`Failed to fetch poems: ${res.status}`);
    const data = await res.json();
    return data.poems || null;
  } catch (error) {
    console.error("Error fetching poems:", error);
    return null;
  }
}

async function fetchCoverImages(): Promise<{ url: string }[]> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/cover-images`, {
      credentials: "include",
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Failed to fetch cover images");
    const data = await res.json();
    return data.coverImages || [];
  } catch (error) {
    console.error("Error fetching cover images:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const category = resolvedParams.category;
  const poems = await fetchPoemsByCategory(category);
  const coverImages = await fetchCoverImages();

  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
  const title = `${displayCategory} Poems | Unmatched Lines`;
  const description = `Explore a collection of ${displayCategory} poems in English, Hindi, and Urdu at Unmatched Lines.`;
  const coverImageUrl = coverImages.length > 0 ? coverImages[0].url : "/default-poem-image.jpg";
  const baseUrl = process.env.NEXTAUTH_URL || "https://unmatched-lines.vercel.app";

  return {
    title,
    description,
    keywords: [
      displayCategory,
      "poetry",
      `${displayCategory} poems`,
      "English poetry",
      "Hindi poetry",
      "Urdu poetry",
      "Unmatched Lines",
    ].join(", "),
    alternates: {
      canonical: `${baseUrl}/poems/${category}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/poems/${category}`,
      images: [{ url: coverImageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImageUrl],
    },
  };
}

export async function generateStaticParams() {
  // Define known categories (you can fetch these dynamically from your DB if needed)
  const categories = ["ghazal", "sher", "nazm"];
  return categories.map((category) => ({ category }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const poems = await fetchPoemsByCategory(resolvedParams.category);

  if (!poems) {
    notFound();
  }

  return <CategoryPoems poems={poems} category={resolvedParams.category} />;
}
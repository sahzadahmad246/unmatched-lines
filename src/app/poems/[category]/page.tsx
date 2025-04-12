import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPoems from "@/components/poems/CategoryPoems ";
import { Poem } from "@/types/poem";

async function fetchPoemsByCategory(category: string): Promise<Poem[] | null> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/poem?category=${encodeURIComponent(category)}`, {
      cache: "force-cache",
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

async function fetchCategories(): Promise<string[]> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/poem`, {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error(`Failed to fetch poems: ${res.status}`);
    const data = await res.json();
    const poems: Poem[] = data.poems || [];
    const categories: string[] = [
      ...new Set(
        poems
          .filter((poem): poem is Poem => typeof poem.category === "string" && poem.category.trim().length > 0)
          .map((poem) => poem.category.toLowerCase())
      ),
    ] as string[];
    return categories.length > 0 ? categories : ["ghazal", "sher", "nazm"];
  } catch (error) {
    console.error("Error fetching categories via poems:", error);
    return ["ghazal", "sher", "nazm"];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const category = decodeURIComponent(resolvedParams.category);
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
  const coverImages = await fetchCoverImages();
  const baseUrl = process.env.NEXTAUTH_URL || "https://unmatched-lines.vercel.app";

  const title = `${displayCategory}`;
  const description = `Discover a curated collection of ${displayCategory} poems in English, Hindi, and Urdu at Unmatched Lines. Explore heartfelt shayari and poetry.`;
  const coverImageUrl = coverImages.length > 0 ? coverImages[0].url : "/default-poem-image.jpg";

  return {
    title,
    description,
    keywords: [
      displayCategory,
      `${displayCategory} poems`,
      `${displayCategory} shayari`,
      "poetry",
      "English poetry",
      "Hindi poetry",
      "Urdu poetry",
      "Unmatched Lines",
    ],
    alternates: {
      canonical: `${baseUrl}/poems/${encodeURIComponent(category)}`,
      languages: {
        "en-US": `${baseUrl}/poems/${encodeURIComponent(category)}`,
        "hi-IN": `${baseUrl}/poems/${encodeURIComponent(category)}`,
        "ur-PK": `${baseUrl}/poems/${encodeURIComponent(category)}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/poems/${encodeURIComponent(category)}`,
      siteName: "Unmatched Lines",
      images: [
        {
          url: coverImageUrl,
          width: 1200,
          height: 630,
          alt: `${displayCategory} Poetry Collection`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: coverImageUrl,
          alt: `${displayCategory} Poetry Collection`,
        },
      ],
      site: "@UnmatchedLines",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    verification: {
      google: "your-google-verification-code",
    },
  };
}

export async function generateStaticParams() {
  const categories = await fetchCategories();
  return categories.map((category) => ({ category: encodeURIComponent(category) }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const resolvedParams = await params;
  const category = decodeURIComponent(resolvedParams.category);
  const poems = await fetchPoemsByCategory(category);

  if (!poems || poems.length === 0) {
    notFound();
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://unmatched-lines.vercel.app";
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${displayCategory} Poems`,
    description: `A curated collection of ${displayCategory} poems in English, Hindi, and Urdu on Unmatched Lines.`,
    url: `${baseUrl}/poems/${encodeURIComponent(category)}`,
    publisher: {
      "@type": "Organization",
      name: "Unmatched Lines",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntity: poems.map((poem) => {
      const poemSlug = Array.isArray(poem.slug) ? poem.slug[0] : poem.slug;
      return {
        "@type": "CreativeWork",
        name: poem.title?.en || "Untitled Poem",
        url: `${baseUrl}/poems/en/${encodeURIComponent(poemSlug?.en || poem._id)}`,
        description: poem.content?.en?.[0]?.substring(0, 100) || "A beautiful poem from Unmatched Lines.",
        author: {
          "@type": "Person",
          name: poem.author?.name || "Unknown Author",
        },
        inLanguage: ["en", poem.title?.hi ? "hi" : null, poem.title?.ur ? "ur" : null].filter(Boolean),
        keywords: [poem.category, displayCategory, "poetry", "shayari"],
      };
    }),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${baseUrl}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: displayCategory,
          item: `${baseUrl}/poems/${encodeURIComponent(category)}`,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <CategoryPoems poems={poems} category={category} />
    </>
  );
}

export const revalidate = 86400;
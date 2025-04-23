import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryPoems from "@/components/poems/CategoryPoems ";
import { Poem, Author } from "@/types/poem";

interface ApiResponse {
  poems: Poem[];
  author: Author;
}

interface PoetCategoryPageProps {
  params: Promise<{ slug: string; category: string }>;
}

export async function generateMetadata({
  params,
}: PoetCategoryPageProps): Promise<Metadata> {
  const { slug, category } = await params;
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  let authorName = "Unknown Author";
  try {
    const res = await fetch(
      `${baseUrl}/api/poem?category=${encodeURIComponent(
        category
      )}&authorSlug=${encodeURIComponent(slug)}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`Failed to fetch poems: ${res.status}`);
    const data: ApiResponse = await res.json();
    authorName = data.author?.name || "Unknown Author";
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: `${capitalizedCategory} by ${authorName} | Unmatched Lines`,
    description: `Explore a curated collection of ${category} poems by ${authorName} in English, Hindi, and Urdu.`,
    keywords: [
      authorName,
      category,
      "poems",
      "poetry",
      "ghazals",
      "shers",
      "nazms",
      "English poems",
      "Hindi poems",
      "Urdu poems",
      "multilingual poetry",
    ].join(", "),
    openGraph: {
      title: `${capitalizedCategory} by ${authorName} | Unmatched Lines`,
      description: `Discover a collection of ${category} poems by ${authorName} in our multilingual poetry library.`,
      url: `${baseUrl}/poets/${slug}/${category}`,
      siteName: "Unmatched Lines",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/public/images/image1.jpg",
          width: 800,
          height: 400,
          alt: `${capitalizedCategory} Poems by ${authorName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${capitalizedCategory} by ${authorName} | Unmatched Lines`,
      description: `Discover a collection of ${category} poems by ${authorName} in our multilingual poetry library.`,
      images: ["/public/images/image1.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
    metadataBase: new URL(baseUrl),
  };
}

async function generateStructuredData(
  category: string,
  poems: Poem[],
  author: Author
) {
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${capitalizedCategory} Poems by ${author.name}`,
    description: `Explore a curated collection of ${category} poems by ${author.name} in English, Hindi, and Urdu.`,
    url: `${baseUrl}/poets/${author.slug}/${category}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: poems.slice(0, 5).map((poem, index) => ({
        "@type": "CreativeWork",
        position: index + 1,
        name: poem.title?.en || "Untitled Poem",
        author: poem.author?.name || "Unknown",
        description: `A ${category} poem by ${author.name} in English.`,
        url: `${baseUrl}/poems/en/${poem.slug?.en || poem._id}`,
      })),
    },
  };
}

export default async function PoetCategoryPage({
  params,
}: PoetCategoryPageProps) {
  const { slug, category } = await params;
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";
  const res = await fetch(
    `${baseUrl}/api/poem?category=${encodeURIComponent(
      category
    )}&authorSlug=${encodeURIComponent(slug)}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error(`Failed to fetch poems: ${res.status}`);
  }

  const data: ApiResponse = await res.json();

  if (!data.author || !Array.isArray(data.poems)) {
    throw new Error("Invalid API response format");
  }

  const { poems, author } = data;
  const structuredData = await generateStructuredData(category, poems, author);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <CategoryPoems poems={poems} category={category} />
    </>
  );
}
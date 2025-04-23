// src/app/category/[category]/page.tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryPoems from "@/components/poems/CategoryPoems ";
import { Poem } from "@/types/poem";

interface ApiResponse {
  category: string;
  poems: Poem[];
  total: number;
  page: number;
  pages: number;
}

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  return {
    title: `${capitalizedCategory}`,
    description: `Explore a curated collection of ${category} poems in English, Hindi, and Urdu. Discover ghazals, shers, nazms, and more.`,
    keywords: [
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
      title: `${capitalizedCategory} Poems | Unmatched Lines`,
      description: `Discover a collection of ${category} poems in our multilingual poetry library.`,
      url: `${baseUrl}/category/${category}`,
      siteName: "Unmatched Lines",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/public/images/image1.jpg",
          width: 800,
          height: 400,
          alt: `${capitalizedCategory} Poems`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${capitalizedCategory} Poems | Unmatched Lines`,
      description: `Discover a collection of ${category} poems in our multilingual poetry library.`,
      images: ["/public/images/image1.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
    metadataBase: new URL(baseUrl),
  };
}

async function generateStructuredData(category: string, poems: Poem[]) {
  const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${capitalizedCategory} Poems`,
    description: `Explore a curated collection of ${category} poems in English, Hindi, and Urdu.`,
    url: `https://www.unmatchedlines.com/category/${category}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: poems.slice(0, 5).map((poem, index) => ({
        "@type": "CreativeWork",
        position: index + 1,
        name: poem.title,
        author: poem.author || "Unknown",
        description: `A ${category} poem in English.`,
        url: `https://www.unmatchedlines.com/poem/${poem.slug}`,
      })),
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";
  const res = await fetch(
    `${baseUrl}/api/poems-by-category?category=${category}&page=1&limit=10`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    if (res.status === 404) {
      notFound();
    }
    throw new Error(`Failed to fetch poems: ${res.status}`);
  }

  const data: ApiResponse = await res.json();

  if (!data.category || !Array.isArray(data.poems)) {
    throw new Error("Invalid API response format");
  }

  const { poems, category: fetchedCategory } = data;
  const structuredData = await generateStructuredData(fetchedCategory, poems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <CategoryPoems poems={poems} category={fetchedCategory} />
    </>
  );
}
import type { Metadata } from "next";
import PoemDetail from "@/components/poems/poem-detail";
import { Poem } from "@/types/poem";
import { getSlugs } from "@/utils/helpers";

async function fetchPoem(slug: string): Promise<Poem | null> {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL}/api/poem?slug=${slug}`,
      {
        cache: "force-cache",
      }
    );
    if (!res.ok) throw new Error(`Failed to fetch poem: ${res.status}`);
    const data = await res.json();
    return data.poem || null;
  } catch (error) {
    console.error("Error fetching poem:", error);
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
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const poem = await fetchPoem(resolvedParams.slug);
  const coverImages = await fetchCoverImages();

  const title = poem?.title?.en || "Poem Not Found";
  const author = poem?.author?.name || "Unknown Author";
  const description = poem?.content?.en
    ? `${poem.content.en[0]?.slice(0, 150)}... - A poem by ${author}`
    : `Explore this poem by ${author} in English.`;
  // Prioritize poem.coverImage (string URL), fallback to coverImages[0].url, then default image
  const coverImageUrl =
    poem?.coverImage ||
    (coverImages.length > 0 ? coverImages[0].url : "/default-poem-image.jpg");
  const slugs = getSlugs(poem, resolvedParams.slug);

  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  return {
    title: `${title} by ${author} | Unmatched Lines`,
    description,
    keywords: [
      title,
      author,
      "poetry",
      "English poem",
      poem?.category || "poetry",
      ...(poem?.tags || []),
    ].join(", "),
    alternates: {
      canonical: `${baseUrl}/poems/en/${slugs.en}`,
      languages: {
        en: `/poems/en/${slugs.en}`,
        hi: `/poems/hi/${slugs.hi}`,
        ur: `/poems/ur/${slugs.ur}`,
      },
    },
    openGraph: {
      title: `${title} by ${author} | English`,
      description,
      url: `${baseUrl}/poems/en/${slugs.en}`,
      images: [
        {
          url: coverImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} by ${author}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} by ${author} | English`,
      description,
      images: [coverImageUrl],
    },
  };
}

// Generate structured data for SEO
function generateStructuredData(
  poem: Poem | null,
  language: string,
  baseUrl: string,
  slugs: Record<string, string>,
  coverImageUrl: string
) {
  if (!poem) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: poem.title?.en || "Untitled Poem",
    author: {
      "@type": "Person",
      name: poem.author?.name || "Unknown Author",
    },
    description:
      poem.title?.en || `A poem by ${poem.author?.name || "Unknown Author"}`,
    inLanguage: language,
    url: `${baseUrl}/poems/${language}/${slugs[language]}`,
    image: coverImageUrl,
    keywords: poem.tags?.join(", ") || poem.category || "poetry",
    datePublished: poem.createdAt || undefined,
    genre: poem.category || "Poetry",
  };
}

export default async function PoemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const poem = await fetchPoem(resolvedParams.slug);
  const coverImages = await fetchCoverImages();
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";
  const slugs = getSlugs(poem, resolvedParams.slug);
  const coverImageUrl =
    poem?.coverImage ||
    (coverImages.length > 0 ? coverImages[0].url : "/default-poem-image.jpg");

  const structuredData = generateStructuredData(
    poem,
    "en",
    baseUrl,
    slugs,
    coverImageUrl
  );

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <PoemDetail poem={poem} language="en" />
    </>
  );
}

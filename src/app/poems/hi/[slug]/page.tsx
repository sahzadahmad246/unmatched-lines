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

  const title = poem?.title?.hi || "कविता नहीं मिली";
  const author = poem?.author?.name || "अज्ञात लेखक";
  const description = poem?.summary?.hi
    ? poem.summary.hi.slice(0, 150)
    : poem?.content?.hi?.[0]?.verse
    ? `${poem.content.hi[0].verse.slice(0, 150)}... - ${author} की कविता`
    : `${author} की यह कविता हिंदी में पढ़ें।`;
  const coverImageUrl =
    poem?.coverImage ||
    (coverImages.length > 0 ? coverImages[0].url : "/default-poem-image.jpg");
  const slugs = getSlugs(poem, resolvedParams.slug);

  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  return {
    title: `${title} द्वारा ${author} | हिंदी कविता`,
    description,
    keywords: [
      title,
      author,
      "कविता",
      "हिंदी कविता",
      poem?.category || "कविता",
      ...(poem?.tags || []),
    ].join(", "),
    alternates: {
      canonical: `${baseUrl}/poems/hi/${slugs.hi}`,
      languages: {
        en: `/poems/en/${slugs.en}`,
        hi: `/poems/hi/${slugs.hi}`,
        ur: `/poems/ur/${slugs.ur}`,
      },
    },
    openGraph: {
      title: `${title} द्वारा ${author} | हिंदी`,
      description,
      url: `${baseUrl}/poems/hi/${slugs.hi}`,
      images: [
        {
          url: coverImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} द्वारा ${author}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} द्वारा ${author} | हिंदी`,
      description,
      images: [coverImageUrl],
    },
  };
}

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
    name: poem.title?.hi || "शीर्षक रहित कविता",
    author: {
      "@type": "Person",
      name: poem.author?.name || "अज्ञात लेखक",
    },
    description:
      poem.summary?.hi ||
      poem.content?.hi?.[0]?.verse ||
      `${poem.author?.name || "अज्ञात लेखक"} की कविता`,
    inLanguage: "hi",
    url: `${baseUrl}/poems/hi/${slugs.hi}`,
    image: coverImageUrl,
    keywords: poem.tags?.join(", ") || poem.category || "कविता",
    datePublished: poem.createdAt || undefined,
    genre: poem.category || "कविता",
  };
}

function generateBreadcrumbData(
  poem: Poem | null,
  language: string,
  baseUrl: string,
  slugs: Record<string, string>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "होम", item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "कविताएँ",
        item: `${baseUrl}/poems`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "हिंदी",
        item: `${baseUrl}/poems/hi`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: poem?.title?.hi || "कविता",
        item: `${baseUrl}/poems/hi/${slugs.hi}`,
      },
    ],
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
    "hi",
    baseUrl,
    slugs,
    coverImageUrl
  );
  const breadcrumbData = generateBreadcrumbData(poem, "hi", baseUrl, slugs);
  console.log(poem);
  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
      )}
      <PoemDetail poem={poem} language="hi" />
    </>
  );
}

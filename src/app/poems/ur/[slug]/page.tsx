import type { Metadata } from "next";
import PoemDetail from "@/components/poems/poem-detail";
import { Poem } from "@/types/poem";
import { getSlugs } from "@/utils/helpers";

async function fetchPoem(slug: string): Promise<Poem | null> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/poem?slug=${slug}`, {
      cache: "force-cache",
    });
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

  const title = poem?.title?.ur || "شعر نہیں ملا";
  const author = poem?.author?.name || "نامعلوم مصنف";
  const description = poem?.summary?.ur
    ? poem.summary.ur.slice(0, 150)
    : poem?.content?.ur?.[0]?.verse
      ? `${poem.content.ur[0].verse.slice(0, 150)}... - ${author} کا شعر`
      : `${author} کا یہ شعر اردو میں پڑھیں۔`;
  const coverImageUrl =
    poem?.coverImage || (coverImages.length > 0 ? coverImages[0].url : "/default-poem-image.jpg");
  const slugs = getSlugs(poem, resolvedParams.slug);

  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  return {
    title: `${title} از ${author} | اردو شاعری`,
    description,
    keywords: [
      title,
      author,
      "شعر",
      "اردو شاعری",
      poem?.category || "شاعری",
      ...(poem?.tags || []),
    ].join(", "),
    alternates: {
      canonical: `${baseUrl}/poems/ur/${slugs.ur}`,
      languages: {
        en: `/poems/en/${slugs.en}`,
        hi: `/poems/hi/${slugs.hi}`,
        ur: `/poems/ur/${slugs.ur}`,
      },
    },
    openGraph: {
      title: `${title} از ${author} | اردو`,
      description,
      url: `${baseUrl}/poems/ur/${slugs.ur}`,
      images: [
        {
          url: coverImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} از ${author}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} از ${author} | اردو`,
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
    name: poem.title?.ur || "بے عنوان شعر",
    author: {
      "@type": "Person",
      name: poem.author?.name || "نامعلوم مصنف",
    },
    description:
      poem.summary?.ur || poem.content?.ur?.[0]?.verse || `${poem.author?.name || "نامعلوم مصنف"} کا شعر`,
    inLanguage: "ur",
    url: `${baseUrl}/poems/ur/${slugs.ur}`,
    image: coverImageUrl,
    keywords: poem.tags?.join(", ") || poem.category || "شاعری",
    datePublished: poem.createdAt || undefined,
    genre: poem.category || "شاعری",
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
      { "@type": "ListItem", position: 1, name: "ہوم", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "اشعار", item: `${baseUrl}/poems` },
      { "@type": "ListItem", position: 3, name: "اردو", item: `${baseUrl}/poems/ur` },
      {
        "@type": "ListItem",
        position: 4,
        name: poem?.title?.ur || "شعر",
        item: `${baseUrl}/poems/ur/${slugs.ur}`,
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
    poem?.coverImage || (coverImages.length > 0 ? coverImages[0].url : "/default-poem-image.jpg");

  const structuredData = generateStructuredData(poem, "ur", baseUrl, slugs, coverImageUrl);
  const breadcrumbData = generateBreadcrumbData(poem, "ur", baseUrl, slugs);
 
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
      <PoemDetail poem={poem} language="ur" />
    </>
  );
}
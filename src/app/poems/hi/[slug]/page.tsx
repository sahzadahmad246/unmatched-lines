// app/poems/hi/[slug]/page.tsx
import type { Metadata } from "next";
import PoemDetail from "@/components/poems/poem-detail";
import { Poem, StructuredData } from "@/types/poem";
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
    ? poem.summary.hi.slice(0, 160)
    : poem?.content?.hi?.[0]?.verse
      ? `${poem.content.hi[0].verse.slice(0, 120)}... ${author} की कविता पढ़ें।`
      : `हिंदी में "${title}" कविता, ${author} द्वारा, Unmatched Lines पर।`;
  const coverImageUrl = poem?.coverImage && poem.coverImage.trim() !== ""
    ? poem.coverImage
    : coverImages.length > 0
      ? coverImages[0].url
      : "/default-poem-image.jpg";
  const slugs = getSlugs(poem, resolvedParams.slug);
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  return {
    title: `${title} द्वारा ${author} | Unmatched Lines`,
    description,
    keywords: [
      title,
      author,
      "हिंदी कविता",
      "कविता संग्रह",
      poem?.category || "कविता",
      ...(poem?.tags || []),
    ].join(", "),
    robots: {
      index: poem?.status === "published" ? true : false,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/poems/hi/${slugs.hi}`,
      languages: {
        en: poem?.slug.en ? `/poems/en/${slugs.en}` : undefined,
        hi: `/poems/hi/${slugs.hi}`,
        ur: poem?.slug.ur ? `/poems/ur/${slugs.ur}` : undefined,
      },
    },
    openGraph: {
      title: `${title} द्वारा ${author}`,
      description,
      url: `${baseUrl}/poems/hi/${slugs.hi}`,
      type: "article",
      publishedTime: poem?.createdAt,
      modifiedTime: poem?.updatedAt,
      images: [
        {
          url: coverImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} द्वारा ${author} - हिंदी कविता कवर`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} द्वारा ${author}`,
      description,
      images: [
        {
          url: coverImageUrl,
          alt: `${title} द्वारा ${author} - हिंदी कविता कवर`,
        },
      ],
    },
  };
}

function generateStructuredData(
  poem: Poem | null,
  language: string,
  baseUrl: string,
  slugs: Record<string, string>,
  coverImageUrl: string
): StructuredData | null {
  if (!poem) {
    return null;
  }

  const structuredData: StructuredData = {
    "@context": "https://schema.org",
    "@type": "Poem",
    name: poem.title?.hi || "शीर्षक रहित कविता",
    author: {
      "@type": "Person",
      name: poem.author?.name || "अज्ञात लेखक",
    },
    description: poem.summary?.hi || poem.content?.hi?.[0]?.verse || `कविता ${poem.author?.name || "अज्ञात लेखक"} द्वारा`,
    inLanguage: "hi",
    url: `${baseUrl}/poems/hi/${slugs.hi}`,
    image: {
      "@type": "ImageObject",
      url: coverImageUrl,
      name: `${poem.title.hi || "कविता"} कवर इमेज`,
    },
    keywords: poem.tags?.join(", ") || poem.category || "कविता",
    datePublished: poem.createdAt,
    dateModified: poem.updatedAt,
    genre: poem.category || "कविता",
    interactionCount: [
      `UserViews:${poem.viewsCount || 0}`,
      `UserBookmarks:${poem.readListCount || 0}`,
    ],
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "होम",
          item: baseUrl,
        },
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
          name: poem.title.hi || "कविता",
          item: `${baseUrl}/poems/hi/${slugs.hi}`,
        },
      ],
    },
  };

  if (poem.faqs && poem.faqs.length > 0) {
    structuredData.mainEntity = {
      "@type": "FAQPage",
      mainEntity: poem.faqs
        .filter((faq) => faq.question.hi && faq.answer.hi)
        .map((faq) => ({
          "@type": "Question",
          name: faq.question.hi!,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer.hi!,
          },
        })),
    };
  }

  return structuredData;
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
  const coverImageUrl = poem?.coverImage && poem.coverImage.trim() !== ""
    ? poem.coverImage
    : coverImages.length > 0
      ? coverImages[0].url
      : "/default-poem-image.jpg";

  const structuredData = generateStructuredData(
    poem,
    "hi",
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
      <PoemDetail poem={poem} language="hi" />
    </>
  );
}
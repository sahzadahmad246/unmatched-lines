// app/poems/en/[slug]/page.tsx
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

  const title = poem?.title?.en || "Poem Not Found";
  const author = poem?.author?.name || "Unknown Author";
  const description = poem?.summary?.en
    ? poem.summary.en.slice(0, 160)
    : poem?.content?.en?.[0]?.verse
    ? `${poem.content.en[0].verse.slice(
        0,
        120
      )}... Read this poem by ${author}.`
    : `Discover "${title}" by ${author}, an English poem at Unmatched Lines.`;
  const coverImageUrl =
    poem?.coverImage && poem.coverImage.trim() !== ""
      ? poem.coverImage
      : coverImages.length > 0
      ? coverImages[0].url
      : "/default-poem-image.jpg";
  const slugs = getSlugs(poem, resolvedParams.slug);
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  return {
    title: `${title} by ${author} | Unmatched Lines`,
    description,
    keywords: [
      title,
      author,
      "English poetry",
      "poems",
      poem?.category || "poetry",
      ...(poem?.tags || []),
    ].join(", "),
    robots: {
      index: poem?.status === "published" ? true : false,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/poems/en/${slugs.en}`,
      languages: {
        en: `/poems/en/${slugs.en}`,
        hi: poem?.slug.hi ? `/poems/hi/${slugs.hi}` : undefined,
        ur: poem?.slug.ur ? `/poems/ur/${slugs.ur}` : undefined,
      },
    },
    openGraph: {
      title: `${title} by ${author}`,
      description,
      url: `${baseUrl}/poems/en/${slugs.en}`,
      type: "article",
      publishedTime: poem?.createdAt,
      modifiedTime: poem?.updatedAt,
      images: [
        {
          url: coverImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} by ${author} - English Poem Cover`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} by ${author}`,
      description,
      images: [
        {
          url: coverImageUrl,
          alt: `${title} by ${author} - English Poem Cover`,
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
    name: poem.title?.en || "Untitled Poem",
    author: {
      "@type": "Person",
      name: poem.author?.name || "Unknown Author",
    },
    description:
      poem.summary?.en ||
      poem.content?.en?.[0]?.verse ||
      `A poem by ${poem.author?.name || "Unknown Author"}`,
    inLanguage: "en",
    url: `${baseUrl}/poems/${language}/${slugs[language]}`,
    image: {
      "@type": "ImageObject",
      url: coverImageUrl,
      name: `${poem.title.en} Cover Image`,
    },
    keywords: poem.tags?.join(", ") || poem.category || "poetry",
    datePublished: poem.createdAt,
    dateModified: poem.updatedAt,
    genre: poem.category || "Poetry",
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
          name: "Home",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Poems",
          item: `${baseUrl}/poems`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: poem.title.en,
          item: `${baseUrl}/poems/en/${slugs.en}`,
        },
      ],
    },
  };

  if (poem.faqs && poem.faqs.length > 0) {
    structuredData.mainEntity = {
      "@type": "FAQPage",
      mainEntity: poem.faqs
        .filter((faq) => faq.question.en && faq.answer.en)
        .map((faq) => ({
          "@type": "Question",
          name: faq.question.en,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer.en,
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
  const coverImageUrl =
    poem?.coverImage && poem.coverImage.trim() !== ""
      ? poem.coverImage
      : coverImages.length > 0
      ? coverImages[0].url
      : "/default-poem-image.jpg";

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

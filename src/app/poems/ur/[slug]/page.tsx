// app/poems/ur/[slug]/page.tsx
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

  const title = poem?.title?.ur || "شعر نہیں ملا";
  const author = poem?.author?.name || "نامعلوم مصنف";
  const description = poem?.summary?.ur
    ? poem.summary.ur.slice(0, 160)
    : poem?.content?.ur?.[0]?.verse
      ? `${poem.content.ur[0].verse.slice(0, 120)}... ${author} کا شعر پڑھیں۔`
      : `اردو میں "${title}" شعر، ${author} سے، Unmatched Lines پر۔`;
  const coverImageUrl = poem?.coverImage && poem.coverImage.trim() !== ""
    ? poem.coverImage
    : coverImages.length > 0
      ? coverImages[0].url
      : "/default-poem-image.jpg";
  const slugs = getSlugs(poem, resolvedParams.slug);
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  return {
    title: `${title} از ${author} | Unmatched Lines`,
    description,
    keywords: [
      title,
      author,
      "اردو شاعری",
      "شعر مجموعہ",
      poem?.category || "شاعری",
      ...(poem?.tags || []),
    ].join(", "),
    robots: {
      index: poem?.status === "published" ? true : false,
      follow: true,
    },
    alternates: {
      canonical: `${baseUrl}/poems/ur/${slugs.ur}`,
      languages: {
        en: poem?.slug.en ? `/poems/en/${slugs.en}` : undefined,
        hi: poem?.slug.hi ? `/poems/hi/${slugs.hi}` : undefined,
        ur: `/poems/ur/${slugs.ur}`,
      },
    },
    openGraph: {
      title: `${title} از ${author}`,
      description,
      url: `${baseUrl}/poems/ur/${slugs.ur}`,
      type: "article",
      publishedTime: poem?.createdAt,
      modifiedTime: poem?.updatedAt,
      images: [
        {
          url: coverImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} از ${author} - اردو شعر کور`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} از ${author}`,
      description,
      images: [
        {
          url: coverImageUrl,
          alt: `${title} از ${author} - اردو شعر کور`,
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
    name: poem.title?.ur || "بے عنوان شعر",
    author: {
      "@type": "Person",
      name: poem.author?.name || "نامعلوم مصنف",
    },
    description: poem.summary?.ur || poem.content?.ur?.[0]?.verse || `شعر ${poem.author?.name || "نامعلوم مصنف"} سے`,
    inLanguage: "ur",
    url: `${baseUrl}/poems/ur/${slugs.ur}`,
    image: {
      "@type": "ImageObject",
      url: coverImageUrl,
      name: `${poem.title.ur || "شعر"} کور ایمیج`,
    },
    keywords: poem.tags?.join(", ") || poem.category || "شاعری",
    datePublished: poem.createdAt,
    dateModified: poem.updatedAt,
    genre: poem.category || "شاعری",
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
          name: "ہوم",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "اشعار",
          item: `${baseUrl}/poems`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "اردو",
          item: `${baseUrl}/poems/ur`,
        },
        {
          "@type": "ListItem",
          position: 4,
          name: poem.title.ur || "شعر",
          item: `${baseUrl}/poems/ur/${slugs.ur}`,
        },
      ],
    },
  };

  if (poem.faqs && poem.faqs.length > 0) {
    structuredData.mainEntity = {
      "@type": "FAQPage",
      mainEntity: poem.faqs
        .filter((faq) => faq.question.ur && faq.answer.ur)
        .map((faq) => ({
          "@type": "Question",
          name: faq.question.ur!,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer.ur!,
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
    "ur",
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
      <PoemDetail poem={poem} language="ur" />
    </>
  );
}
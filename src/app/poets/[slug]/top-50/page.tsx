import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Top50 } from "@/components/poems/top50";
import { Poem, Author } from "@/types/poem";

interface Top50PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Top50PageProps): Promise<Metadata> {
  const { slug } = await params;
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  let authorName = "Unknown Author";
  try {
    const res = await fetch(`${baseUrl}/api/authors/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to fetch author: ${res.status}`);
    const data = await res.json();
    authorName = data.author?.name || "Unknown Author";
  } catch (error) {
    console.error("Error generating metadata:", error);
  }

  return {
    title: `Top 50 Poems by ${authorName} | Unmatched Lines`,
    description: `Discover the top 50 poems by ${authorName} in English, Hindi, and Urdu, showcasing their most popular works.`,
    keywords: [
      authorName,
      "top 50 poems",
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
      title: `Top 50 Poems by ${authorName} | Unmatched Lines`,
      description: `Discover the top 50 poems by ${authorName} in our multilingual poetry library.`,
      url: `${baseUrl}/poets/${slug}/top-50`,
      siteName: "Unmatched Lines",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/public/images/image1.jpg",
          width: 800,
          height: 400,
          alt: `Top 50 Poems by ${authorName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Top 50 Poems by ${authorName} | Unmatched Lines`,
      description: `Discover the top 50 poems by ${authorName} in our multilingual poetry library.`,
      images: ["/public/images/image1.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
    metadataBase: new URL(baseUrl),
  };
}

async function generateStructuredData(slug: string, poems: Poem[]) {
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";
  const authorRes = await fetch(`${baseUrl}/api/authors/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (!authorRes.ok) throw new Error(`Failed to fetch author: ${authorRes.status}`);
  const authorData = await authorRes.json();
  const authorName = authorData.author?.name || "Unknown Author";

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Top 50 Poems by ${authorName}`,
    description: `Explore the top 50 poems by ${authorName} in English, Hindi, and Urdu.`,
    url: `${baseUrl}/poets/${slug}/top-50`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: poems.slice(0, 5).map((poem, index) => ({
        "@type": "CreativeWork",
        position: index + 1,
        name: poem.title?.en || "Untitled Poem",
        author: poem.author?.name || authorName,
        description: `A popular poem by ${authorName} in English.`,
        url: `${baseUrl}/poems/en/${poem.slug?.en || poem._id}`,
      })),
    },
  };
}

export default async function Top50Page({ params }: Top50PageProps) {
  const { slug } = await params;
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";
  const res = await fetch(`${baseUrl}/api/poem?authorSlug=${encodeURIComponent(slug)}&top=50`, {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error(`Failed to fetch top 50 poems: ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data.poems)) {
    throw new Error("Invalid API response format");
  }

  const structuredData = await generateStructuredData(slug, data.poems);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <Top50 slug={slug} />
    </>
  );
}
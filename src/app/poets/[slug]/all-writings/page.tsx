import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AllWritings } from "@/components/poems/allwritings";
import { Poem, Author } from "@/types/poem";

interface AllWritingsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AllWritingsPageProps): Promise<Metadata> {
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
    title: `All Writings by ${authorName} | Unmatched Lines`,
    description: `Explore all poems by ${authorName} in English, Hindi, and Urdu, featuring a comprehensive collection of their works.`,
    keywords: [
      authorName,
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
      title: `All Writings by ${authorName} | Unmatched Lines`,
      description: `Explore all poems by ${authorName} in our multilingual poetry library.`,
      url: `${baseUrl}/poets/${slug}/all-writings`,
      siteName: "Unmatched Lines",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/public/images/image1.jpg",
          width: 800,
          height: 400,
          alt: `All Writings by ${authorName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `All Writings by ${authorName} | Unmatched Lines`,
      description: `Explore all poems by ${authorName} in our multilingual poetry library.`,
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
    name: `All Writings by ${authorName}`,
    description: `Explore a comprehensive collection of poems by ${authorName} in English, Hindi, and Urdu.`,
    url: `${baseUrl}/poets/${slug}/all-writings`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: poems.slice(0, 5).map((poem, index) => ({
        "@type": "CreativeWork",
        position: index + 1,
        name: poem.title?.en || "Untitled Poem",
        author: poem.author?.name || authorName,
        description: `A poem by ${authorName} in English.`,
        url: `${baseUrl}/poems/en/${poem.slug?.en || poem._id}`,
      })),
    },
  };
}

export default async function AllWritingsPage({ params }: AllWritingsPageProps) {
  const { slug } = await params;
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";
  const res = await fetch(`${baseUrl}/api/poem?authorSlug=${encodeURIComponent(slug)}&page=1&limit=50`, {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error(`Failed to fetch poems: ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data.poems)) {
    throw new Error("Invalid API response format");
  }

  const structuredData = await generateStructuredData(slug, data.poems);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <AllWritings slug={slug} />
    </>
  );
}
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

  const title = poem?.title?.hi || "कविता नहीं मिली";
  const author = poem?.author?.name || "अज्ञात लेखक";
  const description = poem?.content?.hi
    ? `${poem.content.hi[0]?.slice(0, 150)}... - ${author} की कविता`
    : `${author} की यह कविता हिंदी में पढ़ें।`;
  const coverImageUrl = coverImages.length > 0 ? coverImages[0].url : "/default-poem-image.jpg";
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
      canonical: `${baseUrl}/poems/hi/${slugs.hi}`, // Fixed: Moved to alternates
      languages: {
        "en": `/poems/en/${slugs.en}`,
        "hi": `/poems/hi/${slugs.hi}`,
        "ur": `/poems/ur/${slugs.ur}`,
      },
    },
    openGraph: {
      title: `${title} द्वारा ${author} | हिंदी`,
      description,
      url: `${baseUrl}/poems/hi/${slugs.hi}`,
      images: [{ url: coverImageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} द्वारा ${author} | हिंदी`,
      description,
      images: [coverImageUrl],
    },
  };
}

export default async function PoemPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const poem = await fetchPoem(resolvedParams.slug);
  return <PoemDetail poem={poem} language="hi" />;
}
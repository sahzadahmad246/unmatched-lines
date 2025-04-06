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
  const description = poem?.content?.ur
    ? `${poem.content.ur[0]?.slice(0, 150)}... - ${author} کا شعر`
    : `${author} کا یہ شعر اردو میں پڑھیں۔`;
  const coverImageUrl = coverImages.length > 0 ? coverImages[0].url : "/default-poem-image.jpg";
  const slugs = getSlugs(poem, resolvedParams.slug);

  const baseUrl = process.env.NEXTAUTH_URL || "https://unmatched-lines.vercel.app";

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
      canonical: `${baseUrl}/poems/ur/${slugs.ur}`, // Fixed: Moved to alternates
      languages: {
        "en": `/poems/en/${slugs.en}`,
        "hi": `/poems/hi/${slugs.hi}`,
        "ur": `/poems/ur/${slugs.ur}`,
      },
    },
    openGraph: {
      title: `${title} از ${author} | اردو`,
      description,
      url: `${baseUrl}/poems/ur/${slugs.ur}`,
      images: [{ url: coverImageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} از ${author} | اردو`,
      description,
      images: [coverImageUrl],
    },
  };
}

export default async function PoemPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const poem = await fetchPoem(resolvedParams.slug);
  return <PoemDetail poem={poem} language="ur" />;
}
// src/app/authors/[slug]/top-content/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { PoemListItem } from "@/components/poems/poem-list-item";
import { Poet, Poem } from "@/types/poem";
import { ArrowLeft } from "lucide-react";

interface AllTopContentProps {
  params: Promise<{ slug: string }>;
}

async function fetchTopContent(slug: string): Promise<{ topContent: Poet["topContent"] } | null> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/authors/${encodeURIComponent(slug)}/top-content`, {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Failed to fetch top content");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function fetchPoet(slug: string): Promise<Poet | null> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/authors/${encodeURIComponent(slug)}`, {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Failed to fetch poet");
    const data = await res.json();
    return data.poet || data.author || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function generateMetadata({ params }: AllTopContentProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const poet = await fetchPoet(slug);
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  const poetName = poet?.name || slug
    .split("-")
    .slice(0, -1)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const title = `${poetName}'s Top Content | Unmatched Lines`;
  const description = `Explore ${poetName}'s top poems, ghazals, shers, and more on Unmatched Lines.`;

  return {
    title,
    description,
    keywords: [
      poetName,
      "poetry",
      "top poems",
      "ghazal",
      "sher",
      "Unmatched Lines",
    ],
    alternates: {
      canonical: `${baseUrl}/authors/${encodeURIComponent(slug)}/top-content`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/authors/${encodeURIComponent(slug)}/top-content`,
      siteName: "Unmatched Lines",
      images: [
        {
          url: poet?.image || "/default-poet-image.jpg",
          width: 800,
          height: 400,
          alt: `${poetName}'s Top Content`,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: poet?.image || "/default-poet-image.jpg",
          alt: `${poetName}'s Top Content`,
        },
      ],
      site: "@UnmatchedLines",
    },
    robots: {
      index: true,
      follow: true,
    },
    metadataBase: new URL(baseUrl),
  };
}

export default async function AllTopContent({ params }: AllTopContentProps) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const topContentData = await fetchTopContent(slug);
  const poet = await fetchPoet(slug);

  if (!topContentData || !poet) {
    notFound();
  }

  const { topContent } = topContentData;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Link href={`/authors/${slug}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {poet.name}'s Profile
        </Button>
      </Link>
      <h1 className="text-2xl font-bold mb-6">All Top Content by {poet.name}</h1>
      <Card>
        <CardContent className="p-6">
          {Object.entries(topContent).map(([category, items]: [string, any[]]) => (
            <div key={category} className="mb-8">
              <h2 className="text-xl font-semibold capitalize mb-4">{category}</h2>
              {items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item, index) => (
                    <PoemListItem
                      key={item.contentId._id}
                      poem={item.contentId}
                      coverImage={`/placeholder.svg?height=200&width=300`}
                      englishSlug={item.contentId.slug?.en || item.contentId._id}
                      isInReadlist={false}
                      poemTitle={item.contentId.title?.en || "Untitled"}
                      handleReadlistToggle={() => {}}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No top {category}s available.</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export const revalidate = 86400;
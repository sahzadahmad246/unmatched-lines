import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { PoemListItem } from "@/components/poems/poem-list-item";
import { Poet, Poem } from "@/types/poem";
import { ArrowLeft, BookOpen } from "lucide-react";

interface TopContentProps {
  params: Promise<{ slug: string; category: string }>;
}

async function fetchTopContent(slug: string, category: string): Promise<{ topContent: Poem[] }> {
  // Return mock data during build
  if (process.env.IS_BUILD) {
    return {
      topContent: [
        {
          _id: `mock-${slug}-${category}`,
          title: { en: `Mocked ${category.charAt(0).toUpperCase() + category.slice(1)}` },
          author: {
            name: slug
              .split("-")
              .slice(0, -1)
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
            _id: `mock-author-${slug}`,
          },
          category,
          viewsCount: 0,
          readListCount: 0,
          slug: { en: `mock-${category}-${slug}` },
        },
      ],
    };
  }

  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL}/api/authors/${encodeURIComponent(slug)}/top-content?category=${encodeURIComponent(category)}`,
      { cache: "force-cache" }
    );
    if (!res.ok) throw new Error("Failed to fetch top content");
    const data = await res.json();
    // Ensure topContent is an array, default to empty array if undefined or invalid
    return { topContent: Array.isArray(data?.topContent) ? data.topContent : [] };
  } catch (error) {
    if (!process.env.IS_BUILD) {
      console.error(`Error fetching top content for slug ${slug}, category ${category}:`, error);
    }
    return { topContent: [] }; // Return empty array for non-build environments
  }
}

async function fetchPoet(slug: string): Promise<Poet> {
  // Return mock data during build
  if (process.env.IS_BUILD) {
    return {
      _id: `mock-${slug}`,
      name: slug
        .split("-")
        .slice(0, -1)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      bio: "Mocked poet bio for build.",
      image: "/default-poet-image.jpg",
      dob: undefined,
      city: undefined,
      ghazalCount: 0,
      sherCount: 0,
      otherCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slug,
      followerCount: 0,
      followers: [],
      topContent: {
        poem: [],
        ghazal: [],
        sher: [],
        nazm: [],
        rubai: [],
        marsiya: [],
        qataa: [],
        other: [],
      },
    };
  }

  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/authors/${encodeURIComponent(slug)}`, {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Failed to fetch poet");
    const data = await res.json();
    return data.poet || data.author;
  } catch (error) {
    if (!process.env.IS_BUILD) {
      console.error(`Error fetching poet for slug ${slug}:`, error);
    }
    // Fallback mock data for non-build environments
    return {
      _id: `mock-${slug}`,
      name: slug
        .split("-")
        .slice(0, -1)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      bio: "Mocked poet bio for build.",
      image: "/default-poet-image.jpg",
      dob: undefined,
      city: undefined,
      ghazalCount: 0,
      sherCount: 0,
      otherCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slug,
      followerCount: 0,
      followers: [],
      topContent: {
        poem: [],
        ghazal: [],
        sher: [],
        nazm: [],
        rubai: [],
        marsiya: [],
        qataa: [],
        other: [],
      },
    };
  }
}

async function fetchPoetSlugs(): Promise<string[]> {
  // Return mock data during build
  if (process.env.IS_BUILD) {
    return [
      "mirza-ghalib-eb936b",
      "faiz-ahmed-faiz-456",
      "ahmed-faraz-97bc98",
      "akbar-allahabadi-0b37f8",
      "allama-iqbal",
      "jigar-moradabadi",
      "harivansh-rai-bachchan-3da441",
      "majrooh-sultanpuri-0b37e1",
      "mir-taqi-mir-97bc95",
      "ravindra-nath-tagore-3da454",
      "sahir-ludhianvi-97bc9b",
    ];
  }

  try {
    console.log('Fetching poet slugs from:', `${process.env.NEXTAUTH_URL}/api/authors`);
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/authors`, {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Failed to fetch poets");
    const data = await res.json();
    return data.authors?.map((poet: { slug: string }) => poet.slug) || [];
  } catch (error) {
    if (!process.env.IS_BUILD) {
      console.error("Error fetching poet slugs:", error);
    }
    return ["mirza-ghalib-eb936b", "faiz-ahmed-faiz-456"];
  }
}

export async function generateStaticParams() {
  const slugs = await fetchPoetSlugs();
  const categories = ["poem", "ghazal", "sher", "nazm", "rubai", "marsiya", "qataa", "other"];
  return slugs.flatMap((slug) =>
    categories.map((category) => ({
      slug,
      category,
    }))
  );
}

export async function generateMetadata({ params }: TopContentProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug, category } = resolvedParams;
  const poet = await fetchPoet(slug);
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  const poetName = poet.name || slug
    .split("-")
    .slice(0, -1)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  const title = `${poetName}'s Top ${category.charAt(0).toUpperCase() + category.slice(1)} | Unmatched Lines`;
  const description = `Explore the top 20 ${category}s by ${poetName} on Unmatched Lines.`;

  return {
    title,
    description,
    keywords: [
      poetName,
      category,
      "poetry",
      "top poems",
      "Unmatched Lines",
    ],
    alternates: {
      canonical: `${baseUrl}/poets/${encodeURIComponent(slug)}/top-20/${encodeURIComponent(category)}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/poets/${encodeURIComponent(slug)}/top-20/${encodeURIComponent(category)}`,
      siteName: "Unmatched Lines",
      images: [
        {
          url: poet.image || "/default-poet-image.jpg",
          width: 800,
          height: 400,
          alt: `${poetName}'s Top ${category}`,
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
          url: poet.image || "/default-poet-image.jpg",
          alt: `${poetName}'s Top ${category}`,
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

export default async function TopContent({ params }: TopContentProps) {
  const resolvedParams = await params;
  const { slug, category } = resolvedParams;
  const topContentData = await fetchTopContent(slug, category);
  const poet = await fetchPoet(slug);

  if (!topContentData || !poet) {
    notFound();
  }

  const { topContent } = topContentData;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Link href={`/poets/${slug}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {poet.name}'s Profile
        </Button>
      </Link>
      <h1 className="text-2xl font-bold mb-6">
        Top {category.charAt(0).toUpperCase() + category.slice(1)} by {poet.name}
      </h1>
      <Card>
        <CardContent className="p-6">
          {topContent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topContent.map((item, index) => (
                // Safely render PoemListItem only if item is valid
                item ? (
                  <PoemListItem
                    key={item._id || `mock-${index}`}
                    poem={item}
                    coverImage={item.coverImage || `/placeholder.svg?height=200&width=300`}
                    englishSlug={item.slug?.en || item._id || `mock-${index}`}
                    isInReadlist={false}
                    poemTitle={item.title?.en || "Untitled"}
                    // Omit handleReadlistToggle, as it’s optional
                  />
                ) : null
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No top {category}s available</h3>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="mt-6 text-center">
        <Link href={`/poets/${slug}/top-content`}>
          <Button variant="outline">View All Top Content</Button>
        </Link>
      </div>
    </div>
  );
}

export const revalidate = 86400;
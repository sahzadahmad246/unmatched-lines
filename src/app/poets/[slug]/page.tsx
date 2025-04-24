import { notFound } from "next/navigation";
import { PoetProfileComponent } from "@/components/home/PoetProfileComponent";
import type { Metadata } from "next";
import { Poet, Poem } from "@/types/poem";

interface PoetProfileProps {
  params: Promise<{ slug: string }>;
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
    console.error(`Error fetching poet for slug ${slug}:`, error);
    // Mock data for build if API is unavailable
    if (process.env.NODE_ENV === "production" || process.env.IS_BUILD) {
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
    return null;
  }
}

async function fetchPoetSlugs(): Promise<string[]> {
  try {
    console.log('Fetching poet slugs from:', `${process.env.NEXTAUTH_URL}/api/authors`);
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/authors`, {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Failed to fetch poets");
    const data = await res.json();
    return data.authors?.map((poet: Poet) => poet.slug) || [];
  } catch (error) {
    console.error("Error fetching poet slugs:", error);
    return ["mirza-ghalib-eb936b", "faiz-ahmed-faiz-456"];
  }
}

export async function generateStaticParams() {
  const slugs = await fetchPoetSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PoetProfileProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const poet = await fetchPoet(slug);
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  const poetName = poet?.name || slug
    .split("-")
    .slice(0, -1)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const title = `${poetName} | Unmatched Lines`;
  const description = poet?.bio
    ? `${poet.bio.substring(0, 100)}... Explore ${poetName}'s top poems, ${poet.ghazalCount || 0} ghazals, ${poet.sherCount || 0} shers, and ${poet.followerCount} followers.`
    : `Discover ${poetName}'s poetry, including top ghazals and shers, with ${poet?.followerCount || 0} followers at Unmatched Lines.`;
  const imageUrl = poet?.image || "/default-poet-image.jpg";

  return {
    title,
    description,
    keywords: [
      poetName,
      "poet",
      "poetry",
      "ghazal",
      "sher",
      "nazm",
      "top poems",
      "Unmatched Lines",
    ],
    alternates: {
      canonical: `${baseUrl}/poets/${encodeURIComponent(slug)}`,
      languages: {
        "en-US": `${baseUrl}/poets/${encodeURIComponent(slug)}`,
        "hi-IN": `${baseUrl}/poets/${encodeURIComponent(slug)}`,
        "ur-PK": `${baseUrl}/poets/${encodeURIComponent(slug)}`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/poets/${encodeURIComponent(slug)}`,
      siteName: "Unmatched Lines",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 400,
          alt: `${poetName}, Poet`,
        },
      ],
      locale: "en_US",
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        {
          url: imageUrl,
          alt: `${poetName}, Poet`,
        },
      ],
      site: "@UnmatchedLines",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    metadataBase: new URL(baseUrl),
  };
}

export default async function PoetProfile({ params }: PoetProfileProps) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);
  const poet = await fetchPoet(slug);

  if (!poet) {
    notFound();
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: poet.name,
    url: `${baseUrl}/poets/${encodeURIComponent(slug)}`,
    image: poet.image || null,
    birthDate: poet.dob || null,
    address: poet.city ? { "@type": "PostalAddress", addressLocality: poet.city } : null,
    description: poet.bio
      ? `${poet.bio.substring(0, 100)}... Top poems include ${
          poet.topContent?.poem?.[0]?.contentId?.title?.en || "various works"
        }. Followed by ${poet.followerCount} users.`
      : `${poet.name}, a poet with ${poet.followerCount} followers on Unmatched Lines.`,
    inLanguage: "en",
    sameAs: [],
    worksFor: {
      "@type": "Organization",
      name: "Unmatched Lines",
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${baseUrl}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Poets",
          item: `${baseUrl}/poets`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: poet.name,
          item: `${baseUrl}/poets/${encodeURIComponent(slug)}`,
        },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <PoetProfileComponent slug={slug} poet={poet} />
    </>
  );
}

export const revalidate = 86400;
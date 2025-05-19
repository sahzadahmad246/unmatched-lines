// src/app/poets/page.tsx
import type { Metadata } from "next";
import { PoetList } from "@/components/poets/PoetList";
import { Author } from "@/types/author";

interface ApiResponse {
  authors: Author[];
  page: number;
  total: number;
  pages: number;
}

async function fetchPoets(): Promise<ApiResponse | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";
    const res = await fetch(`${baseUrl}/api/authors?page=1&limit=20`, {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Failed to fetch poets");
    const data = await res.json();
    return {
      authors: data.authors || [],
      page: data.page || 1,
      total: data.total || 0,
      pages: data.pages || 1,
    };
  } catch (error) {
    console.error("Error fetching poets:", error);
    return null;
  }
}

async function fetchCoverImages(): Promise<{ url: string }[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";
    const res = await fetch(`${baseUrl}/api/cover-images`, {
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

export async function generateMetadata(): Promise<Metadata> {
  const coverImages = await fetchCoverImages();
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  const title = "Poets";
  const description =
    "Explore renowned poets and their works in English, Hindi, and Urdu at Unmatched Lines. Discover ghazals, shers, and more.";
  const coverImageUrl =
    coverImages.length > 0 ? coverImages[0].url : "/default-poem-image.jpg";

  return {
    title,
    description,
    keywords: [
      "poets",
      "poetry",
      "ghazal poets",
      "sher poets",
      "English poets",
      "Hindi poets",
      "Urdu poets",
      "Unmatched Lines",
    ],
    alternates: {
      canonical: `${baseUrl}/poets`,
      languages: {
        "en-US": `${baseUrl}/poets`,
        "hi-IN": `${baseUrl}/poets`,
        "ur-PK": `${baseUrl}/poets`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/poets`,
      siteName: "Unmatched Lines",
      images: [
        {
          url: coverImageUrl,
          width: 1200,
          height: 630,
          alt: "Poets Collection",
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
          url: coverImageUrl,
          alt: "Poets Collection",
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
  };
}

export default async function PoetsPage() {
  const data = await fetchPoets();

  if (!data || data.authors.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-black dark:text-white">No Poets Found</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Please check back later for our collection of poets.
        </p>
      </div>
    );
  }

  const { authors, page, total, pages } = data;
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Poets",
    description:
      "A collection of renowned poets featured on Unmatched Lines, showcasing ghazals, shers, and more in English, Hindi, and Urdu.",
    url: `${baseUrl}/poets`,
    publisher: {
      "@type": "Organization",
      name: "Unmatched Lines",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
    mainEntity: authors.map((poet) => ({
      "@type": "Person",
      name: poet.name,
      url: `${baseUrl}/poets/${encodeURIComponent(poet.slug)}`,
      image: poet.image || null,
      birthDate: poet.dob || null,
      address: poet.city
        ? { "@type": "PostalAddress", addressLocality: poet.city }
        : null,
      description: `Poet with ${poet.ghazalCount} ghazals and ${poet.sherCount} shers on Unmatched Lines.`,
    })),
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
      <PoetList
        initialPoets={authors}
        initialMeta={{ page, total, pages, hasMore: page < pages }}
      />
    </>
  );
}

export const revalidate = 86400; // Revalidate every 24 hours
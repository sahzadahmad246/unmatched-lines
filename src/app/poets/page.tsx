import type { Metadata } from "next";
import PoetList from "@/components/poets/PoetList";
import { Poet } from "@/components/poets/PoetList";

async function fetchPoets(): Promise<Poet[] | null> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/authors`, {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Failed to fetch poets");
    const data = await res.json();
    return data.authors || null;
  } catch (error) {
    
    return null;
  }
}

async function fetchCoverImages(): Promise<{ url: string }[]> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/cover-images`, {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Failed to fetch cover images");
    const data = await res.json();
    return data.coverImages || [];
  } catch (error) {
   
    return [];
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const coverImages = await fetchCoverImages();
  const baseUrl =
    process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

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
  const poets = await fetchPoets();

  if (!poets || poets.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">No Poets Found</h1>
        <p className="text-muted-foreground">
          Please check back later for our collection of poets.
        </p>
      </div>
    );
  }

  const baseUrl =
    process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

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
    mainEntity: poets.map((poet) => ({
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
      <PoetList poets={poets} />
    </>
  );
}

export const revalidate = 86400; // Revalidate every 24 hours

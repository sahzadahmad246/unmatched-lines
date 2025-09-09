// src/app/poet/[slug]/[category]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Head from "next/head";
import PoetProfileLayout from "@/components/poets/poet-profile-layout";
import PoetWorksContent from "@/components/poets/poet-works-content";
// Generate structured data for category pages
function generateCategoryStructuredData(poet: { name: string; slug: string; bio?: string; profilePicture?: { url?: string } }, category: string, worksData: { pagination?: { total?: number } }) {
  const categoryLabel = categoryLabels[category];
  const categoryDescription = categoryDescriptions[category];
  
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${poet.name} - ${categoryLabel}`,
    "description": `Collection of ${poet.name}'s ${categoryLabel.toLowerCase()} - ${categoryDescription}`,
    "url": `${baseUrl}/poet/${poet.slug}/${category}`,
    "mainEntity": {
      "@type": "Person",
      "name": poet.name,
      "url": `${baseUrl}/poet/${poet.slug}`,
      "image": poet.profilePicture?.url,
      "description": poet.bio || `Poet ${poet.name}`,
      "jobTitle": "Poet",
      "worksFor": {
        "@type": "Organization",
        "name": "Unmatched Lines"
      }
    },
    "about": {
      "@type": "Thing",
      "name": categoryLabel,
      "description": categoryDescription
    },
    "isPartOf": {
      "@type": "WebSite",
      "name": "Unmatched Lines",
      "url": baseUrl
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": baseUrl
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Poets",
          "item": `${baseUrl}/poets`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": poet.name,
          "item": `${baseUrl}/poet/${poet.slug}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": categoryLabel,
          "item": `${baseUrl}/poet/${poet.slug}/${category}`
        }
      ]
    },
    "numberOfItems": worksData?.pagination?.total || 0,
    "publisher": {
      "@type": "Organization",
      "name": "Unmatched Lines",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    }
  };
}
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import type { TransformedArticle } from "@/types/articleTypes";

// Define baseUrl using environment variables
const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://unmatchedlines.com"
    : "http://localhost:3000");

interface PageProps {
  params: Promise<{ slug: string; category: string }>;
  searchParams: Promise<{ page?: string; sortBy?: string }>;
}

const validCategories = [
  "all-works",
  "ghazal",
  "sher",
  "nazm",
  "rubai",
  "marsiya",
  "qataa",
  "other",
  "top-20",
  "top-20-ghazal",
  "top-20-sher",
  "top-20-nazm",
];

const categoryLabels: Record<string, string> = {
  "all-works": "All Works",
  ghazal: "Ghazals",
  sher: "Shers",
  nazm: "Nazms",
  rubai: "Rubais",
  marsiya: "Marsiyas",
  qataa: "Qataas",
  other: "Other Poems",
  "top-20": "Top 20 Poems",
  "top-20-ghazal": "Top 20 Ghazals",
  "top-20-sher": "Top 20 Shers",
  "top-20-nazm": "Top 20 Nazms",
};

const categoryDescriptions: Record<string, string> = {
  "all-works": "Complete collection of poetry",
  ghazal: "Beautiful ghazals in multiple languages",
  sher: "Thoughtful shers and couplets",
  nazm: "Narrative poems and verses",
  rubai: "Four-line poems with deep meaning",
  marsiya: "Elegiac poems and laments",
  qataa: "Short poems and fragments",
  other: "Various other poetic forms",
  "top-20": "Most popular and beloved poems",
  "top-20-ghazal": "Most popular ghazals",
  "top-20-sher": "Most popular shers",
  "top-20-nazm": "Most popular nazms",
};

async function getPoet(slug: string) {
  try {
    const response = await fetch(`${baseUrl}/api/poets/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function getPoetWorks(
  slug: string,
  category: string,
  page: number = 1,
  sortBy: string = "recent"
) {
  try {
    const apiCategory = category === "all-works" ? "all" : category;
    const url = `${baseUrl}/api/poet/${slug}/works?category=${apiCategory}&page=${page}&sortBy=${sortBy}&limit=20`;
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data as {
      articles: TransformedArticle[];
      pagination: { page: number; limit: number; total: number; pages: number; hasNext: boolean; hasPrev: boolean };
      category: string;
      sortBy: string;
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug, category } = await params;
  let page: string;
  try {
    const resolvedSearchParams = await searchParams;
    page = resolvedSearchParams.page ?? "1";
  } catch {
    page = "1";
  }

  if (!validCategories.includes(category)) {
    return {
      title: "Category Not Found | Unmatched Lines",
      description: "The requested category could not be found.",
      robots: "noindex",
    };
  }

  const poet = await getPoet(slug);
  if (!poet) {
    return {
      title: "Poet Not Found | Unmatched Lines",
      description: "The requested poet profile could not be found.",
      robots: "noindex",
    };
  }

  const categoryLabel = categoryLabels[category];
  const categoryDescription = categoryDescriptions[category];
  const pageNum = parseInt(page, 10);
  const title = `${poet.name} - ${categoryLabel}${
    pageNum > 1 ? ` - Page ${pageNum}` : ""
  } | Unmatched Lines`;
  
  let description = "";
  if (category === "all-works") {
    description = `Explore the complete collection of ${poet.name}'s poetry including ghazals, shers, nazms, and more. Read beautiful verses in English, Hindi, and Urdu with meanings and translations.`;
  } else if (category.startsWith("top-20")) {
    const type = category === "top-20" ? "poems" : category.split("-")[2] + "s";
    description = `Discover ${poet.name}'s most popular ${type} - the top-rated and most beloved poetry. Read these acclaimed verses in English, Hindi, and Urdu with detailed meanings.`;
  } else {
    description = `Read ${poet.name}'s ${categoryLabel.toLowerCase()} - ${categoryDescription}. Explore beautiful ${category} poetry in English, Hindi, and Urdu with meanings, translations, and cultural context.`;
  }

  // Enhanced keywords for better SEO
  const keywords = [
    `${poet.name} ${categoryLabel.toLowerCase()}`,
    `${poet.name} poetry`,
    `${poet.name} ${category}`,
    categoryLabel.toLowerCase(),
    "poetry collection",
    `${categoryLabel.toLowerCase()} poems`,
    "urdu poetry",
    "hindi poetry", 
    "english poetry",
    "poetry with meaning",
    "poetry translation",
    "classic poetry",
    "poetry reading",
    `best ${categoryLabel.toLowerCase()}`,
    `${category} collection`,
    "poetry lovers",
    "literature",
    "poetry analysis",
  ].join(", ");

  return {
    title,
    description,
    keywords,
    authors: [{ name: poet.name }],
    robots: "index, follow",
    openGraph: {
      title,
      description,
      type: "website",
      url: `${baseUrl}/poet/${slug}/${category}${
        pageNum > 1 ? `?page=${pageNum}` : ""
      }`,
      images: poet.profilePicture?.url
        ? [
            {
              url: poet.profilePicture.url,
              width: 400,
              height: 400,
              alt: `${poet.name}'s ${categoryLabel} collection - ${categoryDescription}`,
              type: "image/webp",
            },
          ]
        : [],
      siteName: "Unmatched Lines",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: poet.profilePicture?.url ? [poet.profilePicture.url] : [],
      creator: "@UnmatchedLines",
      site: "@UnmatchedLines",
    },
    alternates: {
      canonical: `${baseUrl}/poet/${slug}/${category}${
        pageNum > 1 ? `?page=${pageNum}` : ""
      }`,
      languages: {
        "en-US": `${baseUrl}/poet/${slug}/${category}${
          pageNum > 1 ? `?page=${pageNum}` : ""
        }`,
        "hi-IN": `${baseUrl}/hi/poet/${slug}/${category}${
          pageNum > 1 ? `?page=${pageNum}` : ""
        }`,
        "ur-PK": `${baseUrl}/ur/poet/${slug}/${category}${
          pageNum > 1 ? `?page=${pageNum}` : ""
        }`,
      },
    },
  };
}

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    await dbConnect();
    const poets = await User.find({ role: { $in: ["poet", "admin"] } }).select("slug").lean();
    const slugs = poets.map((poet) => poet.slug);
    
    // Generate params for all poets and categories
    const params = slugs.flatMap((slug) =>
      validCategories.map((category) => ({
        slug,
        category,
      }))
    );
    
    // Also add some default params for fallback
    const defaultParams = validCategories.map((category) => ({
      slug: "default",
      category,
    }));
    
    return [...params, ...defaultParams];
  } catch (error) {
    console.error("Error generating static params:", error);
    return validCategories.map((category) => ({
      slug: "default",
      category,
    }));
  }
}

export default async function PoetCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug, category } = await params;
  let page: string, sortBy: string;
  try {
    const resolvedSearchParams = await searchParams;
    page = resolvedSearchParams.page ?? "1";
    sortBy = resolvedSearchParams.sortBy ?? "recent";
  } catch {
    page = "1";
    sortBy = "recent";
  }

  if (!validCategories.includes(category)) {
    notFound();
  }

  const poet = await getPoet(slug);
  if (!poet) {
    notFound();
  }

  const pageNum = parseInt(page, 10);
  const worksData = await getPoetWorks(slug, category, pageNum, sortBy);

  if (!worksData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Unable to load works for this category. Please try again later.
        </p>
      </div>
    );
  }

  const structuredData = generateCategoryStructuredData(poet, category, worksData);

  return (
    <>
      <Head>
        {pageNum > 1 && (
          <link
            rel="prev"
            href={`${baseUrl}/poet/${slug}/${category}?page=${pageNum - 1}`}
          />
        )}
        {worksData.pagination.total > pageNum * 20 && (
          <link
            rel="next"
            href={`${baseUrl}/poet/${slug}/${category}?page=${pageNum + 1}`}
          />
        )}
      </Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData, null, 0),
        }}
      />
      <PoetProfileLayout poet={poet} currentTab={category}>
        <PoetWorksContent
          poet={poet}
          worksData={worksData}
          category={category}
          currentPage={pageNum}
          sortBy={sortBy}
        />
      </PoetProfileLayout>
    </>
  );
}
// app/search/page.tsx
import type { Metadata } from "next";
import SearchResultsComponent from "@/components/search/SearchResultsComponent";

// Server-side metadata generation
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}): Promise<Metadata> {
  const resolvedSearchParams = await searchParams; // Await the Promise
  const query = resolvedSearchParams.q || "poetry";
  const type = resolvedSearchParams.type || "all";

  const title = `Search "${query}"`;
  const description = `Explore poems and poets matching "${query}" on Unmatched Lines. Discover timeless poetry from renowned poets across languages.`;

  return {
    title,
    description,
    keywords: [
      "poetry search",
      "poems",
      "poets",
      "unmatched lines",
      query.toLowerCase(),
    ],
    robots: "index, follow",
    openGraph: {
      title: `Search "${query}" | Unmatched Lines Poetry Hub`,
      description,
      url: `https://unmatchedlines.com/search?q=${encodeURIComponent(
        query
      )}&type=${type}`,
      type: "website",
      siteName: "Unmatched Lines",
    },
    twitter: {
      card: "summary_large_image",
      title: `Search "${query}" | Unmatched Lines Poetry Hub`,
      description,
    },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const resolvedSearchParams = await searchParams; // Await the Promise

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `Search Results | Unmatched Lines`,
    description: `Explore poems and poets on Unmatched Lines.`,
    url: `https://unmatchedlines.com/search`,
    isPartOf: {
      "@type": "WebSite",
      name: "Unmatched Lines",
      url: "https://unmatchedlines.com",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://unmatchedlines.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <SearchResultsComponent />
    </>
  );
}

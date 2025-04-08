// src/app/search/[query]/page.tsx
import type { Metadata } from "next";
import SearchResults from "@/components/search/SearchResults";

interface SearchResult {
  _id: string;
  type: "poem";
  title: { en?: string; hi?: string; ur?: string } | null;
  author: { name?: string; _id: string } | null;
  slug: string;
  category: string;
  excerpt: string;
  content: { en: string[]; hi?: string[]; ur?: string[] };
}

async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  console.log("Fetching search results for query:", query);
  try {
    const url = `${process.env.NEXTAUTH_URL}/api/search-poems?q=${encodeURIComponent(query)}`;
    console.log("API URL:", url);
    const res = await fetch(url, { cache: "force-cache" });
    console.log("API response status:", res.status);
    if (!res.ok) throw new Error(`Failed to fetch search results: ${res.status}`);
    const data = await res.json();
    console.log("API response data:", JSON.stringify(data, null, 2));
    return data.results || [];
  } catch (error) {
    console.error("Error fetching search results:", error);
    return [];
  }
}

async function fetchFallbackPoems(): Promise<SearchResult[]> {
  console.log("Fetching fallback poems");
  try {
    const url = `${process.env.NEXTAUTH_URL}/api/search-poems?q=shayari`;
    const res = await fetch(url, { cache: "force-cache" });
    if (!res.ok) throw new Error(`Failed to fetch fallback poems: ${res.status}`);
    const data = await res.json();
    console.log("Fallback poems data:", JSON.stringify(data, null, 2));
    return data.results || [];
  } catch (error) {
    console.error("Error fetching fallback poems:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ query: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const query = decodeURIComponent(resolvedParams.query);
  console.log("Generating metadata for query:", query);
  const formattedQuery = query
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `Top Poems for ${formattedQuery} | Unmatched Lines`,
    description: `Discover the best ${formattedQuery} poems and shayari in English, Hindi, and Urdu. Explore heartfelt poetry on Unmatched Lines.`,
    keywords: `${formattedQuery}, shayari, poetry, poems, Urdu shayari, Hindi poetry, English poems, love poetry, sad shayari, Unmatched Lines`,
    alternates: {
      canonical: `https://unmatched-lines.vercel.app/search/${resolvedParams.query}`,
    },
    openGraph: {
      title: `Top Poems for ${formattedQuery} | Unmatched Lines`,
      description: `Explore a curated collection of ${formattedQuery} poems and shayari in multiple languages on Unmatched Lines.`,
      url: `https://unmatched-lines.vercel.app/search/${resolvedParams.query}`,
      siteName: "Unmatched Lines",
      type: "website",
      locale: "en_US",
      images: [{ url: "/default-poem-image.jpg", width: 800, height: 400, alt: `${formattedQuery} Poems` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `Top Poems for ${formattedQuery}`,
      description: `Find ${formattedQuery} poems and shayari on Unmatched Lines.`,
      images: ["/default-poem-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export async function generateStaticParams() {
  const popularQueries = [
    "sad shayari",
    "ishq shayari",
    "urdu shayari",
    "love poems",
    "ghazal",
    "sher",
    "nazm",
    "happy shayari",
    "romantic poetry",
    "friendship poems",
  ];
  console.log("Generating static params with queries:", popularQueries);
  return popularQueries.map((query) => ({
    query: encodeURIComponent(query.replace(/\s+/g, "-")),
  }));
}

export default async function SearchQueryPage({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const resolvedParams = await params;
  const query = decodeURIComponent(resolvedParams.query);
  console.log("Processing page for query:", query);
  let poems = await fetchSearchResults(resolvedParams.query);

  if (poems.length === 0) {
    console.log("No poems found for query, fetching fallback poems");
    poems = await fetchFallbackPoems();
  } else {
    console.log("Rendering SearchResults with poems:", poems.length);
  }

  // Enhanced validation with logging
  const safePoems = poems
    .filter(poem => {
      const isValid = poem && typeof poem === 'object';
      if (!isValid) console.error("Invalid poem object:", poem);
      return isValid;
    })
    .map(poem => {
      const safePoem = {
        _id: poem._id || "",
        type: poem.type || "poem",
        title: poem.title && typeof poem.title === 'object' ? {
          en: poem.title.en || "Untitled Poem",
          hi: poem.title.hi || undefined,
          ur: poem.title.ur || undefined
        } : { en: "Untitled Poem" },
        author: poem.author && typeof poem.author === 'object' ? {
          name: poem.author.name || "Unknown Author",
          _id: poem.author._id || ""
        } : { name: "Unknown Author", _id: "" },
        slug: poem.slug || "",
        category: poem.category || "",
        excerpt: poem.excerpt || "",
        content: poem.content && typeof poem.content === 'object' ? {
          en: Array.isArray(poem.content.en) ? poem.content.en : [],
          hi: Array.isArray(poem.content.hi) ? poem.content.hi : undefined,
          ur: Array.isArray(poem.content.ur) ? poem.content.ur : undefined
        } : { en: [] }
      };
      console.log("Processed safe poem:", JSON.stringify(safePoem, null, 2));
      return safePoem;
    });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `Top Poems for ${query}`,
            description: `A collection of ${query} poems and shayari in English, Hindi, and Urdu.`,
            url: `https://unmatched-lines.vercel.app/search/${resolvedParams.query}`,
            publisher: {
              "@type": "Organization",
              name: "Unmatched Lines",
            },
            mainEntity: safePoems.map((poem) => ({
              "@type": "CreativeWork",
              name: poem.title.en,
              url: `https://unmatched-lines.vercel.app/poems/en/${poem.slug}`,
              description: poem.excerpt,
              author: {
                "@type": "Person",
                name: poem.author.name,
              },
              inLanguage: ["en", "hi", "ur"],
            })),
          }),
        }}
      />
      <SearchResults poems={safePoems} query={query} />
    </>
  );
}
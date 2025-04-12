import type { Metadata } from "next"
import SearchResults from "@/components/search/SearchResults"

interface SearchResult {
  _id: string
  type: "poem"
  title: { en?: string; hi?: string; ur?: string } | null
  author: { name: string; _id: string } | null
  slug: { en: string; hi?: string; ur?: string }
  category: string
  excerpt: string
  content: { en: string[]; hi?: string[]; ur?: string[] }
}

interface SearchResponse {
  results: SearchResult[]
  hasMatches: boolean
}

async function fetchSearchResults(query: string): Promise<SearchResponse> {
 
  try {
    const url = `${process.env.NEXTAUTH_URL}/api/search-poems?q=${encodeURIComponent(query)}`
   
    const res = await fetch(url, { cache: "force-cache" })
   
    if (!res.ok) throw new Error(`Failed to fetch search results: ${res.status}`)
    const data = await res.json()
    
    return {
      results: data.results || [],
      hasMatches: data.hasMatches ?? true,
    }
  } catch (error) {
   
    return { results: [], hasMatches: false }
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ query: string }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const query = decodeURIComponent(resolvedParams.query)
 
  const formattedQuery = query
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return {
    title: `Top Poem for ${formattedQuery}`,
    description: `Explore the finest ${formattedQuery} poems and shayari in English, Hindi, and Urdu on Unmatched Lines. Discover heartfelt poetry curated for you.`,
    keywords: [
      formattedQuery,
      "shayari",
      "poetry",
      "poems",
      "Urdu shayari",
      "Hindi poetry",
      "English poems",
      "love poetry",
      "sad shayari",
      "Unmatched Lines",
    ],
    alternates: {
      canonical: `https://unmatched-lines.vercel.app/search/${encodeURIComponent(resolvedParams.query)}`,
    },
    openGraph: {
      title: `Top Poem for ${formattedQuery}`,
      description: `Discover a curated selection of ${formattedQuery} poems and shayari in English, Hindi, and Urdu on Unmatched Lines.`,
      url: `https://unmatched-lines.vercel.app/search/${encodeURIComponent(resolvedParams.query)}`,
      siteName: "Unmatched Lines",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: "/og-poem-image.jpg",
          width: 1200,
          height: 630,
          alt: `${formattedQuery} Poetry`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Top Poem for ${formattedQuery}`,
      description: `Find beautiful ${formattedQuery} poems and shayari on Unmatched Lines.`,
      images: ["/og-poem-image.jpg"],
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
  
    verification: {
      google: "your-google-verification-code",
    },
  }
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
    "दुख शायरी",
    "इश्क शायरी",
    "खुशी कविता",
    "عشق شاعری",
    "غم شاعری",
  ]
  
  return popularQueries.map((query) => ({
    query: encodeURIComponent(query.replace(/\s+/g, "-")),
  }))
}

export default async function SearchQueryPage({
  params,
}: {
  params: Promise<{ query: string }>
}) {
  const resolvedParams = await params
  const query = decodeURIComponent(resolvedParams.query)
 
  const { results: poems, hasMatches } = await fetchSearchResults(resolvedParams.query)


  const safePoems = poems
    .filter((poem) => poem && typeof poem === "object")
    .map((poem) => ({
      _id: poem._id || "",
      type: poem.type || "poem",
      title: poem.title && typeof poem.title === "object" ? poem.title : { en: "Untitled Poem" },
      author: poem.author && typeof poem.author === "object" ? poem.author : null,
      slug: poem.slug && typeof poem.slug === "object" ? poem.slug : { en: poem._id || "" },
      category: poem.category || "Uncategorized",
      excerpt: poem.excerpt || "No excerpt available",
      content: poem.content && typeof poem.content === "object" ? poem.content : { en: [] },
    }))


  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Top Poem for ${query}`,
    description: `A curated collection of ${query} poems and shayari in English, Hindi, and Urdu on Unmatched Lines.`,
    url: `https://unmatched-lines.vercel.app/search/${encodeURIComponent(resolvedParams.query)}`,
    publisher: {
      "@type": "Organization",
      name: "Unmatched Lines",
      logo: {
        "@type": "ImageObject",
        url: "https://unmatched-lines.vercel.app/logo.png",
      },
    },
    mainEntity: safePoems.map((poem) => ({
      "@type": "CreativeWork",
      name: poem.title?.en || "Untitled Poem",
      url: `https://unmatched-lines.vercel.app/poems/en/${poem.slug.en}`,
      description: poem.excerpt || "A beautiful poem from Unmatched Lines.",
      author: {
        "@type": "Person",
        name: poem.author?.name || "Unknown Author",
      },
      inLanguage: ["en", poem.title?.hi ? "hi" : null, poem.title?.ur ? "ur" : null].filter(Boolean),
      keywords: [poem.category, query, "poetry", "shayari"],
    })),
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://unmatched-lines.vercel.app/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: `Search: ${query}`,
          item: `https://unmatched-lines.vercel.app/search/${encodeURIComponent(resolvedParams.query)}`,
        },
      ],
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <SearchResults poems={safePoems} query={query} hasMatches={hasMatches} />
    </>
  )
}
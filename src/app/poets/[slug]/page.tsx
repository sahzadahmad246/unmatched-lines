import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import { PoetProfileComponent } from "@/components/home/PoetProfileComponent"

interface Poet {
  _id: string // Added for poem filtering
  name: string // Future: Change to { en: string; hi?: string; ur?: string }
  bio?: string // Future: Change to { en: string; hi?: string; ur?: string }
  image?: string
  dob?: string
  city?: string
  ghazalCount?: number
  sherCount?: number
  otherCount?: number
  createdAt: string
  updatedAt: string
  slug: string
}

interface PoetProfileProps {
  params: Promise<{ slug: string }>
}

async function fetchPoet(slug: string): Promise<Poet | null> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/authors/${encodeURIComponent(slug)}`, {
      cache: "force-cache",
    })
    if (!res.ok) throw new Error("Failed to fetch poet")
    const data = await res.json()
    // Future: Expect data.poet to include name: { en, hi, ur }, bio: { en, hi, ur }
    return data.poet || data.author || null // Handle author key
  } catch (error) {
   
    return null
  }
}

async function fetchPoetSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/authors`, {
      cache: "force-cache",
    })
    if (!res.ok) throw new Error("Failed to fetch poets")
    const data = await res.json()
    return data.authors?.map((poet: Poet) => poet.slug) || []
  } catch (error) {
   
    return ["mirza-ghalib-eb936b", "faiz-ahmed-faiz-456"]
  }
}

export async function generateStaticParams() {
  const slugs = await fetchPoetSlugs()
  return slugs.map((slug) => ({ slug }))
}



export async function generateMetadata({
  params,
}: PoetProfileProps): Promise<Metadata> {
  const resolvedParams = await params
  const slug = decodeURIComponent(resolvedParams.slug)
  const poet = await fetchPoet(slug)
  const baseUrl = process.env.NEXTAUTH_URL || "https://unmatched-lines.vercel.app"

  const poetName = poet?.name || slug
    .split('-')
    .slice(0, -1)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  // Future: Use poet.name.en if name becomes { en, hi, ur }

  const title = `${poetName} | Unmatched Lines`
  const description = poet?.bio
    ? `${poet.bio.substring(0, 100)}... Explore ${poetName}'s ${poet.ghazalCount || 0} ghazals and ${poet.sherCount || 0} shers.`
    : `Discover ${poetName}'s poetry, including ghazals and shers, at Unmatched Lines.`
  const imageUrl = poet?.image || "/default-poet-image.jpg"

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
  }
}

export default async function PoetProfile({ params }: PoetProfileProps) {
  const resolvedParams = await params
  const slug = decodeURIComponent(resolvedParams.slug)
  const poet = await fetchPoet(slug)

  if (!poet) {
    notFound()
  }

  const baseUrl = process.env.NEXTAUTH_URL || "https://unmatched-lines.vercel.app"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: poet.name,
    // Future: Use name.en if name becomes { en, hi, ur }
    url: `${baseUrl}/poets/${encodeURIComponent(slug)}`,
    image: poet.image || null,
    birthDate: poet.dob || null,
    address: poet.city ? { "@type": "PostalAddress", addressLocality: poet.city } : null,
    description: poet.bio || `${poet.name}, a poet featured on Unmatched Lines with ${poet.ghazalCount || 0} ghazals and ${poet.sherCount || 0} shers.`,
    // Future: Add description.hi, description.ur
    inLanguage: "en",
    // Future: Update to ["en", "hi", "ur"] if poet info becomes multilingual
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
          // Future: Use name.en
          item: `${baseUrl}/poets/${encodeURIComponent(slug)}`,
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
      <PoetProfileComponent slug={slug} poet={poet} />
    </>
  )
}

export const revalidate = 86400
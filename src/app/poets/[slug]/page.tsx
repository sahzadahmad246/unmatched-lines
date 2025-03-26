// src/app/poets/[slug]/page.tsx
import type { Metadata } from "next";
import { PoetProfileComponent } from "@/components/home/PoetProfileComponent";

interface Poem {
  _id: string;
  title: { en: string; hi?: string; ur?: string };
  author: { name: string; _id: string };
  category: string;
  excerpt?: string;
  slug?: { en: string };
  content?: {
    en?: string[] | string;
    hi?: string[] | string;
    ur?: string[] | string;
  };
  readListCount?: number;
  tags?: string[];
}

interface CoverImage {
  _id: string;
  url: string;
}

interface Poet {
  name: string;
  bio?: string;
  image?: string;
  dob?: string;
  city?: string;
  ghazalCount?: number;
  sherCount?: number;
  otherCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Fetch poet data server-side for metadata
async function fetchPoet(slug: string): Promise<Poet | null> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/authors/${slug}`, {
      cache: "no-store",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to fetch poet: ${res.status}`);
    const data = await res.json();
    return data.author || null;
  } catch (error) {
    
    return null;
  }
}

// Generate metadata dynamically
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const poet = await fetchPoet(resolvedParams.slug);

  const title = poet?.name || "Poet Not Found";
  const description = poet?.bio
    ? `${poet.bio.slice(0, 150)}... - Explore poetry by ${title}`
    : `Explore poetry works by ${title} including ghazals, shers, and more`;

  return {
    title: `${title} | Poet Profile - Poetry Collection`,
    description,
    keywords: [
      title,
      "poet",
      "poetry",
      "ghazals",
      "shers",
      "nazms",
      "literature",
    ].join(", "),
    openGraph: {
      title: `${title} | Poet Profile`,
      description,
      url: `https://unmatched-lines.vercel.app/poets/${resolvedParams.slug}`,
      siteName: "Your Site Name",
      type: "profile",
      locale: "en_US",
      images: [
        {
          url: poet?.image || "/placeholder.svg?height=400&width=400",
          width: 800,
          height: 400,
          alt: `${title}'s Profile`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Poet Profile`,
      description,
      images: [poet?.image || "/placeholder.svg?height=400&width=400"],
    },
    robots: {
      index: !!poet,
      follow: true,
    },
    metadataBase: new URL("https://unmatched-lines.vercel.app"),
  };
}

export default async function PoetProfile({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return <PoetProfileComponent slug={resolvedParams.slug} />;
}
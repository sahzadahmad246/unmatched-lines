import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PoetProfileComponent } from "@/components/home/PoetProfileComponent";
import dbConnect from "@/lib/mongodb";
import { Author, Poem, User } from "@/models"; // Import from models/index.ts
import mongoose from "mongoose";

interface Poet {
  _id: string;
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
  slug: string;
  followerCount: number;
  followers: Array<{ id: string; name: string; image?: string; followedAt: string }>;
}

interface AuthorLean {
  _id: mongoose.Types.ObjectId;
  name: string;
  bio?: string;
  image?: string;
  dob?: Date;
  city?: string;
  ghazalCount?: number;
  sherCount?: number;
  otherCount?: number;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  followerCount: number;
  followers: Array<{
    userId: { _id: mongoose.Types.ObjectId; name: string; image?: string };
    followedAt: Date;
  }>;
  poems: Array<{
    poemId: {
      _id: mongoose.Types.ObjectId;
      title: { en: string; hi?: string; ur?: string };
      category: string;
    };
    addedAt: Date;
  }>;
}

interface PoetProfileProps {
  params: Promise<{ slug: string }>;
}

async function fetchPoet(slug: string): Promise<Poet | null> {
  try {
    await dbConnect();

    // Models are registered via models/index.ts
    const author = await Author.findOne({ slug })
      .populate("poems.poemId", "title category")
      .populate("followers.userId", "name image")
      .lean<AuthorLean>();

    if (!author) {
      return null;
    }

    const poet: Poet = {
      _id: author._id.toString(),
      name: author.name,
      bio: author.bio,
      image: author.image,
      dob: author.dob?.toISOString(),
      city: author.city,
      ghazalCount: author.ghazalCount || 0,
      sherCount: author.sherCount || 0,
      otherCount: author.otherCount || 0,
      createdAt: author.createdAt.toISOString(),
      updatedAt: author.updatedAt.toISOString(),
      slug: author.slug,
      followerCount: Number(author.followerCount) || 0,
      followers: (author.followers || []).map((f) => ({
        id: f.userId._id.toString(),
        name: f.userId.name,
        image: f.userId.image,
        followedAt: f.followedAt.toISOString(),
      })),
    };

    return poet;
  } catch (error) {
    console.error("Error fetching poet:", error);
    return null;
  }
}

async function fetchPoetSlugs(): Promise<string[]> {
  try {
    await dbConnect();
    const authors = await Author.find().select("slug").lean<{ slug: string }[]>();
    return authors.map((author) => author.slug);
  } catch (error) {
    console.error("Error fetching poet slugs:", error);
    return ["mirza-ghalib", "faiz-ahmed-faiz"];
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
  const followerCount = poet?.followerCount || 0;

  const title = `${poetName} | Unmatched Lines`;
  const description = poet?.bio
    ? `${poet.bio.substring(0, 100)}... Explore ${poetName}'s ${poet.ghazalCount || 0} ghazals and ${
        poet.sherCount || 0
      } shers with ${followerCount} followers.`
    : `Discover ${poetName}'s poetry, including ghazals and shers, at Unmatched Lines.`;
  const imageUrl = poet?.image || "/default-poet-image.jpg";

  return {
    title,
    description,
    keywords: [poetName, "poet", "poetry", "ghazal", "sher", "nazm", "Unmatched Lines"],
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
    description: poet.bio || `${poet.name}, a poet featured on Unmatched Lines with ${poet.ghazalCount || 0} ghazals and ${poet.sherCount || 0} shers.`,
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
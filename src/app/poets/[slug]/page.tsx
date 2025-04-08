import type { Metadata } from "next";
import { PoetProfileComponent } from "@/components/home/PoetProfileComponent";

// Define the Poet interface
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

// Define the props interface matching Next.js expectations
interface PoetProfileProps {
  params: Promise<{ slug: string }>; // params is a Promise as per PageProps
}

// Generate static metadata with async handling
export async function generateMetadata({
  params,
}: PoetProfileProps): Promise<Metadata> {
  const resolvedParams = await params; // Resolve the Promise
  const poetName = resolvedParams.slug
    .split('-')
    .slice(0, -1) // Remove the last part (e.g., ID)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const title = `${poetName} | Poet Profile - Poetry Collection`;
  const description = `Explore poetry works by ${poetName} including ghazals, shers, and more`;

  return {
    title,
    description,
    keywords: [
      poetName,
      "poet",
      "poetry",
      "ghazals",
      "shers",
      "nazms",
      "literature",
    ].join(", "),
    openGraph: {
      title: `${poetName} | Poet Profile`,
      description,
      url: `https://unmatched-lines.vercel.app/poets/${resolvedParams.slug}`,
      siteName: "Your Site Name",
      type: "profile",
      locale: "en_US",
      images: [
        {
          url: "/placeholder.svg?height=400&width=400",
          width: 800,
          height: 400,
          alt: `${poetName}'s Profile`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${poetName} | Poet Profile`,
      description,
      images: ["/placeholder.svg?height=400&width=400"],
    },
    robots: {
      index: true,
      follow: true,
    },
    metadataBase: new URL("https://unmatched-lines.vercel.app"),
  };
}

// Define the page component as async to handle the Promise
export default async function PoetProfile({ params }: PoetProfileProps) {
  const resolvedParams = await params; // Resolve the Promise
  return <PoetProfileComponent slug={resolvedParams.slug} />;
}
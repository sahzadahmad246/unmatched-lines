import type { Metadata } from "next";
import PoemDetail from "@/components/poems/poem-detail";

// Define the Poem interface
interface Poem {
  title: { en?: string; hi?: string; ur?: string } | string;
  author?: { name: string } | string;
  content?: { en?: string; hi?: string; ur?: string };
  category?: string;
  tags?: string[];
  slug: { en: string; hi: string; ur: string }[] | string;
  coverImage?: string;
}

// Fetch poem data server-side for metadata
async function fetchPoem(slug: string): Promise<Poem | null> {
  try {
    const res = await fetch(
      `${process.env.NEXTAUTH_URL}/api/poem?slug=${slug}`,
      {
        cache: "no-store",
      }
    );
    if (!res.ok) throw new Error(`Failed to fetch poem: ${res.status}`);
    const data = await res.json();
    console.log(
      "API Response for slug",
      slug,
      ":",
      JSON.stringify(data, null, 2)
    );
    return data.poem || null;
  } catch (error) {
    console.error("Error fetching poem for metadata:", error);
    return null;
  }
}

// Generate metadata dynamically with Promise-wrapped params
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params; // Resolve the Promise to get the slug
  const poem = await fetchPoem(resolvedParams.slug);

  const title =
    typeof poem?.title === "string"
      ? poem.title
      : poem?.title?.en || "Poem Not Found";
  const author =
    typeof poem?.author === "string"
      ? poem.author
      : poem?.author?.name || "Unknown Author";
  const description = poem?.content?.en
    ? `${poem.content.en.slice(
        0,
        150
      )}... - A poem by ${author} on Unmatched Lines`
    : `Explore this poem by ${author} on Unmatched Lines, a collection of poetry across languages.`;

  console.log("Generated Metadata - Title:", title, "Author:", author);

  return {
    title: `${title} by ${author} | Unmatched Lines - Poetry Collection`,
    description,
    keywords: [
      title,
      author,
      "poetry",
      "poem",
      poem?.category || "poetry",
      ...(poem?.tags || []),
      "Unmatched Lines",
      "multilingual poetry",
    ].join(", "),
    openGraph: {
      title: `${title} by ${author} | Unmatched Lines`,
      description,
      url: `https://unmatched-lines.vercel.app/poems/${resolvedParams.slug}`,
      siteName: "Unmatched Lines",
      type: "article",
      locale: "en_US",
      images: [
        {
          url:
            poem?.coverImage ||
            "https://unmatched-lines.vercel.app/default-poem-image.jpg",
          width: 800,
          height: 400,
          alt: `${title} by ${author}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} by ${author} | Unmatched Lines`,
      description,
      creator: "@shahzadahmad246",
      images: [
        poem?.coverImage ||
          "https://unmatched-lines.vercel.app/default-poem-image.jpg",
      ],
    },
    robots: {
      index: true,
      follow: true,
    },
    metadataBase: new URL("https://unmatched-lines.vercel.app"),
  };
}

// Define the page component with correct PageProps typing
export default async function PoemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params; // Resolve the Promise to get the slug
  return <PoemDetail />;
}

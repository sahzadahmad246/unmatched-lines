// src/app/poets/[slug]/[category]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryPoemsByAuthor from "@/components/poems/category-poems-by-author";
import { Poem } from "@/types/poem";

async function fetchAuthorBySlug(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/authors?slug=${slug}`, {
      cache: "force-cache",
    });

    if (!res.ok) {
      const errorText = await res.text();
      
      return null;
    }
    const data = await res.json();
   
    return data.author || null;
  } catch (error) {
    
    return null;
  }
}

async function fetchPoemsByAuthorAndCategory(slug: string, category: string): Promise<{ poems: Poem[]; author: { name: string; slug: string } } | null> {
  try {
    const url = `${process.env.NEXTAUTH_URL}/api/poem?category=${category}&authorSlug=${slug}`;
    
    const res = await fetch(url, { cache: "force-cache" });
    
    if (!res.ok) {
      const errorText = await res.text();
      
      throw new Error(`Failed to fetch poems: ${res.status}`);
    }
    const data = await res.json();

    return data.poems && data.author ? { poems: data.poems, author: data.author } : null;
  } catch (error) {
   
    return null;
  }
}

async function fetchCoverImages(): Promise<{ url: string }[]> {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/cover-images`, {
      credentials: "include",
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Failed to fetch cover images");
    const data = await res.json();
    return data.coverImages || [];
  } catch (error) {
    
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; category: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug, category } = resolvedParams;
  const data = await fetchPoemsByAuthorAndCategory(slug, category);
  const coverImages = await fetchCoverImages();

  if (!data) {
    return {
      title: "Poems Not Found | Unmatched Lines",
      description: "No poems found for this author and category.",
    };
  }

  const { author, poems } = data;
  const displayCategory = category.charAt(0).toUpperCase() + category.slice(1);
  const title = `${displayCategory} by ${author.name} | Unmatched Lines`;
  const description = `Explore a collection of ${displayCategory} poems by ${author.name} in English, Hindi, and Urdu at Unmatched Lines.`;
  const coverImageUrl = coverImages.length > 0 ? coverImages[0].url : "/default-poem-image.jpg";
  const baseUrl = process.env.NEXTAUTH_URL || "https://www.unmatchedlines.com";

  return {
    title,
    description,
    keywords: [
      author.name,
      displayCategory,
      "poetry",
      `${displayCategory} poems`,
      `${author.name} poems`,
      "English poetry",
      "Hindi poetry",
      "Urdu poetry",
      "Unmatched Lines",
    ].join(", "),
    alternates: {
      canonical: `${baseUrl}/poets/${slug}/${category}`,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}/poets/${slug}/${category}`,
      images: [{ url: coverImageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImageUrl],
    },
  };
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/authors`, {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error("Failed to fetch authors");
    const data = await res.json();
    const authors = data.authors || [];
    
    const categories = ["ghazal", "sher", "nazm"];
    return authors.flatMap((author: any) =>
      categories.map((category) => ({
        slug: author.slug,
        category,
      }))
    );
  } catch (error) {
   
    return []; // Fallback to empty array if fetch fails
  }
}

export default async function PoetCategoryPage({
  params,
}: {
  params: Promise<{ slug: string; category: string }>;
}) {
  const resolvedParams = await params;


  // Verify the author exists
  const author = await fetchAuthorBySlug(resolvedParams.slug);
  if (!author) {
    
    notFound();
  }

  const data = await fetchPoemsByAuthorAndCategory(resolvedParams.slug, resolvedParams.category);
  if (!data) {

    notFound();
  }

  const { poems } = data;
  

  return (
    <CategoryPoemsByAuthor
      poems={poems}
      category={resolvedParams.category}
      author={data.author}
    />
  );
}
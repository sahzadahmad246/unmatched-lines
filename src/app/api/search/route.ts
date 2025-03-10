// app/api/search/route.ts
import type { NextRequest } from "next/server"; // Use NextRequest instead of NextApiRequest
import { NextResponse } from "next/server"; // Use NextResponse instead of NextApiResponse
import mongoose from "mongoose";
import Poem from "@/models/Poem";
import Author from "@/models/Author";
import dbConnect from "@/lib/mongodb";

// Define interfaces for the lean documents
interface LeanPoem {
  _id: mongoose.Types.ObjectId;
  title: { en: string; hi: string; ur: string };
  slug: { en: string; hi: string; ur: string };
  category: string;
  coverImage: string;
  content: { en: string[]; hi: string[]; ur: string[] };
}

interface LeanAuthor {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  city?: string;
}

// Response type for the API
interface SearchResult {
  _id: string;
  type: "poem" | "poet";
  title?: { en: string; hi: string; ur: string };
  name?: string;
  slug?: string;
  category?: string;
  image?: string;
  excerpt?: string;
}

// Named export for GET method
export async function GET(req: NextRequest) {
  await dbConnect(); // Ensure DB is connected

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ message: "Query must be at least 2 characters" }, { status: 400 });
  }

  const searchQuery = q.trim();

  try {
    // Search Poems with explicit typing
    const poemResults = (await Poem.find({
      $or: [
        { "title.en": { $regex: searchQuery, $options: "i" } },
        { "title.hi": { $regex: searchQuery, $options: "i" } },
        { "title.ur": { $regex: searchQuery, $options: "i" } },
        { "content.en": { $regex: searchQuery, $options: "i" } },
        { "content.hi": { $regex: searchQuery, $options: "i" } },
        { "content.ur": { $regex: searchQuery, $options: "i" } },
        { tags: { $regex: searchQuery, $options: "i" } },
      ],
      status: "published",
    })
      .limit(10)
      .select("title slug category coverImage content")
      .lean()) as unknown as LeanPoem[];

    // Search Authors with explicit typing
    const authorResults = (await Author.find({
      $or: [
        { name: { $regex: searchQuery, $options: "i" } },
        { city: { $regex: searchQuery, $options: "i" } },
      ],
    })
      .limit(10)
      .select("name slug image city")
      .lean()) as unknown as LeanAuthor[];

    // Format results to match frontend expectation
    const formattedPoemResults = poemResults.map((poem) => ({
      _id: poem._id.toString(),
      type: "poem" as const,
      title: poem.title,
      slug: poem.slug.en, // Use English slug for frontend
      category: poem.category,
      image: poem.coverImage,
      excerpt: poem.content.en[0]?.substring(0, 100), // First line as excerpt
    }));

    const formattedAuthorResults = authorResults.map((author) => ({
      _id: author._id.toString(),
      type: "poet" as const,
      name: author.name,
      slug: author.slug,
      image: author.image,
      excerpt: author.city ? `From ${author.city}` : undefined,
    }));

    // Combine and sort results
    const results: SearchResult[] = [...formattedPoemResults, ...formattedAuthorResults].sort((a, b) =>
      a.type.localeCompare(b.type)
    );

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
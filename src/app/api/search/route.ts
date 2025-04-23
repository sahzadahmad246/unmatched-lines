// app/api/search/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
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
  content: {
    en: { verse: string; meaning: string }[];
    hi: { verse: string; meaning: string }[];
    ur: { verse: string; meaning: string }[];
  };
  author: { _id: mongoose.Types.ObjectId; name: string; image: string };
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
  slug?: { en: string; hi: string; ur: string } | string;
  category?: string;
  image?: string;
  excerpt?: string;
  content?: {
    en?: { verse: string; meaning: string }[];
    hi?: { verse: string; meaning: string }[];
    ur?: { verse: string; meaning: string }[];
  };
  author?: { _id: string; name: string; image?: string };
}

// Named export for GET method
export async function GET(req: NextRequest) {
  await dbConnect(); // Ensure DB is connected

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q || q.trim().length < 2) {
    return NextResponse.json(
      { message: "Query must be at least 2 characters" },
      { status: 400 }
    );
  }

  const searchQuery = q.trim();

  try {
    // Search Poems with explicit typing
    const poemResults = (await Poem.find({
      $or: [
        { "title.en": { $regex: searchQuery, $options: "i" } },
        { "title.hi": { $regex: searchQuery, $options: "i" } },
        { "title.ur": { $regex: searchQuery, $options: "i" } },
        { "content.en.verse": { $regex: searchQuery, $options: "i" } },
        { "content.hi.verse": { $regex: searchQuery, $options: "i" } },
        { "content.ur.verse": { $regex: searchQuery, $options: "i" } },
        { tags: { $regex: searchQuery, $options: "i" } },
      ],
      status: "published",
    })
      .limit(10)
      .select("title slug category coverImage content author")
      .populate("author", "name image") // Include image in populate
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
      slug: poem.slug, // Return full slug object for language support
      category: poem.category,
      image: poem.coverImage,
      excerpt: poem.content.en[0]?.verse.substring(0, 100), // First verse as excerpt
      content: poem.content,
      author: poem.author
        ? {
            _id: poem.author._id.toString(),
            name: poem.author.name,
            image: poem.author.image,
          }
        : undefined,
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
    const results: SearchResult[] = [
      ...formattedPoemResults,
      ...formattedAuthorResults,
    ].sort((a, b) => a.type.localeCompare(b.type));

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
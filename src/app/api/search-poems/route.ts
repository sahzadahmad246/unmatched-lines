// app/api/search-poems/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Poem from "@/models/Poem";
import Author from "@/models/Author";
import dbConnect from "@/lib/mongodb";

interface LeanPoem {
  _id: mongoose.Types.ObjectId;
  title: { en: string; hi: string; ur: string };
  slug: { en: string; hi: string; ur: string };
  category: string;
  coverImage?: string;
  content: { en: string[]; hi: string[]; ur: string[] };
  tags?: string[];
  author?: { _id: mongoose.Types.ObjectId; name: string };
}

interface SearchResult {
  _id: string;
  type: "poem";
  title: { en: string; hi?: string; ur?: string };
  author: { name: string; _id: string };
  slug: string;
  category: string;
  excerpt: string;
  content: { en: string[]; hi?: string[]; ur?: string[] };
}

const synonymMap: Record<string, string[]> = {
  ishq: ["mohabbat", "love", "pyar", "prem"],
  sad: ["gham", "dukh", "sorrow", "udaas"],
  shayari: ["poetry", "kavita", "ghazal", "sher"],
  love: ["ishq", "mohabbat", "pyar", "prem"],
};

function getSearchTerms(query: string): string[] {
  const words = query.trim().toLowerCase().split(/[\s-]+/);
  const terms = new Set<string>();
  words.forEach((word) => {
    terms.add(word);
    if (synonymMap[word]) synonymMap[word].forEach((synonym) => terms.add(synonym));
  });
  return Array.from(terms);
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
   

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ message: "Query must be at least 2 characters" }, { status: 400 });
    }

    const searchQuery = q.trim();
    const searchTerms = getSearchTerms(searchQuery);
  

    const poemQuery = {
      $or: searchTerms.map((term) => ({
        $or: [
          { "title.en": { $regex: term, $options: "i" } },
          { "title.hi": { $regex: term, $options: "i" } },
          { "title.ur": { $regex: term, $options: "i" } },
          { "content.en": { $regex: term, $options: "i" } },
          { "content.hi": { $regex: term, $options: "i" } },
          { "content.ur": { $regex: term, $options: "i" } },
          { tags: { $regex: term, $options: "i" } },
          { "author.name": { $regex: term, $options: "i" } },
          { category: { $regex: term, $options: "i" } },
        ],
      })),
      status: "published",
    };
   

    const poemResults = (await Poem.find(poemQuery)
      .populate({
        path: "author",
        model: Author, 
        select: "name _id",
        options: { lean: true },
      })
      .limit(20)
      .lean()) as unknown as LeanPoem[];

    

    const results: SearchResult[] = poemResults.map((poem) => {
    
      return {
        _id: poem._id.toString(),
        type: "poem",
        title: {
          en: poem.title?.en || "Untitled",
          hi: poem.title?.hi,
          ur: poem.title?.ur,
        },
        author: poem.author
          ? { name: poem.author.name || "Unknown Author", _id: poem.author._id?.toString() || "" }
          : { name: "Unknown Author", _id: "" },
        slug: poem.slug?.en || poem._id.toString(),
        category: poem.category || "Uncategorized",
        excerpt: poem.content?.en?.[0]?.substring(0, 100) || "No excerpt available",
        content: {
          en: Array.isArray(poem.content?.en) ? poem.content.en : [poem.content?.en || ""],
          hi: Array.isArray(poem.content?.hi) ? poem.content.hi : [poem.content?.hi || ""],
          ur: Array.isArray(poem.content?.ur) ? poem.content.ur : [poem.content?.ur || ""],
        },
      };
    });

   
    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    console.error("Search poems API error:",);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
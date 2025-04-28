import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Poem from "@/models/Poem";
import Author from "@/models/Author";

// Define types based on Poem model
interface IPoemVerse {
  verse: string;
  meaning?: string;
}

interface PoemContent {
  en: IPoemVerse[];
  hi: IPoemVerse[];
  ur: IPoemVerse[];
}

interface PoemDocument {
  _id: string;
  title: { en: string; hi: string; ur: string };
  content?: PoemContent;
  author?: any;
  category: string;
  status: string;
  slug: { en: string; hi: string; ur: string };
  summary: { en: string; hi: string; ur: string };
  didYouKnow: { en: string; hi: string; ur: string };
  faqs: Array<{
    question: { en: string; hi: string; ur: string };
    answer: { en: string; hi: string; ur: string };
  }>;
  viewsCount: number;
  readListUsers: string[];
  readListCount: number;
  coverImage: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const category = url.searchParams.get("category")?.toLowerCase();
    const authorSlug = url.searchParams.get("authorSlug");
    const top = url.searchParams.get("top"); // e.g., top=20 for top 20 poems
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "50", 10); // Default to 50 for lazy loading

    if (!category) {
      return NextResponse.json(
        { error: "Category parameter is required" },
        { status: 400 }
      );
    }

    // Build query
    const query: any = {
      category: category.toLowerCase(),
      status: "published",
    };
    let sort: { [key: string]: 1 | -1 } = { createdAt: -1 }; // Default sort
    let responseLimit = limit;

    if (authorSlug) {
      const author = await Author.findOne({ slug: authorSlug });
      if (!author) {
        return NextResponse.json(
          { error: `Author not found for slug: ${authorSlug}` },
          { status: 404 }
        );
      }
      query.author = author._id;
    }

    // Handle top 20 poems
    if (top === "20") {
      sort = { viewsCount: -1 }; // Sort by viewsCount descending
      responseLimit = 20; // Override limit to 20
    }

    // Pagination
    const skip = (page - 1) * responseLimit;
    const totalPoems = await Poem.countDocuments(query);

    // Fetch poems
    const poems = await Poem.find(query)
      .populate("author", "name slug image bio")
      .sort(sort)
      .skip(skip)
      .limit(responseLimit)
      .lean<PoemDocument[]>();

    if (!poems.length && page === 1) {
      return NextResponse.json(
        {
          error: `No published poems found for category: ${category}${authorSlug ? ` and author: ${authorSlug}` : ""}`,
        },
        { status: 404 }
      );
    }

    // Transform content
    const transformedPoems = poems.map((poem) => {
      const transformedContent: PoemContent = {
        en: [],
        hi: [],
        ur: [],
      };

      Object.keys(transformedContent).forEach((lang) => {
        const content = poem.content?.[lang as "en" | "hi" | "ur"] || [];
        transformedContent[lang as "en" | "hi" | "ur"] = content.map((item) => ({
          verse: item.verse,
          meaning: item.meaning || "Default meaning",
        }));
      });

      return {
        ...poem,
        content: transformedContent,
        viewsCount: poem.viewsCount ?? 0,
        readListCount: poem.readListCount ?? 0,
        category: poem.category ?? "Uncategorized",
        summary: poem.summary ?? { en: "", hi: "", ur: "" },
        didYouKnow: poem.didYouKnow ?? { en: "", hi: "", ur: "" },
        faqs: poem.faqs ?? [],
        createdAt: poem.createdAt ?? new Date(),
        tags: poem.tags ?? [],
        coverImage: poem.coverImage ?? "/placeholder.svg",
      };
    });

    console.log(
      `API /poems-by-category - Category: ${category}, AuthorSlug: ${authorSlug}, Top: ${top}, Page: ${page}, Limit: ${responseLimit}, Poems:`,
      JSON.stringify(transformedPoems, null, 2)
    );

    return NextResponse.json({
      category,
      poems: transformedPoems,
      total: totalPoems,
      page,
      pages: Math.ceil(totalPoems / responseLimit),
      ...(authorSlug && { authorSlug }),
    });
  } catch (error) {
    console.error("Error in /api/poems-by-category:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
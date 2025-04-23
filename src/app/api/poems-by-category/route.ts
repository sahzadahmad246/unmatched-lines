// src/app/api/poems-by-category/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Poem from "@/models/Poem";
import Author from "@/models/Author";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const category = url.searchParams.get("category")?.toLowerCase();
    const authorSlug = url.searchParams.get("authorSlug");
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    if (!category) {
      return NextResponse.json(
        { error: "Category parameter is required" },
        { status: 400 }
      );
    }

    const query: any = {
      category: category.toLowerCase(),
      status: "published",
    };

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

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch total count for pagination metadata
    const totalPoems = await Poem.countDocuments(query);

    // Fetch poems with pagination
    const poems = await Poem.find(query)
      .populate("author", "name slug image bio")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (!poems.length && page === 1) {
      return NextResponse.json(
        {
          error: `No published poems found for category: ${category}${authorSlug ? ` and author: ${authorSlug}` : ""}`,
        },
        { status: 404 }
      );
    }

    // Transform content (unchanged)
    const transformedPoems = poems.map((poem) => {
      const transformedContent = {
        en: poem.content?.en,
        hi: poem.content?.hi,
        ur: poem.content?.ur,
      };

      Object.keys(transformedContent).forEach((lang) => {
        const content = transformedContent[lang as "en" | "hi" | "ur"];
        if (content) {
          if (Array.isArray(content) && typeof content[0] === "string") {
            transformedContent[lang as "en" | "hi" | "ur"] = content.map((verse) => ({
              verse,
              meaning: "Default meaning",
            }));
          } else if (typeof content === "string") {
            transformedContent[lang as "en" | "hi" | "ur"] = [
              { verse: content, meaning: "Default meaning" },
            ];
          } else if (Array.isArray(content) && content[0]?.verse) {
            transformedContent[lang as "en" | "hi" | "ur"] = content;
          } else {
            transformedContent[lang as "en" | "hi" | "ur"] = [];
          }
        } else {
          transformedContent[lang as "en" | "hi" | "ur"] = [];
        }
      });

      return {
        ...poem,
        content: transformedContent,
      };
    });

    console.log(`API /poems-by-category - Category: ${category}, AuthorSlug: ${authorSlug}, Page: ${page}, Limit: ${limit}, Poems:`, JSON.stringify(transformedPoems, null, 2));

    return NextResponse.json({
      category,
      poems: transformedPoems,
      total: totalPoems,
      page,
      pages: Math.ceil(totalPoems / limit),
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
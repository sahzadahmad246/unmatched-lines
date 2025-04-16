import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Poem from "@/models/Poem";
import Author from "@/models/Author";

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Parse query parameters
    const url = new URL(request.url);
    const category = url.searchParams.get("category")?.toLowerCase();
    const authorSlug = url.searchParams.get("authorSlug");

    // Validate category parameter
    if (!category) {
      return NextResponse.json(
        { error: "Category parameter is required" },
        { status: 400 }
      );
    }

    // Build query object
    const query: any = { 
      category: category.toLowerCase(),
      status: "published"
    };

    // If authorSlug is provided, add author filter
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

    // Fetch poems
    const poems = await Poem.find(query)
      .populate("author", "name slug image bio")
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain JavaScript objects for better performance

    // Handle case where no poems are found
    if (!poems.length) {
      return NextResponse.json(
        { 
          error: `No published poems found for category: ${category}${authorSlug ? ` and author: ${authorSlug}` : ''}` 
        },
        { status: 404 }
      );
    }

    // Return response
    return NextResponse.json({
      category,
      poems,
      total: poems.length,
      ...(authorSlug && { authorSlug })
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
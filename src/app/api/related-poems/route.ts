import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Poem from "@/models/Poem";

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const authorId = url.searchParams.get("authorId");
    const lang = url.searchParams.get("lang");
    const excludeId = url.searchParams.get("excludeId");

    if (!category || !authorId || !lang || !excludeId) {
      return NextResponse.json(
        { error: "Category, authorId, lang, and excludeId are required" },
        { status: 400 }
      );
    }

    // Fetch poems by category (excluding the current poem)
    const byCategory = await Poem.find({
      category,
      _id: { $ne: excludeId },
      status: "published",
    })
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch poems by author (excluding the current poem)
    const byAuthor = await Poem.find({
      "author": authorId,
      _id: { $ne: excludeId },
      status: "published",
    })
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      byCategory,
      byAuthor,
    });
  } catch (error) {
    console.error("Error fetching related poems:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
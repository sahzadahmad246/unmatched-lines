// src/app/api/authors/[id]/top-content/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Author from "@/models/Author";
import mongoose from "mongoose";
import { updateTopContentForAuthor } from "@/lib/updateTopContent";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  await dbConnect();

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") as string | null;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    // Find author by ID or slug
    let author = isObjectId ? await Author.findById(id) : await Author.findOne({ slug: id });

    if (!author) {
      console.error(`Author not found for ID/slug: ${id}`);
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    // Update topContent if last updated more than a day ago
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (!author.topContentLastUpdated || author.topContentLastUpdated < oneDayAgo) {
      console.log(`Triggering topContent update for author: ${author._id}`);
      await updateTopContentForAuthor(author._id.toString());
    }

    // Determine populate fields
    const validCategories = ["poem", "ghazal", "sher", "nazm", "rubai", "marsiya", "qataa", "other"];
    const populateFields = category && validCategories.includes(category)
      ? `topContent.${category}.contentId`
      : [
          "topContent.poem.contentId",
          "topContent.ghazal.contentId",
          "topContent.sher.contentId",
          "topContent.nazm.contentId",
          "topContent.rubai.contentId",
          "topContent.marsiya.contentId",
          "topContent.qataa.contentId",
          "topContent.other.contentId",
        ];

    // Fetch updated author
    const updatedAuthor: any = await Author.findById(author._id).populate(populateFields, "title.en viewsCount");

    if (!updatedAuthor) {
      console.error(`Updated author not found for ID: ${author._id}`);
      return NextResponse.json({ error: "Author not found after update" }, { status: 404 });
    }

    // Prepare response
    const response: { topContent: any } = { topContent: {} };
    if (category && validCategories.includes(category)) {
      response.topContent = updatedAuthor.topContent[category].slice(0, Math.min(limit, 20));
    } else {
      response.topContent = {
        poem: updatedAuthor.topContent.poem.slice(0, Math.min(limit, 20)),
        ghazal: updatedAuthor.topContent.ghazal.slice(0, Math.min(limit, 20)),
        sher: updatedAuthor.topContent.sher.slice(0, Math.min(limit, 20)),
        nazm: updatedAuthor.topContent.nazm.slice(0, Math.min(limit, 20)),
        rubai: updatedAuthor.topContent.rubai.slice(0, Math.min(limit, 20)),
        marsiya: updatedAuthor.topContent.marsiya.slice(0, Math.min(limit, 20)),
        qataa: updatedAuthor.topContent.qataa.slice(0, Math.min(limit, 20)),
        other: updatedAuthor.topContent.other.slice(0, Math.min(limit, 20)),
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching top content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
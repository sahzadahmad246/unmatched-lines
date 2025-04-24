// src/app/api/authors/update-top-content/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Author from "@/models/Author";
import Poem from "@/models/Poem";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const authors = await Author.find();

    for (const author of authors) {
      const categories = ["poem", "ghazal", "sher", "nazm", "rubai", "marsiya", "qataa", "other"];
      const updates: any = {
        topContent: {
          poem: [],
          ghazal: [],
          sher: [],
          nazm: [],
          rubai: [],
          marsiya: [],
          qataa: [],
          other: [],
        },
      };

      for (const category of categories) {
        const topPoems = await Poem.find({
          author: author._id,
          category,
          status: "published",
        })
          .sort({ viewsCount: -1 })
          .limit(20)
          .select("_id");

        updates.topContent[category] = topPoems.map((poem, index) => ({
          contentId: poem._id,
          rank: index + 1,
        }));
      }

      await Author.findByIdAndUpdate(author._id, updates, { runValidators: true });
    }

    return NextResponse.json({ message: "Top content updated for all authors" });
  } catch (error) {
    console.error("Error updating top content:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
// src/app/api/poems/[identifier]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import dbConnect from "@/lib/mongodb";
import Poem from "@/models/Poem";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ identifier: string }> }
) {
  try {
    await dbConnect();
    const params = await context.params;
    const { identifier } = params;

    const poem = Types.ObjectId.isValid(identifier)
      ? await Poem.findById(identifier)
      : await Poem.findOne({
          $or: [
            { "slug.en": identifier },
            { "slug.hi": identifier },
            { "slug.ur": identifier },
          ],
        }).populate("poet", "name profilePicture slug");

    if (!poem) {
      return NextResponse.json({ message: "Poem not found" }, { status: 404 });
    }

    const updatedPoem = await Poem.findOneAndUpdate(
      { _id: poem._id },
      { $inc: { viewsCount: 1 } },
      { new: true }
    ).populate("poet", "name profilePicture slug");

    if (!updatedPoem) {
      return NextResponse.json({ poem }, { status: 200 });
    }

    const poemData = await Poem.findById(updatedPoem._id)
      .populate("poet", "name profilePicture slug")
      .select("-__v")
      .lean();

    return NextResponse.json({ poem: poemData });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

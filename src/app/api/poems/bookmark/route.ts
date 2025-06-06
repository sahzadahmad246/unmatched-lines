// src/app/api/poems/bookmark/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import dbConnect from "@/lib/mongodb";
import Poem from "@/models/Poem";
import User from "@/models/User";
import { authOptions } from "@/lib/auth/authOptions";
import { bookmarkPoemSchema } from "@/validators/poemValidator";

export async function POST(req: NextRequest) {
  let body: z.infer<typeof bookmarkPoemSchema> | null = null; // Declare body outside try block
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    body = await req.json();
    const validatedData = bookmarkPoemSchema.parse(body);

    const poem = await Poem.findById(validatedData.poemId);
    if (!poem) {
      return NextResponse.json({ message: "Poem not found" }, { status: 404 });
    }

    const user = await User.findById(validatedData.userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (validatedData.userId !== session.user.id && user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden: Cannot bookmark for another user" }, { status: 403 });
    }

    if (validatedData.action === "add") {
      if (
        !poem.bookmarks.some((b) => b.userId.toString() === validatedData.userId) &&
        !user.bookmarks.some((b) => b.poemId.toString() === validatedData.poemId)
      ) {
        poem.bookmarks.push({ userId: validatedData.userId, bookmarkedAt: new Date() });
        poem.bookmarkCount = poem.bookmarks.length; // Sync count
        await poem.save();

        await User.updateOne(
          { _id: validatedData.userId },
          { $push: { bookmarks: { poemId: validatedData.poemId, bookmarkedAt: new Date() } } }
        );
        return NextResponse.json({ message: "Poem bookmarked successfully", poem });
      }
      return NextResponse.json({ message: "Poem already bookmarked" }, { status: 400 });
    } else {
      if (poem.bookmarks.some((b) => b.userId.toString() === validatedData.userId)) {
        poem.bookmarks = poem.bookmarks.filter((b) => b.userId.toString() !== validatedData.userId);
        poem.bookmarkCount = Math.max(0, poem.bookmarks.length); // Prevent negative count
        await poem.save();

        await User.updateOne(
          { _id: validatedData.userId },
          { $pull: { bookmarks: { poemId: validatedData.poemId } } }
        );
        return NextResponse.json({ message: "Poem unbookmarked successfully", poem });
      }
      return NextResponse.json({ message: "Poem not bookmarked by user" }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error("Bookmark error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      poemId: body?.poemId ?? "unknown",
      userId: body?.userId ?? "unknown",
      action: body?.action ?? "unknown",
    });
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Author from "@/models/Author";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get("target");
    const type = searchParams.get("type"); // author
    const listType = searchParams.get("listType"); // followers or following

    if (!target) {
      return NextResponse.json({ error: "Target is required" }, { status: 400 });
    }

    if (type === "user" && listType === "following") {
      const user = await User.findById(target).populate(
        "following.authorId",
        "name image slug"
      );
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        following: user.following
          .filter((f: any) => f.authorId) // Ensure authorId exists
          .map((f: any) => ({
            id: f.authorId._id,
            slug: f.authorId.slug,
            name: f.authorId.name,
            image: f.authorId.image,
            followedAt: f.followedAt,
          })),
      });
    } else if (type === "author" && listType === "followers") {
      const isObjectId = mongoose.Types.ObjectId.isValid(target);
      const author = isObjectId
        ? await Author.findById(target)
        : await Author.findOne({ slug: target });

      if (!author) {
        return NextResponse.json({ error: "Author not found" }, { status: 404 });
      }

      await author.populate("followers.userId", "name image");

      return NextResponse.json({
        followers: author.followers.map((f: any) => ({
          id: f.userId._id,
          name: f.userId.name,
          image: f.userId.image,
          followedAt: f.followedAt,
        })),
      });
    }

    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching follow lists:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
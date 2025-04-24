// src/app/api/authors/[id]/follow/route.ts
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Author from "@/models/Author";
import User from "@/models/User";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    let author = isObjectId ? await Author.findById(id) : await Author.findOne({ slug: id });

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const isFollowing = author.followers.some((f: any) => f.userId.equals(userId));

    if (isFollowing) {
      // Unfollow: Remove user from followers and decrement count
      author.followers = author.followers.filter((f: any) => !f.userId.equals(userId));
      author.followerCount = Math.max(0, author.followerCount - 1);
    } else {
      // Follow: Add user to followers and increment count
      author.followers.push({ userId });
      author.followerCount += 1;
    }

    await author.save();

    return NextResponse.json({
      message: isFollowing ? "Unfollowed successfully" : "Followed successfully",
      followerCount: author.followerCount,
      isFollowing: !isFollowing,
    });
  } catch (error) {
    console.error("Error toggling follow:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
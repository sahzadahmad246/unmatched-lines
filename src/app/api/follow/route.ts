import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Author from "@/models/Author";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const { target, type } = await request.json();

    if (!target) {
      return NextResponse.json({ error: "Target is required" }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (type === "author") {
      const isObjectId = mongoose.Types.ObjectId.isValid(target);
      const targetAuthor = isObjectId
        ? await Author.findById(target)
        : await Author.findOne({ slug: target });

      if (!targetAuthor) {
        return NextResponse.json({ error: "Target author not found" }, { status: 404 });
      }

      // Check if already following
      if (user.following.some((f: any) => f.authorId?.toString() === targetAuthor._id.toString())) {
        return NextResponse.json({ error: "Already following" }, { status: 400 });
      }

      // Update user
      await User.findByIdAndUpdate(session.user.id, {
        $push: { following: { authorId: targetAuthor._id } },
        $inc: { followingCount: 1 },
      });

      // Update author
      const authorUpdate = await Author.findByIdAndUpdate(
        targetAuthor._id,
        {
          $push: { followers: { userId: session.user.id } },
          $inc: { followerCount: 1 },
        },
        { new: true } // Return updated document
      );

      if (!authorUpdate) {
       
        return NextResponse.json({ error: "Failed to update author" }, { status: 500 });
      }

     

      return NextResponse.json({ message: "Followed successfully" });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error following:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const { target, type } = await request.json();

    if (!target) {
      return NextResponse.json({ error: "Target is required" }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (type === "author") {
      const isObjectId = mongoose.Types.ObjectId.isValid(target);
      const targetAuthor = isObjectId
        ? await Author.findById(target)
        : await Author.findOne({ slug: target });

      if (!targetAuthor) {
        return NextResponse.json({ error: "Target author not found" }, { status: 404 });
      }

      // Update user
      await User.findByIdAndUpdate(session.user.id, {
        $pull: { following: { authorId: targetAuthor._id } },
        $inc: { followingCount: -1 },
      });

      // Update author
      const authorUpdate = await Author.findByIdAndUpdate(
        targetAuthor._id,
        {
          $pull: { followers: { userId: session.user.id } },
          $inc: { followerCount: -1 },
        },
        { new: true } // Return updated document
      );

      if (!authorUpdate) {
        console.error(`Failed to update followerCount for author ${targetAuthor._id}`);
        return NextResponse.json({ error: "Failed to update author" }, { status: 500 });
      }

      console.log(`Updated author ${targetAuthor._id}: followerCount=${authorUpdate.followerCount}`);

      return NextResponse.json({ message: "Unfollowed successfully" });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error unfollowing:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
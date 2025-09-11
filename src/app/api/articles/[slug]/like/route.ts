import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import { Types } from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { slug } = await params;

    const article = await Article.findOne({ slug });
    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const existingLikeIndex = article.likes?.findIndex(
      (like: { userId: { toString: () => string } }) => like.userId.toString() === userId
    ) ?? -1;

    if (existingLikeIndex > -1) {
      // Unlike: remove the like
      article.likes?.splice(existingLikeIndex, 1);
      article.likeCount = article.likes?.length || 0;
      await article.save();
      
      return NextResponse.json({ 
        message: "Article unliked", 
        isLiked: false,
        likeCount: article.likeCount 
      });
    } else {
      // Like: add the like
      if (!article.likes) article.likes = [];
      article.likes.push({ userId: new Types.ObjectId(userId), likedAt: new Date() });
      article.likeCount = article.likes.length;
      await article.save();
      
      return NextResponse.json({ 
        message: "Article liked", 
        isLiked: true,
        likeCount: article.likeCount 
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { slug } = await params;

    const article = await Article.findOne({ slug }).select("likes likeCount");
    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const isLiked = article.likes?.some(
      (like: { userId: { toString: () => string } }) => like.userId.toString() === userId
    ) || false;

    return NextResponse.json({ 
      isLiked,
      likeCount: article.likeCount 
    });
  } catch (error) {
    console.error("Error checking like status:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}

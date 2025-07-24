import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/auth/authOptions";
import mongoose from "mongoose";
export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (params.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: User ID mismatch" }, { status: 403 });
    }

    if (!/^[0-9a-fA-F]{24}$/.test(params.userId)) {
      return NextResponse.json({ message: "Invalid userId" }, { status: 400 });
    }

    const user = await User.findById(params.userId).select("bookmarkedArticles");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      bookmarkedArticles: user.bookmarkedArticles.map((b: { articleId: mongoose.Types.ObjectId }) => ({
        articleId: b.articleId.toString(),
      })),
    });
  } catch (error) {
    console.error("Fetch bookmarks error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
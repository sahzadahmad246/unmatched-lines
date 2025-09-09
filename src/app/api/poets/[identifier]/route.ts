import { NextResponse, NextRequest } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Article from "@/models/Article";
import { IPoet } from "@/types/userTypes";

export async function GET(req: NextRequest, { params }: { params: Promise<{ identifier: string }> }) {
  try {
    await dbConnect();

    const { identifier } = await params;

    const isValidObjectId = mongoose.Types.ObjectId.isValid(identifier);
    const query = isValidObjectId
      ? { $or: [{ _id: identifier }, { slug: identifier }], role: "poet" }
      : { slug: identifier, role: "poet" };

    const user = await User.findOne(query).lean();

    if (!user) {
      return NextResponse.json({ error: "Poet not found" }, { status: 404 });
    }

    // Calculate total bookmarks on articles written by this poet
    const totalBookmarksOnArticles = await Article.aggregate([
      { $match: { poet: new mongoose.Types.ObjectId(user._id) } },
      { $group: { _id: null, totalBookmarks: { $sum: "$bookmarkCount" } } }
    ]);

    const totalBookmarks = totalBookmarksOnArticles.length > 0 ? totalBookmarksOnArticles[0].totalBookmarks : 0;

    // Calculate total views on articles written by this poet
    const totalViewsOnArticles = await Article.aggregate([
      { $match: { poet: new mongoose.Types.ObjectId(user._id) } },
      { $group: { _id: null, totalViews: { $sum: "$viewsCount" } } }
    ]);

    const totalViews = totalViewsOnArticles.length > 0 ? totalViewsOnArticles[0].totalViews : 0;

    // Calculate total published articles authored by this poet
    const computedArticleCount = await Article.countDocuments({ poet: user._id, status: "published" });

    const poetResponse: IPoet = {
      ...user,
      _id: user._id.toString(),
      role: "poet",
      dob: user.dob ? new Date(user.dob).toISOString() : undefined,
      createdAt: new Date(user.createdAt).toISOString(),
      updatedAt: new Date(user.updatedAt).toISOString(),
      bookmarks: user.bookmarks?.length
        ? user.bookmarks.map((bookmark) => ({
            poemId: bookmark.poemId?.toString() || "",
            bookmarkedAt: bookmark.bookmarkedAt
              ? new Date(bookmark.bookmarkedAt).toISOString()
              : null, // Changed to null to match IPoet
            poem: bookmark.poem || null,
          }))
        : [],
      poems: user.poems?.length
        ? user.poems.map((poem) => ({
            poemId: poem.poemId?.toString() || "",
          }))
        : [],
      articles: user.articles?.length
        ? user.articles.map((article) => ({
            articleId: article.articleId?.toString() || "", // Convert ObjectId to string
          }))
        : [],
      // Override with computed article count to ensure accuracy
      articleCount: computedArticleCount || 0,
      bookmarkedArticles: user.bookmarkedArticles?.length
        ? user.bookmarkedArticles.map((bookmark) => ({
            articleId: bookmark.articleId?.toString() || "", // Convert ObjectId to string
            bookmarkedAt: bookmark.bookmarkedAt
              ? new Date(bookmark.bookmarkedAt).toISOString()
              : null, // Changed to null to match IPoet
            article: bookmark.article || null,
          }))
        : [],
      // Add total bookmarks on articles by this poet
      totalBookmarksOnArticles: totalBookmarks,
      // Add total views on articles by this poet
      totalViewsOnArticles: totalViews,
    };

    return NextResponse.json(poetResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: `Internal server error: ${errorMessage}` }, { status: 500 });
  }
}
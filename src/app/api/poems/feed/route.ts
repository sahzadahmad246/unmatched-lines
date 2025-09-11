// src/app/api/poems/feed/route.ts
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import { TransformedArticle } from "@/types/articleTypes";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    // Count total published articles for pagination
    const totalArticles = await Article.countDocuments({ status: "published" });

    // Fetch articles with pagination and populate poet details
    const articles = await Article.find({ status: "published" })
      .select("title couplets slug bookmarkCount likeCount viewsCount category poet coverImage publishedAt createdAt updatedAt")
      .populate<{
        poet: { _id: string; name: string; profilePicture?: { url?: string } | null };
      }>("poet", "name profilePicture")
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform articles to match ArticleCard props
    const transformedArticles: TransformedArticle[] = articles.map((article) => {
      // Get first English couplet
      const firstCouplet = article.couplets?.[0]?.en || "";

      return {
        _id: article._id.toString(),
        title: article.title,
        firstCoupletEn: firstCouplet,
        poet: {
          _id: article.poet?._id.toString() || "",
          name: article.poet?.name || "Unknown",
          profilePicture: article.poet?.profilePicture?.url || null,
        },
        slug: article.slug,
        bookmarkCount: article.bookmarkCount || 0,
        likeCount: article.likeCount || 0,
        viewsCount: article.viewsCount || 0,
        category: article.category || [],
        coverImage: article.coverImage?.url || null,
        publishedAt: article.publishedAt ? new Date(article.publishedAt).toISOString() : null,
        createdAt: article.createdAt ? new Date(article.createdAt).toISOString() : null,
        updatedAt: article.updatedAt ? new Date(article.updatedAt).toISOString() : null,
        isBookmarked: false, // No personalization, set to false
      };
    });

    return NextResponse.json({
      articles: transformedArticles,
      pagination: {
        total: totalArticles,
        page,
        limit,
        totalPages: Math.ceil(totalArticles / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
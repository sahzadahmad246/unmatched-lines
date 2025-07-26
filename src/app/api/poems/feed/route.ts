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

    // Count total published articles for pagination
    const totalArticles = await Article.countDocuments({ status: "published" });

    // Fetch random articles using aggregation
    const articles = await Article.aggregate([
      { $match: { status: "published" } },
      { $sample: { size: limit } }, // Randomly select 'limit' articles
      {
        $lookup: {
          from: "users",
          localField: "poet",
          foreignField: "_id",
          as: "poet",
        },
      },
      { $unwind: "$poet" },
      {
        $project: {
          title: 1,
          couplets: 1,
          slug: 1,
          bookmarkCount: 1,
          viewsCount: 1,
          category: 1,
          coverImage: 1,
          publishedAt: 1,
          createdAt: 1,
          updatedAt: 1,
          "poet._id": 1,
          "poet.name": 1,
          "poet.profilePicture": 1,
        },
      },
    ]);

    // Transform articles to match ArticleCard props
    const transformedArticles: TransformedArticle[] = articles.map((article) => {
      // Filter English couplets and select a random one
      const englishCouplets = article.couplets?.filter((c: { en?: string }) => c.en) || [];
      const randomCouplet = englishCouplets.length > 0
        ? englishCouplets[Math.floor(Math.random() * englishCouplets.length)].en
        : "";

      return {
        _id: article._id.toString(),
        title: article.title,
        firstCoupletEn: randomCouplet, // Random English couplet
        poet: {
          _id: article.poet?._id.toString() || "",
          name: article.poet?.name || "Unknown",
          profilePicture: article.poet?.profilePicture?.url || null,
        },
        slug: article.slug,
        bookmarkCount: article.bookmarkCount || 0,
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
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import User from "@/models/User";
import { TransformedArticle } from "@/types/articleTypes";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const poetSlug = searchParams.get("poet");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "5"); // Default to 5 articles
    const skip = (page - 1) * limit;

    if (!poetSlug) {
      return NextResponse.json(
        { message: "Poet slug is required" },
        { status: 400 }
      );
    }

    // Find the poet by slug
    const poet = await User.findOne({ slug: poetSlug }).select("_id").lean();
    if (!poet) {
      return NextResponse.json(
        { message: "Poet not found" },
        { status: 404 }
      );
    }

    // Fetch articles by poet
    const articles = await Article.find({ 
      status: "published",
      poet: poet._id
    })
      .select("title couplets slug bookmarkCount likeCount viewsCount category poet coverImage publishedAt createdAt updatedAt")
      .populate<{ poet: { _id: string; name: string; profilePicture?: { url?: string } | null } }>(
        "poet",
        "name profilePicture"
      )
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform articles to match ArticleCard props
    const transformedArticles: TransformedArticle[] = articles.map((article) => ({
      _id: article._id.toString(),
      title: article.title,
      firstCoupletEn: article.couplets?.[0]?.en || "",
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
      publishedAt: article.publishedAt?.toISOString() || null,
      createdAt: article.createdAt?.toISOString() || null,
      updatedAt: article.updatedAt?.toISOString() || null,
      isBookmarked: false, // Initial value, updated client-side
      isLiked: false,
    }));

    const totalArticles = await Article.countDocuments({ 
      status: "published",
      poet: poet._id
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
    console.error("Error fetching articles by poet:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
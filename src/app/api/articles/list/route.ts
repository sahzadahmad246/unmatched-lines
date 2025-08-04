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
    const query = searchParams.get("query") || "";
    const sortBy = searchParams.get("sortBy") || "";
    const ids = searchParams.get("ids")?.split(",") || [];
    const skip = (page - 1) * limit;

    // Build query
    const findQuery: Record<string, unknown> = { status: "published" };
    if (query) {
      findQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { "poet.name": { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ];
    }
    if (ids.length > 0) {
      findQuery._id = { $in: ids };
    }

    // Build sort options
    const sortOptions: Record<string, 1 | -1> = sortBy === "viewsCount" ? { viewsCount: -1 } : { createdAt: -1 };

    // Fetch articles with pagination and populate poet details
    const articles = await Article.find(findQuery)
      .select("title couplets slug bookmarkCount viewsCount category poet coverImage publishedAt createdAt updatedAt")
      .populate<{
        poet: { _id: string; name: string; profilePicture?: { url?: string } | null };
      }>("poet", "name profilePicture")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform articles
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
      viewsCount: article.viewsCount || 0,
      category: article.category || [],
      coverImage: article.coverImage?.url || null,
      publishedAt: article.publishedAt?.toISOString() || null,
      createdAt: article.createdAt?.toISOString() || null,
      updatedAt: article.updatedAt?.toISOString() || null,
      isBookmarked: false, // Bookmark status is checked client-side
    }));

    const totalArticles = await Article.countDocuments(findQuery);

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
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
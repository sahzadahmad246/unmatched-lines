import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "100");
    const query = searchParams.get("query") || "";
    const status = searchParams.get("status") || "all";
    const category = searchParams.get("category") || "all";
    const skip = (page - 1) * limit;

    // Build query - no status filter for admin
    const findQuery: Record<string, unknown> = {};
    
    if (query) {
      findQuery.$or = [
        { title: { $regex: query, $options: "i" } },
        { "poet.name": { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ];
    }
    
    if (status !== "all") {
      findQuery.status = status;
    }
    
    if (category !== "all") {
      findQuery.category = { $in: [category] };
    }

    // Fetch articles with pagination and populate poet details
    const articles = await Article.find(findQuery)
      .select("title content slug summary metaDescription metaKeywords status category tags poet coverImage bookmarkCount viewsCount publishedAt createdAt updatedAt")
      .populate<{
        poet: { _id: string; name: string; profilePicture?: { url?: string } | null };
      }>("poet", "name profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform articles for admin view
    const transformedArticles = articles.map((article) => ({
      _id: article._id.toString(),
      title: article.title,
      content: article.content,
      slug: article.slug,
      summary: article.summary,
      metaDescription: article.metaDescription,
      metaKeywords: article.metaKeywords,
      status: article.status,
      category: article.category || [],
      tags: article.tags || [],
      poet: {
        _id: article.poet?._id.toString() || "",
        name: article.poet?.name || "Unknown",
        profilePicture: article.poet?.profilePicture?.url || null,
      },
      coverImage: article.coverImage?.url || null,
      bookmarkCount: article.bookmarkCount || 0,
      viewsCount: article.viewsCount || 0,
      publishedAt: article.publishedAt?.toISOString() || null,
      createdAt: article.createdAt?.toISOString() || null,
      updatedAt: article.updatedAt?.toISOString() || null,
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
    console.error("Error fetching admin articles:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

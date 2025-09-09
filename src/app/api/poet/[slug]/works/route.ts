import { type NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import User from "@/models/User";
import { IArticle } from "@/types/articleTypes";
import { FilterQuery } from "mongoose";
import { logger } from "@/lib/logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "all";
  const page = Number.parseInt(searchParams.get("page") || "1");
  let limit = Number.parseInt(searchParams.get("limit") || "20");
  const sortBy = searchParams.get("sortBy") || "recent"; // recent, top, views, bookmarks

  try {
    await dbConnect();

    // For top-20 queries, limit to 20 items per page
    if (category.startsWith("top-20")) {
      limit = Math.min(limit, 20);
    }

    // Find poet by slug
    const poet = await User.findOne({ slug }).select("_id name");
    if (!poet) {
      return NextResponse.json({ error: "Poet not found" }, { status: 404 });
    }

    // Debug: Check what categories exist for this poet
    const allPoetArticles = await Article.find({ poet: poet._id, status: "published" }).select("category title").lean();
    const allCategories = allPoetArticles.flatMap(a => a.category || []);
    const uniqueCategories = [...new Set(allCategories)];
    logger.info("Available categories for poet", {
      slug,
      poetId: poet._id,
      allCategories: uniqueCategories,
      totalArticles: allPoetArticles.length,
      sampleArticles: allPoetArticles.slice(0, 3).map(a => ({ title: a.title, categories: a.category }))
    });

    // Build query
    let query: FilterQuery<IArticle> = {
      poet: poet._id,
      status: "published",
    };

    // Add category filter with proper logic
    if (category !== "all") {
      if (category === "top-20") {
        // Top 20 across all categories - no category filter, sorting will handle
        query = { ...query };
      } else if (category.startsWith("top-20-")) {
        // Top 20 of specific category (e.g., top-20-ghazal, top-20-sher)
        const specificCategory = category.replace("top-20-", "");
        query.category = { $in: [specificCategory, specificCategory.charAt(0).toUpperCase() + specificCategory.slice(1)] };
      } else {
        // Regular category filter (ghazal, sher, nazm, etc.)
        // Handle case-insensitive category matching
        query.category = { $in: [category, category.charAt(0).toUpperCase() + category.slice(1)] };
      }
    }

    // Debug logging
    logger.info("Poet works query", {
      slug,
      category,
      query: JSON.stringify(query),
      sortBy,
      poetId: poet._id
    });

    // Test query for debugging
    if (category === "sher") {
      const testQuery = { poet: poet._id, status: "published", category: { $in: ["sher"] } };
      const testResults = await Article.find(testQuery).select("title category").lean();
      logger.info("Test sher query results", {
        testQuery: JSON.stringify(testQuery),
        testResults: testResults.map(r => ({ title: r.title, categories: r.category }))
      });
    }

    // Build sort criteria with proper logic for top-20 queries
    let sortCriteria: { [key: string]: 1 | -1 } = {};
    if (category.startsWith("top-20")) {
      // For top-20 queries, always sort by views first, then bookmarks, then date
      sortCriteria = { 
        viewsCount: -1, 
        bookmarkCount: -1, 
        createdAt: -1 
      };
    } else if (sortBy === "top") {
      // For regular "top" sorting
      sortCriteria = { 
        viewsCount: -1, 
        bookmarkCount: -1, 
        createdAt: -1 
      };
    } else if (sortBy === "views") {
      sortCriteria = { viewsCount: -1, createdAt: -1 };
    } else if (sortBy === "bookmarks") {
      sortCriteria = { bookmarkCount: -1, createdAt: -1 };
    } else {
      // Default: recent first
      sortCriteria = { createdAt: -1 };
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Fetch articles with pagination
    const articles = await Article.find(query)
      .populate("poet", "name slug profilePicture")
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Article.countDocuments(query);
    const pages = Math.ceil(total / limit);

    // Debug logging for results
    logger.info("Poet works results", {
      slug,
      category,
      articlesFound: articles.length,
      total,
      pages,
      sampleCategories: articles.slice(0, 3).map(a => ({ id: a._id, categories: a.category }))
    });

    // Transform articles for client consumption
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformedArticles = articles.map((article: any) => ({
      _id: article._id.toString(),
      title: article.title,
      firstCoupletEn: article.couplets?.[0]?.en || "",
      poet: article.poet
        ? {
            _id: article.poet._id?.toString?.() || "",
            name: article.poet.name || "Unknown",
            profilePicture: article.poet.profilePicture?.url || null,
          }
        : { _id: "", name: "Unknown", profilePicture: null },
      slug: article.slug || "",
      bookmarkCount: article.bookmarkCount || 0,
      viewsCount: article.viewsCount || 0,
      category: article.category || [],
      coverImage: article.coverImage?.url || null,
      publishedAt: article.publishedAt?.toISOString?.() || null,
      createdAt: article.createdAt?.toISOString?.() || null,
      updatedAt: article.updatedAt?.toISOString?.() || null,
      isBookmarked: false,
    }));

    return NextResponse.json({
      articles: transformedArticles,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
      category,
      sortBy,
    });
  } catch (error) {
    logger.error("Error fetching poet works", error instanceof Error ? error : undefined, {
      slug: slug,
      category: category,
      page: page,
      sortBy: sortBy,
      endpoint: "GET /api/poet/[slug]/works"
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
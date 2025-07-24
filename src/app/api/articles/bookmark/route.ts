import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import mongoose, { Types } from "mongoose";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import { TransformedArticle } from "@/types/articleTypes";
import User from "@/models/User";
import { authOptions } from "@/lib/auth/authOptions";

// Define validation schema for bookmarking articles (non-exported)
const bookmarkArticleSchema = z.object({
  articleId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Article ID"),
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid User ID"),
  action: z.enum(["add", "remove", "check"]),
});

// Interface for bookmark entries in Article
interface Bookmark {
  userId: mongoose.Types.ObjectId;
  bookmarkedAt?: Date;
}

// Interface for the populated poet field
interface PopulatedPoet {
  _id: Types.ObjectId;
  name: string;
  profilePicture?: { url?: string } | null;
}

// Interface for user's bookmarkedArticles field
interface UserBookmark {
  articleId: mongoose.Types.ObjectId;
  bookmarkedAt: Date | null;
  article?: {
    title: string;
    slug: string;
    viewsCount: number;
    authorName: string;
  } | null;
}

export async function POST(req: NextRequest) {
  let body: z.infer<typeof bookmarkArticleSchema> | null = null;
  try {
    await dbConnect();

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    body = await req.json();
    const validatedData = bookmarkArticleSchema.parse(body);

    // Ensure userId matches session
    if (validatedData.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden: User ID mismatch" }, { status: 403 });
    }

    // Fetch article with relevant fields and populated poet
    const article = await Article.findById(validatedData.articleId)
      .select("title slug poet category bookmarkCount bookmarks viewsCount publishedAt createdAt updatedAt couplets coverImage")
      .populate<{ poet: PopulatedPoet }>("poet", "name profilePicture");

    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 });
    }

    // Initialize bookmarks if undefined
    if (!article.bookmarks) {
      article.bookmarks = [];
    }

    // Fetch user
    const user = await User.findById(validatedData.userId).select("bookmarkedArticles");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Check current bookmark status
    const isBookmarked =
      article.bookmarks.some((b: Bookmark) => b.userId.toString() === validatedData.userId) ||
      user.bookmarkedArticles.some((b: UserBookmark) => b.articleId.toString() === validatedData.articleId);

    if (validatedData.action === "check") {
      // Transform article for response
      const transformedArticle: TransformedArticle = {
        _id: article._id.toString(),
        title: article.title,
        firstCoupletEn: article.couplets?.[0]?.en || "",
        poet: {
          _id: article.poet._id.toString(),
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
        isBookmarked,
      };
      return NextResponse.json({
        message: "Bookmark status checked",
        article: transformedArticle,
        isBookmarked,
      });
    }

    if (validatedData.action === "add") {
      if (!isBookmarked) {
        // Add bookmark to article
        article.bookmarks.push({
          userId: new mongoose.Types.ObjectId(validatedData.userId),
          bookmarkedAt: new Date(),
        });
        article.bookmarkCount = article.bookmarks.length;
        await article.save();

        // Add bookmark to user (ensure no duplicates)
        if (!user.bookmarkedArticles.some((b: UserBookmark) => b.articleId.toString() === validatedData.articleId)) {
          await User.updateOne(
            { _id: validatedData.userId },
            {
              $push: {
                bookmarkedArticles: {
                  articleId: validatedData.articleId,
                  bookmarkedAt: new Date(),
                  article: {
                    title: article.title,
                    slug: article.slug,
                    viewsCount: article.viewsCount || 0,
                    authorName: article.poet?.name || "Unknown",
                  },
                },
              },
            }
          );
        }

        // Transform article for response
        const transformedArticle: TransformedArticle = {
          _id: article._id.toString(),
          title: article.title,
          firstCoupletEn: article.couplets?.[0]?.en || "",
          poet: {
            _id: article.poet._id.toString(),
            name: article.poet?.name || "Unknown",
            profilePicture: article.poet?.profilePicture?.url || null,
          },
          slug: article.slug,
          bookmarkCount: article.bookmarkCount,
          viewsCount: article.viewsCount || 0,
          category: article.category || [],
          coverImage: article.coverImage?.url || null,
          publishedAt: article.publishedAt?.toISOString() || null,
          createdAt: article.createdAt?.toISOString() || null,
          updatedAt: article.updatedAt?.toISOString() || null,
          isBookmarked: true,
        };

        return NextResponse.json({
          message: "Article bookmarked successfully",
          article: transformedArticle,
          isBookmarked: true,
        });
      }
      return NextResponse.json({ message: "Article already bookmarked", isBookmarked: true }, { status: 400 });
    } else {
      if (isBookmarked) {
        // Remove bookmark from article
        article.bookmarks = article.bookmarks.filter(
          (b: Bookmark) => b.userId.toString() !== validatedData.userId
        );
        article.bookmarkCount = Math.max(0, article.bookmarks.length);
        await article.save();

        // Remove bookmark from user
        await User.updateOne(
          { _id: validatedData.userId },
          { $pull: { bookmarkedArticles: { articleId: validatedData.articleId } } }
        );

        // Transform article for response
        const transformedArticle: TransformedArticle = {
          _id: article._id.toString(),
          title: article.title,
          firstCoupletEn: article.couplets?.[0]?.en || "",
          poet: {
            _id: article.poet._id.toString(),
            name: article.poet?.name || "Unknown",
            profilePicture: article.poet?.profilePicture?.url || null,
          },
          slug: article.slug,
          bookmarkCount: article.bookmarkCount,
          viewsCount: article.viewsCount || 0,
          category: article.category || [],
          coverImage: article.coverImage?.url || null,
          publishedAt: article.publishedAt?.toISOString() || null,
          createdAt: article.createdAt?.toISOString() || null,
          updatedAt: article.updatedAt?.toISOString() || null,
          isBookmarked: false,
        };

        return NextResponse.json({
          message: "Article unbookmarked successfully",
          article: transformedArticle,
          isBookmarked: false,
        });
      }
      return NextResponse.json({ message: "Article not bookmarked by user", isBookmarked: false }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error("Bookmark error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      articleId: body?.articleId ?? "unknown",
      userId: body?.userId ?? "unknown",
      action: body?.action ?? "unknown",
    });
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.errors }, { status: 400 });
    }
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json({ message: `Invalid ID format: ${error.message}` }, { status: 400 });
    }
    return NextResponse.json(
      {
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
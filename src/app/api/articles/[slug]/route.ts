import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import User from "@/models/User";
import { authOptions } from "@/lib/auth/authOptions";
import { z } from "zod";
import { updateArticleSchema, UpdateArticleSchema } from "@/validators/articleValidator";
import { configureCloudinary, uploadImageStream, deleteImage } from "@/lib/utils/cloudinary";
import { Types } from "mongoose";
import { IArticle } from "@/types/articleTypes";
// Define interface for populated poet
interface PopulatedPoet {
  _id: string;
  name: string;
  profilePicture?: {
    publicId?: string;
    url?: string;
  };
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json({ message: "Invalid slug" }, { status: 400 });
    }

    const article = await Article.findOne({ slug }) // Remove status: "published" filter
      .select(
        "title content couplets summary poet slug coverImage category tags bookmarkCount viewsCount metaDescription metaKeywords status publishedAt createdAt updatedAt"
      )
      .populate<{ poet: PopulatedPoet }>("poet", "name profilePicture")
      .lean();

    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 });
    }

    await Article.updateOne({ _id: article._id }, { $inc: { viewsCount: 1 } });

    const transformedArticle = {
      _id: article._id.toString(),
      title: article.title,
      content: article.content,
      couplets: article.couplets || [],
      summary: article.summary || "",
      poet: {
        _id: article.poet?._id?.toString() || "", // Include poet._id
        name: article.poet?.name || "Unknown",
        profilePicture: article.poet?.profilePicture?.url || null,
      },
      poetId: article.poet?._id?.toString() || "", // Add poetId for form
      slug: article.slug,
      coverImage: article.coverImage?.url || null,
      category: article.category || [],
      tags: article.tags || [],
      bookmarkCount: article.bookmarkCount,
      viewsCount: article.viewsCount + 1,
      metaDescription: article.metaDescription || "",
      metaKeywords: article.metaKeywords || "",
      status: article.status || "draft", // Include status
      publishedAt: article.publishedAt || null,
      createdAt: article.createdAt || null,
      updatedAt: article.updatedAt || null,
    };

    return NextResponse.json(transformedArticle);
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await User.findById(session.user.id);
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "poet")) {
      return NextResponse.json(
        { message: "Forbidden: Only authorized roles (admin, poet) can update articles." },
        { status: 403 }
      );
    }

    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ message: "Invalid slug" }, { status: 400 });
    }

    const existingArticle = await Article.findOne({ slug });
    if (!existingArticle) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const articleData: Partial<UpdateArticleSchema> = {};

    articleData.title = formData.get("title")?.toString();
    articleData.content = formData.get("content")?.toString();
    articleData.slug = formData.get("slug")?.toString();
    articleData.summary = formData.get("summary")?.toString();
    articleData.metaDescription = formData.get("metaDescription")?.toString();
    articleData.metaKeywords = formData.get("metaKeywords")?.toString();
    articleData.status = formData.get("status")?.toString() as "draft" | "published";
    articleData.poetId = formData.get("poetId")?.toString();
    articleData.removeCoverImage = formData.get("removeCoverImage") === "true" || undefined;

    const parseJsonField = (key: string) => {
      const value = formData.get(key);
      if (typeof value === "string" && value) {
        try {
          return JSON.parse(value);
        } catch (e) {
          console.error(`Error parsing JSON for field ${key}:`, e);
          throw new Error(`Invalid JSON format for ${key}.`);
        }
      }
      return undefined;
    };

    articleData.couplets = parseJsonField("couplets");
    articleData.category = parseJsonField("category");
    articleData.tags = parseJsonField("tags");

    const validationResult = updateArticleSchema.safeParse(articleData);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Validation error", errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    let poetObjectId: Types.ObjectId | undefined;
    if (validatedData.poetId) {
      if (!Types.ObjectId.isValid(validatedData.poetId)) {
        return NextResponse.json({ message: "Invalid poet ID format." }, { status: 400 });
      }
      const selectedPoet = await User.findById(validatedData.poetId);
      if (!selectedPoet) {
        return NextResponse.json({ message: "Selected poet not found." }, { status: 404 });
      }
      if (selectedPoet.role !== "poet" && selectedPoet.role !== "admin") {
        return NextResponse.json(
          { message: "Selected user is not a recognized poet or admin." },
          { status: 400 }
        );
      }
      poetObjectId = new Types.ObjectId(validatedData.poetId);
    }

    if (validatedData.slug && validatedData.slug !== slug) {
      const slugExists = await Article.findOne({ slug: validatedData.slug });
      if (slugExists) {
        return NextResponse.json(
          { message: `Article with slug '${validatedData.slug}' already exists.` },
          { status: 409 }
        );
      }
    }

    let coverImage = existingArticle.coverImage;
    if (validatedData.removeCoverImage && existingArticle.coverImage?.publicId) {
      configureCloudinary();
      await deleteImage(existingArticle.coverImage.publicId);
      coverImage = undefined;
    }

    const imageFile = formData.get("coverImage");
    if (imageFile instanceof File) {
      configureCloudinary();
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const { publicId, url } = await uploadImageStream(buffer, "unmatchedlines/articles");
      if (existingArticle.coverImage?.publicId) {
        await deleteImage(existingArticle.coverImage.publicId);
      }
      coverImage = { publicId, url };
    }

    const updateData: Partial<IArticle> = {
      title: validatedData.title || existingArticle.title,
      content: validatedData.content || existingArticle.content,
      slug: validatedData.slug || existingArticle.slug,
      summary: validatedData.summary !== undefined ? validatedData.summary : existingArticle.summary,
      metaDescription:
        validatedData.metaDescription !== undefined
          ? validatedData.metaDescription
          : existingArticle.metaDescription,
      metaKeywords:
        validatedData.metaKeywords !== undefined
          ? validatedData.metaKeywords
          : existingArticle.metaKeywords,
      status: validatedData.status || existingArticle.status,
      poet: poetObjectId || existingArticle.poet,
      couplets: validatedData.couplets !== undefined ? validatedData.couplets : existingArticle.couplets,
      category: validatedData.category !== undefined ? validatedData.category : existingArticle.category,
      tags: validatedData.tags !== undefined ? validatedData.tags : existingArticle.tags,
      coverImage,
      updatedAt: new Date(),
    };

    if (validatedData.status === "published" && existingArticle.status !== "published") {
      updateData.publishedAt = new Date();
    }

    const updatedArticle = await Article.findOneAndUpdate(
      { slug },
      { $set: updateData },
      { new: true }
    );

    if (!updatedArticle) {
      return NextResponse.json({ message: "Failed to update article" }, { status: 500 });
    }

    if (poetObjectId && poetObjectId.toString() !== existingArticle.poet.toString()) {
      await User.findByIdAndUpdate(existingArticle.poet, {
        $pull: { articles: { articleId: existingArticle._id } },
        $inc: { articleCount: -1 },
      });
      await User.findByIdAndUpdate(poetObjectId, {
        $push: { articles: { articleId: updatedArticle._id } },
        $inc: { articleCount: 1 },
      });
    }

    return NextResponse.json({
      message: "Article updated successfully",
      articleId: updatedArticle._id,
      slug: updatedArticle.slug,
    });
  } catch (error: unknown) {
    console.error("Error updating article:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation failed", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Failed to update article", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await User.findById(session.user.id);
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "poet")) {
      return NextResponse.json(
        { message: "Forbidden: Only authorized roles (admin, poet) can delete articles." },
        { status: 403 }
      );
    }

    const { slug } = await context.params;
    if (!slug) {
      return NextResponse.json({ message: "Invalid slug" }, { status: 400 });
    }

    const article = await Article.findOne({ slug });
    if (!article) {
      return NextResponse.json({ message: "Article not found" }, { status: 404 });
    }

    if (article.coverImage?.publicId) {
      configureCloudinary();
      await deleteImage(article.coverImage.publicId);
    }

    await User.findByIdAndUpdate(article.poet, {
      $pull: { articles: { articleId: article._id } },
      $inc: { articleCount: -1 },
    });

    await Article.deleteOne({ slug });

    return NextResponse.json({ message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { message: "Failed to delete article", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
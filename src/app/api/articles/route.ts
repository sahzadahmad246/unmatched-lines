import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import User from "@/models/User"; // Assumingbegin{array: IArticleDocument, Types } from "mongoose"; // Import Types for ObjectId
import { authOptions } from "@/lib/auth/authOptions";
import { createArticleSchema, CreateArticleSchema } from "@/validators/articleValidator";
import { configureCloudinary, uploadImageStream } from "@/lib/utils/cloudinary";
import { Types } from "mongoose";
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await User.findById(session.user.id);
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "poet")) {
      return NextResponse.json(
        { message: "Forbidden: Only authorized roles (admin, poet) can create articles." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    // Use Partial<CreateArticleSchema> for initial parsing, as some fields might be missing or in raw form
    const articleData: Partial<CreateArticleSchema> = {};

    articleData.title = formData.get("title")?.toString();
    articleData.content = formData.get("content")?.toString();
    articleData.slug = formData.get("slug")?.toString();
    articleData.summary = formData.get("summary")?.toString();
    articleData.metaDescription = formData.get("metaDescription")?.toString();
    articleData.metaKeywords = formData.get("metaKeywords")?.toString();
    articleData.status = formData.get("status")?.toString() as "draft" | "published";
    articleData.poetId = formData.get("poetId")?.toString(); // Get poetId from form data

    const parseJsonField = (key: string) => {
      const value = formData.get(key);
      if (typeof value === 'string' && value) {
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
    articleData.category = parseJsonField("category"); // Changed from 'categories' to 'category'
    articleData.tags = parseJsonField("tags");

    // Validate the incoming data
    const validationResult = createArticleSchema.safeParse(articleData);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Validation error", errors: validationResult.error.errors },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Ensure poetId is present
    let poetObjectId: Types.ObjectId | undefined;
    if (validatedData.poetId) {
      if (!Types.ObjectId.isValid(validatedData.poetId)) {
        return NextResponse.json({ message: "Invalid poet ID format." }, { status: 400 });
      }
      const selectedPoet = await User.findById(validatedData.poetId);
      if (!selectedPoet) {
        return NextResponse.json({ message: "Selected poet not found." }, { status: 404 });
      }
      if (selectedPoet.role !== 'poet' && selectedPoet.role !== 'admin') {
        return NextResponse.json({ message: "Selected user is not a recognized poet or admin." }, { status: 400 });
      }
      poetObjectId = new Types.ObjectId(validatedData.poetId);
    } else {
      return NextResponse.json({ message: "Poet is required for creating an article." }, { status: 400 });
    }

    const existingArticle = await Article.findOne({ slug: validatedData.slug });
    if (existingArticle) {
      return NextResponse.json(
        { message: `Article with slug '${validatedData.slug}' already exists.` },
        { status: 409 }
      );
    }

    let coverImage: { publicId: string; url: string } | undefined;
    const imageFile = formData.get("coverImage");

    if (imageFile instanceof File) {
      configureCloudinary();
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const { publicId, url } = await uploadImageStream(buffer, "unmatchedlines/articles");
      coverImage = { publicId, url };
    }

    const newArticle = new Article({
      title: validatedData.title,
      content: validatedData.content,
      couplets: validatedData.couplets,
      summary: validatedData.summary,
      poet: poetObjectId,
      slug: validatedData.slug,
      coverImage: coverImage,
      category: validatedData.category, // Changed from 'categories' to 'category'
      tags: validatedData.tags,
      status: validatedData.status,
      metaDescription: validatedData.metaDescription,
      metaKeywords: validatedData.metaKeywords,
    });

    await newArticle.save();

    // Update the selected poet's article count and add the article ID
    if (poetObjectId) {
      await User.findByIdAndUpdate(poetObjectId, {
        $push: { articles: { articleId: newArticle._id } },
        $inc: { articleCount: 1 },
      });
    }

    return NextResponse.json(
      {
        message: "Article created successfully",
        articleId: newArticle._id,
        slug: newArticle.slug,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating article:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Validation failed", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Failed to create article", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
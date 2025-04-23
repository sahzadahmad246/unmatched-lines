// src/app/api/poem/[id]/route.ts
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Poem from "@/models/Poem";
import Author from "@/models/Author";
import cloudinary from "@/lib/cloudinary";
import User from "@/models/User";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  await dbConnect();

  try {
    const { id } = await params;
    const poem = await Poem.findById(id).populate("author", "name");
    if (!poem) {
      return NextResponse.json({ error: "Poem not found" }, { status: 404 });
    }
    return NextResponse.json({ poem });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await params;
    const formData = await request.formData();
    const titleEn = formData.get("titleEn") as string;
    const titleHi = formData.get("titleHi") as string;
    const titleUr = formData.get("titleUr") as string;
    const contentEn = JSON.parse(formData.get("contentEn") as string);
    const contentHi = JSON.parse(formData.get("contentHi") as string);
    const contentUr = JSON.parse(formData.get("contentUr") as string);
    const category = formData.get("category") as string;
    const status = formData.get("status") as string;
    const tags = formData.get("tags") as string;
    const coverImage = formData.get("coverImage") as File | null;
    const summaryEn = formData.get("summaryEn") as string;
    const summaryHi = formData.get("summaryHi") as string;
    const summaryUr = formData.get("summaryUr") as string;
    const didYouKnowEn = formData.get("didYouKnowEn") as string;
    const didYouKnowHi = formData.get("didYouKnowHi") as string;
    const didYouKnowUr = formData.get("didYouKnowUr") as string;
    const faqs = JSON.parse(formData.get("faqs") as string);
    const viewsCount = parseInt(formData.get("viewsCount") as string) || 0;
    const authorId = formData.get("authorId") as string;

    const poem = await Poem.findById(id);
    if (!poem) {
      return NextResponse.json({ error: "Poem not found" }, { status: 404 });
    }

    const user = await User.findById(session.user.id);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!titleEn || !titleHi || !titleUr || !authorId) {
      return NextResponse.json(
        { error: "Title and author are required for all languages" },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(contentEn) ||
      contentEn.length === 0 ||
      contentEn.some(
        (v) => !v.verse || typeof v.verse !== "string" || !v.verse.trim()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "English content must be a non-empty array of verses with meanings",
        },
        { status: 400 }
      );
    }
    if (
      !Array.isArray(contentHi) ||
      contentHi.length === 0 ||
      contentHi.some(
        (v) => !v.verse || typeof v.verse !== "string" || !v.verse.trim()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Hindi content must be a non-empty array of verses with meanings",
        },
        { status: 400 }
      );
    }
    if (
      !Array.isArray(contentUr) ||
      contentUr.length === 0 ||
      contentUr.some(
        (v) => !v.verse || typeof v.verse !== "string" || !v.verse.trim()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Urdu content must be a non-empty array of verses with meanings",
        },
        { status: 400 }
      );
    }

    // Generate slugs only if titleEn has changed
    let slugEn = poem.slug.en;
    let slugHi = poem.slug.hi;
    let slugUr = poem.slug.ur;

    if (titleEn !== poem.title.en) {
      const baseSlug = titleEn
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

      slugEn = `${baseSlug}-en`;
      slugHi = `${baseSlug}-hi`;
      slugUr = `${baseSlug}-ur`;

      // Check slug uniqueness (excluding current poem)
      const slugCheck = await Poem.findOne({
        $or: [
          { "slug.en": slugEn, _id: { $ne: id } },
          { "slug.hi": slugHi, _id: { $ne: id } },
          { "slug.ur": slugUr, _id: { $ne: id } },
        ],
      });
      if (slugCheck) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        );
      }
    }

    let coverImageUrl = poem.coverImage;
    if (coverImage) {
      try {
        const arrayBuffer = await coverImage.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        coverImageUrl = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              { folder: "unmatched_line/poems" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result!.secure_url);
              }
            )
            .end(buffer);
        });
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        return NextResponse.json(
          { error: "Failed to upload cover image" },
          { status: 400 }
        );
      }
    }

    const updatedPoem = await Poem.findByIdAndUpdate(
      id,
      {
        title: { en: titleEn, hi: titleHi, ur: titleUr },
        content: { en: contentEn, hi: contentHi, ur: contentUr },
        slug: { en: slugEn, hi: slugHi, ur: slugUr },
        category,
        status,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : poem.tags,
        coverImage: coverImageUrl,
        summary: {
          en: summaryEn || "",
          hi: summaryHi || "",
          ur: summaryUr || "",
        },
        didYouKnow: {
          en: didYouKnowEn || "",
          hi: didYouKnowHi || "",
          ur: didYouKnowUr || "",
        },
        faqs: faqs || [],
        viewsCount,
        author: authorId,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPoem) {
      return NextResponse.json(
        { error: "Failed to update poem" },
        { status: 400 }
      );
    }

    if (poem.category !== category || poem.author.toString() !== authorId) {
      const oldCategory = poem.category;
      let decrementField, incrementField;

      if (oldCategory === "sher") {
        decrementField = { $inc: { sherCount: -1 } };
      } else if (oldCategory === "ghazal") {
        decrementField = { $inc: { ghazalCount: -1 } };
      } else {
        decrementField = { $inc: { otherCount: -1 } };
      }

      if (category === "sher") {
        incrementField = { $inc: { sherCount: 1 } };
      } else if (category === "ghazal") {
        incrementField = { $inc: { ghazalCount: 1 } };
      } else {
        incrementField = { $inc: { otherCount: 1 } };
      }

      if (poem.author.toString() !== authorId) {
        await Author.findByIdAndUpdate(poem.author, decrementField);
      }
      await Author.findByIdAndUpdate(authorId, incrementField);
    }

    return NextResponse.json({ message: "Poem updated", poem: updatedPoem });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // DELETE remains unchanged
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await params;
    const poem = await Poem.findById(id);
    if (!poem) {
      return NextResponse.json({ error: "Poem not found" }, { status: 404 });
    }

    const user = await User.findById(session.user.id);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const authorId = poem.author;
    const category = poem.category;

    await poem.deleteOne();

    let updateField;
    if (category === "sher") {
      updateField = { $inc: { sherCount: -1 } };
    } else if (category === "ghazal") {
      updateField = { $inc: { ghazalCount: -1 } };
    } else {
      updateField = { $inc: { otherCount: -1 } };
    }

    await Author.findByIdAndUpdate(
      authorId,
      {
        $pull: { poems: { poemId: id } },
        ...updateField,
      },
      { new: true }
    );

    return NextResponse.json({ message: "Poem deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

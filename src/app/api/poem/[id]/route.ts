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
   
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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
    const contentEn = formData.getAll("contentEn[]") as string[];
    const contentHi = formData.getAll("contentHi[]") as string[];
    const contentUr = formData.getAll("contentUr[]") as string[];
    const slugEn = formData.get("slugEn") as string;
    const slugHi = formData.get("slugHi") as string;
    const slugUr = formData.get("slugUr") as string;
    const category = formData.get("category") as string;
    const status = formData.get("status") as string;
    const tags = formData.get("tags") as string;
    const coverImage = formData.get("coverImage") as File | null;

    const poem = await Poem.findById(id);
    if (!poem) {
      return NextResponse.json({ error: "Poem not found" }, { status: 404 });
    }

    const user = await User.findById(session.user.id);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!titleEn || !titleHi || !titleUr || !slugEn || !slugHi || !slugUr) {
      return NextResponse.json(
        { error: "Title and slug are required for all languages" },
        { status: 400 }
      );
    }

    if (!contentEn.length || !contentHi.length || !contentUr.length) {
      return NextResponse.json(
        { error: "At least one verse is required for each language" },
        { status: 400 }
      );
    }

    let coverImageUrl = poem.coverImage;
    if (coverImage) {
      const arrayBuffer = await coverImage.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      coverImageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "unmatched_line/poems" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!.secure_url);
          }
        ).end(buffer);
      });
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
      },
      { new: true, runValidators: true }
    );

    if (poem.category !== category) {
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

      await Author.findByIdAndUpdate(poem.author, decrementField);
      await Author.findByIdAndUpdate(poem.author, incrementField);
    }

    return NextResponse.json({ message: "Poem updated", poem: updatedPoem });
  } catch (error) {
   
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
   
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
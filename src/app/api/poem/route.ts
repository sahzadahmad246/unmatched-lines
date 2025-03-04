// src/app/api/poem/route.ts
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Poem from "@/models/Poem";
import Author from "@/models/Author";
import cloudinary from "@/lib/cloudinary";
import User from "@/models/User";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const formData = await request.formData();
    const titleEn = formData.get("titleEn") as string;
    const titleHi = formData.get("titleHi") as string;
    const titleUr = formData.get("titleUr") as string;
    const contentEn = formData.get("contentEn") as string;
    const contentHi = formData.get("contentHi") as string;
    const contentUr = formData.get("contentUr") as string;
    const slugEn = formData.get("slugEn") as string;
    const slugHi = formData.get("slugHi") as string;
    const slugUr = formData.get("slugUr") as string;
    const category = formData.get("category") as string;
    const status = formData.get("status") as string;
    const tags = formData.get("tags") as string;
    const coverImage = formData.get("coverImage") as File | null;
    const authorId = formData.get("authorId") as string;

    if (!authorId) {
      return NextResponse.json(
        { error: "Author ID is required" },
        { status: 400 }
      );
    }

    if (
      !titleEn ||
      !titleHi ||
      !titleUr ||
      !contentEn ||
      !contentHi ||
      !contentUr ||
      !slugEn ||
      !slugHi ||
      !slugUr
    ) {
      return NextResponse.json(
        {
          error:
            "Title, content, and slug are required for all languages (English, Hindi, Urdu)",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const author = await Author.findById(authorId);
    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    let coverImageUrl = "";
    if (coverImage) {
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
    }

    // Create the new poem in the Poem collection
    const newPoem = await Poem.create({
      title: { en: titleEn, hi: titleHi, ur: titleUr },
      content: { en: contentEn, hi: contentHi, ur: contentUr },
      slug: { en: slugEn, hi: slugHi, ur: slugUr },
      author: authorId,
      category,
      status,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      coverImage: coverImageUrl || "",
    });

    // Update the author with poem reference and duplicated data (full slug object)
    let updateField;
    if (category === "sher") {
      updateField = { $inc: { sherCount: 1 } };
    } else if (category === "ghazal") {
      updateField = { $inc: { ghazalCount: 1 } };
    } else {
      updateField = { $inc: { otherCount: 1 } };
    }

    const poemDataForAuthor = {
      poemId: newPoem._id,
      titleEn: titleEn,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      slug: { en: slugEn, hi: slugHi, ur: slugUr }, // Store full slug object
      coverImage: coverImageUrl || "",
    };
    console.log("Pushing to Author.poems:", poemDataForAuthor);

    const updatedAuthor = await Author.findByIdAndUpdate(
      authorId,
      {
        $push: { poems: poemDataForAuthor },
        ...updateField,
      },
      { new: true }
    );

    console.log("Updated Author:", updatedAuthor);

    return NextResponse.json(
      { message: "Poem added", poem: newPoem },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding poem:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (slug) {
      console.log("Searching for poem with slug:", slug);
      const poem = await Poem.findOne({
        $or: [{ "slug.en": slug }, { "slug.hi": slug }, { "slug.ur": slug }],
      }).populate("author", "name");

      if (!poem) {
        console.log("Poem not found for slug:", slug);
        return NextResponse.json({ error: "Poem not found" }, { status: 404 });
      }

      console.log("Found poem:", poem);
      return NextResponse.json({ poem });
    }

    // Fetch all published poems if no slug is provided
    const poems = await Poem.find({ status: "published" })
      .populate("author", "name")
      .sort({ createdAt: -1 });

    console.log("Fetched all poems:", poems);
    return NextResponse.json({ poems });
  } catch (error) {
    console.error("Error fetching poems:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
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
    const contentEn = formData.get("contentEn") as string;
    const contentHi = formData.get("contentHi") as string;
    const contentUr = formData.get("contentUr") as string;
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

    if (
      !titleEn ||
      !titleHi ||
      !titleUr ||
      !contentEn ||
      !contentHi ||
      !contentUr ||
      !slugEn ||
      !slugHi ||
      !slugUr
    ) {
      return NextResponse.json(
        {
          error:
            "Title, content, and slug are required for all languages (English, Hindi, Urdu)",
        },
        { status: 400 }
      );
    }

    let coverImageUrl = poem.coverImage;
    if (coverImage) {
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
    }

    // Update the poem in the Poem collection
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

    // Sync the duplicated data in the Author collection (full slug object)
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

    console.log("Updating Author.poems with:", {
      titleEn,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : poem.tags,
      slug: { en: slugEn, hi: slugHi, ur: slugUr },
      coverImageUrl,
    });

    await Author.updateOne(
      { _id: poem.author, "poems.poemId": id },
      {
        $set: {
          "poems.$.titleEn": titleEn,
          "poems.$.tags": tags
            ? tags.split(",").map((tag) => tag.trim())
            : poem.tags,
          "poems.$.slug.en": slugEn,
          "poems.$.slug.hi": slugHi,
          "poems.$.slug.ur": slugUr,
          "poems.$.coverImage": coverImageUrl,
        },
      }
    );

    return NextResponse.json({ message: "Poem updated", poem: updatedPoem });
  } catch (error) {
    console.error("Error updating poem:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    // Remove the poem from the Poem collection
    await poem.deleteOne();

    // Update the author
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
    console.error("Error deleting poem:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

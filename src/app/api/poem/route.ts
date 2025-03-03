import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Poem from "@/models/Poem";
import Author from "@/models/Author";
import cloudinary from "@/lib/cloudinary";

export async function GET(request: Request) {
  await dbConnect();

  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (slug) {
      console.log("Searching for poem with slug:", slug);
      const poem = await Poem.findOne({
        $or: [
          { "slug.en": slug },
          { "slug.hi": slug },
          { "slug.ur": slug },
        ],
      }).populate("author", "name");

      if (!poem) {
        console.log("Poem not found for slug:", slug);
        return NextResponse.json({ error: "Poem not found" }, { status: 404 });
      }
      console.log("Found poem:", poem);
      return NextResponse.json({ poem });
    }

    const poems = await Poem.find({ status: "published" })
      .populate("author", "name")
      .sort({ createdAt: -1 });
    return NextResponse.json({ poems });
  } catch (error) {
    console.error("Error fetching poems:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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
      return NextResponse.json({ error: "Author ID is required" }, { status: 400 });
    }

    if (
      !titleEn || !titleHi || !titleUr ||
      !contentEn || !contentHi || !contentUr ||
      !slugEn || !slugHi || !slugUr
    ) {
      return NextResponse.json(
        { error: "Title, content, and slug are required for all languages (English, Hindi, Urdu)" },
        { status: 400 }
      );
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
        cloudinary.uploader.upload_stream(
          { folder: "unmatched_line/poems" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!.secure_url);
          }
        ).end(buffer);
      });
    }

    // Save as objects, not arrays, to match the schema
    const poem = await Poem.create({
      title: { en: titleEn, hi: titleHi, ur: titleUr },
      content: { en: contentEn, hi: contentHi, ur: contentUr },
      slug: { en: slugEn, hi: slugHi, ur: slugUr },
      author: authorId,
      category,
      status,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      coverImage: coverImageUrl || "",
    });

    let updateField;
    if (category === "sher") {
      updateField = { $inc: { sherCount: 1 } };
    } else if (category === "ghazal") {
      updateField = { $inc: { ghazalCount: 1 } };
    } else {
      updateField = { $inc: { otherCount: 1 } };
    }

    await Author.findByIdAndUpdate(
      authorId,
      {
        $push: { poems: poem._id },
        ...updateField,
      },
      { new: true }
    );

    return NextResponse.json({ message: "Poem added", poem }, { status: 201 });
  } catch (error) {
    console.error("Error adding poem:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
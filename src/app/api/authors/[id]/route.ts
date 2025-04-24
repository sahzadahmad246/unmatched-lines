// src/app/api/authors/[id]/route.ts
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Author from "@/models/Author";
import Poem from "@/models/Poem";
import cloudinary from "@/lib/cloudinary";
import User from "@/models/User";
import mongoose from "mongoose";
import { updateTopContentForAuthor } from "@/lib/updateTopContent";

interface RouteParams {
  params: Promise<{ id: string }>;
}

async function generateUniqueSlug(name: string, existingId?: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  
  let slug = baseSlug;
  let counter = 1;
  while (await Author.findOne({ slug, _id: { $ne: existingId } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  await dbConnect();

  try {
    const { id } = await params;
    const isObjectId = mongoose.Types.ObjectId.isValid(id);

    let author;
    if (isObjectId) {
      author = await Author.findById(id);
    } else {
      author = await Author.findOne({ slug: id });
    }

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    // Update topContent if last updated more than a day ago
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (!author.topContentLastUpdated || author.topContentLastUpdated < oneDayAgo) {
      await updateTopContentForAuthor(author._id.toString());
    }

    // Fetch updated author
    const updatedAuthor = await Author.findById(author._id)
      .populate("poems.poemId", "title.en category")
      .populate("topContent.poem.contentId", "title.en viewsCount")
      .populate("topContent.ghazal.contentId", "title.en viewsCount")
      .populate("topContent.sher.contentId", "title.en viewsCount")
      .populate("topContent.nazm.contentId", "title.en viewsCount")
      .populate("topContent.rubai.contentId", "title.en viewsCount")
      .populate("topContent.marsiya.contentId", "title.en viewsCount")
      .populate("topContent.qataa.contentId", "title.en viewsCount")
      .populate("topContent.other.contentId", "title.en viewsCount");

    return NextResponse.json({ author: updatedAuthor });
  } catch (error) {
    console.error("Error fetching author:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findById(session.user.id);
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await dbConnect();

  try {
    const { id } = await params;
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const dob = formData.get("dob") as string;
    const city = formData.get("city") as string;
    const bio = formData.get("bio") as string;
    const image = formData.get("image") as File | null;

    const author = await Author.findById(id);
    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    let imageUrl = author.image;
    if (image) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "unmatched_line/authors" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!.secure_url);
          }
        ).end(buffer);
      });
    }

    let slug = author.slug;
    if (name && name !== author.name) {
      slug = await generateUniqueSlug(name, id);
    }

    const updatedAuthor = await Author.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        dob: dob ? new Date(dob) : author.dob,
        city,
        bio,
        image: imageUrl,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ message: "Author updated", author: updatedAuthor });
  } catch (error) {
    console.error("Error updating author:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await User.findById(session.user.id);
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await dbConnect();

  try {
    const { id } = await params;
    const author = await Author.findById(id);
    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    if (author.poems.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete author with associated poems" },
        { status: 400 }
      );
    }

    await author.deleteOne();
    return NextResponse.json({ message: "Author deleted" });
  } catch (error) {
    console.error("Error deleting author:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
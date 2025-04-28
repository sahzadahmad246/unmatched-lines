import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Author from "@/models/Author";
import Poem from "@/models/Poem";
import cloudinary from "@/lib/cloudinary";
import User from "@/models/User";
import mongoose from "mongoose";

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
      author = await Author.findById(id)
        .populate("poems.poemId", "title category")
        .populate("followers.userId", "name image");
    } else {
      author = await Author.findOne({ slug: id })
        .populate("poems.poemId", "title category")
        .populate("followers.userId", "name image");
    }

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    const response = {
      author: {
        ...author.toObject(),
        followerCount: author.followerCount,
        followers: author.followers.map((f: any) => ({
          id: f.userId._id,
          name: f.userId.name,
          image: f.userId.image,
          followedAt: f.followedAt,
        })),
      },
    };

    return NextResponse.json(response);
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

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const author = isObjectId
      ? await Author.findById(id)
      : await Author.findOne({ slug: id });

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
      slug = await generateUniqueSlug(name, author._id.toString());
    }

    const updatedAuthor = await Author.findByIdAndUpdate(
      author._id,
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
    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const author = isObjectId
      ? await Author.findById(id)
      : await Author.findOne({ slug: id });

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
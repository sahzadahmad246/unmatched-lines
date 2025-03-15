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

export async function GET(request: NextRequest, { params }: RouteParams) {
  await dbConnect();

  try {
    const { id } = await params;
    console.log("Received id/slug:", id);

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    console.log("Is valid ObjectId:", isObjectId);

    let author;
    if (isObjectId) {
      author = await Author.findById(id).populate("poems", "title category");
    } else {
      author = await Author.findOne({ slug: id }).populate("poems", "title category");
    }

    if (!author) {
      console.log("Author not found for:", id);
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    console.log("Fetched author:", author);
    return NextResponse.json({ author });
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
    const bio = formData.get("bio") as string;  // Added bio
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
      const baseSlug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      slug = `${baseSlug}-${id.slice(-6)}`;
    }

    const updatedAuthor = await Author.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        dob: dob ? new Date(dob) : author.dob,
        city,
        bio,  // Added bio to update
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

// DELETE remains unchanged
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
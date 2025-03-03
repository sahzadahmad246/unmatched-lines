import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Author from "@/models/Author";
import Poem from "@/models/Poem"; // Import is critical even if not directly used
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
    
    // Ensure Poem model is registered before using populate
    try {
      mongoose.model("Poem");
    } catch (e) {
      // If model isn't registered yet, this will register it
      mongoose.model("Poem", Poem.schema);
    }
    
    const author = await Author.findById(id).populate("poems", "title category");
    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }
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

  // Check if user is admin
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

    const updatedAuthor = await Author.findByIdAndUpdate(
      id,
      {
        name,
        dob: dob ? new Date(dob) : author.dob,
        city,
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

  // Check if user is admin
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

    // Check if author has poems (prevent deletion if poems exist)
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
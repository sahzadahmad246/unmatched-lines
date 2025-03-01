// File: src/app/api/poem/[id]/route.ts
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Poem from "@/models/Poem";
import cloudinary from "@/lib/cloudinary";

// Define the params type as a Promise-wrapped object
interface RouteParams {
  params: Promise<{ id: string }>; // Reflects Next.js's expectation
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  await dbConnect();

  try {
    const { id } = await params; // Await the Promise to get the actual params
    const poem = await Poem.findById(id).populate("author", "name");
    if (!poem) {
      return NextResponse.json({ error: "Poem not found" }, { status: 404 });
    }
    return NextResponse.json({ poem });
  } catch (error) {
    console.error("Error fetching poem:", error);
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
    const { id } = await params; // Await the Promise
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const category = formData.get("category") as string;
    const status = formData.get("status") as string;
    const tags = formData.get("tags") as string;
    const coverImage = formData.get("coverImage") as File | null;

    const poem = await Poem.findById(id);
    if (!poem || poem.author.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Poem not found or unauthorized" },
        { status: 404 }
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
        title,
        content,
        category,
        status,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : poem.tags,
        coverImage: coverImageUrl,
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ message: "Poem updated", poem: updatedPoem });
  } catch (error) {
    console.error("Error updating poem:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await params; // Await the Promise
    const poem = await Poem.findById(id);
    if (!poem || poem.author.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Poem not found or unauthorized" },
        { status: 404 }
      );
    }

    await poem.deleteOne();
    return NextResponse.json({ message: "Poem deleted" });
  } catch (error) {
    console.error("Error deleting poem:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
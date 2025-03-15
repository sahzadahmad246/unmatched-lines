// src/app/api/cover-images/route.ts
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import CoverImage from "@/models/CoverImage";
import cloudinary from "@/lib/cloudinary";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const formData = await request.formData();
    const imageFiles = formData.getAll("images") as File[]; // Changed to getAll for multiple files

    if (!imageFiles || imageFiles.length === 0 || imageFiles.length > 5) {
      return NextResponse.json(
        { error: "Please upload between 1 and 5 images" },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const uploadPromises = imageFiles.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "unmatched_line/cover_images" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(buffer);
      }) as any;

      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        uploadedBy: session.user.id,
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);
    const newCoverImages = await CoverImage.insertMany(uploadedImages);

    return NextResponse.json(
      { message: "Cover images uploaded", coverImages: newCoverImages },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading cover images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const coverImages = await CoverImage.find()
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json({ coverImages });
  } catch (error) {
    console.error("Error fetching cover images:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// delete multiple images
export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  
    await dbConnect();
  
    try {
      const { ids } = await request.json();
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { error: "Please provide an array of image IDs" },
          { status: 400 }
        );
      }
  
      const user = await User.findById(session.user.id);
      if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
  
      const coverImages = await CoverImage.find({ _id: { $in: ids } });
      if (coverImages.length === 0) {
        return NextResponse.json({ error: "No cover images found" }, { status: 404 });
      }
  
      const deletePromises = coverImages.map(async (image) => {
        await cloudinary.uploader.destroy(image.publicId);
        await CoverImage.deleteOne({ _id: image._id });
      });
  
      await Promise.all(deletePromises);
  
      return NextResponse.json({ message: "Cover images deleted" });
    } catch (error) {
      console.error("Error deleting cover images:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
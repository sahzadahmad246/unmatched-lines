// app/api/user/route.ts
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Poem from "@/models/Poem"; // This import is crucial for registering the model
import cloudinary from "@/lib/cloudinary";
import mongoose from "mongoose";

// GET: Fetch user data
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    console.log("No session or user ID:", session);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("Session user ID:", session.user.id);

  try {
    await dbConnect();
    console.log("Database connected");

    // Simpler approach - just importing the model is usually enough
    // The import at the top should register the model

    const user = await User.findById(session.user.id)
      .populate("readList", "title content");

    console.log("Fetched user:", user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response = {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        readList: user.readList,
      },
    };

    console.log("API Response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Update user data
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const image = formData.get("image") as File | null;

    let imageUrl = "";
    if (image) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "unmatched_line/profiles" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!.secure_url);
          }
        ).end(buffer);
      });
    }

    const updateData: { name?: string; image?: string } = {};
    if (name) updateData.name = name;
    if (imageUrl) updateData.image = imageUrl;

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User updated", user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
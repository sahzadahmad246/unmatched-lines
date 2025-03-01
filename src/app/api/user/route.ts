// app/api/user/route.ts
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose"; // Add this import
import User from "@/models/User";
import Poem from "@/models/Poem";
import Comment from "@/models/Comment";

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

    // Ensure Poem model is loaded by referencing it
    console.log("Poem model registered:", !!mongoose.models.Poem);

    const user = await User.findById(session.user.id)
      .populate("likedPoems", "title content")
      .populate("readList", "title content");

    console.log("Fetched user:", user);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const comments = await Comment.find({ user: session.user.id }).populate(
      "poem",
      "title"
    );

    console.log("Fetched comments:", comments);

    const response = {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        likedPoems: user.likedPoems,
        readList: user.readList,
      },
      comments,
    };

    console.log("API Response:", response);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
// app/api/user/route.ts
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Poem from "@/models/Poem";
import Comment from "@/models/Comment";

export async function GET() {
  const session = await getServerSession();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const user = await User.findById(session.user.id)
      .populate("likedPoems", "title content") // Populate poem details
      .populate("readList", "title content");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const comments = await Comment.find({ user: session.user.id }).populate(
      "poem",
      "title"
    );

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        likedPoems: user.likedPoems,
        readList: user.readList,
      },
      comments,
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// app/api/user/comment/add/route.ts
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Poem from "@/models/Poem";

export async function POST(request: Request) {
  const session = await getServerSession();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { poemId, text } = await request.json();

  try {
    const poem = await Poem.findById(poemId);
    if (!poem) {
      return NextResponse.json({ error: "Poem not found" }, { status: 404 });
    }

    const comment = await Comment.create({
      user: session.user.id,
      poem: poemId,
      text,
    });

    poem.comments.push(comment._id);
    await poem.save();

    return NextResponse.json({ message: "Comment added", comment });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
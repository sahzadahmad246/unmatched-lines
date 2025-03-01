// app/api/user/comment/remove/route.ts
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Poem from "@/models/Poem";
import mongoose from "mongoose";

export async function DELETE(request: Request) {
  const session = await getServerSession();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { commentId } = await request.json();

  try {
    const comment = await Comment.findById(commentId);
    if (!comment || comment.user.toString() !== session.user.id) {
      return NextResponse.json({ error: "Comment not found or not owned" }, { status: 403 });
    }

    const poem = await Poem.findById(comment.poem);
    if (poem) {
      poem.comments = poem.comments.filter((id: mongoose.Types.ObjectId) => id.toString() !== commentId);
      await poem.save();
    }

    await comment.deleteOne();
    return NextResponse.json({ message: "Comment deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
// app/api/user/like/remove/route.ts
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";
import Poem from "@/models/Poem";
import mongoose from "mongoose";

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();
  const { poemId } = await request.json();

  try {
    const user = await User.findById(session.user.id);
    const poem = await Poem.findById(poemId);

    if (!user || !poem) {
      return NextResponse.json({ error: "User or Poem not found" }, { status: 404 });
    }

    user.likedPoems = user.likedPoems.filter((id: mongoose.Types.ObjectId) => id.toString() !== poemId);
    poem.likes = poem.likes.filter((id: mongoose.Types.ObjectId) => id.toString() !== user._id.toString());
    await Promise.all([user.save(), poem.save()]);

    return NextResponse.json({ message: "Poem unliked" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
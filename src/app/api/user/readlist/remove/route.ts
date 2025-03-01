// app/api/user/readlist/remove/route.ts
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb"; // Assuming this matches your connectDB
import User from "@/models/User";
import Poem from "@/models/Poem";
import mongoose from "mongoose";

export async function DELETE(request: Request) {
  const session = await getServerSession();
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

    user.readList = user.readList.filter((id: mongoose.Types.ObjectId) => id.toString() !== poemId);
    poem.readListUsers = poem.readListUsers.filter((id: mongoose.Types.ObjectId) => id.toString() !== user._id.toString());
    await Promise.all([user.save(), poem.save()]);

    return NextResponse.json({ message: "Poem removed from readlist" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
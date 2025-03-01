// app/api/user/like/add/route.ts
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Poem from "@/models/Poem";

export async function POST(request: Request) {
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

    if (!user.likedPoems.includes(poemId)) {
      user.likedPoems.push(poemId);
      poem.likes.push(user._id);
      await Promise.all([user.save(), poem.save()]);
    }

    return NextResponse.json({ message: "Poem liked" });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
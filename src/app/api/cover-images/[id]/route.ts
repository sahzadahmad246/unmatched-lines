import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import CoverImage from "@/models/CoverImage";
import cloudinary from "@/lib/cloudinary";
import User from "@/models/User";

// Update the RouteContext type
type RouteContext = { params: Promise<{ id: string }> }

export async function DELETE(
  request: NextRequest,
  context: RouteContext // Use the updated RouteContext type here
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await context.params; // Await the promise here before destructuring
    const coverImage = await CoverImage.findById(id);

    if (!coverImage) {
      return NextResponse.json(
        { error: "Cover image not found" },
        { status: 404 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await cloudinary.uploader.destroy(coverImage.publicId);
    await coverImage.deleteOne();

    return NextResponse.json({ message: "Cover image deleted" });
  } catch (error) {
    console.error("Error deleting cover image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

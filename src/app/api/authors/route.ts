import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Author from "@/models/Author";
import User from "@/models/User"; // Add this import
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  await dbConnect();

  try {
    const authors = await Author.find().sort({ name: 1 });
    return NextResponse.json({ authors });
  } catch (error) {
    console.error("Error fetching authors:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  // Check if user is admin
  const user = await User.findById(session.user.id);
  if (!user || user.role !== "admin") { // Added !user check for safety
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const dob = formData.get("dob") as string; // Expect ISO date string (e.g., "1990-01-01")
    const city = formData.get("city") as string;
    const image = formData.get("image") as File | null;

    let imageUrl = "";
    if (image) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: "unmatched_line/authors" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result!.secure_url);
          }
        ).end(buffer);
      });
    }

    const author = await Author.create({
      name,
      dob: dob ? new Date(dob) : undefined,
      city,
      image: imageUrl || "",
    });

    return NextResponse.json({ message: "Author added", author }, { status: 201 });
  } catch (error) {
    console.error("Error adding author:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
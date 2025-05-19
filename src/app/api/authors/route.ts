// src/pages/api/authors.ts
import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Author from "@/models/Author";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";

async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  let slug = baseSlug;
  let counter = 1;
  while (await Author.findOne({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export async function GET(request: NextRequest) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search")?.trim() || "";
    const cities = searchParams.get("city")?.split(",").filter(Boolean) || [];
    const letters = searchParams.get("letter")?.split(",").filter(Boolean) || [];

    if (slug) {
      const author = await Author.findOne({ slug })
        .populate("poems.poemId", "title.en category")
        .populate("followers.userId", "name image");

      if (!author) {
        return NextResponse.json({ error: "Author not found" }, { status: 404 });
      }

      const authorResponse = {
        ...author.toObject(),
        followerCount: Number(author.followerCount) || 0,
        ghazalCount: Number(author.ghazalCount) || 0,
        sherCount: Number(author.sherCount) || 0,
        otherCount: Number(author.otherCount) || 0,
        followers: author.followers.map((f: any) => ({
          id: f.userId._id,
          name: f.userId.name,
          image: f.userId.image,
          followedAt: f.followedAt,
        })),
      };

      return NextResponse.json({ author: authorResponse });
    }

    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (cities.length > 0) {
      query.city = { $in: cities };
    }
    if (letters.length > 0) {
      query.name = { $regex: `^[${letters.join("")}]`, $options: "i" };
    }

    const skip = (page - 1) * limit;
    const total = await Author.countDocuments(query);
    const authors = await Author.find(query)
      .select("name slug image bio followerCount ghazalCount sherCount otherCount city dob")
      .populate("followers.userId", "name image")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    const authorsWithDefaults = authors.map((author) => ({
      ...author.toObject(),
      followerCount: Number(author.followerCount) || 0,
      ghazalCount: Number(author.ghazalCount) || 0,
      sherCount: Number(author.sherCount) || 0,
      otherCount: Number(author.otherCount) || 0,
      followers: author.followers.map((f: any) => ({
        id: f.userId._id,
        name: f.userId.name,
        image: f.userId.image,
        followedAt: f.followedAt,
      })),
    }));

    return NextResponse.json({
      authors: authorsWithDefaults,
      page,
      total,
      pages: Math.ceil(total / limit),
    });
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

  const user = await User.findById(session.user.id);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const dob = formData.get("dob") as string;
    const city = formData.get("city") as string;
    const bio = formData.get("bio") as string;
    const image = formData.get("image") as File | null;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

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

    const author = new Author({
      name,
      slug: await generateUniqueSlug(name),
      dob: dob ? new Date(dob) : undefined,
      city,
      bio,
      image: imageUrl || undefined,
      followerCount: 0,
      ghazalCount: 0,
      sherCount: 0,
      otherCount: 0,
      followers: [],
    });

    await author.save();

    return NextResponse.json({ message: "Author added", author }, { status: 201 });
  } catch (error) {
    console.error("Error adding author:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
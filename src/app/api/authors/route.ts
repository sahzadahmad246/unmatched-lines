import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Author from "@/models/Author";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import { updateTopContentForAuthor } from "@/lib/updateTopContent";

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

    if (slug) {
      const author = await Author.findOne({ slug })
        .populate("poems.poemId", "title.en category");
      if (!author) {
        return NextResponse.json({ error: "Author not found" }, { status: 404 });
      }

      // Update topContent if last updated more than a day ago
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (
        !author.topContentLastUpdated ||
        author.topContentLastUpdated < oneDayAgo
      ) {
        await updateTopContentForAuthor(author._id.toString());
      }

      // Fetch updated author with populated topContent
      const updatedAuthor = await Author.findOne({ slug })
        .populate("poems.poemId", "title.en category")
        .populate("topContent.poem.contentId", "title.en viewsCount")
        .populate("topContent.ghazal.contentId", "title.en viewsCount")
        .populate("topContent.sher.contentId", "title.en viewsCount")
        .populate("topContent.nazm.contentId", "title.en viewsCount")
        .populate("topContent.rubai.contentId", "title.en viewsCount")
        .populate("topContent.marsiya.contentId", "title.en viewsCount")
        .populate("topContent.qataa.contentId", "title.en viewsCount")
        .populate("topContent.other.contentId", "title.en viewsCount");

      // Ensure topContent and followers are always defined
      const authorResponse = {
        ...updatedAuthor.toObject(),
        followers: updatedAuthor.followers || [],
        topContent: updatedAuthor.topContent || {
          poem: [],
          ghazal: [],
          sher: [],
          nazm: [],
          rubai: [],
          marsiya: [],
          qataa: [],
          other: [],
        },
      };

      console.log("Author response:", authorResponse);

      return NextResponse.json({ author: authorResponse });
    }

    const authors = await Author.find()
      .select("name slug image bio followerCount topContent")
      .sort({ name: 1 });

    // Ensure topContent and followers are always defined for each author
    const authorsWithDefaults = authors.map((author) => ({
      ...author.toObject(),
      followers: author.followers || [],
      topContent: author.topContent || {
        poem: [],
        ghazal: [],
        sher: [],
        nazm: [],
        rubai: [],
        marsiya: [],
        qataa: [],
        other: [],
      },
    }));

    console.log("Authors response:", authorsWithDefaults);

    return NextResponse.json({ authors: authorsWithDefaults });
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
      image: imageUrl || "",
      topContent: {
        poem: [],
        ghazal: [],
        sher: [],
        nazm: [],
        rubai: [],
        marsiya: [],
        qataa: [],
        other: [],
      },
      followerCount: 0,
      followers: [],
      topContentLastUpdated: null,
    });

    await author.save();

    return NextResponse.json({ message: "Author added", author }, { status: 201 });
  } catch (error) {
    console.error("Error adding author:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
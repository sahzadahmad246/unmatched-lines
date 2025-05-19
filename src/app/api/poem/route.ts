import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import Poem from "@/models/Poem";
import Author from "@/models/Author";
import cloudinary from "@/lib/cloudinary";
import User from "@/models/User";



export async function GET(request: NextRequest) {
  await dbConnect();
  const url = new URL(request.url);
  const limitPerCategory = parseInt(url.searchParams.get("limit") || "4", 10);
  const lastId = url.searchParams.get("lastId");
  const category = url.searchParams.get("category");
  const search = url.searchParams.get("search");

  const query: any = { status: "published" };
  if (category) query.category = category.toLowerCase();
  if (search) query.$text = { $search: search };
  if (lastId) query._id = { $gt: lastId };

  const categories = ["ghazal", "sher", "nazm"];
  let poems: any[] = [];
  let nextCursor: string | null = null;
  let hasMore = false;

  if (!category) {
    // Fetch poems for each category
    for (const cat of categories) {
      const catQuery = { ...query, category: cat };
      const catPoems = await Poem.find(catQuery)
        .populate("author", "name slug image bio")
        .sort({ _id: 1 })
        .limit(limitPerCategory)
        .lean();
      poems = [...poems, ...catPoems];
    }
    // Sort by _id to ensure consistent pagination
    poems.sort((a, b) => (a._id > b._id ? 1 : -1));
    if (poems.length > 0) {
      nextCursor = poems[poems.length - 1]._id;
      hasMore = await Poem.countDocuments({ ...query, _id: { $gt: nextCursor } }) > 0;
    }
  } else {
    // Existing logic for single category
    poems = await Poem.find(query)
      .populate("author", "name slug image bio")
      .sort({ _id: 1 })
      .limit(limitPerCategory)
      .lean();
    if (poems.length > 0) {
      nextCursor = poems[poems.length - 1]._id;
      hasMore = await Poem.countDocuments({ ...query, _id: { $gt: nextCursor } }) > 0;
    }
  }

  console.log("API Response:", { poems: poems.length, nextCursor, hasMore });
  return NextResponse.json({
    poems: poems.map((poem) => ({
      ...poem,
      content: {
        en: poem.content?.en || [],
        hi: poem.content?.hi || [],
        ur: poem.content?.ur || [],
      },
      viewsCount: poem.viewsCount ?? 0,
      readListCount: poem.readListCount ?? 0,
    })),
    nextCursor,
    hasMore,
  });
}
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const formData = await request.formData();
    const titleEn = formData.get("titleEn") as string;
    const titleHi = formData.get("titleHi") as string;
    const titleUr = formData.get("titleUr") as string;
    const contentEn = JSON.parse(formData.get("contentEn") as string) as {
      verse: string;
      meaning: string;
    }[];
    const contentHi = JSON.parse(formData.get("contentHi") as string) as {
      verse: string;
      meaning: string;
    }[];
    const contentUr = JSON.parse(formData.get("contentUr") as string) as {
      verse: string;
      meaning: string;
    }[];
    const summaryEn = formData.get("summaryEn") as string;
    const summaryHi = formData.get("summaryHi") as string;
    const summaryUr = formData.get("summaryUr") as string;
    const didYouKnowEn = formData.get("didYouKnowEn") as string;
    const didYouKnowHi = formData.get("didYouKnowHi") as string;
    const didYouKnowUr = formData.get("didYouKnowUr") as string;
    const faqs = JSON.parse(formData.get("faqs") as string) as {
      question: { en: string; hi: string; ur: string };
      answer: { en: string; hi: string; ur: string };
    }[];
    const category = formData.get("category") as string;
    const status = formData.get("status") as string;
    const tags = formData.get("tags") as string;
    const coverImage = formData.get("coverImage") as File | null;
    const authorId = formData.get("authorId") as string;

    // Generate slugs from English title
    const baseSlug = titleEn
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    const slugEn = `${baseSlug}-en`;
    const slugHi = `${baseSlug}-hi`;
    const slugUr = `${baseSlug}-ur`;

    // Check slug uniqueness
    const slugCheck = await Poem.findOne({
      $or: [
        { "slug.en": slugEn },
        { "slug.hi": slugHi },
        { "slug.ur": slugUr },
      ],
    });
    if (slugCheck) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    // Validation
    if (!authorId) {
      return NextResponse.json(
        { error: "Author ID is required" },
        { status: 400 }
      );
    }

    if (!titleEn || !titleHi || !titleUr) {
      return NextResponse.json(
        { error: "Title is required for all languages" },
        { status: 400 }
      );
    }

    if (
      !Array.isArray(contentEn) ||
      contentEn.length === 0 ||
      contentEn.some(
        (v) => !v.verse || typeof v.verse !== "string" || !v.verse.trim()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "English content must be a non-empty array of verses with meanings",
        },
        { status: 400 }
      );
    }
    if (
      !Array.isArray(contentHi) ||
      contentHi.length === 0 ||
      contentHi.some(
        (v) => !v.verse || typeof v.verse !== "string" || !v.verse.trim()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Hindi content must be a non-empty array of verses with meanings",
        },
        { status: 400 }
      );
    }
    if (
      !Array.isArray(contentUr) ||
      contentUr.length === 0 ||
      contentUr.some(
        (v) => !v.verse || typeof v.verse !== "string" || !v.verse.trim()
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Urdu content must be a non-empty array of verses with meanings",
        },
        { status: 400 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const author = await Author.findById(authorId);
    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    let coverImageUrl = "";
    if (coverImage) {
      const arrayBuffer = await coverImage.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      coverImageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "unmatched_line/poems" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result!.secure_url);
            }
          )
          .end(buffer);
      });
    }

    // Create the poem document
    const poemData = {
      title: { en: titleEn, hi: titleHi, ur: titleUr },
      content: { en: contentEn, hi: contentHi, ur: contentUr },
      slug: { en: slugEn, hi: slugHi, ur: slugUr },
      author: authorId,
      category,
      status,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      coverImage: coverImageUrl || "",
      summary: {
        en: summaryEn || "",
        hi: summaryHi || "",
        ur: summaryUr || "",
      },
      didYouKnow: {
        en: didYouKnowEn || "",
        hi: didYouKnowHi || "",
        ur: didYouKnowUr || "",
      },
      faqs: faqs || [],
      viewsCount: 0,
    };

    const newPoem = await Poem.create(poemData);

    let updateField;
    if (category === "sher") {
      updateField = { $inc: { sherCount: 1 } };
    } else if (category === "ghazal") {
      updateField = { $inc: { ghazalCount: 1 } };
    } else {
      updateField = { $inc: { otherCount: 1 } };
    }

    await Author.findByIdAndUpdate(
      authorId,
      {
        $push: { poems: { poemId: newPoem._id } },
        ...updateField,
      },
      { new: true }
    );

    return NextResponse.json(
      { message: "Poem added", poem: newPoem },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

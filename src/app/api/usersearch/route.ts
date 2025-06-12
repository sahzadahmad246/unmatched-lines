// /api/usersearch/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { IUser } from "@/types/userTypes";

const searchSchema = z.object({
  type: z.enum(["user", "poet"], { message: "Type must be 'user' or 'poet'" }),
  query: z.string().trim().default(""), // Allow empty query
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

interface UserSearchConditions {
  $or?: Array<{
    [key in "name" | "bio" | "email"]?: { $regex: string; $options: string };
  }>;
  role?: string;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const queryParams = {
      type: url.searchParams.get("type") || "",
      query: url.searchParams.get("query") || "",
      page: url.searchParams.get("page") || "1",
      limit: url.searchParams.get("limit") || "10",
    };

    const parsedParams = searchSchema.safeParse(queryParams);
    if (!parsedParams.success) {
      return NextResponse.json(
        { message: "Invalid query parameters", errors: parsedParams.error.errors },
        { status: 400 }
      );
    }

    const { type, query, page, limit } = parsedParams.data;
    const skip = (page - 1) * limit;

    await dbConnect();
    const session = await getServerSession(authOptions);

    const searchConditions: UserSearchConditions = query
      ? {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { bio: { $regex: query, $options: "i" } },
          ],
        }
      : {};

    if (session?.user?.role === "admin" && query) {
      searchConditions.$or?.push({ email: { $regex: query, $options: "i" } });
    }

    if (type === "poet") {
      searchConditions.role = "poet";
    }

    const users = await User.find(searchConditions)
      .skip(skip)
      .limit(limit)
      .select("name slug profilePicture role bio poemCount location createdAt")
      .lean();

    const totalUsers = await User.countDocuments(searchConditions);

    const transformedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
      createdAt: new Date(user.createdAt).toISOString(),
      updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : undefined,
      dob: user.dob ? new Date(user.dob).toISOString() : undefined,
      bookmarks: user.bookmarks?.map((bookmark) => ({
        ...bookmark,
        poemId: bookmark.poemId.toString(),
        bookmarkedAt: bookmark.bookmarkedAt
          ? new Date(bookmark.bookmarkedAt).toISOString()
          : new Date().toISOString(),
      })) || [],
      poems: user.poems?.map((poem) => ({
        ...poem,
        poemId: poem.poemId.toString(),
      })) || [],
    })) as IUser[];

    return NextResponse.json({
      users: {
        results: transformedUsers,
        pagination: {
          page,
          limit,
          total: totalUsers,
          pages: Math.ceil(totalUsers / limit),
        },
      },
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { message: "Server error", error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
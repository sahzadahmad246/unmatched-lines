import type { Metadata } from "next";
import ProfileComponent from "@/components/user/profile-component";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import mongoose from "mongoose";

// Force dynamic rendering to suppress DYNAMIC_SERVER_USAGE error
export const dynamic = "force-dynamic";

interface UserLean {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  role?: string;
  readList: Array<{
    _id: mongoose.Types.ObjectId;
    title: { en: string };
    slug: { en: string };
  }>;
  followingCount: number;
  following: Array<{
    authorId: { _id: mongoose.Types.ObjectId; name: string; image?: string; slug: string };
    followedAt: Date;
  }>;
}

async function fetchUserData() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      console.log("No session or user ID found");
      return null;
    }

    await dbConnect();
    const user = await User.findById(session.user.id)
      .select("name email image role readList followingCount following")
      .populate("readList", "title slug")
      .populate("following.authorId", "name image slug")
      .lean<UserLean>();

    if (!user) {
      console.error("User not found in database");
      return null;
    }

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role || "user",
      readList: user.readList.map((poem) => ({
        _id: poem._id.toString(),
        title: poem.title,
        slug: poem.slug,
      })),
      followingCount: Number(user.followingCount) || 0,
      following: user.following.map((f) => ({
        id: f.authorId._id.toString(),
        name: f.authorId.name,
        image: f.authorId.image,
        slug: f.authorId.slug,
        followedAt: f.followedAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const user = await fetchUserData();
  const userName = user?.name || "Your";

  return {
    title: `${userName}'s Profile | Unmatched Lines`,
    description: `View and manage ${userName}'s personal poetry anthology on Unmatched Lines. Explore saved poems and followed poets.`,
    keywords: ["poetry profile", "user profile", "poetry anthology", "saved poems", "Unmatched Lines"],
    openGraph: {
      title: `${userName}'s Profile | Unmatched Lines`,
      description: `Manage ${userName}'s poetry collection and followed poets on Unmatched Lines.`,
      url: "https://www.unmatchedlines.com/profile",
      siteName: "Unmatched Lines",
      type: "profile",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${userName}'s Profile | Unmatched Lines`,
      description: `Explore and curate ${userName}'s personal poetry collection on Unmatched Lines.`,
      creator: "@UnmatchedLines",
    },
    robots: {
      index: true,
      follow: true,
    },
    metadataBase: new URL("https://www.unmatchedlines.com"),
  };
}

export default async function ProfilePage() {
  const user = await fetchUserData();
  return <ProfileComponent initialUserData={user} />;
}
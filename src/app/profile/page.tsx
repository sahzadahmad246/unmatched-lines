import type { Metadata } from "next";
import ProfileComponent from "@/components/user/profile-component";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; 

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Your";

  return {
    title: `${userName}'s Profile | Unmatched Lines`,
    description: `View and manage ${userName}'s personal poetry anthology on Unmatched Lines. Explore saved poems from renowned poets across languages.`,
    keywords: "poetry profile, user profile, poetry anthology, saved poems, Unmatched Lines",
    openGraph: {
      title: `${userName}'s Profile | Unmatched Lines`,
      description: `Manage ${userName}'s poetry collection and saved verses on Unmatched Lines.`,
      url: "https://unmatched-lines.vercel.app/profile",
      siteName: "Unmatched Lines",
      type: "profile",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${userName}'s Profile | Unmatched Lines`,
      description: `Explore and curate ${userName}'s personal poetry collection on Unmatched Lines.`,
      creator: "@yourtwitterhandle",
    },
    robots: {
      index: true,
      follow: true,
    },
    metadataBase: new URL("https://unmatched-lines.vercel.app"),
  };
}

export default function ProfilePage() {
  return <ProfileComponent />;
}
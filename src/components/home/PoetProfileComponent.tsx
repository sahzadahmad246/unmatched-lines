"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Calendar,
  MapPin,
  Feather,
  User,
  ArrowLeft,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PoemListItem } from "@/components/poems/poem-list-item";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Poem, CoverImage } from "@/types/poem";
import { useSession } from "next-auth/react";
import { FollowListDialog } from "@/components/ui/FollowListDialog";

interface FollowEntry {
  id: string;
  name: string;
  image?: string;
  followedAt: string;
}

interface Poet {
  _id: string;
  name: string;
  bio?: string;
  image?: string;
  dob?: string;
  city?: string;
  ghazalCount?: number;
  sherCount?: number;
  otherCount?: number;
  createdAt: string;
  updatedAt: string;
  slug: string;
  followerCount: number;
  followers: FollowEntry[];
}

interface PoetProfileProps {
  slug: string;
  poet: Poet;
}

const customStyles = `
  .tabs-scrollable::-webkit-scrollbar {
    height: 4px;
  }
  .tabs-scrollable::-webkit-scrollbar-track {
    background: transparent;
  }
  .tabs-scrollable::-webkit-scrollbar-thumb {
    background-color: rgba(139, 92, 246, 0.2); /* purple-500 */
    border-radius: 20px;
  }
  .tabs-scrollable {
    scrollbar-width: thin;
    scrollbar-color: rgba(139, 92, 246, 0.2) transparent;
  }
  
  @media (max-width: 767px) {
    .profile-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
  
  @media (min-width: 768px) {
    .profile-grid {
      grid-template-columns: 350px 1fr;
      gap: 1.5rem;
    }
  }
  
  @media (min-width: 1280px) {
    .profile-grid {
      grid-template-columns: 380px 1fr;
      gap: 2rem;
    }
  }
  
  .tab-trigger {
    flex: 1;
    min-width: 100px;
    white-space: nowrap;
  }
  
  .full-width-container {
    width: 100%;
    max-width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  @media (min-width: 640px) {
    .full-width-container {
      padding-left: 2rem;
      padding-right: 2rem;
    }
  }
  
  @media (min-width: 1024px) {
    .full-width-container {
      padding-left: 3rem;
      padding-right: 3rem;
    }
  }
  
  .poet-sidebar {
    position: relative;
    height: fit-content;
  }

  @media (min-width: 768px) {
    .poet-sidebar {
      position: sticky;
      top: 1rem;
      height: fit-content;
    }
  }
  
  .poem-content {
    width: 100%;
  }
  
  .follow-count {
    cursor: pointer;
    transition: color 0.2s;
  }
  .follow-count:hover {
    color: #8b5cf6; /* purple-500 */
  }

  .follow-button {
    position: relative;
    overflow: hidden;
  }
  .follow-button span {
    transition: opacity 0.2s ease;
  }
  .follow-button .following-text {
    opacity: 1;
  }
  .follow-button .unfollow-text {
    opacity: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .follow-button:hover .following-text {
    opacity: 0;
  }
  .follow-button:hover .unfollow-text {
    opacity: 1;
  }
`;

export function PoetProfileComponent({ slug, poet }: PoetProfileProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [poems, setPoems] = useState<Poem[]>([]);
  const [filteredPoems, setFilteredPoems] = useState<Poem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [coverImages, setCoverImages] = useState<CoverImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readList, setReadList] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showFullBio, setShowFullBio] = useState(false);
  const [profileImageOpen, setProfileImageOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(Number(poet.followerCount) || 0);
  const [followers, setFollowers] = useState<FollowEntry[]>(poet.followers || []);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);

  const PREVIEW_LIMIT = 3;

  useEffect(() => {
    if (!poet?._id) {
      console.error("Invalid poet prop:", poet);
      setError("Invalid poet data");
      setLoading(false);
    } else {
      console.log("Poet Prop:", poet);
      console.log("Followers:", poet.followers);
      console.log("Follower Count:", poet.followerCount);
    }
  }, [poet]);

  useEffect(() => {
    setFollowerCount(Number(poet.followerCount) || 0);
    setFollowers(poet.followers || []);
  }, [poet.followerCount, poet.followers]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      console.log("Not authenticated, setting isFollowing to false");
      setIsFollowing(false);
      return;
    }

    const isFollowingPoet = poet.followers.some((f) => f.id === session.user.id);
    console.log("Checking isFollowing: userId=", session.user.id, "isFollowing=", isFollowingPoet);
    setIsFollowing(isFollowingPoet);
  }, [status, session?.user?.id, poet.followers]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [poemRes, userRes, coverImagesRes] = await Promise.all([
          fetch(`/api/poem`, { credentials: "include" }),
          fetch("/api/user", { credentials: "include" }),
          fetch("/api/cover-images", { credentials: "include" }),
        ]);

        if (!poemRes.ok) throw new Error(`Failed to fetch poems: ${poemRes.status}`);
        const poemData = await poemRes.json();
        const poetPoems = poemData.poems
          .filter((poem: Poem) => poem.author?._id.toString() === poet._id.toString())
          .map((poem: Poem) => ({
            ...poem,
            viewsCount: poem.viewsCount ?? 0,
            readListCount: poem.readListCount ?? 0,
            category: poem.category ?? "Uncategorized",
            summary: poem.summary ?? { en: "" },
            didYouKnow: poem.didYouKnow ?? { en: "" },
            faqs: poem.faqs ?? [],
            createdAt: poem.createdAt ?? new Date().toISOString(),
            tags: poem.tags ?? [],
            categories: poem.categories ?? [],
            coverImage: poem.coverImage ?? "/placeholder.svg",
          }));
        setPoems(poetPoems);
        setFilteredPoems(poetPoems);

        const uniqueCategories = Array.from(
          new Set(poetPoems.map((poem: Poem) => poem.category.toLowerCase()))
        ).filter((cat): cat is string => !!cat);
        setCategories(uniqueCategories);

        if (userRes.ok) {
          const userData = await userRes.json();
          setReadList(userData.user.readList.map((poem: any) => poem._id.toString()));
        } else {
          console.error("Failed to fetch user data for readlist:", userRes.status);
        }

        if (coverImagesRes.ok) {
          const coverImagesData = await coverImagesRes.json();
          setCoverImages(coverImagesData.coverImages || []);
        }
      } catch (err) {
        setError("Failed to load poems");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [poet._id]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPoems(activeTab === "all" ? poems : poems.filter((p) => p.category.toLowerCase() === activeTab));
    } else {
      const query = searchQuery.toLowerCase();
      const results = poems
        .filter((poem) => (activeTab === "all" ? true : poem.category.toLowerCase() === activeTab))
        .filter(
          (poem) =>
            poem.title.en.toLowerCase().includes(query) ||
            poem.summary?.en.toLowerCase().includes(query) ||
            poem.category.toLowerCase().includes(query)
        );
      setFilteredPoems(results);
    }
  }, [searchQuery, poems, activeTab]);

  const handleReadlistToggle = async (poemId: string, poemTitle: string) => {
    const isInReadlist = readList.includes(poemId);
    const url = isInReadlist ? "/api/user/readlist/remove" : "/api/user/readlist/add";
    const method = isInReadlist ? "DELETE" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poemId }),
        credentials: "include",
      });

      if (res.ok) {
        setReadList((prev) => (isInReadlist ? prev.filter((id) => id !== poemId) : [...prev, poemId]));
        setPoems((prevPoems) =>
          prevPoems.map((poem) =>
            poem._id === poemId
              ? {
                  ...poem,
                  readListCount: isInReadlist ? poem.readListCount - 1 : poem.readListCount + 1,
                }
              : poem
          )
        );
        toast(isInReadlist ? "Removed from reading list" : "Added to reading list", {
          description: `"${poemTitle}" has been ${isInReadlist ? "removed from" : "added to"} your reading list.`,
        });
      } else if (res.status === 401) {
        toast("Authentication required", {
          description: "Please sign in to manage your reading list.",
        });
      }
    } catch (error) {
      toast("Error", {
        description: "An error occurred while updating the reading list.",
      });
    }
  };

  const handleFollowToggle = async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      toast("Authentication required", {
        description: "Please sign in to follow poets.",
      });
      return;
    }

    setIsFollowLoading(true);
    const method = isFollowing ? "DELETE" : "POST";
    try {
      const res = await fetch("/api/follow", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: poet.slug, type: "author" }),
        credentials: "include",
      });

      if (res.ok) {
        const newIsFollowing = !isFollowing;
        setIsFollowing(newIsFollowing);
        setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
        setFollowers((prev) =>
          isFollowing
            ? prev.filter((f) => f.id !== session.user.id)
            : [
                ...prev,
                {
                  id: session.user.id,
                  name: session.user.name || "Unknown",
                  image: session.user.image || undefined,
                  followedAt: new Date().toISOString(),
                },
              ]
        );
        toast(isFollowing ? "Unfollowed" : "Followed", {
          description: `You have ${isFollowing ? "unfollowed" : "followed"} ${poet.name}.`,
        });

        try {
          const poetRes = await fetch(`/api/authors/${encodeURIComponent(slug)}`, {
            credentials: "include",
          });
          if (poetRes.ok) {
            const poetData = await poetRes.json();
            const updatedPoet = poetData.author;
            if (updatedPoet) {
              setFollowerCount(Number(updatedPoet.followerCount) || 0);
              setFollowers(
                updatedPoet.followers.map((f: any) => ({
                  id: f.id,
                  name: f.name,
                  image: f.image,
                  followedAt: f.followedAt,
                })) || []
              );
            }
          }
        } catch (error) {
          console.error("Error re-fetching poet data:", error);
        }
      } else if (res.status === 401) {
        toast("Authentication required", {
          description: "Please sign in to follow poets.",
        });
      } else {
        const data = await res.json();
        toast("Error", {
          description: data.error || "Failed to update follow status.",
        });
      }
    } catch (error) {
      console.error("Error in follow toggle:", error);
      toast("Error", {
        description: "An error occurred while updating follow status.",
      });
    } finally {
      setIsFollowLoading(false);
    }
  };

  const getCoverImage = (index?: number) => {
    if (coverImages.length === 0) return "/placeholder.svg";
    if (index !== undefined && coverImages.length > 1) {
      const safeIndex = index % coverImages.length;
      return coverImages[safeIndex]?.url || "/placeholder.svg";
    }
    const randomIndex = Math.floor(Math.random() * coverImages.length);
    return coverImages[randomIndex]?.url || "/placeholder.svg";
  };

  const truncateBio = (bio: string, maxLength = 120) => {
    if (!bio || bio.length <= maxLength) return bio;
    return bio.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full">
        <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
        <p className="text-xl font-medium text-purple-700 dark:text-pink-300">Loading poet profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full">
        <div className="text-4xl">😕</div>
        <h2 className="text-2xl font-bold text-purple-700 dark:text-pink-300">{error}</h2>
        <Link href="/poets">
          <Button className="mt-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-pink-300 border border-purple-300/30 dark:border-pink-600/30 hover:bg-purple-50 dark:hover:bg-pink-950/50">
            Back to Profiles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className="full-width-container mx-auto py-8 mb-20 w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300 via-pink-300 to-rose-300 dark:from-purple-700 dark:via-pink-700 dark:to-rose-700 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-300 via-yellow-300 to-orange-300 dark:from-amber-700 dark:via-yellow-700 dark:to-orange-700 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute bottom-1/2 right-1/4 w-48 h-48 bg-gradient-to-bl from-emerald-300 via-sky-300 to-teal-300 dark:from-emerald-700 dark:via-sky-700 dark:to-teal-700 rounded-full blur-3xl"></div>
        </div>

        <div className="mb-6">
          <Link href="/poets">
            <Button
              variant="ghost"
              className="gap-2 text-purple-700 dark:text-pink-300 hover:bg-purple-50 dark:hover:bg-pink-950/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Poets
            </Button>
          </Link>
        </div>

        <div className="grid profile-grid">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="poet-sidebar"
          >
            <Card className="overflow-hidden border border-purple-200/60 dark:border-pink-700/20 shadow-md bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-950 dark:via-fuchsia-950 dark:to-pink-950">
              <div className="h-24 bg-gradient-to-r from-rose-200/30 via-pink-200/30 to-purple-200/30 dark:from-rose-800/30 dark:via-pink-800/30 dark:to-purple-800/30 relative" />
              <CardContent className="px-4 pt-0 pb-5 relative">
                <div onClick={() => setProfileImageOpen(true)} className="cursor-pointer">
                  <Avatar className="h-20 w-20 border-4 border-white dark:border-slate-900 absolute -top-20 left-4 ring-2 ring-white dark:ring-slate-950">
                    <AvatarImage src={poet.image || "/placeholder.svg?height=400&width=400"} alt={poet.name} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-pink-300">
                      {poet.name?.charAt(0) || "P"}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="mt-14 space-y-3">
                  <div className="flex justify-between items-center">
                    <h1 className="text-xl font-semibold text-purple-700 dark:text-pink-300">{poet.name}</h1>
                    {status === "authenticated" && (
                      <Button
                        variant={isFollowing ? "outline" : "default"}
                        size="sm"
                        onClick={handleFollowToggle}
                        disabled={isFollowLoading}
                        className={`gap-2 bg-white/80 dark:bg-slate-900/80 border border-purple-200/40 dark:border-pink-700/20 text-purple-700 dark:text-pink-300 hover:bg-purple-50 dark:hover:bg-pink-950/50 ${isFollowing ? "follow-button" : ""}`}
                      >
                        {isFollowLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isFollowing ? (
                          <>
                            <UserMinus className="h-4 w-4" />
                            <span className="following-text">Following</span>
                            <span className="unfollow-text">Unfollow</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4" />
                            Follow
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="gap-1 bg-white/80 dark:bg-slate-900/80 border-purple-200/40 dark:border-pink-700/20 text-purple-700 dark:text-pink-300"
                    >
                      <User className="h-3 w-3" />
                      <span className="text-xs">Poet</span>
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span
                      className="follow-count text-purple-700 dark:text-pink-300"
                      onClick={() => setShowFollowersDialog(true)}
                    >
                      {followerCount} Followers
                    </span>
                  </div>
                  <Separator className="my-4 bg-purple-200/50 dark:bg-pink-700/50" />
                  {poet.bio && (
                    <div className="space-y-2 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950 dark:via-yellow-950 dark:to-orange-950 rounded-lg p-4 border border-amber-200/40 dark:border-orange-700/20">
                      <div className="flex gap-2 text-sm">
                        <Feather className="h-4 w-4 flex-shrink-0 mt-1 text-amber-600 dark:text-orange-400" />
                        <p className="text-gray-600 dark:text-gray-400">
                          {showFullBio ? poet.bio : truncateBio(poet.bio)}
                        </p>
                      </div>
                      {poet.bio.length > 120 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFullBio(!showFullBio)}
                          className="text-xs w-full text-amber-700 dark:text-orange-300 hover:bg-amber-50 dark:hover:bg-orange-950/50"
                        >
                          {showFullBio ? (
                            <>
                              Show less <ChevronUp className="h-3 w-3 ml-1" />
                            </>
                          ) : (
                            <>
                              See more <ChevronDown className="h-3 w-3 ml-1" />
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-orange-400" />
                    <span>
                      {poet.dob
                        ? new Date(poet.dob).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Unknown"}
                    </span>
                  </div>
                  {poet.city && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 flex-shrink-0 text-amber-600 dark:text-orange-400" />
                      <span>{poet.city}</span>
                    </div>
                  )}
                  <Separator className="my-4 bg-amber-200/50 dark:bg-orange-700/50" />
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant="ghost"
                        className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-md h-auto flex flex-col hover:bg-sky-50 dark:hover:bg-rose-950/50 border border-sky-200/40 dark:border-rose-700/20 text-sky-700 dark:text-rose-300"
                        onClick={() => router.push(`/poets/${slug}/${category}`)}
                      >
                        <p className="text-xl font-bold">{poems.filter((p) => p.category.toLowerCase() === category).length}</p>
                        <p className="text-xs capitalize">{category}</p>
                      </Button>
                    ))}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mt-4">
                    <p>
                      <span className="font-medium">Added:</span>{" "}
                      {new Date(poet.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {poet.updatedAt !== poet.createdAt && (
                      <p>
                        <span className="font-medium">Last Updated:</span>{" "}
                        {new Date(poet.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="mt-4 p-4 text-center text-gray-600 dark:text-gray-400 italic text-sm bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 dark:from-pink-950 dark:via-rose-950 dark:to-purple-950 rounded-lg border border-pink-200/40 dark:border-rose-700/20">
              "Poetry is the spontaneous overflow of powerful feelings: it takes its origin from emotion recollected in tranquility."
              <div className="mt-1 font-medium text-xs text-purple-700 dark:text-pink-300">— William Wordsworth</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="poem-content"
          >
            <Card className="shadow-md border border-emerald-200/60 dark:border-teal-700/20 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950 dark:via-green-950 dark:to-teal-950">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-emerald-700 dark:text-teal-300">Works by {poet.name}</h2>
                    <Badge
                      variant="secondary"
                      className="bg-white/80 dark:bg-slate-900/80 border-emerald-200/40 dark:border-teal-700/20 text-emerald-700 dark:text-teal-300"
                    >
                      {poems.length} Poems
                    </Badge>
                  </div>
                  <div className="relative w-full sm:w-auto sm:min-w-[240px]">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search poems..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 bg-white/80 dark:bg-slate-900/80 border-sky-200/40 dark:border-rose-700/20 text-sky-700 dark:text-rose-300"
                      aria-label="Search poems by title or category"
                    />
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="relative w-full mb-6">
                    <TabsList className="w-full overflow-x-auto flex tabs-scrollable pb-1 h-auto bg-gradient-to-r from-sky-100 via-rose-100 to-sky-100 dark:from-sky-900/50 dark:via-rose-900/50 dark:to-sky-900/50 border border-sky-200/40 dark:border-rose-700/20">
                      <TabsTrigger
                        value="all"
                        className="tab-trigger text-sky-700 dark:text-rose-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-200 data-[state=active]:to-rose-200 data-[state=active]:dark:from-sky-800/50 data-[state=active]:dark:to-rose-800/50 data-[state=active]:text-sky-700 data-[state=active]:dark:text-rose-300"
                      >
                        All Works
                      </TabsTrigger>
                      {categories.map((category) => (
                        <TabsTrigger
                          key={category}
                          value={category}
                          className="capitalize tab-trigger text-sky-700 dark:text-rose-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-200 data-[state=active]:to-rose-200 data-[state=active]:dark:from-sky-800/50 data-[state=active]:dark:to-rose-800/50 data-[state=active]:text-sky-700 data-[state=active]:dark:text-rose-300"
                        >
                          {category}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <TabsContent value="all">
                    {filteredPoems.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredPoems.map((poem, index) => {
                          const poemTitle = poem.title?.en || "Untitled";
                          const englishSlug = poem.slug?.en || poem._id;
                          const isInReadlist = readList.includes(poem._id);
                          return (
                            <motion.div
                              key={poem._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.05 * index, duration: 0.3 }}
                            >
                              <PoemListItem
                                poem={poem}
                                coverImage={getCoverImage(index)}
                                englishSlug={englishSlug}
                                isInReadlist={isInReadlist}
                                poemTitle={poemTitle}
                                handleReadlistToggle={handleReadlistToggle}
                              />
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <EmptyState query={searchQuery} />
                    )}
                  </TabsContent>

                  {categories.map((category) => (
                    <TabsContent key={category} value={category}>
                      {filteredPoems.filter((p) => p.category.toLowerCase() === category).length > 0 ? (
                        <div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredPoems
                              .filter((p) => p.category.toLowerCase() === category)
                              .slice(0, PREVIEW_LIMIT)
                              .map((poem, index) => {
                                const poemTitle = poem.title?.en || "Untitled";
                                const englishSlug = poem.slug?.en || poem._id;
                                const isInReadlist = readList.includes(poem._id);
                                return (
                                  <motion.div
                                    key={poem._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.05 * index, duration: 0.3 }}
                                  >
                                    <PoemListItem
                                      poem={poem}
                                      coverImage={getCoverImage(index)}
                                      englishSlug={englishSlug}
                                      isInReadlist={isInReadlist}
                                      poemTitle={poemTitle}
                                      handleReadlistToggle={handleReadlistToggle}
                                    />
                                  </motion.div>
                                );
                              })}
                          </div>
                          <div className="mt-6 text-center">
                            <Button
                              variant="outline"
                              className="bg-white/80 dark:bg-slate-900/80 border-sky-200/40 dark:border-rose-700/20 text-sky-700 dark:text-rose-300 hover:bg-sky-50 dark:hover:bg-rose-950/50"
                              onClick={() => router.push(`/poets/${slug}/${category}`)}
                            >
                              See All {category.charAt(0).toUpperCase() + category.slice(1)}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <EmptyState category={`${category}s`} query={searchQuery} />
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Dialog open={profileImageOpen} onOpenChange={setProfileImageOpen}>
          <DialogContent className="sm:max-w-md bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50 dark:from-purple-950 dark:via-fuchsia-950 dark:to-pink-950 border border-purple-200/60 dark:border-pink-700/20">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between text-purple-700 dark:text-pink-300">
                <span>{poet.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setProfileImageOpen(false)}
                  className="text-purple-700 dark:text-pink-300 hover:bg-purple-50 dark:hover:bg-pink-950/50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="relative aspect-square w-full overflow-hidden rounded-md">
              <Image
                src={poet.image || "/placeholder.svg?height=400&width=400"}
                alt={poet.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </DialogContent>
        </Dialog>

        <FollowListDialog
          open={showFollowersDialog}
          onOpenChange={setShowFollowersDialog}
          target={poet.slug}
          type="author"
          listType="followers"
          preFetchedList={followers}
          slug={slug}
        />
      </div>
    </>
  );
}

interface EmptyStateProps {
  category?: string;
  query?: string;
}

function EmptyState({ category = "works", query }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-200/40 dark:border-teal-700/20">
      <BookOpen className="h-12 w-12 text-gray-600 dark:text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-emerald-700 dark:text-teal-300 mb-2">
        {query ? `No results found for "${query}"` : `No ${category} available`}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
        {query
          ? "Try adjusting your search terms or browse all works"
          : `There are no ${category} available at the moment.`}
      </p>
    </div>
  );
}
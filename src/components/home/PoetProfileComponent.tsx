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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [followerCount, setFollowerCount] = useState(
    Number(poet.followerCount) || 0
  );
  const [followers, setFollowers] = useState<FollowEntry[]>(
    poet.followers || []
  );
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);

  const PREVIEW_LIMIT = 3;

  useEffect(() => {
    if (!poet?._id) {
      console.error("Invalid poet prop:", poet);
      setError("Invalid poet data");
      setLoading(false);
    }
  }, [poet]);

  useEffect(() => {
    setFollowerCount(Number(poet.followerCount) || 0);
    setFollowers(poet.followers || []);
  }, [poet.followerCount, poet.followers]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      setIsFollowing(false);
      return;
    }
    const isFollowingPoet = poet.followers.some(
      (f) => f.id === session.user.id
    );
    setIsFollowing(isFollowingPoet);
  }, [status, session?.user?.id, poet.followers]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [poemRes, userRes, coverImagesRes] = await Promise.all([
          fetch(`/api/poem`, { credentials: "include" }),
          fetch(`/api/user`, { credentials: "include" }),
          fetch(`/api/cover-images`, { credentials: "include" }),
        ]);

        if (!poemRes.ok)
          throw new Error(`Failed to fetch poems: ${poemRes.status}`);
        const poemData = await poemRes.json();
        const poetPoems = poemData.poems
          .filter(
            (poem: Poem) => poem.author?._id.toString() === poet._id.toString()
          )
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
            categories: poem.category ?? [],
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
          setReadList(
            userData.user.readList.map((poem: any) => poem._id.toString())
          );
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
      setFilteredPoems(
        activeTab === "all"
          ? poems
          : poems.filter((p) => p.category.toLowerCase() === activeTab)
      );
    } else {
      const query = searchQuery.toLowerCase();
      const results = poems
        .filter((poem) =>
          activeTab === "all" ? true : poem.category.toLowerCase() === activeTab
        )
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
    const url = isInReadlist
      ? "/api/user/readlist/remove"
      : "/api/user/readlist/add";
    const method = isInReadlist ? "DELETE" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poemId }),
        credentials: "include",
      });

      if (res.ok) {
        setReadList((prev) =>
          isInReadlist ? prev.filter((id) => id !== poemId) : [...prev, poemId]
        );
        setPoems((prevPoems) =>
          prevPoems.map((poem) =>
            poem._id === poemId
              ? {
                  ...poem,
                  readListCount: isInReadlist
                    ? poem.readListCount - 1
                    : poem.readListCount + 1,
                }
              : poem
          )
        );
        toast(
          isInReadlist ? "Removed from reading list" : "Added to reading list",
          {
            description: `"${poemTitle}" has been ${
              isInReadlist ? "removed from" : "added to"
            } your reading list.`,
          }
        );
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
          description: `You have ${isFollowing ? "unfollowed" : "followed"} ${
            poet.name
          }.`,
        });

        try {
          const poetRes = await fetch(
            `/api/authors/${encodeURIComponent(slug)}`,
            {
              credentials: "include",
            }
          );
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full px-4 bg-white dark:bg-[#1F1F1F]">
        <Loader2 className="h-12 w-12 text-black dark:text-white animate-spin" />
        <p className="text-xl font-medium text-black dark:text-white">
          Loading poet profile...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full px-4 bg-white dark:bg-[#1F1F1F]">
        <div className="text-4xl">😕</div>
        <h2 className="text-2xl font-bold text-black dark:text-white">
          {error}
        </h2>
        <Link href="/poets">
          <Button className="mt-4 bg-white dark:bg-[#1F1F1F] text-black dark:text-white border border-[#D1D1D1] hover:bg-[#D1D1D1] dark:hover:bg-[#4B4B4B]">
            Back to Profiles
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white dark:bg-[#1F1F1F] py-6 px-4 sm:px-6 sm:max-w-6xl mx-auto">
      {/* Back to Poets Button */}
      <div className="mb-4">
        <Link href="/poets">
          <Button
            variant="ghost"
            className="flex items-center gap-2 text-black dark:text-white hover:bg-[#D1D1D1] dark:hover:bg-[#4B4B4B]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Poets
          </Button>
        </Link>
      </div>

      {/* Main Grid: 30% Left, 70% Right on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-4">
        {/* Left Box: Personal Info */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full"
        >
          <Card className="border border-[#D1D1D1] shadow-md bg-white dark:bg-[#1F1F1F]">
            <div className="h-20 bg-[#D1D1D1] dark:bg-[#4B4B4B] relative" />
            <CardContent className="px-3 sm:px-4 pt-0 pb-4 relative">
              <div
                onClick={() => setProfileImageOpen(true)}
                className="cursor-pointer"
              >
                <Avatar className="h-16 w-16 border-4 border-white dark:border-[#1F1F1F] absolute -top-16 left-3 ring-2 ring-white dark:ring-[#1F1F1F]">
                  <AvatarImage
                    src={poet.image || "/placeholder.svg?height=400&width=400"}
                    alt={poet.name}
                  />
                  <AvatarFallback className="text-xl bg-[#D1D1D1] dark:bg-[#4B4B4B] text-black dark:text-white">
                    {poet.name?.charAt(0) || "P"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="mt-12 space-y-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <h1 className="text-lg font-semibold text-black dark:text-white truncate">
                    {poet.name}
                  </h1>
                  {status === "authenticated" && (
                    <Button
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                      className={`flex items-center gap-1 bg-white dark:bg-[#1F1F1F] border border-[#D1D1D1] text-black dark:text-white hover:bg-[#D1D1D1] dark:hover:bg-[#4B4B4B] relative overflow-hidden group text-sm px-2 py-1 ${
                        isFollowing ? "follow-button" : ""
                      }`}
                    >
                      {isFollowLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserMinus className="h-3 w-3" />
                          <span className="transition-opacity duration-200 group-hover:opacity-0">
                            Following
                          </span>
                          <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1/2 group-hover:translate-y-0 transition-all duration-200">
                            Unfollow
                          </span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1 bg-white dark:bg-[#1F1F1F] border-[#D1D1D1] text-black dark:text-white text-xs"
                  >
                    <User className="h-3 w-3" />
                    Poet
                  </Badge>
                </div>
                <div className="flex gap-3 text-xs text-[#4B4B4B] dark:text-[#D1D1D1]">
                  <span
                    className="cursor-pointer text-black dark:text-white hover:text-[#4B4B4B] dark:hover:text-[#D1D1D1] transition-colors"
                    onClick={() => setShowFollowersDialog(true)}
                  >
                    {followerCount} Followers
                  </span>
                </div>
                <Separator className="my-2 bg-[#D1D1D1] dark:bg-[#4B4B4B]" />
                {poet.bio && (
                  <div className="space-y-1 bg-[#F5F5F5] dark:bg-[#2A2A2A] rounded-md p-3 border border-[#D1D1D1] dark:border-[#4B4B4B]">
                    <div className="flex gap-2 text-xs">
                      <Feather className="h-3 w-3 flex-shrink-0 mt-0.5 text-[#4B4B4B] dark:text-[#D1D1D1]" />
                      <p className="text-[#4B4B4B] dark:text-[#D1D1D1]">
                        {showFullBio ? poet.bio : truncateBio(poet.bio)}
                      </p>
                    </div>
                    {poet.bio.length > 120 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="text-[11px] w-full text-[#4B4B4B] dark:text-[#D1D1D1] hover:bg-[#D1D1D1] dark:hover:bg-[#4B4B4B] p-1"
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
                <div className="flex items-center gap-2 text-xs text-[#4B4B4B] dark:text-[#D1D1D1]">
                  <Calendar className="h-3 w-3 flex-shrink-0 text-[#4B4B4B] dark:text-[#D1D1D1]" />
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
                  <div className="flex items-center gap-2 text-xs text-[#4B4B4B] dark:text-[#D1D1D1]">
                    <MapPin className="h-3 w-3 flex-shrink-0 text-[#4B4B4B] dark:text-[#D1D1D1]" />
                    <span>{poet.city}</span>
                  </div>
                )}
                <Separator className="my-2 bg-[#D1D1D1] dark:bg-[#4B4B4B]" />
                <div className="grid grid-cols-3 gap-1 text-center">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant="ghost"
                      className="bg-white dark:bg-[#1F1F1F] p-2 rounded-md h-auto flex flex-col hover:bg-[#D1D1D1] dark:hover:bg-[#4B4B4B] border border-[#D1D1D1] dark:border-[#4B4B4B] text-black dark:text-white text-xs"
                      onClick={() => router.push(`/poets/${slug}/${category}`)}
                    >
                      <p className="text-base font-bold">
                        {
                          poems.filter(
                            (p) => p.category.toLowerCase() === category
                          ).length
                        }
                      </p>
                      <p className="text-[10px] capitalize">{category}</p>
                    </Button>
                  ))}
                </div>
                <div className="text-[11px] text-[#4B4B4B] dark:text-[#D1D1D1] space-y-1 mt-2">
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
          <div className="mt-2 p-3 text-center text-[#4B4B4B] dark:text-[#D1D1D1] italic text-[11px] bg-[#F5F5F5] dark:bg-[#2A2A2A] rounded-md border border-[#D1D1D1] dark:border-[#4B4B4B]">
            "Poetry is the spontaneous overflow of powerful feelings: it takes its
            origin from emotion recollected in tranquility."
            <div className="mt-1 font-medium text-[10px] text-black dark:text-white">
              — William Wordsworth
            </div>
          </div>
        </motion.div>

        {/* Right Box: Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full"
        >
          <Card className="shadow-md border border-[#D1D1D1] bg-white dark:bg-[#1F1F1F]">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-black dark:text-white">
                      Works by {poet.name}
                    </h2>
                    <Badge
                      variant="secondary"
                      className="bg-white dark:bg-[#1F1F1F] border-[#D1D1D1] text-black dark:text-white text-xs"
                    >
                      {poems.length} Poems
                    </Badge>
                  </div>
                  <div className="relative w-full sm:w-52">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-[#4B4B4B] dark:text-[#D1D1D1]" />
                    <Input
                      type="text"
                      placeholder="Search poems..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-7 bg-white dark:bg-[#1F1F1F] border-[#D1D1D1] text-black dark:text-white text-sm h-8 w-full"
                      aria-label="Search poems by title or category"
                    />
                  </div>
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="flex flex-wrap gap-1 bg-[#F5F5F5] dark:bg-[#2A2A2A] border border-[#D1D1D1] dark:border-[#4B4B4B] p-1 rounded-md w-full max-w-full">
                    <TabsTrigger
                      value="all"
                      className="flex-1 text-black dark:text-white text-sm py-1 px-2 data-[state=active]:bg-[#D1D1D1] data-[state=active]:dark:bg-[#4B4B4B] truncate"
                    >
                      All Works
                    </TabsTrigger>
                    {categories.map((category) => (
                      <TabsTrigger
                        key={category}
                        value={category}
                        className="flex-1 capitalize text-black dark:text-white text-sm py-1 px-2 data-[state=active]:bg-[#D1D1D1] data-[state=active]:dark:bg-[#4B4B4B] truncate"
                      >
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="all" className="mt-4">
                    {filteredPoems.length > 0 ? (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {filteredPoems.map((poem, index) => {
                            const poemTitle = poem.title?.en || "Untitled";
                            const englishSlug = poem.slug?.en || poem._id;
                            const isInReadlist = readList.includes(poem._id);
                            return (
                              <motion.div
                                key={poem._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  delay: 0.05 * index,
                                  duration: 0.3,
                                }}
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
                        <div className="mt-4 text-center">
                          <Button
                            variant="outline"
                            className="bg-white dark:bg-[#1F1F1F] border-[#D1D1D1] text-black dark:text-white hover:bg-[#D1D1D1] dark:hover:bg-[#4B4B4B] text-sm px-3 py-1"
                            onClick={() =>
                              router.push(`/poets/${slug}/all-writings`)
                            }
                          >
                            See All Works
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <EmptyState query={searchQuery} />
                    )}
                  </TabsContent>

                  {categories.map((category) => (
                    <TabsContent key={category} value={category} className="mt-4">
                      {filteredPoems.filter(
                        (p) => p.category.toLowerCase() === category
                      ).length > 0 ? (
                        <div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {filteredPoems
                              .filter(
                                (p) => p.category.toLowerCase() === category
                              )
                              .slice(0, PREVIEW_LIMIT)
                              .map((poem, index) => {
                                const poemTitle = poem.title?.en || "Untitled";
                                const englishSlug = poem.slug?.en || poem._id;
                                const isInReadlist = readList.includes(
                                  poem._id
                                );
                                return (
                                  <motion.div
                                    key={poem._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                      delay: 0.05 * index,
                                      duration: 0.3,
                                    }}
                                  >
                                    <PoemListItem
                                      poem={poem}
                                      coverImage={getCoverImage(index)}
                                      englishSlug={englishSlug}
                                      isInReadlist={isInReadlist}
                                      poemTitle={poemTitle}
                                      handleReadlistToggle={
                                        handleReadlistToggle
                                      }
                                    />
                                  </motion.div>
                                );
                              })}
                          </div>
                          <div className="mt-4 text-center">
                            <Button
                              variant="outline"
                              className="bg-white dark:bg-[#1F1F1F] border-[#D1D1D1] text-black dark:text-white hover:bg-[#D1D1D1] dark:hover:bg-[#4B4B4B] text-sm px-3 py-1"
                              onClick={() =>
                                router.push(`/poets/${slug}/${category}`)
                              }
                            >
                              See All{" "}
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <EmptyState
                          category={`${category}s`}
                          query={searchQuery}
                        />
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Profile Image Dialog */}
      <Dialog open={profileImageOpen} onOpenChange={setProfileImageOpen}>
        <DialogContent className="sm:max-w-sm bg-white dark:bg-[#1F1F1F] border border-[#D1D1D1] dark:border-[#4B4B4B]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-black dark:text-white text-base">
              <span>{poet.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setProfileImageOpen(false)}
                className="text-black dark:text-white hover:bg-[#D1D1D1] dark:hover:bg-[#4B4B4B]"
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

      {/* Followers Dialog */}
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
  );
}

interface EmptyStateProps {
  category?: string;
  query?: string;
}

function EmptyState({ category = "works", query }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center bg-[#F5F5F5] dark:bg-[#2A2A2A] rounded-md border border-[#D1D1D1] dark:border-[#4B4B4B]">
      <BookOpen className="h-10 w-10 text-[#4B4B4B] dark:text-[#D1D1D1] mb-3" />
      <h3 className="text-base font-medium text-black dark:text-white mb-1">
        {query ? `No results found for "${query}"` : `No ${category} available`}
      </h3>
      <p className="text-xs text-[#4B4B4B] dark:text-[#D1D1D1] max-w-xs">
        {query
          ? "Try adjusting your search terms or browse all works"
          : `There are no ${category} available at the moment.`}
      </p>
    </div>
  );
}
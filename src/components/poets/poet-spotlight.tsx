"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Users,
  Bookmark,
  FileText,
  Sparkles,
  UserPlus,
  UserMinus,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { FollowListDialog } from "@/components/ui/FollowListDialog";

interface Author {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  bio?: string;
  sherCount?: number;
  ghazalCount?: number;
  followerCount?: number;
  followers?: {
    id: string;
    name: string;
    image?: string;
    followedAt: string;
  }[];
}

interface PoetSpotlightProps {
  author: Author | null;
}

export default function PoetSpotlight({ author }: PoetSpotlightProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { data: session, status } = useSession();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(
    Number(author?.followerCount) || 0
  );
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showFollowersDialog, setShowFollowersDialog] = useState(false);

  if (!author) {
    return null;
  }

  // Check if user is following the author
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      setIsFollowing(false);
      return;
    }

    const isFollowingAuthor =
      author.followers?.some((f) => f.id === session.user.id) || false;
    setIsFollowing(isFollowingAuthor);
  }, [status, session?.user?.id, author.followers]);

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
        body: JSON.stringify({ target: author.slug, type: "author" }),
        credentials: "include",
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
        setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
        toast(isFollowing ? "Unfollowed" : "Followed", {
          description: `You have ${isFollowing ? "unfollowed" : "followed"} ${
            author.name
          }.`,
        });

        try {
          const authorRes = await fetch(
            `/api/authors/${encodeURIComponent(author.slug)}`,
            {
              credentials: "include",
            }
          );
          if (authorRes.ok) {
            const authorData = await res.json();
            setFollowerCount(Number(authorData.author.followerCount) || 0);
          }
        } catch (error) {
          console.error("Error re-fetching author data:", error);
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.08,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
    hover: {
      y: -8,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  // Truncate bio
  const truncateBio = (bio: string, maxLength: number) => {
    if (!bio || bio.length <= maxLength) return bio;
    return bio.slice(0, maxLength) + "...";
  };

  // Calculate total poems
  const totalPoems = (author.sherCount || 0) + (author.ghazalCount || 0);

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full mb-8 h-full"
    >
      <div className="h-full mt-4 sm:mt-6">
        <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 dark:from-indigo-950 dark:via-violet-950 dark:to-fuchsia-950 rounded-xl border border-indigo-200/60 dark:border-fuchsia-700/20 shadow-lg overflow-hidden h-full relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-indigo-300 via-violet-300 to-fuchsia-300 dark:from-between-700 dark:via-violet-700 dark:to-fuchsia-700 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tr from-fuchsia-300 via-violet-300 to-indigo-300 dark:from-fuchsia-700 dark:via-violet-700 dark:to-indigo-700 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
          </div>

          <div className="p-4 sm:p-6 flex flex-col h-full relative z-10">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/30 via-violet-200/30 to-fuchsia-200/30 dark:from-indigo-800/30 dark:via-violet-800/30 dark:to-fuchsia-800/30 skew-x-12 rounded-lg -z-10"></div>
              <div className="py-2 px-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 via-violet-100 to-fuchsia-100 dark:from-indigo-900 dark:via-violet-900 dark:to-fuchsia-900 shadow-sm">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-600 dark:text-violet-400" />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold font-serif text-indigo-800 dark:text-violet-300">
                    Poet Spotlight
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 dark:from-indigo-500/20 dark:via-violet-500/20 dark:to-fuchsia-500/20 backdrop-blur-sm text-indigo-700 dark:text-violet-300 border border-indigo-300/30 dark:border-fuchsia-600/30 shadow-sm">
                  <Sparkles className="h-3 w-3 text-fuchsia-500 dark:text-fuchsia-400" />
                  <span className="text-[10px] sm:text-xs font-medium">
                    Featured Poet
                  </span>
                </div>
              </div>
            </div>

            <motion.div
              variants={cardVariants}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              className="flex-grow flex flex-col"
            >
              <div className="relative h-24 sm:h-32 bg-gradient-to-r from-indigo-200/20 via-violet-200/20 to-fuchsia-200/20 dark:from-indigo-800/20 dark:via-violet-800/20 dark:to-fuchsia-800/20 rounded-lg mb-12">
                <div className="absolute -bottom-10 sm:-bottom-12 left-4 border-4 border-white dark:border-slate-800 rounded-full overflow-hidden ring-2 shadow-md">
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                    <Image
                      src={
                        author.image || `/placeholder.svg?height=200&width=200`
                      }
                      alt={author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 pb-4 relative z-10">
                <div className="flex flex-row items-center justify-between gap-2 mb-4 flex-wrap sm:flex-nowrap">
                  <Link href={`/poets/${author.slug}`} className="group">
                    <h3 className="text-xl sm:text-2xl font-bold font-serif text-indigo-800 dark:text-violet-300 group-hover:opacity-80 transition-colors">
                      {author.name}
                    </h3>
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-300 dark:via-violet-600 to-transparent rounded-full mt-1"></div>
                  </Link>

                  <div className="sm:hidden">
                    <Button
                      size="sm"
                      variant={isFollowing ? "outline" : "default"}
                      className={`h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-indigo-200 dark:border-fuchsia-800/40 text-indigo-700 dark:text-violet-300 hover:bg-indigo-50 dark:hover:bg-fuchsia-950/50 hover:text-indigo-800 dark:hover:text-violet-200 backdrop-blur-sm ${
                        isFollowing ? "follow-button" : ""
                      }`}
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                    >
                      {isFollowLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserMinus className="h-3 w-3 mr-0.5" />

                          <span className="unfollow-text">Unfollow</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3 mr-0.5" />
                          <span>Follow</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={isFollowing ? "outline" : "default"}
                      className={`h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-indigo-200 dark:border-fuchsia-800/40 text-indigo-700 dark:text-violet-300 hover:bg-indigo-50 dark:hover:bg-fuchsia-950/50 hover:text-indigo-800 dark:hover:text-violet-200 backdrop-blur-sm ${
                        isFollowing ? "follow-button" : ""
                      }`}
                      onClick={handleFollowToggle}
                      disabled={isFollowLoading}
                    >
                      {isFollowLoading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserMinus className="h-3 w-3 mr-0.5" />

                          <span className="unfollow-text">Unfollow</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3 mr-0.5" />
                          <span>Follow</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mb-4">
                  <span
                    className="flex items-center gap-1.5 px-2 py-1 bg-white/80 dark:bg-slate-900/80 rounded-md border border-indigo-200/40 dark:border-fuchsia-800/40 text-indigo-700 dark:text-violet-300 cursor-pointer follow-count"
                    onClick={() => setShowFollowersDialog(true)}
                  >
                    <Users className="h-3 w-3" />
                    <span className="font-medium">
                      {followerCount} Followers
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-white/80 dark:bg-slate-900/80 rounded-md border border-indigo-200/40 dark:border-fuchsia-800/40 text-indigo-700 dark:text-violet-300">
                    <BookOpen className="h-3 w-3" />
                    <span className="font-medium">{totalPoems} Poems</span>
                  </span>
                </div>

                {author.bio && (
                  <div className="mb-6">
                    <p className="text-sm sm:text-base font-serif text-slate-800 dark:text-slate-200 leading-relaxed bg-gradient-to-b from-white/80 to-white/30 dark:from-slate-900/80 dark:to-slate-900/30 rounded-xl border border-indigo-200/40 dark:border-fuchsia-700/20 shadow-inner backdrop-blur-sm p-4">
                      {truncateBio(author.bio, 200)}
                    </p>
                  </div>
                )}

                <Separator className="my-4 bg-indigo-200/50 dark:bg-fuchsia-700/50" />

                <div className="flex flex-wrap gap-2 mt-auto">
                  {(author.sherCount || 0) > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/80 dark:bg-slate-900/80 rounded-md border border-indigo-200/40 dark:border-fuchsia-800/40 text-indigo-700 dark:text-violet-300"
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium font-serif">
                        {author.sherCount} Sher
                      </span>
                    </motion.div>
                  )}
                  {(author.ghazalCount || 0) > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/80 dark:bg-slate-900/80 rounded-md border border-indigo-200/40 dark:border-fuchsia-800/40 text-indigo-700 dark:text-violet-300"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium font-serif">
                        {author.ghazalCount} Ghazal
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <FollowListDialog
        open={showFollowersDialog}
        onOpenChange={setShowFollowersDialog}
        target={author.slug}
        type="author"
        listType="followers"
        preFetchedList={author.followers || []}
        slug={author.slug}
      />
    </motion.section>
  );
}

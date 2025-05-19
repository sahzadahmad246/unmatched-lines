// src/app/page.tsx or src/components/home/index.tsx (partial update)
"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Footer } from "@/components/home/footer";
import { Button } from "@/components/ui/button";
import { LoadingComponent } from "@/components/utils/LoadingComponent";
import HomeFeaturedPoets from "./home-featured-poets";
import {
  BookHeart,
  Feather,
  Sparkles,
  BookOpen,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { SearchBar } from "@/components/home/search-bar";
import FeaturedCollection from "@/components/home/featured-collection";
import { LineOfTheDay } from "@/components/poems/line-of-the-day";
import { TopFivePicks } from "./TopFivePicks";
import { TrendingPoems } from "./trending-poems";
import { FeaturedAuthors } from "./featured-authors";
import { PoetryCategories } from "./poetry-categories";
import { DailyWisdom } from "./daily-wisdom";
import type { Poem } from "@/types/poem";

interface Poet {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  dob?: string;
  city?: string;
  ghazalCount: number;
  sherCount: number;
}

interface CoverImage {
  _id: string;
  url: string;
  uploadedBy: { name: string };
  createdAt: string;
}

export default function Home() {
  const { data: session } = useSession();
  const [poets, setPoets] = useState<Poet[]>([]);
  const [ghazals, setGhazals] = useState<Poem[]>([]);
  const [shers, setShers] = useState<Poem[]>([]);
  const [nazms, setNazms] = useState<Poem[]>([]);
  const [featuredPoem, setFeaturedPoem] = useState<Poem | null>(null);
  const [readList, setReadList] = useState<string[]>([]);
  const [coverImages, setCoverImages] = useState<CoverImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const heroRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch poets
        const poetsRes = await fetch("/api/authors", {
          credentials: "include",
        });
        if (!poetsRes.ok) throw new Error("Failed to fetch poets");
        const poetsData = await poetsRes.json();
        setPoets(poetsData.authors || []);

        // Fetch poems
        const poemsRes = await fetch("/api/poem?limit=12", {
          credentials: "include",
        });
        if (!poemsRes.ok) throw new Error("Failed to fetch poems");
        const poemsData = await poemsRes.json();
        const poems = poemsData.poems || [];

        setGhazals(
          poems.filter((poem: Poem) => poem.category === "ghazal").slice(0, 6)
        );
        setShers(
          poems.filter((poem: Poem) => poem.category === "sher").slice(0, 6)
        );
        setNazms(
          poems.filter((poem: Poem) => poem.category === "nazm").slice(0, 6)
        );

        if (poems.length > 0) {
          const randomIndex = Math.floor(Math.random() * poems.length);
          setFeaturedPoem(poems[randomIndex]);
        }

        // Fetch cover images
        const coverImagesRes = await fetch("/api/cover-images", {
          credentials: "include",
        });
        if (!coverImagesRes.ok) throw new Error("Failed to fetch cover images");
        const coverImagesData = await coverImagesRes.json();
        setCoverImages(coverImagesData.coverImages || []);

        // Fetch user's readlist
        if (session) {
          const userRes = await fetch("/api/user", { credentials: "include" });
          if (userRes.ok) {
            const userData = await userRes.json();
            setReadList(
              userData.user.readList.map((poem: any) => poem._id.toString())
            );
          }
        }

        // Load recent searches from local storage
        const storedSearches = localStorage.getItem("recentSearches");
        if (storedSearches) {
          setRecentSearches(JSON.parse(storedSearches));
        }
      } catch (err) {
        setError("Failed to load data");
        toast.error("Failed to load content", {
          description: "Please try refreshing the page",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const getRandomCoverImage = () => {
    if (coverImages.length === 0)
      return "/placeholder.svg?height=1080&width=1920";
    const randomIndex = Math.floor(Math.random() * coverImages.length);
    return coverImages[randomIndex].url;
  };

  const handleReadlistToggle = async (poemId: string, poemTitle: string) => {
    if (!session) {
      toast.error("Authentication required", {
        description: "Please sign in to manage your reading list.",
        action: {
          label: "Sign In",
          onClick: () => (window.location.href = "/api/auth/signin"),
        },
      });
      return;
    }

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
        setGhazals((prev) =>
          prev.map((poem) =>
            poem._id === poemId
              ? {
                  ...poem,
                  readListCount: isInReadlist
                    ? (poem.readListCount || 1) - 1
                    : (poem.readListCount || 0) + 1,
                }
              : poem
          )
        );
        setShers((prev) =>
          prev.map((poem) =>
            poem._id === poemId
              ? {
                  ...poem,
                  readListCount: isInReadlist
                    ? (poem.readListCount || 1) - 1
                    : (poem.readListCount || 0) + 1,
                }
              : poem
          )
        );
        setNazms((prev) =>
          prev.map((poem) =>
            poem._id === poemId
              ? {
                  ...poem,
                  readListCount: isInReadlist
                    ? (poem.readListCount || 1) - 1
                    : (poem.readListCount || 0) + 1,
                }
              : poem
          )
        );

        if (isInReadlist) {
          toast.error("Removed from reading list", {
            description: `"${poemTitle}" has been removed from your reading list.`,
          });
        } else {
          toast.custom(
            (t) => (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg shadow-lg p-4 flex items-center gap-3"
              >
                <BookHeart className="h-5 w-5" />
                <div>
                  <div className="font-medium">Added to your anthology</div>
                  <div className="text-sm opacity-90">
                    "{poemTitle}" now resides in your collection
                  </div>
                </div>
              </motion.div>
            ),
            { duration: 3000 }
          );
        }
      }
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred while updating the reading list.",
      });
    }
  };

  // Clear a single recent search
  const clearRecentSearch = (search: string) => {
    const updatedSearches = recentSearches.filter((q) => q !== search);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // Clear all recent searches
  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const handleRecentSearchClick = (search: string) => {
    window.location.href = `/search?q=${encodeURIComponent(search)}`;
  };

  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-destructive">
            {error}
          </h2>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      <style>
        {`
          .recent-search-tag {
            transition: all 0.2s ease;
          }
          .recent-search-tag:hover {
            background-color: #e2e8f0;
            transform: scale(1.05);
          }
          .clear-search-button {
            transition: all 0.2s ease;
          }
          .clear-search-button:hover {
            background-color: #f1f5f9;
            transform: scale(1.1);
          }
        `}
      </style>
      {/* Hero Section */}
      <div className="relative min-h-[70vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-cyan-50/30 via-white to-background dark:from-cyan-950/30 dark:via-background dark:to-background">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-cyan-300/20 to-blue-300/20 dark:from-cyan-700/20 dark:to-blue-700/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tr from-blue-300/20 to-cyan-300/20 dark:from-blue-700/20 dark:to-cyan-700/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>

          <Image
            src={getRandomCoverImage() || "/placeholder.svg"}
            alt="Poetry background"
            fill
            priority
            className="object-cover opacity-15"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-50/90 via-white/70 to-background dark:from-cyan-950/90 dark:via-background/70 dark:to-background" />
        </div>

        <div className="container mx-auto px-4 z-10 relative py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col items-start text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 text-cyan-700 dark:text-cyan-300 mb-6 shadow-sm">
                <Feather className="h-4 w-4" />
                <span className="text-xs font-medium">Discover Poetry</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-sans bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-400 leading-tight">
                Unmatched Lines <br className="hidden md:block" />
                <span className="text-foreground">of Poetry</span>
              </h1>

              <p className="text-base sm:text-lg text-cyan-700/80 dark:text-cyan-300/80 mb-8 font-sans max-w-md">
                Explore the beauty of poetry from renowned poets across
                different languages and traditions. Discover new verses that
                speak to your soul.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  asChild
                  variant="default"
                  size="lg"
                  className="text-sm font-sans bg-gradient-to-r from-cyan-500 to-blue-500 dark:from-cyan-600 dark:to-blue-600 hover:from-cyan-600 hover:to-blue-600 dark:hover:from-cyan-500 dark:hover:to-blue-500 shadow-sm hover:shadow-md transition-all"
                >
                  <Link href="/library">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Explore Poems
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="text-sm font-sans border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/30"
                >
                  <Link href="/poets">
                    <Star className="mr-2 h-4 w-4" />
                    Discover Poets
                  </Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="flex flex-col items-center justify-center"
            >
              <div className="relative w-full max-w-md mx-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-300/40 to-blue-300/40 dark:from-cyan-700/40 dark:to-blue-700/40 rounded-lg blur-lg opacity-70"></div>
                <div className="relative bg-white/80 dark:bg-background/80 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-cyan-200/50 dark:border-cyan-800/50">
                  <SearchBar fullWidth />
                  <div className="mt-6 text-center">
                    <p className="text-sm text-cyan-600/80 dark:text-cyan-400/80 mb-4">
                      Discover over {poets.length} poets and{" "}
                      {ghazals.length + shers.length + nazms.length} poems
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {recentSearches.length > 0 ? (
                        <div className="w-full flex flex-wrap items-center gap-2">
                          <div className="flex items-center justify-between w-full mb-2">
                            <span className="text-xs text-cyan-600/80 dark:text-cyan-400/80 font-medium">
                              Recent Searches:
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={clearAllRecentSearches}
                              className="h-6 w-6 hover:bg-cyan-100/50 dark:hover:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300"
                              title="Clear all recent searches"
                            >
                              <Trash2 className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                            </Button>
                          </div>
                          {recentSearches.map((search, index) => (
                            <div
                              key={index}
                              className="flex items-center recent-search-tag px-2.5 py-1 text-xs rounded-full bg-gradient-to-r from-cyan-100 to-blue-100/70 dark:from-cyan-900 dark:to-blue-900/70 text-cyan-700 dark:text-cyan-300 font-medium"
                            >
                              <button
                                onClick={() => handleRecentSearchClick(search)}
                                className="truncate max-w-[150px]"
                              >
                                {search}
                              </button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => clearRecentSearch(search)}
                                className="clear-search-button h-5 w-5 ml-1 hover:bg-cyan-200/50 dark:hover:bg-cyan-800/50"
                                title="Clear this search"
                              >
                                <X className="h-3 w-3 text-cyan-600/80 dark:text-cyan-400/80" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        ["Love", "Nature", "Life", "Wisdom"].map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 text-xs rounded-full bg-gradient-to-r from-cyan-100 to-blue-100/70 dark:from-cyan-900 dark:to-blue-900/70 text-cyan-700 dark:text-cyan-300 font-medium"
                          >
                            {tag}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Line of the Day and Top Five Picks */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="w-full h-full">
            <LineOfTheDay
              poems={[...ghazals, ...shers, ...nazms]}
              coverImages={coverImages}
              readList={readList}
              handleReadlistToggle={handleReadlistToggle}
            />
          </div>
          <div className="w-full h-full">
            <TopFivePicks
              poems={[...ghazals, ...shers, ...nazms]}
              coverImages={coverImages}
              readList={readList}
              handleReadlistToggle={handleReadlistToggle}
            />
          </div>
        </div>
      </div>

      {/* Trending Poems and Featured Authors */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="w-full h-full">
            <TrendingPoems
              poems={[...ghazals, ...shers, ...nazms]}
              coverImages={coverImages}
              readList={readList}
              handleReadlistToggle={handleReadlistToggle}
            />
          </div>
          <div className="w-full h-full">
            <FeaturedAuthors authors={poets} />
          </div>
        </div>
      </div>

      {/* Poetry Categories and Daily Wisdom */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="w-full h-full">
            <PoetryCategories />
          </div>
          <div className="w-full h-full">
            <DailyWisdom />
          </div>
        </div>
      </div>

      <HomeFeaturedPoets poets={poets} />

      {/* Featured Collections */}
      <FeaturedCollection />

      {/* Quote Section */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-gradient-to-br from-cyan-50/30 via-white to-blue-50/30 dark:from-cyan-950/30 dark:via-background dark:to-blue-950/30">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-cyan-300/20 to-blue-300/20 dark:from-cyan-700/20 dark:to-blue-700/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tr from-blue-300/20 to-cyan-300/20 dark:from-blue-700/20 dark:to-cyan-700/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white/50 dark:bg-background/50 backdrop-blur-sm p-8 md:p-12 rounded-2xl shadow-lg border border-cyan-200/50 dark:border-cyan-800/50"
            >
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400/40 to-blue-400/40 dark:from-cyan-600/40 dark:to-blue-600/40 rounded-full blur opacity-70"></div>
                  <div className="relative bg-white dark:bg-background rounded-full p-3">
                    <BookOpen className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                </div>
              </div>

              <blockquote className="text-xl md:text-2xl lg:text-3xl font-sans leading-relaxed text-center mb-6">
                <span className="text-4xl text-cyan-400/40 dark:text-cyan-600/40">
                  "
                </span>
                Poetry is the spontaneous overflow of powerful feelings: it
                takes its origin from emotion recollected in tranquility.
                <span className="text-4xl text-cyan-400/40 dark:text-cyan-600/40">
                  "
                </span>
              </blockquote>

              <div className="flex flex-col items-center">
                <div className="w-16 h-0.5 bg-gradient-to-r from-cyan-400/40 via-blue-400/40 to-cyan-400/40 dark:from-cyan-600/40 dark:via-blue-600/40 dark:to-cyan-600/40 mb-4"></div>
                <p className="text-lg font-sans text-cyan-700 dark:text-cyan-300 font-medium">
                  William Wordsworth
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative mx-auto w-fit mb-6">
                <div className="absolute -inset-1 bg-white/30 rounded-full blur opacity-70"></div>
                <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <Sparkles className="h-10 w-10" />
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold font-sans mb-6">
                Begin Your Poetic Journey
              </h2>

              <p className="text-lg md:text-xl font-sans mb-8 text-white/90 max-w-2xl mx-auto">
                Explore our vast collection of poems, discover new poets, and
                create your personal anthology.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  asChild
                  size="lg"
                  variant="secondary"
                  className="font-sans text-sm bg-white text-cyan-700 hover:bg-white/90 hover:text-cyan-800 shadow-sm hover:shadow-md transition-all"
                >
                  <Link href="/library">Explore Collection</Link>
                </Button>

                {!session && (
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="bg-transparent text-white border-white hover:bg-white/20 font-sans text-sm"
                  >
                    <Link href="/api/auth/signin">Sign In</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
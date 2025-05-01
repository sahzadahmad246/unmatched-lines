"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  User,
  BookOpen,
  Copy,
  Check,
  Share2,
} from "lucide-react";
import type { Poem } from "@/types/poem";

interface TrendingPoemsProps {
  poems: Poem[];
  coverImages: { url: string }[];
  readList?: string[];
  handleReadlistToggle?: (id: string, title: string) => void;
}

export function TrendingPoems({
  poems,
  coverImages,
  readList = [],
  handleReadlistToggle,
}: TrendingPoemsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [trendingPoems, setTrendingPoems] = useState<Poem[]>([]);
  const [authorImages, setAuthorImages] = useState<Record<string, string>>({});
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (poems.length === 0) return;

    // Sort poems by viewsCount to get trending poems
    const sorted = [...poems]
      .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
      .slice(0, 5);
    setTrendingPoems(sorted);
  }, [poems]);

  // Fetch author images
  useEffect(() => {
    const fetchAuthorImages = async () => {
      const authorIds = [
        ...new Set(trendingPoems.map((poem) => poem.author._id)),
      ];
      const images: Record<string, string> = {};

      await Promise.all(
        authorIds.map(async (authorId) => {
          try {
            const res = await fetch(`/api/authors/${authorId}`, {
              credentials: "include",
            });
            if (res.ok) {
              const data = await res.json();
              if (data.author?.image) {
                images[authorId] = data.author.image;
              }
            }
          } catch (error) {
            console.error("Error fetching author image:", error);
          }
        })
      );

      setAuthorImages(images);
    };

    if (trendingPoems.length > 0) {
      fetchAuthorImages();
    }
  }, [trendingPoems]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % trendingPoems.length);
    setIsCopied(false);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + trendingPoems.length) % trendingPoems.length
    );
    setIsCopied(false);
  };

  const handleCopy = () => {
    const currentPoem = trendingPoems[currentIndex];
    const verses =
      currentPoem.content?.en?.map((item) => item.verse).filter(Boolean) || [];
    const textToCopy = verses.join("\n");
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (trendingPoems.length === 0) return null;

  const currentPoem = trendingPoems[currentIndex];
  const isInReadlist = currentPoem ? readList.includes(currentPoem._id) : false;

  // Get a sample verse from the current poem
  const getSampleVerse = (poem: Poem) => {
    const verses =
      poem.content?.en?.map((item) => item.verse).filter(Boolean) || [];
    if (verses.length === 0) return ["No verse available"];

    const firstVerse = verses[0] || "";
    return firstVerse.split("\n").filter(Boolean).slice(0, 3);
  };

  return (
    <div className="h-full">
      <div className="bg-gradient-to-br from-red-50 via-red-100/30 to-orange-50 dark:from-red-950 dark:via-red-900/30 dark:to-orange-950 rounded-xl border border-red-200/60 dark:border-red-700/20 shadow-lg overflow-hidden h-full relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-300 to-orange-300 dark:from-red-700 dark:to-orange-600 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-300 to-red-300 dark:from-orange-600 dark:to-red-700 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="p-4 sm:p-6 flex flex-col h-full relative z-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-red-200/30 via-transparent to-orange-200/30 dark:from-red-800/30 dark:to-orange-800/30 skew-x-12 rounded-lg -z-10"></div>
            <div className="py-2 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 shadow-sm">
                  <TrendingUp className="h-3.5 w-3.5 text-red-600 dark:text-orange-400" />
                </div>
                <h2 className="text-sm sm:text-base font-semibold font-serif text-red-800 dark:text-orange-300">
                  Trending Poems
                </h2>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-red-500/10 to-orange-500/10 dark:from-red-500/20 dark:to-orange-500/20 backdrop-blur-sm text-red-700 dark:text-orange-300 border border-red-300/30 dark:border-orange-600/30 shadow-sm">
                <span className="text-[10px] sm:text-xs font-medium">
                  {currentIndex + 1} of {trendingPoems.length}
                </span>
              </div>
            </div>
          </div>

          <div className="relative flex-grow flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col h-full"
              >
                {/* Poem Title */}
                <div className="text-center mb-3">
                  <h3 className="text-base sm:text-lg font-serif font-medium text-red-800 dark:text-orange-300 bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-500 dark:to-orange-500 bg-clip-text text-transparent">
                    {currentPoem.title?.en || "Untitled"}
                  </h3>
                </div>

                {/* Formatted Lines */}
                <div className="text-center mb-5 max-w-md mx-auto px-4 py-5 bg-gradient-to-b from-white/80 to-white/30 dark:from-slate-900/80 dark:to-slate-900/30 rounded-xl border border-red-200/40 dark:border-orange-700/20 shadow-inner backdrop-blur-sm">
                  {getSampleVerse(currentPoem).map((line, index) => (
                    <p
                      key={index}
                      className="text-sm sm:text-base font-serif mb-2 leading-relaxed text-slate-800 dark:text-slate-200"
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {/* Poet Info - Aligned in row */}
                <div className="flex items-center justify-center gap-3 mb-5">
                  <Avatar className="h-10 w-10 border-2 border-red-200 dark:border-orange-700 ring-2 ring-white dark:ring-slate-950 shadow-md">
                    {authorImages[currentPoem.author._id] ? (
                      <AvatarImage
                        src={
                          authorImages[currentPoem.author._id] ||
                          "/placeholder.svg"
                        }
                        alt={currentPoem.author.name}
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 text-red-700 dark:text-orange-300">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-medium font-serif text-red-800 dark:text-orange-300">
                      {currentPoem.author.name}
                    </span>
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-300 dark:via-orange-600 to-transparent rounded-full mt-1"></div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-auto">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-red-200 dark:border-orange-800/40 text-red-700 dark:text-orange-300 hover:bg-red-50 dark:hover:bg-orange-950/50 hover:text-red-800 dark:hover:text-orange-200 backdrop-blur-sm"
                  >
                    <Link
                      href={`/poems/en/${
                        currentPoem.slug?.en || currentPoem._id
                      }`}
                    >
                      <BookOpen className="h-3 w-3 mr-0.5" />
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-red-200 dark:border-orange-800/40 text-red-700 dark:text-orange-300 hover:bg-red-50 dark:hover:bg-orange-950/50 hover:text-red-800 dark:hover:text-orange-200 backdrop-blur-sm"
                  >
                    <Eye className="h-3 w-3 mr-0.5" />
                    <span>{currentPoem.viewsCount || 0}</span>
                  </Button>

                  {handleReadlistToggle && (
                    <Button
                      onClick={() =>
                        handleReadlistToggle(
                          currentPoem._id,
                          currentPoem.title?.en || "Untitled"
                        )
                      }
                      variant="outline"
                      size="sm"
                      className={`h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-red-200 dark:border-orange-800/40 
                        ${
                          isInReadlist
                            ? "bg-red-50 dark:bg-orange-950/50 text-red-700 dark:text-orange-300"
                            : "text-red-700 dark:text-orange-300 hover:bg-red-50 dark:hover:bg-orange-950/50 hover:text-red-800 dark:hover:text-orange-200"
                        } backdrop-blur-sm`}
                    >
                      <Heart
                        className={`h-3 w-3 mr-0.5 ${
                          isInReadlist
                            ? "fill-red-500 dark:fill-orange-500 text-red-500 dark:text-orange-500"
                            : ""
                        }`}
                      />
                    </Button>
                  )}

                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-red-200 dark:border-orange-800/40 text-red-700 dark:text-orange-300 hover:bg-red-50 dark:hover:bg-orange-950/50 hover:text-red-800 dark:hover:text-orange-200 backdrop-blur-sm"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3 mr-0.5 text-emerald-500" />
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 mr-0.5" />
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-red-200 dark:border-orange-800/40 text-red-700 dark:text-orange-300 hover:bg-red-50 dark:hover:bg-orange-950/50 hover:text-red-800 dark:hover:text-orange-200 backdrop-blur-sm"
                  >
                    <Share2 className="h-3 w-3 mr-0.5" />
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>

            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full shadow-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-red-200 dark:border-orange-800/40 h-8 w-8 hidden sm:flex hover:bg-red-50 dark:hover:bg-orange-950/50 hover:scale-110 transition-all duration-300 text-red-700 dark:text-orange-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full shadow-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-red-200 dark:border-orange-800/40 h-8 w-8 hidden sm:flex hover:bg-red-50 dark:hover:bg-orange-950/50 hover:scale-110 transition-all duration-300 text-red-700 dark:text-orange-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-center mt-4 gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="rounded-full h-7 w-7 border-red-200 dark:border-orange-800/40 bg-white/80 dark:bg-slate-900/80 hover:bg-red-50 dark:hover:bg-orange-950/50 hover:border-red-300 dark:hover:border-orange-700 transition-all sm:hidden text-red-700 dark:text-orange-300 shadow-sm"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>

            <div className="flex items-center gap-2">
              {trendingPoems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="group focus:outline-none"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-gradient-to-r from-red-400 to-orange-400 dark:from-red-600 dark:to-orange-600 w-6 shadow-sm"
                        : "bg-red-200/50 dark:bg-orange-800/30 w-2 group-hover:bg-red-300 dark:group-hover:bg-orange-700/50"
                    }`}
                  />
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="rounded-full h-7 w-7 border-red-200 dark:border-orange-800/40 bg-white/80 dark:bg-slate-900/80 hover:bg-red-50 dark:hover:bg-orange-950/50 hover:border-red-300 dark:hover:border-orange-700 transition-all sm:hidden text-red-700 dark:text-orange-300 shadow-sm"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

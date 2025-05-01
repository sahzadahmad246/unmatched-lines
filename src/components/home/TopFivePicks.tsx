"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Eye,
  User,
  BookOpen,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { VerseDownload } from "./verse-download";
import type { Poem } from "@/types/poem";

interface CoverImage {
  _id: string;
  url: string;
}

interface TopFivePicksProps {
  poems: Poem[];
  coverImages: CoverImage[];
  readList?: string[];
  handleReadlistToggle?: (id: string, title: string) => void;
}

export function TopFivePicks({
  poems,
  coverImages,
  readList = [],
  handleReadlistToggle,
}: TopFivePicksProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [randomVerses, setRandomVerses] = useState<
    { verse: string[]; poem: Poem }[]
  >([]);
  const [authorImages, setAuthorImages] = useState<Record<string, string>>({});
  const [isCopied, setIsCopied] = useState(false);

  const getRandomCoverImage = () => {
    if (coverImages.length === 0)
      return "/placeholder.svg?height=400&width=600";
    const randomIndex = Math.floor(Math.random() * coverImages.length);
    return coverImages[randomIndex].url;
  };

  useEffect(() => {
    const getRandomVerses = () => {
      const englishPoems = poems.filter(
        (poem) => poem.content?.en && poem.content.en.length > 0
      );

      const shuffledPoems = [...englishPoems].sort(() => Math.random() - 0.5);
      const verses: { verse: string[]; poem: Poem }[] = [];

      for (let i = 0; i < 5 && i < shuffledPoems.length; i++) {
        const poem = shuffledPoems[i];
        const lines =
          poem.content?.en
            ?.map((item) => item.verse)
            .filter((verse): verse is string => typeof verse === "string")
            .flatMap((verse) => verse.split("\n"))
            .filter(Boolean) || [];

        if (lines.length > 0) {
          const startIndex = Math.floor(Math.random() * (lines.length - 1));
          const versePair = lines.slice(startIndex, startIndex + 2);
          if (versePair.length > 0) {
            verses.push({ verse: versePair, poem });
          }
        }
      }

      setRandomVerses(verses);
    };

    getRandomVerses();
  }, [poems]);

  // Fetch author images
  useEffect(() => {
    const fetchAuthorImages = async () => {
      const authorIds = [
        ...new Set(randomVerses.map((item) => item.poem.author._id)),
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

    if (randomVerses.length > 0) {
      fetchAuthorImages();
    }
  }, [randomVerses]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % randomVerses.length);
    setIsCopied(false); // Reset copy state on slide change
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + randomVerses.length) % randomVerses.length
    );
    setIsCopied(false); // Reset copy state on slide change
  };

  const handleCopy = () => {
    const textToCopy = randomVerses[currentIndex].verse.join("\n");
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (randomVerses.length === 0) return null;

  const currentVerse = randomVerses[currentIndex];
  const isInReadlist = currentVerse
    ? readList.includes(currentVerse.poem._id)
    : false;

  return (
    <div className="h-full">
      <div className="bg-gradient-to-br from-rose-50 via-white to-amber-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 rounded-xl border border-rose-200/60 dark:border-amber-700/20 shadow-lg overflow-hidden h-full relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-300 to-amber-200 dark:from-rose-700 dark:to-amber-600 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-200 to-rose-300 dark:from-amber-600 dark:to-rose-700 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="p-4 sm:p-6 flex flex-col h-full relative z-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-200/30 via-transparent to-amber-200/30 dark:from-rose-800/30 dark:to-amber-800/30 skew-x-12 rounded-lg -z-10"></div>
            <div className="py-2 px-4 flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-semibold font-serif text-rose-800 dark:text-amber-300">
                Top Five Picks
              </h2>
              <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-rose-500/10 to-amber-500/10 dark:from-rose-500/20 dark:to-amber-500/20 backdrop-blur-sm text-rose-700 dark:text-amber-300 border border-rose-300/30 dark:border-amber-600/30 shadow-sm">
                <Sparkles className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                <span className="text-[10px] sm:text-xs font-medium">
                  Daily Inspiration
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
                {/* Formatted Lines */}
                <div className="text-center mb-5 max-w-md mx-auto px-4 py-5 bg-gradient-to-b from-white/80 to-white/30 dark:from-slate-900/80 dark:to-slate-900/30 rounded-xl border border-rose-200/40 dark:border-amber-700/20 shadow-inner backdrop-blur-sm">
                  {currentVerse.verse.map((line, idx) => (
                    <p
                      key={idx}
                      className="text-sm sm:text-base font-serif mb-2 leading-relaxed text-slate-800 dark:text-slate-200"
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {/* Poet Info - Aligned in row */}
                <div className="flex items-center justify-center gap-3 mb-5">
                  <Avatar className="h-10 w-10 border-2 border-rose-200 dark:border-amber-700 ring-2 ring-white dark:ring-slate-950 shadow-md">
                    {authorImages[currentVerse.poem.author._id] ? (
                      <AvatarImage
                        src={
                          authorImages[currentVerse.poem.author._id] ||
                          "/placeholder.svg"
                        }
                        alt={currentVerse.poem.author.name}
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-rose-100 to-amber-100 dark:from-rose-900 dark:to-amber-900 text-rose-700 dark:text-amber-300">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-medium font-serif text-rose-800 dark:text-amber-300">
                      {currentVerse.poem.author.name}
                    </span>
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-rose-300 dark:via-amber-600 to-transparent rounded-full mt-1"></div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-auto">
                  <VerseDownload
                    verse={currentVerse.verse.join("\n")}
                    author={currentVerse.poem.author.name}
                    title={currentVerse.poem.title.en}
                    imageUrl={getRandomCoverImage()}
                    languages={{
                      en:
                        currentVerse.poem.content?.en?.map(
                          (item) => item.verse
                        ) || [],
                      hi:
                        currentVerse.poem.content?.hi?.map(
                          (item) => item.verse
                        ) || [],
                      ur:
                        currentVerse.poem.content?.ur?.map(
                          (item) => item.verse
                        ) || [],
                    }}
                  />

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-rose-200 dark:border-amber-800/40 text-rose-700 dark:text-amber-300 hover:bg-rose-50 dark:hover:bg-amber-950/50 hover:text-rose-800 dark:hover:text-amber-200 backdrop-blur-sm"
                  >
                    <Link
                      href={`/poems/en/${
                        currentVerse.poem.slug?.en || currentVerse.poem._id
                      }`}
                    >
                      <BookOpen className="h-3 w-3 mr-0.5" />
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-rose-200 dark:border-amber-800/40 text-rose-700 dark:text-amber-300 hover:bg-rose-50 dark:hover:bg-amber-950/50 hover:text-rose-800 dark:hover:text-amber-200 backdrop-blur-sm"
                  >
                    <Eye className="h-3 w-3 mr-0.5" />
                    <span>{currentVerse.poem.viewsCount || 0}</span>
                  </Button>

                  {handleReadlistToggle && (
                    <Button
                      onClick={() =>
                        handleReadlistToggle(
                          currentVerse.poem._id,
                          currentVerse.poem.title?.en || "Untitled"
                        )
                      }
                      variant="outline"
                      size="sm"
                      className={`h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-rose-200 dark:border-amber-800/40 
                        ${
                          isInReadlist
                            ? "bg-rose-50 dark:bg-amber-950/50 text-rose-700 dark:text-amber-300"
                            : "text-rose-700 dark:text-amber-300 hover:bg-rose-50 dark:hover:bg-amber-950/50 hover:text-rose-800 dark:hover:text-amber-200"
                        } backdrop-blur-sm`}
                    >
                      <Heart
                        className={`h-3 w-3 mr-0.5 ${
                          isInReadlist
                            ? "fill-rose-500 dark:fill-amber-500 text-rose-500 dark:text-amber-500"
                            : ""
                        }`}
                      />
                    </Button>
                  )}

                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-rose-200 dark:border-amber-800/40 text-rose-700 dark:text-amber-300 hover:bg-rose-50 dark:hover:bg-amber-950/50 hover:text-rose-800 dark:hover:text-amber-200 backdrop-blur-sm"
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
                </div>
              </motion.div>
            </AnimatePresence>

            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full shadow-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-rose-200 dark:border-amber-800/40 h-8 w-8 hidden sm:flex hover:bg-rose-50 dark:hover:bg-amber-950/50 hover:scale-110 transition-all duration-300 text-rose-700 dark:text-amber-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full shadow-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-rose-200 dark:border-amber-800/40 h-8 w-8 hidden sm:flex hover:bg-rose-50 dark:hover:bg-amber-950/50 hover:scale-110 transition-all duration-300 text-rose-700 dark:text-amber-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-center mt-4 gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="rounded-full h-7 w-7 border-rose-200 dark:border-amber-800/40 bg-white/80 dark:bg-slate-900/80 hover:bg-rose-50 dark:hover:bg-amber-950/50 hover:border-rose-300 dark:hover:border-amber-700 transition-all sm:hidden text-rose-700 dark:text-amber-300 shadow-sm"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>

            <div className="flex items-center gap-2">
              {randomVerses.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="group focus:outline-none"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-gradient-to-r from-rose-400 to-amber-400 dark:from-rose-600 dark:to-amber-600 w-6 shadow-sm"
                        : "bg-rose-200/50 dark:bg-amber-800/30 w-2 group-hover:bg-rose-300 dark:group-hover:bg-amber-700/50"
                    }`}
                  />
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="rounded-full h-7 w-7 border-rose-200 dark:border-amber-800/40 bg-white/80 dark:bg-slate-900/80 hover:bg-rose-50 dark:hover:bg-amber-950/50 hover:border-rose-300 dark:hover:border-amber-700 transition-all sm:hidden text-rose-700 dark:text-amber-300 shadow-sm"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

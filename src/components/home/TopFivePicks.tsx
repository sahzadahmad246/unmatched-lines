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
      <div className="bg-gradient-to-br from-background to-muted/10 rounded-xl border border-primary/20 shadow-md h-full">
        <div className="p-5 sm:p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base sm:text-lg font-medium font-sans">
              Top Five Picks
            </h2>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-3 w-3" />
              <span className="text-xs font-medium">Daily Inspiration</span>
            </div>
          </div>

          <div className="relative flex-grow flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col h-full"
              >
                {/* Formatted Lines */}
                <div className="text-center mb-5 max-w-md mx-auto">
                  {currentVerse.verse.map((line, idx) => (
                    <p
                      key={idx}
                      className="text-base sm:text-lg md:text-xl font-sans mb-2 leading-relaxed"
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {/* Poet Info - Aligned in row */}
                <div className="flex items-center justify-center gap-3 mb-5">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    {authorImages[currentVerse.poem.author._id] ? (
                      <AvatarImage
                        src={
                          authorImages[currentVerse.poem.author._id] ||
                          "/placeholder.svg"
                        }
                        alt={currentVerse.poem.author.name}
                      />
                    ) : (
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium font-sans">
                      {currentVerse.poem.author.name}
                    </span>
                    <div className="w-full h-0.5 bg-primary/30 rounded-full mt-1"></div>
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
                    className="gap-1 text-xs sm:text-sm font-sans"
                  >
                    <Link
                      href={`/poems/en/${
                        currentVerse.poem.slug?.en || currentVerse.poem._id
                      }`}
                    >
                      <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs sm:text-sm font-sans"
                  >
                    <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
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
                      className={`gap-1 text-xs sm:text-sm font-sans ${
                        isInReadlist ? "bg-primary/10" : ""
                      }`}
                    >
                      <Heart
                        className={`h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 ${
                          isInReadlist ? "fill-primary text-primary" : ""
                        }`}
                      />
                    </Button>
                  )}

                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs sm:text-sm font-sans"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
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
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full shadow-md bg-background/80 backdrop-blur-sm border h-8 w-8 hidden sm:flex hover:bg-background hover:scale-110 transition-all duration-300"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full shadow-md bg-background/80 backdrop-blur-sm border h-8 w-8 hidden sm:flex hover:bg-background hover:scale-110 transition-all duration-300"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="flex items-center justify-center mt-4 gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="rounded-full h-7 w-7 border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all sm:hidden"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>

            <div className="flex items-center gap-1.5">
              {randomVerses.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="group focus:outline-none"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-primary w-4"
                        : "bg-muted-foreground/30 w-1.5 group-hover:bg-muted-foreground/50"
                    }`}
                  />
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="rounded-full h-7 w-7 border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all sm:hidden"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

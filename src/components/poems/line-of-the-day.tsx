"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Heart,
  Eye,
  User,
  Calendar,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { VerseDownload } from "../home/verse-download";
import type { Poem } from "@/types/poem";

interface LineOfTheDayProps {
  poems: Poem[];
  coverImages: { url: string }[];
  readList?: string[];
  handleReadlistToggle?: (id: string, title: string) => void;
}

export function LineOfTheDay({
  poems,
  coverImages,
  readList = [],
  handleReadlistToggle,
}: LineOfTheDayProps) {
  const [lineOfTheDay, setLineOfTheDay] = useState<string>("");
  const [lineAuthor, setLineAuthor] = useState<string>("");
  const [poemOfTheDay, setPoemOfTheDay] = useState<Poem | null>(null);
  const [authorImage, setAuthorImage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [todayDate] = useState(
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  );

  const getRandomCoverImage = () => {
    if (coverImages.length === 0)
      return "/placeholder.svg?height=1080&width=1920";
    const randomIndex = Math.floor(Math.random() * coverImages.length);
    return coverImages[randomIndex].url;
  };

  useEffect(() => {
    if (poems.length === 0) return;

    const dateStr = new Date().toISOString().split("T")[0];
    let seed = 0;
    for (let i = 0; i < dateStr.length; i++) seed += dateStr.charCodeAt(i);

    const poemIndex = seed % poems.length;
    const selectedPoem = poems[poemIndex];
    setPoemOfTheDay(selectedPoem);

    // Fetch author image if available
    const fetchAuthorImage = async () => {
      if (selectedPoem?.author?._id) {
        try {
          const res = await fetch(`/api/authors/${selectedPoem.author._id}`, {
            credentials: "include",
          });
          if (res.ok) {
            const data = await res.json();
            if (data.author?.image) {
              setAuthorImage(data.author.image);
            }
          }
        } catch (error) {
          console.error("Error fetching author image:", error);
        }
      }
    };
    fetchAuthorImage();

    const verses = {
      en:
        selectedPoem.content?.en?.map((item) => item.verse).filter(Boolean) ||
        [],
      hi:
        selectedPoem.content?.hi?.map((item) => item.verse).filter(Boolean) ||
        [],
      ur:
        selectedPoem.content?.ur?.map((item) => item.verse).filter(Boolean) ||
        [],
    };

    const verseArray =
      verses.en.length > 0
        ? verses.en
        : verses.hi.length > 0
        ? verses.hi
        : verses.ur.length > 0
        ? verses.ur
        : [];
    if (verseArray.length > 0) {
      const verseIndex = seed % verseArray.length;
      setLineOfTheDay(
        verseArray[verseIndex] ||
          selectedPoem.summary?.en ||
          "No verse available"
      );
    } else {
      setLineOfTheDay(selectedPoem.summary?.en || "No verse available");
    }
    setLineAuthor(selectedPoem.author?.name || "Unknown Author");
  }, [poems]);

  const formatVerseForDisplay = (verse: string) => {
    if (!verse) return ["No verse available"];
    const lines = verse.split("\n").filter(Boolean);
    return lines.length > 0 ? lines : [verse];
  };

  const handleCopy = () => {
    const textToCopy = formatVerseForDisplay(lineOfTheDay).join("\n");
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const isInReadlist = poemOfTheDay
    ? readList.includes(poemOfTheDay._id)
    : false;

  return (
    <div className="h-full">
      <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 dark:from-indigo-950 dark:via-violet-950 dark:to-fuchsia-950 rounded-xl border border-indigo-200/60 dark:border-fuchsia-700/20 shadow-lg overflow-hidden h-full relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-indigo-300 via-violet-300 to-fuchsia-300 dark:from-indigo-700 dark:via-violet-700 dark:to-fuchsia-700 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tr from-fuchsia-300 via-violet-300 to-indigo-300 dark:from-fuchsia-700 dark:via-violet-700 dark:to-indigo-700 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
        </div>

        <div className="p-4 sm:p-6 flex flex-col h-full relative z-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/30 via-violet-200/30 to-fuchsia-200/30 dark:from-indigo-800/30 dark:via-violet-800/30 dark:to-fuchsia-800/30 skew-x-12 rounded-lg -z-10"></div>
            <div className="py-2 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 via-violet-100 to-fuchsia-100 dark:from-indigo-900 dark:via-violet-900 dark:to-fuchsia-900 shadow-sm">
                  <Calendar className="h-3.5 w-3.5 text-indigo-600 dark:text-violet-400" />
                </div>
                <h2 className="text-sm sm:text-base font-semibold font-serif text-indigo-800 dark:text-violet-300">
                  Line of the Day
                </h2>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-fuchsia-500/10 dark:from-indigo-500/20 dark:via-violet-500/20 dark:to-fuchsia-500/20 backdrop-blur-sm text-indigo-700 dark:text-violet-300 border border-indigo-300/30 dark:border-fuchsia-600/30 shadow-sm">
                <Sparkles className="h-3 w-3 text-fuchsia-500 dark:text-fuchsia-400" />
                <span className="text-[10px] sm:text-xs font-medium">
                  {todayDate}
                </span>
              </div>
            </div>
          </div>

          {lineOfTheDay ? (
            <div className="relative flex-grow flex flex-col">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col h-full"
              >
                {/* Formatted Lines */}
                <div className="text-center mb-5 max-w-md mx-auto px-4 py-5 bg-gradient-to-b from-white/80 to-white/30 dark:from-slate-900/80 dark:to-slate-900/30 rounded-xl border border-indigo-200/40 dark:border-fuchsia-700/20 shadow-inner backdrop-blur-sm">
                  {formatVerseForDisplay(lineOfTheDay).map((line, index) => (
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
                  <Avatar className="h-10 w-10 border-2 border-indigo-200 dark:border-fuchsia-700 ring-2 ring-white dark:ring-slate-950 shadow-md">
                    {authorImage ? (
                      <AvatarImage
                        src={authorImage || "/placeholder.svg"}
                        alt={lineAuthor}
                      />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-indigo-100 via-violet-100 to-fuchsia-100 dark:from-indigo-900 dark:via-violet-900 dark:to-fuchsia-900 text-indigo-700 dark:text-violet-300">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs sm:text-sm font-medium font-serif text-indigo-800 dark:text-violet-300">
                      {lineAuthor}
                    </span>
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-indigo-300 dark:via-violet-600 to-transparent rounded-full mt-1"></div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-auto">
                  <VerseDownload
                    verse={lineOfTheDay}
                    author={lineAuthor}
                    title="Line of the Day"
                    imageUrl={getRandomCoverImage()}
                    languages={{
                      en:
                        poemOfTheDay?.content?.en?.map((item) => item.verse) ||
                        [],
                      hi:
                        poemOfTheDay?.content?.hi?.map((item) => item.verse) ||
                        [],
                      ur:
                        poemOfTheDay?.content?.ur?.map((item) => item.verse) ||
                        [],
                    }}
                  />

                  {poemOfTheDay && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-indigo-200 dark:border-fuchsia-800/40 text-indigo-700 dark:text-violet-300 hover:bg-indigo-50 dark:hover:bg-fuchsia-950/50 hover:text-indigo-800 dark:hover:text-violet-200 backdrop-blur-sm"
                    >
                      <Link
                        href={`/poems/en/${
                          poemOfTheDay.slug?.en || poemOfTheDay._id
                        }`}
                      >
                        <BookOpen className="h-3 w-3 mr-0.5" />
                      </Link>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-indigo-200 dark:border-fuchsia-800/40 text-indigo-700 dark:text-violet-300 hover:bg-indigo-50 dark:hover:bg-fuchsia-950/50 hover:text-indigo-800 dark:hover:text-violet-200 backdrop-blur-sm"
                  >
                    <Eye className="h-3 w-3 mr-0.5" />
                    <span>{poemOfTheDay?.viewsCount || 0}</span>
                  </Button>

                  {handleReadlistToggle && poemOfTheDay && (
                    <Button
                      onClick={() =>
                        handleReadlistToggle(
                          poemOfTheDay._id,
                          poemOfTheDay.title?.en || "Untitled"
                        )
                      }
                      variant="outline"
                      size="sm"
                      className={`h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-indigo-200 dark:border-fuchsia-800/40 
                        ${
                          isInReadlist
                            ? "bg-indigo-50 dark:bg-fuchsia-950/50 text-indigo-700 dark:text-violet-300"
                            : "text-indigo-700 dark:text-violet-300 hover:bg-indigo-50 dark:hover:bg-fuchsia-950/50 hover:text-indigo-800 dark:hover:text-violet-200"
                        } backdrop-blur-sm`}
                    >
                      <Heart
                        className={`h-3 w-3 mr-0.5 ${
                          isInReadlist
                            ? "fill-indigo-500 dark:fill-fuchsia-500 text-indigo-500 dark:text-fuchsia-500"
                            : ""
                        }`}
                      />
                    </Button>
                  )}

                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-indigo-200 dark:border-fuchsia-800/40 text-indigo-700 dark:text-violet-300 hover:bg-indigo-50 dark:hover:bg-fuchsia-950/50 hover:text-indigo-800 dark:hover:text-violet-200 backdrop-blur-sm"
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
            </div>
          ) : (
            <div className="text-center p-6 bg-gradient-to-b from-white/50 to-white/20 dark:from-slate-900/50 dark:to-slate-900/20 rounded-lg border border-indigo-200/30 dark:border-fuchsia-700/20 shadow-inner backdrop-blur-sm">
              <p className="text-sm text-slate-600 dark:text-slate-400 italic font-serif">
                No line of the day available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

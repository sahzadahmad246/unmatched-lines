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
      <div className="bg-gradient-to-br from-background to-muted/10 rounded-xl border border-primary/20 shadow-md h-full">
        <div className="p-5 sm:p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h2 className="text-base sm:text-lg font-medium font-sans">
                Line of the Day
              </h2>
            </div>
            <div className="text-xs text-muted-foreground font-sans">
              {todayDate}
            </div>
          </div>

          {lineOfTheDay ? (
            <div className="relative flex-grow flex flex-col">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col h-full"
              >
                {/* Formatted Lines */}
                <div className="text-center mb-5 max-w-md mx-auto">
                  {formatVerseForDisplay(lineOfTheDay).map((line, index) => (
                    <p
                      key={index}
                      className="text-base sm:text-lg md:text-xl font-sans mb-2 leading-relaxed"
                    >
                      {line}
                    </p>
                  ))}
                </div>

                {/* Poet Info - Aligned in row */}
                <div className="flex items-center justify-center gap-3 mb-5">
                  <Avatar className="h-10 w-10 border border-primary/20">
                    {authorImage ? (
                      <AvatarImage
                        src={authorImage || "/placeholder.svg"}
                        alt={lineAuthor}
                      />
                    ) : (
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium font-sans">
                      {lineAuthor}
                    </span>
                    <div className="w-full h-0.5 bg-primary/30 rounded-full mt-1"></div>
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
                      className="gap-1 text-xs sm:text-sm font-sans"
                    >
                      <Link
                        href={`/poems/en/${
                          poemOfTheDay.slug?.en || poemOfTheDay._id
                        }`}
                      >
                        <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      </Link>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-xs sm:text-sm font-sans"
                  >
                    <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
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
            </div>
          ) : (
            <div className="text-center p-6 bg-muted/20 rounded-lg border border-primary/10">
              <p className="text-muted-foreground italic font-sans">
                No line of the day available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

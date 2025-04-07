"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { Calendar, BookOpen } from "lucide-react";
import { VerseDownload } from "../home/verse-download";

interface Poem {
  _id: string;
  title: { en: string; hi?: string; ur?: string };
  author: { name: string; _id: string };
  category: string; 
  slug?: { en: string };
  content?: {
    en?: string[] | string;
    hi?: string[] | string;
    ur?: string[] | string;
  };
}

interface LineOfTheDayProps {
  poems: Poem[];
  coverImages: { url: string }[];
}

export function LineOfTheDay({ poems, coverImages }: LineOfTheDayProps) {
  const [lineOfTheDay, setLineOfTheDay] = useState<string>("");
  const [lineAuthor, setLineAuthor] = useState<string>("");
  const [poemOfTheDay, setPoemOfTheDay] = useState<Poem | null>(null);
  const [todayDate] = useState(
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  );

  useEffect(() => {
    if (poems.length === 0) return;

    const dateStr = new Date().toISOString().split("T")[0];
    let seed = 0;
    for (let i = 0; i < dateStr.length; i++) seed += dateStr.charCodeAt(i);

    const poemIndex = seed % poems.length;
    const selectedPoem = poems[poemIndex];
    setPoemOfTheDay(selectedPoem);

    const verses = {
      en: Array.isArray(selectedPoem.content?.en)
        ? selectedPoem.content.en.filter(Boolean)
        : selectedPoem.content?.en?.split("\n").filter(Boolean) || [],
      hi: Array.isArray(selectedPoem.content?.hi)
        ? selectedPoem.content.hi.filter(Boolean)
        : selectedPoem.content?.hi?.split("\n").filter(Boolean) || [],
      ur: Array.isArray(selectedPoem.content?.ur)
        ? selectedPoem.content.ur.filter(Boolean)
        : selectedPoem.content?.ur?.split("\n").filter(Boolean) || [],
    };

    const verseArray =
      verses.en.length > 0 ? verses.en : verses.hi.length > 0 ? verses.hi : verses.ur.length > 0 ? verses.ur : [];
    if (verseArray.length > 0) {
      const verseIndex = seed % verseArray.length;
      setLineOfTheDay(verseArray[verseIndex] || "No verse available");
    }
    setLineAuthor(selectedPoem.author?.name || "Unknown Author");
  }, [poems]);

  const getRandomCoverImage = () => {
    if (coverImages.length === 0) return "/placeholder.svg?height=1080&width=1920";
    const randomIndex = Math.floor(Math.random() * coverImages.length);
    return coverImages[randomIndex].url;
  };

  const formatVerseForDisplay = (verse: string) => {
    if (!verse) return ["No verse available"];
    const lines = verse.split("\n").filter(Boolean);
    return lines.length > 0 ? lines : [verse];
  };

  return (
    <section className="py-10 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif">Line of the Day</h2>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground font-serif">{todayDate}</div>
          </div>

          {lineOfTheDay ? (
            <div className="relative overflow-hidden rounded-lg shadow-md">
              <div className="absolute inset-0 z-0">
                <Image
                  src={getRandomCoverImage()}
                  alt="Line of the Day background"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80" />
              </div>

              <div className="relative z-10 p-6 sm:p-10 md:p-12 flex flex-col items-center text-center text-white">
                <div className="text-sm sm:text-base md:text-xl italic font-serif mb-4 leading-relaxed">
                  {formatVerseForDisplay(lineOfTheDay).map((line, index) => (
                    <p key={index} className="mb-2">"{line}"</p>
                  ))}
                </div>
                <Separator className="w-12 sm:w-16 my-3 sm:my-4 bg-white/30" />
                <p className="text-xs sm:text-sm md:text-base text-white/80 font-serif mb-6">— {lineAuthor}</p>

                <div className="flex items-center justify-center gap-3">
                  <VerseDownload
                    verse={lineOfTheDay}
                    author={lineAuthor}
                    imageUrl={getRandomCoverImage()}
                    title="Line of the Day"
                    languages={poemOfTheDay?.content}
                  />
                  {poemOfTheDay && (
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      className="gap-2 font-serif text-xs sm:text-sm text-black border"
                    >
                      <Link href={`/poems/en/${poemOfTheDay.slug?.en || poemOfTheDay._id}`}>
                        <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>Read Full Poem</span>
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 sm:p-12 bg-muted/20 rounded-lg border border-primary/10">
              <p className="text-muted-foreground italic font-serif">No line of the day available</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
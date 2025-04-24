"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Quote, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VerseDownload } from "./verse-download";
import type { Poem } from "@/types/poem";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CoverImage {
  _id: string;
  url: string;
}

interface Author {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  bio?: string;
}

interface TopFivePicksProps {
  poems: Poem[];
  coverImages: CoverImage[];
}

export function TopFivePicks({ poems, coverImages }: TopFivePicksProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [randomVerses, setRandomVerses] = useState<{ verse: string[]; poem: Poem }[]>([]);
  const [authorDataMap, setAuthorDataMap] = useState<Record<string, Author>>({});

  // Fetch random verses
  useEffect(() => {
    const getRandomVerses = () => {
      const englishPoems = poems.filter((poem) => poem.content?.en && poem.content.en.length > 0);

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

  // Fetch author data for poems in randomVerses
  useEffect(() => {
    const fetchAuthorsData = async () => {
      const authorIds = [...new Set(randomVerses.map((verse) => verse.poem.author._id))].filter(Boolean);
      const authorDataMap: Record<string, Author> = {};

      await Promise.all(
        authorIds.map(async (authorId) => {
          try {
            const res = await fetch(`/api/authors/${authorId}`, { credentials: "include" });
            if (!res.ok) return;
            const data = await res.json();
            if (data.author) authorDataMap[authorId] = data.author;
          } catch (error) {
            console.error(`TopFivePicks - Error fetching author ${authorId}:`, error);
          }
        })
      );

      setAuthorDataMap(authorDataMap);
    };

    if (randomVerses.length > 0) fetchAuthorsData();
  }, [randomVerses]);

  const getRandomCoverImage = () => {
    if (coverImages.length === 0) return "/placeholder.svg?height=400&width=600";
    const randomIndex = Math.floor(Math.random() * coverImages.length);
    return coverImages[randomIndex].url;
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % randomVerses.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + randomVerses.length) % randomVerses.length);
  };

  if (randomVerses.length === 0) return null;

  const currentVerse = randomVerses[currentIndex];
  const authorData = currentVerse.poem.author._id ? authorDataMap[currentVerse.poem.author._id] : null;

  return (
    <section className="py-10 sm:py-16 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />
      <div className="absolute -left-20 top-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -right-20 bottom-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col items-center mb-8 sm:mb-10"
        >
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-medium font-sans">Daily Inspiration</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-sans text-center relative">
            <span className="relative">
              Top Five Picks
              <motion.span
                className="absolute -bottom-2 left-0 w-full h-1 bg-primary/30 rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                transition={{ delay: 0.3, duration: 0.6 }}
                viewport={{ once: true }}
              />
            </span>
          </h2>
        </motion.div>

        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-background to-muted/50 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl">
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
                  <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-primary/20" />
                </div>

                <div className="p-6 sm:p-8 md:p-10 flex flex-col items-center">
                  <div className="text-center space-y-4 sm:space-y-6 max-w-xl mx-auto">
                    <div className="space-y-2 sm:space-y-3 pt-4">
                      {currentVerse.verse.map((line, idx) => (
                        <motion.p
                          key={idx}
                          className="text-sm sm:text-base md:text-lg font-sans italic leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.2, duration: 0.4 }}
                        >
                          {line}
                        </motion.p>
                      ))}
                    </div>

                    <motion.div
                      className="pt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                    >
                      <div className="w-12 h-0.5 bg-primary/30 mx-auto mb-4" />
                      <div className="flex items-center justify-center gap-2">
                        <Avatar className="h-6 w-6 border border-primary/20">
                          {authorData?.image ? (
                            <AvatarImage src={authorData.image} alt={authorData.name || currentVerse.poem.author.name} />
                          ) : (
                            <AvatarFallback className="font-sans">
                              {currentVerse.poem.author.name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <p className="text-xs sm:text-sm text-muted-foreground font-sans">
                          {authorData?.name || currentVerse.poem.author.name}
                        </p>
                      </div>
                    </motion.div>

                    <motion.div
                      className="flex justify-center gap-2 sm:gap-3 pt-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                    >
                      <VerseDownload
                        verse={currentVerse.verse.join("\n")}
                        author={currentVerse.poem.author.name}
                        title={currentVerse.poem.title.en}
                        imageUrl={getRandomCoverImage()}
                        languages={{
                          en: currentVerse.poem.content?.en?.map((item) => item.verse) || [],
                          hi: currentVerse.poem.content?.hi?.map((item) => item.verse) || [],
                          ur: currentVerse.poem.content?.ur?.map((item) => item.verse) || [],
                        }}
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs h-8 bg-white shadow-sm font-sans"
                        aria-label="View count"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="font-sans">{currentVerse.poem.viewsCount || 0}</span>
                      </Button>
                    </motion.div>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
                  <Quote className="h-6 w-6 sm:h-8 sm:w-8 text-primary/20 rotate-180" />
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full shadow-md bg-background/80 backdrop-blur-sm border h-10 w-10 hidden sm:flex hover:bg-background hover:scale-110 transition-all duration-300"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full shadow-md bg-background/80 backdrop-blur-sm border h-10 w-10 hidden sm:flex hover:bg-background hover:scale-110 transition-all duration-300"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col items-center mt-6 gap-4">
          <div className="flex items-center gap-3 sm:hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="rounded-full h-8 w-8 border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            <div className="flex items-center gap-2">
              {randomVerses.map((_, index) => (
                <button key={index} onClick={() => setCurrentIndex(index)} className="group focus:outline-none">
                  <span
                    className={`block w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-primary w-5"
                        : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
                    }`}
                  />
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
              className="rounded-full h-8 w-8 border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {randomVerses.map((_, index) => (
              <button key={index} onClick={() => setCurrentIndex(index)} className="group focus:outline-none">
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30 w-3 group-hover:bg-muted-foreground/50"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
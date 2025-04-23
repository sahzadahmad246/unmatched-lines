"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { VerseDownload } from "./verse-download";
import { Poem } from "@/types/poem";

interface CoverImage {
  _id: string;
  url: string;
}

interface TopFivePicksProps {
  poems: Poem[];
  coverImages: CoverImage[];
}

export function TopFivePicks({ poems, coverImages }: TopFivePicksProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [randomVerses, setRandomVerses] = useState<{ verse: string[]; poem: Poem }[]>([]);

  useEffect(() => {
    const getRandomVerses = () => {
      const englishPoems = poems.filter(
        (poem) => poem.content?.en && poem.content.en.length > 0
      );
  
      const shuffledPoems = [...englishPoems].sort(() => Math.random() - 0.5);
      const verses: { verse: string[]; poem: Poem }[] = [];
  
      for (let i = 0; i < 5 && i < shuffledPoems.length; i++) {
        const poem = shuffledPoems[i];
        const lines = poem.content?.en
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

  return (
    <section className="py-12 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background pointer-events-none" />
      <div className="absolute -left-20 top-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute -right-20 bottom-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col items-center mb-10 sm:mb-12"
        >
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Daily Inspiration</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-center relative">
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
                  <Quote className="h-8 w-8 sm:h-10 sm:w-10 text-primary/20" />
                </div>

                <div className="p-8 sm:p-10 md:p-12 flex flex-col items-center">
                  <div className="text-center space-y-6 sm:space-y-8 max-w-xl mx-auto">
                    <div className="space-y-4 sm:space-y-5 pt-6">
                      {currentVerse.verse.map((line, idx) => (
                        <motion.p
                          key={idx}
                          className="text-lg sm:text-xl md:text-2xl font-serif italic leading-relaxed"
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
                      <p className="text-sm sm:text-base text-muted-foreground font-serif">
                        — {currentVerse.poem.author.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground/70 font-serif mt-1">
                        "{currentVerse.poem.title.en}"
                      </p>
                    </motion.div>

                    <motion.div
                      className="flex justify-center pt-2"
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
                    </motion.div>
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6">
                  <Quote className="h-8 w-8 sm:h-10 sm:w-10 text-primary/20 rotate-180" />
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full shadow-md bg-background/80 backdrop-blur-sm border h-12 w-12 hidden sm:flex hover:bg-background hover:scale-110 transition-all duration-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full shadow-md bg-background/80 backdrop-blur-sm border h-12 w-12 hidden sm:flex hover:bg-background hover:scale-110 transition-all duration-300"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col items-center mt-8 gap-4">
          <div className="flex items-center gap-3 sm:hidden">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrev}
              className="rounded-full h-10 w-10 border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2">
              {randomVerses.map((_, index) => (
                <button key={index} onClick={() => setCurrentIndex(index)} className="group focus:outline-none">
                  <span
                    className={`block w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-primary w-6"
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
              className="rounded-full h-10 w-10 border-primary/20 hover:bg-primary/10 hover:border-primary/30 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {randomVerses.map((_, index) => (
              <button key={index} onClick={() => setCurrentIndex(index)} className="group focus:outline-none">
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary w-8"
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
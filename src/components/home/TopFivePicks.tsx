"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VerseDownload } from "./verse-download";

interface Poem {
  _id: string;
  title: { en: string; hi?: string; ur?: string };
  author: { name: string; _id: string };
  content?: {
    en?: string[] | string;
    hi?: string[] | string;
    ur?: string[] | string;
  };
}

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
  const [randomVerses, setRandomVerses] = useState<
    { verse: string; poem: Poem; lang: "en" | "hi" | "ur" }[]
  >([]);

  useEffect(() => {
    // Generate 5 random verses when component mounts or poems change
    const getRandomVerses = () => {
      const shuffledPoems = [...poems].sort(() => Math.random() - 0.5);
      const verses: { verse: string; poem: Poem; lang: "en" | "hi" | "ur" }[] = [];
      
      for (let i = 0; i < 5 && i < shuffledPoems.length; i++) {
        const poem = shuffledPoems[i];
        const availableLangs = Object.entries({
          en: poem.content?.en,
          hi: poem.content?.hi,
          ur: poem.content?.ur,
        }).filter(([_, content]) => content && (Array.isArray(content) ? content.length > 0 : content.trim() !== ""));
        
        if (availableLangs.length === 0) continue;
        
        const randomLang = availableLangs[Math.floor(Math.random() * availableLangs.length)][0] as "en" | "hi" | "ur";
        const content = poem.content?.[randomLang];
        
        let lines: string[] = [];
        if (typeof content === "string") {
          lines = content.split("\n").filter(Boolean);
        } else if (Array.isArray(content)) {
          lines = content.flatMap(stanza => stanza.split("\n")).filter(Boolean);
        }
        
        if (lines.length > 0) {
          const randomVerse = lines[Math.floor(Math.random() * lines.length)];
          verses.push({ verse: randomVerse, poem, lang: randomLang });
        }
      }
      
      setRandomVerses(verses);
    };

    getRandomVerses();
  }, [poems]);

  const getRandomCoverImage = () => {
    if (coverImages.length === 0) return "/placeholder.svg";
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
    <section className="py-10 sm:py-16 bg-muted/20">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 font-serif text-center">
          Top Five Picks
        </h2>

        <div className="relative max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="text-center space-y-4">
                    <blockquote className="text-sm sm:text-base md:text-lg font-serif italic">
                      "{currentVerse.verse}"
                    </blockquote>
                    <p className="text-xs sm:text-sm text-muted-foreground font-serif">
                      — {currentVerse.poem.author.name}, "{currentVerse.poem.title[currentVerse.lang] || currentVerse.poem.title.en}"
                    </p>
                    <div className="flex justify-center">
                      <VerseDownload
                        verse={currentVerse.verse}
                        author={currentVerse.poem.author.name}
                        title={currentVerse.poem.title[currentVerse.lang] || currentVerse.poem.title.en}
                        imageUrl={getRandomCoverImage()}
                        languages={{
                          en: currentVerse.lang === "en" ? [currentVerse.verse] : undefined,
                          hi: currentVerse.lang === "hi" ? [currentVerse.verse] : undefined,
                          ur: currentVerse.lang === "ur" ? [currentVerse.verse] : undefined,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          <Button
            variant="outline"
            size="icon"
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-center mt-4">
          {randomVerses.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 mx-1 rounded-full ${
                index === currentIndex ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
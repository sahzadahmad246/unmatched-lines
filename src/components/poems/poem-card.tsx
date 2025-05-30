"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, User, ChevronDown, BookmarkPlus, BookHeart, Languages, Copy, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Poem } from "@/types/poem";

interface PoemCardProps {
  poem: Poem;
  coverImage: string;
  englishSlug: string;
  isInReadlist: boolean;
  poemTitle: string;
  handleReadlistToggle: (id: string, title: string) => void;
}

export function PoemCard({
  poem,
  coverImage,
  englishSlug,
  isInReadlist,
  poemTitle,
  handleReadlistToggle,
}: PoemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentLang, setContentLang] = useState<"en" | "hi" | "ur">("en");

  // Determine available languages
  const availableLanguages = Object.entries({
    en: poem.content?.en,
    hi: poem.content?.hi,
    ur: poem.content?.ur,
  })
    .filter(([_, content]) => content && content.length > 0)
    .map(([lang]) => lang as "en" | "hi" | "ur");

  // Default to first available language if selected language is unavailable
  useState(() => {
    if (availableLanguages.length > 0 && !availableLanguages.includes(contentLang)) {
      setContentLang(availableLanguages[0]);
    }
  });

  // Format poetry content for display
  const formatPoetryContent = (content: { verse: string; meaning: string }[] | undefined) => {
    if (!content || content.length === 0) {
      return <div className="italic text-muted-foreground text-xs">Content not available</div>;
    }

    const stanzas = content
      .map((item) => item.verse)
      .filter(Boolean)
      .flatMap((verse) => verse.split("\n\n"))
      .filter(Boolean);

    if (stanzas.length === 0) {
      return <div className="italic text-muted-foreground text-xs">Content not available</div>;
    }

    return (
      <div className="space-y-4">
        {stanzas.slice(0, 2).map((stanza, index) => (
          <div key={index} className="poem-stanza">
            {stanza.split("\n").map((line, lineIndex) => (
              <div key={lineIndex} className="poem-line leading-relaxed text-[11px] sm:text-xs">
                {line || "\u00A0"}
              </div>
            ))}
          </div>
        ))}
        {stanzas.length > 2 && <div className="text-xs text-muted-foreground italic">...</div>}
      </div>
    );
  };

  const getContentForLanguage = (lang: "en" | "hi" | "ur") => {
    return formatPoetryContent(poem.content?.[lang]);
  };

  const getRawContentForCopy = (lang: "en" | "hi" | "ur") => {
    const content = poem.content?.[lang];
    if (!content || content.length === 0) return "";
    return content.map((item) => item.verse).join("\n\n");
  };

  const currentContent = getContentForLanguage(contentLang);

  const handleCopy = () => {
    const contentToCopy = getRawContentForCopy(contentLang);
    navigator.clipboard
      .writeText(contentToCopy)
      .then(() => {
        toast.success("Verses copied", {
          description: "The poem verses have been copied to your clipboard",
          icon: <Copy className="h-4 w-4" />,
        });
      })
      .catch(() => {
        toast.error("Copy failed", {
          description: "Failed to copy the verses",
        });
      });
  };

  // Language display names
  const languageNames: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    ur: "Urdu",
  };

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30 bg-background/80 backdrop-blur-sm">
      <CardContent className="flex-grow p-3 sm:p-4 pt-4">
        <div className="flex justify-between items-start mb-2 sm:mb-3">
          <Badge variant="secondary" className="font-serif capitalize text-xs bg-primary/10 text-primary">
            {poem.category || "Poetry"}
          </Badge>
          <button
            className="p-1 sm:p-1.5 rounded-full hover:bg-muted transition-colors"
            onClick={() => handleReadlistToggle(poem._id, poemTitle)}
            aria-label={isInReadlist ? "Remove from reading list" : "Add to reading list"}
          >
            {isInReadlist ? (
              <BookHeart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
            ) : (
              <BookmarkPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </button>
        </div>

        <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2 font-serif">
          {poem.title[contentLang] || poem.title.en}
        </h3>

        <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2 sm:mb-3 font-serif">
          <User className="h-3 w-3" /> {poem.author.name}
        </p>

        {poem.summary?.en && (
          <p className="text-xs text-muted-foreground line-clamp-2 font-serif mb-2 sm:mb-3">{poem.summary.en}</p>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs sm:text-sm font-medium p-1.5 sm:p-2 rounded-md hover:bg-muted transition-colors"
          aria-expanded={isExpanded}
        >
          <span>View Verses</span>
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mt-2"
            >
              {availableLanguages.length > 1 && (
                <div className="mb-2 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <Languages className="h-3 w-3 text-muted-foreground" />
                    <Tabs
                      value={contentLang}
                      onValueChange={(value) => setContentLang(value as "en" | "hi" | "ur")}
                      className="w-auto"
                    >
                      <TabsList className="h-7">
                        {availableLanguages.map((lang) => (
                          <TabsTrigger key={lang} value={lang} className="text-xs px-2 py-0.5 h-5">
                            {languageNames[lang]}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </Tabs>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-muted rounded-full transition-colors"
                    aria-label="Copy verses"
                  >
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
              )}

              <div className="bg-muted/30 p-2 sm:p-3 rounded-md font-serif poem-content">
                <div className={contentLang === "ur" ? "text-right" : ""}>{currentContent}</div>
              </div>

              <div className="mt-3">
                <Button asChild variant="default" size="sm" className="gap-1 font-serif text-xs w-full">
                  <Link href={`/poems/en/${englishSlug}`}>
                    <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> See Full Poem
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="p-3 pt-0 mt-auto">
        <div className="w-full flex items-center justify-end gap-3">
          {poem.readListCount !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3 w-3 text-primary" />
              <span>{poem.readListCount}</span>
            </div>
          )}
          {poem.viewsCount !== undefined && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <BookOpen className="h-3 w-3" />
              <span>{poem.viewsCount}</span>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
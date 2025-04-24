"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Poem, Author } from "@/types/poem";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Feather, User, Quote, ArrowRight, Heart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PoemListItemProps {
  poem: Poem;
  coverImage: string;
  englishSlug: string;
  isInReadlist: boolean;
  poemTitle: string;
  handleReadlistToggle: (id: string, title: string) => void;
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const customStyles = `
  .poem-card {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .poem-card-content {
    flex-grow: 1;
  }

  .urdu-text {
    font-family: 'Fajer Noori Nastalique', sans-serif;
    direction: rtl;
    text-align: center;
    line-height: 1.8;
    font-size: 0.95rem;
  }
`;

export function PoemListItem({
  poem,
  coverImage,
  englishSlug,
  isInReadlist,
  poemTitle,
  handleReadlistToggle,
}: PoemListItemProps) {
  const [language, setLanguage] = useState<"en" | "hi" | "ur">("en");
  const [authorData, setAuthorData] = useState<Author | null>(null);
  const isSherCategory = poem.category.toLowerCase() === "sher";

  // Fetch author data
  useEffect(() => {
    const fetchAuthorData = async () => {
      if (!poem.author._id) return;
      try {
        const res = await fetch(`/api/authors/${poem.author._id}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.author) setAuthorData(data.author);
      } catch (error) {
        console.error(
          `PoemListItem - Error fetching author ${poem.author._id}:`,
          error
        );
      }
    };

    fetchAuthorData();
  }, [poem.author._id]);

  const formatPoetryContent = (
    content: { verse: string; meaning: string }[] | undefined,
    lang: "en" | "hi" | "ur"
  ): React.ReactNode => {
    if (!content || content.length === 0 || !content[0]?.verse) {
      return (
        <div
          className={`text-muted-foreground italic text-xs ${
            lang === "ur" ? "urdu-text" : ""
          }`}
        >
          {lang === "en"
            ? "Content not available"
            : lang === "hi"
            ? "सामग्री उपलब्ध नहीं है"
            : "مواد دستیاب نہیں ہے"}
        </div>
      );
    }

    const lines = content[0].verse.split("\n").filter(Boolean);
    if (lines.length === 0) {
      return (
        <div
          className={`text-muted-foreground italic text-xs ${
            lang === "ur" ? "urdu-text" : ""
          }`}
        >
          {lang === "en"
            ? "Content not available"
            : lang === "hi"
            ? "सामग्री उपलब्ध नहीं है"
            : "مواد دستیاب نہیں ہے"}
        </div>
      );
    }

    if (isSherCategory) {
      return (
        <div className={`space-y-1 ${lang === "ur" ? "urdu-text" : ""}`}>
          {lines.map((line, lineIndex) => (
            <div
              key={lineIndex}
              className={`poem-line leading-relaxed text-sm font-serif ${
                lang === "ur" ? "urdu-text" : ""
              }`}
            >
              {line || "\u00A0"}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={`space-y-1 ${lang === "ur" ? "urdu-text" : ""}`}>
        {lines.slice(0, 2).map((line, lineIndex) => (
          <div
            key={lineIndex}
            className={`poem-line leading-relaxed text-xs sm:text-sm font-serif line-clamp-1 ${
              lang === "ur" ? "urdu-text" : ""
            }`}
          >
            {line || "\u00A0"}
          </div>
        ))}
      </div>
    );
  };

  const currentSlug = poem.slug[language] || poem.slug.en || poem._id;
  const currentTitle = poem.title[language] || poem.title.en || "Untitled";
  const currentContent = poem.content?.[language] || poem.content?.en || [];
  const poemLanguage = poem.content?.[language] ? language : "en";

  return (
    <>
      <style>{customStyles}</style>
      <motion.article variants={slideUp} className="h-full">
        <Card className="border shadow-sm hover:shadow-xl transition-all duration-300 h-full bg-white dark:bg-slate-900 overflow-hidden group poem-card">
          <CardHeader className={`p-4 ${isSherCategory ? "pb-0" : "pb-2"}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {!isSherCategory && (
                  <h2
                    className={`text-lg font-semibold text-primary hover:text-primary/80 font-serif group-hover:underline decoration-dotted underline-offset-4 ${
                      language === "ur" ? "urdu-text" : ""
                    }`}
                  >
                    <Link href={`/poems/${poemLanguage}/${currentSlug}`}>
                      {currentTitle}
                    </Link>
                  </h2>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6 border border-primary/20">
                    {authorData?.image ? (
                      <AvatarImage
                        src={authorData.image}
                        alt={authorData.name || poem.author.name}
                      />
                    ) : (
                      <AvatarFallback>
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <p
                    className={`text-gray-600 dark:text-gray-400 text-xs ${
                      language === "ur" ? "urdu-text" : ""
                    }`}
                  >
                    {authorData?.name || poem.author.name || "Unknown Author"}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={() => handleReadlistToggle(poem._id, currentTitle)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="p-1"
                aria-label={
                  isInReadlist ? "Remove from readlist" : "Add to readlist"
                }
              >
                <Heart
                  className={`h-5 w-5 ${
                    isInReadlist ? "fill-red-500 text-red-500" : "text-gray-500"
                  }`}
                />
              </motion.button>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-2 poem-card-content">
            <Link
              href={`/poems/${poemLanguage}/${currentSlug}`}
              className="block"
            >
              <div
                className={`${
                  isSherCategory ? "mt-2" : "mt-0"
                } font-serif text-gray-800 dark:text-gray-200 border-l-2 border-primary/30 pl-3 py-1`}
              >
                {formatPoetryContent(currentContent, poemLanguage)}
              </div>
            </Link>
          </CardContent>

          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs bg-primary/5 hover:bg-primary/10 transition-colors ${
                  language === "ur" ? "urdu-text" : ""
                }`}
              >
                {poem.category || "Uncategorized"}
              </Badge>
              <Badge
                variant="outline"
                className="gap-1 text-xs bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <Eye className="h-3 w-3" />
                <span>{poem.viewsCount || 0}</span>
              </Badge>
            </div>
            <motion.div
              className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-medium"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link href={`/poems/${poemLanguage}/${currentSlug}`}>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.article>
    </>
  );
}
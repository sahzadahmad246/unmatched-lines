"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ArrowRight, Tag, User } from "lucide-react";

interface Poem {
  _id: string;
  title: {
    en?: string;
    hi?: string;
    ur?: string;
  };
  slug: any;
  author: {
    _id: string;
    name: string;
  };
  category: string;
}

interface RelatedPoemsProps {
  currentPoem: Poem;
  language: "en" | "hi" | "ur";
  hideTitle?: boolean;
}

interface RelatedPoemsData {
  byCategory: Poem[];
  byAuthor: Poem[];
}

export default function RelatedPoems({ currentPoem, language, hideTitle = false }: RelatedPoemsProps) {
  const [relatedPoems, setRelatedPoems] = useState<RelatedPoemsData>({
    byCategory: [],
    byAuthor: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPoems = async () => {
      try {
        const res = await fetch(
          `/api/related-poems?category=${encodeURIComponent(currentPoem.category)}&authorId=${currentPoem.author._id}&lang=${language}&excludeId=${currentPoem._id}`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Failed to fetch related poems");
        const data = await res.json();
        setRelatedPoems({
          byCategory: data.byCategory || [],
          byAuthor: data.byAuthor || [],
        });
      } catch (error) {
        console.error("Error fetching related poems:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPoems();
  }, [currentPoem, language]);

  const getSlug = (poem: Poem) => {
    return Array.isArray(poem.slug)
      ? poem.slug.find((s) => s[language])?.[language] || poem.slug[0].en
      : poem.slug[language] || poem.slug.en;
  };

  if (loading) {
    return (
      <div className="mt-4 space-y-2">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          <Skeleton className="h-20 rounded-md" />
          <Skeleton className="h-20 rounded-md" />
          <Skeleton className="h-20 rounded-md" />
        </div>
      </div>
    );
  }

  if (relatedPoems.byCategory.length === 0 && relatedPoems.byAuthor.length === 0) {
    return null;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  return (
    <div className="mt-4 sm:mt-6">
      {!hideTitle && (
        <motion.h2
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-base sm:text-lg font-medium text-muted-foreground mb-2 sm:mb-3 flex items-center"
        >
          <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          Explore More Poems
        </motion.h2>
      )}

      {relatedPoems.byCategory.length > 0 && (
        <div className="mb-4">
          <motion.h3
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-muted-foreground flex items-center border-l-2 border-primary/30 pl-2"
          >
            <Tag className="h-3 w-3 mr-1.5" />
            More in {currentPoem.category}
          </motion.h3>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {relatedPoems.byCategory.slice(0, 3).map((poem) => (
              <motion.div key={poem._id} variants={item} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href={`/poems/${language}/${getSlug(poem)}`}>
                  <Card className="hover:bg-primary/5 transition-colors border-muted/50 overflow-hidden group relative h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-2.5 sm:p-3 relative z-10">
                      <p
                        className={`text-xs sm:text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors ${
                          language === "ur" ? "urdu-text" : ""
                        }`}
                      >
                        {poem.title?.[language] || "Untitled"}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p
                          className={`text-[10px] sm:text-xs text-muted-foreground flex items-center ${
                            language === "ur" ? "urdu-text" : ""
                          }`}
                        >
                          <User className="h-2.5 w-2.5 mr-1" />
                          <span className="truncate max-w-[100px]">{poem.author?.name || "Unknown Author"}</span>
                        </p>
                        <motion.div
                          className="text-primary/70 opacity-70 group-hover:opacity-100"
                          initial={{ x: 0 }}
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ArrowRight className="h-3 w-3" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {relatedPoems.byAuthor.length > 0 && (
        <div>
          <motion.h3
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 text-muted-foreground flex items-center border-l-2 border-primary/30 pl-2"
          >
            <User className="h-3 w-3 mr-1.5" />
            More by {currentPoem.author.name}
          </motion.h3>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {relatedPoems.byAuthor.slice(0, 3).map((poem) => (
              <motion.div key={poem._id} variants={item} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link href={`/poems/${language}/${getSlug(poem)}`}>
                  <Card className="hover:bg-primary/5 transition-colors border-muted/50 overflow-hidden group relative h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardContent className="p-2.5 sm:p-3 relative z-10">
                      <p
                        className={`text-xs sm:text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors ${
                          language === "ur" ? "urdu-text" : ""
                        }`}
                      >
                        {poem.title?.[language] || "Untitled"}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p
                          className={`text-[10px] sm:text-xs text-muted-foreground flex items-center ${
                            language === "ur" ? "urdu-text" : ""
                          }`}
                        >
                          <Tag className="h-2.5 w-2.5 mr-1" />
                          <span className="truncate max-w-[100px]">{poem.category}</span>
                        </p>
                        <motion.div
                          className="text-primary/70 opacity-70 group-hover:opacity-100"
                          initial={{ x: 0 }}
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ArrowRight className="h-3 w-3" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
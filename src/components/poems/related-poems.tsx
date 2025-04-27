"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ArrowRight, Tag, User, Heart, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  readListCount: number;
  viewsCount: number;
}

interface Author {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  bio?: string;
}

interface RelatedPoemsProps {
  currentPoem: Poem;
  language: "en" | "hi" | "ur";
  hideTitle?: boolean;
  readList?: string[];
  handleReadlistToggle: (id: string, title: string) => void;
}

interface RelatedPoemsData {
  byCategory: Poem[];
  byAuthor: Poem[];
}

const customStyles = `
  .urdu-text {
    font-family: 'Fajer Noori Nastalique', sans-serif;
    direction: rtl;
    text-align: right;
    line-height: 1.8;
    font-size: 0.95rem;
  }
  
  .poem-card {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .title-section {
    border-left: 2px solid hsl(var(--primary) / 0.3);
    padding-left: 0.75rem;
  }
`;

export default function RelatedPoems({
  currentPoem,
  language,
  hideTitle = false,
  readList = [],
  handleReadlistToggle,
}: RelatedPoemsProps) {
  const [relatedPoems, setRelatedPoems] = useState<RelatedPoemsData>({
    byCategory: [],
    byAuthor: [],
  });
  const [loading, setLoading] = useState(true);
  const [authorDataMap, setAuthorDataMap] = useState<Record<string, Author>>(
    {}
  );

  // Fetch related poems
  useEffect(() => {
    const fetchRelatedPoems = async () => {
      try {
        const res = await fetch(
          `/api/related-poems?category=${encodeURIComponent(
            currentPoem.category
          )}&authorId=${currentPoem.author._id}&lang=${language}&excludeId=${
            currentPoem._id
          }`,
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

  // Fetch author data
  useEffect(() => {
    const fetchAuthorsData = async () => {
      const poems = [...relatedPoems.byCategory, ...relatedPoems.byAuthor];
      const authorIds = [
        ...new Set(poems.map((poem) => poem.author._id)),
      ].filter(Boolean);
      const authorDataMap: Record<string, Author> = {};

      await Promise.all(
        authorIds.map(async (authorId) => {
          try {
            const res = await fetch(`/api/authors/${authorId}`, {
              credentials: "include",
            });
            if (!res.ok) return;
            const data = await res.json();
            if (data.author) authorDataMap[authorId] = data.author;
          } catch (error) {
            console.error(
              `RelatedPoems - Error fetching author ${authorId}:`,
              error
            );
          }
        })
      );

      setAuthorDataMap(authorDataMap);
    };

    if (relatedPoems.byCategory.length > 0 || relatedPoems.byAuthor.length > 0)
      fetchAuthorsData();
  }, [relatedPoems]);

  const getSlug = (poem: Poem) => {
    return Array.isArray(poem.slug)
      ? poem.slug.find((s) => s[language])?.[language] || poem.slug[0].en
      : poem.slug[language] || poem.slug.en;
  };

  if (loading) {
    return (
      <div className="mt-4 space-y-2">
        <Skeleton className="h-5 w-40" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
          <Skeleton className="h-36 rounded-md" />
          <Skeleton className="h-36 rounded-md" />
        </div>
      </div>
    );
  }

  if (
    relatedPoems.byCategory.length === 0 &&
    relatedPoems.byAuthor.length === 0
  ) {
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

  const renderPoemCard = (poem: Poem, index: number) => {
    const authorData = poem.author._id ? authorDataMap[poem.author._id] : null;
    const currentSlug = getSlug(poem);
    const currentTitle = poem.title[language] || poem.title.en || "Untitled";
    const isInReadlist = readList?.includes(poem._id) || false;

    return (
      <motion.article key={poem._id} variants={item} className="h-full">
        <Card className="border shadow-sm hover:shadow-xl transition-all duration-300 h-full bg-white dark:bg-slate-900 overflow-hidden group poem-card">
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 border border-primary/20">
                  {authorData?.image ? (
                    <AvatarImage
                      src={authorData.image || "/placeholder.svg"}
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

          <CardContent className="p-4 pt-0 pb-2">
            <Link href={`/poems/${language}/${currentSlug}`} className="block">
              <div className="title-section">
                <h2
                  className={`text-sm font-bold text-primary hover:text-primary/80 group-hover:underline decoration-dotted underline-offset-4 ${
                    language === "ur" ? "urdu-text" : ""
                  }`}
                >
                  {currentTitle}
                </h2>
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
              <Link href={`/poems/${language}/${currentSlug}`}>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.article>
    );
  };

  return (
    <>
      <style>{customStyles}</style>
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
              className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {relatedPoems.byCategory
                .slice(0, 3)
                .map((poem, index) => renderPoemCard(poem, index))}
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
              className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {relatedPoems.byAuthor
                .slice(0, 3)
                .map((poem, index) => renderPoemCard(poem, index))}
            </motion.div>
          </div>
        )}
      </div>
    </>
  );
}

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
import {
  BookOpen,
  ArrowRight,
  Tag,
  User,
  Heart,
  Eye,
  Sparkles,
} from "lucide-react";
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
  const [authorDataMap, setAuthorDataMap] = useState<Record<string, Author>>({});

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

  const renderPoemCard = (poem: Poem, index: number, colorScheme: string) => {
    const authorData = poem.author._id ? authorDataMap[poem.author._id] : null;
    const currentSlug = getSlug(poem);
    const currentTitle = poem.title[language] || poem.title.en || "Untitled";
    const isInReadlist = readList?.includes(poem._id) || false;

    // Define color schemes based on index
    let colors;
    if (colorScheme === "purple") {
      colors = {
        gradient:
          "from-purple-50 via-white to-pink-50 dark:from-purple-950 dark:via-slate-950 dark:to-pink-950",
        border: "border-purple-200/60 dark:border-pink-700/20",
        text: "text-purple-700 dark:text-pink-300",
        hover: "hover:bg-purple-50 dark:hover:bg-pink-950/50",
        fill: "fill-purple-500 dark:fill-pink-500 text-purple-500 dark:text-pink-500",
        avatarBg:
          "from-purple-100 via-fuchsia-100 to-pink-100 dark:from-purple-900 dark:via-fuchsia-900 dark:to-pink-900",
        avatarBorder: "border-purple-200 dark:border-pink-700",
        badgeBg:
          "bg-white/80 dark:bg-slate-900/80 border-purple-200/40 dark:border-pink-700/20",
      };
    } else if (colorScheme === "blue") {
      colors = {
        gradient:
          "from-blue-50 via-white to-cyan-50 dark:from-blue-950 dark:via-slate-950 dark:to-cyan-950",
        border: "border-blue-200/60 dark:border-cyan-700/20",
        text: "text-blue-700 dark:text-cyan-300",
        hover: "hover:bg-blue-50 dark:hover:bg-cyan-950/50",
        fill: "fill-blue-500 dark:fill-cyan-500 text-blue-500 dark:text-cyan-500",
        avatarBg:
          "from-blue-100 via-sky-100 to-cyan-100 dark:from-blue-900 dark:via-sky-900 dark:to-cyan-900",
        avatarBorder: "border-blue-200 dark:border-cyan-700",
        badgeBg:
          "bg-white/80 dark:bg-slate-900/80 border-blue-200/40 dark:border-cyan-700/20",
      };
    } else {
      colors = {
        gradient:
          "from-amber-50 via-white to-orange-50 dark:from-amber-950 dark:via-slate-950 dark:to-orange-950",
        border: "border-amber-200/60 dark:border-orange-700/20",
        text: "text-amber-700 dark:text-orange-300",
        hover: "hover:bg-amber-50 dark:hover:bg-orange-950/50",
        fill: "fill-amber-500 dark:fill-orange-500 text-amber-500 dark:text-orange-500",
        avatarBg:
          "from-amber-100 via-yellow-100 to-orange-100 dark:from-amber-900 dark:via-yellow-900 dark:to-orange-900",
        avatarBorder: "border-amber-200 dark:border-orange-700",
        badgeBg:
          "bg-white/80 dark:bg-slate-900/80 border-amber-200/40 dark:border-orange-700/20",
      };
    }

    return (
      <motion.article key={poem._id} variants={item} className="h-full">
        <Card
          className={`border shadow-sm hover:shadow-xl transition-all duration-300 h-full bg-gradient-to-br ${colors.gradient} ${colors.border} overflow-hidden group poem-card`}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar
                  className={`h-6 w-6 border-2 ${colors.avatarBorder} ring-1 ring-white dark:ring-slate-950`}
                >
                  {authorData?.image ? (
                    <AvatarImage
                      src={authorData.image || "/placeholder.svg"}
                      alt={authorData.name || poem.author.name}
                    />
                  ) : (
                    <AvatarFallback
                      className={`bg-gradient-to-br ${colors.avatarBg} ${colors.text}`}
                    >
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
                    isInReadlist ? colors.fill : "text-gray-500"
                  }`}
                />
              </motion.button>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-0 pb-2">
            <Link href={`/poems/${language}/${currentSlug}`} className="block">
              <div
                className={`bg-gradient-to-r from-${colorScheme}-200/30 via-transparent to-${
                  colorScheme === "purple"
                    ? "pink"
                    : colorScheme === "blue"
                    ? "cyan"
                    : "orange"
                }-200/30 dark:from-${colorScheme}-800/30 dark:to-${
                  colorScheme === "purple"
                    ? "pink"
                    : colorScheme === "blue"
                    ? "cyan"
                    : "orange"
                }-800/30 rounded-lg p-2`}
              >
                <h2
                  className={`text-sm font-bold ${
                    colors.text
                  } hover:opacity-80 group-hover:underline decoration-dotted underline-offset-4 ${
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
                className={`text-xs ${colors.badgeBg} ${colors.text} ${
                  language === "ur" ? "urdu-text" : ""
                }`}
              >
                {poem.category || "Uncategorized"}
              </Badge>
              <Badge
                variant="outline"
                className={`gap-1 text-xs ${colors.badgeBg} ${colors.text}`}
              >
                <Eye className="h-3 w-3" />
                <span>{poem.viewsCount || 0}</span>
              </Badge>
            </div>
            <motion.div
              className={`${colors.text} hover:opacity-80 flex items-center gap-1 text-xs font-medium`}
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
      <div className="mt-4 sm:mt-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-blue-950 dark:via-cyan-950 dark:to-teal-950 rounded-xl border border-blue-200/60 dark:border-teal-700/20 shadow-lg overflow-hidden relative p-4 sm:p-6">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-300 via-cyan-300 to-teal-300 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-700 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-300 via-cyan-300 to-blue-300 dark:from-teal-700 dark:via-cyan-700 dark:to-blue-700 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative z-10">
          {!hideTitle && (
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 via-cyan-200/30 to-teal-200/30 dark:from-blue-800/30 dark:via-cyan-800/30 dark:to-teal-800/30 skew-x-12 rounded-lg -z-10"></div>
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="py-2 px-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100 dark:from-blue-900 dark:via-cyan-900 dark:to-teal-900 shadow-sm">
                    <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold font-serif text-blue-800 dark:text-cyan-300">
                    Explore More Poems
                  </h2>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 dark:from-blue-500/20 dark:via-cyan-500/20 dark:to-teal-500/20 backdrop-blur-sm text-blue-700 dark:text-cyan-300 border border-blue-300/30 dark:border-teal-600/30 shadow-sm">
                  <Sparkles className="h-3 w-3 text-teal-500 dark:text-teal-400" />
                  <span className="text-[10px] sm:text-xs font-medium">
                    Recommended
                  </span>
                </div>
              </motion.div>
            </div>
          )}

          {relatedPoems.byCategory.length > 0 && (
            <>
              <div className="mb-6">
                <div className="relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 via-cyan-200/30 to-teal-200/30 dark:from-blue-800/30 dark:via-cyan-800/30 dark:to-teal-800/30 skew-x-12 rounded-lg -z-10"></div>
                  <motion.div
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="py-2 px-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100 dark:from-blue-900 dark:via-cyan-900 dark:to-teal-900 shadow-sm">
                        <Tag className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold font-serif text-blue-800 dark:text-cyan-300">
                        More in {currentPoem.category}
                      </h3>
                    </div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 dark:from-blue-500/20 dark:via-cyan-500/20 dark:to-teal-500/20 backdrop-blur-sm text-blue-700 dark:text-cyan-300 border border-blue-300/30 dark:border-teal-600/30 shadow-sm">
                      <Sparkles className="h-3 w-3 text-teal-500 dark:text-teal-400" />
                      <span className="text-[10px] sm:text-xs font-medium">
                        Category
                      </span>
                    </div>
                  </motion.div>
                </div>
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {relatedPoems.byCategory
                    .slice(0, 3)
                    .map((poem, index) =>
                      renderPoemCard(
                        poem,
                        index,
                        index % 2 === 0 ? "blue" : "purple"
                      )
                    )}
                </motion.div>
              </div>
            </>
          )}

          {relatedPoems.byAuthor.length > 0 && (
            <div>
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 via-cyan-200/30 to-teal-200/30 dark:from-blue-800/30 dark:via-cyan-800/30 dark:to-teal-800/30 skew-x-12 rounded-lg -z-10"></div>
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="py-2 px-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 via-cyan-100 to-teal-100 dark:from-blue-900 dark:via-cyan-900 dark:to-teal-900 shadow-sm">
                      <User className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold font-serif text-blue-800 dark:text-cyan-300">
                      More by {currentPoem.author.name}
                    </h3>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-teal-500/10 dark:from-blue-500/20 dark:via-cyan-500/20 dark:to-teal-500/20 backdrop-blur-sm text-blue-700 dark:text-cyan-300 border border-blue-300/30 dark:border-teal-600/30 shadow-sm">
                    <Sparkles className="h-3 w-3 text-teal-500 dark:text-teal-400" />
                    <span className="text-[10px] sm:text-xs font-medium">
                      Author
                    </span>
                  </div>
                </motion.div>
              </div>
              <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {relatedPoems.byAuthor
                  .slice(0, 3)
                  .map((poem, index) =>
                    renderPoemCard(
                      poem,
                      index,
                      index % 2 === 0 ? "amber" : "blue"
                    )
                  )}
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
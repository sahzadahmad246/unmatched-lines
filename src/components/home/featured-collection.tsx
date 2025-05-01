"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Quote,
  ArrowRight,
  Heart,
  Eye,
  ChevronRight,
  Sparkles,
  BookOpen,
  FileText,
  BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Poem {
  _id: string;
  title: { en: string; hi?: string; ur?: string };
  author: { name: string; _id: string; slug?: string };
  category: string;
  content?: {
    en?: { verse: string; meaning: string }[];
    hi?: { verse: string; meaning: string }[];
    ur?: { verse: string; meaning: string }[];
  };
  slug: { en: string; hi?: string; ur?: string };
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

interface FeaturedCollectionProps {
  ghazals: Poem[];
  shers: Poem[];
  nazms?: Poem[];
  readList: string[];
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

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const customStyles = `
  .urdu-text {
    font-family: 'Fajer Noori Nastalique', sans-serif;
    direction: rtl;
    text-align: center;
    line-height: 1.8;
    font-size: 0.95rem;
  }
  
  .poem-card {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .poem-card-content {
    flex-grow: 1;
  }
  
  .category-section {
    margin-bottom: 2.5rem;
  }
  
  .category-section:last-child {
    margin-bottom: 0;
  }
`;

export default function FeaturedCollection({
  ghazals,
  shers,
  nazms = [],
  readList,
  handleReadlistToggle,
}: FeaturedCollectionProps) {
  const [language, setLanguage] = useState<"en" | "hi" | "ur">("en");
  const [authorDataMap, setAuthorDataMap] = useState<Record<string, Author>>({});

  useEffect(() => {
    const fetchAuthorsData = async () => {
      const poems = [...ghazals, ...shers, ...nazms];
      const authorIds = [...new Set(poems.map((poem) => poem.author._id))].filter(Boolean);
      const authorDataMap: Record<string, Author> = {};

      await Promise.all(
        authorIds.map(async (authorId) => {
          try {
            const res = await fetch(`/api/authors/${authorId}`, { credentials: "include" });
            if (!res.ok) return;
            const data = await res.json();
            if (data.author) authorDataMap[authorId] = data.author;
          } catch (error) {
            console.error(`FeaturedCollection - Error fetching author ${authorId}:`, error);
          }
        }),
      );

      setAuthorDataMap(authorDataMap);
    };

    if (ghazals.length > 0 || shers.length > 0 || nazms.length > 0) fetchAuthorsData();
  }, [ghazals, shers, nazms]);

  const formatPoetryContent = (
    content: { verse: string; meaning: string }[] | undefined,
    lang: "en" | "hi" | "ur",
    isSherCategory: boolean,
  ): React.ReactNode => {
    if (!content || content.length === 0 || !content[0]?.verse) {
      return (
        <div className={`text-gray-500 italic text-xs ${lang === "ur" ? "urdu-text" : ""}`}>
          {lang === "en" ? "Content not available" : lang === "hi" ? "सामग्री उपलब्ध नहीं है" : "مواد دستیاب نہیں ہے"}
        </div>
      );
    }

    const lines = content[0].verse.split("\n").filter(Boolean);
    if (lines.length === 0) {
      return (
        <div className={`text-gray-500 italic text-xs ${lang === "ur" ? "urdu-text" : ""}`}>
          {lang === "en" ? "Content not available" : lang === "hi" ? "सामग्री उपलब्ध नहीं है" : "مواد دستیاب نہیں ہے"}
        </div>
      );
    }

    if (isSherCategory) {
      return (
        <div className={`space-y-1 ${lang === "ur" ? "urdu-text" : ""}`}>
          {lines.map((line, lineIndex) => (
            <div
              key={lineIndex}
              className={`poem-line leading-relaxed text-sm font-serif ${lang === "ur" ? "urdu-text" : ""}`}
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
            className={`poem-line leading-relaxed text-xs sm:text-sm font-serif line-clamp-1 ${lang === "ur" ? "urdu-text" : ""}`}
          >
            {line || "\u00A0"}
          </div>
        ))}
      </div>
    );
  };

  const categories = [
    { id: "ghazal", title: "Ghazals", poems: ghazals },
    { id: "sher", title: "Shers", poems: shers },
    ...(nazms.length > 0 ? [{ id: "nazm", title: "Nazms", poems: nazms }] : []),
  ];

  const renderPoemCard = (poem: Poem, index: number, categoryIndex: number) => {
    const authorData = poem.author._id ? authorDataMap[poem.author._id] : null;
    const currentSlug = poem.slug[language] || poem.slug.en || poem._id;
    const currentTitle = poem.title[language] || poem.title.en || "Untitled";
    const currentContent = poem.content?.[language] || poem.content?.en || [];
    const poemLanguage = poem.content?.[language] ? language : "en";
    const isInReadlist = readList.includes(poem._id);
    const isSherCategory = poem.category.toLowerCase() === "sher";

    return (
      <motion.article key={poem._id} variants={slideUp} className="h-full">
        <Card className="border border-emerald-200/60 dark:border-emerald-700/20 shadow-sm hover:shadow-md transition-all duration-300 h-full bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/80 dark:from-emerald-950/80 dark:via-slate-950 dark:to-teal-950/80 overflow-hidden poem-card">
          <CardHeader className={`p-4 ${isSherCategory ? "pb-0" : "pb-2"}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                {!isSherCategory && (
                  <h2
                    className={`text-lg font-semibold text-emerald-800 dark:text-emerald-300 hover:underline font-serif ${language === "ur" ? "urdu-text" : ""}`}
                  >
                    <Link href={`/poems/${poemLanguage}/${currentSlug}`}>{currentTitle}</Link>
                  </h2>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-6 w-6 border-2 border-emerald-200 dark:border-emerald-700">
                    {authorData?.image ? (
                      <AvatarImage
                        src={authorData.image || "/placeholder.svg"}
                        alt={authorData.name || poem.author.name}
                      />
                    ) : (
                      <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-300">
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <p
                    className={`text-emerald-600 dark:text-emerald-400 text-xs ${language === "ur" ? "urdu-text" : ""}`}
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
                aria-label={isInReadlist ? "Remove from readlist" : "Add to readlist"}
              >
                <Heart className={`h-5 w-5 ${isInReadlist ? "text-green-500 fill-green-500" : "text-emerald-500"}`} />
              </motion.button>
            </div>
          </CardHeader>

          <CardContent className="p-4 pt-2 poem-card-content">
            <Link href={`/poems/${poemLanguage}/${currentSlug}`} className="block">
              <div
                className={`${isSherCategory ? "mt-2" : "mt-0"} font-serif text-emerald-800 dark:text-emerald-200 bg-white/80 dark:bg-slate-900/80 rounded-lg p-3 border border-emerald-200/40 dark:border-emerald-700/20 shadow-inner backdrop-blur-sm`}
              >
                {formatPoetryContent(currentContent, poemLanguage, isSherCategory)}
              </div>
            </Link>
          </CardContent>

          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`text-xs bg-white/80 dark:bg-slate-900/80 border-emerald-200 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-300 ${language === "ur" ? "urdu-text" : ""}`}
              >
                {poem.category || "Uncategorized"}
              </Badge>
              <Badge
                variant="outline"
                className="gap-1 text-xs bg-white/80 dark:bg-slate-900/80 border-emerald-200 dark:border-emerald-700/40 text-emerald-700 dark:text-emerald-300"
              >
                <Eye className="h-3 w-3" />
                <span>{poem.viewsCount || 0}</span>
              </Badge>
            </div>
            <motion.div
              className="text-emerald-600 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-100 flex items-center gap-1 text-xs font-medium"
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
    );
  };

  return (
    <>
      <style>{customStyles}</style>
      <section className="py-0 sm:py-10 sm:py-16 relative">
        <div className="container mx-auto px-0 sm:px-4 relative z-10">
          <div className="bg-emerald-50 dark:bg-emerald-950 sm:bg-gradient-to-br sm:from-emerald-50 sm:via-white sm:to-teal-50 sm:dark:from-emerald-950 sm:dark:via-slate-950 sm:dark:to-teal-950 rounded-xl sm:border sm:border-emerald-200/60 sm:dark:border-emerald-700/20 sm:shadow-lg overflow-hidden relative p-6 sm:p-8">
            {/* Decorative elements */}
            <div className="hidden sm:block absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-300 to-teal-200 dark:from-emerald-700 dark:to-teal-600 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-teal-200 to-emerald-300 dark:from-teal-600 dark:to-emerald-700 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>

            <motion.div initial={fadeIn.hidden} animate={fadeIn.visible} className="mb-8 relative z-10">
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/30 via-transparent to-teal-200/30 dark:from-emerald-800/30 dark:to-teal-800/30 skew-x-12 rounded-lg -z-10"></div>
                <div className="py-2 px-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 dark:from-emerald-900 dark:via-green-900 dark:to-teal-900 shadow-sm">
                      <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h2 className="text-sm sm:text-base font-semibold font-serif text-emerald-800 dark:text-emerald-300">
                      Featured Collections
                    </h2>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 via-green-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:via-green-500/20 dark:to-teal-500/20 backdrop-blur-sm text-emerald-700 dark:text-emerald-300 border border-emerald-300/30 dark:border-teal-600/30 shadow-sm">
                    <Sparkles className="h-3 w-3 text-teal-500 dark:text-teal-400" />
                    <span className="text-[10px] sm:text-xs font-medium">Daily Inspiration</span>
                  </div>
                </div>
              </div>

              <Tabs
                defaultValue="en"
                onValueChange={(value) => setLanguage(value as "en" | "hi" | "ur")}
                className="mb-8"
              >
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-white/80 dark:bg-slate-900/80 border border-emerald-200/40 dark:border-emerald-700/20 shadow-sm">
                  <TabsTrigger
                    value="en"
                    className="data-[state=active]:bg-emerald-100/80 data-[state=active]:dark:bg-emerald-900/30 data-[state=active]:text-emerald-800 data-[state=active]:dark:text-emerald-200"
                  >
                    English
                  </TabsTrigger>
                  <TabsTrigger
                    value="hi"
                    className="data-[state=active]:bg-emerald-100/80 data-[state=active]:dark:bg-emerald-900/30 data-[state=active]:text-emerald-800 data-[state=active]:dark:text-emerald-200"
                  >
                    Hindi
                  </TabsTrigger>
                  <TabsTrigger
                    value="ur"
                    className="data-[state=active]:bg-emerald-100/80 data-[state=active]:dark:bg-emerald-900/30 data-[state=active]:text-emerald-800 data-[state=active]:dark:text-emerald-200"
                  >
                    Urdu
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-12">
                {categories.map((category, categoryIndex) => (
                  <div key={category.id} className="category-section">
                    <div className="flex justify-between items-center mb-4">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-200/30 via-transparent to-teal-200/30 dark:from-emerald-800/30 dark:to-teal-800/30 skew-x-12 rounded-lg -z-10"></div>
                        <div className="py-2 px-4 flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 dark:from-emerald-900 dark:via-green-900 dark:to-teal-900 shadow-sm">
                            {category.id === "ghazal" ? (
                              <BookMarked className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : category.id === "sher" ? (
                              <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-semibold font-serif text-emerald-800 dark:text-emerald-300">
                            {category.title}
                          </h3>
                        </div>
                      </div>
                      <Link
                        href={`/${category.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-emerald-200/40 dark:border-emerald-700/20 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 shadow-sm transition-all duration-200 text-xs font-medium"
                      >
                        <span>See all</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>

                    {category.poems.length === 0 ? (
                      <motion.div
                        initial={fadeIn.hidden}
                        animate={fadeIn.visible}
                        className="text-center py-8 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-emerald-200/40 dark:border-emerald-700/20 shadow-sm backdrop-blur-sm"
                      >
                        <Quote className="h-8 w-8 mx-auto text-emerald-400 mb-3" />
                        <p
                          className={`text-emerald-600 dark:text-emerald-400 text-base font-serif italic ${language === "ur" ? "urdu-text" : ""}`}
                        >
                          {language === "en"
                            ? "No poems found in this category."
                            : language === "hi"
                            ? "इस श्रेणी में कोई कविता नहीं मिली।"
                            : "اس زمرے میں کوئی نظم نہیں ملی۔"}
                        </p>
                      </motion.div>
                    ) : (
                      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {category.poems.slice(0, 3).map((poem, index) => renderPoemCard(poem, index, categoryIndex))}
                      </div>
                    )}
                  </div>
                ))}
              </motion.div>

              <div className="flex justify-center mt-10">
                <Button
                  asChild
                  size="lg"
                  className="gap-2 font-serif text-sm bg-white/80 dark:bg-slate-900/80 border border-emerald-200/40 dark:border-emerald-700/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-800 dark:hover:text-emerald-200 backdrop-blur-sm"
                >
                  <Link href="/library">
                    View All Poems
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
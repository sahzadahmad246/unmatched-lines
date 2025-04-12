"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Feather, User, Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SearchResult {
  _id: string;
  type: "poem";
  title: { en?: string; hi?: string; ur?: string } | null;
  author: { name: string; _id: string } | null;
  slug: { en: string; hi?: string; ur?: string };
  category: string;
  excerpt: string;
  content: { en: string[]; hi?: string[]; ur?: string[] };
}

interface Author {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  bio?: string;
}

interface CoverImage {
  _id: string;
  url: string;
  uploadedBy: { name: string };
  createdAt: string;
}

interface SearchResultsProps {
  poems: SearchResult[];
  query: string;
  hasMatches: boolean;
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
  @media (max-width: 640px) {
    .poem-grid {
      grid-template-columns: 1fr;
    }
    
    .header-title {
      font-size: 1.5rem;
      line-height: 2rem;
    }
  }
  
  @media (min-width: 641px) and (max-width: 1023px) {
    .poem-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  @media (min-width: 1024px) {
    .poem-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  
  .poem-card {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .poem-card-content {
    flex-grow: 1;
  }

  .urdu-text {
    direction: rtl;
    font-family: 'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', sans-serif;
  }
`;

export default function SearchResults({
  poems,
  query,
  hasMatches,
}: SearchResultsProps) {
  const [coverImages, setCoverImages] = useState<CoverImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorDataMap, setAuthorDataMap] = useState<Record<string, Author>>(
    {}
  );
  const [language, setLanguage] = useState<"en" | "hi" | "ur">("en");

  useEffect(() => {
    const fetchCoverImages = async () => {
      try {
        const res = await fetch("/api/cover-images", {
          credentials: "include",
          cache: "force-cache",
        });
        if (!res.ok) throw new Error("Failed to fetch cover images");
        const data = await res.json();
        setCoverImages(data.coverImages || []);
      } catch (error) {
        console.error("Error fetching cover images:", error);
        setCoverImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoverImages();
  }, []);

  useEffect(() => {
    const authorIds = [
      ...new Set(
        poems.map((poem) => poem.author?._id).filter((id): id is string => !!id)
      ),
    ];

    const fetchAuthorsData = async () => {
      const authorDataMap: Record<string, Author> = {};

      await Promise.all(
        authorIds.map(async (authorId) => {
          try {
            const res = await fetch(`/api/authors/${authorId}`, {
              credentials: "include",
            });
            if (!res.ok) return;
            const data = await res.json();
            if (data.author) {
              authorDataMap[authorId] = data.author;
            }
          } catch (error) {
            console.error(`Error fetching author ${authorId}:`, error);
          }
        })
      );

      setAuthorDataMap(authorDataMap);
    };

    if (poems.length > 0 && authorIds.length > 0) {
      fetchAuthorsData();
    }
  }, [poems]);

  const coverImageUrl =
    coverImages.length > 0
      ? coverImages[Math.floor(Math.random() * coverImages.length)].url
      : "/default-poem-image.jpg";

  const formatVerse = (
    content: string[] | undefined,
    lang: "en" | "hi" | "ur"
  ): React.ReactNode => {
    if (
      !content ||
      !Array.isArray(content) ||
      content.length === 0 ||
      !content[0]
    ) {
      return (
        <div className="text-muted-foreground italic text-xs">
          No content available
        </div>
      );
    }

    const lines = content[0].split("\n").filter(Boolean);

    if (lines.length === 0) {
      return (
        <div className="text-muted-foreground italic text-xs">
          No content available
        </div>
      );
    }

    return (
      <div className={`space-y-1 ${lang === "ur" ? "urdu-text" : ""}`}>
        {lines.slice(0, 2).map((line, index) => (
          <div
            key={index}
            className="poem-line leading-relaxed text-sm font-serif"
          >
            {line || "\u00A0"}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[60vh]">
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <Feather className="h-12 w-12 text-primary/70" />
          </motion.div>
          <p className="text-primary/70 animate-pulse">Loading results...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className="container mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <Card className="overflow-hidden border shadow-lg bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            <CardHeader className="relative p-0">
              <motion.div
                className="h-48 md:h-64 relative"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                style={{
                  backgroundImage: `url(${coverImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="bg-white/10 backdrop-blur-sm p-6 rounded-full"
                  >
                    <Search className="h-16 w-16 text-white" />
                  </motion.div>
                </div>
              </motion.div>
              <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-8">
                <motion.div className="flex flex-col items-center gap-2">
                  <h1 className="text-2xl md:text-4xl font-bold text-center font-serif mt-4 header-title">
                    {hasMatches
                      ? `Poems for "${query}"`
                      : "Explore Popular Shayari"}
                  </h1>
                  <motion.div
                    className="w-24 h-1 bg-primary/60 mx-auto mt-2"
                    initial={{ width: 0 }}
                    animate={{ width: "6rem" }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  />
                </motion.div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <Tabs
          defaultValue="en"
          onValueChange={(value) => setLanguage(value as "en" | "hi" | "ur")}
          className="mb-8"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="en">English</TabsTrigger>
            <TabsTrigger value="hi">Hindi</TabsTrigger>
            <TabsTrigger value="ur">Urdu</TabsTrigger>
          </TabsList>
        </Tabs>

        {!hasMatches && poems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 max-w-2xl mx-auto"
          >
            <Card className="border shadow-lg bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-8">
              <Search className="h-12 w-12 mx-auto text-primary/60 mb-4" />
              <h1 className="text-2xl font-bold mb-4 font-serif">
                No results found for "{query}"
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Here are some popular poems you might enjoy.
              </p>
            </Card>
          </motion.div>
        )}

        {poems.length > 0 ? (
          <motion.div
            className="grid gap-6 poem-grid"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {poems.map((poem) => {
              const authorData = poem.author?._id
                ? authorDataMap[poem.author._id]
                : null;
              const isSherCategory = poem.category.toLowerCase() === "sher";
              const currentSlug = poem.slug[language] || poem.slug.en;
              const currentContent = poem.content[language] || poem.content.en;
              const poemLanguage = poem.content[language] ? language : "en";

              return (
                <motion.article
                  key={poem._id}
                  variants={slideUp}
                  className="h-full"
                >
                  <Link
                    href={`/poems/${poemLanguage}/${currentSlug}`}
                    className="block h-full"
                  >
                    <Card className="border shadow-sm hover:shadow-xl transition-all duration-300 h-full bg-white dark:bg-slate-900 overflow-hidden group poem-card">
                      <CardHeader
                        className={`p-4 ${isSherCategory ? "pb-0" : "pb-2"}`}
                      >
                        <div className="mb-2"></div>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-6 w-6 border border-primary/20">
                            {authorData?.image ? (
                              <AvatarImage
                                src={authorData.image}
                                alt={
                                  authorData.name ||
                                  poem.author?.name ||
                                  "Unknown"
                                }
                              />
                            ) : (
                              <AvatarFallback>
                                <User className="h-3 w-3" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <p className="text-gray-600 dark:text-gray-400 text-xs">
                            {authorData?.name ||
                              poem.author?.name ||
                              "Unknown Author"}
                          </p>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4 pt-2 poem-card-content">
                        <div
                          className={`font-serif text-gray-800 dark:text-gray-200 border-l-2 border-primary/30 pl-3 py-1 ${
                            language === "ur" ? "urdu-text" : ""
                          }`}
                        >
                          {formatVerse(currentContent, poemLanguage)}
                        </div>
                      </CardContent>

                      <CardFooter className="p-4 pt-0 flex justify-between items-center">
                        <Badge
                          variant="outline"
                          className="text-xs bg-primary/5 hover:bg-primary/10 transition-colors"
                        >
                          {poem.category || "Uncategorized"}
                        </Badge>
                        <motion.div
                          className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-medium"
                          whileHover={{ x: 3 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 10,
                          }}
                        >
                          Read <ArrowRight className="h-3 w-3 ml-1" />
                        </motion.div>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.article>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 max-w-2xl mx-auto"
          >
            <Card className="border shadow-lg bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-8">
              <Search className="h-12 w-12 mx-auto text-primary/60 mb-4" />
              <h1 className="text-2xl font-bold mb-4 font-serif">
                No results found for "{query}"
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try searching with different keywords or explore our popular
                poems.
              </p>
              <Link
                href="/"
                className="text-primary hover:text-primary/80 font-medium hover:underline inline-flex items-center"
              >
                <ArrowRight className="h-4 w-4 mr-2 rotate-180" /> Back to Home
              </Link>
            </Card>
          </motion.div>
        )}
      </div>
    </>
  );
}

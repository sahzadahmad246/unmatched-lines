"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Feather, User, ArrowLeft, Quote, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SearchResult {
  _id: string;
  type: "poem";
  title: { en: string; hi?: string; ur?: string };
  author: { name: string; _id: string };
  slug: string;
  category: string;
  excerpt: string;
  content: { en: string[]; hi?: string[]; ur?: string[] };
}

interface CoverImage {
  _id: string;
  url: string;
  uploadedBy: { name: string };
  createdAt: string;
}

interface Author {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  bio?: string;
}

interface SearchResultsProps {
  poems: SearchResult[];
  query: string;
}

const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const slideUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const customStyles = `
  @media (max-width: 640px) {
    .poem-grid { grid-template-columns: 1fr; }
    .header-title { font-size: 1.5rem; line-height: 2rem; }
  }
  @media (min-width: 641px) and (max-width: 1023px) {
    .poem-grid { grid-template-columns: repeat(2, 1fr); }
  }
  @media (min-width: 1024px) {
    .poem-grid { grid-template-columns: repeat(3, 1fr); }
  }
  .poem-card { height: 100%; display: flex; flex-direction: column; }
  .poem-card-content { flex-grow: 1; }
`;

export default function SearchResults({ poems, query }: SearchResultsProps) {
  const [coverImages, setCoverImages] = useState<CoverImage[]>([]);
  const [authorDataMap, setAuthorDataMap] = useState<Record<string, Author>>({});
  const [loading, setLoading] = useState(true);
  const displayQuery = query
    .split(/[\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

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
       
        setCoverImages([]);
      }
    };

    const fetchAuthorsData = async () => {
      const authorIds = [...new Set(poems.map((poem) => poem.author._id).filter(Boolean))];
      const authorDataMap: Record<string, Author> = {};

      await Promise.all(
        authorIds.map(async (authorId) => {
          try {
            const res = await fetch(`/api/authors/${authorId}`, { credentials: "include" });
            if (!res.ok) return;
            const data = await res.json();
            if (data.author) authorDataMap[authorId] = data.author;
          } catch (error) {
           
          }
        })
      );

      setAuthorDataMap(authorDataMap);
    };

    Promise.all([fetchCoverImages(), fetchAuthorsData()]).then(() => setLoading(false));
  }, [poems]);

  const coverImageUrl =
    coverImages.length > 0
      ? coverImages[Math.floor(Math.random() * coverImages.length)].url
      : "/default-poem-image.jpg";

  const formatPoetryContent = (content: string[] | undefined) => {
    if (!content || !Array.isArray(content) || content.length === 0) {
      return <div className="text-muted-foreground italic text-xs">Content not available</div>;
    }

    return (
      <div className="space-y-1">
        {content[0].split("\n").map((line, lineIndex) => (
          <div key={lineIndex} className="poem-line leading-relaxed text-xs sm:text-sm font-serif">
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
          <Feather className="h-12 w-12 text-primary/70 animate-spin" />
          <p className="text-primary/70">Loading results...</p>
        </motion.div>
      </div>
    );
  }

  const hasResults = poems.some((poem) =>
    poem.title.en.toLowerCase().includes(query.toLowerCase()) ||
    poem.excerpt.toLowerCase().includes(query.toLowerCase()) ||
    poem.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <style>{customStyles}</style>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={fadeIn.hidden} animate={fadeIn.visible} className="mb-12">
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
                    <Feather className="h-16 w-16 text-white" />
                  </motion.div>
                </div>
              </motion.div>
              <div className="relative bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 py-8">
                <motion.div className="flex flex-col items-center gap-2">
                  <h1 className="text-2xl md:text-4xl font-bold text-center font-serif mt-4 header-title">
                    Search Results for "{displayQuery}"
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Explore {hasResults ? "matching" : "related"} poems and shayari
                  </p>
                  <motion.div
                    className="w-24 h-1 bg-primary/60 mx-auto mt-2"
                    initial={{ width: 0 }}
                    animate={{ width: "6rem" }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  />
                  <Button variant="outline" size="sm" asChild className="mt-4">
                    <Link href="/" className="flex items-center gap-1">
                      <ArrowLeft className="h-4 w-4" /> Back to Home
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Results */}
        {!hasResults && (
          <div className="text-center py-6">
            <Quote className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-serif text-muted-foreground mb-6">
              No results found for "{displayQuery}". Here are some related poems:
            </p>
          </div>
        )}
        <motion.div className="grid gap-6 poem-grid" variants={staggerContainer} initial="hidden" animate="visible">
          {poems.map((poem) => {
            const authorData = authorDataMap[poem.author._id];
            const isSherOrGhazal =
              poem.category.toLowerCase() === "sher" || poem.category.toLowerCase() === "ghazal";

            return (
              <motion.article key={poem._id} variants={slideUp} className="h-full">
                <Link href={`/poems/en/${poem.slug}`} className="block h-full">
                  <Card className="border shadow-sm hover:shadow-xl transition-all duration-300 h-full bg-white dark:bg-slate-900 overflow-hidden group poem-card">
                    <CardHeader className={`p-4 ${isSherOrGhazal ? "pb-0" : "pb-2"}`}>
                      {!isSherOrGhazal && (
                        <h2 className="text-lg font-semibold text-primary hover:text-primary/80 font-serif group-hover:underline decoration-dotted underline-offset-4">
                          {poem.title.en}
                        </h2>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="h-6 w-6 border border-primary/20">
                          {authorData?.image ? (
                            <AvatarImage src={authorData.image} alt={poem.author.name} />
                          ) : (
                            <AvatarFallback>
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">{poem.author.name}</p>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2 poem-card-content">
                      <div
                        className={`${isSherOrGhazal ? "mt-2" : "mt-0"} font-serif text-gray-800 dark:text-gray-200 border-l-2 border-primary/30 pl-3 py-1`}
                      >
                        {formatPoetryContent(poem.content.en)}
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex justify-between items-center">
                      <Badge variant="outline" className="text-xs bg-primary/5 hover:bg-primary/10 transition-colors">
                        {poem.category}
                      </Badge>
                      <motion.div
                        className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-medium"
                        whileHover={{ x: 3 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
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
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">Explore more poetry:</p>
          <div className="flex flex-wrap justify-center gap-4">
            {["sad shayari", "ishq shayari", "love poems"].map((related) => (
              <Button key={related} variant="link" asChild>
                <Link href={`/search/${encodeURIComponent(related.replace(/\s+/g, "-"))}`}>
                  {related.charAt(0).toUpperCase() + related.slice(1)}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Search,
  User,
  ArrowLeft,
  Feather,
  Eye,
  Heart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";

interface SearchResult {
  _id: string;
  type: "poem" | "poet";
  title?: { en: string; hi?: string; ur?: string };
  name?: string;
  slug?: { en: string; hi?: string; ur?: string } | string;
  category?: string;
  image?: string;
  excerpt?: string;
  content?: {
    en?: { verse: string; meaning: string }[];
    hi?: { verse: string; meaning: string }[];
    ur?: { verse: string; meaning: string }[];
  };
  author?: { _id: string; name: string; image?: string };
  viewsCount?: number;
}

const formatPoetryContent = (
  content: { verse: string; meaning: string }[] | undefined,
  isSher: boolean = false
): React.ReactNode => {
  if (!content || content.length === 0 || !content[0]?.verse) {
    return (
      <div className="text-muted-foreground italic text-xs">
        Content not available
      </div>
    );
  }

  const lines = content[0].verse.split("\n").filter(Boolean);
  if (lines.length === 0) {
    return (
      <div className="text-muted-foreground italic text-xs">
        Content not available
      </div>
    );
  }

  if (isSher) {
    return (
      <div className="space-y-1">
        {lines.map((line, lineIndex) => (
          <div
            key={lineIndex}
            className="poem-line leading-relaxed text-sm font-serif"
          >
            {line || "\u00A0"}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {lines.slice(0, 2).map((line, lineIndex) => (
        <div
          key={lineIndex}
          className="poem-line leading-relaxed text-xs sm:text-sm font-serif line-clamp-1"
        >
          {line || "\u00A0"}
        </div>
      ))}
    </div>
  );
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function SearchResultsComponent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const initialType =
    (searchParams.get("type") as "all" | "poems" | "poets") || "all";
  const { data: session } = useSession();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "poems" | "poets">(
    initialType
  );
  const [readList, setReadList] = useState<string[]>([]);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`
        );
        if (!response.ok) throw new Error("Failed to fetch search results");
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (query) {
      fetchResults();
    }
  }, [query]);

  // Fetch user's readlist
  useEffect(() => {
    const fetchReadList = async () => {
      if (!session) return;
      try {
        const res = await fetch("/api/user", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to fetch user data: ${res.status}`);
        const data = await res.json();
        setReadList(
          data.user.readList.map((poem: any) => poem._id.toString()) || []
        );
      } catch (error) {
        toast.error("Failed to load reading list", {
          description: "You can still add poems to your reading list.",
        });
      }
    };

    fetchReadList();
  }, [session]);

  // Handle readlist toggle
  const handleReadlistToggle = async (poemId: string, poemTitle: string) => {
    if (!session) {
      toast.error("Authentication required", {
        description: "Please sign in to manage your reading list.",
        action: {
          label: "Sign In",
          onClick: () => (window.location.href = "/api/auth/signin"),
        },
      });
      return;
    }

    const isInReadlist = readList.includes(poemId);
    const url = isInReadlist ? "/api/user/readlist/remove" : "/api/user/readlist/add";
    const method = isInReadlist ? "DELETE" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poemId }),
        credentials: "include",
        cache: "no-store",
      });

      if (res.ok) {
        setReadList((prev) =>
          isInReadlist ? prev.filter((id) => id !== poemId) : [...prev, poemId]
        );
        if (isInReadlist) {
          toast.error("Removed from reading list", {
            description: `"${poemTitle}" has been removed from your reading list.`,
          });
        } else {
          toast.custom(
            (t) => (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4 flex items-center gap-3"
              >
                <Heart className="h-5 w-5 fill-current" />
                <div>
                  <div className="font-medium">Added to your anthology</div>
                  <div className="text-sm opacity-90">
                    "{poemTitle}" now resides in your collection
                  </div>
                </div>
              </motion.div>
            ),
            { duration: 3000 }
          );
        }
      } else {
        throw new Error(`Failed to update readlist: ${res.status}`);
      }
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred while updating the reading list.",
      });
    }
  };

  const filteredResults = results.filter((result) => {
    if (activeTab === "all") return true;
    if (activeTab === "poems") return result.type === "poem";
    if (activeTab === "poets") return result.type === "poet";
    return false;
  });

  const poemResults = filteredResults.filter(
    (result) => result.type === "poem"
  );
  const poetResults = filteredResults.filter(
    (result) => result.type === "poet"
  );

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <style>
        {`
          .poet-card {
            height: 100%;
            display: flex;
            flex-direction: column;
            background: white;
            dark:background: #1e293b;
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            border-radius: 12px;
          }
          .poet-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          .poet-card-content {
            flex-grow: 1;
          }
          .poem-card {
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          .poem-card-content {
            flex-grow: 1;
          }
        `}
      </style>
      <div className="mb-4 sm:mb-8 flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif flex items-center gap-2">
          <Search className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
          Search Results
        </h1>
        <Button variant="outline" size="sm" asChild className="h-8 sm:h-9">
          <Link href="/" className="flex items-center gap-1 text-xs sm:text-sm">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" /> Back
          </Link>
        </Button>
      </div>

      <div className="mb-3 sm:mb-6">
        <p className="text-sm sm:text-base font-serif">
          Showing results for:{" "}
          <span className="font-bold italic">"{query}"</span>
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(value as "all" | "poems" | "poets")
        }
      >
        <div className="mb-4 sm:mb-6">
          <TabsList className="h-9">
            <TabsTrigger value="all" className="font-serif text-xs sm:text-sm">
              All Results
            </TabsTrigger>
            <TabsTrigger
              value="poems"
              className="font-serif text-xs sm:text-sm"
            >
              Poems
            </TabsTrigger>
            <TabsTrigger
              value="poets"
              className="font-serif text-xs sm:text-sm"
            >
              Poets
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center items-center h-48 sm:h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className="text-base sm:text-lg font-serif text-muted-foreground">
                No results found for this category.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {(activeTab === "all" || activeTab === "poems") &&
                poemResults.length > 0 && (
                  <div>
                    <h2 className="text-xl font-serif font-semibold mb-4">
                      Poems
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                      {poemResults.map((result) => {
                        const isSher = result.category?.toLowerCase() === "sher";
                        const currentTitle = result.title?.en || "Untitled";
                        const currentSlug =
                          typeof result.slug === "object"
                            ? result.slug?.en || result._id
                            : result.slug || result._id;
                        const currentContent = result.content?.en || [];
                        const isInReadlist = readList.includes(result._id);

                        return (
                          <motion.article
                            key={`${result.type}-${result._id}`}
                            variants={slideUp}
                            initial="hidden"
                            animate="visible"
                            className="h-full"
                          >
                            <Card className="border shadow-sm hover:shadow-xl transition-all duration-300 h-full bg-white dark:bg-slate-900 overflow-hidden group poem-card">
                              <CardHeader
                                className={`p-4 ${isSher ? "pb-0" : "pb-2"}`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    {!isSher && (
                                      <h2 className="text-lg font-semibold text-primary hover:text-primary/80 font-serif group-hover:underline decoration-dotted underline-offset-4">
                                        <Link
                                          href={`/poems/en/${currentSlug}`}
                                        >
                                          {currentTitle}
                                        </Link>
                                      </h2>
                                    )}
                                    <div className="flex items-center gap-2 mt-1">
                                      <Avatar className="h-6 w-6 border border-primary/20">
                                        {result.author?.name ? (
                                          <AvatarImage
                                            src={
                                              result.author.image ||
                                              "/placeholder.svg"
                                            }
                                            alt={result.author.name}
                                          />
                                        ) : (
                                          <AvatarFallback>
                                            <User className="h-3 w-3" />
                                          </AvatarFallback>
                                        )}
                                      </Avatar>
                                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                                        {result.author?.name || "Unknown Author"}
                                      </p>
                                    </div>
                                  </div>
                                  <motion.button
                                    onClick={() =>
                                      handleReadlistToggle(
                                        result._id,
                                        currentTitle
                                      )
                                    }
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="p-1"
                                    aria-label={
                                      isInReadlist
                                        ? "Remove from readlist"
                                        : "Add to readlist"
                                    }
                                  >
                                    <Heart
                                      className={`h-5 w-5 ${
                                        isInReadlist
                                          ? "fill-red-500 text-red-500"
                                          : "text-gray-500"
                                      }`}
                                    />
                                  </motion.button>
                                </div>
                              </CardHeader>

                              <CardContent className="p-4 pt-2 poem-card-content">
                                <Link
                                  href={`/poems/en/${currentSlug}`}
                                  className="block"
                                >
                                  <div
                                    className={`${
                                      isSher ? "mt-2" : "mt-0"
                                    } font-serif text-gray-800 dark:text-gray-200 border-l-2 border-primary/30 pl-3 py-1`}
                                  >
                                    {formatPoetryContent(
                                      currentContent,
                                      isSher
                                    )}
                                  </div>
                                </Link>
                              </CardContent>

                              <CardFooter className="p-4 pt-0 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-primary/5 hover:bg-primary/10 transition-colors"
                                  >
                                    {result.category || "Uncategorized"}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="gap-1 text-xs bg-primary/5 hover:bg-primary/10 transition-colors"
                                  >
                                    <Eye className="h-3 w-3" />
                                    <span>{result.viewsCount || 0}</span>
                                  </Badge>
                                </div>
                              </CardFooter>
                            </Card>
                          </motion.article>
                        );
                      })}
                    </div>
                  </div>
                )}

              {(activeTab === "all" || activeTab === "poets") &&
                poetResults.length > 0 && (
                  <div>
                    <h2 className="text-xl font-serif font-semibold mb-4">
                      Poets
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                      {poetResults.map((result) => {
                        const currentSlug =
                          typeof result.slug === "string"
                            ? result.slug
                            : result._id;

                        return (
                          <motion.article
                            key={`${result.type}-${result._id}`}
                            variants={slideUp}
                            initial="hidden"
                            animate="visible"
                            className="h-full"
                          >
                            <Card className="poet-card border-none shadow-sm">
                              <Link
                                href={`/poets/${currentSlug}`}
                                className="block h-full"
                              >
                                <CardContent className="p-3 h-full flex flex-col poet-card-content">
                                  <div className="relative h-20 w-20 mx-auto mb-3">
                                    <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-muted-foreground/20 group-hover:border-primary/50 transition-colors">
                                      <Image
                                        src={
                                          result.image ||
                                          "/placeholder.svg?height=80&width=80"
                                        }
                                        alt={result.name || ""}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    </div>
                                  </div>
                                  <h3 className="font-semibold text-sm text-center mb-3 group-hover:text-primary transition-colors">
                                    {result.name}
                                  </h3>
                                  <div className="mt-auto flex justify-center">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-xs h-7 w-full group-hover:bg-primary/10 transition-colors"
                                    >
                                      <span className="group-hover:text-primary transition-colors">
                                        View Profile
                                      </span>
                                    </Button>
                                  </div>
                                </CardContent>
                              </Link>
                            </Card>
                          </motion.article>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, User, BookOpen, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface SearchResult {
  _id: string;
  type: "poem" | "poet";
  title?: { en: string; hi?: string; ur?: string };
  name?: string;
  slug?: { en: string } | string;
  category?: string;
  image?: string;
  excerpt?: string;
  author?: { name: string };
}

export default function SearchResultsComponent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const initialType =
    (searchParams.get("type") as "all" | "poems" | "poets") || "all";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "poems" | "poets">(
    initialType
  );

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

  const filteredResults = results.filter((result) => {
    if (activeTab === "all") return true;
    if (activeTab === "poems") return result.type === "poem";
    if (activeTab === "poets") return result.type === "poet";
    return false;
  });

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
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

      {isLoading ? (
        <div className="flex justify-center items-center h-48 sm:h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "all" | "poems" | "poets")
          }
        >
          <TabsList className="mb-4 sm:mb-6 h-9">
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

          <TabsContent value={activeTab}>
            {filteredResults.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-base sm:text-lg font-serif text-muted-foreground">
                  No results found for this category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {filteredResults.map((result) =>
                  result.type === "poem" ? (
                    // Poem Card - No Image
                    <Card
                      key={`${result.type}-${result._id}`}
                      className="overflow-hidden hover:shadow-md transition-shadow border border-muted/60"
                    >
                      <Link
                        href={`/poems/en/${result.slug}`}
                        className="block h-full"
                      >
                        <CardContent className="p-0 h-full">
                          <div className="p-4 border-l-4 border-primary h-full flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-base sm:text-lg line-clamp-1 font-serif">
                                {result.title?.en}
                              </h3>
                              <Badge
                                variant="outline"
                                className="font-serif capitalize text-xs"
                              >
                                {result.category || "poem"}
                              </Badge>
                            </div>

                            {result.author && (
                              <p className="text-xs sm:text-sm text-muted-foreground mb-3 flex items-center gap-1 font-serif">
                                <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">
                                  {result.author.name}
                                </span>
                              </p>
                            )}

                            {result.excerpt && (
                              <div className="mb-4 flex-grow">
                                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 font-serif italic">
                                  "{result.excerpt}"
                                </p>
                              </div>
                            )}

                            <div className="mt-auto pt-2 border-t border-muted">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-serif text-xs h-8 gap-1 group w-full justify-center"
                              >
                                <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="group-hover:text-primary transition-colors">
                                  Read Poem
                                </span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ) : (
                    // Poet Card - Profile Style
                    <Card
                      key={`${result.type}-${result._id}`}
                      className="overflow-hidden hover:shadow-md transition-shadow border border-muted/60"
                    >
                      <Link
                        href={`/poets/${
                          typeof result.slug === "string"
                            ? result.slug
                            : result._id
                        }`}
                        className="block h-full"
                      >
                        <CardContent className="p-0 h-full flex flex-col">
                          <div className="bg-muted/30 pt-4 px-4 text-center">
                            <div className="relative h-24 w-24 mx-auto mb-2">
                              <div className="absolute inset-0 rounded-full overflow-hidden border-2 border-primary">
                                <Image
                                  src={
                                    result.image ||
                                    "/placeholder.svg?height=96&width=96"
                                  }
                                  alt={result.name || ""}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </div>
                            <h3 className="font-bold text-base sm:text-lg mb-1 font-serif">
                              {result.name}
                            </h3>
                            <Badge
                              variant="secondary"
                              className="font-serif mb-3 inline-block"
                            >
                              Poet
                            </Badge>
                          </div>

                          <div className="p-4 flex-grow flex flex-col">
                            {result.excerpt && (
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 font-serif mb-4">
                                {result.excerpt}
                              </p>
                            )}

                            <div className="mt-auto flex justify-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="font-serif text-xs h-8 gap-1 group w-full"
                              >
                                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="group-hover:text-primary transition-colors">
                                  View Profile
                                </span>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  )
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

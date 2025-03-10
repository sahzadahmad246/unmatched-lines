"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Search, User, BookOpen, ArrowLeft } from 'lucide-react';
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

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const initialType = searchParams.get("type") as "all" | "poems" | "poets" || "all";

  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "poems" | "poets">(initialType);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
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
          Showing results for: <span className="font-bold italic">"{query}"</span>
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48 sm:h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "poems" | "poets")}>
            <TabsList className="mb-4 sm:mb-6 h-9">
              <TabsTrigger value="all" className="font-serif text-xs sm:text-sm">All Results</TabsTrigger>
              <TabsTrigger value="poems" className="font-serif text-xs sm:text-sm">Poems</TabsTrigger>
              <TabsTrigger value="poets" className="font-serif text-xs sm:text-sm">Poets</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {filteredResults.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-base sm:text-lg font-serif text-muted-foreground">No results found for this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                  {filteredResults.map((result) => (
                    <Card 
                      key={`${result.type}-${result._id}`} 
                      className="overflow-hidden hover:shadow-md transition-shadow border border-muted/60"
                    >
                      <Link
                        href={
                          result.type === "poem"
                            ? `/poems/${typeof result.slug === 'object' ? result.slug?.en : result._id}`
                            : `/poets/${typeof result.slug === 'string' ? result.slug : result._id}`
                        }
                        className="block h-full"
                      >
                        <CardContent className="p-0 h-full flex flex-col">
                          <div className="relative h-32 sm:h-40 bg-muted">
                            <Image
                              src={result.image || "/placeholder.svg?height=160&width=320"}
                              alt={result.type === "poem" ? result.title?.en || "" : result.name || ""}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute bottom-2 right-2">
                              <Badge variant="secondary" className="font-serif capitalize text-xs">
                                {result.type === "poem" ? result.category || "poem" : "poet"}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-3 sm:p-4 flex flex-col flex-grow">
                            <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2 line-clamp-1 font-serif">
                              {result.type === "poem" ? result.title?.en : result.name}
                            </h3>
                            {result.type === "poem" && result.author && (
                              <p className="text-xs text-muted-foreground mb-1 sm:mb-2 flex items-center gap-1 font-serif">
                                <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">{result.author.name}</span>
                              </p>
                            )}
                            {result.excerpt && (
                              <p className="text-xs text-muted-foreground line-clamp-2 font-serif mb-3">{result.excerpt}</p>
                            )}
                            <div className="mt-auto flex justify-end">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="font-serif text-xs h-8 gap-1 group"
                              >
                                {result.type === "poem" ? (
                                  <>
                                    <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" /> 
                                    <span className="group-hover:text-primary transition-colors">Read Poem</span>
                                  </>
                                ) : (
                                  <>
                                    <User className="h-3 w-3 sm:h-4 sm:w-4" /> 
                                    <span className="group-hover:text-primary transition-colors">View Profile</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

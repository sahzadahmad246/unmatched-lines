"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, Feather, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";

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

export function SearchBar({
  className = "",
  fullWidth = false,
  isMobile = false,
}) {
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "poems" | "poets">("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  // Load recent searches from local storage on mount
  useEffect(() => {
    const storedSearches = localStorage.getItem("recentSearches");
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches));
    }
  }, []);

  // Save query to recent searches
  const saveRecentSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    const updatedSearches = [
      searchQuery,
      ...recentSearches.filter((q) => q !== searchQuery),
    ].slice(0, 5); // Keep only the latest 5 searches
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // Clear a single recent search
  const clearRecentSearch = (search: string) => {
    const updatedSearches = recentSearches.filter((q) => q !== search);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // Clear all recent searches
  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  useEffect(() => {
    const handleSearch = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`
        );
        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(handleSearch, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query);
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setIsSearchOpen(false);
    }
  };

  const handleRecentSearchClick = (search: string) => {
    setQuery(search);
    setIsSearchOpen(true);
  };

  const filteredResults = results.filter((result) => {
    if (activeTab === "all") return true;
    if (activeTab === "poems") return result.type === "poem";
    if (activeTab === "poets") return result.type === "poet";
    return false;
  });

  return (
    <>
      <style>
        {`
          .custom-search-dialog {
            width: 95vw;
            max-width: 600px;
            height: 500px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .custom-results-container {
            flex: 1;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #888 #f1f1f1;
          }
          .custom-results-container::-webkit-scrollbar {
            width: 8px;
          }
          .custom-results-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
          .custom-results-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }
          .custom-results-container::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
          @media (max-width: 639px) {
            .custom-search-dialog {
              height: 80vh;
            }
          }
          .recent-search-tag {
            transition: all 0.2s ease;
          }
          .recent-search-tag:hover {
            background-color: #e2e8f0;
            transform: scale(1.05);
          }
          .clear-search-button {
            transition: all 0.2s ease;
          }
          .clear-search-button:hover {
            background-color: #f1f5f9;
            transform: scale(1.1);
          }
        `}
      </style>
      <motion.div
        className={`relative ${className} ${
          fullWidth ? "w-full" : "w-full sm:w-96"
        } ${isMobile ? "fixed top-4 left-4 right-4 z-40 bg-white p-2 shadow-md" : ""}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Input
          placeholder="Search poems, poets..."
          className="pl-10 py-5 text-sm sm:text-base h-12"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isSearchOpen && e.target.value.trim()) setIsSearchOpen(true);
          }}
          onClick={() => setIsSearchOpen(true)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
        {query && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </motion.div>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="p-0 custom-search-dialog">
          <div className="p-3 sm:p-4 border-b shrink-0">
            <form onSubmit={handleSubmit} className="relative">
              <Input
                placeholder="Search poems, poets..."
                className="pl-10 py-5 text-base h-12"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin" />
              )}
            </form>
          </div>

          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "all" | "poems" | "poets")
            }
            className="flex flex-col flex-1"
          >
            <div className="px-3 sm:px-4 border-b shrink-0">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="all">All Results</TabsTrigger>
                <TabsTrigger value="poems">Poems</TabsTrigger>
                <TabsTrigger value="poets">Poets</TabsTrigger>
              </TabsList>
            </div>

            <div className="custom-results-container">
              <TabsContent value={activeTab} className="m-0 p-0">
                <AnimatePresence>
                  {query.trim().length < 2 && recentSearches.length > 0 ? (
                    <div className="p-4 sm:p-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-sm font-medium text-foreground">
                          Recent Searches
                        </h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={clearAllRecentSearches}
                          className="h-6 w-6"
                          title="Clear all recent searches"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((search, index) => (
                          <div
                            key={index}
                            className="flex items-center recent-search-tag px-3 py-1.5 text-xs rounded-full bg-muted text-foreground font-medium"
                          >
                            <button
                              onClick={() => handleRecentSearchClick(search)}
                              className="truncate max-w-[150px]"
                            >
                              {search}
                            </button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => clearRecentSearch(search)}
                              className="clear-search-button h-5 w-5 ml-1"
                              title="Clear this search"
                            >
                              <X className="h-3 w-3 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : query.trim().length < 2 ? (
                    <div className="p-4 sm:p-6 text-center text-muted-foreground">
                      Type at least 2 characters to search
                    </div>
                  ) : isLoading ? (
                    <div className="p-4 sm:p-6">
                      <div className="flex justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                      <div className="mt-6 space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-3 animate-pulse"
                          >
                            <div className="h-10 w-10 rounded-full bg-muted"></div>
                            <div className="flex-1">
                              <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                              <div className="h-3 w-1/2 bg-muted rounded"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : filteredResults.length === 0 ? (
                    <div className="p-4 sm:p-6 text-center text-muted-foreground">
                      No results found for "{query}"
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {filteredResults.map((result) => {
                        const isSher = result.category?.toLowerCase() === "sher";
                        const currentTitle =
                          result.type === "poem"
                            ? result.title?.en || "Untitled"
                            : result.name;
                        const currentSlug =
                          result.type === "poem"
                            ? typeof result.slug === "object"
                              ? result.slug?.en || result._id
                              : result.slug || result._id
                            : typeof result.slug === "string"
                            ? result.slug
                            : result._id;
                        const currentContent =
                          result.type === "poem"
                            ? result.content?.en || []
                            : undefined;

                        return (
                          <motion.li
                            key={result._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-3 sm:p-4 hover:bg-muted/50"
                          >
                            <Link
                              href={
                                result.type === "poem"
                                  ? `/poems/en/${currentSlug}`
                                  : `/poets/en/${currentSlug}`
                              }
                              className="flex items-start gap-3"
                              onClick={() => {
                                saveRecentSearch(query);
                                setIsSearchOpen(false);
                              }}
                            >
                              {result.type === "poet" ? (
                                <Avatar className="h-10 w-10 rounded-full">
                                  <img
                                    src={result.image || "/placeholder.svg"}
                                    alt={result.name || ""}
                                    className="h-full w-full object-cover"
                                  />
                                </Avatar>
                              ) : (
                                <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                                  <Feather className="h-5 w-5" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm sm:text-base truncate">
                                  {currentTitle}
                                </h4>
                                {result.type === "poem" && currentContent ? (
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {formatPoetryContent(currentContent, isSher)}
                                  </div>
                                ) : (
                                  result.excerpt && (
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                      {result.excerpt}
                                    </p>
                                  )
                                )}
                              </div>
                            </Link>
                          </motion.li>
                        );
                      })}
                    </ul>
                  )}
                </AnimatePresence>
              </TabsContent>
            </div>

            {filteredResults.length > 0 && (
              <div className="p-3 sm:p-4 border-t shrink-0">
                <Button
                  className="w-full"
                  onClick={() => {
                    saveRecentSearch(query);
                    router.push(
                      `/search?q=${encodeURIComponent(query)}&type=${activeTab}`
                    );
                    setIsSearchOpen(false);
                  }}
                >
                  View All Results
                </Button>
              </div>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
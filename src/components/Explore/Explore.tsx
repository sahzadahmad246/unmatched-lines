"use client";

import { useEffect, useState } from "react";
import { useInfiniteQuery, useQuery, InfiniteData } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useInView } from "react-intersection-observer";
import { SearchBar } from "@/components/Explore/SearchBar";
import { ExploreSkeleton } from "@/components/Explore/ExploreSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, Bookmark, Sparkles, TrendingUp, BookOpen } from "lucide-react";
import Link from "next/link";
import { ArticleCard } from "../articles/article-card";
import { TransformedArticle } from "@/types/articleTypes";

// Type for API response
interface ArticleResponse {
  articles: TransformedArticle[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Fetch articles from the API
const fetchArticles = async ({
  pageParam = 1,
  limit = 10,
  query = "",
  sortBy = "",
  ids = [],
}: {
  pageParam: number;
  limit?: number;
  query?: string;
  sortBy?: string;
  ids?: string[];
}): Promise<ArticleResponse> => {
  const url = new URL("/api/articles/list", window.location.origin);
  url.searchParams.set("page", pageParam.toString());
  url.searchParams.set("limit", limit.toString());
  if (query) url.searchParams.set("query", query);
  if (sortBy) url.searchParams.set("sortBy", sortBy);
  if (ids.length > 0) url.searchParams.set("ids", ids.join(","));

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Failed to fetch articles");
  return response.json();
};

// Fetch bookmarked article IDs
const fetchBookmarkedArticleIds = async (userId: string): Promise<string[]> => {
  const response = await fetch("/api/articles/bookmark", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      action: "getAll",
    }),
  });
  if (!response.ok) throw new Error("Failed to fetch bookmarked article IDs");
  const data = await response.json();
  return data.bookmarkedArticleIds || [];
};

export function Explore() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const { ref: loadMoreRef, inView } = useInView();

  // Fetch all articles for "Explore" tab
  const {
    data: allArticlesData,
    isLoading: allLoading,
    error: allError,
    fetchNextPage: fetchNextAllPage,
    hasNextPage: hasNextAllPage,
    isFetchingNextPage: isFetchingNextAllPage,
  } = useInfiniteQuery({
    queryKey: ["allArticles", searchQuery] as const,
    queryFn: ({ pageParam = 1 }) =>
      fetchArticles({ pageParam: pageParam as number, limit: 10, query: searchQuery }),
    getNextPageParam: (lastPage: ArticleResponse) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: activeTab === "all",
    staleTime: 5 * 60 * 1000,
  });

  // Fetch bookmarked article IDs
  const {
    data: bookmarkedArticleIds = [],
    isLoading: bookmarksLoading,
    error: bookmarksError,
    refetch: refetchBookmarks,
  } = useQuery({
    queryKey: ["bookmarkedArticleIds", session?.user?.id] as const,
    queryFn: () => fetchBookmarkedArticleIds(session?.user?.id || ""),
    enabled: !!session?.user?.id && activeTab === "bookmarks",
    staleTime: 5 * 60 * 1000,
  });

  // Fetch bookmarked articles using article IDs
  const {
    data: bookmarkedArticlesData,
    isLoading: bookmarkedArticlesLoading,
    error: bookmarkedArticlesError,
  } = useQuery({
    queryKey: ["bookmarkedArticles", bookmarkedArticleIds] as const,
    queryFn: () =>
      fetchArticles({ pageParam: 1, limit: 100, ids: bookmarkedArticleIds }),
    enabled: !!session?.user?.id && activeTab === "bookmarks" && bookmarkedArticleIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch trending articles (sorted by viewsCount)
  const {
    data: trendingArticlesData,
    isLoading: trendingLoading,
    error: trendingError,
    fetchNextPage: fetchNextTrendingPage,
    hasNextPage: hasNextTrendingPage,
    isFetchingNextPage: isFetchingNextTrendingPage,
  } = useInfiniteQuery({
    queryKey: ["trendingArticles"] as const,
    queryFn: ({ pageParam = 1 }) =>
      fetchArticles({ pageParam: pageParam as number, limit: 10, sortBy: "viewsCount" }),
    getNextPageParam: (lastPage: ArticleResponse) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: activeTab === "trending",
    staleTime: 5 * 60 * 1000,
  });

  // Auto-load more articles when in view
  useEffect(() => {
    if (inView && activeTab === "all" && hasNextAllPage && !isFetchingNextAllPage) {
      fetchNextAllPage();
    } else if (
      inView &&
      activeTab === "trending" &&
      hasNextTrendingPage &&
      !isFetchingNextTrendingPage
    ) {
      fetchNextTrendingPage();
    }
  }, [
    inView,
    activeTab,
    hasNextAllPage,
    isFetchingNextAllPage,
    hasNextTrendingPage,
    isFetchingNextTrendingPage,
    fetchNextAllPage,
    fetchNextTrendingPage,
  ]);

  // Refetch bookmarks when session or tab changes
  useEffect(() => {
    if (session?.user?.id && activeTab === "bookmarks") {
      refetchBookmarks();
    }
  }, [session?.user?.id, activeTab, refetchBookmarks]);

  const handleSearch = (query: string) => {
    setSearchQuery(query.trim());
    setActiveTab("all");
  };

  // Type assertion for pages to ensure TypeScript recognizes the structure
  const allPages = allArticlesData as InfiniteData<ArticleResponse, number> | undefined;
  const trendingPages = trendingArticlesData as InfiniteData<ArticleResponse, number> | undefined;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Explore Articles
          </h1>
          <SearchBar onSearch={handleSearch} initialQuery={searchQuery} loading={allLoading} />
        </div>

        {/* Error Handling */}
        {(allError || bookmarksError || bookmarkedArticlesError || trendingError) && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 text-center">
              <p className="text-destructive text-sm">
                {(allError || bookmarksError || bookmarkedArticlesError || trendingError)?.message ||
                  "An error occurred"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="all" className="text-sm">
              <Sparkles className="h-4 w-4 mr-2" />
              Explore
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="text-sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Bookmarks
            </TabsTrigger>
            <TabsTrigger value="trending" className="text-sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
          </TabsList>

          {/* Explore Tab */}
          <TabsContent value="all" className="space-y-6">
            {allLoading && (!allPages?.pages?.length || !allPages.pages[0]?.articles?.length) ? (
              <ExploreSkeleton type="discover" itemCount={5} />
            ) : (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">
                    {searchQuery ? `Search Results for "${searchQuery}"` : "Discover Articles"}
                  </h2>
                </div>
                {!allPages?.pages?.length || !allPages.pages[0]?.articles?.length ? (
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <div className="h-16 w-16 mx-auto bg-gradient-to-br from-muted/50 to-muted/30 rounded-full flex items-center justify-center mb-3">
                        <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No articles found</h3>
                      <p className="text-muted-foreground text-sm">Try searching with different keywords</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {allPages.pages.map((page, index) => (
                      <div key={index} className="space-y-3">
                        {page.articles.map((article: TransformedArticle) => (
                          <ArticleCard key={article._id} article={article} />
                        ))}
                      </div>
                    ))}
                    {hasNextAllPage && (
                      <div ref={loadMoreRef} className="flex justify-center pt-4">
                        {isFetchingNextAllPage && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </TabsContent>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks" className="space-y-6">
            {bookmarksLoading || bookmarkedArticlesLoading ? (
              <ExploreSkeleton type="discover" itemCount={5} />
            ) : bookmarkedArticlesData?.articles?.length ? (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <Bookmark className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Your Bookmarked Articles</h2>
                </div>
                <div className="space-y-3">
                  {bookmarkedArticlesData.articles.map((article: TransformedArticle) => (
                    <ArticleCard key={article._id} article={{ ...article, isBookmarked: true }} />
                  ))}
                </div>
              </section>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-4 text-center">
                  <div className="h-16 w-16 mx-auto bg-gradient-to-br from-muted/50 to-muted/30 rounded-full flex items-center justify-center mb-3">
                    <Bookmark className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No bookmarked articles yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Start exploring and bookmark your favorite articles to see them here!
                  </p>
                  <Button asChild className="gap-2">
                    <Link href="/articles">
                      <Sparkles className="h-4 w-4" />
                      Explore Articles
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
            {trendingLoading && (!trendingPages?.pages?.length || !trendingPages.pages[0]?.articles?.length) ? (
              <ExploreSkeleton type="trending" itemCount={5} />
            ) : (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Trending Articles</h2>
                </div>
                {!trendingPages?.pages?.length || !trendingPages.pages[0]?.articles?.length ? (
                  <Card className="border-dashed">
                    <CardContent className="p-4 text-center">
                      <p className="text-muted-foreground text-sm">No trending articles available</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {trendingPages.pages.map((page, index) => (
                      <div key={index} className="space-y-3">
                        {page.articles.map((article: TransformedArticle) => (
                          <ArticleCard key={article._id} article={article} />
                        ))}
                      </div>
                    ))}
                    {hasNextTrendingPage && (
                      <div ref={loadMoreRef} className="flex justify-center pt-4">
                        {isFetchingNextTrendingPage && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
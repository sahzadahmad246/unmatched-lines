"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Bookmark, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
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

interface ProfileContentProps {
  userData: { _id: string }; // Minimal user data, only need _id for fetching
}

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

// Fetch articles by IDs
const fetchArticles = async ({
  ids,
  limit = 100,
}: {
  ids: string[];
  limit?: number;
}): Promise<ArticleResponse> => {
  const url = new URL("/api/articles/list", window.location.origin);
  url.searchParams.set("page", "1");
  url.searchParams.set("limit", limit.toString());
  if (ids.length > 0) url.searchParams.set("ids", ids.join(","));

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Failed to fetch articles");
  return response.json();
};

export default function ProfileContent({ userData }: ProfileContentProps) {
  // Fetch bookmarked article IDs
  const {
    data: bookmarkedArticleIds = [],
    isLoading: bookmarksLoading,
    error: bookmarksError,
  } = useQuery({
    queryKey: ["bookmarkedArticleIds", userData._id] as const,
    queryFn: () => fetchBookmarkedArticleIds(userData._id),
    enabled: !!userData._id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch bookmarked articles using article IDs
  const {
    data: bookmarkedArticlesData,
    isLoading: bookmarkedArticlesLoading,
    error: bookmarkedArticlesError,
  } = useQuery({
    queryKey: ["bookmarkedArticles", bookmarkedArticleIds] as const,
    queryFn: () => fetchArticles({ ids: bookmarkedArticleIds }),
    enabled: !!userData._id && bookmarkedArticleIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Handle errors
  if (bookmarksError || bookmarkedArticlesError) {
    toast.error(
      (bookmarksError || bookmarkedArticlesError)?.message ||
        "Failed to load bookmarked articles"
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 py-4">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Bookmark className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Bookmarked Articles</h2>
          <p className="text-sm text-muted-foreground">
            Your saved article collection
          </p>
        </div>
      </div>

      {bookmarksLoading || bookmarkedArticlesLoading ? (
        <div className="grid gap-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="h-40 rounded-xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : bookmarkedArticlesData?.articles?.length ? (
        <div className="grid gap-4">
          {bookmarkedArticlesData.articles.map(
            (article: TransformedArticle) => (
              <ArticleCard
                key={article._id}
                article={{ ...article, isBookmarked: true }}
              />
            )
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gradient-to-br from-card/50 to-card/30 rounded-xl backdrop-blur-sm">
          <div className="relative mb-6">
            <div className="h-20 w-20 mx-auto bg-gradient-to-br from-muted/50 to-muted/30 rounded-full flex items-center justify-center">
              <Bookmark className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <Sparkles className="absolute top-2 right-1/3 h-5 w-5 text-primary/40 animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold mb-3">
            No bookmarked articles yet
          </h3>
          <p className="text-muted-foreground leading-relaxed mb-6 max-w-md mx-auto">
            Start exploring and bookmark your favorite articles to see them
            here. Build your personal article collection!
          </p>
          <Button asChild className="gap-2">
            <Link href="/articles">
              <Sparkles className="h-4 w-4" />
              Explore Articles
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import type { TransformedArticle } from "@/types/articleTypes";
import type { IPoet as Poet } from "@/types/userTypes";
import { ArticleCard } from "@/components/articles/article-card";

const categoryLabels: Record<string, string> = {
  "all-works": "All Works",
  ghazal: "Ghazals",
  sher: "Shers",
  nazm: "Nazms",
  rubai: "Rubais",
  marsiya: "Marsiyas",
  qataa: "Qataas",
  other: "Other Poems",
  "top-20": "Top 20 Poems",
  "top-20-ghazal": "Top 20 Ghazals",
  "top-20-sher": "Top 20 Shers",
  "top-20-nazm": "Top 20 Nazms",
};

interface PoetWorksContentProps {
  poet: Poet;
  worksData: {
    articles: TransformedArticle[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    category: string;
    sortBy: string;
  };
  category: string;
  currentPage: number;
  sortBy: string;
}


export default function PoetWorksContent({
  poet,
  worksData,
  category,
  currentPage,
  sortBy,
}: PoetWorksContentProps) {
  const router = useRouter();
  const [selectedSort, setSelectedSort] = useState(sortBy);

  const handleSortChange = (newSort: string) => {
    setSelectedSort(newSort);
    const url = new URL(window.location.href);
    url.searchParams.set("sortBy", newSort);
    url.searchParams.set("page", "1");
    router.push(url.pathname + url.search);
  };

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", page.toString());
    router.push(url.pathname + url.search);
  };


  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 rounded-lg p-6 border border-border/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              {categoryLabels[category]} by {poet.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="font-medium">{worksData.pagination.total}</span>
                <span>articles found</span>
              </span>
              {worksData.pagination.pages > 1 && (
                <span className="flex items-center gap-1">
                  <span className="font-medium">Page {worksData.pagination.page}</span>
                  <span>of {worksData.pagination.pages}</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
              <Select value={selectedSort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[160px] bg-background border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="top">Most Popular</SelectItem>
                  <SelectItem value="views">Most Viewed</SelectItem>
                  <SelectItem value="bookmarks">Most Bookmarked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Article Cards */}
      {worksData.articles.length > 0 ? (
        <div className="grid gap-4 grid-cols-1">
          {worksData.articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>

      ) : (
        <div className="bg-background border border-border rounded-lg p-12 text-center">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">No articles found</h3>
              <p className="text-muted-foreground">
                No articles found in the <span className="font-medium">{categoryLabels[category]}</span> category for {poet.name}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {worksData.pagination.pages > 1 && (
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{worksData.pagination.pages}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!worksData.pagination.hasPrev}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, worksData.pagination.pages) },
                  (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  }
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!worksData.pagination.hasNext}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
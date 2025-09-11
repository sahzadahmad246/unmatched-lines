"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useArticleFeedStore } from "@/store/feed-store"
import { notFound } from "next/navigation"
import { ArticleCard } from "@/components/articles/article-card"
import { BookOpen, Sparkles, Heart, Feather, Star } from "lucide-react"
import type { TransformedArticle } from "@/types/articleTypes"

export default function ArticlesPage() {
  const { articles, loading, error, fetchFeed, clearFeed, pagination } = useArticleFeedStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observer = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    clearFeed() // Clear feed on mount to ensure fresh data
    fetchFeed(1, 10) // Fetch initial page with 10 articles
    setCurrentPage(1)
    setHasMore(true)
  }, [fetchFeed, clearFeed])

  // Update hasMore when pagination changes
  useEffect(() => {
    if (pagination) {
      setHasMore(currentPage < pagination.totalPages)
    }
  }, [pagination, currentPage])

  // Load more articles when reaching the bottom
  const loadMoreArticles = useCallback(async () => {
    if (loading || isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const nextPage = currentPage + 1
    try {
      await fetchFeed(nextPage, 10)
      setCurrentPage(nextPage)
    } catch (error) {
      console.error("Error loading more articles:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [loading, isLoadingMore, hasMore, currentPage, fetchFeed])

  // Intersection Observer for infinite scroll
  const lastArticleElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (loading || isLoadingMore) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreArticles()
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, isLoadingMore, hasMore, loadMoreArticles]
  )

  if (error) {
    notFound()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
        <div className="container mx-auto px-0 py-8 max-w-6xl">
          {/* Header Skeleton */}
          <div className="text-center mb-12 py-8">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="h-16 w-16 bg-muted animate-pulse rounded-full" />
            </div>
            <div className="h-12 w-64 bg-muted animate-pulse rounded-lg mx-auto mb-4" />
            <div className="h-6 w-96 bg-muted animate-pulse rounded mx-auto mb-2" />
            <div className="h-6 w-80 bg-muted animate-pulse rounded mx-auto" />

            {/* Stats Skeleton */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="h-10 w-32 bg-muted animate-pulse rounded-xl" />
              <div className="h-10 w-40 bg-muted animate-pulse rounded-xl" />
            </div>
          </div>

          {/* Article List Skeleton */}
          <div className="relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.05),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(96,165,250,0.03),transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.05),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_bottom,rgba(196,181,253,0.03),transparent_50%)] pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm"
                >
                  <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                      <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="space-y-4 mb-6">
                      <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        <div className="h-4 w-full bg-muted animate-pulse rounded" />
                        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <div className="h-6 w-16 bg-muted animate-pulse rounded-full" />
                      <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                      <div className="h-6 w-14 bg-muted animate-pulse rounded-full" />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                          <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                          <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                          <div className="h-4 w-8 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                      <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!articles.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
        <div className="container mx-auto px-0 py-8 max-w-6xl">
          {/* Compact Header */}
          <div className="text-center mb-12 py-8">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="h-16 w-16 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm border border-primary/10">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary/60 animate-pulse" />
              <Heart className="absolute -bottom-1 -left-1 h-4 w-4 text-accent/60 animate-pulse delay-300" />
              <Feather className="absolute top-2 left-2 h-3 w-3 text-primary/40 animate-bounce delay-500" />
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
              Couplets
            </h1>
            <p className="text-muted-foreground text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
              Explore a beautiful collection of couplets written by poets across the globe. Let their verses speak to
              your soul.
            </p>
          </div>

          {/* Enhanced Empty State */}
          <div className="text-center py-16">
            <div className="relative inline-flex items-center justify-center mb-8">
              <div className="h-24 w-24 bg-gradient-to-br from-muted/40 to-muted/20 rounded-full flex items-center justify-center shadow-lg">
                <div className="text-6xl">📝</div>
              </div>
              <Star className="absolute -top-2 -right-2 h-6 w-6 text-primary/40 animate-pulse" />
              <Sparkles className="absolute -bottom-2 -left-2 h-5 w-5 text-accent/40 animate-pulse delay-700" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">No articles yet</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
              Be the first to share your articles with the world and inspire others with your words.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
                <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Share Articles</p>
              </div>
              <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg p-4 border border-accent/20">
                <Heart className="h-6 w-6 text-accent mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Connect Hearts</p>
              </div>
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
                <Sparkles className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Inspire Souls</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      <div className="container mx-auto px-0 py-8 max-w-6xl">
        {/* Compact Header */}
        <div className="text-center mb-8 py-4">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm border border-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-primary/60 animate-pulse" />
            <Heart className="absolute -bottom-1 -left-1 h-3 w-3 text-accent/60 animate-pulse delay-300" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-2">
            Couplet Feed
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Explore beautiful couplets from poets across the globe
          </p>
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 rounded-lg px-3 py-1.5 border border-primary/20 dark:border-primary/10">
              <div className="flex items-center gap-2">
                <BookOpen className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-foreground">{articles.length} Couplets</span>
              </div>
            </div>
            <div className="bg-gradient-to-r from-accent/10 to-primary/10 dark:from-accent/5 dark:to-primary/5 rounded-lg px-3 py-1.5 border border-accent/20 dark:border-accent/10">
              <div className="flex items-center gap-2">
                <Heart className="h-3 w-3 text-accent" />
                <span className="text-xs font-medium text-foreground">Curated</span>
              </div>
            </div>
          </div>
        </div>

        {/* Article List */}
        <div className="relative">
          {/* Decorative background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.05),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(96,165,250,0.03),transparent_50%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.05),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_bottom,rgba(196,181,253,0.03),transparent_50%)] pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {articles.map((article: TransformedArticle, index) => (
              <div
                key={article._id}
                ref={index === articles.length - 1 ? lastArticleElementRef : null}
              >
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
          
          {/* Loading indicator for infinite scroll */}
          {isLoadingMore && (
            <div className="flex justify-center py-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium text-muted-foreground">Loading more articles...</span>
              </div>
            </div>
          )}
          
          {/* End of results indicator */}
          {!hasMore && articles.length > 0 && (
            <div className="flex justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">You&apos;ve reached the end!</p>
                <p className="text-xs text-muted-foreground">No more articles to load</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

"use client"
import { useState, useEffect, useCallback } from "react"
import { ArticleCard } from "@/components/articles/article-card"
import { ArticleCardSkeleton } from "@/components/articles/article-card-skeleton"
import { useInView } from "react-intersection-observer"
interface Article {
  _id: string
  title: string
  firstCoupletEn: string
  poet: {
    name: string
    profilePicture?: string | null
  }
  slug: string
  bookmarkCount: number
  viewsCount: number
  coverImage: string | null
  publishedAt: string | null
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ArticleListPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
  })


  const fetchArticles = useCallback(async (page: number, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const response = await fetch(`/api/articles/list?page=${page}&limit=${pagination.limit}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      if (isLoadMore) {
        setArticles(prev => [...prev, ...data.articles])
      } else {
        setArticles(data.articles)
      }
      
      setPagination(data.pagination)
      setHasMore(data.pagination.page < data.pagination.totalPages)
    } catch (err) {
      console.error("Failed to fetch articles:", err)
      setError("Failed to load articles. Please try again later.")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [pagination.limit])

  useEffect(() => {
    fetchArticles(1)
  }, [fetchArticles])

  // Load more articles when the load more ref comes into view
  useEffect(() => {
    if (inView && hasMore && !loadingMore && !loading) {
      const nextPage = pagination.page + 1
      setPagination(prev => ({ ...prev, page: nextPage }))
      fetchArticles(nextPage, true)
    }
  }, [inView, hasMore, loadingMore, loading, pagination.page, fetchArticles])

  if (loading) {
    return (
      <ArticleCardSkeleton/>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <main className="container mx-auto py-4 px-0 md:px-6">
      {articles.length === 0 ? (
        <div className="text-center text-muted-foreground">No articles found.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
          
          {/* Load more trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center items-center py-8">
              {loadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="text-muted-foreground">Loading more articles...</span>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  Scroll down to load more articles
                </div>
              )}
            </div>
          )}
          
          {!hasMore && articles.length > 0 && (
            <div className="text-center py-8 text-muted-foreground">
              You&apos;ve reached the end of the articles
            </div>
          )}
        </>
      )}
    </main>
  )
}
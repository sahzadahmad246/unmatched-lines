"use client"
import { useState, useEffect, useCallback } from "react"
import { ArticleCard } from "@/components/articles/article-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

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
    limit: 5,
    totalPages: 1,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes in milliseconds

  const fetchArticles = useCallback(async (page: number) => {
    setLoading(true)
    setError(null)

    const cacheKey = `articles_cache_page_${page}_limit_${pagination.limit}`
    const timestampKey = `articles_cache_timestamp_page_${page}_limit_${pagination.limit}`

    try {
      // Check cache first
      const cachedData = localStorage.getItem(cacheKey)
      const cachedTimestamp = localStorage.getItem(timestampKey)

      if (cachedData && cachedTimestamp) {
        const parsedTimestamp = Number.parseInt(cachedTimestamp, 10)
        if (Date.now() - parsedTimestamp < CACHE_DURATION) {
          const { articles: cachedArticles, pagination: cachedPagination } = JSON.parse(cachedData)
          setArticles(cachedArticles)
          setPagination(cachedPagination)
          setLoading(false)
          console.log("Loaded from cache!")
          return // Exit if data is from cache
        } else {
          console.log("Cache expired, fetching new data.")
          localStorage.removeItem(cacheKey)
          localStorage.removeItem(timestampKey)
        }
      }

      // If no valid cache, fetch from API
      const response = await fetch(`/api/articles/list?page=${page}&limit=${pagination.limit}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setArticles(data.articles)
      setPagination(data.pagination)

      // Cache the new data
      localStorage.setItem(cacheKey, JSON.stringify(data))
      localStorage.setItem(timestampKey, Date.now().toString())
      console.log("Fetched from API and cached.")
    } catch (err) {
      console.error("Failed to fetch articles:", err)
      setError("Failed to load articles. Please try again later.")
    } finally {
      setLoading(false)
    }
  }, [pagination.limit, CACHE_DURATION]) // Dependency: pagination.limit

  useEffect(() => {
    fetchArticles(pagination.page)
  }, [pagination.page, fetchArticles]) // Include fetchArticles in dependency array

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
    }
  }

  const handleNextPage = () => {
    if (pagination.page < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <p>Loading articles...</p>
      </div>
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
    <main className="container mx-auto py-8 px-4 md:px-6">
      <h1 className="text-3xl font-bold mb-8 text-center"></h1>
      {articles.length === 0 ? (
        <div className="text-center text-muted-foreground">No articles found.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
      <div className="flex justify-center items-center gap-4 mt-8">
        <Button
          onClick={handlePreviousPage}
          disabled={pagination.page <= 1}
          variant="outline"
          size="icon"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {pagination.page} of {pagination.totalPages}
        </span>
        <Button
          onClick={handleNextPage}
          disabled={pagination.page >= pagination.totalPages}
          variant="outline"
          size="icon"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </main>
  )
}
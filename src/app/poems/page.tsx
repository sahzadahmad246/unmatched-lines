import { notFound } from "next/navigation"
import EnhancedPoemList from "@/components/poems/PoemList"
import { BookOpen, Sparkles, Heart, Feather, Star } from "lucide-react"
import type { FeedItem, Pagination } from "@/types/poemTypes"

export default async function EnhancedPoemsPage() {
  try {
    const page = 1
    const limit = 10
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ""
    const url = `${baseUrl}/api/poems/feed?page=${page}&limit=${limit}`

    const response = await fetch(url, {
      credentials: "include",
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json().catch(() => {
      throw new Error("Invalid response format from feed API")
    })

    const { items: feedItems, pagination }: { items: FeedItem[]; pagination: Pagination } = data

    if (!feedItems.length) {
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
                Poetry Feed
              </h1>
              <p className="text-muted-foreground text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
                Discover beautiful poetry from talented poets around the world and let their words inspire your soul
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
              <h3 className="text-2xl font-bold mb-4 text-foreground">No poems yet</h3>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Be the first to share your poetry with the world and inspire others with your words.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border border-primary/20">
                  <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Share Poetry</p>
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
          {/* Compact and Enhanced Header */}
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
              Poetry Feed
            </h1>
            <p className="text-muted-foreground text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto">
              Discover beautiful poetry from talented poets around the world and let their words inspire your soul
            </p>

            {/* Stats or Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 dark:from-primary/5 dark:to-accent/5 rounded-xl px-4 py-2 border border-primary/20 dark:border-primary/10">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{feedItems.length} Poems</span>
                </div>
              </div>
              <div className="bg-gradient-to-r from-accent/10 to-primary/10 dark:from-accent/5 dark:to-primary/5 rounded-xl px-4 py-2 border border-accent/20 dark:border-accent/10">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">Curated Collection</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Poem List */}
          <div className="relative">
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.05),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(96,165,250,0.03),transparent_50%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(168,85,247,0.05),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_bottom,rgba(196,181,253,0.03),transparent_50%)] pointer-events-none" />

            <div className="relative">
              <EnhancedPoemList initialFeedItems={feedItems} initialPagination={pagination} />
            </div>
          </div>
        </div>
      </div>
    )
  } catch {
    notFound()
  }
}

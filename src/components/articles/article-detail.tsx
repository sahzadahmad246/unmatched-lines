"use client";
import Image from "next/image";
import type React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bookmark, Eye, MoreVertical, Pencil, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArticleCard } from "./article-card";
import { ArticleCardSkeleton } from "./article-card-skeleton"; // Import the new skeleton
import type { TransformedArticle } from "@/types/articleTypes";
import { useExplore } from "@/contexts/ExploreContext";
import { StickyHeader } from "@/components/ui/sticky-header";
import DownloadArticleCouplet from "@/components/poems/DownloadCouplet";
import "./../styles/ArticleContent.css";

interface Couplet {
  en?: string;
  hi?: string;
  ur?: string;
}

interface ArticleDetailProps {
  article: {
    _id: string;
    title: string;
    content: string;
    couplets: Couplet[];
    summary: string;
    poet: {
      _id: string;
      name: string;
      profilePicture?: string | null;
    };
    slug: string;
    coverImage: string | null;
    category: string[];
    tags: string[];
    bookmarkCount: number;
    viewsCount: number;
    metaDescription: string;
    metaKeywords: string;
    status: "draft" | "published";
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
    isBookmarked?: boolean;
  };
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Unknown date";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Unknown date";
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 0) return formatDate(date);
  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

export function ArticleDetail({ article }: ArticleDetailProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const { isExploreOpen } = useExplore();
  const [currentBookmarkCount, setCurrentBookmarkCount] = useState(
    article.bookmarkCount
  );
  const [isBookmarked, setIsBookmarked] = useState(
    article.isBookmarked || false
  );
  const [showFullContent, setShowFullContent] = useState(false);
  const [activeCoupletLanguage, setActiveCoupletLanguage] = useState<
    "en" | "hi" | "ur"
  >("en");
  const [relatedArticles, setRelatedArticles] = useState<TransformedArticle[]>(
    []
  );
  const [poetArticles, setPoetArticles] = useState<TransformedArticle[]>([]);
  const [isLoadingRelatedArticles, setIsLoadingRelatedArticles] =
    useState(true);
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false);
  const [isLoadingPoetArticles, setIsLoadingPoetArticles] = useState(true);

  // Fetch related articles by category
  useEffect(() => {
    async function fetchRelatedArticles() {
      if (article.category.length === 0) {
        setIsLoadingRelatedArticles(false);
        return;
      }
      setIsLoadingRelatedArticles(true);
      try {
        const response = await fetch(
          `/api/articles/category?category=${encodeURIComponent(
            article.category[0]
          )}`
        );
        const data = await response.json();
        if (response.ok) {
          // Filter out the current article
          const filteredArticles = data.articles.filter(
            (a: TransformedArticle) => a._id !== article._id
          );
          setRelatedArticles(filteredArticles);
        } else {
          console.error("Error fetching related articles:", data.message);
        }
      } catch (error) {
        console.error("Error fetching related articles:", error);
      } finally {
        setIsLoadingRelatedArticles(false);
      }
    }
    fetchRelatedArticles();
  }, [article.category, article._id]);

  // Fetch more articles by poet
  useEffect(() => {
    async function fetchPoetArticles() {
      setIsLoadingPoetArticles(true);
      try {
        // Use poet.name as the slug, converted to lowercase and hyphenated
        const poetSlug = article.poet.name.toLowerCase().replace(/\s+/g, "-");
        const response = await fetch(
          `/api/articles/poet?poet=${encodeURIComponent(poetSlug)}`
        );
        const data = await response.json();
        if (response.ok) {
          // Filter out the current article
          const filteredArticles = data.articles.filter(
            (a: TransformedArticle) => a._id !== article._id
          );
          setPoetArticles(filteredArticles);
        } else {
          console.error("Error fetching poet articles:", data.message);
        }
      } catch (error) {
        console.error("Error fetching poet articles:", error);
      } finally {
        setIsLoadingPoetArticles(false);
      }
    }
    fetchPoetArticles();
  }, [article.poet.name, article._id]);

  useEffect(() => {
    async function checkBookmarkStatus() {
      if (!session?.user?.id) {
        setIsBookmarked(false);
        return;
      }
      try {
        const response = await fetch("/api/articles/bookmark", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            articleId: article._id,
            userId: session.user.id,
            action: "check",
          }),
        });
        const data = await response.json();
        if (response.ok) {
          setIsBookmarked(data.isBookmarked);
          setCurrentBookmarkCount(data.article.bookmarkCount);
        } else {
          console.error("Error checking bookmark status:", data.message);
          toast.error(`Error checking bookmark status: ${data.message}`);
        }
      } catch {
        toast.error("Error checking bookmark status");
      }
    }
    checkBookmarkStatus();
  }, [article._id, session?.user?.id]);


  const handleBookmark = useCallback(async () => {
    if (!session?.user?.id) {
      toast.error("Please log in to bookmark articles.");
      return;
    }
    const action = isBookmarked ? "remove" : "add";
    try {
      const response = await fetch("/api/articles/bookmark", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleId: article._id,
          userId: session.user.id,
          action,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setIsBookmarked(result.isBookmarked);
        setCurrentBookmarkCount(result.article.bookmarkCount);
        toast.success(
          `Article ${action === "add" ? "bookmarked" : "unbookmarked"
          } successfully!`
        );
      } else {
        setIsBookmarked(result.isBookmarked);
        toast.info(result.message);
      }
    } catch (error) {
      toast.error(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }, [isBookmarked, article._id, session?.user?.id]);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      router.push(`/admin/articles/${article.slug}/edit`);
    },
    [article.slug, router]
  );

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!confirm("Are you sure you want to delete this article?")) return;
      try {
        const response = await fetch(`/api/articles/${article.slug}`, {
          method: "DELETE",
        });
        if (response.ok) {
          toast.success("Article deleted successfully!", {
            description: `The article "${article.title.substring(
              0,
              30
            )}..." has been removed.`,
          });
          router.push("/articles");
        } else {
          const result = await response.json();
          toast.error("Failed to delete article", {
            description: result.message || "An unknown error occurred.",
          });
        }
      } catch (error) {
        console.error("Deletion error:", error);
        toast.error("Deletion Error", {
          description: "Could not connect to the server.",
        });
      }
    },
    [article.slug, article.title, router]
  );

  if (!article) {
    return (
      <div className="container mx-auto py-12 text-center">
        Article not found.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-0 md:px-4 lg:py-12" style={{
      marginRight: isExploreOpen ? '420px' : '0',
      transition: 'margin-right 0.3s ease'
    }}>
      {/* Sticky Header */}
      <StickyHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-7 w-7">
              <AvatarImage
                src={
                  article.poet.profilePicture ||
                  "/placeholder.svg?height=40&width=40&query=poet profile" ||
                  "/placeholder.svg"
                }
                alt={article.poet.name}
              />
              <AvatarFallback>{article.poet.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground hidden md:block">
              {article.poet.name}
            </span>
          </div>
          <h2 className="text-lg font-semibold truncate text-center flex-1 mx-4">
            {article.title}
          </h2>
          <div className="w-14"></div>
        </div>
      </StickyHeader>


      <article className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">
            {article.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={
                    article.poet.profilePicture ||
                    "/placeholder.svg?height=40&width=40&query=poet profile" ||
                    "/placeholder.svg"
                  }
                  alt={article.poet.name}
                />
                <AvatarFallback>{article.poet.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>By {article.poet.name}</span>
            </div>
            {article.category.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.category.map((cat) => (
                  <Badge key={cat} variant="default">
                    {cat}
                  </Badge>
                ))}
              </div>
            )}
            <span className="text-sm text-muted-foreground">
              {article.publishedAt
                ? formatRelativeTime(article.publishedAt)
                : article.updatedAt
                  ? formatRelativeTime(article.updatedAt)
                  : "Unknown date"}
            </span>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{article.viewsCount}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className="flex items-center gap-1 text-sm p-0 h-auto"
              aria-label={
                isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"
              }
            >
              <Bookmark
                className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""
                  }`}
              />
              <span>{currentBookmarkCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDownloadDialogOpen(true)}
              className="flex items-center gap-1 text-sm p-0 h-auto"
              aria-label="Download couplet image"
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
            {(session?.user?.role === "admin" ||
              session?.user?.role === "poet") && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-sm p-0 h-auto"
                      aria-label="More options"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEdit}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDelete}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
          </div>
        </header>

        {article.couplets && article.couplets.length > 0 && (
          <div className="my-8 p-6 bg-muted rounded-lg shadow-inner">
            <div className="flex space-x-2 mb-4">
              {article.couplets.some((c) => c.en) && (
                <Button
                  variant={
                    activeCoupletLanguage === "en" ? "default" : "outline"
                  }
                  onClick={() => setActiveCoupletLanguage("en")}
                  size="sm"
                  className="text-xs px-2 py-1 h-auto"
                >
                  English
                </Button>
              )}
              {article.couplets.some((c) => c.hi) && (
                <Button
                  variant={
                    activeCoupletLanguage === "hi" ? "default" : "outline"
                  }
                  onClick={() => setActiveCoupletLanguage("hi")}
                  size="sm"
                  className="text-xs px-2 py-1 h-auto"
                >
                  Hindi
                </Button>
              )}
              {article.couplets.some((c) => c.ur) && (
                <Button
                  variant={
                    activeCoupletLanguage === "ur" ? "default" : "outline"
                  }
                  onClick={() => setActiveCoupletLanguage("ur")}
                  size="sm"
                  className="text-xs px-2 py-1 h-auto"
                >
                  Urdu
                </Button>
              )}
            </div>
            <div className="relative min-h-[80px]">
              {" "}
              {/* Added min-height for stability */}
              {article.couplets.map((couplet, index) => (
                <blockquote
                  key={index}
                  className="mb-4 last:mb-0 border-l-4 border-primary pl-4"
                >
                  {activeCoupletLanguage === "en" && couplet.en && (
                    <div className="space-y-0">
                      {" "}
                      {/* Use space-y-0 to control spacing */}
                      {couplet.en.split("\n").map((line, lineIndex) => (
                        <p key={lineIndex} className="leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                  {activeCoupletLanguage === "hi" && couplet.hi && (
                    <div className="space-y-0">
                      {couplet.hi.split("\n").map((line, lineIndex) => (
                        <p key={lineIndex} className="leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                  {activeCoupletLanguage === "ur" && couplet.ur && (
                    <div className="space-y-0">
                      {couplet.ur.split("\n").map((line, lineIndex) => (
                        <p
                          key={lineIndex}
                          className="text-right leading-relaxed"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </blockquote>
              ))}
            </div>
          </div>
        )}

        {article.coverImage && (
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mt-8">
            <Image
              src={article.coverImage || "/placeholder.svg"}
              alt={article.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
        )}

        <section className="prose prose-lg dark:prose-invert mx-auto article-content">
          {article.summary && (
            <p className="text-lg leading-relaxed mb-5">{article.summary}</p>
          )}
          {article.content && (
            <>
              {!showFullContent && (
                <div className="relative">
                  <div className="overflow-hidden">
                    <div
                      className="article-content"
                      dangerouslySetInnerHTML={{
                        __html: article.content.substring(0, 200) + "...",
                      }}
                    />
                  </div>
                </div>
              )}
              {showFullContent && (
                <div
                  className="article-content"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              )}
              <Button
                variant="outline"
                size="default"
                onClick={() => setShowFullContent(!showFullContent)}
                className="mt-4"
              >
                {showFullContent ? "See less" : "See more"}
              </Button>
            </>
          )}
        </section>

        {isLoadingRelatedArticles ? (
          <section className="mt-12 w-full">
            <h2 className="text-2xl font-bold mb-6">More like this</h2>
            <div className="grid grid-cols-1 gap-6">
              {[...Array(3)].map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          </section>
        ) : (
          relatedArticles.length > 0 && (
            <section className="mt-12 w-full">
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 gap-6">
                {relatedArticles.slice(0, 3).map((relatedArticle) => (
                  <ArticleCard
                    key={relatedArticle._id}
                    article={relatedArticle}
                  />
                ))}
              </div>
            </section>
          )
        )}

        {isLoadingPoetArticles ? (
          <section className="mt-12 w-full">
            <h2 className="text-2xl font-bold mb-6">
              More by {article.poet.name}
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {[...Array(3)].map((_, i) => (
                <ArticleCardSkeleton key={i} />
              ))}
            </div>
          </section>
        ) : (
          poetArticles.length > 0 && (
            <section className="mt-12 w-full">
              <h2 className="text-2xl font-bold mb-6">
                More by {article.poet.name}
              </h2>
              <div className="grid grid-cols-1 gap-6">
                {poetArticles.slice(0, 3).map((poetArticle) => (
                  <ArticleCard key={poetArticle._id} article={poetArticle} />
                ))}
              </div>
            </section>
          )
        )}

        <footer className="space-y-6 pt-8 border-t border-border">
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <span className="font-semibold">Tags:</span>
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </footer>
      </article>

      {/* Download Dialog */}
      <DownloadArticleCouplet
        articleSlug={article.slug}
        open={isDownloadDialogOpen}
        onOpenChange={setIsDownloadDialogOpen}
      />
    </div>
  );
}

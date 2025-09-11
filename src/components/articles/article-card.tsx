"use client";

import Link from "next/link";
import type React from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Bookmark, Eye, Copy, MoreVertical, Pencil, Trash2, Download, Share2, Heart } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatRelativeTime } from "@/lib/utils/date";
import DownloadArticleCouplet from "../poems/DownloadCouplet";

interface ArticleCardProps {
  article: {
    _id: string;
    firstCoupletEn: string;
    poet: {
      name: string;
      profilePicture?: string | null;
    };
    slug: string;
    bookmarkCount: number;
    likeCount: number;
    viewsCount: number;
    coverImage: string | null;
    publishedAt: string | null;
    isBookmarked?: boolean;
    isLiked?: boolean;
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [currentBookmarkCount, setCurrentBookmarkCount] = useState(article.bookmarkCount);
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked || false);
  const [currentLikeCount, setCurrentLikeCount] = useState(article.likeCount);
  const [isLiked, setIsLiked] = useState(article.isLiked || false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Effect to check initial bookmark status
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
        }
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      }
    }
    async function checkLikeStatus() {
      if (!session?.user?.id) {
        setIsLiked(false);
        return;
      }
      try {
        const response = await fetch(`/api/articles/${article.slug}/like`);
        const data = await response.json();
        if (response.ok) {
          setIsLiked(data.isLiked);
          setCurrentLikeCount(data.likeCount);
        } else {
          console.error("Error checking like status:", data.message);
        }
      } catch (error) {
        console.error("Error checking like status:", error);
      }
    }

    checkBookmarkStatus();
    checkLikeStatus();
  }, [article._id, article.slug, session?.user?.id]);

  const handleCopyCouplet = async () => {
    if (article.firstCoupletEn) {
      try {
        await navigator.clipboard.writeText(article.firstCoupletEn);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy couplet.");
      }
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsSharing(true);
    
    try {
      const articleUrl = `${window.location.origin}/article/${article.slug}`;
      const shareData = {
        title: `"${article.firstCoupletEn}" by ${article.poet.name}`,
        text: `Read this beautiful couplet by ${article.poet.name} on Unmatched Lines`,
        url: articleUrl,
      };

      // Check if Web Share API is supported
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        toast.success("Article shared successfully!");
      } else {
        // Fallback to copying URL to clipboard
        await navigator.clipboard.writeText(articleUrl);
        toast.success("Article URL copied to clipboard!");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error("Share error:", error);
        toast.error("Failed to share article");
      }
    } finally {
      setIsSharing(false);
    }
  };

  const handleBookmark = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
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
          toast.success(`Article ${action === "add" ? "bookmarked" : "unbookmarked"} successfully!`);
        } else {
          toast.info(result.message);
        }
      } catch (error) {
        console.error("Bookmark error:", error);
        toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    },
    [isBookmarked, article._id, session?.user?.id],
  );

  const handleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!session?.user?.id) {
        toast.error("Please log in to like articles.");
        return;
      }
      if (isLiking) return; // Prevent multiple clicks
      
      setIsLiking(true);
      try {
        const response = await fetch(`/api/articles/${article.slug}/like`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();
        if (response.ok) {
          setIsLiked(result.isLiked);
          setCurrentLikeCount(result.likeCount);
          // Remove toast for smoother UX
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error("Like error:", error);
        toast.error(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      } finally {
        setIsLiking(false);
      }
    },
    [article.slug, session?.user?.id, isLiking],
  );

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/admin/articles/${article.slug}/edit`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const response = await fetch(`/api/articles/${article.slug}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Article deleted successfully!", {
          description: `The article "${article.firstCoupletEn.substring(0, 30)}..." has been removed.`,
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
  };

  return (
    <>
      <Link href={`/article/${article.slug}`} className="block h-full group">
        <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="flex flex-col flex-grow justify-between p-6">
            {/* Header with Poet and Date */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                  <AvatarImage
                    src={article.poet.profilePicture || "/placeholder.svg?height=40&width=40&query=poet profile"}
                    alt={article.poet.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
                    {article.poet.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-medium text-foreground">{article.poet.name}</span>
                  <div className="text-xs text-muted-foreground">{formatRelativeTime(article.publishedAt || "")}</div>
                </div>
              </div>
            </div>
            
           
            
            {/* First Couplet */}
            {article.firstCoupletEn && (
              <CardDescription
                className="text-base leading-relaxed mb-6 border-l-4 border-primary/30 pl-4 bg-gradient-to-r from-primary/5 to-transparent py-3 rounded-r-lg font-medium text-foreground/90"
                style={{ whiteSpace: "pre-line" }}
              >
                {article.firstCoupletEn}
              </CardDescription>
            )}
            
            {/* Actions Footer */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mt-auto pt-4 border-t border-border/30">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 hover:text-primary transition-colors">
                  <Eye className="h-4 w-4" />
                  <span className="font-medium">{article.viewsCount}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={isLiking}
                  className="flex items-center gap-1 text-sm p-1 h-auto hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
                  aria-label={isLiked ? "Unlike article" : "Like article"}
                >
                  {isLiking ? (
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`} />
                  )}
                  <span className="font-medium">{currentLikeCount}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className="flex items-center gap-1 text-sm p-1 h-auto hover:bg-primary/10"
                  aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                >
                  <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
                  <span className="font-medium">{currentBookmarkCount}</span>
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleCopyCouplet();
                  }}
                  className="flex items-center gap-1 text-sm p-1 h-auto hover:bg-primary/10"
                  aria-label="Copy couplet"
                >
                  <Copy className="h-4 w-4" />
                  {copied && <span className="ml-1 text-xs text-green-500 font-medium">Copied!</span>}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex items-center gap-1 text-sm p-1 h-auto hover:bg-primary/10"
                  aria-label="Share article"
                >
                  <Share2 className={`h-4 w-4 ${isSharing ? 'animate-pulse' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsDownloadOpen(true);
                  }}
                  className="flex items-center gap-1 text-sm p-1 h-auto hover:bg-primary/10"
                  aria-label="Download couplet"
                >
                  <Download className="h-4 w-4" />
                </Button>
                {(session?.user?.role === "admin" || session?.user?.role === "poet") && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-sm p-1 h-auto hover:bg-primary/10"
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
            </div>
          </CardContent>
        </Card>
      </Link>
      <DownloadArticleCouplet
        articleSlug={article.slug}
        open={isDownloadOpen}
        onOpenChange={setIsDownloadOpen}
      />
    </>
  );
}
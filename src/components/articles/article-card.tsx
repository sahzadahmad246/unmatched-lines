"use client";

import Link from "next/link";
import type React from "react";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Bookmark, Eye, Copy, MoreVertical, Pencil, Trash2, Download } from "lucide-react";
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
    viewsCount: number;
    coverImage: string | null;
    publishedAt: string | null;
    isBookmarked?: boolean;
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [currentBookmarkCount, setCurrentBookmarkCount] = useState(article.bookmarkCount);
  const [isBookmarked, setIsBookmarked] = useState(article.isBookmarked || false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

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
    checkBookmarkStatus();
  }, [article._id, session?.user?.id]);

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
      <Link href={`/article/${article.slug}`} className="block h-full">
        <Card className="flex flex-col h-full overflow-hidden transition-all duration-200 hover:shadow-lg">
          <CardContent className="flex flex-col flex-grow justify-between p-4 pt-0">
            {/* Poet on left, Date on right */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={article.poet.profilePicture || "/placeholder.svg?height=40&width=40&query=poet profile"}
                    alt={article.poet.name}
                  />
                  <AvatarFallback>{article.poet.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{article.poet.name}</span>
              </div>
              <span>{formatRelativeTime(article.publishedAt || "")}</span>
            </div>
            {/* First Couplet */}
            {article.firstCoupletEn && (
              <CardDescription
                className="text-base mt-2 mb-4 border-l-4 border-gray-300 pl-4"
                style={{ whiteSpace: "pre-line" }}
              >
                {article.firstCoupletEn}
              </CardDescription>
            )}
            {/* Views, Bookmarks, Copy, Download, and More Menu */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-auto">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{article.viewsCount}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className="flex items-center gap-1 text-sm p-0 h-auto"
                aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-primary text-primary" : ""}`} />
                <span>{currentBookmarkCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCopyCouplet();
                }}
                className="flex items-center gap-1 text-sm p-0 h-auto"
                aria-label="Copy couplet"
              >
                <Copy className="h-4 w-4" />
                {copied && <span className="ml-1 text-xs text-green-500">Copied!</span>}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDownloadOpen(true);
                }}
                className="flex items-center gap-1 text-sm p-0 h-auto"
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
                      className="ml-auto flex items-center gap-1 text-sm p-0 h-auto"
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
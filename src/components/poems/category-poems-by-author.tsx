"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { PoemListItem } from "@/components/poems/poem-list-item";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { Poem, Poet } from "@/types/poem";

interface PoetCategoryPoemsProps {
  slug: string;
  category: string;
  initialPoems: Poem[];
  initialTotal: number;
  initialPages: number;
}

interface ApiResponse {
  poems: Poem[];
  total: number;
  page: number;
  pages: number;
}

export function PoetCategoryPoems({ slug, category, initialPoems, initialTotal, initialPages }: PoetCategoryPoemsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [poet, setPoet] = useState<Poet | null>(null);
  const [poems, setPoems] = useState<Poem[]>(
    initialPoems.map((p) => ({
      ...p,
      viewsCount: p.viewsCount ?? 0,
      readListCount: p.readListCount ?? 0,
      category: p.category ?? "Uncategorized",
    }))
  );
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialPages > 1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readList, setReadList] = useState<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Reuse styles from PoetProfileComponent
  const customStyles = `
    .full-width-container { width: 100%; max-width: 100%; padding-left: 1rem; padding-right: 1rem; }
    @media (min-width: 640px) { .full-width-container { padding-left: 2rem; padding-right: 2rem; } }
    @media (min-width: 1024px) { .full-width-container { padding-left: 3rem; padding-right: 3rem; } }
  `;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch poet data
        const poetRes = await fetch(`/api/authors/${encodeURIComponent(slug)}`, { credentials: "include" });
        if (!poetRes.ok) throw new Error("Failed to fetch poet");
        const poetData = await poetRes.json();
        setPoet(poetData.author);

        // Fetch user readlist
        const userRes = await fetch("/api/user", { credentials: "include" });
        if (userRes.ok) {
          const userData = await userRes.json();
          setReadList(userData.user.readList.map((poem: any) => poem._id.toString()));
        }
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, [slug]);

  const fetchPoems = async (pageNum: number) => {
    if (pageNum === 1) return; // Skip fetching for page 1 since we have initialPoems
    try {
      setLoading(true);
      const res = await fetch(
        `/api/poems-by-category?category=${encodeURIComponent(category)}&authorSlug=${encodeURIComponent(
          slug
        )}&page=${pageNum}&limit=50`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error(`Failed to fetch poems: ${res.status}`);
      const data: ApiResponse = await res.json();
      const newPoems = data.poems.map((p: Poem) => ({
        ...p,
        viewsCount: p.viewsCount ?? 0,
        readListCount: p.readListCount ?? 0,
        category: p.category ?? "Uncategorized",
      }));
      setPoems((prev) => [...prev, ...newPoems]);
      setHasMore(pageNum < data.pages);
      setPage(pageNum);
    } catch (err) {
      setError("Failed to load more poems");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasMore || initialLoading || loading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          fetchPoems(page + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current && loadMoreRef.current) {
        observerRef.current.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loading, page, initialLoading]);

  const handleReadlistToggle = async (poemId: string, poemTitle: string) => {
    const isInReadlist = readList.includes(poemId);
    const url = isInReadlist ? "/api/user/readlist/remove" : "/api/user/readlist/add";
    const method = isInReadlist ? "DELETE" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poemId }),
        credentials: "include",
      });

      if (res.ok) {
        setReadList((prev) => (isInReadlist ? prev.filter((id) => id !== poemId) : [...prev, poemId]));
        setPoems((prev) =>
          prev.map((poem) =>
            poem._id === poemId
              ? {
                  ...poem,
                  readListCount: isInReadlist ? poem.readListCount - 1 : poem.readListCount + 1,
                }
              : poem
          )
        );
        toast(isInReadlist ? "Removed from reading list" : "Added to reading list", {
          description: `"${poemTitle}" has been ${isInReadlist ? "removed from" : "added to"} your reading list.`,
        });
      } else if (res.status === 401) {
        toast("Authentication required", {
          description: "Please sign in to manage your reading list.",
        });
      }
    } catch (error) {
      toast("Error", {
        description: "An error occurred while updating the reading list.",
      });
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full">
        <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
        <p className="text-xl font-medium text-purple-700 dark:text-pink-300">Loading...</p>
      </div>
    );
  }

  if (error || !poet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full">
        <div className="text-4xl">😕</div>
        <h2 className="text-2xl font-bold text-purple-700 dark:text-pink-300">{error || "Poet not found"}</h2>
        <Button
          onClick={() => router.push("/poets")}
          className="mt-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-pink-300 border border-purple-300/30 dark:border-pink-600/30 hover:bg-purple-50 dark:hover:bg-pink-950/50"
        >
          Back to Poets
        </Button>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className="full-width-container mx-auto py-8 mb-20 w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 relative">
        <div className="mb-6">
          <Button
            variant="ghost"
            className="gap-2 text-purple-700 dark:text-pink-300 hover:bg-purple-50 dark:hover:bg-pink-950/50"
            onClick={() => router.push(`/poets/${slug}`)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Poet Profile
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="shadow-md border border-emerald-200/60 dark:border-teal-700/20 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-950 dark:via-green-950 dark:to-teal-950">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-emerald-700 dark:text-teal-300 mb-6">
                {category.charAt(0).toUpperCase() + category.slice(1)} by {poet.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {poems.map((poem, index) => (
                  <motion.div
                    key={poem._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index, duration: 0.3 }}
                  >
                    <PoemListItem
                      poem={poem}
                      coverImage={poem.coverImage || `/placeholder.svg?index=${index}`}
                      englishSlug={poem.slug?.en || poem._id}
                      isInReadlist={readList.includes(poem._id)}
                      poemTitle={poem.title?.en || "Untitled"}
                      handleReadlistToggle={handleReadlistToggle}
                    />
                  </motion.div>
                ))}
              </div>
              {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center mt-6">
                  <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                </div>
              )}
              {!hasMore && poems.length > 0 && (
                <p className="text-center text-gray-600 dark:text-gray-400 mt-6">No more poems to load</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
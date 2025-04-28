"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { PoemListItem } from "@/components/poems/poem-list-item";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { Poem, Poet } from "@/types/poem";

interface AllWritingsProps {
  slug: string;
}

interface ApiResponse {
  poems: Poem[];
  totalPoems: number;
  currentPage: number;
  totalPages: number;
}

export function AllWritings({ slug }: AllWritingsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [poet, setPoet] = useState<Poet | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [poemsByTab, setPoemsByTab] = useState<Record<string, Poem[]>>({});
  const [allPoems, setAllPoems] = useState<Poem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [allPoemsLoading, setAllPoemsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [readList, setReadList] = useState<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Reuse styles from PoetProfileComponent
  const customStyles = `
    .tabs-scrollable::-webkit-scrollbar { height: 4px; }
    .tabs-scrollable::-webkit-scrollbar-track { background: transparent; }
    .tabs-scrollable::-webkit-scrollbar-thumb { background-color: rgba(139, 92, 246, 0.2); border-radius: 20px; }
    .tabs-scrollable { scrollbar-width: thin; scrollbar-color: rgba(139, 92, 246, 0.2) transparent; }
    .tab-trigger { flex: 1; min-width: 100px; white-space: nowrap; }
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

        // Fetch poems to get categories and initial "All Works" poems
        const poemRes = await fetch(`/api/poem?authorSlug=${encodeURIComponent(slug)}&page=1&limit=50`, {
          credentials: "include",
        });
        if (!poemRes.ok) throw new Error("Failed to fetch poems");
        const poemData: ApiResponse = await poemRes.json();
        const uniqueCategories = Array.from(
          new Set(poemData.poems.map((p: Poem) => p.category.toLowerCase()))
        ).filter((cat): cat is string => !!cat);
        setCategories(uniqueCategories);
        setAllPoems(
          poemData.poems.map((p: Poem) => ({
            ...p,
            viewsCount: p.viewsCount ?? 0,
            readListCount: p.readListCount ?? 0,
            category: p.category ?? "Uncategorized",
          }))
        );
        setHasMore(poemData.currentPage < poemData.totalPages);

        // Fetch user readlist
        const userRes = await fetch("/api/user", { credentials: "include" });
        if (userRes.ok) {
          const userData = await userRes.json();
          setReadList(userData.user.readList.map((poem: any) => poem._id.toString()));
        }

        // Fetch 5 poems for other tabs (categories, top-50, top-20)
        const tabs = [...uniqueCategories, "top-50", ...uniqueCategories.map((c) => `top-20-${c}`)];
        const poemsPromises = tabs.map(async (tab) => {
          let url: string;
          if (tab === "top-50") {
            url = `/api/poem?authorSlug=${encodeURIComponent(slug)}&top=50&limit=5`;
          } else if (tab.startsWith("top-20-")) {
            const category = tab.replace("top-20-", "");
            url = `/api/poems-by-category?category=${encodeURIComponent(category)}&authorSlug=${encodeURIComponent(
              slug
            )}&top=20&limit=5`;
          } else {
            url = `/api/poems-by-category?category=${encodeURIComponent(tab)}&authorSlug=${encodeURIComponent(
              slug
            )}&limit=5`;
          }
          const res = await fetch(url, { credentials: "include" });
          if (!res.ok) throw new Error(`Failed to fetch poems for ${tab}`);
          const data = await res.json();
          return { tab, poems: data.poems };
        });

        const poemsResults = await Promise.all(poemsPromises);
        const poemsMap = poemsResults.reduce(
          (acc, { tab, poems }) => {
            acc[tab] = poems.map((p: Poem) => ({
              ...p,
              viewsCount: p.viewsCount ?? 0,
              readListCount: p.readListCount ?? 0,
              category: p.category ?? "Uncategorized",
            }));
            return acc;
          },
          { all: allPoems } as Record<string, Poem[]>
        );
        setPoemsByTab(poemsMap);
      } catch (err) {
        setError("Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [slug]);

  const fetchMorePoems = async (pageNum: number) => {
    try {
      setAllPoemsLoading(true);
      const res = await fetch(`/api/poem?authorSlug=${encodeURIComponent(slug)}&page=${pageNum}&limit=50`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to fetch poems for page ${pageNum}`);
      const data: ApiResponse = await res.json();
      const newPoems = data.poems.map((p: Poem) => ({
        ...p,
        viewsCount: p.viewsCount ?? 0,
        readListCount: p.readListCount ?? 0,
        category: p.category ?? "Uncategorized",
      }));
      setAllPoems((prev) => [...prev, ...newPoems]);
      setPoemsByTab((prev) => ({ ...prev, all: [...prev.all, ...newPoems] }));
      setHasMore(data.currentPage < data.totalPages);
      setPage(pageNum);
    } catch (err) {
      setError("Failed to load more poems");
      console.error(err);
    } finally {
      setAllPoemsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasMore || loading || allPoemsLoading) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !allPoemsLoading) {
          fetchMorePoems(page + 1);
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
  }, [hasMore, allPoemsLoading, page, loading]);

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
        setAllPoems((prev) =>
          prev.map((poem) =>
            poem._id === poemId
              ? { ...poem, readListCount: isInReadlist ? poem.readListCount - 1 : poem.readListCount + 1 }
              : poem
          )
        );
        setPoemsByTab((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((tab) => {
            updated[tab] = updated[tab].map((poem) =>
              poem._id === poemId
                ? { ...poem, readListCount: isInReadlist ? poem.readListCount - 1 : poem.readListCount + 1 }
                : poem
            );
          });
          return updated;
        });
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

  if (loading) {
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
                All Writings of {poet.name}
              </h2>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full overflow-x-auto flex tabs-scrollable pb-1 h-auto bg-gradient-to-r from-sky-100 via-rose-100 to-sky-100 dark:from-sky-900/50 dark:via-rose-900/50 dark:to-sky-900/50 border border-sky-200/40 dark:border-rose-700/20">
                  <TabsTrigger
                    value="all"
                    className="tab-trigger text-sky-700 dark:text-rose-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-200 data-[state=active]:to-rose-200 data-[state=active]:dark:from-sky-800/50 data-[state=active]:dark:to-rose-800/50"
                  >
                    All Works
                  </TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="capitalize tab-trigger text-sky-700 dark:text-rose-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-200 data-[state=active]:to-rose-200 data-[state=active]:dark:from-sky-800/50 data-[state=active]:dark:to-rose-800/50"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                  <TabsTrigger
                    value="top-50"
                    className="tab-trigger text-sky-700 dark:text-rose-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-200 data-[state=active]:to-rose-200 data-[state=active]:dark:from-sky-800/50 data-[state=active]:dark:to-rose-800/50"
                  >
                    Top 50
                  </TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger
                      key={`top-20-${category}`}
                      value={`top-20-${category}`}
                      className="capitalize tab-trigger text-sky-700 dark:text-rose-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-sky-200 data-[state=active]:to-rose-200 data-[state=active]:dark:from-sky-800/50 data-[state=active]:dark:to-rose-800/50"
                    >
                      Top 20 {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all">
                  <PoemGrid poems={allPoems} readList={readList} handleReadlistToggle={handleReadlistToggle} />
                  {hasMore && (
                    <div ref={loadMoreRef} className="flex justify-center mt-6">
                      <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
                    </div>
                  )}
                  {!hasMore && allPoems.length > 0 && (
                    <p className="text-center text-gray-600 dark:text-gray-400 mt-6">No more poems to load</p>
                  )}
                </TabsContent>

                {categories.map((category) => (
                  <TabsContent key={category} value={category}>
                    <PoemGrid
                      poems={poemsByTab[category] || []}
                      readList={readList}
                      handleReadlistToggle={handleReadlistToggle}
                    />
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        className="bg-white/80 dark:bg-slate-900/80 border-sky-200/40 dark:border-rose-700/20 text-sky-700 dark:text-rose-300 hover:bg-sky-50 dark:hover:bg-rose-950/50"
                        onClick={() => router.push(`/poets/${slug}/${category}`)}
                      >
                        See All {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Button>
                    </div>
                  </TabsContent>
                ))}

                <TabsContent value="top-50">
                  <PoemGrid
                    poems={poemsByTab["top-50"] || []}
                    readList={readList}
                    handleReadlistToggle={handleReadlistToggle}
                  />
                  <div className="mt-6 text-center">
                    <Button
                      variant="outline"
                      className="bg-white/80 dark:bg-slate-900/80 border-sky-200/40 dark:border-rose-700/20 text-sky-700 dark:text-rose-300 hover:bg-sky-50 dark:hover:bg-rose-950/50"
                      onClick={() => router.push(`/poets/${slug}/top-50`)}
                    >
                      See Top 50
                    </Button>
                  </div>
                </TabsContent>

                {categories.map((category) => (
                  <TabsContent key={`top-20-${category}`} value={`top-20-${category}`}>
                    <PoemGrid
                      poems={poemsByTab[`top-20-${category}`] || []}
                      readList={readList}
                      handleReadlistToggle={handleReadlistToggle}
                    />
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        className="bg-white/80 dark:bg-slate-900/80 border-sky-200/40 dark:border-rose-700/20 text-sky-700 dark:text-rose-300 hover:bg-sky-50 dark:hover:bg-rose-950/50"
                        onClick={() => router.push(`/poets/${slug}/${category}/top-20`)}
                      >
                        See Top 20 {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Button>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}

function PoemGrid({
  poems,
  readList,
  handleReadlistToggle,
}: {
  poems: Poem[];
  readList: string[];
  handleReadlistToggle: (id: string, title: string) => void;
}) {
  return (
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
  );
}
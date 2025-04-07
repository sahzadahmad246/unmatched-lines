// src/components/PoetProfileComponent.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  BookOpen,
  Calendar,
  MapPin,
  Feather,
  User,
  ArrowLeft,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PoemListItem } from "@/components/poems/poem-list-item";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Poem {
  _id: string;
  title: { en: string; hi?: string; ur?: string };
  author: { name: string; _id: string };
  category: string;
  excerpt?: string;
  slug?: { en: string };
  content?: {
    en?: string[] | string;
    hi?: string[] | string;
    ur?: string[] | string;
  };
  readListCount?: number;
  tags?: string[];
}

interface CoverImage {
  _id: string;
  url: string;
}

interface PoetProfileProps {
  slug: string;
}

export function PoetProfileComponent({ slug }: PoetProfileProps) {
  const router = useRouter();
  const [poet, setPoet] = useState<any>(null);
  const [poems, setPoems] = useState<Poem[]>([]);
  const [filteredPoems, setFilteredPoems] = useState<Poem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [coverImages, setCoverImages] = useState<CoverImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readList, setReadList] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showFullBio, setShowFullBio] = useState(false);
  const [profileImageOpen, setProfileImageOpen] = useState(false);

  const PREVIEW_LIMIT = 3; // Show only 3 poems per category as a preview

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [poetRes, poemRes, userRes, coverImagesRes] = await Promise.all([
          fetch(`/api/authors/${slug}`, { credentials: "include" }),
          fetch(`/api/poem`, { credentials: "include" }),
          fetch("/api/user", { credentials: "include" }),
          fetch("/api/cover-images", { credentials: "include" }),
        ]);

        if (!poetRes.ok) throw new Error(`Failed to fetch poet data`);
        const poetData = await poetRes.json();
        setPoet(poetData.author);

        if (!poemRes.ok) throw new Error(`Failed to fetch poems`);
        const poemData = await poemRes.json();
        const poetPoems = poemData.poems.filter(
          (poem: any) =>
            poem.author?._id.toString() === poetData.author._id.toString()
        );
        setPoems(poetPoems);
        setFilteredPoems(poetPoems);

        // Extract unique categories from poet's poems
        const uniqueCategories = Array.from(
          new Set(poetPoems.map((poem: Poem) => poem.category?.toLowerCase()))
        ).filter((cat): cat is string => !!cat);
        setCategories(uniqueCategories);

        if (userRes.ok) {
          const userData = await userRes.json();
          setReadList(
            userData.user.readList.map((poem: any) => poem._id.toString())
          );
        }

        if (coverImagesRes.ok) {
          const coverImagesData = await coverImagesRes.json();
          setCoverImages(coverImagesData.coverImages || []);
        }
      } catch (err) {
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
    else {
      setError("No profile identifier provided");
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPoems(
        activeTab === "all"
          ? poems
          : poems.filter((p) => p.category?.toLowerCase() === activeTab)
      );
    } else {
      const query = searchQuery.toLowerCase();
      const results = poems
        .filter((poem) =>
          activeTab === "all" ? true : poem.category?.toLowerCase() === activeTab
        )
        .filter(
          (poem) =>
            poem.title.en.toLowerCase().includes(query) ||
            poem.excerpt?.toLowerCase().includes(query) ||
            poem.category?.toLowerCase().includes(query)
        );
      setFilteredPoems(results);
    }
  }, [searchQuery, poems, activeTab]);

  const handleReadlistToggle = async (poemId: string, poemTitle: string) => {
    const isInReadlist = readList.includes(poemId);
    const url = isInReadlist
      ? "/api/user/readlist/remove"
      : "/api/user/readlist/add";
    const method = isInReadlist ? "DELETE" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poemId }),
        credentials: "include",
      });

      if (res.ok) {
        setReadList((prev) =>
          isInReadlist ? prev.filter((id) => id !== poemId) : [...prev, poemId]
        );
        setPoems((prevPoems) =>
          prevPoems.map((poem) =>
            poem._id === poemId
              ? {
                  ...poem,
                  readListCount: isInReadlist
                    ? (poem.readListCount || 1) - 1
                    : (poem.readListCount || 0) + 1,
                }
              : poem
          )
        );
        toast(
          isInReadlist ? "Removed from reading list" : "Added to reading list",
          {
            description: `"${poemTitle}" has been ${
              isInReadlist ? "removed from" : "added to"
            } your reading list.`,
          }
        );
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

  const getCoverImage = () => {
    if (coverImages.length === 0) return "/placeholder.svg";
    const randomIndex = Math.floor(Math.random() * coverImages.length);
    return coverImages[randomIndex]?.url || "/placeholder.svg";
  };

  const truncateBio = (bio: string, maxLength = 120) => {
    if (!bio || bio.length <= maxLength) return bio;
    return bio.substring(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full">
        <Loader2 className="h-12 w-12 text-primary/70 animate-spin" />
        <p className="text-xl font-medium">Loading poet profile...</p>
      </div>
    );
  }

  if (error || !poet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full">
        <div className="text-4xl">😕</div>
        <h2 className="text-2xl font-bold">{error || "Profile not found"}</h2>
        <Link href="/poets">
          <Button className="mt-4">Back to Profiles</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl mb-20 w-full">
      <div className="mb-6">
        <Link href="/poets">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Poets
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-1"
        >
          <Card className="overflow-hidden border shadow-md bg-background">
            <div className="h-24 bg-gradient-to-r from-primary/10 via-primary/20 to-primary/10 relative" />
            <CardContent className="px-4 pt-0 pb-5 relative">
              <div
                onClick={() => setProfileImageOpen(true)}
                className="cursor-pointer"
              >
                <Avatar className="h-20 w-20 border-4 border-background absolute -top-20 left-4">
                  <AvatarImage
                    src={poet.image || "/placeholder.svg?height=400&width=400"}
                    alt={poet.name}
                  />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {poet.name?.charAt(0) || "P"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="mt-14 space-y-3">
                <h1 className="text-xl font-semibold">{poet.name}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="gap-1">
                    <User className="h-3 w-3" />
                    <span className="text-xs">Poet</span>
                  </Badge>
                </div>
                <Separator className="my-4" />
                {poet.bio && (
                  <div className="space-y-2">
                    <div className="flex gap-2 text-sm">
                      <Feather className="h-4 w-4 flex-shrink-0 mt-1 text-primary/70" />
                      <p className="text-muted-foreground">
                        {showFullBio ? poet.bio : truncateBio(poet.bio)}
                      </p>
                    </div>
                    {poet.bio.length > 120 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="text-xs w-full"
                      >
                        {showFullBio ? (
                          <>
                            Show less <ChevronUp className="h-3 w-3 ml-1" />
                          </>
                        ) : (
                          <>
                            See more <ChevronDown className="h-3 w-3 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0 text-primary/70" />
                  <span>
                    {poet.dob
                      ? new Date(poet.dob).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </span>
                </div>
                {poet.city && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-primary/70" />
                    <span>{poet.city}</span>
                  </div>
                )}
                <Separator className="my-4" />
                <div className="grid grid-cols-3 gap-2 text-center">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant="ghost"
                      className="bg-muted/50 p-3 rounded-md h-auto flex flex-col hover:bg-muted"
                      onClick={() => router.push(`/poets/${slug}/${category}`)}
                    >
                      <p className="text-xl font-bold text-primary">
                        {
                          poems.filter(
                            (p) => p.category?.toLowerCase() === category
                          ).length
                        }
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {category}
                      </p>
                    </Button>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground space-y-1 mt-4">
                  <p>
                    <span className="font-medium">Added:</span>{" "}
                    {new Date(poet.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {poet.updatedAt !== poet.createdAt && (
                    <p>
                      <span className="font-medium">Last Updated:</span>{" "}
                      {new Date(poet.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="mt-4 p-4 text-center text-muted-foreground italic text-sm bg-muted/30 rounded-lg border border-primary/5">
            "Poetry is the spontaneous overflow of powerful feelings: it takes
            its origin from emotion recollected in tranquility."
            <div className="mt-1 font-medium text-xs">
              — William Wordsworth
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:col-span-2"
        >
          <Card className="shadow-md">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">
                    Works by {poet.name}
                  </h2>
                  <Badge variant="secondary">{poems.length} Poems</Badge>
                </div>
                <div className="relative w-full sm:w-auto sm:min-w-[240px]">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search poems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="mb-6 grid grid-cols-2 sm:grid-flow-col h-11">
                  <TabsTrigger value="all">All Works</TabsTrigger>
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="capitalize"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all">
                  {filteredPoems.length > 0 ? (
                    <div className="space-y-4">
                      {filteredPoems.map((poem, index) => {
                        const poemTitle = poem.title?.en || "Untitled";
                        const englishSlug = poem.slug?.en || poem._id;
                        const isInReadlist = readList.includes(poem._id);
                        return (
                          <motion.div
                            key={poem._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index, duration: 0.3 }}
                          >
                            <PoemListItem
                              poem={poem}
                              coverImage={getCoverImage()}
                              englishSlug={englishSlug}
                              isInReadlist={isInReadlist}
                              poemTitle={poemTitle}
                              handleReadlistToggle={handleReadlistToggle}
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyState query={searchQuery} />
                  )}
                </TabsContent>

                {categories.map((category) => (
                  <TabsContent key={category} value={category}>
                    {filteredPoems.filter(
                      (p) => p.category?.toLowerCase() === category
                    ).length > 0 ? (
                      <div className="space-y-4">
                        {filteredPoems
                          .filter((p) => p.category?.toLowerCase() === category)
                          .slice(0, PREVIEW_LIMIT)
                          .map((poem, index) => {
                            const poemTitle = poem.title?.en || "Untitled";
                            const englishSlug = poem.slug?.en || poem._id;
                            const isInReadlist = readList.includes(poem._id);
                            return (
                              <motion.div
                                key={poem._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  delay: 0.05 * index,
                                  duration: 0.3,
                                }}
                              >
                                <PoemListItem
                                  poem={poem}
                                  coverImage={getCoverImage()}
                                  englishSlug={englishSlug}
                                  isInReadlist={isInReadlist}
                                  poemTitle={poemTitle}
                                  handleReadlistToggle={handleReadlistToggle}
                                />
                              </motion.div>
                            );
                          })}
                        <div className="mt-4 text-center">
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/poets/${slug}/${category}`)}
                          >
                            See All {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <EmptyState category={`${category}s`} query={searchQuery} />
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Dialog open={profileImageOpen} onOpenChange={setProfileImageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{poet.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setProfileImageOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="relative aspect-square w-full overflow-hidden rounded-md">
            <Image
              src={poet.image || "/placeholder.svg?height=400&width=400"}
              alt={poet.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface EmptyStateProps {
  category?: string;
  query?: string;
}

function EmptyState({ category = "works", query }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">
        {query ? `No results found for "${query}"` : `No ${category} available`}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md">
        {query
          ? "Try adjusting your search terms or browse all works"
          : `There are no ${category} available at the moment.`}
      </p>
    </div>
  );
}
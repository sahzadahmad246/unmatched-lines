"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import {
  BookOpen,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BookHeart,
  Search,
  Filter,
  BookText,
  X,
  Grid3X3,
  List,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LineOfTheDay } from "./line-of-the-day";
import { PoetCard } from "@/components/home/poet-card";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingComponent } from "@/components/utils/LoadingComponent";
import { PoemCard } from "./poem-card";
import { PoemListItem } from "./poem-list-item";

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
  uploadedBy: { name: string };
  createdAt: string;
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Library() {
  const [poets, setPoets] = useState<any[]>([]);
  const [poemsByPoet, setPoemsByPoet] = useState<{ [key: string]: any[] }>({});
  const [readList, setReadList] = useState<string[]>([]);
  const [coverImages, setCoverImages] = useState<CoverImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredPoem, setFeaturedPoem] = useState<any>(null);
  const [activeLang, setActiveLang] = useState<"en" | "hi" | "ur">("en");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [allPoems, setAllPoems] = useState<Poem[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPoems, setFilteredPoems] = useState<Poem[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<"poems" | "poets">("poems");

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const poetsRes = await fetch("/api/authors", {
          credentials: "include",
        });
        if (!poetsRes.ok) throw new Error("Failed to fetch poets");
        const poetsData = await poetsRes.json();

        const shuffledPoets = [...poetsData.authors];
        for (let i = shuffledPoets.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledPoets[i], shuffledPoets[j]] = [
            shuffledPoets[j],
            shuffledPoets[i],
          ];
        }
        setPoets(shuffledPoets);

        const poemsRes = await fetch("/api/poem", { credentials: "include" });
        if (!poemsRes.ok) throw new Error("Failed to fetch poems");
        const poemsData = await poemsRes.json();
        const poems = poemsData.poems || [];
        setAllPoems(poems);
        setFilteredPoems(poems);

        const categories = Array.from(
          new Set(poems.map((poem: Poem) => poem.category).filter(Boolean))
        ) as string[];
        setAvailableCategories(categories);

        const coverImagesRes = await fetch("/api/cover-images", {
          credentials: "include",
        });
        if (!coverImagesRes.ok) throw new Error("Failed to fetch cover images");
        const coverImagesData = await coverImagesRes.json();
        setCoverImages(coverImagesData.coverImages || []);

        const poemsByPoetMap: { [key: string]: any[] } = {};
        shuffledPoets.slice(0, 4).forEach((poet) => {
          const poetPoems = poems.filter(
            (poem: Poem) =>
              poem.author?._id === poet._id || poem.author?.name === poet.name
          );
          const categorizedPoems: { [key: string]: any[] } = {};
          poetPoems.forEach((poem: Poem) => {
            if (!categorizedPoems[poem.category])
              categorizedPoems[poem.category] = [];
            categorizedPoems[poem.category].push(poem);
          });

          const poetPoemsWithCategory: any[] = [];
          Object.entries(categorizedPoems).forEach(([category, poems]) => {
            const shuffledCategoryPoems = [...poems];
            for (let i = shuffledCategoryPoems.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffledCategoryPoems[i], shuffledCategoryPoems[j]] = [
                shuffledCategoryPoems[j],
                shuffledCategoryPoems[i],
              ];
            }
            shuffledCategoryPoems.slice(0, 4).forEach((poem) => {
              poetPoemsWithCategory.push({
                ...poem,
                displayCategory: category,
              });
            });
          });
          if (poetPoemsWithCategory.length > 0)
            poemsByPoetMap[poet._id] = poetPoemsWithCategory;
        });
        setPoemsByPoet(poemsByPoetMap);

        const userRes = await fetch("/api/user", { credentials: "include" });
        if (userRes.ok) {
          const userData = await userRes.json();
          setReadList(
            userData.user.readList.map((poem: any) => poem._id.toString())
          );
        } else if (userRes.status === 401) {
          setReadList([]);
        } else {
          throw new Error("Failed to fetch user data");
        }
      } catch (err) {
        setError((err as Error).message || "Failed to load library content");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (allPoems.length === 0) return;

    const updateFeaturedPoem = () => {
      const now = new Date();
      const hourIndex = Math.floor(now.getTime() / (1000 * 60 * 60));
      const poemIndex = hourIndex % allPoems.length;
      const selectedPoem = allPoems[poemIndex];
      setFeaturedPoem(selectedPoem);
    };

    updateFeaturedPoem();
    const interval = setInterval(updateFeaturedPoem, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [allPoems]);

  useEffect(() => {
    if (allPoems.length === 0) return;

    let filtered = [...allPoems];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (poem) =>
          poem.title?.en?.toLowerCase().includes(query) ||
          poem.author?.name?.toLowerCase().includes(query) ||
          poem.category?.toLowerCase().includes(query)
      );
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((poem) =>
        selectedCategories.includes(poem.category)
      );
    }

    setFilteredPoems(filtered);
  }, [searchQuery, selectedCategories, allPoems]);

  const getRandomCoverImage = () => {
    if (coverImages.length === 0)
      return "/placeholder.svg?height=300&width=300";
    const randomIndex = Math.floor(Math.random() * coverImages.length);
    return coverImages[randomIndex].url;
  };

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
        setFeaturedPoem((prev: any) =>
          prev?._id === poemId
            ? {
                ...prev,
                readListCount: isInReadlist
                  ? (prev.readListCount || 1) - 1
                  : (prev.readListCount || 0) + 1,
              }
            : prev
        );
        setPoemsByPoet((prevPoemsByPoet) => {
          const updated = { ...prevPoemsByPoet };
          Object.keys(updated).forEach((poetId) => {
            updated[poetId] = updated[poetId].map((poem) => {
              if (poem._id === poemId) {
                return {
                  ...poem,
                  readListCount: isInReadlist
                    ? (poem.readListCount || 1) - 1
                    : (poem.readListCount || 0) + 1,
                };
              }
              return poem;
            });
          });
          return updated;
        });

        if (isInReadlist) {
          toast.error("Removed from reading list", {
            description: `"${poemTitle}" has been removed from your reading list.`,
          });
        } else {
          toast.custom(
            (t) => (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-primary text-primary-foreground rounded-lg shadow-lg p-4 flex items-center gap-3"
              >
                <BookHeart className="h-5 w-5" />
                <div>
                  <div className="font-medium">Added to your anthology</div>
                  <div className="text-sm opacity-90">
                    "{poemTitle}" now resides in your collection
                  </div>
                </div>
              </motion.div>
            ),
            { duration: 3000 }
          );
        }
      } else if (res.status === 401) {
        toast.error("Authentication required", {
          description: "Please sign in to manage your reading list.",
          action: {
            label: "Sign In",
            onClick: () => (window.location.href = "/api/auth/signin"),
          },
        });
      } else {
        throw new Error("Failed to update readlist");
      }
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred while updating the reading list.",
      });
    }
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[50vh]"
      >
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive">{error}</h2>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-background mb-16">
      {/* Use the LineOfTheDay component */}
      <LineOfTheDay poems={allPoems} coverImages={coverImages} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-64 lg:w-72 shrink-0">
            <div className="sticky top-4 bg-background rounded-lg md:border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-serif flex items-center gap-2 md:flex">
                  <BookText className="h-5 w-5 text-primary" />
                  <span>Library</span>
                </h2>
              </div>

              <div className="hidden md:block space-y-6">
                <div>
                  <h3 className="font-medium mb-2 text-sm">Search</h3>
                  <div className="relative">
                    <Input
                      placeholder="Search poems..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2 text-sm flex items-center justify-between">
                    <span>Categories</span>
                    {selectedCategories.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => setSelectedCategories([])}
                      >
                        Clear
                      </Button>
                    )}
                  </h3>
                  <div className="space-y-2">
                    {availableCategories.map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2 text-sm">View</h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      Grid
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4 mr-2" />
                      List
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isMobile && (
            <Drawer open={filterOpen} onOpenChange={setFilterOpen}>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Filters</DrawerTitle>
                  <DrawerDescription>
                    Refine your poetry collection
                  </DrawerDescription>
                </DrawerHeader>
                <div className="px-4 py-2 space-y-6">
                  <div>
                    <h3 className="font-medium mb-2 text-sm">Search</h3>
                    <div className="relative">
                      <Input
                        placeholder="Search poems..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                          onClick={() => setSearchQuery("")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2 text-sm flex items-center justify-between">
                      <span>Categories</span>
                      {selectedCategories.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => setSelectedCategories([])}
                        >
                          Clear
                        </Button>
                      )}
                    </h3>
                    <div className="space-y-2">
                      {availableCategories.map((category) => (
                        <div
                          key={category}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`mobile-category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <label
                            htmlFor={`mobile-category-${category}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                          >
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2 text-sm">View</h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={viewMode === "grid" ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setViewMode("grid");
                          setFilterOpen(false);
                        }}
                      >
                        <Grid3X3 className="h-4 w-4 mr-2" />
                        Grid
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setViewMode("list");
                          setFilterOpen(false);
                        }}
                      >
                        <List className="h-4 w-4 mr-2" />
                        List
                      </Button>
                    </div>
                  </div>
                </div>
                <DrawerFooter>
                  <Button onClick={() => setFilterOpen(false)}>
                    Apply Filters
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          )}

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl md:text-2xl font-bold font-serif hidden md:block">
                Poetry Collection
              </h1>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:hidden">
                    <Input
                      placeholder="Search poems..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-8 py-2 text-sm"
                    />
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-8 w-8"
                    onClick={() => setFilterOpen(true)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:flex"
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "poems" | "poets")
              }
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="poems" className="text-xs sm:text-sm">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Poems
                </TabsTrigger>
                <TabsTrigger value="poets" className="text-xs sm:text-sm">
                  <Users className="h-4 w-4 mr-2" />
                  Poets
                </TabsTrigger>
              </TabsList>

              <TabsContent value="poems" className="mt-0">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium">{filteredPoems.length}</span>{" "}
                    poems
                    {selectedCategories.length > 0 && (
                      <span>
                        {" "}
                        in {selectedCategories.map((c) => c).join(", ")}
                      </span>
                    )}
                    {searchQuery && <span> matching "{searchQuery}"</span>}
                  </p>
                  <div className="hidden sm:flex items-center gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {filteredPoems.length === 0 ? (
                  <div className="text-center p-8 sm:p-12 bg-muted/20 rounded-lg border border-primary/10">
                    <BookText className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-medium mb-2">
                      No poems found
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground italic font-serif">
                      Try adjusting your filters or search query
                    </p>
                    {(searchQuery || selectedCategories.length > 0) && (
                      <Button
                        variant="outline"
                        className="mt-4 text-xs sm:text-sm"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategories([]);
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredPoems.map((poem) => {
                      const englishSlug = poem.slug?.en || poem._id;
                      const isInReadlist = readList.includes(poem._id);
                      const poemTitle = poem.title?.en || "Untitled";
                      return (
                        <motion.div
                          key={poem._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          whileHover={{ y: -5 }}
                        >
                          <PoemCard
                            poem={poem}
                            coverImage={getRandomCoverImage()}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPoems.map((poem) => {
                      const englishSlug = poem.slug?.en || poem._id;
                      const isInReadlist = readList.includes(poem._id);
                      const poemTitle = poem.title?.en || "Untitled";
                      return (
                        <motion.div
                          key={poem._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <PoemListItem
                            poem={poem}
                            coverImage={getRandomCoverImage()}
                            englishSlug={englishSlug}
                            isInReadlist={isInReadlist}
                            poemTitle={poemTitle}
                            handleReadlistToggle={handleReadlistToggle}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="poets" className="mt-0">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Showing <span className="font-medium">{poets.length}</span>{" "}
                    poets
                    {searchQuery && <span> matching "{searchQuery}"</span>}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {poets.slice(0, 8).map((poet, index) => (
                    <PoetCard
                      key={poet._id}
                      poet={poet}
                      variant="compact"
                      index={index}
                    />
                  ))}
                </div>

                <div className="mt-8 space-y-6">
                  <h3 className="text-lg font-bold font-serif flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Featured Poets
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {poets.slice(0, 4).map((poet, index) => (
                      <PoetCard
                        key={poet._id}
                        poet={{
                          ...poet,
                        }}
                        variant="full"
                        index={index}
                      />
                    ))}
                  </div>

                  <div className="flex justify-center mt-4">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="gap-2 font-serif text-xs sm:text-sm"
                    >
                      <Link href="/poets">
                        View All Poets
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent className="border border-primary/20">
          <motion.div initial={fadeIn.hidden} animate={fadeIn.visible}>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-serif text-xl">
                Share this poem
              </AlertDialogTitle>
              <AlertDialogDescription>
                Copy the link below to share this beautiful poem with others
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={
                  typeof window !== "undefined" ? window.location.href : ""
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied", {
                    description:
                      "The poem's link has been copied to your clipboard",
                    icon: <Sparkles className="h-4 w-4" />,
                  });
                  setShowShareDialog(false);
                }}
              >
                Copy
              </Button>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-serif">
                Close
              </AlertDialogCancel>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

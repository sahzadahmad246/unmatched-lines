"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  User,
  AlertTriangle,
  BookmarkPlus,
  BookmarkCheck,
  Feather,
  ArrowRight,
  Download,
  Share2,
  Heart,
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
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LineOfTheDay } from "@/components/poems/line-of-the-day";
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
import { VerseDownload } from "@/components/home/verse-download"; // Add this import

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
  const [lineOfTheDay, setLineOfTheDay] = useState<string>("");
  const [lineAuthor, setLineAuthor] = useState<string>("");
  const [coverImage, setCoverImage] = useState<string>("");
  const [readList, setReadList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [featuredPoem, setFeaturedPoem] = useState<any>(null);
  const [activeLang, setActiveLang] = useState<"en" | "hi" | "ur">("en");
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<string>("");
  const [downloadLanguage, setDownloadLanguage] = useState<"en" | "hi" | "ur">(
    "en"
  );
  const [versesMap, setVersesMap] = useState<{
    en: string[];
    hi: string[];
    ur: string[];
  }>({
    en: [],
    hi: [],
    ur: [],
  });
  const [todayDate] = useState(
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  );
  const [allPoems, setAllPoems] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPoems, setFilteredPoems] = useState<any[]>([]);
  const [poemOfTheDay, setPoemOfTheDay] = useState<any>(null);
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

        // Fix TypeScript error by explicitly typing the categories as string[]
        const categories = Array.from(
          new Set(poems.map((poem: any) => poem.category).filter(Boolean))
        ) as string[];
        setAvailableCategories(categories);

        const poemsByPoetMap: { [key: string]: any[] } = {};
        shuffledPoets.slice(0, 4).forEach((poet) => {
          const poetPoems = poems.filter(
            (poem: any) =>
              poem.author?._id === poet._id || poem.author?.name === poet.name
          );
          const categorizedPoems: { [key: string]: any[] } = {};
          poetPoems.forEach((poem: any) => {
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

        if (poems.length > 0) {
          const dateStr = new Date().toISOString().split("T")[0];
          let seed = 0;
          for (let i = 0; i < dateStr.length; i++)
            seed += dateStr.charCodeAt(i);
          const poemIndex = seed % poems.length;
          const selectedPoem = poems[poemIndex];
          setPoemOfTheDay(selectedPoem);

          const verses = {
            en: Array.isArray(selectedPoem.content?.en)
              ? selectedPoem.content.en.filter(Boolean)
              : selectedPoem.content?.en?.split("\n").filter(Boolean) || [],
            hi: Array.isArray(selectedPoem.content?.hi)
              ? selectedPoem.content.hi.filter(Boolean)
              : selectedPoem.content?.hi?.split("\n").filter(Boolean) || [],
            ur: Array.isArray(selectedPoem.content?.ur)
              ? selectedPoem.content.ur.filter(Boolean)
              : selectedPoem.content?.ur?.split("\n").filter(Boolean) || [],
          };
          const verseArray =
            verses.en.length > 0
              ? verses.en
              : verses.hi.length > 0
              ? verses.hi
              : verses.ur.length > 0
              ? verses.ur
              : [];
          if (verseArray.length > 0) {
            const verseIndex = seed % verseArray.length;
            setLineOfTheDay(verseArray[verseIndex] || "No verse available");
          }
          setCoverImage(
            selectedPoem.coverImage || "/placeholder.svg?height=600&width=800"
          );
          setLineAuthor(selectedPoem.author?.name || "Unknown Author");
        }

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

      const verses = {
        en: Array.isArray(selectedPoem.content?.en)
          ? selectedPoem.content.en.filter(Boolean)
          : selectedPoem.content?.en?.split("\n").filter(Boolean) || [],
        hi: Array.isArray(selectedPoem.content?.hi)
          ? selectedPoem.content.hi.filter(Boolean)
          : selectedPoem.content?.hi?.split("\n").filter(Boolean) || [],
        ur: Array.isArray(selectedPoem.content?.ur)
          ? selectedPoem.content.ur.filter(Boolean)
          : selectedPoem.content?.ur?.split("\n").filter(Boolean) || [],
      };
      setVersesMap(verses);

      if (verses.en.length > 0) setSelectedVerse(verses.en[0]);
      else if (verses.hi.length > 0) {
        setSelectedVerse(verses.hi[0]);
        setDownloadLanguage("hi");
      } else if (verses.ur.length > 0) {
        setSelectedVerse(verses.ur[0]);
        setDownloadLanguage("ur");
      }
    };

    updateFeaturedPoem();
    const interval = setInterval(updateFeaturedPoem, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, [allPoems]);

  // Filter poems based on search query and selected categories
  useEffect(() => {
    if (allPoems.length === 0) return;

    let filtered = [...allPoems];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (poem) =>
          poem.title?.en?.toLowerCase().includes(query) ||
          poem.author?.name?.toLowerCase().includes(query) ||
          poem.category?.toLowerCase().includes(query)
      );
    }

    // Filter by selected categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((poem) =>
        selectedCategories.includes(poem.category)
      );
    }

    setFilteredPoems(filtered);
  }, [searchQuery, selectedCategories, allPoems]);

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

 

  const handleLanguageChange = (lang: "en" | "hi" | "ur") => {
    setDownloadLanguage(lang);
    if (versesMap[lang].length > 0) setSelectedVerse(versesMap[lang][0]);
  };

  const renderVerseToCanvas = async (
    verse: string,
    imageUrl: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = canvasRef.current;
      if (!canvas) return reject("Canvas not found");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Unable to get canvas context");

      const img: HTMLImageElement = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let fontFamily = "serif";
        if (downloadLanguage === "ur") {
          fontFamily = "Noto Nastaliq Urdu, serif";
          ctx.direction = "rtl";
        } else if (downloadLanguage === "hi")
          fontFamily = "Noto Sans Devanagari, serif";
        const fontSize = Math.max(canvas.width * 0.035, 24);
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = "white";

        const lines = [];
        const maxWidth = canvas.width * 0.8;
        const verseLines = verse.split("\n").filter(Boolean); // Split by explicit newlines

        for (const line of verseLines) {
          if (ctx.measureText(line).width <= maxWidth) lines.push(line);
          else {
            const words = line.split(" ");
            let currentLine = "";
            for (const word of words) {
              const testLine = currentLine + (currentLine ? " " : "") + word;
              if (ctx.measureText(testLine).width <= maxWidth)
                currentLine = testLine;
              else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
              }
            }
            if (currentLine) lines.push(currentLine);
          }
        }

        const lineHeight = fontSize * 1.5;
        const totalTextHeight = lines.length * lineHeight;
        let yPosition = (canvas.height - totalTextHeight) / 2;
        for (const line of lines) {
          ctx.fillText(line, canvas.width / 2, yPosition);
          yPosition += lineHeight;
        }

        const authorName = lineOfTheDay
          ? lineAuthor
          : featuredPoem.author?.name || "Unknown Author";
        ctx.font = `italic ${fontSize * 0.8}px ${fontFamily}`;
        ctx.fillText(`— ${authorName}`, canvas.width / 2, canvas.height * 0.85);

        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = () => reject("Failed to load image");
      img.src = imageUrl;
    });
  };

  const downloadVerseImage = async () => {
    if (!selectedVerse || !featuredPoem) return;
    try {
      toast.loading("Creating your verse image...");
      const imageUrl = featuredPoem.coverImage || "/placeholder.jpg";
      const dataUrl = await renderVerseToCanvas(selectedVerse, imageUrl);

      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      const title = featuredPoem.title?.[downloadLanguage] || "poem";
      downloadLink.download = `${title
        .replace(/\s+/g, "-")
        .toLowerCase()}-verse.jpg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setShowDownloadDialog(false);
      toast.dismiss();
      toast.success("Verse image downloaded", {
        description: "Your verse has been captured as an image",
        icon: <Sparkles className="h-4 w-4" />,
      });
    } catch (error) {
      console.error("Error generating verse image:", error);
      toast.dismiss();
      toast.error("Download failed", {
        description: "Could not create your verse image. Please try again.",
      });
    }
  };

  const formatPoetryContent = (content: string[] | undefined) => {
    if (!content || !Array.isArray(content) || content.length === 0) {
      return (
        <div className="italic text-muted-foreground">
          Content not available
        </div>
      );
    }
    return (
      <div className="space-y-8">
        {content.map((stanza, index) => (
          <div key={index} className="poem-stanza">
            {stanza.split("\n").map((line, lineIndex) => (
              <div key={lineIndex} className="poem-line leading-relaxed">
                {line || "\u00A0"}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{
            rotate: {
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
            scale: {
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
          }}
        >
          <Feather className="h-16 w-16 text-primary/60" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl sm:text-2xl font-bold mt-6 font-serif italic"
        >
          Loading poetic treasures...
        </motion.h2>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "250px" }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mt-4"
        />
      </div>
    );
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
      <canvas ref={canvasRef} className="hidden" />

      {/* Line of the Day */}
      <LineOfTheDay
        lineOfTheDay={lineOfTheDay}
        lineAuthor={lineAuthor}
        coverImage={coverImage}
        poemOfTheDay={poemOfTheDay}
        todayDate={todayDate}
      />

      {/* Library Main Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="md:w-64 lg:w-72 shrink-0">
            <div className="sticky top-4 bg-background rounded-lg border p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold font-serif flex items-center gap-2 hidden md:flex">
                  <BookText className="h-5 w-5 text-primary" />
                  <span>Library</span>
                </h2>
              </div>

              <div className="hidden md:block space-y-6 border border-red-500">
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

          {/* Mobile Filter Drawer */}
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

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              {/* Hide "Poetry Collection" on mobile */}
              <h1 className="text-xl md:text-2xl font-bold font-serif hidden md:block">
                Poetry Collection
              </h1>

              <div className="flex items-center gap-2 w-full md:w-auto">
                {/* Mobile search and filter */}
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

            {/* Content Tabs */}
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
                {/* Results Count and View Toggle */}
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

                {/* Poems Grid/List */}
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
                  <div className="space-y-4">
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
                          bio: "A renowned poet known for exceptional contributions to literature with a distinctive style that captures the essence of human emotions.",
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

      {/* Share Dialog */}
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

      {/* Download Verse Dialog */}
      <AlertDialog
        open={showDownloadDialog}
        onOpenChange={setShowDownloadDialog}
      >
        <AlertDialogContent className="border border-primary/20 sm:max-w-[525px]">
          <motion.div initial={fadeIn.hidden} animate={fadeIn.visible}>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-serif text-xl flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Verse Image
              </AlertDialogTitle>
              <AlertDialogDescription>
                Select a verse and language to create a shareable image with
                your favorite lines
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="download-language" className="font-serif">
                  Language
                </Label>
                <RadioGroup
                  defaultValue={downloadLanguage}
                  onValueChange={(value: string) =>
                    handleLanguageChange(value as "en" | "hi" | "ur")
                  }
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="en"
                      id="en"
                      disabled={!versesMap.en.length}
                    />
                    <Label htmlFor="en">English</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="hi"
                      id="hi"
                      disabled={!versesMap.hi.length}
                    />
                    <Label htmlFor="hi">Hindi</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="ur"
                      id="ur"
                      disabled={!versesMap.ur.length}
                    />
                    <Label htmlFor="ur">Urdu</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="selected-verse" className="font-serif">
                  Select Verse
                </Label>
                <Select
                  value={selectedVerse}
                  onValueChange={setSelectedVerse}
                  disabled={versesMap[downloadLanguage].length === 0}
                >
                  <SelectTrigger className="w-full font-serif">
                    <SelectValue placeholder="Choose a verse" />
                  </SelectTrigger>
                  <SelectContent>
                    {versesMap[downloadLanguage].map((verse, index) => (
                      <SelectItem
                        key={index}
                        value={verse}
                        className="font-serif whitespace-normal"
                      >
                        {verse.substring(0, 60)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedVerse && (
                <div className="p-4 bg-muted/30 border rounded-md max-h-48 overflow-y-auto">
                  <h4 className="text-sm font-medium mb-2 font-serif">
                    Preview:
                  </h4>
                  <div
                    className={`text-sm italic ${
                      downloadLanguage === "ur" ? "rtl text-right" : ""
                    }`}
                  >
                    {selectedVerse}
                  </div>
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-serif">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={downloadVerseImage}
                className="font-serif gap-2"
                disabled={
                  !selectedVerse || versesMap[downloadLanguage].length === 0
                }
              >
                <Download className="h-4 w-4" />
                Download Image
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PoemCard({
  poem,
  englishSlug,
  isInReadlist,
  poemTitle,
  handleReadlistToggle,
}: {
  poem: any;
  englishSlug: string;
  isInReadlist: boolean;
  poemTitle: string;
  handleReadlistToggle: (id: string, title: string) => void;
}) {
  return (
    <Card className="h-full overflow-hidden border-primary/10 hover:border-primary/30 transition-colors shadow-sm hover:shadow-md">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={poem.coverImage || "/placeholder.svg?height=300&width=300"}
            alt={poemTitle}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform hover:scale-105 duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="text-sm sm:text-base font-bold line-clamp-1 font-serif text-white">
              {poemTitle}
            </h3>
            <div className="flex items-center gap-2 text-white/80">
              <User className="h-3 w-3" />
              <span className="text-xs">
                {poem.author?.name || "Unknown Author"}
              </span>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm flex items-center gap-1 text-xs capitalize"
          >
            {poem.category || "Poetry"}
          </Badge>
        </div>
        <CardContent className="flex-grow p-3 sm:p-4 flex flex-col justify-between">
          <div>
            {poem.excerpt && (
              <p className="text-xs text-muted-foreground line-clamp-2 font-serif mb-3">
                {poem.excerpt}
              </p>
            )}
            {poem.tags && poem.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {poem.tags.slice(0, 3).map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {poem.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{poem.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-2">
            <Link href={`/poems/${englishSlug}`} className="inline-flex">
              <Button
                variant="default"
                size="sm"
                className="gap-1 font-serif text-xs"
              >
                <BookOpen className="h-3 w-3" /> Read
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <Heart className="h-3 w-3 mr-1 text-primary" />
                <span>{poem.readListCount || 0}</span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReadlistToggle(poem._id, poemTitle)}
                className={`${
                  isInReadlist ? "text-primary" : "text-muted-foreground"
                } hover:text-primary p-1 h-auto`}
              >
                {isInReadlist ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <BookmarkPlus className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

function PoemListItem({
  poem,
  englishSlug,
  isInReadlist,
  poemTitle,
  handleReadlistToggle,
}: {
  poem: any;
  englishSlug: string;
  isInReadlist: boolean;
  poemTitle: string;
  handleReadlistToggle: (id: string, title: string) => void;
}) {
  return (
    <Card className="overflow-hidden border-primary/10 hover:border-primary/30 transition-colors shadow-sm hover:shadow-md">
      <div className="flex flex-row overflow-hidden">
        <div className="relative w-20 sm:w-24 md:w-32 aspect-square">
          <Image
            src={poem.coverImage || "/placeholder.svg?height=300&width=300"}
            alt={poemTitle}
            fill
            sizes="(max-width: 640px) 80px, (max-width: 768px) 96px, 128px"
            className="object-cover"
          />
          <Badge
            variant="secondary"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm flex items-center gap-1 text-[10px] capitalize"
          >
            {poem.category || "Poetry"}
          </Badge>
        </div>
        <div className="flex flex-col justify-between p-3 flex-1">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-bold line-clamp-1 font-serif">
                {poemTitle}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReadlistToggle(poem._id, poemTitle)}
                className={`${
                  isInReadlist ? "text-primary" : "text-muted-foreground"
                } hover:text-primary p-1 h-auto`}
              >
                {isInReadlist ? (
                  <BookmarkCheck className="h-4 w-4" />
                ) : (
                  <BookmarkPlus className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <User className="h-3 w-3" />
              <span className="text-xs">
                {poem.author?.name || "Unknown Author"}
              </span>
            </div>
            {poem.excerpt && (
              <p className="text-xs text-muted-foreground line-clamp-1 font-serif mb-2">
                {poem.excerpt}
              </p>
            )}
          </div>
          <div className="flex justify-between items-center mt-2">
            <Link href={`/poems/${englishSlug}`} className="inline-flex">
              <Button
                variant="default"
                size="sm"
                className="gap-1 font-serif text-xs"
              >
                <BookOpen className="h-3 w-3" /> Read Poem
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex items-center text-xs text-muted-foreground">
                <Heart className="h-3 w-3 mr-1 text-primary" />
                <span>{poem.readListCount || 0} Readers</span>
              </div>
              
              
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Bookmark,
  Feather,
  ArrowRight,
  Download,
  Share2,
  Heart,
  Calendar,
  Sparkles,
  BookHeart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [downloadLanguage, setDownloadLanguage] = useState<"en" | "hi" | "ur">("en");
  const [versesMap, setVersesMap] = useState<{ en: string[]; hi: string[]; ur: string[] }>({
    en: [],
    hi: [],
    ur: [],
  });
  const [todayDate] = useState(new Date().toISOString().split("T")[0]);
  const [allPoems, setAllPoems] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const poetsRes = await fetch("/api/authors", { credentials: "include" });
        if (!poetsRes.ok) throw new Error("Failed to fetch poets");
        const poetsData = await poetsRes.json();

        const shuffledPoets = [...poetsData.authors];
        for (let i = shuffledPoets.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledPoets[i], shuffledPoets[j]] = [shuffledPoets[j], shuffledPoets[i]];
        }
        setPoets(shuffledPoets.slice(0, 4));

        const poemsRes = await fetch("/api/poem", { credentials: "include" });
        if (!poemsRes.ok) throw new Error("Failed to fetch poems");
        const poemsData = await poemsRes.json();
        setAllPoems(poemsData.poems);

        const poemsByPoetMap: { [key: string]: any[] } = {};
        shuffledPoets.slice(0, 4).forEach((poet) => {
          const poetPoems = poemsData.poems.filter(
            (poem: any) => poem.author?._id === poet._id || poem.author?.name === poet.name
          );
          const categorizedPoems: { [key: string]: any[] } = {};
          poetPoems.forEach((poem: any) => {
            if (!categorizedPoems[poem.category]) categorizedPoems[poem.category] = [];
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
              poetPoemsWithCategory.push({ ...poem, displayCategory: category });
            });
          });
          if (poetPoemsWithCategory.length > 0) poemsByPoetMap[poet._id] = poetPoemsWithCategory;
        });
        setPoemsByPoet(poemsByPoetMap);

        if (poemsData.poems.length > 0) {
          const dateStr = todayDate;
          let seed = 0;
          for (let i = 0; i < dateStr.length; i++) seed += dateStr.charCodeAt(i);
          const poemIndex = seed % poemsData.poems.length;
          const selectedPoem = poemsData.poems[poemIndex];

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
          const verseArray = verses.en.length > 0 ? verses.en : verses.hi.length > 0 ? verses.hi : verses.ur.length > 0 ? verses.ur : [];
          if (verseArray.length > 0) {
            const verseIndex = seed % verseArray.length;
            setLineOfTheDay(verseArray[verseIndex] || "No verse available");
          }
          setCoverImage(selectedPoem.coverImage || "/placeholder.svg?height=600&width=800");
          setLineAuthor(selectedPoem.author?.name || "Unknown Author");
        }

        const userRes = await fetch("/api/user", { credentials: "include" });
        if (userRes.ok) {
          const userData = await userRes.json();
          setReadList(userData.user.readList.map((poem: any) => poem._id.toString()));
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
  }, [todayDate]);

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
        setFeaturedPoem((prev: any) =>
          prev?._id === poemId
            ? {
                ...prev,
                readListCount: isInReadlist ? (prev.readListCount || 1) - 1 : (prev.readListCount || 0) + 1,
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
                  readListCount: isInReadlist ? (poem.readListCount || 1) - 1 : (poem.readListCount || 0) + 1,
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
                  <div className="text-sm opacity-90">"{poemTitle}" now resides in your collection</div>
                </div>
              </motion.div>
            ),
            { duration: 3000 }
          );
        }
      } else if (res.status === 401) {
        toast.error("Authentication required", {
          description: "Please sign in to manage your reading list.",
          action: { label: "Sign In", onClick: () => window.location.href = "/api/auth/signin" },
        });
      } else {
        throw new Error("Failed to update readlist");
      }
    } catch (error) {
      toast.error("Error", { description: "An error occurred while updating the reading list." });
    }
  };

  const handleSharePoem = () => {
    if (navigator.share && featuredPoem) {
      navigator
        .share({
          title: featuredPoem.title?.[activeLang] || "Beautiful Poem",
          text: `Check out this beautiful poem: ${featuredPoem.title?.[activeLang]}`,
          url: window.location.href,
        })
        .then(() => {
          toast.success("Shared successfully", {
            description: "You've shared this poem with others",
            icon: <Share2 className="h-4 w-4" />,
          });
        })
        .catch(() => setShowShareDialog(true));
    } else {
      setShowShareDialog(true);
    }
  };

  const handleLanguageChange = (lang: "en" | "hi" | "ur") => {
    setDownloadLanguage(lang);
    if (versesMap[lang].length > 0) setSelectedVerse(versesMap[lang][0]);
  };

  const renderVerseToCanvas = async (verse: string, imageUrl: string): Promise<string> => {
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
        } else if (downloadLanguage === "hi") fontFamily = "Noto Sans Devanagari, serif";
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
              if (ctx.measureText(testLine).width <= maxWidth) currentLine = testLine;
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

        const authorName = lineOfTheDay ? lineAuthor : featuredPoem.author?.name || "Unknown Author";
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
      downloadLink.download = `${title.replace(/\s+/g, "-").toLowerCase()}-verse.jpg`;
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
      toast.error("Download failed", { description: "Could not create your verse image. Please try again." });
    }
  };

  const downloadLineOfTheDay = async () => {
    if (!lineOfTheDay || !coverImage) return;
    try {
      toast.loading("Creating your verse image...");
      const dataUrl = await renderVerseToCanvas(lineOfTheDay, coverImage);

      const downloadLink = document.createElement("a");
      downloadLink.href = dataUrl;
      downloadLink.download = `line-of-the-day-${todayDate}.jpg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      toast.dismiss();
      toast.success("Verse image downloaded", {
        description: "Your Line of the Day has been captured as an image",
        icon: <Download className="h-4 w-4" />,
      });
    } catch (error) {
      console.error("Error generating verse image:", error);
      toast.dismiss();
      toast.error("Download failed", { description: "Could not create your verse image. Please try again." });
    }
  };

  const shareLineOfTheDay = async () => {
    if (!lineOfTheDay) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Line of the Day",
          text: `"${lineOfTheDay}" — ${lineAuthor}`,
          url: window.location.href,
        });
        toast.success("Shared successfully");
      } else {
        await navigator.clipboard.writeText(`"${lineOfTheDay}" — ${lineAuthor}`);
        toast.success("Copied to clipboard", {
          description: "The verse has been copied to your clipboard",
        });
      }
    } catch (error) {
      toast.error("Sharing failed", { description: "Could not share the verse. Please try again." });
    }
  };

  const formatVerseForDisplay = (verse: string) => {
    if (!verse) return ["No verse available"];
    const lines = [];
    const maxLength = 40; // Adjust this value based on desired line length
    const verseLines = verse.split("\n").filter(Boolean); // Split by explicit newlines

    for (const line of verseLines) {
      if (line.length <= maxLength) lines.push(line);
      else {
        const words = line.split(" ");
        let currentLine = "";
        for (const word of words) {
          const testLine = currentLine + (currentLine ? " " : "") + word;
          if (testLine.length <= maxLength) currentLine = testLine;
          else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
      }
    }
    return lines.length > 0 ? lines : [verse];
  };

  const formatPoetryContent = (content: string[] | undefined) => {
    if (!content || !Array.isArray(content) || content.length === 0) {
      return <div className="italic text-muted-foreground">Content not available</div>;
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{
            rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
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
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </motion.div>
    );
  }

  const isInReadlist = featuredPoem?._id && readList.includes(featuredPoem._id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl overflow-x-hidden">
      <canvas ref={canvasRef} className="hidden" />

      {/* Line of the Day */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <h2 className="text-xl md:text-3xl font-bold flex items-center gap-2 font-serif">
            <Feather className="h-6 w-6 text-primary" />
            Line of the Day
          </h2>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <div className="flex items-center text-xs md:text-sm text-muted-foreground mr-2">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(todayDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
            <Button variant="outline" size="sm" onClick={shareLineOfTheDay} className="gap-2 font-serif" disabled={!lineOfTheDay}>
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadLineOfTheDay}
              className="gap-2 font-serif"
              disabled={!lineOfTheDay || !coverImage}
            >
              <Download className="h-4 w-4" />
              <span>Download</span>
            </Button>
          </div>
        </div>
        <Card className="overflow-hidden border-primary/20 shadow-lg">
          <div className="relative">
            {coverImage && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={coverImage || "/placeholder.svg"}
                  alt="Line of the Day background"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background/90" />
              </div>
            )}
            <div className="relative z-10 p-4 sm:p-8 md:p-12 flex flex-col items-center text-center">
              <div className="text-base sm:text-xl md:text-2xl italic font-serif text-foreground mb-4 leading-relaxed">
                {formatVerseForDisplay(lineOfTheDay).map((line, index) => (
                  <p key={index} className="mb-2">"{line}"</p>
                ))}
              </div>
              <Separator className="w-16 sm:w-24 my-4" />
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-serif">— {lineAuthor}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Poets and their poems */}
      {poets.map((poet, poetIndex) => (
        <motion.div
          key={poet._id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + 0.1 * poetIndex }}
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-bold font-serif">{poet.name}</h2>
              {poemsByPoet[poet._id]?.length > 0 && poemsByPoet[poet._id][0].displayCategory && (
                <Badge variant="outline" className="font-serif">
                  {poemsByPoet[poet._id][0].displayCategory}
                </Badge>
              )}
            </div>
            <Link href={`/poets/${poet.slug}`}>
              <Button variant="outline" className="gap-2 font-serif">
                See All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          {poemsByPoet[poet._id] && poemsByPoet[poet._id].length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {poemsByPoet[poet._id].slice(0, 4).map((poem, index) => {
                const englishSlug = poem.slug?.en || poem._id;
                const isInReadlist = readList.includes(poem._id);
                const poemTitle = poem.title?.en || "Untitled";
                return (
                  <motion.div
                    key={poem._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
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
            <div className="text-center p-8 bg-muted/20 rounded-lg border border-primary/10">
              <p className="text-muted-foreground italic font-serif">No poems available for this poet</p>
            </div>
          )}
        </motion.div>
      ))}

      {/* Featured Poem Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-12 max-w-4xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2 font-serif mb-6">
          <Feather className="h-6 w-6 text-primary" />
          Featured Poem
        </h2>
        {featuredPoem ? (
          <motion.div className="relative">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              className="absolute -inset-1 rounded-xl bg-primary/5 blur-md"
            />
            <Card className="shadow-lg overflow-hidden border-none bg-background/80 backdrop-blur-sm">
              <CardHeader className="p-0 relative h-[300px] sm:h-[400px] bg-muted">
                <motion.div
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="h-full w-full relative"
                >
                  <Image
                    src={featuredPoem.coverImage || "/placeholder.jpg"}
                    alt={featuredPoem.title?.[activeLang] || "Featured Poem"}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 text-white"
                >
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Badge className="mb-3 font-serif">{featuredPoem.category || "Poetry"}</Badge>
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif line-clamp-2"
                  >
                    {featuredPoem.title?.[activeLang] || "Untitled"}
                  </motion.h1>
                </motion.div>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeLang} onValueChange={(value) => setActiveLang(value as "en" | "hi" | "ur")} className="w-full">
                  <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b">
                    <TabsList className="grid w-full grid-cols-3 rounded-none h-14">
                      <TabsTrigger
                        value="en"
                        className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none h-full font-serif"
                      >
                        English
                      </TabsTrigger>
                      <TabsTrigger
                        value="hi"
                        className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none h-full font-serif"
                      >
                        Hindi
                      </TabsTrigger>
                      <TabsTrigger
                        value="ur"
                        className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none h-full font-serif"
                      >
                        Urdu
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="p-6 md:p-8">
                    <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="flex flex-wrap items-center gap-4 mb-6">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground font-serif italic">
                          By {featuredPoem.author?.name || "Unknown Author"}
                        </span>
                      </div>
                      {featuredPoem.createdAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="text-sm text-muted-foreground font-serif italic">
                            {new Date(featuredPoem.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </motion.div>
                    <AnimatePresence mode="wait">
                      <TabsContent value="en" className="mt-0">
                        <motion.div
                          key="en"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                          className="prose prose-sm md:prose-lg max-w-none text-foreground leading-relaxed font-serif poem-content rtl:text-right"
                        >
                          {formatPoetryContent(featuredPoem.content?.en) || "Content not available in English"}
                        </motion.div>
                      </TabsContent>
                      <TabsContent value="hi" className="mt-0">
                        <motion.div
                          key="hi"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                          className="prose prose-sm md:prose-lg max-w-none text-foreground leading-relaxed font-serif poem-content"
                        >
                          {formatPoetryContent(featuredPoem.content?.hi) || "हिंदी में सामग्री उपलब्ध नहीं है"}
                        </motion.div>
                      </TabsContent>
                      <TabsContent value="ur" className="mt-0">
                        <motion.div
                          key="ur"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                          className="prose prose-sm md:prose-lg max-w-none text-foreground leading-relaxed font-serif poem-content rtl"
                        >
                          {formatPoetryContent(featuredPoem.content?.ur) || "مواد اردو میں دستیاب نہیں ہے"}
                        </motion.div>
                      </TabsContent>
                    </AnimatePresence>
                    <motion.div variants={fadeIn} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
                      <Separator className="my-8 bg-primary/10" />
                    </motion.div>
                    <motion.div
                      variants={slideUp}
                      initial="hidden"
                      animate="visible"
                      transition={{ delay: 0.7 }}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge variant="secondary" className="flex items-center gap-1 font-serif">
                          <Heart className="h-3.5 w-3.5 text-primary" />
                          <span>{featuredPoem.readListCount || 0} Readers</span>
                        </Badge>
                        {featuredPoem.tags && featuredPoem.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {featuredPoem.tags.map((tag: string, index: number) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * index }}
                              >
                                <Badge variant="outline" className="text-xs font-serif">
                                  {tag}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDownloadDialog(true)}
                            className="gap-2 font-serif"
                          >
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Download Verse</span>
                            <span className="sm:hidden">Download</span>
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button variant="outline" size="sm" onClick={handleSharePoem} className="gap-2 font-serif">
                            <Share2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Share</span>
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant={isInReadlist ? "default" : "outline"}
                                size="sm"
                                className={`${isInReadlist ? "bg-primary text-primary-foreground" : ""} transition-all gap-2 font-serif`}
                              >
                                {isInReadlist ? (
                                  <>
                                    <BookmarkCheck className="h-4 w-4" />
                                    <span className="hidden sm:inline">In Your Anthology</span>
                                    <span className="sm:hidden">Saved</span>
                                  </>
                                ) : (
                                  <>
                                    <Bookmark className="h-4 w-4" />
                                    <span className="hidden sm:inline">Add to Anthology</span>
                                    <span className="sm:hidden">Save</span>
                                  </>
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border border-primary/20">
                              <motion.div initial={fadeIn.hidden} animate={fadeIn.visible}>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-serif text-xl">
                                    {isInReadlist ? "Remove from your anthology?" : "Add to your anthology?"}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="italic">
                                    {isInReadlist
                                      ? "This poem will no longer be part of your personal collection."
                                      : "This poem will be added to your personal collection for later enjoyment."}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-4">
                                  <AlertDialogCancel className="font-serif">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => featuredPoem._id && handleReadlistToggle(featuredPoem._id, featuredPoem.title?.[activeLang] || "Untitled")}
                                    className="font-serif"
                                  >
                                    {isInReadlist ? "Remove" : "Add"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </motion.div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="text-center p-8 bg-muted/20 rounded-lg border border-primary/10">
            <p className="text-muted-foreground italic font-serif">No featured poem available</p>
          </div>
        )}
      </motion.div>

      {/* Share Dialog */}
      <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent className="border border-primary/20">
          <motion.div initial={fadeIn.hidden} animate={fadeIn.visible}>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-serif text-xl">Share this poem</AlertDialogTitle>
              <AlertDialogDescription>Copy the link below to share this beautiful poem with others</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-4 flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied", {
                    description: "The poem's link has been copied to your clipboard",
                    icon: <Sparkles className="h-4 w-4" />,
                  });
                  setShowShareDialog(false);
                }}
              >
                Copy
              </Button>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-serif">Close</AlertDialogCancel>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Download Verse Dialog */}
      <AlertDialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <AlertDialogContent className="border border-primary/20 sm:max-w-[525px]">
          <motion.div initial={fadeIn.hidden} animate={fadeIn.visible}>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-serif text-xl flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Verse Image
              </AlertDialogTitle>
              <AlertDialogDescription>
                Select a verse and language to create a shareable image with your favorite lines
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="my-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="download-language" className="font-serif">Language</Label>
                <RadioGroup
                  defaultValue={downloadLanguage}
                  onValueChange={(value: string) => handleLanguageChange(value as "en" | "hi" | "ur")}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="en" disabled={!versesMap.en.length} />
                    <Label htmlFor="en">English</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hi" id="hi" disabled={!versesMap.hi.length} />
                    <Label htmlFor="hi">Hindi</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ur" id="ur" disabled={!versesMap.ur.length} />
                    <Label htmlFor="ur">Urdu</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="selected-verse" className="font-serif">Select Verse</Label>
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
                      <SelectItem key={index} value={verse} className="font-serif whitespace-normal">
                        {verse.substring(0, 60)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedVerse && (
                <div className="p-4 bg-muted/30 border rounded-md max-h-48 overflow-y-auto">
                  <h4 className="text-sm font-medium mb-2 font-serif">Preview:</h4>
                  <div className={`text-sm italic ${downloadLanguage === "ur" ? "rtl text-right" : ""}`}>{selectedVerse}</div>
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-serif">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={downloadVerseImage}
                className="font-serif gap-2"
                disabled={!selectedVerse || versesMap[downloadLanguage].length === 0}
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
      <div className="flex flex-row h-full overflow-hidden">
        <div className="relative w-1/3 min-w-[100px] aspect-square">
          <Image
            src={poem.coverImage || "/placeholder.svg?height=300&width=300"}
            alt={poemTitle}
            fill
            sizes="(max-width: 640px) 33vw, 200px"
            className="object-cover"
            priority
          />
          <Badge variant="secondary" className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm flex items-center gap-1">
            <Heart className="h-3 w-3 text-primary" />
            <span>{poem.readListCount || 0}</span>
          </Badge>
        </div>
        <div className="flex flex-col justify-between p-4 w-2/3">
          <div>
            <h3 className="text-lg font-bold line-clamp-1 mb-1 font-serif">{poemTitle}</h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span className="text-sm">{poem.author?.name || "Unknown Author"}</span>
            </div>
            {poem.displayCategory && (
              <Badge variant="outline" className="mt-2 text-xs">{poem.displayCategory}</Badge>
            )}
          </div>
          <div className="flex justify-between items-center mt-4">
            <Link href={`/poems/${englishSlug}`} className="inline-flex">
              <Button variant="default" size="sm" className="gap-1 font-serif">
                <BookOpen className="h-4 w-4" /> Read
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleReadlistToggle(poem._id, poemTitle)}
              className={`${isInReadlist ? "text-primary" : "text-muted-foreground"} hover:text-primary`}
            >
              {isInReadlist ? <BookmarkCheck className="h-5 w-5" /> : <BookmarkPlus className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Heart,
  BookmarkCheck,
  User,
  Feather,
  Share2,
  ArrowLeft,
  BookHeart,
  Copy,
  Info,
  HelpCircle,
  Eye,
  ChevronDown,
  Quote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { VerseDownload } from "../home/verse-download";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { Poem } from "@/types/poem";
import RelatedPoems from "./related-poems";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

interface CoverImage {
  _id: string;
  url: string;
  uploadedBy: { name: string };
  createdAt: string;
}

interface PoemDetailProps {
  poem: Poem | null;
  language: "en" | "hi" | "ur";
}

// Custom styles adapted from CategoryPoems
const customStyles = `
  .urdu-text {
    font-family: 'Fajer Noori Nastalique', sans-serif;
    direction: rtl;
    text-align: center;
    line-height: 1.8;
    font-size: 0.95rem;
  }

  .poem-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* Apply consistent font styling */
  .poem-text, .faq-text, .tag-text, .summary-text, .didyouknow-text {
    font-family: 'Inter', sans-serif;
  }

  .urdu-text.poem-text, .urdu-text.faq-text, .urdu-text.tag-text, .urdu-text.summary-text, .urdu-text.didyouknow-text {
    font-family: 'Fajer Noori Nastalique', sans-serif;
  }

  @media (max-width: 640px) {
    .poem-content {
      font-size: 0.9rem;
    }
    
    .action-buttons {
      justify-content: center;
      flex-wrap: wrap;
    }
    
    .poem-card-header {
      padding: 0.75rem;
    }
    
    .poem-card-content {
      padding: 0.75rem;
    }
  }
  
  @media (min-width: 641px) and (max-width: 1023px) {
    .action-buttons {
      justify-content: center;
    }
  }
`;

export default function PoemDetail({ poem, language }: PoemDetailProps) {
  const router = useRouter();
  const [readList, setReadList] = useState<string[]>([]);
  const [coverImages, setCoverImages] = useState<CoverImage[]>([]);
  const [readListCount, setReadListCount] = useState(poem?.readListCount || 0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [authorData, setAuthorData] = useState<any>(null);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [selectedCoverImage, setSelectedCoverImage] = useState<string>("/placeholder.svg");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showMeaningDialog, setShowMeaningDialog] = useState(false);
  const [currentMeaning, setCurrentMeaning] = useState({
    verse: "",
    meaning: "",
  });

  // Add these state variables
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [showFullDidYouKnow, setShowFullDidYouKnow] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);
      try {
        const coverImagesRes = await fetch("/api/cover-images", {
          credentials: "include",
        });
        if (!coverImagesRes.ok) throw new Error("Failed to fetch cover images");
        const coverImagesData = await coverImagesRes.json();
        setCoverImages(coverImagesData.coverImages || []);

        const userRes = await fetch("/api/user", { credentials: "include" });
        if (userRes.ok) {
          const userData = await userRes.json();
          setReadList(userData.user.readList.map((poem: any) => poem._id.toString()));
        } else if (userRes.status === 401) {
          setReadList([]);
        } else {
          throw new Error(`Failed to fetch user data: ${userRes.status}`);
        }

        if (poem) {
          setReadListCount(poem.readListCount);
          if (poem.coverImage && poem.coverImage.trim() !== "") {
            setSelectedCoverImage(poem.coverImage);
          } else if (coverImagesData.coverImages?.length > 0) {
            const randomIndex = Math.floor(Math.random() * coverImagesData.coverImages.length);
            setSelectedCoverImage(coverImagesData.coverImages[randomIndex]?.url || "/placeholder.svg");
          }
          toast.success("Poem unveiled", {
            description: "Immerse yourself in the verses",
            icon: <Feather className="h-4 w-4" />,
            position: "top-center",
            duration: 3000,
          });
        }
      } catch (error) {
        setError((error as Error).message || "Failed to load additional data");
        toast.error("Error loading data", {
          description: "Some features may not work as expected",
          icon: <Feather className="h-4 w-4" />,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [poem]);

  useEffect(() => {
    const fetchAuthorData = async () => {
      if (poem?.author?._id) {
        setAuthorLoading(true);
        try {
          const res = await fetch(`/api/authors/${poem.author._id}`, {
            credentials: "include",
          });
          if (!res.ok) throw new Error("Failed to fetch author");
          const data = await res.json();
          setAuthorData(data.author);
        } catch (err) {
          console.error("Error fetching author:", err);
        } finally {
          setAuthorLoading(false);
        }
      }
    };

    fetchAuthorData();
  }, [poem]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(scrollPercent);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleReadlistToggle = async (poemId: string) => {
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
        setReadListCount((prev) => (isInReadlist ? prev - 1 : prev + 1));

        if (isInReadlist) {
          toast.success("Removed from anthology", {
            description: "This poem has been removed from your collection",
            icon: <BookmarkCheck className="h-4 w-4" />,
            position: "bottom-right",
          });
        } else {
          toast.success("Added to anthology", {
            description: "This poem now resides in your collection",
            icon: <BookHeart className="h-4 w-4" />,
            position: "bottom-right",
          });
        }
      } else if (res.status === 401) {
        toast.error("Authentication required", {
          description: "Please sign in to curate your personal anthology",
          action: {
            label: "Sign In",
            onClick: () => router.push("/api/auth/signin"),
          },
        });
      } else {
        throw new Error("Failed to update readlist");
      }
    } catch (error) {
      toast.error("An error occurred", {
        description: "The poem could not be added to your collection",
      });
    }
  };

  const handleSharePoem = () => {
    if (navigator.share && poem) {
      navigator
        .share({
          title: poem.title?.[language] || "Beautiful Poem",
          text: `Check out this beautiful poem: ${poem.title?.[language]}`,
          url: window.location.href,
        })
        .then(() => {
          toast.success("Shared successfully", {
            description: "You've shared this poem with others",
            icon: <Share2 className="h-4 w-4" />,
          });
        })
        .catch(() => {
          setShowShareDialog(true);
        });
    } else {
      setShowShareDialog(true);
    }
  };

  const handleCopyAll = () => {
    if (poem?.content?.[language]) {
      const text = poem.content[language]
        .map((item) => `${item.verse}\n${item.meaning ? `Meaning: ${item.meaning}` : ""}`)
        .join("\n\n");
      navigator.clipboard.writeText(text);
      toast.success("Poem copied", {
        description: "The entire poem and meanings have been copied to your clipboard",
        icon: <Copy className="h-4 w-4" />,
      });
    }
  };

  const handleCopyVerse = (verse: string, meaning: string) => {
    const text = meaning ? `${verse}\nMeaning: ${meaning}` : verse;
    navigator.clipboard.writeText(text);
    toast.success("Verse copied", {
      description: "The verse and meaning have been copied to your clipboard",
      icon: <Copy className="h-4 w-4" />,
    });
  };

  const handleShowMeaning = (verse: string, meaning: string) => {
    setCurrentMeaning({ verse, meaning });
    setShowMeaningDialog(true);
  };

  // Add these helper functions
  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
  const summaryMaxLength = isMobile ? 150 : 300;
  const didYouKnowMaxLength = isMobile ? 150 : 300;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full">
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
          <Feather className="h-10 w-10 sm:h-12 sm:w-12 text-black" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg sm:text-xl font-bold"
        >
          Loading poem...
        </motion.h2>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "200px" }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
          className="h-0.5 bg-gradient-to-r from-transparent via-black to-transparent"
        />
      </div>
    );
  }

  if (error || !poem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 sm:gap-6 w-full px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl sm:text-5xl">
          <Feather className="h-12 w-12 sm:h-16 sm:w-16" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl sm:text-2xl font-bold text-center"
        >
          {error || "This poem has faded into the mist"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={`text-muted-foreground text-center max-w-md text-sm sm:text-base ${
            language === "ur" ? "urdu-text" : ""
          }`}
        >
          {language === "en"
            ? "Like a whisper lost in the wind, we cannot find the verses you seek"
            : language === "hi"
            ? "हवा में खोई फुसफुसाहट की तरह, हमें आपके द्वारा खोजी गई छंद नहीं मिल रही हैं"
            : "ہوا میں کھوئی ہوئی سرگوشی کی طرح، ہمیں آپ کی تلاش کردہ آیات نہیں مل رہی ہیں"}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Button variant="outline" onClick={() => router.back()} className="gap-1.5 text-xs sm:text-sm h-8 sm:h-9">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </motion.div>
      </div>
    );
  }

  const isInReadlist = poem._id && readList.includes(poem._id);
  const isSherCategory = poem.category?.toLowerCase() === "sher";

  const formatPoetryContent = (
    content: { verse: string; meaning: string; _id?: string }[] | undefined,
    language: "en" | "hi" | "ur"
  ) => {
    if (!content || !Array.isArray(content) || content.length === 0) {
      return (
        <div className={`text-muted-foreground italic text-xs sm:text-sm ${language === "ur" ? "urdu-text" : ""}`}>
          {language === "en"
            ? "Content not available in English"
            : language === "hi"
            ? "हिंदी में सामग्री उपलब्ध नहीं है"
            : "مواد اردو میں دستیاب نہیں ہے"}
        </div>
      );
    }

    return (
      <div className="poem-content">
        {content.map((item, index) => {
          const verse = item.verse?.trim() || "";
          const meaning = item.meaning?.trim() || "";
          if (!verse) {
            return (
              <motion.div
                key={index}
                className="text-muted-foreground italic text-xs sm:text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                Verse not available
              </motion.div>
            );
          }

          // Fix the extra empty space issue by properly handling newlines
          const lines = verse
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line !== "");

          return (
            <motion.div
              key={index}
              className={`space-y-1 ${language === "ur" ? "urdu-text poem-text" : "poem-text"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="border-l-2 border-primary/30 pl-3 py-1">
                {lines.map((line, lineIndex) => (
                  <div
                    key={lineIndex}
                    className={`poem-line leading-relaxed text-xs sm:text-sm font-serif ${
                      language === "ur" ? "urdu-text" : ""
                    }`}
                  >
                    {line}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 mt-2">
                {meaning && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShowMeaning(verse, meaning)}
                    className="text-xs h-6 px-2"
                  >
                    <ChevronDown className="h-3.5 w-3.5 mr-1" />
                    Meaning
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyVerse(verse, meaning)}
                  className="text-xs h-6 px-2"
                  title="Copy this verse and meaning"
                  aria-label={`Copy verse ${index + 1}`}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copy
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const slugs = poem
    ? {
        en: poem.slug.en || "",
        hi: poem.slug.hi || "",
        ur: poem.slug.ur || "",
      }
    : { en: "", hi: "", ur: "" };

  return (
    <>
      <style>{customStyles}</style>
      <div className="fixed top-0 left-0 right-0 h-1 z-50" aria-hidden="true">
        <motion.div
          className="h-full bg-black"
          style={{ width: `${scrollProgress}%` }}
          initial={{ width: "0%" }}
          animate={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl mb-16 sm:mb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 sm:mb-6 flex justify-between items-center"
        >
          <Button variant="ghost" onClick={() => router.back()} className="gap-1.5 h-8 text-xs sm:text-sm">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="overflow-hidden border shadow-md bg-white">
            <CardHeader className="relative p-0">
              <motion.div
                className="relative h-40 sm:h-56 md:h-64"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <Image
                  src={selectedCoverImage || "/placeholder.svg"}
                  alt={`Cover image for ${
                    poem.title?.[language] || "Untitled"
                  } by ${poem.author?.name || "Unknown Author"}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 640px, 768px"
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                  quality={80}
                  className="absolute inset-0"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 flex flex-col items-center justify-between py-6">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="mt-4"
                  >
                    <Badge className="bg-black/80 text-white text-xs px-3 py-1 rounded-full">
                      {poem.category || "Poetry"}
                    </Badge>
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="w-full px-4 sm:px-6 text-center"
                  >
                    <h1
                      className={`text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-md ${
                        language === "ur" ? "urdu-text" : "font-serif"
                      }`}
                    >
                      {poem.title?.[language] || "Untitled"}
                    </h1>

                    {(poem.author || authorData) && (
                      <Link
                        href={`/poets/${authorData?.slug || poem.author._id}`}
                        className="group inline-flex items-center gap-2 mt-2"
                      >
                        <Avatar className="h-6 w-6 sm:h-7 sm:w-7 border-2 border-white/70">
                          {authorData?.image ? (
                            <AvatarImage
                              src={authorData.image || "/placeholder.svg"}
                              alt={authorData.name || poem.author.name}
                            />
                          ) : (
                            <AvatarFallback className="bg-gray-100 text-gray-800">
                              <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span
                          className={`text-sm sm:text-base font-medium text-white group-hover:text-gray-200 transition-colors ${
                            language === "ur" ? "urdu-text" : ""
                          }`}
                        >
                          {authorData?.name || poem.author.name || "Unknown Author"}
                        </span>
                      </Link>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            </CardHeader>

            <div className="border-b">
              <div className="grid w-full grid-cols-3 rounded-none overflow-hidden">
                <Link
                  href={`/poems/en/${slugs.en}`}
                  className={`text-center py-2.5 sm:py-3 text-xs sm:text-sm transition-colors ${
                    language === "en"
                      ? "bg-gray-50 font-bold text-black border-b-2 border-black"
                      : "text-muted-foreground hover:bg-gray-50/50"
                  }`}
                >
                  English
                </Link>
                <Link
                  href={`/poems/hi/${slugs.hi}`}
                  className={`text-center py-2.5 sm:py-3 text-xs sm:text-sm transition-colors ${
                    language === "hi"
                      ? "bg-gray-50 font-bold text-black border-b-2 border-black"
                      : "text-muted-foreground hover:bg-gray-50/50"
                  }`}
                  style={{ direction: "ltr" }}
                >
                  Hindi
                </Link>
                <Link
                  href={`/poems/ur/${slugs.ur}`}
                  className={`text-center py-2.5 sm:py-3 text-xs sm:text-sm transition-colors ${
                    language === "ur"
                      ? "bg-gray-50 font-bold text-black border-b-2 border-black"
                      : "text-muted-foreground hover:bg-gray-50/50"
                  }`}
                  style={{ direction: "rtl" }}
                >
                  Urdu
                </Link>
              </div>
            </div>

            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="flex flex-col gap-6 sm:gap-8">
                {/* Summary Section */}
                {poem.summary?.[language] && (
                  <motion.div
                    className={`text-sm sm:text-base ${
                      language === "ur" ? "urdu-text summary-text" : "summary-text"
                    } bg-gray-50 p-4 rounded-lg border border-gray-200`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      direction: language === "ur" ? "rtl" : "ltr",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-4 w-4 text-primary/70" />
                      <h3 className="font-semibold">
                        {language === "en" ? "About" : language == "hi" ? "परिचय" : "تعارف"}
                      </h3>
                    </div>
                    <p>
                      {showFullSummary || poem.summary[language].length <= summaryMaxLength
                        ? poem.summary[language]
                        : truncateText(poem.summary[language], summaryMaxLength)}
                    </p>
                    {poem.summary[language].length > summaryMaxLength && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullSummary(!showFullSummary)}
                        className="mt-2 h-7 px-2 text-xs hover:bg-gray-100"
                      >
                        {showFullSummary ? "Show Less" : "See More"}
                      </Button>
                    )}
                  </motion.div>
                )}

                {/* Poem Content Section */}
                <section>
                  <div className="flex justify-end items-center mb-4">
                    {poem.content?.[language] && poem.content[language].length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyAll}
                        className="gap-1.5 text-xs h-8"
                        aria-label="Copy entire poem"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy All
                      </Button>
                    )}
                  </div>

                  <motion.div
                    className={`prose prose-sm sm:prose-base max-w-none ${
                      language === "ur" ? "urdu-text" : "font-serif"
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {formatPoetryContent(poem.content?.[language] || [], language)}
                  </motion.div>
                </section>

                <Separator className="my-2" />

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center action-buttons">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                    <VerseDownload
                      verse={poem.content?.[language]?.[0]?.verse || ""}
                      author={poem.author?.name || "Unknown Author"}
                      title={poem.title?.[language] || "Untitled"}
                      imageUrl={selectedCoverImage}
                      languages={{
                        en: poem.content?.en?.map((item) => item.verse),
                        hi: poem.content?.hi?.map((item) => item.verse),
                        ur: poem.content?.ur?.map((item) => item.verse),
                      }}
                    />
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSharePoem}
                      className="gap-1.5 text-xs h-8 bg-white shadow-sm"
                      aria-label="Share poem"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Share
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-xs h-8 bg-white shadow-sm"
                          aria-label={isInReadlist ? "Remove from anthology" : "Add to anthology"}
                        >
                          <Heart
                            className={`h-3.5 w-3.5 ${isInReadlist ? "fill-red-500 text-red-500" : "text-gray-500"}`}
                          />
                          <span>{readListCount}</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border border-gray-200 p-4 sm:p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-base sm:text-lg">
                              {isInReadlist ? "Remove from your anthology?" : "Add to your anthology?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground italic text-xs sm:text-sm">
                              {isInReadlist
                                ? "This poem will no longer be part of your personal collection."
                                : "This poem will be added to your personal collection for later enjoyment."}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-4">
                            <AlertDialogCancel className="text-xs sm:text-sm h-8 sm:h-9">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => poem._id && handleReadlistToggle(poem._id)}
                              className={`text-xs sm:text-sm h-8 sm:h-9 ${
                                isInReadlist ? "bg-destructive hover:bg-destructive/90" : "bg-black hover:bg-gray-800"
                              }`}
                            >
                              {isInReadlist ? "Remove" : "Add"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </motion.div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs h-8 bg-white shadow-sm"
                      aria-label="View count"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>{poem.viewsCount || 0}</span>
                    </Button>
                  </motion.div>
                </div>

                <Separator className="my-2" />

                {/* Details Section */}
                <section>
                  {/* Tags Section - Moved up */}
                  {poem.tags && poem.tags.length > 0 && (
                    <motion.div
                      className="bg-white p-4 sm:p-5 rounded-lg border shadow-sm mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Feather className="h-4 w-4 text-primary/70" />
                        <h3 className="text-sm sm:text-base font-medium">
                          {language === "en" ? "Tags" : language === "hi" ? "टैग" : "ٹیگز"}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
                        {poem.tags.slice(0, showAllTags ? poem.tags.length : 6).map((tag: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 * index }}
                          >
                            <Button
                              variant="outline"
                              className={`text-[10px] sm:text-xs h-6 sm:h-7 px-2.5 py-1 bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors ${
                                language === "ur" ? "urdu-text tag-text" : "tag-text"
                              }`}
                              onClick={() => {
                                router.push(`/search?q=${encodeURIComponent(tag)}&type=poems`);
                              }}
                            >
                              {tag}
                            </Button>
                          </motion.div>
                        ))}
                        {poem.tags.length > 6 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllTags(!showAllTags)}
                            className="h-6 sm:h-7 px-2 text-[10px] sm:text-xs hover:bg-gray-50"
                          >
                            {showAllTags ? "Show Less" : `+${poem.tags.length - 6} more`}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Did You Know Section */}
                  {poem.didYouKnow?.[language] && (
                    <motion.div
                      className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 shadow-sm mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-primary/70" />
                        <h3 className="font-semibold">
                          {language === "en"
                            ? "Did You Know?"
                            : language === "hi"
                            ? "क्या आप जानते हैं?"
                            : "کیا آپ جانتے ہیں؟"}
                        </h3>
                      </div>
                      <p
                        className={`${language === "ur" ? "urdu-text didyouknow-text" : "didyouknow-text"}`}
                        style={{
                          direction: language === "ur" ? "rtl" : "ltr",
                        }}
                      >
                        {showFullDidYouKnow || poem.didYouKnow[language].length <= didYouKnowMaxLength
                          ? poem.didYouKnow[language]
                          : truncateText(poem.didYouKnow[language], didYouKnowMaxLength)}
                      </p>
                      {poem.didYouKnow[language].length > didYouKnowMaxLength && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFullDidYouKnow(!showFullDidYouKnow)}
                          className="mt-2 h-7 px-2 text-xs hover:bg-gray-100"
                        >
                          {showFullDidYouKnow ? "Show Less" : "See More"}
                        </Button>
                      )}
                    </motion.div>
                  )}

                  {/* FAQs Section */}
                  {poem.faqs && poem.faqs.length > 0 && (
                    <motion.div
                      className="space-y-2 bg-white p-4 sm:p-5 rounded-lg border shadow-sm mb-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <HelpCircle className="h-4 w-4 text-primary/70" />
                        <h3 className={`font-semibold ${language === "ur" ? "urdu-text" : ""}`}>
                          {language === "en" ? "FAQs" : language === "hi" ? "प्रश्नोत्तर" : "سوالات و جوابات"}
                        </h3>
                      </div>
                      <Accordion type="single" collapsible className="w-full">
                        {poem.faqs.map((faq, index) => (
                          <AccordionItem key={index} value={`faq-${index}`} className="border-b border-gray-200">
                            <AccordionTrigger
                              className={`text-sm ${language === "ur" ? "urdu-text faq-text text-right" : "faq-text"}`}
                              style={{
                                direction: language === "ur" ? "rtl" : "ltr",
                              }}
                            >
                              {faq.question[language] || faq.question.en}
                            </AccordionTrigger>
                            <AccordionContent
                              className={`text-sm ${language === "ur" ? "urdu-text faq-text" : "faq-text"}`}
                              style={{
                                direction: language === "ur" ? "rtl" : "ltr",
                              }}
                            >
                              {faq.answer[language] || faq.answer.en}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </motion.div>
                  )}

                  {/* Quote Section */}
                  <motion.div
                    className="bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 shadow-sm text-center italic text-sm text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    "Poetry is not a turning loose of emotion, but an escape from emotion; it is not the expression of
                    personality, but an escape from personality."
                    <div className="mt-1 font-medium text-[10px] sm:text-xs">— T.S. Eliot</div>
                  </motion.div>
                </section>

                <Separator className="my-2" />

                {/* Related Poems Section */}
                <section>
                  <h2 className="text-lg sm:text-xl font-bold mb-4">
                    {language === "en" ? "Related Poems" : language === "hi" ? "संबंधित कविताएँ" : "متعلقہ نظمیں"}
                  </h2>
                  <RelatedPoems currentPoem={poem} language={language} hideTitle={true} />
                </section>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Share Dialog */}
      <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <AlertDialogContent className="border border-gray-200 p-4 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base sm:text-lg">Share this poem</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground italic text-xs sm:text-sm">
                Copy the link below to share this beautiful poem with others
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex items-center gap-2 mt-4">
              <Input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="bg-muted/50 text-xs sm:text-sm h-8 sm:h-9"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("Link copied", {
                    description: "The poem's link has been copied to your clipboard",
                    icon: <Copy className="h-3.5 w-3.5" />,
                  });
                  setShowShareDialog(false);
                }}
                className="shrink-0 text-xs sm:text-sm h-8 sm:h-9"
              >
                Copy
              </Button>
            </div>
            <AlertDialogFooter className="mt-4 sm:mt-6">
              <AlertDialogCancel className="text-xs sm:text-sm h-8 sm:h-9">Close</AlertDialogCancel>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Meaning Dialog */}
      <AlertDialog open={showMeaningDialog} onOpenChange={setShowMeaningDialog}>
        <AlertDialogContent className="border border-gray-200 p-4 sm:p-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-base sm:text-lg">Verse Meaning</AlertDialogTitle>
            </AlertDialogHeader>
            <div className="mt-4 space-y-4">
              <div className="border-l-2 border-primary/30 pl-3 py-1">
                <div className="flex items-start gap-2 mb-2">
                  <Quote className="h-4 w-4 mt-1 text-primary/70" />
                  <div
                    className={`bg-gray-50/70 p-3 rounded-md w-full ${language === "ur" ? "urdu-text" : "font-serif"}`}
                  >
                    <p
                      className="text-sm sm:text-base"
                      style={{
                        direction: language === "ur" ? "rtl" : "ltr",
                        textAlign: language === "ur" ? "right" : "left",
                      }}
                    >
                      {currentMeaning.verse}
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-l-2 border-primary/30 pl-3 py-1">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-1 text-primary/70" />
                  <div className="w-full">
                    <h4 className="text-sm font-medium mb-1">
                      {language === "en" ? "Meaning" : language === "hi" ? "अर्थ" : "معنی"}:
                    </h4>
                    <p
                      className={`text-sm ${
                        language === "ur" ? "urdu-text" : "font-serif"
                      } bg-gray-50/70 p-3 rounded-md`}
                      style={{
                        direction: language === "ur" ? "rtl" : "ltr",
                        textAlign: language === "ur" ? "right" : "left",
                      }}
                    >
                      {currentMeaning.meaning}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <AlertDialogFooter className="mt-4 sm:mt-6">
              <AlertDialogCancel className="text-xs sm:text-sm h-8 sm:h-9">Close</AlertDialogCancel>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
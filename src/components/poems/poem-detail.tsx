"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Heart,
  Bookmark,
  BookmarkCheck,
  User,
  Calendar,
  Feather,
  Share2,
  ArrowLeft,
  BookHeart,
  Sparkles,
  Copy,
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

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

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
          setReadList(
            userData.user.readList.map((poem: any) => poem._id.toString())
          );
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
        setReadList((prev) =>
          isInReadlist ? prev.filter((id) => id !== poemId) : [...prev, poemId]
        );
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
      const text = poem.content[language].join("\n\n");
      navigator.clipboard.writeText(text);
      toast.success("Poem copied", {
        description: "The entire poem has been copied to your clipboard",
        icon: <Copy className="h-4 w-4" />,
      });
    }
  };

  const handleCopyVerse = (stanza: string) => {
    navigator.clipboard.writeText(stanza);
    toast.success("Verse copied", {
      description: "The verse has been copied to your clipboard",
      icon: <Copy className="h-4 w-4" />,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 w-full">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{
            rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
            scale: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" },
          }}
        >
          <Feather className="h-10 w-10 sm:h-12 sm:w-12 text-primary/70" />
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
          className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      </div>
    );
  }

  if (error || !poem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 sm:gap-6 w-full px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-4xl sm:text-5xl text-primary/70">
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
          className={`text-muted-foreground text-center max-w-md text-sm sm:text-base ${language === "ur" ? "urdu-text" : ""}`}
        >
          {language === "en"
            ? "Like a whisper lost in the wind, we cannot find the verses you seek"
            : language === "hi"
              ? "हवा में खोई फुसफुसाहट की तरह, हमें आपके द्वारा खोजी गई छंद नहीं मिल रही हैं"
              : "ہوا میں کھوئی ہوئی سرگوشی کی طرح، ہمیں آپ کی تلاش کردہ آیات نہیں مل رہی ہیں"}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Button
            variant="outline"
            onClick={() => router.push("/library")}
            className="gap-2 text-xs sm:text-sm h-8 sm:h-9"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to the Library
          </Button>
        </motion.div>
      </div>
    );
  }

  const isInReadlist = poem._id && readList.includes(poem._id);

  const formatPoetryContent = (content: string[] | undefined) => {
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
      <div className="space-y-6 sm:space-y-8">
        {content.map((stanza, index) => {
          const lines = stanza.split("\n").filter((line) => line.trim() !== "");
          let maxLength = 0;
          lines.forEach((line) => {
            if (line.length > maxLength) maxLength = line.length;
          });
          const formattedLines = lines.map((line) => {
            if (line.length >= maxLength) return line;
            const spacesToAdd = maxLength - line.length;
            return language === "ur" ? line + " ".repeat(spacesToAdd) : " ".repeat(spacesToAdd) + line;
          });

          return (
            <motion.div
              key={index}
              className="poem-stanza relative group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopyVerse(stanza)}
                className="absolute top-0 right-0 text-xs h-6 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Copy this verse"
                aria-label={`Copy verse ${index + 1}`}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
              {formattedLines.map((line, lineIndex) => (
                <div
                  key={lineIndex}
                  className={`poem-line leading-relaxed text-xs sm:text-sm md:text-base ${language === "ur" ? "urdu-text" : "font-serif"}`}
                  style={{
                    direction: language === "ur" ? "rtl" : "ltr",
                    textAlign: "center",
                    whiteSpace: "pre",
                  }}
                >
                  {line || "\u00A0"}
                </div>
              ))}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const slugs = poem
    ? Array.isArray(poem.slug)
      ? {
          en: poem.slug.find((s) => s.en)?.en || poem.slug[0].en,
          hi: poem.slug.find((s) => s.hi)?.hi || poem.slug[0].en,
          ur: poem.slug.find((s) => s.ur)?.ur || poem.slug[0].en,
        }
      : {
          en: poem.slug.en || "",
          hi: poem.slug.hi || "",
          ur: poem.slug.ur || "",
        }
    : { en: "", hi: "", ur: "" };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 h-1 z-50" aria-hidden="true">
        <motion.div
          className="h-full bg-primary"
          style={{ width: `${scrollProgress}%` }}
          initial={{ width: "0%" }}
          animate={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl mb-16 sm:mb-20">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/library")}
            className="gap-1.5 h-8 text-xs sm:text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="overflow-hidden border shadow-md">
            <CardHeader className="relative p-0">
              <motion.div
                className="relative h-32 sm:h-40 md:h-60"
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <Image
                  src={selectedCoverImage}
                  alt={`Cover image for ${poem.title?.[language] || "Untitled"} by ${poem.author?.name || "Unknown Author"}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 640px, 768px"
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                  quality={75}
                  className="absolute inset-0"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Feather className="h-12 w-12 sm:h-16 sm:w-16 text-white/70" />
                  </motion.div>
                </div>
              </motion.div>
              <motion.div
                className="absolute top-3 right-3 sm:top-4 sm:right-4"
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Badge className="bg-primary/90 text-[10px] sm:text-xs h-5 sm:h-6">
                  {poem.category || "Poetry"}
                </Badge>
              </motion.div>
              <motion.h1
                className={`text-xl sm:text-2xl md:text-3xl font-bold p-4 sm:p-6 text-center ${language === "ur" ? "urdu-text" : "font-serif"}`}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {poem.title?.[language] || "Untitled"}
              </motion.h1>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <motion.div className="flex flex-col gap-4 sm:gap-6">
                <div className="grid w-full grid-cols-3 mb-4 sm:mb-6 rounded-md overflow-hidden border">
                  <Link
                    href={`/poems/en/${slugs.en}`}
                    className={`text-center py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${
                      language === "en" ? "bg-primary/10 font-bold" : "text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    English
                  </Link>
                  <Link
                    href={`/poems/hi/${slugs.hi}`}
                    className={`text-center py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${
                      language === "hi" ? "bg-primary/10 font-bold" : "text-muted-foreground hover:bg-muted/50"
                    }`}
                    style={{ direction: "ltr" }}
                  >
                    Hindi
                  </Link>
                  <Link
                    href={`/poems/ur/${slugs.ur}`}
                    className={`text-center py-1.5 sm:py-2 text-xs sm:text-sm transition-colors ${
                      language === "ur" ? "bg-primary/10 font-bold" : "text-muted-foreground hover:bg-muted/50"
                    }`}
                    style={{ direction: "rtl" }}
                  >
                    Urdu
                  </Link>
                </div>

                {poem.content?.[language] && (
                  <div className="flex justify-end">
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
                  </div>
                )}

                <motion.div
                  className={`prose prose-sm sm:prose-base dark:prose-invert max-w-none text-center ${language === "ur" ? "urdu-text" : "font-serif"}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {formatPoetryContent(poem.content?.[language])}
                </motion.div>

                <Separator className="my-1 sm:my-2" />

                <motion.div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {(poem.author || authorData) && (
                        <Link href={`/poets/${authorData?.slug || poem.author._id}`} className="group">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Avatar className="h-5 w-5 sm:h-6 sm:w-6 border">
                              {authorData?.image ? (
                                <AvatarImage
                                  src={authorData.image}
                                  alt={authorData.name || poem.author.name}
                                />
                              ) : (
                                <AvatarFallback>
                                  <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div>
                              <p className={`text-xs sm:text-sm font-medium leading-none group-hover:text-primary transition-colors ${language === "ur" ? "urdu-text" : ""}`}>
                                {authorData?.name || poem.author.name || "Unknown Author"}
                              </p>
                            </div>
                          </div>
                        </Link>
                      )}

                      {poem.createdAt && (
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary/70" />
                          <span>{new Date(poem.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <Badge variant="secondary" className="gap-1 text-[10px] sm:text-xs h-5 sm:h-6">
                      <Heart className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      <span>{readListCount} Readers</span>
                    </Badge>
                  </div>

                  {poem.tags && poem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
                      <h2 className="text-sm sm:text-base font-medium text-muted-foreground mr-1">Tags:</h2>
                      {poem.tags.slice(0, showAllTags ? poem.tags.length : 2).map((tag: string, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <Badge variant="outline" className={`text-[10px] sm:text-xs h-5 sm:h-6 ${language === "ur" ? "urdu-text" : ""}`}>
                            {tag}
                          </Badge>
                        </motion.div>
                      ))}
                      {poem.tags.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowAllTags(!showAllTags)}
                          className="h-5 sm:h-6 px-1.5 text-[10px] sm:text-xs text-primary"
                        >
                          {showAllTags ? "Less" : `+${poem.tags.length - 2} more`}
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 sm:gap-3 pt-2 sm:pt-4">
                    <VerseDownload
                      verse={poem.content?.[language]?.[0] || ""}
                      author={poem.author?.name || "Unknown Author"}
                      title={poem.title?.[language] || "Untitled"}
                      imageUrl={selectedCoverImage}
                      languages={{
                        en: poem.content?.en,
                        hi: poem.content?.hi,
                        ur: poem.content?.ur,
                      }}
                    />

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSharePoem}
                        className="gap-1.5 text-xs h-8"
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
                            variant={isInReadlist ? "default" : "outline"}
                            size="sm"
                            className={`gap-1.5 text-xs h-8 ${isInReadlist ? "bg-primary/90" : ""}`}
                          >
                            {isInReadlist ? (
                              <>
                                <BookmarkCheck className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">In Your Anthology</span>
                                <span className="sm:hidden">Saved</span>
                              </>
                            ) : (
                              <>
                                <Bookmark className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Add to Anthology</span>
                                <span className="sm:hidden">Save</span>
                              </>
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="border border-primary/20 p-4 sm:p-6">
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
                                  isInReadlist ? "bg-destructive hover:bg-destructive/90" : ""
                                }`}
                              >
                                {isInReadlist ? "Remove" : "Add"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </motion.div>
                        </AlertDialogContent>
                      </AlertDialog>
                    </motion.div>
                  </div>

                  <RelatedPoems currentPoem={poem} language={language} hideTitle={true} />
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 sm:mt-8 text-center text-muted-foreground italic text-xs sm:text-sm p-3 sm:p-4 bg-muted/30 rounded-lg border border-primary/5"
        >
          "Poetry is not a turning loose of emotion, but an escape from emotion; it is not the expression of personality, but an escape from personality."
          <div className="mt-1 font-medium text-[10px] sm:text-xs">— T.S. Eliot</div>
        </motion.div>

        <AlertDialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <AlertDialogContent className="border border-primary/20 p-4 sm:p-6">
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
                      icon: <Sparkles className="h-3.5 w-3.5" />,
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
      </div>
    </>
  );
}
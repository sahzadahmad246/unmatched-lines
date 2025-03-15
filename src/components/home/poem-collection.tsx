"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Search,
  BookOpen,
  User,
  Loader2,
  AlertTriangle,
  BookmarkPlus,
  BookmarkCheck,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { LoadingComponent } from "../utils/LoadingComponent";

interface Poem {
  _id: string;
  title: { en: string; hi?: string; ur?: string };
  author: { name: string; _id: string };
  category: "ghazal" | "sher";
  excerpt?: string;
  slug?: { en: string };
  readListCount?: number;
}

interface CoverImage {
  _id: string;
  url: string;
  uploadedBy: { name: string };
  createdAt: string;
}

interface PoemCollectionProps {
  category: "ghazal" | "sher";
  title: string;
}

export default function PoemCollection({
  category,
  title,
}: PoemCollectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [poems, setPoems] = useState<Poem[]>([]);
  const [readList, setReadList] = useState<string[]>([]);
  const [coverImages, setCoverImages] = useState<CoverImage[]>([]); // New state for cover images
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch poems
        const poemRes = await fetch("/api/poem", { credentials: "include" });
        if (!poemRes.ok) throw new Error(`Failed to fetch ${category}s`);
        const poemData = await poemRes.json();
        const filteredPoems = poemData.poems.filter(
          (poem: Poem) => poem.category === category
        );
        console.log(`Fetched ${category}s:`, filteredPoems);
        setPoems(filteredPoems);

        // Fetch cover images
        const coverImagesRes = await fetch("/api/cover-images", {
          credentials: "include",
        });
        if (!coverImagesRes.ok) throw new Error("Failed to fetch cover images");
        const coverImagesData = await coverImagesRes.json();
        setCoverImages(coverImagesData.coverImages || []);

        // Fetch user's read list
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
        console.error("Error fetching data:", err);
        setError(`Failed to load ${category}s`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  const getRandomCoverImage = () => {
    if (coverImages.length === 0)
      return "/placeholder.svg?height=200&width=300";
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
        const updatedPoems = [...poems];
        const poemIndex = updatedPoems.findIndex((poem) => poem._id === poemId);
        if (poemIndex !== -1) {
          updatedPoems[poemIndex] = {
            ...updatedPoems[poemIndex],
            readListCount: isInReadlist
              ? (updatedPoems[poemIndex].readListCount || 1) - 1
              : (updatedPoems[poemIndex].readListCount || 0) + 1,
          };
          setPoems(updatedPoems);
        }

        if (isInReadlist) {
          toast.error("Removed from reading list", {
            description: `"${poemTitle}" has been removed from your reading list.`,
            duration: 3000,
          });
        } else {
          toast.success("Added to reading list", {
            description: `"${poemTitle}" has been added to your reading list.`,
            duration: 3000,
          });
        }
      } else if (res.status === 401) {
        toast.error("Authentication required", {
          description: "Please sign in to manage your reading list.",
          duration: 3000,
        });
      } else {
        const data = await res.json();
        toast.error("Error", {
          description:
            data.error ||
            `Failed to ${isInReadlist ? "remove from" : "add to"} reading list`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error(
        `Error ${isInReadlist ? "removing from" : "adding to"} reading list:`,
        error
      );
      toast.error("Error", {
        description: "An error occurred while updating the reading list.",
        duration: 3000,
      });
    }
  };

  const filteredPoems = poems.filter(
    (poem) =>
      poem.title?.en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poem.author?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-1">
            Discover beautiful {title.toLowerCase()} from renowned poets
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className={`relative max-w-sm w-full transition-all ${
            isSearchFocused ? "ring-2 ring-primary ring-offset-2" : ""
          }`}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 w-full"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </motion.div>
      </motion.div>

      <AnimatePresence mode="wait">
        {filteredPoems.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredPoems.map((poem, index) => {
              const englishSlug = poem.slug?.en || poem._id;
              const isInReadlist = readList.includes(poem._id);
              const poemTitle = poem.title?.en || "Untitled";

              return (
                <PoemCard
                  key={poem._id}
                  poem={poem}
                  coverImage={getRandomCoverImage()}
                  index={index}
                  isInReadlist={isInReadlist}
                  handleReadlistToggle={handleReadlistToggle}
                />
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-medium">
              No {title.toLowerCase()} found
            </h3>
            <p className="text-muted-foreground mt-2">
              {searchTerm
                ? `No results for "${searchTerm}"`
                : `There are no ${title.toLowerCase()} available at the moment.`}
            </p>
            {searchTerm && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface PoemCardProps {
  poem: Poem;
  coverImage: string; // Separate prop for random cover image
  index: number;
  isInReadlist: boolean;
  handleReadlistToggle: (id: string, title: string) => void;
}

function PoemCard({
  poem,
  coverImage,
  index,
  isInReadlist,
  handleReadlistToggle,
}: PoemCardProps) {
  const poemTitle = poem.title?.en || "Untitled";
  const englishSlug = poem.slug?.en || poem._id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg">
        <div className="relative h-48 overflow-hidden">
          <Image
            src={coverImage}
            alt={poemTitle}
            fill
            className="object-cover transition-transform hover:scale-105 duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-background/80 backdrop-blur-sm"
            >
              <Heart className="h-3 w-3 text-primary" />
              <span>{poem.readListCount || 0}</span>
            </Badge>
          </div>
        </div>

        <CardContent className="flex-grow p-4">
          <h3 className="text-xl font-bold line-clamp-1 mb-1">{poemTitle}</h3>
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <User className="h-3.5 w-3.5" />
            <span className="text-sm">
              {poem.author?.name || "Unknown Author"}
            </span>
          </div>

          {poem.excerpt && (
            <p className="text-muted-foreground text-sm line-clamp-2 mt-2">
              {poem.excerpt}
            </p>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <Link href={`/poems/${englishSlug}`} className="inline-flex">
            <Button variant="default" size="sm" className="gap-1">
              <BookOpen className="h-4 w-4" />
              <span>Read</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReadlistToggle(poem._id, poemTitle)}
            className={`${
              isInReadlist ? "text-primary" : "text-muted-foreground"
            } hover:text-primary`}
          >
            {isInReadlist ? (
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <BookmarkCheck className="h-5 w-5" />
              </motion.div>
            ) : (
              <BookmarkPlus className="h-5 w-5" />
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
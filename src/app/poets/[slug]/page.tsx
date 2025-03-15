"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  User,
  Calendar,
  MapPin,
  Feather,
  AlertTriangle,
  BookmarkPlus,
  BookmarkCheck,
  ArrowLeft,
  Heart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LoadingComponent } from "@/components/utils/LoadingComponent";

export default function PoetDetail() {
  const { slug } = useParams();
  const [poet, setPoet] = useState<any>(null);
  const [poems, setPoems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readList, setReadList] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [poetRes, poemRes, userRes] = await Promise.all([
          fetch(`/api/authors/${slug}`, { credentials: "include" }),
          fetch("/api/poem", { credentials: "include" }),
          fetch("/api/user", { credentials: "include" }),
        ]);

        if (!poetRes.ok) {
          const poetError = await poetRes.text();
          throw new Error(`Failed to fetch poet: ${poetError}`);
        }
        const poetData = await poetRes.json();
        setPoet(poetData.author);

        if (!poemRes.ok) {
          const poemError = await poemRes.text();
          throw new Error(`Failed to fetch poems: ${poemError}`);
        }
        const poemData = await poemRes.json();
        const filteredPoems = poemData.poems.filter(
          (poem: any) =>
            poem.author?._id.toString() === poetData.author._id.toString()
        );
        setPoems(filteredPoems);

        if (userRes.ok) {
          const userData = await userRes.json();
          setReadList(
            userData.user.readList.map((poem: any) => poem._id.toString())
          );
        }
      } catch (err) {
        setError("Failed to load poet details or poems");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
    else {
      setError("No poet slug provided");
      setLoading(false);
    }
  }, [slug]);

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
      }
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred while updating the reading list.",
        duration: 3000,
      });
    }
  };

  const groupedPoems = poems.reduce((acc: any, poem: any) => {
    const category = poem.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(poem);
    return acc;
  }, {});

  if (loading) {
    return <LoadingComponent />;
  }

  if (error || !poet) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]"
      >
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive">
          {error || "Poet not found"}
        </h2>
        <Link href="/poets">
          <Button variant="outline" className="mt-4">
            Back to Poets
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 mb-16">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Link href="/poets">
          <Button variant="ghost" size="sm" className="gap-1 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Poets
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold">{poet.name}</h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-1"
        >
          <Card className="overflow-hidden">
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={poet.image || "/placeholder.svg?height=400&width=400"}
                alt={poet.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
            <CardContent className="space-y-4 p-6">
              {poet.bio && (
                <div className="flex items-start gap-2">
                  <Feather className="h-5 w-5 text-muted-foreground mt-1" />
                  <p className="text-muted-foreground">{poet.bio}</p>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
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
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span>{poet.city}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{poet.ghazalCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Ghazals</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{poet.sherCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Shers</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{poet.otherCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Other</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground pt-4 border-t">
                <p>
                  <span className="font-semibold">Added:</span>{" "}
                  {new Date(poet.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {poet.updatedAt !== poet.createdAt && (
                  <p>
                    <span className="font-semibold">Last Updated:</span>{" "}
                    {new Date(poet.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Works by {poet.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {poems.length > 0 ? (
                <Tabs defaultValue="all" onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="all">All Works</TabsTrigger>
                    {groupedPoems?.ghazal?.length > 0 && (
                      <TabsTrigger value="ghazal">Ghazals</TabsTrigger>
                    )}
                    {groupedPoems?.sher?.length > 0 && (
                      <TabsTrigger value="sher">Shers</TabsTrigger>
                    )}
                    {groupedPoems?.other?.length > 0 && (
                      <TabsTrigger value="other">Other</TabsTrigger>
                    )}
                  </TabsList>

                  <AnimatePresence mode="wait">
                    <TabsContent value="all" className="mt-0">
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        {poems.map((poem: any, index: number) => {
                          const poemTitle = poem.title?.en || "Untitled";
                          const isInReadlist = readList.includes(poem._id);
                          const slug = poem.slug?.en || poem._id;

                          return (
                            <motion.div
                              key={poem._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: index * 0.05,
                                duration: 0.4,
                              }}
                              whileHover={{
                                y: -5,
                                transition: { duration: 0.2 },
                              }}
                            >
                              <Card className="overflow-hidden h-full flex flex-col">
                                <div className="relative h-40 overflow-hidden">
                                  <Image
                                    src={
                                      poem.coverImage ||
                                      "/placeholder.svg?height=200&width=300"
                                    }
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
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h3 className="text-lg font-bold line-clamp-1">
                                        {poemTitle}
                                      </h3>
                                      <Badge variant="outline" className="mt-1">
                                        {poem.category || "Other"}
                                      </Badge>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleReadlistToggle(
                                          poem._id,
                                          poemTitle
                                        )
                                      }
                                      className={`${
                                        isInReadlist
                                          ? "text-primary"
                                          : "text-muted-foreground"
                                      } hover:text-primary`}
                                    >
                                      {isInReadlist ? (
                                        <motion.div
                                          initial={{ scale: 0.5 }}
                                          animate={{ scale: 1 }}
                                          transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 15,
                                          }}
                                        >
                                          <BookmarkCheck className="h-5 w-5" />
                                        </motion.div>
                                      ) : (
                                        <BookmarkPlus className="h-5 w-5" />
                                      )}
                                    </Button>
                                  </div>
                                </CardContent>

                                <CardFooter className="p-4 pt-0">
                                  <Link
                                    href={`/poems/${slug}`}
                                    className="w-full"
                                  >
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="w-full gap-1"
                                    >
                                      <BookOpen className="h-4 w-4" />
                                      <span>Read</span>
                                    </Button>
                                  </Link>
                                </CardFooter>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </TabsContent>

                    {Object.entries(groupedPoems || {}).map(
                      ([category, poems]: [string, any]) => {
                        if (category === "all") return null;

                        return (
                          <TabsContent
                            key={category}
                            value={category}
                            className="mt-0"
                          >
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                            >
                              {poems.map((poem: any, index: number) => {
                                const poemTitle = poem.title?.en || "Untitled";
                                const isInReadlist = readList.includes(
                                  poem._id
                                );
                                const slug = poem.slug?.en || poem._id;

                                return (
                                  <motion.div
                                    key={poem._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                      delay: index * 0.05,
                                      duration: 0.4,
                                    }}
                                    whileHover={{
                                      y: -5,
                                      transition: { duration: 0.2 },
                                    }}
                                  >
                                    <Card className="overflow-hidden h-full flex flex-col">
                                      <div className="relative h-40 overflow-hidden">
                                        <Image
                                          src={
                                            poem.coverImage ||
                                            "/placeholder.svg?height=200&width=300"
                                          }
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
                                            <span>
                                              {poem.readListCount || 0}
                                            </span>
                                          </Badge>
                                        </div>
                                      </div>

                                      <CardContent className="flex-grow p-4">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <h3 className="text-lg font-bold line-clamp-1">
                                              {poemTitle}
                                            </h3>
                                            <Badge
                                              variant="outline"
                                              className="mt-1"
                                            >
                                              {poem.category || "Other"}
                                            </Badge>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleReadlistToggle(
                                                poem._id,
                                                poemTitle
                                              )
                                            }
                                            className={`${
                                              isInReadlist
                                                ? "text-primary"
                                                : "text-muted-foreground"
                                            } hover:text-primary`}
                                          >
                                            {isInReadlist ? (
                                              <motion.div
                                                initial={{ scale: 0.5 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                  type: "spring",
                                                  stiffness: 500,
                                                  damping: 15,
                                                }}
                                              >
                                                <BookmarkCheck className="h-5 w-5" />
                                              </motion.div>
                                            ) : (
                                              <BookmarkPlus className="h-5 w-5" />
                                            )}
                                          </Button>
                                        </div>
                                      </CardContent>

                                      <CardFooter className="p-4 pt-0">
                                        <Link
                                          href={`/poems/${slug}`}
                                          className="w-full"
                                        >
                                          <Button
                                            variant="default"
                                            size="sm"
                                            className="w-full gap-1"
                                          >
                                            <BookOpen className="h-4 w-4" />
                                            <span>Read</span>
                                          </Button>
                                        </Link>
                                      </CardFooter>
                                    </Card>
                                  </motion.div>
                                );
                              })}
                            </motion.div>
                          </TabsContent>
                        );
                      }
                    )}
                  </AnimatePresence>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-medium">No works available</h3>
                  <p className="text-muted-foreground mt-2">
                    There are no poems by this poet available at the moment.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
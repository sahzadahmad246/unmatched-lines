"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingComponent } from "../utils/LoadingComponent";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Feather,
  User,
  ArrowRight,
  Calendar,
  Quote,
  Sparkles,
  BookHeart,
  BookmarkPlus,
  Heart,
} from "lucide-react";
import { SearchBar } from "./search-bar";
import { VerseDownload } from "./verse-download";

interface Poet {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  dob?: string;
  city?: string;
  ghazalCount: number;
  sherCount: number;
}

interface Poem {
  _id: string;
  title: { en: string; hi?: string; ur?: string };
  author: { name: string; _id: string };
  category: "ghazal" | "sher";
  coverImage?: string;
  excerpt?: string;
  slug?: { en: string };
  content?: {
    en?: string[] | string;
    hi?: string[] | string;
    ur?: string[] | string;
  };
  readListCount?: number;
}

export default function Home() {
  const { data: session } = useSession();
  const [poets, setPoets] = useState<Poet[]>([]);
  const [ghazals, setGhazals] = useState<Poem[]>([]);
  const [shers, setShers] = useState<Poem[]>([]);
  const [featuredPoem, setFeaturedPoem] = useState<Poem | null>(null);
  const [poemOfTheDay, setPoemOfTheDay] = useState<Poem | null>(null);
  const [lineOfTheDay, setLineOfTheDay] = useState<string>("");
  const [lineAuthor, setLineAuthor] = useState<string>("");
  const [readList, setReadList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<
    "all" | "ghazal" | "sher"
  >("all");
  const [todayDate] = useState(
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  );

  const poetsScrollRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false)
  useEffect(() => {
    // Only fetch data once when the component mounts
    if (hasInitializedRef.current) return
    hasInitializedRef.current = true

    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch poets
        const poetsRes = await fetch("/api/authors", {
          credentials: "include",
        })
        if (!poetsRes.ok) throw new Error("Failed to fetch poets")
        const poetsData = await poetsRes.json()
        setPoets(poetsData.authors || [])

        // Fetch poems
        const poemsRes = await fetch("/api/poem", { credentials: "include" })
        if (!poemsRes.ok) throw new Error("Failed to fetch poems")
        const poemsData = await poemsRes.json()
        const poems = poemsData.poems || []

        // Filter by category
        setGhazals(poems.filter((poem: Poem) => poem.category === "ghazal").slice(0, 6))
        setShers(poems.filter((poem: Poem) => poem.category === "sher").slice(0, 6))

        // Set featured poem (random selection)
        if (poems.length > 0) {
          const randomIndex = Math.floor(Math.random() * poems.length)
          setFeaturedPoem(poems[randomIndex])
        }

        // Set poem of the day (based on date)
        if (poems.length > 0) {
          const dateStr = new Date().toISOString().split("T")[0]
          let seed = 0
          for (let i = 0; i < dateStr.length; i++) seed += dateStr.charCodeAt(i)
          const poemIndex = seed % poems.length
          const selectedPoem = poems[poemIndex]
          setPoemOfTheDay(selectedPoem)

          // Extract line of the day
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
          }

          const verseArray =
            verses.en.length > 0 ? verses.en : verses.hi.length > 0 ? verses.hi : verses.ur.length > 0 ? verses.ur : []
          if (verseArray.length > 0) {
            const verseIndex = seed % verseArray.length
            setLineOfTheDay(verseArray[verseIndex] || "No verse available")
          }
          setLineAuthor(selectedPoem.author?.name || "Unknown Author")
        }

        // Fetch user's reading list if logged in
        if (session) {
          const userRes = await fetch("/api/user", { credentials: "include" })
          if (userRes.ok) {
            const userData = await userRes.json()
            setReadList(userData.user.readList.map((poem: any) => poem._id.toString()))
          }
        }

        // Removed the welcome toast
      } catch (err) {
        setError("Failed to load data")
        toast.error("Failed to load content", {
          description: "Please try refreshing the page",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  const scrollPoets = (direction: "left" | "right") => {
    if (poetsScrollRef.current) {
      const scrollAmount = 150; // Adjusted for smaller cards
      const scrollPosition =
        direction === "left"
          ? poetsScrollRef.current.scrollLeft - scrollAmount
          : poetsScrollRef.current.scrollLeft + scrollAmount;

      poetsScrollRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  };

  const handleReadlistToggle = async (poemId: string, poemTitle: string) => {
    if (!session) {
      toast.error("Authentication required", {
        description: "Please sign in to manage your reading list.",
        action: {
          label: "Sign In",
          onClick: () => (window.location.href = "/api/auth/signin"),
        },
      });
      return;
    }

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
      }
    } catch (error) {
      toast.error("Error", {
        description: "An error occurred while updating the reading list.",
      });
    }
  };

  const formatPoetryContent = (content: string[] | string | undefined) => {
    if (!content) return "Content not available";

    if (typeof content === "string") {
      return content.split("\n").filter(Boolean)[0] || "Content not available";
    }

    if (Array.isArray(content) && content.length > 0) {
      return (
        content[0].split("\n").filter(Boolean)[0] || "Content not available"
      );
    }

    return "Content not available";
  };

  const formatVerseForDisplay = (verse: string) => {
    if (!verse) return ["No verse available"];
    const lines = verse.split("\n").filter(Boolean);
    return lines.length > 0 ? lines : [verse];
  };

  if (loading) {
    return (
     <LoadingComponent/>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-bold text-destructive">
            {error}
          </h2>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <Image
            src={
              featuredPoem?.coverImage ||
              "/placeholder.svg?height=1080&width=1920"
            }
            alt="Poetry background"
            fill
            priority
            className="object-cover opacity-30"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        <div className="container mx-auto px-4 z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4 sm:mb-6"
            >
              <Feather className="h-8 w-8 sm:h-12 sm:w-12 text-primary mx-auto" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 font-serif"
            >
              Unmatched Lines
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 font-serif italic px-4"
            >
              Discover the beauty of poetry from renowned poets across different
              languages and traditions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="w-full max-w-md"
            >
              <SearchBar fullWidth />

              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Button
                  asChild
                  variant="default"
                  size="sm"
                  className="text-xs sm:text-sm font-serif"
                >
                  <Link href="/poems">Explore Poems</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm font-serif"
                >
                  <Link href="/poets">Discover Poets</Link>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Line of the Day */}
      <section className="py-10 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4 ">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif">
                  Line of the Day
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-serif">
                {todayDate}
              </div>
            </div>

            {lineOfTheDay ? (
              <div className="relative overflow-hidden rounded-lg shadow-md">
                <div className="absolute inset-0 z-0">
                  <Image
                    src={
                      poemOfTheDay?.coverImage ||
                      "/placeholder.svg?height=800&width=1200"
                    }
                    alt="Line of the Day background"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 1200px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80" />
                </div>

                <div className="relative z-10 p-6 sm:p-10 md:p-12 flex flex-col items-center text-center text-white">
                  <div className="text-sm sm:text-base md:text-xl italic font-serif mb-4 leading-relaxed">
                    {formatVerseForDisplay(lineOfTheDay).map((line, index) => (
                      <p key={index} className="mb-2">
                        "{line}"
                      </p>
                    ))}
                  </div>
                  <Separator className="w-12 sm:w-16 my-3 sm:my-4 bg-white/30" />
                  <p className="text-xs sm:text-sm md:text-base text-white/80 font-serif mb-6">
                    — {lineAuthor}
                  </p>

                  <div className="flex items-center justify-center gap-3 ">
                    <VerseDownload
                      verse={lineOfTheDay}
                      author={lineAuthor}
                      imageUrl={
                        poemOfTheDay?.coverImage ||
                        "/placeholder.svg?height=800&width=1200"
                      }
                      title="Line of the Day"
                      languages={poemOfTheDay?.content}
                    />

                    {poemOfTheDay && (
                      <Button
                        asChild
                        variant="secondary"
                        size="sm"
                        className="gap-2 font-serif text-xs sm:text-sm text-black border "
                      >
                        <Link
                          href={`/poems/${
                            poemOfTheDay.slug?.en || poemOfTheDay._id
                          }`}
                        >
                          <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span>Read Full Poem</span>
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 sm:p-12 bg-muted/20 rounded-lg border border-primary/10">
                <p className="text-muted-foreground italic font-serif">
                  No line of the day available
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Poets Section */}
      <section className="py-10 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-serif">
              Featured Poets
            </h2>
            <Button
              variant="link"
              asChild
              className="font-serif text-xs sm:text-sm"
            >
              <Link href="/poets" className="flex items-center gap-1">
                See All <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </Button>
          </div>

          <div className="relative">
            <div
              ref={poetsScrollRef}
              className="flex overflow-x-auto pb-6 space-x-3 sm:space-x-4 scrollbar-hide snap-x"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {poets.map((poet, index) => (
                <motion.div
                  key={poet._id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="min-w-[120px] sm:min-w-[150px] md:min-w-[200px] snap-start"
                  whileHover={{ y: -5 }}
                >
                  <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-lg">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={
                          poet.image || "/placeholder.svg?height=150&width=150"
                        }
                        alt={poet.name}
                        fill
                        className="object-cover transition-transform hover:scale-105 duration-300"
                      />
                    </div>
                    <CardContent className="flex-grow p-2 text-center">
                      <h3 className="font-medium text-xs sm:text-sm line-clamp-1">
                        {poet.name}
                      </h3>
                    </CardContent>
                    <CardFooter className="p-2 pt-0">
                      <Button asChild size="sm" className="w-full text-xs">
                        <Link href={`/poets/${poet.slug}`}>View Profile</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollPoets("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full sm:flex hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scrollPoets("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full sm:flex hidden"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-10 sm:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 font-serif">
            Featured Collections
          </h2>

          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={(value) =>
              setActiveCategory(value as "all" | "ghazal" | "sher")
            }
          >
            <div className="flex justify-center mb-6 sm:mb-8">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger
                  value="all"
                  className="font-serif text-xs sm:text-sm"
                >
                  All Poems
                </TabsTrigger>
                <TabsTrigger
                  value="ghazal"
                  className="font-serif text-xs sm:text-sm"
                >
                  Ghazals
                </TabsTrigger>
                <TabsTrigger
                  value="sher"
                  className="font-serif text-xs sm:text-sm"
                >
                  Shers
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[...ghazals.slice(0, 3), ...shers.slice(0, 3)].map(
                  (poem, index) => (
                    <PoemCard
                      key={poem._id}
                      poem={poem}
                      index={index}
                      isInReadlist={readList.includes(poem._id)}
                      handleReadlistToggle={handleReadlistToggle}
                    />
                  )
                )}
              </div>
            </TabsContent>

            <TabsContent value="ghazal" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {ghazals.map((poem, index) => (
                  <PoemCard
                    key={poem._id}
                    poem={poem}
                    index={index}
                    isInReadlist={readList.includes(poem._id)}
                    handleReadlistToggle={handleReadlistToggle}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sher" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {shers.map((poem, index) => (
                  <PoemCard
                    key={poem._id}
                    poem={poem}
                    index={index}
                    isInReadlist={readList.includes(poem._id)}
                    handleReadlistToggle={handleReadlistToggle}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center mt-8 sm:mt-10">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="gap-2 font-serif text-xs sm:text-sm"
            >
              <Link
                href={`/${activeCategory === "all" ? "poems" : activeCategory}`}
              >
                View All{" "}
                {activeCategory === "all"
                  ? "Poems"
                  : activeCategory === "ghazal"
                  ? "Ghazals"
                  : "Shers"}
                <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-10 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="absolute -left-10 top-10 text-[120px] sm:text-[200px] text-primary/5 font-serif">
            "
          </div>
          <div className="absolute -right-10 bottom-10 text-[120px] sm:text-[200px] text-primary/5 font-serif">
            "
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
            <Quote className="h-8 w-8 sm:h-12 sm:w-12 text-primary/40 mx-auto" />

            <blockquote className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-serif italic px-4">
              Poetry is the spontaneous overflow of powerful feelings: it takes
              its origin from emotion recollected in tranquility.
            </blockquote>

            <div className="flex flex-col items-center">
              <Separator className="w-12 sm:w-16 mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg font-serif">
                William Wordsworth
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-10 sm:py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
            <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 mx-auto" />

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif">
              Begin Your Poetic Journey
            </h2>

            <p className="text-base sm:text-lg md:text-xl font-serif px-4">
              Explore our vast collection of poems, discover new poets, and
              create your personal anthology.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                asChild
                size="sm"
                variant="secondary"
                className="font-serif text-xs sm:text-sm"
              >
                <Link href="/library">Explore Collection</Link>
              </Button>

              {!session && (
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary font-serif text-xs sm:text-sm"
                >
                  <Link href="/api/auth/signin">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

interface PoemCardProps {
  poem: Poem;
  index: number;
  isInReadlist: boolean;
  handleReadlistToggle: (id: string, title: string) => void;
}

function PoemCard({
  poem,
  index,
  isInReadlist,
  handleReadlistToggle,
}: PoemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-40 sm:h-48 md:h-52">
          <Image
            src={poem.coverImage || "/placeholder.svg?height=400&width=600"}
            alt={poem.title.en}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="font-serif capitalize text-xs"
            >
              {poem.category}
            </Badge>
          </div>
          <button
            className="absolute bottom-2 right-2 bg-background/80 p-1.5 sm:p-2 rounded-full backdrop-blur-sm hover:bg-background transition-colors"
            onClick={() => handleReadlistToggle(poem._id, poem.title.en)}
          >
            {isInReadlist ? (
              <BookHeart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            ) : (
              <BookmarkPlus className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
          </button>
        </div>

        <CardContent className="flex-grow p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2 line-clamp-1 font-serif">
            {poem.title.en}
          </h3>

          <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mb-2 sm:mb-3 font-serif">
            <User className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> {poem.author.name}
          </p>

          {poem.excerpt && (
            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 font-serif">
              {poem.excerpt}
            </p>
          )}
        </CardContent>

        <CardFooter className="p-3 sm:p-4 pt-0 mt-auto">
          <div className="w-full flex items-center justify-between">
            <Button
              asChild
              variant="default"
              size="sm"
              className="gap-1 font-serif text-xs"
            >
              <Link href={`/poems/${poem.slug?.en || poem._id}`}>
                <BookOpen className="h-3.5 w-3.5" /> Read
              </Link>
            </Button>

            {poem.readListCount !== undefined && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>{poem.readListCount} Readers</span>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

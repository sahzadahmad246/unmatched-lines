"use client";

import { useState, useEffect, useMemo, lazy, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SerializedPoem } from "@/types/poemTypes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Bookmark,
  Share2,
  Eye,
  Calendar,
  User,
  Tag,
  Info,
  BookOpen,
  Languages,
  Sparkles,
  Quote,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUserStore } from "@/store/user-store";
import { usePoemStore } from "@/store/poem-store";
import { toast } from "sonner";

// Lazy load heavy components
const RecommendedPoems = lazy(
  () => import("@/components/poems/RecommendedPoems")
);

const Dialog = lazy(() =>
  import("@/components/ui/dialog").then((mod) => ({ default: mod.Dialog }))
);
const DialogContent = lazy(() =>
  import("@/components/ui/dialog").then((mod) => ({
    default: mod.DialogContent,
  }))
);
const DialogHeader = lazy(() =>
  import("@/components/ui/dialog").then((mod) => ({
    default: mod.DialogHeader,
  }))
);
const DialogTitle = lazy(() =>
  import("@/components/ui/dialog").then((mod) => ({ default: mod.DialogTitle }))
);
const DialogTrigger = lazy(() =>
  import("@/components/ui/dialog").then((mod) => ({
    default: mod.DialogTrigger,
  }))
);
const Collapsible = lazy(() =>
  import("@/components/ui/collapsible").then((mod) => ({
    default: mod.Collapsible,
  }))
);
const CollapsibleContent = lazy(() =>
  import("@/components/ui/collapsible").then((mod) => ({
    default: mod.CollapsibleContent,
  }))
);
const CollapsibleTrigger = lazy(() =>
  import("@/components/ui/collapsible").then((mod) => ({
    default: mod.CollapsibleTrigger,
  }))
);

interface PoemDetailsProps {
  poem: SerializedPoem;
  currentLang: "en" | "hi" | "ur";
}

function isPoetObject(
  poet: {
    _id: string;
    name: string;
    role?: string;
    profilePicture?: { publicId?: string; url: string; alt?: string };
    slug?: string;
  } | null
): poet is {
  _id: string;
  name: string;
  role?: string;
  profilePicture?: { publicId?: string; url: string; alt?: string };
  slug?: string;
} {
  return poet !== null && typeof poet === "object" && "name" in poet;
}

const languageNames = {
  en: "English",
  hi: "हिंदी",
  ur: "اردو",
};

const localizedStrings = {
  en: {
    backToPoems: "Back to poems",
    availableLanguages: "Available Languages",
    published: "Published",
    summary: "Summary",
    didYouKnow: "Did You Know?",
    faqs: "Frequently Asked Questions",
    viewMeaning: "View Meaning",
    allTopics: "All Topics",
    coverImageAlt: (title: string, poet: string) =>
      `Cover image for "${title}" by ${poet}`,
    poetImageAlt: (poet: string) => `Profile picture of ${poet}`,
    relatedPoems: "Related Poems",
    share: "Share",
    moreByPoet: (poet: string) => `More by ${poet}`,
    poemsInCategory: (category: string) => `Poems in ${category}`,
  },
  hi: {
    backToPoems: "कविताओं पर वापस",
    availableLanguages: "उपलब्ध भाषाएँ",
    published: "प्रकाशित",
    summary: "सारांश",
    didYouKnow: "क्या आप जानते हैं?",
    faqs: "अक्सर पूछे जाने वाले प्रश्न",
    viewMeaning: "अर्थ देखें",
    allTopics: "सभी विषय",
    coverImageAlt: (title: string, poet: string) =>
      `"${title}" का कवर चित्र, ${poet} द्वारा`,
    poetImageAlt: (poet: string) => `${poet} की प्रोफाइल तस्वीर`,
    relatedPoems: "संबंधित कविताएँ",
    share: "साझा करें",
    moreByPoet: (poet: string) => `${poet} द्वारा और`,
    poemsInCategory: (category: string) => `${category} में कविताएँ`,
  },
  ur: {
    backToPoems: "نظمیں واپس",
    availableLanguages: "دستیاب زبانیں",
    published: "شائع شدہ",
    summary: "خلاصہ",
    didYouKnow: "کیا آپ جانتے ہیں؟",
    faqs: "اکثر پوچھے گئے سوالات",
    viewMeaning: "معنی دیکھیں",
    allTopics: "تمام موضوعات",
    coverImageAlt: (title: string, poet: string) =>
      `"${title}" کے لئے کور تصویر، ${poet} کی طرف سے`,
    poetImageAlt: (poet: string) => `${poet} کی پروفائل تصویر`,
    relatedPoems: "متعلقہ نظمیں",
    share: "شیئر کریں",
    moreByPoet: (poet: string) => `${poet} کی طرف سے مزید`,
    poemsInCategory: (category: string) => `${category} میں نظمیں`,
  },
};

// Loading component for suspense fallbacks
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-4">
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-primary border-muted" />
  </div>
);

export default function OptimizedPoemDetails({
  poem,
  currentLang,
}: PoemDetailsProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [openFAQs, setOpenFAQs] = useState<number[]>([]);
  const [topicsDialogOpen, setTopicsDialogOpen] = useState(false);
  const [meaningDialogOpen, setMeaningDialogOpen] = useState(false);
  const [selectedCouplet, setSelectedCouplet] = useState<{
    couplet: string;
    meaning: string;
  } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [fullViewDialogOpen, setFullViewDialogOpen] = useState(false);
  
  const [showRecommended, setShowRecommended] = useState(false);

  const { userData, fetchUserData } = useUserStore();
  const { bookmarkPoem } = usePoemStore();

  const t = localizedStrings[currentLang];

  // Memoize poet data to prevent recalculations
  const poetData = useMemo(() => {
    const name = isPoetObject(poem.poet) ? poem.poet.name : "Unknown Poet";
    const image = isPoetObject(poem.poet)
      ? poem.poet.profilePicture?.url ?? "/placeholder.svg?height=64&width=64"
      : "/placeholder.svg?height=64&width=64";
    const slug = isPoetObject(poem.poet) ? poem.poet.slug : "unknown";
    const imageAlt = isPoetObject(poem.poet)
      ? poem.poet.profilePicture?.alt ?? t.poetImageAlt(name)
      : t.poetImageAlt("Unknown Poet");

    return { name, image, slug, imageAlt };
  }, [poem.poet, t]);

  // Memoize content processing
  const contentData = useMemo(() => {
    const displayContent =
      poem.content[currentLang].length > 0
        ? poem.content[currentLang]
        : poem.content.en.length > 0
        ? poem.content.en
        : [];
    const contentLang =
      poem.content[currentLang].length > 0 ? currentLang : "en";
    const contentNotice =
      poem.content[currentLang].length === 0 && poem.content.en.length > 0;

    return { displayContent, contentLang, contentNotice };
  }, [poem.content, currentLang]);

  const isUrdu = currentLang === "ur";
  const textDirection = isUrdu ? "rtl" : "ltr";
  const fontClass = isUrdu ? "font-noto-nastaliq" : "font-inter";

  useEffect(() => {
    if (userData?._id && poem) {
      const userId = userData._id.toString();
      setIsBookmarked(
        userData.bookmarks?.some(
          (b) => b.poemId.toString() === poem._id.toString()
        ) ||
          poem.bookmarks?.some(
            (bookmark) => bookmark.userId.toString() === userId
          ) ||
          false
      );
    } else {
      setIsBookmarked(false);
    }
  }, [userData, poem]);

  useEffect(() => {
    const handleScroll = () => {
      setShowTitle(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lazy load recommended poems after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowRecommended(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleBookmark = async () => {
    if (!userData?._id) {
      toast.error("Please log in to bookmark poems");
      return;
    }

    setActionLoading(true);
    const previousIsBookmarked = isBookmarked;
    setIsBookmarked(!isBookmarked);

    try {
      const result = await bookmarkPoem(
        poem._id,
        userData._id,
        isBookmarked ? "remove" : "add"
      );
      if (result.success) {
        await fetchUserData();
        toast.success(
          isBookmarked ? "Poem removed from bookmarks" : "Poem bookmarked"
        );
      } else {
        throw new Error(result.message || "Failed to update bookmark");
      }
    } catch (error) {
      console.error("Failed to bookmark poem:", error);
      toast.error("Failed to bookmark poem");
      setIsBookmarked(previousIsBookmarked);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: poem.title[currentLang],
        text:
          poem.content[currentLang][0]?.couplet ||
          poem.summary[currentLang] ||
          "",
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Poem link copied to clipboard");
    }
  };

  const formatCouplet = useMemo(
    () => (couplet: string) =>
      couplet.split("\n").map((line, index) => (
        <div key={index} className="leading-relaxed">
          {line}
        </div>
      )),
    []
  );

  const toggleFAQ = (index: number) => {
    setOpenFAQs((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const openMeaningDialog = (couplet: string, meaning: string) => {
    setSelectedCouplet({ couplet, meaning });
    setMeaningDialogOpen(true);
  };

  // FAQ Schema for Rich Snippets
  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: poem.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question[currentLang] || faq.question.en,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer[currentLang] || faq.answer.en,
        },
      })),
    }),
    [poem.faqs, currentLang]
  );

  return (
    <article className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* FAQ Schema */}
      {poem.faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Optimized Sticky Header */}
      <header
        className={`fixed top-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl bg-background/80 backdrop-blur-md border-b border-border/50 transition-all duration-300 ${
          scrolled ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="container m-0 p-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hover:bg-muted/80"
              aria-label={t.backToPoems}
            >
              <Link href="/poems">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">{t.backToPoems}</span>
              </Link>
            </Button>
            {showTitle && (
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-lg truncate">
                  {poem.title[currentLang]}
                </h2>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {poetData.name}
                </p>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFullViewDialogOpen(true)}
              className="flex items-center gap-2"
              aria-label="View full poem"
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Full View</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl space-y-6">
        {/* Language Switcher - Simplified */}
        <section className="p-4 rounded-xl border bg-card/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 text-sm font-medium">
              <Languages className="h-4 w-4 text-primary" />
              {t.availableLanguages}
            </h2>
            <Badge variant="secondary" className="text-xs">
              {Object.keys(poem.title).length}
            </Badge>
          </div>
          <div className="flex gap-2">
            {(["en", "hi", "ur"] as const).map((lang) => (
              <Button
                key={lang}
                variant={currentLang === lang ? "default" : "outline"}
                size="sm"
                asChild
                className="text-xs"
              >
                <Link
                  href={`/poems/${lang}/${poem.slug[lang]}`}
                  hrefLang={lang}
                >
                  {languageNames[lang]}
                </Link>
              </Button>
            ))}
          </div>
        </section>

        {/* Optimized Poet Section */}
        <section className="flex items-start gap-4 p-4 rounded-xl bg-card/50 border">
          <div className="flex-shrink-0 relative">
            <div className="h-16 w-16 rounded-full overflow-hidden ring-2 ring-primary/20">
              <Image
                src={poetData.image || "/placeholder.svg"}
                alt={poetData.imageAlt}
                width={64}
                height={64}
                className="w-full h-full object-cover"
                priority
                sizes="64px"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/poet/${poetData.slug}`}>
              <h3 className="font-bold text-xl mb-2 hover:text-primary transition-colors">
                {poetData.name}
              </h3>
            </Link>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(poem.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {poem.category}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 text-blue-500" />
                <span>{(poem.viewsCount || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Bookmark className="h-3 w-3 text-red-500" />
                <span>{(poem.bookmarkCount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Optimized Poem Title */}
        <section className="text-center py-6">
          <h1 className="text-2xl md:text-3xl font-bold leading-tight">
            {poem.title[currentLang]}
          </h1>
        </section>

        {/* Optimized Cover Image */}
        {poem.coverImage?.url && (
          <section className="relative h-64 md:h-80 rounded-xl overflow-hidden">
            <Image
              src={poem.coverImage.url || "/placeholder.svg"}
              alt={t.coverImageAlt(poem.title[currentLang], poetData.name)}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
          </section>
        )}

        {/* Content Fallback Notice */}
        {contentData.contentNotice && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Content not available in {languageNames[currentLang]}. Showing{" "}
              {languageNames.en} version.
            </p>
          </div>
        )}

        {/* Optimized Poem Content */}
        <section
          className="space-y-4"
          dir={textDirection}
          lang={contentData.contentLang}
        >
          {contentData.displayContent.map((item, index) => (
            <article key={index} className="relative">
              <div className="max-w-2xl mx-auto">
                <div className="relative p-4 rounded-xl bg-card/50 border">
                  <div className="absolute top-2 left-2 text-primary/30 font-mono text-xs">
                    {index + 1}
                  </div>
                  <div className="relative mb-3">
                    <div
                      className={`relative ${
                        isUrdu ? "pr-4" : "pl-4"
                      } ${fontClass}`}
                      dir={textDirection}
                      lang={contentData.contentLang}
                    >
                      <div
                        className={`absolute ${
                          isUrdu ? "right-0" : "left-0"
                        } top-0 bottom-0 w-1 bg-primary/40 rounded-full`}
                      />
                      <div className="text-lg leading-loose space-y-1">
                        {formatCouplet(item.couplet)}
                      </div>
                    </div>
                  </div>
                  {item.meaning && (
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          openMeaningDialog(item.couplet, item.meaning!)
                        }
                        className="text-xs"
                      >
                        <Info className="h-3 w-3 mr-1" />
                        View Meaning
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Optimized Topics */}
        {poem.topics.length > 0 && (
          <section className="flex justify-center gap-2 flex-wrap">
            {poem.topics.slice(0, 3).map((topic: string) => (
              <Badge
                key={topic}
                variant="outline"
                className="text-sm hover:bg-primary/10 transition-colors"
                asChild
              >
                <Link
                  href={`/poems/${currentLang}/category/${encodeURIComponent(
                    topic
                  )}`}
                >
                  #{topic}
                </Link>
              </Badge>
            ))}
            {poem.topics.length > 3 && (
              <Suspense fallback={<LoadingSpinner />}>
                <Dialog
                  open={topicsDialogOpen}
                  onOpenChange={setTopicsDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs bg-primary/10 hover:bg-primary/20"
                    >
                      +{poem.topics.length - 3} more
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        {t.allTopics}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {poem.topics.map((topic: string) => (
                        <Badge
                          key={topic}
                          variant="secondary"
                          className="text-sm"
                          asChild
                        >
                          <Link
                            href={`/poems/${currentLang}/category/${encodeURIComponent(
                              topic
                            )}`}
                          >
                            #{topic}
                          </Link>
                        </Badge>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </Suspense>
            )}
          </section>
        )}

        {/* Summary */}
        {(poem.summary[currentLang] || poem.summary.en) && (
          <section className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <h2 className="flex items-center gap-2 mb-3 text-sm font-medium">
              <MessageCircle className="h-4 w-4 text-primary" />
              {t.summary}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {poem.summary[currentLang] || poem.summary.en}
            </p>
          </section>
        )}

        {/* Did You Know */}
        {(poem.didYouKnow[currentLang] || poem.didYouKnow.en) && (
          <section className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/50">
            <h2 className="flex items-center gap-2 mb-3 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              {t.didYouKnow}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {poem.didYouKnow[currentLang] || poem.didYouKnow.en}
            </p>
          </section>
        )}

        {/* Lazy-loaded FAQs */}
        {poem.faqs.length > 0 && (
          <Suspense fallback={<LoadingSpinner />}>
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 mb-4 text-sm font-medium">
                <HelpCircle className="h-4 w-4 text-primary" />
                {t.faqs}
              </h2>
              <div className="space-y-2">
                {poem.faqs.map((faq, index) => (
                  <Collapsible key={index} open={openFAQs.includes(index)}>
                    <CollapsibleTrigger
                      onClick={() => toggleFAQ(index)}
                      className="w-full p-3 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm pr-4">
                          {faq.question[currentLang] || faq.question.en}
                        </h3>
                        <div className="text-muted-foreground">
                          {openFAQs.includes(index) ? "−" : "+"}
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-3 pb-3">
                      <p className="text-sm text-muted-foreground leading-relaxed pt-2 border-t border-border/50">
                        {faq.answer[currentLang] || faq.answer.en}
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </div>
            </section>
          </Suspense>
        )}

        {/* Lazy-loaded Recommended Poems */}
        {showRecommended && (
          <Suspense fallback={<LoadingSpinner />}>
            <RecommendedPoems currentPoem={poem} currentLang={currentLang} />
          </Suspense>
        )}

        {/* Optimized Sticky Footer */}
        <footer className="sticky bottom-0 z-50 bg-background/95 backdrop-blur-sm border-t">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-around max-w-md mx-auto">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4 text-blue-500" />
                <span>{(poem.viewsCount || 0).toLocaleString()}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center gap-1 ${
                  isBookmarked ? "text-primary" : ""
                }`}
                onClick={handleBookmark}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-primary border-muted" />
                ) : (
                  <Bookmark
                    className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                  />
                )}
                <span className="text-sm">
                  {(poem.bookmarkCount || 0).toLocaleString()}
                </span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center gap-1"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">{t.share}</span>
              </Button>
            </div>
          </div>
        </footer>

        

        <Suspense fallback={null}>
          <Dialog open={meaningDialogOpen} onOpenChange={setMeaningDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Quote className="h-4 w-4 text-primary" />
                  {t.viewMeaning}
                </DialogTitle>
              </DialogHeader>
              {selectedCouplet && (
                <div className="space-y-4">
                  <div className="relative">
                    <div
                      className={`relative ${
                        isUrdu ? "pr-4" : "pl-4"
                      } ${fontClass}`}
                      dir={textDirection}
                      lang={contentData.contentLang}
                    >
                      <div
                        className={`absolute ${
                          isUrdu ? "right-0" : "left-0"
                        } top-0 bottom-0 w-1 bg-primary/40 rounded-full`}
                      />
                      <div className="text-base leading-loose space-y-1">
                        {formatCouplet(selectedCouplet.couplet)}
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30 border">
                    <div className="flex items-start gap-2">
                      <Info className="h-3 w-3 text-primary mt-1 flex-shrink-0" />
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedCouplet.meaning}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </Suspense>

        <Suspense fallback={null}>
          <Dialog
            open={fullViewDialogOpen}
            onOpenChange={setFullViewDialogOpen}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {poem.title[currentLang]}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <Image
                      src={poetData.image || "/placeholder.svg"}
                      alt={poetData.imageAlt}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{poetData.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(poem.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {contentData.displayContent.map((item, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-lg border bg-card/50"
                    >
                      <div className="relative">
                        <div
                          className={`relative ${
                            isUrdu ? "pr-4" : "pl-4"
                          } ${fontClass}`}
                          dir={textDirection}
                          lang={contentData.contentLang}
                        >
                          <div
                            className={`absolute ${
                              isUrdu ? "right-0" : "left-0"
                            } top-0 bottom-0 w-1 bg-primary/40 rounded-full`}
                          />
                          <div className="text-sm leading-loose space-y-1">
                            {formatCouplet(item.couplet)}
                          </div>
                        </div>
                      </div>
                      {item.meaning && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <div className="flex items-start gap-2">
                            <Info className="h-3 w-3 text-muted-foreground mt-1 flex-shrink-0" />
                            <p className="text-xs text-muted-foreground italic leading-relaxed">
                              {item.meaning}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </Suspense>
      </div>
    </article>
  );
}

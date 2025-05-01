"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LightbulbIcon,
  User,
  Copy,
  Check,
  Share2,
  RefreshCw,
} from "lucide-react";

interface Quote {
  text: string;
  author: string;
  authorImage?: string;
}

export function DailyWisdom() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const quotes: Quote[] = [
    {
      text: "Poetry is the spontaneous overflow of powerful feelings: it takes its origin from emotion recollected in tranquility.",
      author: "William Wordsworth",
    },
    {
      text: "A poem begins as a lump in the throat, a sense of wrong, a homesickness, a lovesickness.",
      author: "Robert Frost",
    },
    {
      text: "Poetry is not a turning loose of emotion, but an escape from emotion; it is not the expression of personality, but an escape from personality.",
      author: "T.S. Eliot",
    },
    {
      text: "Poetry is the revelation of a feeling that the poet believes to be interior and personal which the reader recognizes as his own.",
      author: "Salvatore Quasimodo",
    },
    {
      text: "Poetry is eternal graffiti written in the heart of everyone.",
      author: "Lawrence Ferlinghetti",
    },
  ];

  useEffect(() => {
    // Select a quote based on the day of the month
    const day = new Date().getDate();
    const index = day % quotes.length;
    setQuote(quotes[index]);
  }, []);

  const handleCopy = () => {
    if (!quote) return;

    const textToCopy = `"${quote.text}" - ${quote.author}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);

    // Get a random quote different from the current one
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * quotes.length);
    } while (quote && quotes[newIndex].text === quote.text);

    setTimeout(() => {
      setQuote(quotes[newIndex]);
      setIsRefreshing(false);
    }, 600);
  };

  if (!quote) return null;

  return (
    <div className="h-full">
      <div className="bg-gradient-to-br from-cyan-50 via-cyan-100/30 to-blue-50 dark:from-cyan-950 dark:via-cyan-900/30 dark:to-blue-950 rounded-xl border border-cyan-200/60 dark:border-cyan-700/20 shadow-lg overflow-hidden h-full relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-cyan-300 to-blue-300 dark:from-cyan-700 dark:to-blue-600 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tr from-blue-300 to-cyan-300 dark:from-blue-600 dark:to-cyan-700 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>
        </div>

        <div className="p-4 sm:p-6 flex flex-col h-full relative z-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/30 via-transparent to-blue-200/30 dark:from-cyan-800/30 dark:to-blue-800/30 skew-x-12 rounded-lg -z-10"></div>
            <div className="py-2 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 shadow-sm">
                  <LightbulbIcon className="h-3.5 w-3.5 text-cyan-600 dark:text-blue-400" />
                </div>
                <h2 className="text-sm sm:text-base font-semibold font-serif text-cyan-800 dark:text-blue-300">
                  Daily Wisdom
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-7 w-7 rounded-full bg-white/80 dark:bg-slate-900/80 border border-cyan-200 dark:border-blue-800/40 text-cyan-700 dark:text-blue-300 hover:bg-cyan-50 dark:hover:bg-blue-950/50 hover:text-cyan-800 dark:hover:text-blue-200 backdrop-blur-sm"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
              </Button>
            </div>
          </div>

          <div className="relative flex-grow flex flex-col">
            <motion.div
              key={quote.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col h-full"
            >
              {/* Quote */}
              <div className="text-center mb-5 max-w-md mx-auto px-4 py-5 bg-gradient-to-b from-white/80 to-white/30 dark:from-slate-900/80 dark:to-slate-900/30 rounded-xl border border-cyan-200/40 dark:border-blue-700/20 shadow-inner backdrop-blur-sm">
                <div className="mb-4">
                  <span className="text-5xl font-serif text-cyan-400 dark:text-blue-500 leading-none">
                    "
                  </span>
                  <p className="text-sm sm:text-base font-serif italic leading-relaxed text-slate-800 dark:text-slate-200 px-4">
                    {quote.text}
                  </p>
                  <span className="text-5xl font-serif text-cyan-400 dark:text-blue-500 leading-none">
                    "
                  </span>
                </div>
              </div>

              {/* Author Info */}
              <div className="flex items-center justify-center gap-3 mb-5">
                <Avatar className="h-10 w-10 border-2 border-cyan-200 dark:border-blue-700 ring-2 ring-white dark:ring-slate-950 shadow-md">
                  {quote.authorImage ? (
                    <AvatarImage
                      src={quote.authorImage || "/placeholder.svg"}
                      alt={quote.author}
                    />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-900 dark:to-blue-900 text-cyan-700 dark:text-blue-300">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-medium font-serif text-cyan-800 dark:text-blue-300">
                    {quote.author}
                  </span>
                  <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-300 dark:via-blue-600 to-transparent rounded-full mt-1"></div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-auto">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-cyan-200 dark:border-blue-800/40 text-cyan-700 dark:text-blue-300 hover:bg-cyan-50 dark:hover:bg-blue-950/50 hover:text-cyan-800 dark:hover:text-blue-200 backdrop-blur-sm"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3 w-3 mr-0.5 text-emerald-500" />
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-0.5" />
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1 text-[10px] sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-cyan-200 dark:border-blue-800/40 text-cyan-700 dark:text-blue-300 hover:bg-cyan-50 dark:hover:bg-blue-950/50 hover:text-cyan-800 dark:hover:text-blue-200 backdrop-blur-sm"
                >
                  <Share2 className="h-3 w-3 mr-0.5" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

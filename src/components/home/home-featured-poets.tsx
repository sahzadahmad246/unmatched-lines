"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PoetCard } from "./poet-card";

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

interface HomeFeaturedPoetsProps {
  poets: Poet[];
}

export default function HomeFeaturedPoets({ poets }: HomeFeaturedPoetsProps) {
  const [featuredPoets, setFeaturedPoets] = useState<Poet[]>([]);

  useEffect(() => {
    const shuffleArray = (array: Poet[], seed: number) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const x = Math.sin(seed++) * 10000;
        const random = x - Math.floor(x);
        const j = Math.floor(random * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const today = new Date().toISOString().split("T")[0];
    const seed = today
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const shuffledPoets = shuffleArray(poets, seed);
    setFeaturedPoets(shuffledPoets.slice(0, 5));
  }, [poets]);

  return (
    <section className="relative">
      <div className="relative z-10">
        <div className="p-6 bg-gradient-to-br from-red-50 via-red-100/30 to-orange-50 dark:from-red-950 dark:via-red-900/30 dark:to-orange-950   dark:border-red-700/20">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/50 via-transparent to-orange-300/40 dark:from-red-800/30 dark:to-orange-800/30 skew-x-12 rounded-lg -z-10"></div>
            <div className="py-2 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900 dark:to-orange-900 shadow-sm">
                  <Users className="h-3.5 w-3.5 text-red-600 dark:text-orange-400" />
                </div>
                <h2 className="text-sm sm:text-base font-semibold font-serif text-red-800 dark:text-orange-300">
                  Trending Poems
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 text-[10px] rounded-full sm:text-xs font-serif bg-white/80 dark:bg-slate-900/80 border-rose-200 dark:border-amber-800/40 text-rose-700 dark:text-amber-300 hover:bg-rose-50 dark:hover:bg-amber-950/50 hover:text-rose-800 dark:hover:text-amber-200 backdrop-blur-sm"
                asChild
              >
                <Link
                  href="/poets"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-rose-500/10 to-amber-500/10 dark:from-rose-500/20 dark:to-amber-500/20 backdrop-blur-sm text-rose-700 dark:text-amber-300 border border-rose-300/30 dark:border-amber-600/30 shadow-sm"
                >
                  <span className="text-[10px] sm:text-xs font-medium">
                    See all
                  </span>
                  <ChevronRight className="h-3 w-3 text-amber-500 dark:text-amber-400" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {featuredPoets.slice(0, 5).map((poet, index) => (
              <PoetCard
                key={poet._id}
                poet={poet}
                variant="compact"
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

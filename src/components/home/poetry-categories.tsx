"use client";

import type React from "react";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Music,
  Feather,
  Book,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  href: string;
}

export function PoetryCategories() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const categories: Category[] = [
    {
      id: "ghazal",
      name: "Ghazal",
      description: "Lyrical poetry with rhyming couplets",
      icon: <Music className="h-5 w-5" />,
      count: 245,
      href: "/ghazal",
    },
    {
      id: "sher",
      name: "Sher",
      description: "Eloquent couplets expressing deep emotions",
      icon: <Feather className="h-5 w-5" />,
      count: 512,
      href: "/sher",
    },
    {
      id: "nazm",
      name: "Nazm",
      description: "Structured poems with thematic unity",
      icon: <Book className="h-5 w-5" />,
      count: 187,
      href: "/nazm",
    },
    {
      id: "library",
      name: "Library",
      description: "Your personal collection of saved poems",
      icon: <BookOpen className="h-5 w-5" />,
      count: 0,
      href: "/library",
    },
  ];

  return (
    <div className="h-full">
      <div className="bg-gradient-to-br from-teal-50 via-teal-100/30 to-emerald-50 dark:from-teal-950 dark:via-teal-900/30 dark:to-emerald-950 rounded-xl border border-teal-200/60 dark:border-teal-700/20 shadow-lg overflow-hidden h-full relative">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-300 to-emerald-300 dark:from-teal-700 dark:to-emerald-600 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-300 to-teal-300 dark:from-emerald-600 dark:to-teal-700 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="p-4 sm:p-6 flex flex-col h-full relative z-10">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-teal-200/30 via-transparent to-emerald-200/30 dark:from-teal-800/30 dark:to-emerald-800/30 skew-x-12 rounded-lg -z-10"></div>
            <div className="py-2 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900 dark:to-emerald-900 shadow-sm">
                  <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-sm sm:text-base font-semibold font-serif text-teal-800 dark:text-emerald-300">
                  Poetry Categories
                </h2>
              </div>
              <div className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r from-teal-500/10 to-emerald-500/10 dark:from-teal-500/20 dark:to-emerald-500/20 backdrop-blur-sm text-teal-700 dark:text-emerald-300 border border-teal-300/30 dark:border-emerald-600/30 shadow-sm">
                <span className="text-[10px] sm:text-xs font-medium">
                  Explore
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-grow">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                onHoverStart={() => setHoveredCategory(category.id)}
                onHoverEnd={() => setHoveredCategory(null)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="relative overflow-hidden"
              >
                <Link href={category.href} className="block h-full">
                  <div
                    className={`
                      h-full p-4 rounded-lg border border-teal-200/40 dark:border-emerald-700/20 
                      bg-gradient-to-br from-white/80 to-white/30 dark:from-slate-900/80 dark:to-slate-900/30 
                      backdrop-blur-sm shadow-sm hover:shadow-md transition-all
                      ${
                        hoveredCategory === category.id
                          ? "ring-2 ring-teal-300/50 dark:ring-emerald-500/30"
                          : ""
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900 dark:to-emerald-900 shadow-sm">
                        <div className="text-teal-600 dark:text-emerald-400">
                          {category.icon}
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-base font-medium text-teal-800 dark:text-emerald-300 mb-1">
                          {category.name}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                          {category.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-teal-600 dark:text-emerald-400">
                            {category.count}{" "}
                            {category.count === 1 ? "entry" : "entries"}
                          </span>
                          <motion.div
                            animate={{
                              x: hoveredCategory === category.id ? 0 : -5,
                              opacity:
                                hoveredCategory === category.id ? 1 : 0.5,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <ArrowRight className="h-3.5 w-3.5 text-teal-600 dark:text-emerald-400" />
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// src/components/poets/poet-card.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, BookMarked, FileText, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Author } from "@/types/author";

interface PoetCardProps {
  poet: Author;
  variant?: "default" | "compact";
  featured?: boolean;
}

export function PoetCard({ poet, variant = "default", featured = false }: PoetCardProps) {
  const totalPoems = (poet.ghazalCount || 0) + (poet.sherCount || 0) + (poet.otherCount || 0);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (variant === "compact") {
    return (
      <Link href={`/poets/${poet.slug}`} className="block h-full">
        <motion.div
          className="group relative h-full overflow-hidden rounded-xl transition-all duration-300 hover:shadow-md"
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 shadow-sm h-full">
            <div className="relative aspect-square w-full overflow-hidden rounded-t-xl">
              {poet.image ? (
                <Image
                  src={poet.image || "/placeholder.svg"}
                  alt={poet.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 180px, (max-width: 1200px) 220px, 260px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-800">
                  <span className="text-4xl font-semibold text-gray-600 dark:text-gray-400">
                    {getInitials(poet.name)}
                  </span>
                </div>
              )}

              {featured && (
                <div className="absolute left-2 top-2">
                  <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    <Sparkles className="h-3 w-3 mr-1 text-gray-500 dark:text-gray-400" />
                    Featured
                  </Badge>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            <div className="p-3 flex flex-col justify-between">
              <h3 className="line-clamp-1 font-medium text-black dark:text-white">{poet.name}</h3>

              <div className="mt-1">
                {totalPoems > 0 ? (
                  <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                    <BookOpen className="h-3 w-3" />
                    <span className="truncate">
                      {poet.ghazalCount > 0 && `${poet.ghazalCount} ghazal${poet.ghazalCount !== 1 ? "s" : ""}`}
                      {poet.ghazalCount > 0 && (poet.sherCount > 0 || poet.otherCount > 0) && ", "}
                      {poet.sherCount > 0 && `${poet.sherCount} sher${poet.sherCount !== 1 ? "s" : ""}`}
                      {(poet.ghazalCount > 0 || poet.sherCount > 0) && poet.otherCount > 0 && ", "}
                      {poet.otherCount > 0 && `${poet.otherCount} other${poet.otherCount !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 dark:text-gray-400">No works found</p>
                )}
              </div>
            </div>

            <div className="p-2 pt-0 mt-auto">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs h-8 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                View Profile
              </Button>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link href={`/poets/${poet.slug}`} className="block h-full">
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950">
        <div className="relative aspect-square w-full overflow-hidden">
          {poet.image ? (
            <Image
              src={poet.image || "/placeholder.svg"}
              alt={poet.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-800">
              <span className="text-5xl font-semibold text-gray-600 dark:text-gray-400">
                {getInitials(poet.name)}
              </span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute bottom-0 w-full p-3">
            <h3 className="line-clamp-1 text-lg font-medium text-white drop-shadow-md">{poet.name}</h3>
          </div>
        </div>

        <CardContent className="p-3 pt-2">
          <div className="flex flex-col gap-1">
            {totalPoems > 0 ? (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                {poet.ghazalCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <BookMarked className="h-3 w-3" />
                    {poet.ghazalCount} {poet.ghazalCount === 1 ? "ghazal" : "ghazals"}
                  </span>
                )}

                {poet.sherCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <FileText className="h-3 w-3" />
                    {poet.sherCount} {poet.sherCount === 1 ? "sher" : "shers"}
                  </span>
                )}

                {poet.otherCount > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <BookOpen className="h-3 w-3" />
                    {poet.otherCount} {poet.otherCount === 1 ? "other" : "others"}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-400">No works found</p>
            )}
          </div>
        </CardContent>

        <div className="border-t border-gray-200 dark:border-gray-700 p-2 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            View Profile
          </Button>
        </div>
      </Card>
    </Link>
  );
}
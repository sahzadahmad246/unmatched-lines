"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MapPin, Calendar, BookText } from "lucide-react";

interface PoetCardProps {
  poet: {
    _id: string;
    name: string;
    slug: string;
    image?: string;
    dob?: string;
    city?: string;
    ghazalCount?: number;
    sherCount?: number;
    bio?: string;
  };
  variant?: "compact" | "full";
  className?: string;
  index?: number;
}

export function PoetCard({ poet, variant = "compact", className = "", index = 0 }: PoetCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Format date if available
  const formattedDate = poet.dob ? formatDate(poet.dob) : undefined;

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.05,
        ease: "easeOut",
      },
    },
    hover: {
      y: -8,
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 },
    },
  };

  if (variant === "compact") {
    return (
      <motion.div
        className={className}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card className="h-full overflow-hidden bg-white/80 dark:bg-slate-900/80 border-rose-200/60 dark:border-amber-700/20 hover:border-rose-300/80 dark:hover:border-amber-600/40 transition-colors shadow-sm hover:shadow-md">
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={poet.image || `/placeholder.svg?height=200&width=200`}
              alt={poet.name}
              fill
              className="object-cover transition-transform duration-500"
              style={{ transform: isHovered ? "scale(1.05)" : "scale(1)" }}
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-rose-800/60 via-rose-800/20 to-transparent opacity-0 transition-opacity duration-300"
              style={{ opacity: isHovered ? 1 : 0 }}
            />
          </div>
          <CardContent className="p-3 text-center">
            <h3 className="font-bold text-sm sm:text-base font-serif bg-gradient-to-r from-rose-800 to-amber-600 bg-clip-text text-transparent dark:from-rose-500 dark:to-amber-400 line-clamp-1">
              {poet.name}
            </h3>
            {poet.city && (
              <p className="text-xs text-rose-600 dark:text-amber-400 flex items-center justify-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                <span>{poet.city}</span>
              </p>
            )}
          </CardContent>
          <CardFooter className="p-3 pt-0 flex justify-center">
            <Button
              asChild
              size="sm"
              className="w-full text-xs font-serif bg-gradient-to-r from-rose-500/10 to-amber-500/10 dark:from-rose-500/20 dark:to-amber-500/20 border-rose-200 dark:border-amber-800/40 text-rose-700 dark:text-amber-300 hover:bg-rose-50 dark:hover:bg-amber-950/50"
            >
              <Link href={`/poets/${poet.slug}`}>Explore Poet</Link>
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  // Full variant (social media style)
  return (
    <motion.div
      className={className}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden bg-white/80 dark:bg-slate-900/80 border-rose-200/60 dark:border-amber-700/20 hover:border-rose-300/80 dark:hover:border-amber-600/40 transition-colors shadow-sm hover:shadow-md">
        <div className="relative h-24 sm:h-32 bg-gradient-to-r from-rose-100/50 to-amber-100/50 dark:from-rose-900/50 dark:to-amber-900/50">
          <div className="absolute -bottom-10 sm:-bottom-12 left-4 border-4 border-white dark:border-slate-950 rounded-full overflow-hidden ring-2 ring-rose-200 dark:ring-amber-700">
            <div className="relative h-20 w-20 sm:h-24 sm:w-24">
              <Image
                src={poet.image || `/placeholder.svg?height=200&width=200`}
                alt={poet.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <CardContent className="pt-12 sm:pt-14 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-base sm:text-lg font-serif bg-gradient-to-r from-rose-800 to-amber-600 bg-clip-text text-transparent dark:from-rose-500 dark:to-amber-400">
                {poet.name}
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                {poet.city && (
                  <p className="text-xs(super)text-xs text-rose-600 dark:text-amber-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span>{poet.city}</span>
                  </p>
                )}
                {formattedDate && (
                  <p className="text-xs text-rose-600 dark:text-amber-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formattedDate}</span>
                  </p>
                )}
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="text-xs font-serif bg-gradient-to-r from-rose-500/10 to-amber-500/10 dark:from-rose-500/20 dark:to-amber-500/20 border-rose-200 dark:border-amber-800/40 text-rose-700 dark:text-amber-300 hover:bg-rose-50 dark:hover:bg-amber-950/50"
            >
              <Link href={`/poets/${poet.slug}`}>Explore Poet</Link>
            </Button>
          </div>

          {poet.bio && (
            <p className="text-xs sm:text-sm text-rose-700 dark:text-amber-300 mt-3 line-clamp-2">{poet.bio}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            {(poet.ghazalCount || 0) > 0 && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 text-xs border-rose-200 dark:border-amber-800 text-rose-700 dark:text-amber-300"
              >
                <BookText className="h-3 w-3" />
                <span>{poet.ghazalCount} Ghazals</span>
              </Badge>
            )}
            {(poet.sherCount || 0) > 0 && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 text-xs border-rose-200 dark:border-amber-800 text-rose-700 dark:text-amber-300"
              >
                <BookOpen className="h-3 w-3" />
                <span>{poet.sherCount} Shers</span>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper function to format dates
function formatDate(dateString: string): string {
  if (!dateString) return "";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
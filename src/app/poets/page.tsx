"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

export default function Poets() {
  const [searchTerm, setSearchTerm] = useState("");
  const [authors, setAuthors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Fetch authors from API on mount
  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const res = await fetch("/api/authors", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch authors");
        const data = await res.json();
        setAuthors(data.authors || []);
      } catch (err) {
        console.error("Error fetching authors:", err);
        setError("Failed to load poets");
      } finally {
        setLoading(false);
      }
    };
    fetchAuthors();
  }, []);

  const filteredAuthors = authors.filter((author) =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h2 className="text-2xl font-bold">Loading poets...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[50vh]">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold text-destructive">{error}</h2>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
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
          <h1 className="text-3xl font-bold">Explore Poets</h1>
          <p className="text-muted-foreground mt-1">
            Discover renowned poets and their beautiful works
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
            placeholder="Search poets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 w-full"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredAuthors.map((author, index) => (
            <motion.div
              key={author._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex justify-center pt-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden">
                    <Image
                      src={author.image || "/placeholder.svg?height=100&width=100"}
                      alt={author.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100px, 100px"
                    />
                  </div>
                </div>
                <CardHeader className="pt-4 pb-2 text-center">
                  <CardTitle className="text-lg line-clamp-1">{author.name}</CardTitle>
                </CardHeader>
                <CardFooter className="pt-0 pb-6 flex justify-center">
                  <Link href={`/poets/${author._id}`}>
                    <Button size="sm" className="w-full">View Profile</Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}

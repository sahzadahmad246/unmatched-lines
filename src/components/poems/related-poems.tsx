"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Poem } from "@/types/poem";

interface RelatedPoemsProps {
  currentPoem: Poem;
  language: "en" | "hi" | "ur";
}

interface RelatedPoemsData {
  byCategory: Poem[];
  byAuthor: Poem[];
}

export default function RelatedPoems({ currentPoem, language }: RelatedPoemsProps) {
  const [relatedPoems, setRelatedPoems] = useState<RelatedPoemsData>({
    byCategory: [],
    byAuthor: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedPoems = async () => {
      try {
        const res = await fetch(
          `/api/related-poems?category=${encodeURIComponent(currentPoem.category)}&authorId=${currentPoem.author._id}&lang=${language}&excludeId=${currentPoem._id}`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Failed to fetch related poems");
        const data = await res.json();
        setRelatedPoems({
          byCategory: data.byCategory || [],
          byAuthor: data.byAuthor || [],
        });
      } catch (error) {
        console.error("Error fetching related poems:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedPoems();
  }, [currentPoem, language]);

  const getSlug = (poem: Poem) => {
    return Array.isArray(poem.slug)
      ? poem.slug.find(s => s[language])?.[language] || poem.slug[0].en
      : poem.slug[language] || poem.slug.en;
  };

  if (loading) {
    return (
      <div className="mt-8 text-center">
        <p className="text-muted-foreground">Loading related poems...</p>
      </div>
    );
  }

  if (relatedPoems.byCategory.length === 0 && relatedPoems.byAuthor.length === 0) {
    return null; // Don't show if no related poems
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-muted-foreground mb-4">Explore More Poems</h2>

      {/* By Category */}
      {relatedPoems.byCategory.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">More in {currentPoem.category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedPoems.byCategory.slice(0, 3).map((poem) => (
              <Link key={poem._id} href={`/poems/${language}/${getSlug(poem)}`}>
                <Card className="hover:bg-primary/10 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-md">{poem.title?.[language] || "Untitled"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      By {poem.author?.name || "Unknown Author"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* By Author */}
      {relatedPoems.byAuthor.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">More by {currentPoem.author.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatedPoems.byAuthor.slice(0, 3).map((poem) => (
              <Link key={poem._id} href={`/poems/${language}/${getSlug(poem)}`}>
                <Card className="hover:bg-primary/10 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-md">{poem.title?.[language] || "Untitled"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      By {poem.author?.name || "Unknown Author"}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
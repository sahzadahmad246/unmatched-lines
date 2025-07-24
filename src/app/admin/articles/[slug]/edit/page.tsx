"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ArticleForm from "@/components/articles/ArticleForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { CreateArticleSchema } from "@/validators/articleValidator";

interface ArticleDataForForm extends CreateArticleSchema {
_id?: string;
coverImage?: string; // URL of the image
poet?: { _id: string; name: string }; // Populated poet data
}

export default function EditArticlePage() {
const params = useParams();
const slug = params.slug as string;
const [articleData, setArticleData] = useState<ArticleDataForForm | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  if (!slug) {
    setLoading(false);
    setError("Article slug is missing.");
    return;
  }

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${slug}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch article.");
      }
      const data: ArticleDataForForm = await response.json();
      // Transform data to match form's expected structure
      const transformedData: ArticleDataForForm = {
        ...data,
        poetId: data.poet?._id || "", // Ensure poetId is set for the select
        coverImage: data.coverImage || undefined, // Ensure coverImage is string URL or undefined
        category: data.category || [], // Ensure category is an array
        tags: data.tags || [], // Ensure tags is an array
        couplets: data.couplets || [], // Ensure couplets is an array
      };
      setArticleData(transformedData);
    } catch (err: any) {
      console.error("Error fetching article for edit:", err);
      setError(err.message || "An unexpected error occurred while fetching the article.");
      toast.error("Error fetching article", {
        description: err.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  fetchArticle();
}, [slug]);

if (loading) {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Loading Article...</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

if (error) {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    </div>
  );
}

if (!articleData) {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Article Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The article you are trying to edit could not be found.</p>
        </CardContent>
      </Card>
    </div>
  );
}

return (
  <div className="container mx-auto py-8">
    <ArticleForm initialData={articleData} isEdit={true} articleSlug={slug} />
  </div>
);
}

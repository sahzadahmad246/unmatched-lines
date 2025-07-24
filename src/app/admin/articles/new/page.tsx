"use client"

import ArticleForm from "@/components/articles/ArticleForm"

export default function Page() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Create New Article</h1>
      <ArticleForm />
    </div>
  )
}

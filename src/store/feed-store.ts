// src/store/article-store.ts
"use client";

import { create } from "zustand";
import { TransformedArticle } from "@/types/articleTypes";

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ArticleFeedState {
  articles: TransformedArticle[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  fetchFeed: (page?: number, limit?: number) => Promise<void>;
  setArticles: (articles: TransformedArticle[]) => void;
  setPagination: (pagination: Pagination) => void;
  clearFeed: () => void;
}

export const useArticleFeedStore = create<ArticleFeedState>((set) => ({
  articles: [],
  pagination: null,
  loading: false,
  error: null,

  fetchFeed: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/poems/feed?page=${page}&limit=${limit}`, { // Modified line: Changed endpoint to /api/poems/feed
        credentials: "include",
        next: { revalidate: 60 },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch article feed");
      }
      const { articles, pagination } = await response.json();
      set((state) => ({
        articles: page === 1 ? articles : [...state.articles, ...articles],
        pagination,
        loading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", loading: false });
    }
  },

  setArticles: (articles: TransformedArticle[]) => set({ articles }),
  setPagination: (pagination: Pagination) => set({ pagination }),
  clearFeed: () => set({ articles: [], pagination: null, error: null, loading: false }),
}));
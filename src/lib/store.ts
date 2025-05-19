// src/lib/store.ts
import { create } from "zustand";
import { Poem } from "@/types/poem";
import { Author } from "@/types/author";
import { toast } from "sonner";

interface CoverImage {
  _id: string;
  url: string;
  uploadedBy: { name: string };
  createdAt: string;
}

interface StoreState {
  poems: Poem[];
  nextCursor: string | null;
  hasMore: boolean;
  categoryPoems: Record<string, Poem[]>;
  categoryMeta: Record<
    string,
    { page: number; total: number; pages: number; hasMore: boolean }
  >;
  poets: Author[];
  poetMeta: { page: number; total: number; pages: number; hasMore: boolean };
  authors: Record<string, Author>;
  coverImages: CoverImage[];
  readList: string[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategories: string[];
  poetSearchQuery: string;
  poetFilters: { cities: string[]; letters: string[] };
  fetchPoems: (params?: {
    lastId?: string | null;
    limit?: number;
    category?: string;
    search?: string;
    reset?: boolean;
  }) => Promise<void>;
  fetchPoemsByCategory: (params: {
    category: string;
    page?: number;
    limit?: number;
    reset?: boolean;
  }) => Promise<void>;
  fetchPoets: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    cities?: string[];
    letters?: string[];
    reset?: boolean;
  }) => Promise<void>;
  fetchAuthor: (authorId: string) => Promise<void>;
  fetchCoverImages: () => Promise<void>;
  fetchReadList: () => Promise<void>;
  toggleReadList: (poemId: string, poemTitle: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategories: (categories: string[]) => void;
  setPoetSearchQuery: (query: string) => void;
  setPoetFilters: (filters: { cities?: string[]; letters?: string[] }) => void;
  clearCache: () => void;
}

const cache = new Map<string, { data: any; timestamp: number }>();

export const useStore = create<StoreState>((set, get) => ({
  poems: [],
  nextCursor: null,
  hasMore: true,
  categoryPoems: {},
  categoryMeta: {},
  poets: [],
  poetMeta: { page: 1, total: 0, pages: 0, hasMore: true },
  authors: {},
  coverImages: [],
  readList: [],
  loading: false,
  error: null,
  searchQuery: "",
  selectedCategories: [],
  poetSearchQuery: "",
  poetFilters: { cities: [], letters: [] },
  fetchPoems: async ({ lastId, limit = 20, category, search, reset = false } = {}) => {
    set({ loading: true, error: null });
    if (reset) {
      set({ poems: [], nextCursor: null, hasMore: true });
      cache.clear();
    }

    try {
      const query = new URLSearchParams();
      query.set("limit", limit.toString());
      if (lastId) query.set("lastId", lastId);
      if (category) query.set("category", category);
      if (search) query.set("search", search);
      const cacheKey = `/api/poem?${query.toString()}`;
      const cached = cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
        set((state) => ({
          poems: lastId ? [...state.poems, ...cached.data.poems] : cached.data.poems,
          nextCursor: cached.data.nextCursor,
          hasMore: cached.data.hasMore,
          loading: false, // Ensure loading is false for cached data
        }));
      } else {
        const res = await fetch(`/api/poem?${query.toString()}`, { credentials: "include" });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch poems");
        }
        const data = await res.json();
        
        set((state) => ({
          poems: lastId ? [...state.poems, ...data.poems] : data.poems,
          nextCursor: data.nextCursor || null,
          hasMore: data.hasMore,
          loading: false,
        }));
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }
    } catch (err) {
      set({ error: (err as Error).message || "Failed to fetch poems", loading: false });
    }
  },
  fetchPoemsByCategory: async ({ category, page = 1, limit = 10, reset = false }) => {
    set({ loading: true, error: null });
    if (reset) {
      set((state) => ({
        categoryPoems: { ...state.categoryPoems, [category]: [] },
        categoryMeta: { ...state.categoryMeta, [category]: { page: 1, total: 0, pages: 0, hasMore: true } },
      }));
    }

    try {
      const query = new URLSearchParams();
      query.set("category", category.toLowerCase());
      query.set("page", page.toString());
      query.set("limit", limit.toString());
      const cacheKey = `/api/poems-by-category?${query.toString()}`;
      const cached = cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
        set((state) => ({
          categoryPoems: {
            ...state.categoryPoems,
            [category]: page > 1 ? [...(state.categoryPoems[category] || []), ...cached.data.poems] : cached.data.poems,
          },
          categoryMeta: {
            ...state.categoryMeta,
            [category]: {
              page: cached.data.page,
              total: cached.data.total,
              pages: cached.data.pages,
              hasMore: cached.data.page < cached.data.pages,
            },
          },
          loading: false, // Ensure loading is false for cached data
        }));
      } else {
        
        const res = await fetch(`/api/poems-by-category?${query.toString()}`, { credentials: "include" });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch category poems");
        }
        const data = await res.json();
        
        set((state) => ({
          categoryPoems: {
            ...state.categoryPoems,
            [category]: page > 1 ? [...(state.categoryPoems[category] || []), ...data.poems] : data.poems,
          },
          categoryMeta: {
            ...state.categoryMeta,
            [category]: {
              page: data.page,
              total: data.total,
              pages: data.pages,
              hasMore: data.page < data.pages,
            },
          },
          loading: false,
        }));
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }
    } catch (err) {
      set({ error: (err as Error).message || `Failed to fetch ${category} poems`, loading: false });
    }
  },
  fetchPoets: async ({ page = 1, limit = 20, search = "", cities = [], letters = [], reset = false } = {}) => {
    set({ loading: true, error: null });
    if (reset) {
      set({ poets: [], poetMeta: { page: 1, total: 0, pages: 0, hasMore: true } });
    }

    try {
      const query = new URLSearchParams();
      query.set("page", page.toString());
      query.set("limit", limit.toString());
      if (search) query.set("search", search);
      if (cities.length > 0) query.set("city", cities.join(","));
      if (letters.length > 0) query.set("letter", letters.join(","));
      const cacheKey = `/api/authors?${query.toString()}`;
      const cached = cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
        set((state) => ({
          poets: page > 1 ? [...state.poets, ...cached.data.authors] : cached.data.authors,
          poetMeta: {
            page: cached.data.page,
            total: cached.data.total,
            pages: cached.data.pages,
            hasMore: cached.data.page < cached.data.pages,
          },
          loading: false,
        }));
      } else {
        const res = await fetch(`/api/authors?${query.toString()}`, { credentials: "include" });
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch poets");
        }
        const data = await res.json();
       
        set((state) => ({
          poets: page > 1 ? [...state.poets, ...data.authors] : data.authors,
          poetMeta: {
            page: data.page,
            total: data.total,
            pages: data.pages,
            hasMore: data.page < data.pages,
          },
          loading: false,
        }));
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }
    } catch (err) {
      set({ error: (err as Error).message || "Failed to fetch poets", loading: false });
    }
  },
  fetchAuthor: async (authorId: string) => {
    if (!authorId || get().authors[authorId]) return;

    set({ loading: true, error: null });
    try {
      const cacheKey = `/api/authors/${authorId}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
        set((state) => ({
          authors: { ...state.authors, [authorId]: cached.data.author },
          loading: false,
        }));
      } else {
        const res = await fetch(`/api/authors/${authorId}`, { credentials: "include" });
        if (!res.ok) throw new Error(`Failed to fetch author ${authorId}`);
        const data = await res.json();
        set((state) => ({
          authors: { ...state.authors, [authorId]: data.author },
          loading: false,
        }));
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }
    } catch (err) {
      set({ error: (err as Error).message || `Failed to fetch author ${authorId}`, loading: false });
    }
  },
  fetchCoverImages: async () => {
    set({ loading: true, error: null });
    try {
      const cacheKey = "/api/cover-images";
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
        set({ coverImages: cached.data.coverImages, loading: false });
      } else {
        const res = await fetch("/api/cover-images", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch cover images");
        const data = await res.json();
        set({ coverImages: data.coverImages || [], loading: false });
        cache.set(cacheKey, { data, timestamp: Date.now() });
      }
    } catch (err) {
      set({ error: (err as Error).message || "Failed to fetch cover images", loading: false });
    }
  },
  fetchReadList: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/user", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        set({ readList: data.user.readList.map((poem: any) => poem._id.toString()), loading: false });
      } else if (res.status === 401) {
        set({ readList: [], loading: false });
      } else {
        throw new Error("Failed to fetch read list");
      }
    } catch (err) {
      set({ error: (err as Error).message || "Failed to fetch read list", loading: false });
    }
  },
  toggleReadList: async (poemId: string, poemTitle: string) => {
    const { readList, poems, categoryPoems } = get();
    const isInReadlist = readList.includes(poemId);
    const url = isInReadlist ? "/api/user/readlist/remove" : "/api/user/readlist/add";
    const method = isInReadlist ? "DELETE" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poemId }),
        credentials: "include",
      });
      if (res.ok) {
        set({
          readList: isInReadlist
            ? readList.filter((id) => id !== poemId)
            : [...readList, poemId],
          poems: poems.map((poem) =>
            poem._id === poemId
              ? {
                  ...poem,
                  readListCount: isInReadlist
                    ? (poem.readListCount || 1) - 1
                    : (poem.readListCount || 0) + 1,
                }
              : poem
          ),
          categoryPoems: Object.fromEntries(
            Object.entries(categoryPoems).map(([cat, poems]) => [
              cat,
              poems.map((poem) =>
                poem._id === poemId
                  ? {
                      ...poem,
                      readListCount: isInReadlist
                        ? (poem.readListCount || 1) - 1
                        : (poem.readListCount || 0) + 1,
                    }
                  : poem
              ),
            ])
          ),
        });
        toast.success(isInReadlist ? "Removed from reading list" : "Added to reading list", {
          description: `"${poemTitle}" has been ${isInReadlist ? "removed from" : "added to"} your reading list.`,
        });
      } else if (res.status === 401) {
        toast.error("Authentication required", {
          description: "Please sign in to manage your reading list.",
          action: {
            label: "Sign In",
            onClick: () => (window.location.href = "/api/auth/signin"),
          },
        });
      } else {
        throw new Error("Failed to update readlist");
      }
    } catch (err) {
      toast.error("Error", { description: "Failed to update reading list" });
    }
  },
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  setPoetSearchQuery: (query) => set({ poetSearchQuery: query }),
  setPoetFilters: (filters) =>
    set((state) => ({
      poetFilters: {
        cities: filters.cities ?? state.poetFilters.cities,
        letters: filters.letters ?? state.poetFilters.letters,
      },
    })),
  clearCache: () => cache.clear(),
}));
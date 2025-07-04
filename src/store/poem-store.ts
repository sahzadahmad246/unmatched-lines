// src/store/poem-store.ts
"use client";

import { create } from "zustand";
import { SerializedPoem } from "@/types/poemTypes";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PoemState {
  poems: SerializedPoem[];
  poem: SerializedPoem | null;
  poetWorks: Record<string, SerializedPoem[]>;
  pagination: Pagination | null;
  poetPagination: Record<string, Pagination>;
  loading: boolean;
  poetLoading: Record<string, boolean>;
  error: string | null;
  fetchPoems: (page?: number, limit?: number, category?: string) => Promise<void>;
  fetchPoemByIdOrSlug: (identifier: string) => Promise<void>;
  fetchPoetWorks: (
    poetSlug: string,
    category: string,
    page?: number,
    limit?: number,
    sortBy?: string
  ) => Promise<void>;
  createPoem: (data: FormData) => Promise<{ success: boolean; message?: string; poem?: SerializedPoem }>;
  updatePoem: (identifier: string, data: FormData) => Promise<{ success: boolean; message?: string; poem?: SerializedPoem }>;
  deletePoem: (identifier: string) => Promise<{ success: boolean; message?: string }>;
  bookmarkPoem: (
    poemId: string,
    userId: string,
    action: "add" | "remove"
  ) => Promise<{ success: boolean; message?: string; poem?: SerializedPoem }>;
  setPoems: (poems: SerializedPoem[]) => void;
  setPagination: (pagination: Pagination) => void;
  clearPoem: () => void;
  clearPoems: () => void;
}

export const usePoemStore = create<PoemState>((set) => ({
  poems: [],
  poem: null,
  poetWorks: {},
  pagination: null,
  poetPagination: {},
  loading: false,
  poetLoading: {},
  error: null,

  fetchPoems: async (page = 1, limit = 10, category = "all") => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/poems?page=${page}&limit=${limit}&category=${category}`);
      if (!response.ok) {
        throw new Error("Failed to fetch poems");
      }
      const { poems, pagination } = await response.json();
      set((state) => ({
        poems: page === 1 ? poems : [...state.poems, ...poems],
        pagination,
        loading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", loading: false });
    }
  },

  fetchPoemByIdOrSlug: async (identifier: string) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/poems/${identifier}`);
      if (!response.ok) {
        throw new Error("Failed to fetch poem");
      }
      const { poem } = await response.json();
      if (poem) {
        set({
          poem,
          loading: false,
        });
      } else {
        set({ error: "Poem not found", loading: false });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", loading: false });
    }
  },

  fetchPoetWorks: async (poetSlug: string, category: string, page = 1, limit = 3, sortBy = "recent") => {
    try {
      set((state) => ({
        poetLoading: { ...state.poetLoading, [poetSlug]: true },
        error: null,
      }));
      const response = await fetch(
        `/api/poet/${poetSlug}/works?category=${category}&page=${page}&limit=${limit}&sortBy=${sortBy}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch poet works (status: ${response.status})`);
      }
      const { poems, pagination } = await response.json();
      set((state) => ({
        poetWorks: {
          ...state.poetWorks,
          [poetSlug]: page === 1 ? poems : [...(state.poetWorks[poetSlug] || []), ...poems],
        },
        poetPagination: {
          ...state.poetPagination,
          [poetSlug]: pagination,
        },
        poetLoading: { ...state.poetLoading, [poetSlug]: false },
      }));
    } catch (error) {
      set((state) => ({
        error: error instanceof Error ? error.message : "Unknown error",
        poetLoading: { ...state.poetLoading, [poetSlug]: false },
      }));
    }
  },

  createPoem: async (data: FormData) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch("/api/poems", {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (response.ok) {
        const newPoem = result.poem;
        set((state) => ({
          poems: [newPoem, ...state.poems],
          loading: false,
        }));
        return { success: true, poem: newPoem };
      } else {
        set({ error: result.message || "Failed to create poem", loading: false });
        return { success: false, message: result.message || "Failed to create poem" };
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", loading: false });
      return { success: false, message: "An error occurred while creating poem" };
    }
  },

  updatePoem: async (identifier: string, data: FormData) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/poems/${identifier}/update`, {
        method: "PUT",
        body: data,
      });
      const result = await response.json();
      if (response.ok) {
        const updatedPoem = result.poem;
        set((state) => ({
          poems: state.poems.map((poem) => (poem._id === result.poem._id ? updatedPoem : poem)),
          poem: state.poem?._id === result.poem._id ? updatedPoem : state.poem,
          poetWorks: Object.keys(state.poetWorks).reduce(
            (acc, poetSlug) => ({
              ...acc,
              [poetSlug]: state.poetWorks[poetSlug].map((poem) =>
                poem._id === result.poem._id ? updatedPoem : poem
              ),
            }),
            {}
          ),
          loading: false,
        }));
        return { success: true, poem: updatedPoem };
      } else {
        set({ error: result.message || "Failed to update poem", loading: false });
        return { success: false, message: result.message || "Failed to update poem" };
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", loading: false });
      return { success: false, message: "An error occurred while updating poem" };
    }
  },

  deletePoem: async (identifier: string) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/poems/${identifier}/delete`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        set((state) => ({
          poems: state.poems.filter(
            (poem) =>
              poem._id !== identifier &&
              poem.slug.en !== identifier &&
              poem.slug.hi !== identifier &&
              poem.slug.ur !== identifier
          ),
          poem:
            state.poem?._id === identifier ||
            state.poem?.slug.en === identifier ||
            state.poem?.slug.hi === identifier ||
            state.poem?.slug.ur === identifier
              ? null
              : state.poem,
          poetWorks: Object.keys(state.poetWorks).reduce(
            (acc, poetSlug) => ({
              ...acc,
              [poetSlug]: state.poetWorks[poetSlug].filter(
                (poem) =>
                  poem._id !== identifier &&
                  poem.slug.en !== identifier &&
                  poem.slug.hi !== identifier &&
                  poem.slug.ur !== identifier
              ),
            }),
            {}
          ),
          loading: false,
        }));
        return { success: true };
      } else {
        set({ error: result.message || "Failed to delete poem", loading: false });
        return { success: false, message: result.message || "Failed to delete poem" };
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", loading: false });
      return { success: false, message: "An error occurred while deleting poem" };
    }
  },

  bookmarkPoem: async (poemId: string, userId: string, action: "add" | "remove") => {
    try {
      set({ loading: true, error: null });
      const response = await fetch("/api/poems/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poemId, userId, action }),
      });
      const result = await response.json();
      if (response.ok) {
        // Update local state with the returned poem data
        set((state) => ({
          poems: state.poems.map((poem) =>
            poem._id === poemId
              ? { ...poem, bookmarks: result.poem.bookmarks, bookmarkCount: result.poem.bookmarkCount }
              : poem
          ),
          poem: state.poem?._id === poemId
            ? { ...state.poem, bookmarks: result.poem.bookmarks, bookmarkCount: result.poem.bookmarkCount }
            : state.poem,
          poetWorks: Object.keys(state.poetWorks).reduce(
            (acc, poetSlug) => ({
              ...acc,
              [poetSlug]: state.poetWorks[poetSlug].map((poem) =>
                poem._id === poemId
                  ? { ...poem, bookmarks: result.poem.bookmarks, bookmarkCount: result.poem.bookmarkCount }
                  : poem
              ),
            }),
            {}
          ),
          loading: false,
        }));
        return { success: true, poem: result.poem };
      } else {
        set({ error: result.message || `Failed to ${action} bookmark`, loading: false });
        return { success: false, message: result.message || `Failed to ${action} bookmark` };
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Unknown error", loading: false });
      return {
        success: false,
        message: `An error occurred while ${action === "add" ? "bookmarking" : "unbookmarking"} poem`,
      };
    }
  },

  setPoems: (poems: SerializedPoem[]) => set({ poems }),
  setPagination: (pagination: Pagination) => set({ pagination }),
  clearPoem: () => set({ poem: null, error: null, loading: false }),
  clearPoems: () => set({ poems: [], poetWorks: {}, pagination: null, poetPagination: {}, error: null, loading: false }),
}));
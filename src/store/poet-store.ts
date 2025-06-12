// /store/poet-store.ts
"use client";

import { create } from "zustand";
import { IPoet } from "@/types/userTypes";

interface PoetState {
  poet: IPoet | null;
  poets: IPoet[];
  loading: boolean;
  error: string | null;
  fetchPoetByIdentifier: (identifier: string) => Promise<void>;
  fetchAllPoets: (page?: number, limit?: number) => Promise<void>;
  searchPoets: (query: string, page?: number, limit?: number) => Promise<void>;
}

export const usePoetStore = create<PoetState>((set) => ({
  poet: null,
  poets: [],
  loading: false,
  error: null,

  fetchPoetByIdentifier: async (identifier: string) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/poets/${identifier}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch poet: ${response.status}`);
      }
      const poet = await response.json();
      if (poet) {
        set({
          poet: { ...poet, _id: poet._id.toString() },
          loading: false,
        });
      } else {
        set({ error: "Poet not found", loading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch poet";
      set({ error: errorMessage, loading: false });
    }
  },

  fetchAllPoets: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`/api/poets?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch poets: ${response.status}`);
      }
      const { poets } = await response.json();
      set({
        poets: poets.map((poet: IPoet) => ({
          ...poet,
          _id: poet._id.toString(),
        })),
        loading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch poets";
      set({ error: errorMessage, loading: false });
    }
  },

  searchPoets: async (query: string, page = 1, limit = 10) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(
        `/api/search?type=poet&query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error(`Failed to search poets: ${response.status}`);
      }
      const { users } = await response.json();
      set({
        poets: users.results.map((poet: IPoet) => ({
          ...poet,
          _id: poet._id.toString(),
        })),
        loading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to search poets";
      set({ error: errorMessage, loading: false });
    }
  },
}));
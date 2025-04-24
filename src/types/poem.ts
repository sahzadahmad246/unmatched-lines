// src/types/poem.ts
export interface Poem {
  _id: string;
  title: { en: string; hi?: string; ur?: string };
  author: { name: string; _id: string };
  category: string;
  content?: {
    en?: { verse: string; meaning: string }[];
    hi?: { verse: string; meaning: string }[];
    ur?: { verse: string; meaning: string }[];
  };
  summary?: { en: string; hi?: string; ur?: string };
  didYouKnow?: { en: string; hi?: string; ur?: string };
  faqs?: { question: { en: string; hi?: string; ur?: string }; answer: { en: string; hi?: string; ur?: string } }[];
  viewsCount: number;
  readListCount: number;
  createdAt?: string;
  slug: { en: string; hi?: string; ur?: string };
  tags?: string[];
  categories?: string[];
  coverImage?: string;
}

export interface Author {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  bio?: string;
}

export interface CoverImage {
  _id: string;
  url: string;
  uploadedBy: { name: string };
  createdAt: string;
}

export interface Poet {
  _id: string;
  name: string;
  bio?: string;
  image?: string;
  dob?: string;
  city?: string;
  ghazalCount?: number;
  sherCount?: number;
  otherCount?: number;
  createdAt: string;
  updatedAt: string;
  slug: string;
  followerCount: number;
  followers: { userId: string }[]; // Always an array
  topContent: {
    poem: { contentId: Poem; rank: number }[];
    ghazal: { contentId: Poem; rank: number }[];
    sher: { contentId: Poem; rank: number }[];
    nazm: { contentId: Poem; rank: number }[];
    rubai: { contentId: Poem; rank: number }[];
    marsiya: { contentId: Poem; rank: number }[];
    qataa: { contentId: Poem; rank: number }[];
    other: { contentId: Poem; rank: number }[];
  };
}
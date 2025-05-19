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
  updatedAt?: string;
  status?: "draft" | "published";
  slug: { en: string; hi?: string; ur?: string };
  tags?: string[];
  categories?: string[];
  coverImage?: string;
}

export interface StructuredData {
  "@context": string;
  "@type": string;
  name: string;
  author: {
    "@type": string;
    name: string;
    url?: string;
  };
  description: string;
  inLanguage: string;
  url: string;
  image: {
    "@type": string;
    url: string;
    name: string;
  };
  keywords: string;
  datePublished?: string;
  dateModified?: string;
  genre: string;
  interactionCount?: string[];
  breadcrumb: {
    "@type": string;
    itemListElement: {
      "@type": string;
      position: number;
      name: string;
      item: string;
    }[];
  };
  mainEntity?: {
    "@type": "FAQPage";
    mainEntity: {
      "@type": "Question";
      name: string;
      acceptedAnswer: {
        "@type": "Answer";
        text: string;
      };
    }[];
  };
}

export interface Author {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  bio?: string;
}

export interface Poet {
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
// src/types/userTypes.ts
import { Types } from "mongoose"; // Import Types from Mongoose

// IPoet interface (updated to include articles and articleCount)
export interface IPoet {
  _id: string;
  email: string;
  name: string;
  slug: string;
  profilePicture?: {
    publicId?: string;
    url?: string;
  };
  role: "poet";
  bio?: string;
  dob?: string;
  location?: string;
  poems: { poemId: string }[];
  poemCount: number;
  // NEW: Articles authored by this poet
  articles: { articleId: string }[];
  articleCount: number; // NEW
  bookmarks: {
    poemId: string;
    bookmarkedAt: string | null;
    poem?: {
      firstCouplet: string;
      slug: string;
      viewsCount: number;
      poetName: string;
    } | null;
  }[];
  // NEW: Bookmarked Articles by this poet
  bookmarkedArticles: {
    articleId: string;
    bookmarkedAt: string | null;
    article?: {
      title: string;
      slug: string;
      viewsCount: number;
      authorName: string; // Assuming you'd populate author for display
    } | null;
  }[];
  // NEW: Total bookmarks on articles written by this poet
  totalBookmarksOnArticles?: number;
  // NEW: Total views on articles written by this poet
  totalViewsOnArticles?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPoemPopulated {
  _id: string;
  content: {
    en: { couplet: string; meaning?: string }[];
  };
  slug: {
    en: string;
  };
  viewsCount: number;
  poet: {
    name: string;
  };
}

// IUser interface (updated to include articles, articleCount, and bookmarkedArticles)
export interface IUser {
  _id: string;
  googleId?: string;
  email: string;
  name: string;
  slug: string;
  profilePicture?: {
    publicId?: string;
    url?: string;
  };
  role: "user" | "poet" | "admin";
  bio?: string;
  dob?: string | Date;
  location?: string;
  poems: { poemId: Types.ObjectId }[]; // Changed to Types.ObjectId for consistency with Mongoose Schema
  poemCount: number;
  bookmarks: {
    poemId: Types.ObjectId; // Changed to Types.ObjectId
    bookmarkedAt: Date | null; // Changed to Date | null
    poem?: {
      firstCouplet: string;
      slug: string;
      viewsCount: number;
      poetName: string;
    } | null;
  }[];
  // NEW: Articles authored by this user
  articles: { articleId: Types.ObjectId }[]; // Changed to Types.ObjectId
  articleCount: number; // NEW
  // NEW: Bookmarked Articles by this user
  bookmarkedArticles: {
    articleId: Types.ObjectId; // Changed to Types.ObjectId
    bookmarkedAt: Date | null; // Changed to Date | null
    article?: { // Optional populated article data for client-side use
      title: string;
      slug: string;
      viewsCount: number;
      authorName: string; // Add if you plan to populate this info
    } | null;
  }[];
  createdAt: string;
  updatedAt: string;
}

export type Role = "user" | "poet" | "admin";
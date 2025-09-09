import { Document, Types } from "mongoose";

export interface IArticle extends Document {
  _id: string;
  title: string;
  content: string;
  couplets?: {
    en?: string;
    hi?: string;
    ur?: string;
  }[];
  summary?: string;
  poet: Types.ObjectId;
  bookmarks?: {
    userId: Types.ObjectId;
    bookmarkedAt?: Date;
  }[];
  bookmarkCount: number;
  slug: string;
  coverImage?: {
    publicId?: string;
    url?: string;
  };
  category?: string[];
  tags?: string[];
  status?: "draft" | "published";
  metaDescription?: string;
  metaKeywords?: string;
  viewsCount: number;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Type for transformed article data in API responses
export interface TransformedArticle {
  _id: string;
  title: string;
  couplets?: [
    {
      en?: string;
      hi?: string;
      ur?: string;
    }
  ]
  firstCoupletEn: string;
  poet: {
    _id: string;
    name: string;
    profilePicture?: string | null;
  };
  slug: string;
  bookmarkCount: number;
  viewsCount: number;
  category: string[];
  coverImage: string | null;
  status?: "draft" | "published";
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  isBookmarked?: boolean;
}
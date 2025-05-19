// src/types/author.ts
export interface Author {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  bio?: string;
  dob?: string;
  city?: string;
  
  ghazalCount: number;
  sherCount: number;
  otherCount: number;
  followerCount: number;
  followers: Array<{
    id: string;
    name: string;
    image?: string;
    followedAt: string;
  }>;
  poems?: Array<{
    poemId: {
      _id: string;
      title: { en: string };
      category: string;
    };
  }>;
}
interface ProfilePicture {
  url: string;
  publicId?: string;
  alt?: string;
}

export interface Poet {
  _id: string;
  name: string;
  role?: string;
  profilePicture?: ProfilePicture;
  slug?: string;
}

export interface ContentItem {
  couplet: string;
  meaning?: string;
  _id?: string;
}

export interface Bookmark {
  userId: string;
  bookmarkedAt: Date;
}

export interface FAQ {
  question: { en?: string; hi?: string; ur?: string };
  answer: { en?: string; hi?: string; ur?: string };
  _id?: string;
}

export interface IPoem {
  _id: string;
  title: {
    en: string;
    hi: string;
    ur: string;
  };
  content: {
    en: ContentItem[];
    hi: ContentItem[];
    ur: ContentItem[];
  };
  poet: Poet | null;
  bookmarks: Bookmark[];
  bookmarkCount: number;
  coverImage?: {
    publicId: string;
    url: string;
  };
  topics: string[];
  category:
    | "poem"
    | "ghazal"
    | "sher"
    | "nazm"
    | "rubai"
    | "marsiya"
    | "qataa"
    | "other";
  status: "draft" | "published";
  slug: {
    en: string;
    hi: string;
    ur: string;
  };
  summary: {
    en?: string;
    hi?: string;
    ur?: string;
  };
  didYouKnow: {
    en?: string;
    hi?: string;
    ur?: string;
  };
  faqs: FAQ[];
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedPoem extends Omit<IPoem, 'createdAt' | 'updatedAt' | 'bookmarks'> {
  createdAt: string;
  updatedAt: string;
  bookmarks: { userId: string; bookmarkedAt: string }[];
  bookmarkedAt?: string | null;
  content: {
    en: Array<ContentItem & { _id?: string }>;
    hi: Array<ContentItem & { _id?: string }>;
    ur: Array<ContentItem & { _id?: string }>;
  };
  faqs: Array<FAQ & { _id?: string }>;
  coverImageAlt?: string;
}

export interface FeedItem {
  id: string;
  poemId: string;
  poet: {
    name: string;
    profilePicture?: {
      publicId?: string;
      url?: string;
    };
    slug: string;
  };
  language: string;
  slug: string;
  couplet: string;
  coverImage?: {
    publicId: string;
    url: string;
  } | null;
  viewsCount: number;
  bookmarkCount: number;
  topics: string[];
  category?: string;
  createdAt?: Date;
}
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
export interface Poem {
  _id: string
  title: { en: string; hi?: string; ur?: string }
  author: { name: string; _id: string }
  category: string
  content?: {
    en?: string[]
    hi?: string[]
    ur?: string[]
  }
  createdAt?: string
  slug: { en: string; hi?: string; ur?: string }[] | { en: string; hi?: string; ur?: string }
  readListCount: number
  tags?: string[]
  categories?: string[]
  coverImage?: string;
}
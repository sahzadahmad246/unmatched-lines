import { Poem } from "@/types/poem";

export function getSlugs(poem: Poem | null, fallbackSlug: string) {
  if (!poem?.slug) {
    return { en: fallbackSlug, hi: fallbackSlug, ur: fallbackSlug };
  }

  if (Array.isArray(poem.slug)) {
    return {
      en: poem.slug.find(s => s.en)?.en || fallbackSlug,
      hi: poem.slug.find(s => s.hi)?.hi || fallbackSlug,
      ur: poem.slug.find(s => s.ur)?.ur || fallbackSlug,
    };
  }

  return {
    en: poem.slug.en || fallbackSlug,
    hi: poem.slug.hi || fallbackSlug,
    ur: poem.slug.ur || fallbackSlug,
  };
}
// src/lib/clientUtils/slugifyClient.ts

export function generateSlugFromTitle(title: string): string {
  if (!title) {
    return "";
  }
  // Convert to lowercase, remove non-alphanumeric characters (except hyphens and spaces)
  // trim whitespace, replace multiple spaces/hyphens with a single hyphen
  // and remove leading/trailing hyphens.
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .trim() // Trim leading/trailing whitespace
    .replace(/\s+/g, "-") // Replace spaces with single hyphens
    .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen

  return slug;
}

export async function generateUniqueSlug(title: string, currentSlug?: string): Promise<string> {
  const baseSlug = generateSlugFromTitle(title);
  if (!baseSlug) return "";

  // If we're editing and the slug hasn't changed, return the current slug
  if (currentSlug && baseSlug === currentSlug) {
    return currentSlug;
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    try {
      const response = await fetch(`/api/articles/check-slug?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();
      
      if (!data.exists) {
        return slug;
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    } catch (error) {
      console.error("Error checking slug uniqueness:", error);
      // If there's an error, return the base slug with a timestamp to ensure uniqueness
      return `${baseSlug}-${Date.now()}`;
    }
  }
}
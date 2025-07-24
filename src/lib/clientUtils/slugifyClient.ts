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
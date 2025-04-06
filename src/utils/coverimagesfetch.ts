// src/utils/api.ts (optional shared file)
export async function fetchCoverImages(): Promise<{ url: string }[]> {
    try {
      const res = await fetch(`${process.env.NEXTAUTH_URL}/api/cover-images`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch cover images");
      const data = await res.json();
      return data.coverImages || [];
    } catch (error) {
      console.error("Error fetching cover images:", error);
      return [];
    }
  }
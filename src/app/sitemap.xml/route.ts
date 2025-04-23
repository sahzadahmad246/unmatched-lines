import dbConnect from "@/lib/mongodb";
import Poem from "@/models/Poem";
import { NextRequest } from "next/server";
import mongoose from "mongoose";

// Tell Next.js to render this route dynamically at request time
export const dynamic = 'force-dynamic';

// Define interface for sitemap entries
interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFreq: string;
  priority: number;
}

export async function GET(request: NextRequest) {
  // Define baseUrl at the top scope to avoid "Cannot find name 'baseUrl'" error
  const baseUrl =
    process.env.NEXTAUTH_URL ||
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://unmatchedlines.com");

  try {
    // Connect to MongoDB
    await dbConnect().catch((error) => {
      console.error("MongoDB connection error:", error);
      throw new Error("Failed to connect to database");
    });

    // Fetch poems
    let poemEntries: SitemapEntry[] = [];
    try {
      const poems = await Poem.find({ status: "published" }).lean();
      poemEntries = poems.flatMap((poem: any) => {
        // Handle slug safely
        const slugs = poem.slug
          ? Array.isArray(poem.slug)
            ? {
                en: poem.slug.find((s: any) => s.en)?.en || poem.slug[0]?.en || "",
                hi: poem.slug.find((s: any) => s.hi)?.hi || poem.slug[0]?.en || "",
                ur: poem.slug.find((s: any) => s.ur)?.ur || poem.slug[0]?.en || "",
              }
            : {
                en: poem.slug.en || "",
                hi: poem.slug.hi || "",
                ur: poem.slug.ur || "",
              }
          : { en: "", hi: "", ur: "" };

        const lastModified = poem.updatedAt
          ? new Date(poem.updatedAt).toISOString()
          : new Date().toISOString();
        const priority = poem.status === "published" ? 0.8 : 0.6;

        return [
          {
            url: slugs.en ? `${baseUrl}/poems/en/${slugs.en}` : "",
            lastModified,
            changeFreq: "daily",
            priority,
          },
          {
            url: slugs.hi ? `${baseUrl}/poems/hi/${slugs.hi}` : "",
            lastModified,
            changeFreq: "daily",
            priority,
          },
          {
            url: slugs.ur ? `${baseUrl}/poems/ur/${slugs.ur}` : "",
            lastModified,
            changeFreq: "daily",
            priority,
          },
        ].filter((entry: SitemapEntry) => entry.url && entry.url !== `${baseUrl}/poems/en/`);
      });
    } catch (error) {
      console.error("Error fetching poems:", error);
    }

    // Fetch poets directly from the database instead of using API
    let poetEntries: SitemapEntry[] = [];
    try {
      const Author = mongoose.models.Author || 
        mongoose.model('Author', new mongoose.Schema({
          name: String,
          slug: String,
          updatedAt: Date
        }));
        
      const authors = await Author.find().lean();
      poetEntries = authors
        .map((author: any) => ({
          url: author.slug ? `${baseUrl}/poets/${author.slug}` : "",
          lastModified: author.updatedAt
            ? new Date(author.updatedAt).toISOString()
            : new Date().toISOString(),
          changeFreq: "daily",
          priority: 0.7,
        }))
        .filter((entry: SitemapEntry) => entry.url);
    } catch (error) {
      console.error("Error fetching poets from database:", error);
    }

    // Fetch categories directly from the database
    let categoryEntries: SitemapEntry[] = [];
    try {
      const categories = await Poem.distinct("category")
        .exec()
        .then((cats) => cats.filter(Boolean).map((cat: string) => cat.toLowerCase()));
      
      categoryEntries = categories
        .map((category: string) => ({
          url: category ? `${baseUrl}/${category}` : "", // Fixed: Removed /category/
          lastModified: new Date().toISOString(),
          changeFreq: "daily",
          priority: 0.6,
        }))
        .filter((entry: SitemapEntry) => entry.url);
    } catch (dbError) {
      console.error("Error fetching categories from database:", dbError);
    }

    // Static pages
    const staticEntries: SitemapEntry[] = [
      { url: `${baseUrl}/`, lastModified: new Date().toISOString(), changeFreq: "weekly", priority: 1.0 },
      { url: `${baseUrl}/library`, lastModified: new Date().toISOString(), changeFreq: "daily", priority: 0.9 },
      { url: `${baseUrl}/about`, lastModified: new Date().toISOString(), changeFreq: "monthly", priority: 0.5 },
      { url: `${baseUrl}/contact`, lastModified: new Date().toISOString(), changeFreq: "monthly", priority: 0.5 },
    ];

    // Combine all URLs
    const allUrls: SitemapEntry[] = [...staticEntries, ...poemEntries, ...poetEntries, ...categoryEntries];

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (entry: SitemapEntry) => `<url>
  <loc>${entry.url}</loc>
  <lastmod>${entry.lastModified}</lastmod>
  <changefreq>${entry.changeFreq}</changefreq>
  <priority>${entry.priority}</priority>
</url>`
  )
  .join("\n")}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        "Content-Type": "application/xml",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    // Return a minimal sitemap to avoid complete failure
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    return new Response(fallbackSitemap, {
      headers: { "Content-Type": "application/xml" },
      status: 500,
    });
  }
}
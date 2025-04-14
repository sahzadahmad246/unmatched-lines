import dbConnect from "@/lib/mongodb";
import Poem from "@/models/Poem";

export async function GET() {
  await dbConnect();

  const baseUrl = process.env.NEXTAUTH_URL || "https://unmatchedlines.com";

  const poems = await Poem.find({ status: "published" }).lean();

  const sitemapEntries = poems.flatMap((poem: any) => {
    const slugs = Array.isArray(poem.slug)
      ? {
          en: poem.slug.find((s: any) => s.en)?.en || poem.slug[0].en,
          hi: poem.slug.find((s: any) => s.hi)?.hi || poem.slug[0].en,
          ur: poem.slug.find((s: any) => s.ur)?.ur || poem.slug[0].en,
        }
      : {
          en: poem.slug.en || "",
          hi: poem.slug.hi || "",
          ur: poem.slug.ur || "",
        };

    const lastModified = poem.updatedAt ? poem.updatedAt.toISOString() : new Date().toISOString();
    const priority = poem.status === "published" ? 0.8 : 0.6;

    return [
      {
        url: `${baseUrl}/poems/en/${slugs.en}`,
        lastModified,
        priority,
      },
      {
        url: `${baseUrl}/poems/hi/${slugs.hi}`,
        lastModified,
        priority,
      },
      {
        url: `${baseUrl}/poems/ur/${slugs.ur}`,
        lastModified,
        priority,
      },
    ];
  });

  const allUrls = [
    { url: baseUrl, lastModified: new Date().toISOString(), priority: 1.0 },
    ...sitemapEntries,
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    ({ url, lastModified, priority }) => `<url>
  <loc>${url}</loc>
  <lastmod>${lastModified}</lastmod>
  <changefreq>weekly</changefreq>
  <priority>${priority}</priority>
</url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

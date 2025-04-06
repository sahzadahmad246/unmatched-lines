import dbConnect from "@/lib/mongodb";
import Poem from "@/models/Poem";

export async function GET() {
  await dbConnect();

  const baseUrl = process.env.NEXTAUTH_URL || "https://unmatched-lines.vercel.app";

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

    return [
      `${baseUrl}/poems/en/${slugs.en}`,
      `${baseUrl}/poems/hi/${slugs.hi}`,
      `${baseUrl}/poems/ur/${slugs.ur}`,
    ];
  });

  const allUrls = [baseUrl, ...sitemapEntries];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (url) => `<url>
  <loc>${url}</loc>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
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

export async function GET() {
  const content = `
User-agent: *
Allow: /

Sitemap: https://unmatched-lines.vercel.app/sitemap.xml
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

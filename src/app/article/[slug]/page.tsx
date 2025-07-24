import { notFound } from "next/navigation";
import Head from "next/head";
import { getServerSession } from "next-auth/next";
import dbConnect from "@/lib/mongodb";
import Article from "@/models/Article";
import { authOptions } from "@/lib/auth/authOptions";
import { ArticleDetail } from "@/components/articles/article-detail";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://unmatchedlines.com";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params; // Await the params promise
  await dbConnect();
  const article = await Article.findOne({ slug })
    .select("title summary metaDescription metaKeywords tags poet coverImage publishedAt updatedAt slug")
    .populate<{ poet: { _id: string; name: string; profilePicture?: { url?: string } | null } }>("poet", "name")
    .lean();

  if (!article) {
    return {
      title: "Article Not Found | Unmatched Lines",
      description: "The requested article could not be found.",
    };
  }

  const imageUrl = article.coverImage?.url?.startsWith("http")
    ? article.coverImage.url
    : `${BASE_URL}${article.coverImage?.url || "/default-og-image.jpg"}`;

  return {
    title: `${article.title} by ${article.poet?.name || "Unknown Poet"}`,
    description: article.metaDescription || article.summary || "Read this amazing article on Unmatched Lines.",
    keywords: article.metaKeywords || article.tags?.join(", ") || "",
    authors: [{ name: article.poet?.name || "Unknown" }],
    openGraph: {
      type: "article",
      title: article.title,
      description: article.metaDescription || article.summary || "Read this amazing article on Unmatched Lines.",
      images: [imageUrl],
      url: `${BASE_URL}/article/${article.slug}`,
      siteName: "Unmatched Lines",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.metaDescription || article.summary || "Read this amazing article on Unmatched Lines.",
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params; // Await the params promise
  await dbConnect();
  const session = await getServerSession(authOptions);

  const article = await Article.findOne({ slug })
    .select(
      "title content couplets summary poet slug coverImage category tags bookmarkCount viewsCount metaDescription metaKeywords status publishedAt createdAt updatedAt bookmarks"
    )
    .populate<{ poet: { _id: string; name: string; profilePicture?: { url?: string } | null } }>(
      "poet",
      "name profilePicture"
    )
    .lean();

  if (!article) {
    notFound();
  }

  await Article.updateOne({ _id: article._id }, { $inc: { viewsCount: 1 } });

  let isBookmarked = false;
  if (session?.user?.id) {
    isBookmarked = !!article.bookmarks?.find(
      (bookmark) => bookmark.userId.toString() === session.user.id
    );
  }

  const imageUrl = article.coverImage?.url?.startsWith("http")
    ? article.coverImage.url
    : `${BASE_URL}${article.coverImage?.url || "/default-og-image.jpg"}`;

  const transformedArticle = {
    _id: article._id.toString(),
    title: article.title,
    content: article.content,
    couplets: article.couplets || [],
    summary: article.summary || "",
    poet: {
      _id: article.poet?._id.toString() || "",
      name: article.poet?.name || "Unknown",
      profilePicture: article.poet?.profilePicture?.url || null,
    },
    slug: article.slug,
    coverImage: imageUrl,
    category: article.category || [],
    tags: article.tags || [],
    bookmarkCount: article.bookmarkCount,
    viewsCount: article.viewsCount + 1,
    metaDescription: article.metaDescription || "",
    metaKeywords: article.metaKeywords || "",
    status: article.status || "published",
    publishedAt: article.publishedAt?.toISOString() || "",
    createdAt: article.createdAt?.toISOString() || "",
    updatedAt: article.updatedAt?.toISOString() || "",
    isBookmarked,
  };

  return (
    <>
      <Head>
        {/* Canonical tag */}
        <link
          rel="canonical"
          href={`${BASE_URL}/article/${article.slug}`}
        />
        <meta name="robots" content="index, follow" />
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: article.title,
              description: article.metaDescription || article.summary || "",
              author: {
                "@type": "Person",
                name: article.poet?.name || "Unknown",
              },
              datePublished: article.publishedAt?.toISOString(),
              dateModified: article.updatedAt?.toISOString(),
              image: imageUrl,
              publisher: {
                "@type": "Organization",
                name: "Unmatched Lines",
                logo: {
                  "@type": "ImageObject",
                  url: `${BASE_URL}/your-logo.png`,
                },
              },
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `${BASE_URL}/article/${article.slug}`,
              },
              keywords: article.metaKeywords || article.tags?.join(", "),
            }),
          }}
        />
      </Head>
      <main>
        <ArticleDetail article={transformedArticle} />
      </main>
    </>
  );
}
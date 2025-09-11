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
    .populate<{ poet: { _id: string; name: string; slug: string; profilePicture?: { url?: string } | null } }>("poet", "name slug")
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

  const description = article.metaDescription || article.summary || `Read "${article.title}" by ${article.poet?.name || "Unknown Poet"} on Unmatched Lines. Discover beautiful poetry and literary works.`;
  const keywords = article.metaKeywords || article.tags?.join(", ") || `${article.title}, ${article.poet?.name}, poetry, literature, urdu poetry, hindi poetry, english poetry`;

  return {
    title: `${article.title} by ${article.poet?.name || "Unknown Poet"} | Unmatched Lines`,
    description: description,
    keywords: keywords,
    authors: [{ name: article.poet?.name || "Unknown" }],
    openGraph: {
      type: "article",
      title: `${article.title} by ${article.poet?.name || "Unknown Poet"}`,
      description: description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${article.title} by ${article.poet?.name || "Unknown Poet"}`,
        }
      ],
      url: `${BASE_URL}/article/${article.slug}`,
      siteName: "Unmatched Lines",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${article.title} by ${article.poet?.name || "Unknown Poet"}`,
      description: description,
      images: [imageUrl],
      creator: "@unmatchedlines",
      site: "@unmatchedlines",
    },
    alternates: {
      canonical: `${BASE_URL}/article/${article.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params; // Await the params promise
  await dbConnect();
  const session = await getServerSession(authOptions);

  const article = await Article.findOne({ slug })
    .select(
      "title content couplets summary poet slug coverImage category tags bookmarkCount likeCount viewsCount metaDescription metaKeywords status publishedAt createdAt updatedAt bookmarks"
    )
    .populate<{ poet: { _id: string; name: string; slug: string; profilePicture?: { url?: string } | null } }>(
      "poet",
      "name slug profilePicture"
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
    couplets: (article.couplets || []).map(couplet => ({
      en: couplet.en || "",
      hi: couplet.hi || "",
      ur: couplet.ur || ""
    })),
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
    likeCount: article.likeCount || 0,
    viewsCount: article.viewsCount + 1,
    metaDescription: article.metaDescription || "",
    metaKeywords: article.metaKeywords || "",
    status: article.status || "published",
    publishedAt: article.publishedAt?.toISOString() || "",
    createdAt: article.createdAt?.toISOString() || "",
    updatedAt: article.updatedAt?.toISOString() || "",
    isBookmarked,
    isLiked: false, // Will be checked client-side
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
              image: {
                "@type": "ImageObject",
                url: imageUrl,
                width: 1200,
                height: 630,
              },
              author: {
                "@type": "Person",
                name: article.poet?.name || "Unknown",
                url: `${BASE_URL}/poet/${article.poet?.slug || ""}`,
              },
              publisher: {
                "@type": "Organization",
                name: "Unmatched Lines",
                url: BASE_URL,
                logo: {
                  "@type": "ImageObject",
                  url: `${BASE_URL}/logo.png`,
                  width: 200,
                  height: 200,
                },
              },
              datePublished: article.publishedAt?.toISOString() || "",
              dateModified: article.updatedAt?.toISOString() || "",
              mainEntityOfPage: {
                "@type": "WebPage",
                "@id": `${BASE_URL}/article/${article.slug}`,
              },
              articleSection: article.category?.join(", ") || "Poetry",
              keywords: article.tags?.join(", ") || "",
              wordCount: article.content?.length || 0,
              inLanguage: ["en", "hi", "ur"],
              isPartOf: {
                "@type": "WebSite",
                name: "Unmatched Lines",
                url: BASE_URL,
              },
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
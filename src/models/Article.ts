import mongoose, { Schema, model, Model, Document } from "mongoose";
import sanitizeHtml from "sanitize-html";
import { IArticle } from "@/types/articleTypes";

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },

    content: { type: String, required: true },

    couplets: [
      {
        en: { type: String, default: "" },
        hi: { type: String, default: "" },
        ur: { type: String, default: "" },
      },
    ],

    summary: { type: String, default: "" },

    poet: { type: Schema.Types.ObjectId, ref: "User", required: true },

    bookmarks: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        bookmarkedAt: { type: Date, default: Date.now },
      },
    ],
    bookmarkCount: { type: Number, default: 0 },

    slug: { type: String, required: true, unique: true },

    coverImage: {
      publicId: { type: String },
      url: { type: String },
    },

    category: [{ type: String, trim: true }], // Changed from 'categories' to 'category'

    tags: [{ type: String, trim: true }],

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },

    publishedAt: { type: Date, default: Date.now }, // Added publishedAt field

    metaDescription: { type: String, default: "" },
    metaKeywords: { type: String, default: "" },

    viewsCount: { type: Number, default: 0 },
  },
  { timestamps: true } // 
);

// Pre-save Hook for Sanitization and count updates
ArticleSchema.pre("save", function (this: Document & IArticle, next) {
  if (this.title) this.title = sanitizeHtml(this.title);
  if (this.summary) this.summary = sanitizeHtml(this.summary);
  if (this.slug) this.slug = sanitizeHtml(this.slug);
  if (this.metaDescription) this.metaDescription = sanitizeHtml(this.metaDescription);
  if (this.metaKeywords) this.metaKeywords = sanitizeHtml(this.metaKeywords);

  const sanitizeContentConfig = {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      "h1", "h2", "h3", "h4", "h5", "h6", "p", "a", "ul", "ol", "li",
      "strong", "em", "blockquote", "code", "pre", "img", "br",
      "table", "thead", "tbody", "tr", "th", "td",
    ]),
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
    },
  };

  if (this.content)
    this.content = sanitizeHtml(this.content, sanitizeContentConfig);

  this.couplets?.forEach((coupletItem) => {
    if (coupletItem.en) coupletItem.en = sanitizeHtml(coupletItem.en);
    if (coupletItem.hi) coupletItem.hi = sanitizeHtml(coupletItem.hi);
    if (coupletItem.ur) coupletItem.ur = sanitizeHtml(coupletItem.ur);
  });

  if (this.category) // Updated from 'categories' to 'category'
    this.category = this.category.map((cat) => sanitizeHtml(cat));
  if (this.tags) this.tags = this.tags.map((tag) => sanitizeHtml(tag));

  if (this.coverImage?.url)
    this.coverImage.url = sanitizeHtml(this.coverImage.url);
  if (this.coverImage?.publicId)
    this.coverImage.publicId = sanitizeHtml(this.coverImage.publicId);

  this.bookmarkCount = this.bookmarks?.length || 0;
  this.viewsCount = this.viewsCount || 0;

  next();
});

const Article: Model<IArticle> = mongoose.models.Article || model<IArticle>("Article", ArticleSchema);

export default Article;
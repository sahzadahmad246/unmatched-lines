// src/models/User.ts
import mongoose, { Schema, model, Model, } from "mongoose";
import sanitizeHtml from "sanitize-html";
import { IUser } from "@/types/userTypes";
import { slugifyUser } from "@/lib/slugify";

const UserSchema = new Schema<IUser>(
  {
    googleId: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, maxlength: [100, "Name cannot exceed 100 characters"] },
    slug: { type: String, unique: true, trim: true, required: true },
    profilePicture: {
      publicId: { type: String },
      url: { type: String },
    },
    role: { type: String, enum: ["user", "poet", "admin"], default: "user" },
    bio: { type: String, trim: true, maxlength: [500, "Bio cannot exceed 500 characters"] },
    dob: { type: Date },
    location: { type: String, trim: true, maxlength: [100, "Location cannot exceed 100 characters"] },
    
    // Poems authored by this user (if role is 'poet')
    poems: { type: [{ poemId: { type: Schema.Types.ObjectId, ref: "Poem" } }], default: [] },
    poemCount: { type: Number, default: 0 },

    // Bookmarked Poems by this user
    bookmarks: {
      type: [{ poemId: { type: Schema.Types.ObjectId, ref: "Poem", required: true }, bookmarkedAt: { type: Date, default: Date.now } }],
      default: [],
    },

    // NEW: Articles authored by this user (if role is 'poet' or 'admin')
    articles: { type: [{ articleId: { type: Schema.Types.ObjectId, ref: "Article" } }], default: [] },
    articleCount: { type: Number, default: 0 }, // NEW: Counter for articles

    // NEW: Bookmarked Articles by this user
    bookmarkedArticles: {
      type: [{ articleId: { type: Schema.Types.ObjectId, ref: "Article", required: true }, bookmarkedAt: { type: Date, default: Date.now } }],
      default: [],
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  try {
    if (this.bio) this.bio = sanitizeHtml(this.bio);
    if (this.location) this.location = sanitizeHtml(this.location);
    
    this.poemCount = this.poems?.length || 0;
    // NEW: Update articleCount
    this.articleCount = this.articles?.length || 0;

    // Clear poems/articles if role is not 'poet' or 'admin'
    if (this.role !== "poet" && this.role !== "admin") { // Changed condition to include admin for articles
      this.poems = [];
      this.poemCount = 0;
      // NEW: Clear articles if not poet or admin
      this.articles = [];
      this.articleCount = 0;
    }


    if (!this.slug || this.isNew || this.isModified("name")) {
      const baseSlug = slugifyUser(this.name || "unknown");
      let slug = baseSlug;
      let counter = 1;
      while (await mongoose.models.User.findOne({ slug, _id: { $ne: this._id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      this.slug = slug;
    }
    next();
  } catch (error) {
    next(error as Error);
  }
});

const User: Model<IUser> = mongoose.models.User || model<IUser>("User", UserSchema);
export default User;
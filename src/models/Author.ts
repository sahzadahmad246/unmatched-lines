import mongoose, { Schema, model, Model } from "mongoose";

// Define interface for Author
export interface IAuthor {
  name: string;
  slug: string;
  image?: string;
  bio?: string;
  dob?: Date;
  city?: string;
  sherCount: number;
  ghazalCount: number;
  otherCount: number;
  poems: Array<{ poemId: mongoose.Types.ObjectId }>;
  followers: Array<{ userId: mongoose.Types.ObjectId; followedAt: Date }>;
  followerCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const AuthorSchema = new Schema<IAuthor>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, required: true },
    image: { type: String, default: "" },
    bio: { type: String, trim: true },
    dob: { type: Date },
    city: { type: String, trim: true },
    sherCount: { type: Number, default: 0 },
    ghazalCount: { type: Number, default: 0 },
    otherCount: { type: Number, default: 0 },
    poems: [
      {
        poemId: { type: Schema.Types.ObjectId, ref: "Poem", required: true },
      },
    ],
    followers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        followedAt: { type: Date, default: Date.now },
      },
    ],
    followerCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Author: Model<IAuthor> =
  mongoose.models.Author || model<IAuthor>("Author", AuthorSchema);

export default Author;
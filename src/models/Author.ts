import mongoose, { Schema, model, Model } from "mongoose";

const AuthorSchema = new Schema(
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

const Author: Model<any> =
  mongoose.models.Author || model("Author", AuthorSchema);
export default Author;

// src/models/Author.ts
import mongoose, { Schema, model, Model } from "mongoose";

const AuthorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
    dob: { type: Date },
    city: { type: String, trim: true },
    sherCount: { type: Number, default: 0 },
    ghazalCount: { type: Number, default: 0 },
    otherCount: { type: Number, default: 0 },
    poems: [
      {
        poemId: { type: Schema.Types.ObjectId, ref: "Poem", required: true },
        titleEn: { type: String, required: true, trim: true },
        tags: [String],
        slug: {
          en: { type: String, required: true },
          hi: { type: String, required: true },
          ur: { type: String, required: true },
        },
        coverImage: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

const Author: Model<any> = mongoose.models.Author || model("Author", AuthorSchema);
export default Author;
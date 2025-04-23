// src/models/Poem.ts
import mongoose, { Schema, model, Model } from "mongoose";

const PoemSchema = new Schema(
  {
    title: {
      en: { type: String, required: true, trim: true },
      hi: { type: String, required: true, trim: true },
      ur: { type: String, required: true, trim: true },
    },
    content: {
      en: [
        {
          verse: { type: String, required: true },
          meaning: { type: String, default: "" },
        },
      ],
      hi: [
        {
          verse: { type: String, required: true },
          meaning: { type: String, default: "" },
        },
      ],
      ur: [
        {
          verse: { type: String, required: true },
          meaning: { type: String, default: "" },
        },
      ],
    },
    author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
    readListUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    readListCount: { type: Number, default: 0 },
    coverImage: { type: String, default: "" },
    tags: [String],
    category: {
      type: String,
      enum: [
        "poem",
        "ghazal",
        "sher",
        "nazm",
        "rubai",
        "marsiya",
        "qataa",
        "other",
      ],
      default: "poem",
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
    },
    slug: {
      en: { type: String, required: true, unique: true },
      hi: { type: String, required: true, unique: true },
      ur: { type: String, required: true, unique: true },
    },
    summary: {
      en: { type: String, default: "" },
      hi: { type: String, default: "" },
      ur: { type: String, default: "" },
    },
    didYouKnow: {
      en: { type: String, default: "" },
      hi: { type: String, default: "" },
      ur: { type: String, default: "" },
    },
    faqs: [
      {
        question: {
          en: { type: String, default: "" },
          hi: { type: String, default: "" },
          ur: { type: String, default: "" },
        },
        answer: {
          en: { type: String, default: "" },
          hi: { type: String, default: "" },
          ur: { type: String, default: "" },
        },
      },
    ],
    viewsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PoemSchema.pre("save", function (next) {
  this.readListCount = this.readListUsers.length;
  next();
});

const Poem: Model<any> = mongoose.models.Poem || model("Poem", PoemSchema);
export default Poem;
import mongoose, { Schema, Model } from "mongoose";

// Define interfaces for better type checking
interface IPoemVerse {
  verse: string;
  meaning?: string;
}

interface IMultiLingual<T> {
  en: T;
  hi: T;
  ur: T;
}

export interface IPoem {
  title: IMultiLingual<string>;
  content: IMultiLingual<IPoemVerse[]>;
  author: mongoose.Types.ObjectId;
  readListUsers: mongoose.Types.ObjectId[];
  readListCount: number;
  coverImage: string;
  tags: string[];
  category: string;
  status: string;
  slug: IMultiLingual<string>;
  summary: IMultiLingual<string>;
  didYouKnow: IMultiLingual<string>;
  faqs: Array<{
    question: IMultiLingual<string>;
    answer: IMultiLingual<string>;
  }>;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

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

// Use this pattern to avoid model recompilation errors
let Poem: Model<IPoem>;

try {
  Poem = mongoose.model<IPoem>("Poem");
} catch {
  Poem = mongoose.model<IPoem>("Poem", PoemSchema);
}

export default Poem;
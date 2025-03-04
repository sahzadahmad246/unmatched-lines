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
      en: { type: String, required: true },
      hi: { type: String, required: true },
      ur: { type: String, required: true },
    },
    author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
    readListUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    readListCount: { type: Number, default: 0 },
    coverImage: { type: String, default: "" },
    tags: [String],
    category: {
      type: String,
      enum: ["poem", "ghazal", "sher", "other"],
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
  },
  { timestamps: true }
);

PoemSchema.pre("save", function (next) {
  this.readListCount = this.readListUsers.length;
  next();
});

const Poem: Model<any> = mongoose.models.Poem || model("Poem", PoemSchema);
export default Poem;
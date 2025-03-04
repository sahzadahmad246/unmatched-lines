import mongoose, { Schema, model, models } from "mongoose";

const PoemSchema = new Schema(
  {
    title: {
      en: { type: String, required: true, trim: true }, // English title
      hi: { type: String, required: true, trim: true }, // Hindi title
      ur: { type: String, required: true, trim: true }, // Urdu title
    },
    content: {
      en: { type: String, required: true }, // English content
      hi: { type: String, required: true }, // Hindi content
      ur: { type: String, required: true }, // Urdu content
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
    status: { type: String, enum: ["draft", "published"], default: "published" },
    slug: {
      en: { type: String, required: true, unique: true }, // English slug
      hi: { type: String, required: true, unique: true }, // Hindi slug
      ur: { type: String, required: true, unique: true }, // Urdu slug
    },
  },
  { timestamps: true }
);

// Pre-save hook to update readListCount
PoemSchema.pre("save", function (next) {
  this.readListCount = this.readListUsers.length;
  next();
});

// Check if the model exists before creating a new one

export default mongoose.models.Poem || mongoose.model("Poem", PoemSchema);


// models/Poem.ts
import mongoose, { Schema, model, models } from "mongoose";

const PoemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    likeCount: { type: Number, default: 0 },
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    commentCount: { type: Number, default: 0 },
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
  },
  { timestamps: true }
);

PoemSchema.pre("save", function (next) {
  this.likeCount = this.likes.length;
  this.commentCount = this.comments.length;
  this.readListCount = this.readListUsers.length;
  next();
});

const Poem = models.Poem || model("Poem", PoemSchema);
export default Poem;
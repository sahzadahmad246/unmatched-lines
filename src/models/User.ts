import mongoose, { Schema } from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true }, // Fixed: Removed duplicate email field
    emailVerified: Date,
    image: String,
    accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
    sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Session" }],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    readList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Poem",
      },
    ],
    following: [
      {
        authorId: { type: Schema.Types.ObjectId, ref: "Author" },
        followedAt: { type: Date, default: Date.now },
      },
    ],
    followingCount: { type: Number, default: 0 }, // Tracks number of authors followed
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
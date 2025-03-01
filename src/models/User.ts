// models/User.ts
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    emailVerified: Date,
    image: String,
    accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }],
    sessions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Session" }],
    role: {
      type: String,
      enum: ["user", "admin", "moderator"],
      default: "user",
    },
    likedPoems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Poem" }],
    readList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Poem" }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
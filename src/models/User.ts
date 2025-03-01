import mongoose from "mongoose"

// Define the User schema
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
      unique: true,
    },
    emailVerified: Date,
    image: String,
    accounts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
      },
    ],
    sessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Create and export the User model
export default mongoose.models.User || mongoose.model("User", UserSchema)


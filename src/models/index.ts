import mongoose from "mongoose";
import Poem from "./Poem";
import Author from "./Author";
import User from "./User";

// Import IPoem to ensure correct typing
import type { IPoem } from "./Poem";
import type { IAuthor } from "./Author";

// Define IUser based on User model
interface IUser {
  name: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  accounts: mongoose.Types.ObjectId[];
  sessions: mongoose.Types.ObjectId[];
  role: "user" | "admin";
  readList: mongoose.Types.ObjectId[];
  following: Array<{ authorId: mongoose.Types.ObjectId; followedAt: Date }>;
  followingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Define ModelMap with explicit types
interface ModelMap {
  [key: string]: mongoose.Model<any>;
  Poem: mongoose.Model<IPoem>;
  Author: mongoose.Model<IAuthor>;
  User: mongoose.Model<IUser>;
}

const models: ModelMap = {
  Poem,
  Author,
  User,
};

// Log registered models for debugging
console.log(
  "Mongoose models registered:",
  Object.keys(models).filter((key) => models[key])
);

// Export models for convenience
export { Poem, Author, User };

export default models;
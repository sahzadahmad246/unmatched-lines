// src/models/Author.ts
import mongoose, { Schema, model, Model } from "mongoose";

const AuthorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, required: true },
    image: { type: String, default: "" },
    bio: { type: String, trim: true },
    dob: { type: Date },
    city: { type: String, trim: true },
    sherCount: { type: Number, default: 0 },
    ghazalCount: { type: Number, default: 0 },
    otherCount: { type: Number, default: 0 },
    poems: [
      {
        poemId: { type: Schema.Types.ObjectId, ref: "Poem", required: true },
      },
    ],
    topContent: {
      poem: [
        {
          contentId: {
            type: Schema.Types.ObjectId,
            ref: "Poem",
            required: true,
          },
          rank: { type: Number, min: 1, max: 20 },
        },
      ],
      ghazal: [
        {
          contentId: {
            type: Schema.Types.ObjectId,
            ref: "Poem",
            required: true,
          },
          rank: { type: Number, min: 1, max: 20 },
        },
      ],
      sher: [
        {
          contentId: {
            type: Schema.Types.ObjectId,
            ref: "Poem",
            required: true,
          },
          rank: { type: Number, min: 1, max: 20 },
        },
      ],
      nazm: [
        {
          contentId: {
            type: Schema.Types.ObjectId,
            ref: "Poem",
            required: true,
          },
          rank: { type: Number, min: 1, max: 20 },
        },
      ],
      rubai: [
        {
          contentId: {
            type: Schema.Types.ObjectId,
            ref: "Poem",
            required: true,
          },
          rank: { type: Number, min: 1, max: 20 },
        },
      ],
      marsiya: [
        {
          contentId: {
            type: Schema.Types.ObjectId,
            ref: "Poem",
            required: true,
          },
          rank: { type: Number, min: 1, max: 20 },
        },
      ],
      qataa: [
        {
          contentId: {
            type: Schema.Types.ObjectId,
            ref: "Poem",
            required: true,
          },
          rank: { type: Number, min: 1, max: 20 },
        },
      ],
      other: [
        {
          contentId: {
            type: Schema.Types.ObjectId,
            ref: "Poem",
            required: true,
          },
          rank: { type: Number, min: 1, max: 20 },
        },
      ],
    },

    followerCount: { type: Number, default: 0 },
    followers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      },
    ],
    topContentLastUpdated: { type: Date, default: null }, // Track last update
  },
  { timestamps: true }
);

// Validations for topContent arrays
const categories = [
  "poem",
  "ghazal",
  "sher",
  "nazm",
  "rubai",
  "marsiya",
  "qataa",
  "other",
];
categories.forEach((category) => {
  AuthorSchema.path(`topContent.${category}`).validate(
    (value) => value.length <= 20,
    `Top ${category} content cannot exceed 20 items.`
  );
});

// Indexes for performance
categories.forEach((category) => {
  AuthorSchema.index({ [`topContent.${category}.contentId`]: 1 });
});
AuthorSchema.index({ "followers.userId": 1 });

const Author: Model<any> =
  mongoose.models.Author || model("Author", AuthorSchema);
export default Author;

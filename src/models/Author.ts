import mongoose, { Schema, model, models } from "mongoose";

const AuthorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" }, // URL to author’s image
    dob: { type: Date }, // Date of birth
    city: { type: String, trim: true }, // City of residence or origin
    sherCount: { type: Number, default: 0 }, // Count of shers
    ghazalCount: { type: Number, default: 0 }, // Count of ghazals
    otherCount: { type: Number, default: 0 }, // Count of other poems
    poems: [{ type: Schema.Types.ObjectId, ref: "Poem" }], // Array of poem references
  },
  { timestamps: true }
);

// Pre-save hook to update counts based on poems
AuthorSchema.pre("save", async function (next) {
  if (this.isModified("poems")) {
    const poems = await mongoose.model("Poem").find({ _id: { $in: this.poems } });
    this.sherCount = poems.filter((p) => p.category === "sher").length;
    this.ghazalCount = poems.filter((p) => p.category === "ghazal").length;
    this.otherCount = poems.filter((p) => p.category !== "sher" && p.category !== "ghazal").length;
  }
  next();
});

const Author = models.Author || model("Author", AuthorSchema);
export default Author;
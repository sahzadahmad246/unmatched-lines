// src/utils/migrate-poems.ts
import mongoose from "mongoose";
import Poem from "@/models/Poem";

// Hardcoded MONGODB_URI
const MONGODB_URI = "unavaible for now";

// Define the shape of the Poem document
interface PoemDocument extends mongoose.Document {
  content: {
    en: { verse: string; meaning: string }[];
    hi: { verse: string; meaning: string }[];
    ur: { verse: string; meaning: string }[];
  };
  summary: { en: string; hi: string; ur: string };
  didYouKnow: { en: string; hi: string; ur: string };
  faqs: { question: { en: string; hi: string; ur: string }; answer: { en: string; hi: string; ur: string } }[];
  viewsCount: number;
}

async function migratePoems() {
  try {
    // Connect to MongoDB directly
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    console.log("Connected to MongoDB");

    // Fetch all poems
    const poems = await Poem.find<PoemDocument>();
    console.log(`Found ${poems.length} poems to migrate`);

    // Migrate each poem
    for (const poem of poems) {
      poem.content.en = (Array.isArray(poem.content.en) ? poem.content.en : []).map(
        (verse: string | { verse: string; meaning: string }) => ({
          verse: typeof verse === "string" ? verse : verse.verse,
          meaning: typeof verse === "string" ? "" : verse.meaning || "",
        })
      );
      poem.content.hi = (Array.isArray(poem.content.hi) ? poem.content.hi : []).map(
        (verse: string | { verse: string; meaning: string }) => ({
          verse: typeof verse === "string" ? verse : verse.verse,
          meaning: typeof verse === "string" ? "" : verse.meaning || "",
        })
      );
      poem.content.ur = (Array.isArray(poem.content.ur) ? poem.content.ur : []).map(
        (verse: string | { verse: string; meaning: string }) => ({
          verse: typeof verse === "string" ? verse : verse.verse,
          meaning: typeof verse === "string" ? "" : verse.meaning || "",
        })
      );

      poem.summary = poem.summary || { en: "", hi: "", ur: "" };
      poem.didYouKnow = poem.didYouKnow || { en: "", hi: "", ur: "" };
      poem.faqs = poem.faqs || [];
      poem.viewsCount = poem.viewsCount || 0;

      await poem.save();
    }

    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

migratePoems();
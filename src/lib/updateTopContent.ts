// src/lib/updateTopContent.ts
import dbConnect from "@/lib/mongodb";
import Author from "@/models/Author";
import Poem from "@/models/Poem";

export async function updateTopContentForAuthor(authorId: string): Promise<void> {
  await dbConnect();

  const author = await Author.findById(authorId);
  if (!author) {
    console.error(`Author not found for ID: ${authorId}`);
    throw new Error("Author not found");
  }

  console.log(`Updating topContent for author: ${author.name} (${authorId})`);

  const categories = ["poem", "ghazal", "sher", "nazm", "rubai", "marsiya", "qataa", "other"];
  const updates: any = {
    topContent: {
      poem: [],
      ghazal: [],
      sher: [],
      nazm: [],
      rubai: [],
      marsiya: [],
      qataa: [],
      other: [],
    },
    topContentLastUpdated: new Date(),
  };

  for (const category of categories) {
    const topPoems = await Poem.find({
      author: author._id,
      category,
      status: "published",
    })
      .sort({ viewsCount: -1 })
      .limit(20)
      .select("_id title.en slug.en viewsCount author")
      .populate("author", "name _id");

    console.log(`Found ${topPoems.length} poems for category ${category} for author ${authorId}`);

    updates.topContent[category] = topPoems.map((poem, index) => ({
      contentId: poem._id,
      rank: index + 1,
    }));
  }

  await Author.findByIdAndUpdate(author._id, updates, { runValidators: true });
  console.log(`topContent updated for author: ${authorId}`);
}
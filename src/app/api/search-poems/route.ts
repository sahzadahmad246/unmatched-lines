import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import mongoose from "mongoose"
import Poem from "@/models/Poem"
import Author from "@/models/Author"
import dbConnect from "@/lib/mongodb"

interface LeanPoem {
  _id: mongoose.Types.ObjectId
  title: { en: string; hi: string; ur: string }
  slug: { en: string; hi: string; ur: string }
  category: string
  coverImage?: string
  content: { en: string[]; hi: string[]; ur: string[] }
  tags?: string[]
  author?: { _id: mongoose.Types.ObjectId; name: string; image?: string }
}

interface SearchResult {
  _id: string
  type: "poem"
  title: { en: string; hi?: string; ur?: string }
  author: { name: string; _id: string } | null
  slug: { en: string; hi?: string; ur?: string }
  category: string
  excerpt: string
  content: { en: string[]; hi?: string[]; ur?: string[] }
}

const synonymMap: Record<string, string[]> = {
  ishq: ["mohabbat", "love", "pyar", "prem", "romance", "dil", "इश्क", "मोहब्बत", "प्यार", "प्रेम", "عشق", "محبت"],
  sad: ["gham", "dukh", "sorrow", "udaas", "melancholy", "niraash", "गम", "दुख", "उदास", "نیراش", "غم", "دکھ"],
  shayari: ["poetry", "kavita", "ghazal", "sher", "nazm", "verse", "कविता", "ग़ज़ल", "शेर", "नज़्म", "شاعری", "غزل"],
  love: ["ishq", "mohabbat", "pyar", "prem", "romance", "dil", "aashiqi", "इश्क", "मोहब्बत", "प्यार", "प्रेम", "عशقی", "عشق"],
  happy: ["khushi", "sukoon", "joy", "anand", "maza", "happiness", "खुशी", "सुकून", "आनंद", "خوشی", "سکون"],
  romance: ["ishq", "pyar", "mohabbat", "love", "prem", "aashiqi", "इश्क", "प्यार", "मोहब्बत", "रोमांस", "عشق", "رومانس"],
  friendship: ["dosti", "yaar", "friend", "sathi", "mitr", "दोस्ती", "यार", "मित्र", "دوستی", "یار"],
  life: ["zindagi", "jeevan", "hayat", "living", "existence", "ज़िंदगी", "जीवन", "حیات", "زندگی"],
  dream: ["khwab", "sapna", "dream", "vision", "arzoo", "ख्वाब", "सपना", "خواب", "سپنا"],
  heart: ["dil", "heart", "mann", "qalb", "hriday", "दिल", "मन", "हृदय", "قلب", "دل"],
  pain: ["dard", "pain", "dukh", "ranj", "soz", "दर्द", "दुख", "رنج", "درد"],
  hope: ["asha", "ummeed", "hope", "nazar", "bharosa", "आशा", "उम्मीद", "امید", "آس"],
  nature: ["prakriti", "nature", "kudrat", "tabiyat", "srishti", "प्रकृति", "कुदरत", "سریشتی", "فطرت"],
  beauty: ["sundarta", "beauty", "husn", "jamal", "roop", "सुंदरता", "हुस्न", "جمال", "حسن"],
}

function getSearchTerms(query: string): string[] {
  const words = query.trim().toLowerCase().split(/[\s-]+/)
  const terms = new Set<string>()
  words.forEach((word) => {
    terms.add(word)
    if (synonymMap[word]) synonymMap[word].forEach((synonym) => terms.add(synonym))
  })
  return Array.from(terms)
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")

    if (!q || q.trim().length < 2) {
      return NextResponse.json({ message: "Query must be at least 2 characters" }, { status: 400 })
    }

    const searchQuery = q.trim()
    const searchTerms = getSearchTerms(searchQuery)

    const poemQuery = {
      $or: searchTerms.map((term) => ({
        $or: [
          { "title.en": { $regex: term, $options: "i" } },
          { "title.hi": { $regex: term, $options: "i" } },
          { "title.ur": { $regex: term, $options: "i" } },
          { "content.en": { $regex: term, $options: "i" } },
          { "content.hi": { $regex: term, $options: "i" } },
          { "content.ur": { $regex: term, $options: "i" } },
          { tags: { $regex: term, $options: "i" } },
          { "author.name": { $regex: term, $options: "i" } },
          { category: { $regex: term, $options: "i" } },
        ],
      })),
      status: "published",
    }

    let poemResults = await Poem.find(poemQuery)
      .populate({
        path: "author",
        model: Author,
        select: "name _id image",
      })
      .limit(20)
      .lean() as unknown as LeanPoem[]

    if (poemResults.length === 0) {
      poemResults = await Poem.find({
        $or: [
          { "title.en": { $regex: "shayari", $options: "i" } },
          { "title.hi": { $regex: "shayari", $options: "i" } },
          { "title.ur": { $regex: "shayari", $options: "i" } },
          { "content.en": { $regex: "shayari", $options: "i" } },
          { "content.hi": { $regex: "shayari", $options: "i" } },
          { "content.ur": { $regex: "shayari", $options: "i" } },
          { tags: { $regex: "shayari", $options: "i" } },
          { category: { $regex: "shayari", $options: "i" } },
        ],
        status: "published",
      })
        .populate({
          path: "author",
          model: Author,
          select: "name _id image",
        })
        .limit(20)
        .lean() as unknown as LeanPoem[]
    }

    const results: SearchResult[] = poemResults.map((poem) => ({
      _id: poem._id.toString(),
      type: "poem",
      title: {
        en: poem.title?.en || "Untitled",
        hi: poem.title?.hi || undefined,
        ur: poem.title?.ur || undefined,
      },
      author: poem.author
        ? {
            _id: poem.author._id.toString(),
            name: poem.author.name || "Unknown",
          }
        : null,
      slug: {
        en: poem.slug?.en || poem._id.toString(),
        hi: poem.slug?.hi || undefined,
        ur: poem.slug?.ur || undefined,
      },
      category: poem.category || "Uncategorized",
      excerpt: poem.content?.en?.[0]?.substring(0, 100) || "No excerpt available",
      content: {
        en: Array.isArray(poem.content?.en) ? poem.content.en : [],
        hi: Array.isArray(poem.content?.hi) ? poem.content.hi : undefined,
        ur: Array.isArray(poem.content?.ur) ? poem.content.ur : undefined,
      },
    }))

    return NextResponse.json({ results, hasMatches: poemResults.length > 0 && searchQuery !== "shayari" }, { status: 200 })
  } catch (error) {
   
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
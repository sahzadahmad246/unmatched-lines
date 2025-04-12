import Poets from "./Poets"

export interface Poet {
  _id: string
  name: string
  slug: string
  image?: string
  dob?: string
  city?: string
  ghazalCount: number
  sherCount: number
}

interface PoetListProps {
  poets: Poet[]
}

export default function PoetList({ poets }: PoetListProps) {
  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Explore Poets</h1>
      <p className="text-muted-foreground mb-8">Discover renowned poets and their beautiful works in English, Hindi, and Urdu.</p>
      <Poets initialPoets={poets} />
    </section>
  )
}
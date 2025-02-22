import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative h-96 rounded-lg overflow-hidden mb-12">
        <Image src="/placeholder.svg?height=400&width=1200" alt="Poetry Banner" layout="fill" objectFit="cover" />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Welcome to Poetic Whispers</h1>
            <p className="text-xl mb-6">Discover the beauty of words through timeless poetry</p>
            <Button>Explore Poems</Button>
          </div>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-6">Featured Poem</h2>
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-2xl font-medium mb-4">The Road Not Taken</h3>
          <p className="text-gray-700 mb-4">
            Two roads diverged in a yellow wood,
            <br />
            And sorry I could not travel both
            <br />
            And be one traveler, long I stood
            <br />
            And looked down one as far as I could
            <br />
            To where it bent in the undergrowth;
          </p>
          <p className="text-right italic">- Robert Frost</p>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6">Explore Poetry</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
          {["Poets", "Ghazals", "Shers"].map((category) => (
            <div key={category} className="bg-white shadow-md rounded-lg p-6 text-center border">
              <h3 className="text-xl font-medium mb-4">{category}</h3>
              <p className="text-gray-600 mb-4">Discover beautiful {category.toLowerCase()} from various artists.</p>
              <Button variant="outline">Explore {category}</Button>
            </div>
          ))}
        </div>
      </section> 
    </div>
  )
}


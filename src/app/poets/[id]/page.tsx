"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export default function PoetDetail() {
  const { id } = useParams(); // Get the poet ID from the URL
  const [poet, setPoet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch poet by ID from API
  useEffect(() => {
    const fetchPoet = async () => {
      try {
        const res = await fetch(`/api/authors/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch poet");
        const data = await res.json();
        setPoet(data.author);
      } catch (err) {
        console.error("Error fetching poet:", err);
        setError("Failed to load poet details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchPoet();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Loading poet details...</h2>
      </div>
    );
  }

  if (error || !poet) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-500">
          {error || "Poet not found"}
        </h2>
        <Link href="/poets">
          <Button variant="outline" className="mt-4">
            Back to Poets
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{poet.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Poet Image and Basic Info */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Image
              src={poet.image || "/placeholder.svg?height=300&width=300"}
              alt={poet.name}
              width={300}
              height={300}
              className="rounded-lg object-cover"
            />
            <div className="text-center md:text-left">
              <p className="text-lg">
                <span className="font-semibold">Date of Birth:</span>{" "}
                {poet.dob
                  ? new Date(poet.dob).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Unknown"}
              </p>
              <p className="text-lg">
                <span className="font-semibold">City:</span>{" "}
                {poet.city || "Unknown"}
              </p>
              <p className="text-lg">
                <span className="font-semibold">Ghazals:</span>{" "}
                {poet.ghazalCount}
              </p>
              <p className="text-lg">
                <span className="font-semibold">Shers:</span> {poet.sherCount}
              </p>
              <p className="text-lg">
                <span className="font-semibold">Other Works:</span>{" "}
                {poet.otherCount}
              </p>
            </div>
          </div>

          {/* Poems List */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Works by {poet.name}</h3>
            {poet.poems && poet.poems.length > 0 ? (
              <ul className="space-y-2">
                {poet.poems.map((poem: any) => (
                  <li key={poem._id} className="border-b py-2">
                    <Link
                      href={`/poems/${poem._id}`}
                      className="text-blue-500 hover:underline"
                    >
                      {poem.title}
                    </Link>{" "}
                    <span className="text-gray-500">({poem.category})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No poems by this poet yet.</p>
            )}
          </div>

          {/* Timestamps */}
          <div className="text-sm text-gray-500">
            <p>
              <span className="font-semibold">Added:</span>{" "}
              {new Date(poet.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            {poet.updatedAt !== poet.createdAt && (
              <p>
                <span className="font-semibold">Last Updated:</span>{" "}
                {new Date(poet.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/poets">
            <Button variant="outline">Back to Poets</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

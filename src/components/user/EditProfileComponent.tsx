"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EditProfileComponent() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState(session?.user?.image || "");
  const [message, setMessage] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    const formData = new FormData();
    if (name) formData.append("name", name);
    if (image) formData.append("image", image);

    try {
      const res = await fetch("/api/user/update", {
        method: "PUT",
        body: formData,
        credentials: "include", // Send JWT cookie
      });
      const data = await res.json();
      setMessage(data.message || "Error updating profile");
      if (res.ok) {
        // Optionally update session data on client side
        session.user.name = name || session.user.name;
        session.user.image = data.user.image || session.user.image;
      }
    } catch (error) {
      setMessage("Failed to update profile");
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-6 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">
              Profile Image
            </Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full rounded-md border-gray-300"
            />
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mt-2 h-20 w-20 rounded-full object-cover mx-auto"
              />
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md"
          >
            Update Profile
          </Button>
          {message && <p className="text-center text-sm text-gray-600">{message}</p>}
        </form>
      </CardContent>
    </Card>
  );
}
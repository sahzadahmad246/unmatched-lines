import { Metadata } from "next";
import { AddAuthorForm } from "@/components/admin/add-author-form";

export const metadata: Metadata = {
  title: "Add Author | Admin Dashboard",
  description: "Add a new author to your poetry collection",
};

export default function AddAuthorPage() {
  return <AddAuthorForm />;
}

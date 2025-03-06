import { Metadata } from "next";
import { AddPoemForm } from "@/components/admin/add-poem-form";

export const metadata: Metadata = {
  title: "Add Poem | Admin Dashboard",
  description: "Add a new poem to your collection",
};

export default function AddPoemPage() {
  return <AddPoemForm />;
}

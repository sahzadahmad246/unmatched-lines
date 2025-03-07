import { Metadata } from "next";
import { PoemForm } from "@/components/admin/add-poem-form";
import { Suspense } from "react";
export const metadata: Metadata = {
  title: "Add Poem | Admin Dashboard",
  description: "Add a new poem to your collection",
};

export default function AddPoemPage() {
  <Suspense fallback={<div>Loading...</div>}>
    <PoemForm />
  </Suspense>;
}

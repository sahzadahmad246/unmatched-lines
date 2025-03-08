import { Metadata } from "next";
import { PoemForm } from "@/components/admin/add-poem-form";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Add Poem | Admin Dashboard",
  description: "Add a new poem to your collection",
};

export default function AddPoemPage() {
  return (
    <Suspense fallback={<div>Loading poem form...</div>}>
      <PoemForm />
    </Suspense>
  );
}
import { Metadata } from "next";
import { Suspense } from "react"; // Add Suspense import
import { AuthorForm } from "@/components/admin/add-author-form";

export const metadata: Metadata = {
  title: "Add Author | Admin Dashboard",
  description: "Add a new author to your poetry collection",
};

// A simple fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Loading author form...</p>
      </div>
    </div>
  );
}

export default function AddAuthorPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthorForm />
    </Suspense>
  );
}
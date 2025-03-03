// src/app/admin/layout.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      {/* Admin sidebar or navigation */}
      <nav className="bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
        <Link href="/admin/authors">
          <Button variant="outline">Manage Authors</Button>
        </Link>
      </nav>

      {/* Admin content */}
      <main className="p-4">{children}</main>
    </div>
  );
}

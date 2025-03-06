import { Metadata } from "next";
import { DashboardOverview } from "@/components/admin/dashboard-overview";

export const metadata: Metadata = {
  title: "Admin Dashboard | Unmatched Lines",
  description: "Manage your poetry collection",
};

export default function AdminDashboardPage() {
  return <DashboardOverview />;
}

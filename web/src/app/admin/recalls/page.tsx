import type { Metadata } from "next";
import { AdminRecalls } from "@/components/admin/recalls";

export const metadata: Metadata = { title: "Recalls · Admin" };

export default function AdminRecallsPage() {
  return <AdminRecalls />;
}

import type { Metadata } from "next";
import { AdminContent } from "@/components/admin/content";

export const metadata: Metadata = { title: "Website content · Admin" };

export default function AdminContentPage() {
  return <AdminContent />;
}

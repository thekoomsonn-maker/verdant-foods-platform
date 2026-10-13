import type { Metadata } from "next";
import { A2Content } from "@/components/admin/a2-content";

export const metadata: Metadata = { title: "Website content · Admin" };

export default function AdminContentPage() {
  return <A2Content />;
}

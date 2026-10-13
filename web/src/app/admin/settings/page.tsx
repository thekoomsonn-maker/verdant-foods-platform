import type { Metadata } from "next";
import { A2Settings } from "@/components/admin/a2-settings";

export const metadata: Metadata = { title: "Settings · Admin" };

export default function AdminSettingsPage() {
  return <A2Settings />;
}

import type { Metadata } from "next";
import { A2Problems } from "@/components/admin/a2-problems";

export const metadata: Metadata = { title: "Problems · Admin" };

export default function AdminProblemsPage() {
  return <A2Problems />;
}

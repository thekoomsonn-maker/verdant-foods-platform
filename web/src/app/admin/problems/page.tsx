import type { Metadata } from "next";
import { AdminProblems } from "@/components/admin/problems";

export const metadata: Metadata = { title: "Problems · Admin" };

export default function AdminProblemsPage() {
  return <AdminProblems />;
}

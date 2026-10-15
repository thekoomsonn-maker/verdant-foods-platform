import type { Metadata } from "next";
import { AdminUsers } from "@/components/admin/users";

export const metadata: Metadata = { title: "Users and roles · Admin" };

export default function AdminUsersPage() {
  return <AdminUsers />;
}

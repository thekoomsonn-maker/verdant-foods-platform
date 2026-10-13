import type { Metadata } from "next";
import { A2Users } from "@/components/admin/a2-users";

export const metadata: Metadata = { title: "Users and roles · Admin" };

export default function AdminUsersPage() {
  return <A2Users />;
}

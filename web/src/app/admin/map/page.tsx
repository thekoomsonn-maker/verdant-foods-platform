import type { Metadata } from "next";
import { AdminLiveMap } from "@/components/admin/map";

export const metadata: Metadata = { title: "Live supply map · Admin" };

export default function AdminMapPage() {
  return <AdminLiveMap />;
}

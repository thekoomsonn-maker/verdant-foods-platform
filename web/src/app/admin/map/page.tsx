import type { Metadata } from "next";
import { A2LiveMap } from "@/components/admin/a2-map";

export const metadata: Metadata = { title: "Live supply map · Admin" };

export default function AdminMapPage() {
  return <A2LiveMap />;
}

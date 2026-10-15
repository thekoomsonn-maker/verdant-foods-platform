import type { Metadata } from "next";
import { FarmersClient } from "./farmers-client";

export const metadata: Metadata = { title: "Farmers and farms · Admin" };

export default function AdminFarmersPage() {
  return <FarmersClient />;
}

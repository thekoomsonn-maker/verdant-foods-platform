import type { Metadata } from "next";
import { BuyersClient } from "./buyers-client";

export const metadata: Metadata = { title: "Buyers · Admin" };

export default function AdminBuyers() {
  return <BuyersClient />;
}

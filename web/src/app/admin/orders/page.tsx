import type { Metadata } from "next";
import { OrdersClient } from "./orders-client";

export const metadata: Metadata = { title: "Orders · Admin" };

export default function AdminOrdersPage() {
  return <OrdersClient />;
}

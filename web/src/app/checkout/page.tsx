import type { Metadata } from "next";
import { CheckoutView } from "./checkout-client";

export const metadata: Metadata = { title: "Checkout", description: "Secure checkout with MTN MoMo, Telecel Cash, AT Money or card." };

export default function CheckoutPage() {
  return <CheckoutView />;
}

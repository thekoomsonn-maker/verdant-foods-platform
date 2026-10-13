import type { Metadata } from "next";
import { ProductsClient } from "./products-client";

export const metadata: Metadata = { title: "Products and harvests · Admin" };

export default function AdminProducts() {
  return <ProductsClient />;
}

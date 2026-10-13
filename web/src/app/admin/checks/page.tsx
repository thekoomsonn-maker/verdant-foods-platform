import type { Metadata } from "next";
import { ChecksClient } from "./checks-client";

export const metadata: Metadata = { title: "Farm checks · Admin" };

export default function AdminChecks() {
  return <ChecksClient />;
}

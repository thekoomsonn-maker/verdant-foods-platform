import type { Metadata } from "next";
import { CodesClient } from "./codes-client";

export const metadata: Metadata = { title: "Trace codes · Admin" };

export default function AdminCodes() {
  return <CodesClient />;
}

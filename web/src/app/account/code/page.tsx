import type { Metadata } from "next";
import { AuthSplit } from "@/components/account/auth";
import { USER } from "@/lib/data-account";
import { CodeForm } from "./code-client";

export const metadata: Metadata = { title: "Enter your code" };

export default async function EnterCode({ searchParams }: { searchParams: Promise<{ to?: string }> }) {
  const { to } = await searchParams;
  return (
    <AuthSplit quote="I scan the code on every bag.">
      <CodeForm to={to || USER.phone} />
    </AuthSplit>
  );
}

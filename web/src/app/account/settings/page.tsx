import type { Metadata } from "next";
import { AccountShell } from "@/components/site/account";
import { Settings } from "./settings-client";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <AccountShell active="Settings" title="Settings" sub="Your details, messages and privacy">
      <Settings />
    </AccountShell>
  );
}

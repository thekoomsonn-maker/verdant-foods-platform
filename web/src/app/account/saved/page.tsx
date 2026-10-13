import type { Metadata } from "next";
import { AccountShell } from "@/components/site/account";
import { FollowedFarms, SavedGrid } from "./saved-client";

export const metadata: Metadata = { title: "Saved items" };

export default function Saved() {
  return (
    <AccountShell active="Saved items" title="Saved items" sub="Produce and farms you want to come back to">
      <SavedGrid />
      <FollowedFarms />
    </AccountShell>
  );
}

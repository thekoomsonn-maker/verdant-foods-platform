import type { Metadata } from "next";
import { AccountShell } from "@/components/site/account";
import { BOX } from "@/lib/data-account";
import { WeeklyBox } from "./box-client";

export const metadata: Metadata = { title: "Your weekly box" };

export default function MyWeeklyBox() {
  return (
    <AccountShell active="Weekly box" title="Your weekly box" sub={`${BOX.size} box · every ${BOX.day} · since March`}>
      <WeeklyBox />
    </AccountShell>
  );
}

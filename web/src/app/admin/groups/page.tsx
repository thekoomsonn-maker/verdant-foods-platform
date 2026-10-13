import type { Metadata } from "next";
import { GroupsClient } from "./groups-client";

export const metadata: Metadata = { title: "Savings groups · Admin" };

export default function AdminGroups() {
  return <GroupsClient />;
}

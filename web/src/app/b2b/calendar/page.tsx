import { B2B, PortalShell } from "@/components/portal/shell";
import { CalendarClient } from "./calendar-client";

export default function CalendarPage() {
  return (
    <PortalShell cfg={B2B} active="Supply calendar" title="Supply calendar" sub="What arrives when, and what is coming into season.">
      <CalendarClient />
    </PortalShell>
  );
}

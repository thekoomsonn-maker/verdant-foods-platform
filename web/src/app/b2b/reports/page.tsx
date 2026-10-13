import { B2B, PortalShell } from "@/components/portal/shell";
import { ToastButton } from "@/components/b2b/kit";
import { ReportsClient } from "./reports-client";

export default function ReportsPage() {
  return (
    <PortalShell cfg={B2B} active="Trace reports" title="Trace reports" sub="Farm, plot, handovers, weights and spray records for every delivery."
      actions={<ToastButton variant="light" icon="download" msg="All 4 reports are downloading as one ZIP file">Download all</ToastButton>}>
      <ReportsClient />
    </PortalShell>
  );
}

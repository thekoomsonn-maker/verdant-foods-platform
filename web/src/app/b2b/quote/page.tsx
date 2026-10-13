import { B2B, PortalShell } from "@/components/portal/shell";
import { ToastButton } from "@/components/b2b/kit";
import { QuoteClient } from "./quote-client";

export default function QuotePage() {
  return (
    <PortalShell cfg={B2B} active="Request a quote" title="Request a quote" sub="Tell us what you need. Farms reply within 24 hours."
      actions={<ToastButton variant="light" msg="Draft saved. Find it here next time you open Request a quote.">Save draft</ToastButton>}>
      <QuoteClient />
    </PortalShell>
  );
}

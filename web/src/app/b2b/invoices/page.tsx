import { B2B, Kpi, KpiRow, PortalShell } from "@/components/portal/shell";
import { InvoicesClient, PayNowButton } from "./invoices-client";

export default function InvoicesPage() {
  return (
    <PortalShell cfg={B2B} active="Invoices" title="Invoices" sub="30-day credit terms" actions={<PayNowButton />}>
      <KpiRow>
        <Kpi l="To pay" v="GH₵ 14,280" d="2 invoices · next due 20 Oct" icon="receipt" tone="warning" />
        <Kpi l="Paid this month" v="GH₵ 34,340" icon="circle-check" />
        <Kpi l="Credit used" v="GH₵ 14,280" d="of GH₵ 60,000" icon="wallet" tone="muted" />
        <Kpi l="Avg. days to pay" v="12" d="Inside your 30-day terms" icon="clock" />
      </KpiRow>
      <InvoicesClient />
    </PortalShell>
  );
}

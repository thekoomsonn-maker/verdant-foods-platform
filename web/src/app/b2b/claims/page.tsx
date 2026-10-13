import { B2B, Kpi, KpiRow, PortalShell } from "@/components/portal/shell";
import { Button } from "@/components/ui";
import { R } from "@/lib/routes";
import { ClaimsClient } from "./claims-client";

export default function ClaimsPage() {
  return (
    <PortalShell cfg={B2B} active="Quality claims" title="Quality claims" sub="Every claim is checked against the batch record." actions={<Button href={R.b2bOrders} size="M" arrow>New claim</Button>}>
      <KpiRow>
        <Kpi l="Open claims" v="2" d="1 waiting for you" icon="siren" tone="warning" />
        <Kpi l="Resolved, 30 days" v="9" d="All within 48 h" icon="circle-check" />
        <Kpi l="Avg. time to fix" v="18 h" d="Target 24 h" icon="timer" tone="deep" bg="bg-lime-soft" />
        <Kpi l="Credit issued" v="GH₵ 1,240" d="0.6% of spend" icon="wallet" tone="muted" />
      </KpiRow>
      <ClaimsClient />
    </PortalShell>
  );
}

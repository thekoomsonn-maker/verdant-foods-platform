import { B2B, PortalShell } from "@/components/portal/shell";
import { BidsClient, NewBidButton } from "./bids-client";

export default function BidsPage() {
  return (
    <PortalShell cfg={B2B} active="Bids" title="Bids" sub="Farmers have 48 hours to accept, decline or counter once" actions={<NewBidButton />}>
      <BidsClient />
    </PortalShell>
  );
}

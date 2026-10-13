import { B2B, PortalShell } from "@/components/portal/shell";
import { Button } from "@/components/ui";
import { R } from "@/lib/routes";
import { SourceClient } from "./source-client";

export default function SourcePage() {
  return (
    <PortalShell cfg={B2B} active="Source produce" title="Source produce" sub="Live stock from 38 verified farms" actions={<Button href={R.b2bBids} size="M" arrow>Make a bid</Button>}>
      <SourceClient />
    </PortalShell>
  );
}

import { B2B, PortalShell } from "@/components/portal/shell";
import { ToastButton } from "@/components/b2b/kit";
import { OrdersClient } from "./orders-client";

export default function OrdersPage() {
  return (
    <PortalShell cfg={B2B} active="Orders and deliveries" title="Orders and deliveries" sub="Every delivery with its trace report"
      actions={<ToastButton variant="light" icon="download" msg="Orders exported to CSV. Check your downloads.">Export</ToastButton>}>
      <OrdersClient />
    </PortalShell>
  );
}

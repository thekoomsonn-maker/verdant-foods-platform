import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthSplit } from "@/components/account/auth";
import { GateForm, GateLinks } from "@/components/account/gate";
import { R } from "@/lib/routes";

export const metadata: Metadata = { title: "Business sign in" };

// No PortalShell here on purpose: this page is the door to the portal, not part of it.
export default function BusinessSignIn() {
  return (
    <AuthSplit img="/img/hotel-kitchen.jpg" quote="We know which farm every tomato came from, and the hour it was picked." by="Head chef, Osu Kitchen Group">
      <Suspense>
        <GateForm area="business" title="Business sign in" sub="Order, bid and track deliveries for your kitchen, shop or hotel."
          foot={<GateLinks items={[["Open a business account", R.b2bJoin], ["Back to the website", R.home]]} />} />
      </Suspense>
    </AuthSplit>
  );
}

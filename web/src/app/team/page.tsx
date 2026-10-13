import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthSplit } from "@/components/account/auth";
import { GateForm, GateLinks } from "@/components/account/gate";
import { R } from "@/lib/routes";

export const metadata: Metadata = { title: "Verdant team", robots: { index: false, follow: false } };

export default function TeamSignIn() {
  return (
    <AuthSplit img="/img/packhouse.jpg" quote="Every crate is checked, weighed and logged before it leaves the packhouse." by="Verdant operations, Tamale">
      <Suspense>
        <GateForm area="team" title="Verdant team" sub="Sign in to the operations console. For Verdant staff only."
          foot={<GateLinks items={[["Back to the website", R.home], ["Business customers sign in here", R.b2bSignIn]]} />} />
      </Suspense>
    </AuthSplit>
  );
}

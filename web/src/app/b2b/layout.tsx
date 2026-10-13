import type { Metadata } from "next";
import type { ReactNode } from "react";

// The business portal needs a business or staff sign-in (see src/middleware.ts).
// Pages render their own PortalShell, so /b2b/sign-in stays a plain full-screen page.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function B2bLayout({ children }: { children: ReactNode }) {
  return children;
}

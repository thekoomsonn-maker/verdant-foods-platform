import type { Metadata } from "next";
import type { ReactNode } from "react";

// The operations console is for Verdant staff only (see src/middleware.ts). Pages render their own PortalShell.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}

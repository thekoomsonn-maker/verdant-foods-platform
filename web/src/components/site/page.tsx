import type { ReactNode } from "react";
import { Nav } from "./nav";
import { Footer } from "./footer";

/** Public page frame: navigation (over the hero or solid) and footer. */
export function PublicPage({ children, nav = "overlay" }: { children: ReactNode; nav?: "overlay" | "light" }) {
  return (
    <>
      <Nav theme={nav} />
      <main>{children}</main>
      <Footer />
    </>
  );
}

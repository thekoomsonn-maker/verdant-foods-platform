import { R } from "./routes";

/**
 * The separate Verdant products. One list feeds the nav switcher, the mobile menu and the footer strip,
 * so the products always read the same everywhere. `icon` is a lucide name from components/icon.tsx.
 */
export const PLATFORM: { key: string; name: string; line: string; icon: string; href: string; staff?: boolean }[] = [
  { key: "site", name: "Website", line: "Who we are and how it works", icon: "house", href: R.home },
  { key: "shop", name: "Shop", line: "Fresh produce to your door", icon: "shopping-basket", href: R.shop },
  { key: "trace", name: "Trace your food", line: "Scan a code, meet the farm", icon: "scan-line", href: R.traceSearch },
  { key: "b2b", name: "For business", line: "Bulk orders, bids and invoices", icon: "building-2", href: R.b2b },
  { key: "farm", name: "Farmers", line: "Sell your harvest with Verdant", icon: "tractor", href: R.farmers },
  { key: "team", name: "Team sign in", line: "For Verdant staff", icon: "key", href: R.team, staff: true },
];

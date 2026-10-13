import type { Metadata } from "next";
import { PublicPage } from "@/components/site/page";
import { SearchView } from "./search-client";

type P = { searchParams: Promise<{ q?: string | string[] }> };
export async function generateMetadata({ searchParams }: P): Promise<Metadata> {
  const q = (await searchParams).q;
  const s = Array.isArray(q) ? q[0] : q;
  return { title: s ? `Search: ${s}` : "Search", description: "Search fresh produce, farms and stories on Verdant." };
}

export default async function SearchPage({ searchParams }: P) {
  const q = (await searchParams).q;
  return (
    <PublicPage nav="light">
      <SearchView q={(Array.isArray(q) ? q[0] : q) ?? ""} />
    </PublicPage>
  );
}

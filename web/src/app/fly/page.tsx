import type { Metadata } from "next";
import { DroneFarmExperience } from "@/components/drone";
import { R } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Fly over our farm",
  description: "Pilot a spray drone over Verdant’s farm near Somanya in the Akwapim hills, and water all eight fields.",
};

export default function FlyPage() {
  return (
    <main>
      <h1 className="sr-only">Fly over our farm</h1>
      <DroneFarmExperience backHref={R.home} />
    </main>
  );
}

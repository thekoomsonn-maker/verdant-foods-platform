"use client";
import Link from "next/link";
import { LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import { A1Tag } from "@/components/admin/a1-ui";
import { Icon } from "@/components/icon";
import { LiveMap, type Pin } from "@/components/map";
import { EASE } from "@/components/motion";
import { ADM, Kpi, KpiRow, PortalShell } from "@/components/portal/shell";
import { useToast } from "@/components/toast";
import { cx } from "@/components/tokens";
import { Avatar, Button, ProofChip, Status } from "@/components/ui";
import { FARMS } from "@/lib/data";
import { FARM_ROWS, farmPlots, PLOT_COLOR } from "@/lib/data-admin1";
import { R } from "@/lib/routes";

export function FarmersClient() {
  const toast = useToast();
  const [sel, setSel] = useState(FARM_ROWS[0].slug);
  const plots = useMemo(() => farmPlots(), []);
  const pins = useMemo<Pin[]>(() => FARM_ROWS.map((r) => {
    const f = FARMS.find((x) => x.slug === r.slug)!;
    return { id: r.slug, lat: f.lat, lng: f.lng, kind: r.plotTone === "problem" ? "problem" : "farm", label: f.name, sub: r.mapped ? `${r.plots} plot${r.plots === 1 ? "" : "s"}` : "not mapped" };
  }), []);
  const first = FARMS[0];

  return (
    <PortalShell cfg={ADM} active="Farmers and farms" title="Farmers and farms" sub="512 farmers · 486 plots mapped"
      actions={<Button size="M" arrow onClick={() => toast("Registration link sent to the field officers' app")}>Register farmer</Button>}>
      <KpiRow>
        <Kpi l="Farmers" v="512" d="+18 this month" icon="users" />
        <Kpi l="Plots mapped" v="486" d="95% of farms" icon="map" />
        <Kpi l="Checked in 90 days" v="431" d="84%" icon="badge-check" />
        <Kpi l="No mapped plot" v="26" d="Assign officers" icon="map-pin" tone="warning" />
      </KpiRow>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <div className="lg:sticky lg:top-24">
          <LiveMap
            height="h-[380px] md:h-[480px] lg:h-[540px]" styleName="satellite"
            focus={{ lat: first.lat - 0.002, lng: first.lng + 0.004, zoom: 12.4 }}
            plots={plots} pins={pins} active={sel} onPin={setSel} live="486 plots"
            legend={[[PLOT_COLOR.ok, "Checked"], [PLOT_COLOR.due, "Check due"], [PLOT_COLOR.problem, "Problem"]]}
          />
        </div>

        <LayoutGroup id="a1-farms">
          <div className="flex flex-col gap-3">
            {FARM_ROWS.map((r, i) => {
              const f = FARMS.find((x) => x.slug === r.slug)!;
              const on = sel === r.slug;
              return (
                <motion.div key={r.slug} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: Math.min(i, 8) * 0.05 }}
                  role="button" tabIndex={0} onClick={() => setSel(r.slug)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSel(r.slug); } }}
                  className="relative flex cursor-pointer flex-col gap-3 rounded-[20px] bg-white p-4 outline-none transition-transform duration-300 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-deep">
                  {on && <motion.span layoutId="a1-farm-on" className="absolute inset-0 rounded-[20px] ring-2 ring-leaf" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                  <div className="relative flex items-start gap-3">
                    <Avatar initials={r.init} className={on ? "bg-lime text-night" : "bg-mist text-deep"} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-semibold">{f.name}</div>
                      <div className="text-[13px] text-muted">{f.district} · {f.members} members · {f.ha} ha</div>
                    </div>
                    <Status tone={r.tone}>{r.status}</Status>
                  </div>
                  <div className="relative flex flex-wrap items-center gap-2">
                    <A1Tag icon="map">{r.mapped ? `${r.plots} plot${r.plots === 1 ? "" : "s"} mapped` : "Not mapped"}</A1Tag>
                    <ProofChip level={r.proof} />
                    {!r.mapped && <button onClick={(e) => { e.stopPropagation(); toast(`Officer Kwame Dery assigned to map ${f.name}`); }} className="text-[13px] font-semibold text-leaf hover:text-deep">Assign officer</button>}
                    <Link href={R.farm(r.slug)} onClick={(e) => e.stopPropagation()} className={cx("ml-auto inline-flex items-center gap-1 text-[13px] font-semibold text-deep hover:text-leaf")}>Profile<Icon name="arrow-up-right" size={14} /></Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </PortalShell>
  );
}

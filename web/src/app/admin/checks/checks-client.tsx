"use client";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useMemo, useState } from "react";
import { A1Swap, A1Tabs } from "@/components/admin/a1-ui";
import { Icon } from "@/components/icon";
import { LiveMap } from "@/components/map";
import { EASE } from "@/components/motion";
import { ADM, Kpi, KpiRow, Panel, PortalShell } from "@/components/portal/shell";
import { useToast } from "@/components/toast";
import { cx } from "@/components/tokens";
import { Button, Status } from "@/components/ui";
import { FARMS, plotAround } from "@/lib/data";
import { CHECKS } from "@/lib/data-admin1";
import { R } from "@/lib/routes";

type State = "open" | "approved" | "revisit";

export function ChecksClient() {
  const toast = useToast();
  const [tab, setTab] = useState("Overdue");
  const [sel, setSel] = useState(CHECKS[0].id);
  const [state, setState] = useState<Record<string, State>>({});
  const list = useMemo(() => CHECKS.filter((c) => tab === "All" || (tab === "Overdue" ? c.overdue > 0 : c.overdue === 0)), [tab]);
  const c = CHECKS.find((x) => x.id === sel) ?? CHECKS[0];
  const farm = FARMS.find((f) => f.slug === c.farm)!;
  const mapped = c.plot !== "Not mapped yet";
  const fails = c.items.filter(([, ok]) => !ok).length;
  const st = state[c.id] ?? "open";
  const overdueLeft = CHECKS.filter((x) => x.overdue > 0 && !state[x.id]).length + 3;

  const pick = (t: string) => {
    setTab(t);
    const first = CHECKS.find((x) => t === "All" || (t === "Overdue" ? x.overdue > 0 : x.overdue === 0));
    if (first) setSel(first.id);
  };
  const approve = () => { setState((s) => ({ ...s, [c.id]: "approved" })); toast(fails ? `${c.id} approved with ${fails} note${fails > 1 ? "s" : ""} for the farmer` : `${c.id} approved. ${farm.name} stays on sale`); };
  const revisit = () => { setState((s) => ({ ...s, [c.id]: "revisit" })); toast(`Revisit booked. ${c.officer.replace("Officer ", "")} goes back on 15 Oct`, "info"); };

  return (
    <PortalShell cfg={ADM} active="Farm checks" title="Farm checks" sub={`${overdueLeft} overdue · 24 done this week`}
      actions={<Button size="M" variant="light" icon="route" onClick={() => toast("This week's visit plan sent to 3 officers")}>Plan visits</Button>}>
      <KpiRow>
        <Kpi l="Overdue" v={String(overdueLeft)} d="Oldest: 3 days" icon="clock" tone="danger" />
        <Kpi l="Due this week" v="18" d="Across 9 districts" icon="calendar" tone="muted" />
        <Kpi l="Done this week" v="24" d="+6 on last week" icon="badge-check" />
        <Kpi l="Passed first time" v="92%" d="Spray gaps are the top issue" icon="shield-check" tone="muted" />
      </KpiRow>

      <A1Tabs items={[["Overdue"], ["Due today"], ["All"]]} value={tab} onChange={pick} />

      <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-start">
        <LayoutGroup id="a1-checks">
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {list.map((x, i) => {
                const f = FARMS.find((y) => y.slug === x.farm)!;
                const on = x.id === sel; const s = state[x.id];
                return (
                  <motion.button key={x.id} layout="position" type="button" onClick={() => setSel(x.id)}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.35, ease: EASE, delay: Math.min(i, 8) * 0.04 }}
                    className="relative flex items-center gap-3 rounded-[20px] bg-white p-4 text-left transition-transform duration-300 hover:-translate-y-0.5">
                    {on && <motion.span layoutId="a1-check-on" className="absolute inset-0 rounded-[20px] bg-lime-soft" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                    <span className={cx("relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", s === "approved" ? "bg-success-bg text-success" : x.overdue ? "bg-danger-bg text-danger" : "bg-mist text-deep")}>
                      <Icon name={s === "approved" ? "circle-check" : x.kind.startsWith("New") ? "map-pin" : x.kind.startsWith("Spray") ? "spray-can" : "badge-check"} size={18} />
                    </span>
                    <span className="relative min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{f.name}</span>
                      <span className="block truncate text-[13px] text-muted">{x.kind} · {x.officer.replace("Officer ", "")}</span>
                    </span>
                    <span className="relative shrink-0">
                      {s === "approved" ? <Status tone="success">Approved</Status> : s === "revisit" ? <Status tone="info">Revisit</Status> : x.overdue ? <Status tone="danger">{x.overdue} day{x.overdue > 1 ? "s" : ""} late</Status> : <Status tone="warning">Due today</Status>}
                    </span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </LayoutGroup>

        <Panel className="lg:sticky lg:top-24">
          <A1Swap k={c.id} className="flex flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[13px] font-medium text-muted">{c.id} · {c.kind}</div>
                <h2 className="text-[20px] font-semibold">{farm.name}</h2>
                <div className="text-[14px] text-muted">{c.plot} · {c.ha} ha · {farm.district}, {farm.region}</div>
              </div>
              <Link href={R.farm(farm.slug)} className="inline-flex items-center gap-1 text-[14px] font-semibold text-leaf hover:text-deep">Farm profile<Icon name="arrow-up-right" size={16} /></Link>
            </div>
          </A1Swap>

          <LiveMap
            height="h-[240px] md:h-[280px]" rounded="rounded-2xl" styleName="satellite" controls={false}
            focus={{ lat: farm.lat, lng: farm.lng, zoom: 14.6 }}
            plots={mapped ? [{ id: c.id, coords: plotAround(farm.lat, farm.lng, 0.0028, 0.0007), color: fails ? "#F7C33C" : "#BBEA70" }] : []}
            pins={[{ id: farm.slug, lat: farm.lat, lng: farm.lng, kind: fails ? "problem" : "farm", label: mapped ? c.plot : "Plot not mapped yet" }]}
            live={mapped ? `${c.photos} photos · GPS walked` : "Waiting for the officer"}
          />

          <A1Swap k={c.id + "-body"} className="flex flex-col gap-5">
            <ul className="flex flex-col">
              {c.items.map(([t, ok], i) => (
                <motion.li key={t} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05, duration: 0.3, ease: EASE }} className="flex items-center gap-3 border-b border-line py-3 last:border-0">
                  <span className={cx("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", ok ? "bg-success-bg text-success" : "bg-danger-bg text-danger")}><Icon name={ok ? "check" : "x"} size={15} /></span>
                  <span className="flex-1 text-[15px]">{t}</span>
                  {!ok && <span className="text-[13px] font-semibold text-danger">Needs action</span>}
                </motion.li>
              ))}
            </ul>
            <div className="rounded-2xl bg-paper p-4">
              <div className="text-[13px] font-semibold text-muted">Officer note</div>
              <p className="mt-1 text-[15px]">{c.note}</p>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              {st === "open" ? (
                <motion.div key="act" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="flex flex-wrap gap-2">
                  <Button size="M" icon="check" onClick={approve} className="flex-1">Approve</Button>
                  <Button size="M" variant="secondary" icon="repeat" onClick={revisit} className="flex-1">Ask for a revisit</Button>
                </motion.div>
              ) : (
                <motion.div key="done" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cx("flex items-center gap-3 rounded-2xl p-4", st === "approved" ? "bg-success-bg text-success" : "bg-info-bg text-info")}>
                  <Icon name={st === "approved" ? "circle-check" : "calendar-check"} size={20} />
                  <span className="flex-1 text-[15px] font-semibold">{st === "approved" ? "Approved by you just now" : "Revisit booked for 15 Oct"}</span>
                  <button onClick={() => setState((s) => { const n = { ...s }; delete n[c.id]; return n; })} className="text-[14px] font-semibold underline-offset-2 hover:underline">Undo</button>
                </motion.div>
              )}
            </AnimatePresence>
          </A1Swap>
        </Panel>
      </div>
    </PortalShell>
  );
}

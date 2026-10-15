"use client";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { SwapIn, AdminTable, UnderlineTabs } from "@/components/admin/table-kit";
import { AreaChart } from "@/components/charts";
import { EASE } from "@/components/motion";
import { ADM, Panel, PortalShell } from "@/components/portal/shell";
import { useToast } from "@/components/toast";
import { Avatar, Button, KV, Status } from "@/components/ui";
import { BUYERS, SHOPPERS, WAITING_BUYERS } from "@/lib/data-admin";
import { R } from "@/lib/routes";

const TONE = { Active: "success", Review: "warning", "Over limit": "danger" } as const;
const ced = (n: number) => `GH₵ ${n.toLocaleString("en-GH")}`;

export function BuyersClient() {
  const toast = useToast();
  const [tab, setTab] = useState("Businesses");
  const [sel, setSel] = useState(BUYERS[0].name);
  const [shop, setShop] = useState(SHOPPERS[0].name);
  const [waiting, setWaiting] = useState(WAITING_BUYERS);
  const b = BUYERS.find((x) => x.name === sel) ?? BUYERS[0];
  const s = SHOPPERS.find((x) => x.name === shop) ?? SHOPPERS[0];
  const decide = (name: string, ok: boolean) => { setWaiting((w) => w.filter((x) => x.name !== name)); toast(ok ? `${name} approved. They can order today.` : `${name} declined. They have been told why.`, ok ? "success" : "info"); };

  return (
    <PortalShell cfg={ADM} active="Buyers" title="Buyers" sub="214 business buyers · 5,820 shoppers"
      actions={<Button size="M" arrow onClick={() => toast("Invite link copied. It works for 7 days.")}>Invite buyer</Button>}>
      <UnderlineTabs items={["Businesses", "Shoppers", `Waiting for approval ${waiting.length}`]} value={tab.startsWith("Waiting") ? `Waiting for approval ${waiting.length}` : tab} onChange={(v) => setTab(v.startsWith("Waiting") ? "Waiting" : v)} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE }}>
          {tab === "Businesses" && (
            <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:items-start">
              <Panel className="!p-3 md:!p-4">
                <AdminTable sel={sel} onSel={setSel}
                  cols={[["Buyer", "1.5fr"], ["Type", "1fr"], ["This month", "1fr"], ["Credit", "0.9fr"], ["Status", "1fr"]]}
                  rows={BUYERS.map((x) => ({ key: x.name, cells: [x.name, x.type, ced(x.month), x.credit, <Status key="s" tone={TONE[x.status]}>{x.status}</Status>] }))} />
              </Panel>
              <Panel className="lg:sticky lg:top-24">
                <SwapIn k={b.name} className="flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <Avatar initials={b.init} size={48} className="bg-deep text-white" />
                    <div><h2 className="text-[18px] font-semibold">{b.name}</h2><p className="text-[13px] text-muted">{b.type} · {b.city} · since {b.since}</p></div>
                  </div>
                  <AreaChart values={b.spend} height={110} fmt={(v) => `GH₵ ${(v * 1000).toLocaleString("en-GH")}`} labels={["Nov", "Feb", "May", "Aug", "Oct"]} />
                  <div className="flex flex-col gap-3">
                    <KV k="Spend this year" v={ced(b.year)} />
                    <KV k="Agreements" v={b.agreements ? `${b.agreements} active` : "None yet"} />
                    <KV k="On-time payment" v={b.ontime} />
                    <KV k="Quality claims" v={b.claims} />
                  </div>
                  <Button href={R.b2b} arrow full size="M">Open account</Button>
                </SwapIn>
              </Panel>
            </div>
          )}

          {tab === "Shoppers" && (
            <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:items-start">
              <Panel className="!p-3 md:!p-4">
                <AdminTable sel={shop} onSel={setShop}
                  cols={[["Shopper", "1.4fr"], ["Area", "1.3fr"], ["Orders", "0.8fr"], ["This month", "1fr"], ["Last order", "1fr"]]}
                  rows={SHOPPERS.map((x) => ({ key: x.name, cells: [x.name, x.area, x.orders, ced(x.month), x.last] }))} />
              </Panel>
              <Panel className="lg:sticky lg:top-24">
                <SwapIn k={s.name} className="flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <Avatar initials={s.name.split(" ").map((w) => w[0]).join("")} size={48} className="bg-plum-soft text-plum" />
                    <div><h2 className="text-[18px] font-semibold">{s.name}</h2><p className="text-[13px] text-muted">Shopper · {s.area}</p></div>
                  </div>
                  <div className="flex flex-col gap-3"><KV k="Orders" v={s.orders} /><KV k="Spent this month" v={ced(s.month)} /><KV k="Last order" v={s.last} /></div>
                  <Button href={R.adminOrders} variant="secondary" arrow full size="M">See their orders</Button>
                </SwapIn>
              </Panel>
            </div>
          )}

          {tab === "Waiting" && (
            <Panel title="Waiting for approval">
              <AnimatePresence initial={false}>
                {waiting.map((w, i) => (
                  <motion.div key={w.name} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3, ease: EASE } }} exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                    className="flex flex-col gap-3 border-b border-line py-4 last:border-0 md:flex-row md:items-center">
                    <div className="flex-1"><div className="text-[15px] font-semibold">{w.name}</div><div className="text-[13px] text-muted">{w.type} · {w.asked} · {w.docs}</div></div>
                    <div className="flex gap-2"><Button size="M" onClick={() => decide(w.name, true)}>Approve</Button><Button size="M" variant="secondary" onClick={() => decide(w.name, false)}>Decline</Button></div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {waiting.length === 0 && <p className="py-6 text-center text-muted">All caught up. No buyers waiting.</p>}
            </Panel>
          )}
        </motion.div>
      </AnimatePresence>
    </PortalShell>
  );
}

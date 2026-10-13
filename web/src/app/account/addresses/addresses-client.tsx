"use client";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { Input } from "@/components/account/auth";
import { Icon } from "@/components/icon";
import { EASE } from "@/components/motion";
import { cx } from "@/components/tokens";
import { useToast } from "@/components/toast";
import { Button, Pills } from "@/components/ui";
import { ADDRESSES, PAYMENTS, type Address, type PayMethod } from "@/lib/data-account";

const AREAS = ["Osu", "Airport", "East Legon", "Cantonments", "Labone", "Spintex", "Tema"];
const blank = { label: "", line: "", area: AREAS[0], note: "" };

function Head({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="text-[18px] font-semibold md:text-[20px]">{title}</h2>
      <button onClick={onAction} className="inline-flex items-center gap-1 text-[14px] font-semibold text-leaf hover:text-deep"><Icon name="plus" size={16} />{action}</button>
    </div>
  );
}

export function AddressesSection() {
  const toast = useToast();
  const [list, setList] = useState<Address[]>(ADDRESSES);
  const [def, setDef] = useState("home");
  const [edit, setEdit] = useState<string | null>(null); // address id, or "new"
  const [form, setForm] = useState(blank);
  const [err, setErr] = useState("");

  const open = (a?: Address) => {
    setErr("");
    if (a) { setEdit(a.id); setForm({ label: a.label, line: a.line, area: a.area.split(",")[0], note: a.note ?? "" }); }
    else { setEdit("new"); setForm(blank); }
  };
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.line.trim()) return setErr("Add a house number, street or landmark.");
    const next: Address = { id: edit === "new" ? `a${Date.now()}` : edit!, label: form.label.trim() || "Other", line: form.line.trim(), area: `${form.area}, Accra`, note: form.note.trim() || undefined, icon: edit === "new" ? "map-pin" : list.find((x) => x.id === edit)!.icon };
    setList((l) => (edit === "new" ? [...l, next] : l.map((x) => (x.id === edit ? next : x))));
    toast(edit === "new" ? "Address added" : "Address updated");
    setEdit(null);
  };

  return (
    <section className="flex flex-col gap-4">
      <Head title="Delivery addresses" action="Add address" onAction={() => open()} />
      <LayoutGroup id="addr">
        <div className="grid gap-3 md:grid-cols-2 md:gap-4">
          {list.map((a, i) => {
            const on = def === a.id;
            return (
              <motion.div key={a.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
                className={cx("relative flex flex-col gap-3 overflow-hidden rounded-[20px] p-5 transition-colors duration-300", on ? "text-white" : "bg-white")}>
                {on && <motion.span layoutId="addr-on" className="absolute inset-0 bg-deep" transition={{ type: "spring", stiffness: 300, damping: 32 }} />}
                <div className="relative flex items-start justify-between">
                  <span className={cx("flex h-10 w-10 items-center justify-center rounded-xl", on ? "bg-forest text-lime" : "bg-mist text-deep")}><Icon name={a.icon} size={18} /></span>
                  {on ? <span className="rounded-full bg-lime px-2.5 py-1 text-[12px] font-semibold text-night">Default</span>
                    : <button onClick={() => { setDef(a.id); toast(`${a.label} is now your default address`); }} className="rounded-full bg-mist px-2.5 py-1 text-[12px] font-semibold text-deep hover:bg-mint">Make default</button>}
                </div>
                <div className="relative">
                  <div className="text-[18px] font-semibold">{a.line}</div>
                  <div className={cx("mt-1 text-[14px]", on ? "text-white/75" : "text-muted")}>{a.area}{a.note && ` · ${a.note}`}</div>
                </div>
                <div className="relative flex gap-4">
                  <button onClick={() => open(a)} className={cx("text-[14px] font-semibold", on ? "text-lime" : "text-leaf hover:text-deep")}>Edit</button>
                  {!on && <button onClick={() => { setList((l) => l.filter((x) => x.id !== a.id)); toast(`${a.label} address removed`, "info"); }} className="text-[14px] font-semibold text-muted hover:text-danger">Remove</button>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>
      <AnimatePresence initial={false}>
        {edit && (
          <motion.form key={edit} onSubmit={save} noValidate initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
            <div className="flex flex-col gap-4 rounded-[20px] bg-white p-5 md:p-6">
              <div className="text-[17px] font-semibold">{edit === "new" ? "New address" : "Edit address"}</div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="House and street" value={form.line} onChange={(v) => { setForm({ ...form, line: v }); setErr(""); }} placeholder="House number, street or landmark" error={err} />
                <Input label="Name it" value={form.label} onChange={(v) => setForm({ ...form, label: v })} placeholder="Home, work, mum’s house" />
              </div>
              <div className="flex flex-col gap-2"><span className="text-[14px] font-semibold">Area</span><Pills items={AREAS} value={form.area} onChange={(v) => setForm({ ...form, area: v })} size="S" /></div>
              <Input label="Note for the driver" value={form.note} onChange={(v) => setForm({ ...form, note: v })} placeholder="Gate code, landmark, who to call" />
              <div className="flex gap-2"><Button type="submit" size="M">Save address</Button><Button size="M" variant="ghost" onClick={() => setEdit(null)}>Cancel</Button></div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}

export function PaymentsSection() {
  const toast = useToast();
  const [list, setList] = useState<PayMethod[]>(PAYMENTS);
  const [def, setDef] = useState("mtn");
  const [adding, setAdding] = useState(false);
  const [num, setNum] = useState("");
  const [net, setNet] = useState("AT Money");
  return (
    <section className="flex flex-col gap-4">
      <Head title="Payment methods" action="Add method" onAction={() => setAdding(true)} />
      <div className="flex flex-col gap-1 rounded-[20px] bg-white p-3 md:p-4">
        <LayoutGroup id="pay">
          {list.map((p) => {
            const on = def === p.id;
            return (
              <button key={p.id} role="radio" aria-checked={on} onClick={() => { if (!on) { setDef(p.id); toast(`${p.label} is now your default`); } }}
                className={cx("relative flex items-center gap-3 rounded-2xl p-3.5 text-left transition-colors", !on && "hover:bg-paper")}>
                {on && <motion.span layoutId="pay-on" className="absolute inset-0 rounded-2xl bg-mist ring-2 ring-deep" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
                <span className={cx("relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold", p.badgeCls)}>{p.badge}</span>
                <span className="relative min-w-0 flex-1"><span className="block font-semibold">{p.label}</span><span className="block text-[13px] tabular text-muted">{p.sub}{on && " · default"}</span></span>
                <span className={cx("relative flex h-5 w-5 items-center justify-center rounded-full ring-2", on ? "ring-deep" : "ring-line-strong")}>
                  {on && <motion.span layoutId="pay-dot" className="h-2.5 w-2.5 rounded-full bg-deep" />}
                </span>
              </button>
            );
          })}
        </LayoutGroup>
        <AnimatePresence initial={false}>
          {adding && (
            <motion.form initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden" noValidate
              onSubmit={(e) => {
                e.preventDefault();
                const d = num.replace(/\D/g, "");
                if (d.length < 10) { toast("Enter a 10-digit mobile money number", "danger"); return; }
                setList((l) => [...l, { id: `m${Date.now()}`, label: net, sub: `${d.slice(0, 3)} ••• ${d.slice(-4)}`, badge: net.slice(0, 2).toUpperCase(), badgeCls: "bg-lime text-night" }]);
                setNum(""); setAdding(false); toast(`${net} added. Approve the prompt on your phone.`);
              }}>
              <div className="mt-2 flex flex-col gap-4 rounded-2xl bg-paper p-4">
                <Pills items={["AT Money", "MTN MoMo", "Telecel Cash"]} value={net} onChange={setNet} size="S" light />
                <Input label="Mobile money number" value={num} onChange={setNum} placeholder="024 000 0000" inputMode="tel" />
                <div className="flex gap-2"><Button type="submit" size="M">Add wallet</Button><Button size="M" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
      <p className="flex items-center gap-2.5 rounded-2xl bg-mist px-4 py-3.5 text-[14px] text-deep"><Icon name="shield-check" size={18} />We never store your PIN. Payments are approved on your phone.</p>
    </section>
  );
}

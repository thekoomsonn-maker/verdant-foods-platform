"use client";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Avatar, Button } from "@/components/ui";
import { cx } from "@/components/tokens";
import { EASE } from "@/components/motion";
import { useToast } from "@/components/toast";
import { Input, Select, StatusFor } from "@/components/b2b/kit";
import { TEAM, type Person, type Role } from "@/lib/data-b2b";

const OPEN_EVENT = "b2b-invite-open";
export function InviteButton() {
  return <Button size="M" arrow onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>Invite someone</Button>;
}

const LIMITS: Record<Role, string> = { Owner: "No limit", Buyer: "GH₵ 5,000", Receiver: "None", Finance: "None" };
const COLS = "md:grid-cols-[minmax(0,1.6fr)_150px_130px_120px_110px]";

export function TeamClient() {
  const toast = useToast();
  const [people, setPeople] = useState<Person[]>(TEAM);
  const [inviting, setInviting] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Receiver");
  const openInvite = useCallback(() => setInviting(true), []);

  return (
    <>
      <InviteListener onOpen={openInvite} />
      <AnimatePresence initial={false}>
        {inviting && (
          <motion.form initial={{ height: 0, opacity: 0, overflow: "hidden" }} animate={{ height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } }} exit={{ height: 0, opacity: 0, overflow: "hidden" }} transition={{ duration: 0.35, ease: EASE }}
            onSubmit={(e) => {
              e.preventDefault();
              if (!name.trim()) return toast("Add a name first", "info");
              const initials = name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
              setPeople((p) => [...p, { initials, name: name.trim(), role, limit: LIMITS[role], last: "Invited", status: "Pending", tint: "bg-mist text-deep" }]);
              toast(`Invite sent to ${email || name.trim()} as ${role.toLowerCase()}`);
              setName(""); setEmail(""); setInviting(false);
            }}>
            <div className="flex flex-col gap-4 rounded-[20px] bg-white p-4 md:p-6">
              <div className="flex items-center justify-between"><h2 className="text-[18px] font-semibold">Invite someone</h2><button type="button" onClick={() => setInviting(false)} className="text-[14px] font-semibold text-muted hover:text-ink">Cancel</button></div>
              <div className="grid gap-4 md:grid-cols-[1fr_1fr_200px_auto] md:items-end">
                <Input label="Name" value={name} onChange={setName} placeholder="Ama Owusu" />
                <Input label="Phone or email" value={email} onChange={setEmail} placeholder="ama@osukitchen.com" />
                <Select label="Role" value={role} options={["Buyer", "Receiver", "Finance", "Owner"]} onChange={(v) => setRole(v as Role)} />
                <Button type="submit" className="h-[52px]">Send invite</Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <section className="flex flex-col gap-3 rounded-[20px] bg-white p-3 md:p-4">
        <h2 className="px-1 pt-1 text-[20px] font-semibold"><motion.span key={people.length} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="inline-block tabular">{people.length}</motion.span> people</h2>
        <div className={cx("hidden rounded-xl bg-paper px-4 py-2.5 text-[13px] font-medium text-muted md:grid", COLS)}><span>Name</span><span>Role</span><span>Order limit</span><span>Last active</span><span>Status</span></div>
        <ul className="flex flex-col">
          <AnimatePresence initial={false}>
            {people.map((p, i) => (
              <motion.li key={p.name} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.35, delay: Math.min(i, 8) * 0.04, ease: EASE }}
                className={cx("grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-b border-line px-2 py-3.5 last:border-0 md:px-4", COLS)}>
                <span className="flex min-w-0 items-center gap-3"><Avatar initials={p.initials} size={36} className={p.tint} /><span className="truncate text-[15px] font-semibold">{p.name}</span></span>
                <span className="justify-self-end md:justify-self-start">
                  {p.role === "Owner" ? <span className="px-3 text-[15px]">Owner</span>
                    : <Select variant="mini" value={p.role} options={["Buyer", "Receiver", "Finance"]} onChange={(v) => { setPeople((xs) => xs.map((x) => (x.name === p.name ? { ...x, role: v as Role, limit: LIMITS[v as Role] } : x))); toast(`${p.name} is now ${v.toLowerCase()}`); }} />}
                </span>
                <span className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-muted md:contents md:text-[15px] md:text-ink">
                  <span className="tabular"><span className="md:hidden">Limit: </span>{p.limit}</span>
                  <span>{p.last}</span>
                  <span className="flex items-center gap-2"><StatusFor s={p.status} />
                    {p.status === "Pending" && <button onClick={() => toast(`Invite sent again to ${p.name}`)} className="text-[13px] font-semibold text-leaf hover:text-deep ">Resend</button>}
                  </span>
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </section>
    </>
  );
}

function InviteListener({ onOpen }: { onOpen: () => void }) {
  useEffect(() => {
    const h = () => { onOpen(); window.scrollTo({ top: 0, behavior: "smooth" }); };
    window.addEventListener(OPEN_EVENT, h);
    return () => window.removeEventListener(OPEN_EVENT, h);
  }, [onOpen]);
  return null;
}

import { B2B, PortalShell } from "@/components/portal/shell";
import { Stagger } from "@/components/motion";
import { Icon } from "@/components/icon";
import { cx, T } from "@/components/tokens";
import { ROLES } from "@/lib/data-b2b";
import { InviteButton, TeamClient } from "./team-client";

export default function TeamPage() {
  return (
    <PortalShell cfg={B2B} active="Team and roles" title="Team and roles" sub="Who can order, receive and pay." actions={<InviteButton />}>
      <TeamClient />
      <h2 className={cx(T.h4, "mt-2 font-medium text-deep md:mt-4")}>What each role can do</h2>
      <Stagger className="grid gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-4">
        {ROLES.map(([r, bg, can]) => (
          <div key={r} className={cx("flex h-full flex-col gap-4 rounded-[20px] p-5 md:p-6", bg)}>
            <div className="text-[19px] font-semibold">{r}</div>
            <ul className="flex flex-col gap-3.5">
              {can.map((c) => <li key={c} className="flex items-start gap-3 text-[16px]"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-deep"><Icon name="check" size={15} /></span><span className="pt-0.5">{c}</span></li>)}
            </ul>
          </div>
        ))}
      </Stagger>
    </PortalShell>
  );
}

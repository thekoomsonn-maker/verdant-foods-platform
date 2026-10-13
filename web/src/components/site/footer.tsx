import Link from "next/link";
import Image from "next/image";
import { FOOTER, R } from "@/lib/routes";
import { PLATFORM } from "@/lib/platform";
import { Icon } from "../icon";
import { cx } from "../tokens";
import { Container } from "../ui";

// Footer strip: the same products as the nav switcher, with the business portal shown as its sign-in door.
const STRIP = [
  ...PLATFORM.filter((p) => !["b2b", "team"].includes(p.key)),
  { key: "b2b", name: "Business sign in", line: "Orders, bids and invoices", icon: "building-2", href: R.b2bSignIn, staff: false },
  ...PLATFORM.filter((p) => p.key === "team"),
];

export function Footer() {
  return (
    <footer className="bg-deep text-white">
      <Container className="pt-16 pb-8 md:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2fr]">
          <div className="flex max-w-[420px] flex-col gap-6">
            <div className="relative h-11 w-[132px]"><Image src="/brand/logo-cream.png" alt="Verdant Foods" fill sizes="132px" className="object-contain object-left" /></div>
            <p className="text-[18px] leading-[1.5] text-white/85">Fresh produce from Ghana’s farmers, checked, packed and traced from the farm to your table.</p>
            <form className="flex flex-col gap-3" action={R.signUp}>
              <span className="text-[14px] font-semibold">Get the weekly harvest list</span>
              <span className="flex items-center gap-2 rounded-full bg-forest p-1.5 pl-5 ring-1 ring-white/0 transition focus-within:ring-lime/60">
                <input type="email" required placeholder="Your email address" aria-label="Email address" className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/55" />
                <button className="h-10 shrink-0 rounded-full bg-white px-5 text-[14px] font-semibold text-deep transition-colors hover:bg-lime">Subscribe</button>
              </span>
            </form>
          </div>
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {FOOTER.map((col) => (
              <div key={col.title} className="flex flex-col gap-3">
                <div className="text-[14px] font-semibold text-lime">{col.title}</div>
                {col.links.map(([t, h]) => (
                  <Link key={t} href={h} className="group/f w-fit text-[15px] text-white/80 transition-colors hover:text-white">
                    <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300 group-hover/f:bg-[length:100%_1px]">{t}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
        <nav aria-label="Verdant products" className="mt-16 flex flex-col gap-4">
          <div className="text-[14px] font-semibold text-lime">Verdant products</div>
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
            {STRIP.map((p) => (
              <Link key={p.key} href={p.href} className={cx("group/pr flex flex-col gap-4 rounded-2xl p-4 transition-[background-color,transform] duration-300 ease-[var(--ease-out)] hover:-translate-y-0.5", p.staff ? "bg-night hover:bg-night/80" : "bg-forest/55 hover:bg-forest")}>
                <span className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-night/40 text-lime transition-colors duration-200 group-hover/pr:bg-lime group-hover/pr:text-night"><Icon name={p.icon} size={19} /></span>
                  <Icon name="arrow-up-right" size={16} className="text-white/40 transition-[color,transform] duration-200 group-hover/pr:-translate-y-0.5 group-hover/pr:translate-x-0.5 group-hover/pr:text-lime" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] font-semibold text-white">{p.name}</span>
                  <span className="text-[13px] leading-snug text-white/65">{p.line}</span>
                </span>
              </Link>
            ))}
          </div>
        </nav>
        <div className="mt-12 flex flex-col gap-6 border-t border-white/10 pt-8 text-[14px] text-white/70 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2"><span>© 2026 Verdant Foods Ltd. Accra, Ghana</span><Link href={R.legal} className="hover:text-white">Privacy</Link><Link href={R.legal} className="hover:text-white">Terms</Link><Link href={R.legal} className="hover:text-white">Cookies</Link></div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3"><span>MTN MoMo · Telecel Cash · AT Money · Visa · Mastercard</span>
            <span className="flex gap-2">{(["instagram", "facebook", "linkedin", "youtube"] as const).map((s) => <a key={s} href="#" aria-label={s} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-forest hover:text-lime"><Icon name={s} size={18} /></a>)}</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

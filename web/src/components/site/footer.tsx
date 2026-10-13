import Link from "next/link";
import Image from "next/image";
import { FOOTER, R } from "@/lib/routes";
import { Icon } from "../icon";
import { Container } from "../ui";

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
        <div className="mt-16 flex flex-col gap-6 border-t border-white/10 pt-8 text-[14px] text-white/70 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2"><span>© 2026 Verdant Foods Ltd. Tamale, Ghana</span><Link href={R.legal} className="hover:text-white">Privacy</Link><Link href={R.legal} className="hover:text-white">Terms</Link><Link href={R.legal} className="hover:text-white">Cookies</Link></div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3"><span>MTN MoMo · Telecel Cash · AT Money · Visa · Mastercard</span>
            <span className="flex gap-2">{(["instagram", "facebook", "linkedin", "youtube"] as const).map((s) => <a key={s} href="#" aria-label={s} className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-forest hover:text-lime"><Icon name={s} size={18} /></a>)}</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}

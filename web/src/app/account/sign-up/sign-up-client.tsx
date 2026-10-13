"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useState } from "react";
import { Input } from "@/components/account/auth";
import { Icon } from "@/components/icon";
import { SplitWords } from "@/components/motion";
import { cx, T } from "@/components/tokens";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui";
import { R } from "@/lib/routes";

const AREAS = ["Osu, Accra", "Airport, Accra", "East Legon, Accra", "Cantonments, Accra", "Spintex, Accra", "Tema", "Kumasi", "Tamale"];

export function SignUpForm() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [news, setNews] = useState(true);
  const [errs, setErrs] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const x: Record<string, string> = {};
    if (name.trim().length < 2) x.name = "Tell us your name.";
    if (phone.replace(/\D/g, "").length < 9) x.phone = "Enter your 9-digit number, without the first 0.";
    if (!area) x.area = "Choose where we should deliver.";
    setErrs(x);
    if (Object.keys(x).length) return;
    toast(`Welcome, ${name.trim().split(" ")[0]}. We sent a code to +233 ${phone}`);
    router.push(`${R.code}?to=${encodeURIComponent(`+233 ${phone}`)}`);
  };

  return (
    <>
      <ol className="flex items-center gap-3 text-[14px]" aria-label="Steps">
        <li className="flex items-center gap-2 font-semibold text-ink"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-deep text-[13px] text-white">1</span>Your details</li>
        <li aria-hidden className="h-px w-10 bg-line" />
        <li className="flex items-center gap-2 text-muted"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-mist text-[13px]">2</span>Confirm phone</li>
      </ol>
      <div className="flex flex-col gap-3">
        <SplitWords text="Create your account" className={cx(T.h1, "text-deep")} delay={0.1} />
        <p className="text-[16px] text-muted">Two minutes. No password needed.</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        <Input label="Full name" value={name} onChange={setName} placeholder="Ama Owusu" autoComplete="name" error={errs.name} />
        <Input label="Phone number" value={phone} onChange={setPhone} placeholder="24 555 0182" inputMode="tel" autoComplete="tel-national" error={errs.phone}
          prefix={<span className="flex h-[52px] shrink-0 items-center gap-1.5 rounded-xl bg-paper px-3.5 text-[15px]"><span className="text-muted">GH</span><span className="font-semibold">+233</span></span>} />
        <label className="flex flex-col gap-2">
          <span className="text-[14px] font-semibold">Where do you live?</span>
          <span className={cx("relative flex h-[52px] items-center gap-2.5 rounded-xl bg-paper px-4 ring-1 transition focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgb(187_234_112/0.4)] focus-within:ring-deep", errs.area && !area ? "ring-danger" : "ring-transparent")}>
            <Icon name="map-pin" size={18} className="shrink-0 text-muted" />
            <select value={area} onChange={(e) => setArea(e.target.value)} className={cx("h-full w-full appearance-none bg-transparent text-[16px] outline-none", !area && "text-muted")}>
              <option value="" disabled>Choose your area</option>
              {AREAS.map((a) => <option key={a} value={a} className="text-ink">{a}</option>)}
            </select>
            <Icon name="chevron-down" size={18} className="pointer-events-none shrink-0 text-muted" />
          </span>
          {errs.area && !area && <span className="text-[13px] text-danger">{errs.area}</span>}
        </label>
        <label className="flex w-fit cursor-pointer items-center gap-3">
          <input type="checkbox" checked={news} onChange={(e) => setNews(e.target.checked)} className="peer sr-only" />
          <span className={cx("flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-deep", news ? "bg-deep" : "bg-paper ring-1 ring-line-strong")}>
            {news && <motion.span initial={{ scale: 0.5 }} animate={{ scale: 1 }}><Icon name="check" size={14} className="text-white" /></motion.span>}
          </span>
          <span className="text-[15px]">Send me the weekly harvest list</span>
        </label>
        <Button type="submit" full arrow>Create account</Button>
        <p className="-mt-2 text-center text-[13px] text-muted">By creating an account you accept our <Link href={R.legal} className="font-semibold text-deep hover:underline">terms and privacy notice</Link>.</p>
      </form>
      <Link href={R.signIn} className="text-center text-[15px] font-semibold text-leaf hover:text-deep">Already have an account? Sign in</Link>
      <Link href={R.b2bJoin} className="group/bz flex items-center gap-3 rounded-2xl bg-sun-soft px-4 py-4 text-[14px] text-ink transition-transform hover:-translate-y-0.5">
        <Icon name="building-2" size={20} className="shrink-0 text-deep" />
        <span className="flex-1">Buying for a restaurant or hotel? Open a business account.</span>
        <Icon name="arrow-right" size={18} className="shrink-0 text-deep transition-transform group-hover/bz:translate-x-[3px]" />
      </Link>
    </>
  );
}

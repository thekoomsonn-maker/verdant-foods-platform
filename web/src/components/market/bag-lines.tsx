"use client";
import { useBag } from "@/components/site/bag";
import type { Product } from "@/lib/data";
import { DELIVERY_FEE, FREE_DELIVERY_AT } from "@/lib/data-market";

/** Bag lines with totals for the Bag, Checkout and Order confirmed pages, on top of the shared bag. */
export function useBagLines() {
  const bag = useBag();
  const lines = bag.lines;
  const subtotal = lines.reduce((a, l) => a + l.p.price * l.qty, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_AT ? 0 : DELIVERY_FEE;
  const count = bag.count;
  const qtyOf = (p: Product) => lines.find((l) => l.p.slug === p.slug)?.qty ?? 0;
  const inc = (p: Product) => (qtyOf(p) ? bag.setQty(p.slug, qtyOf(p) + 1) : bag.add(p));
  const dec = (p: Product) => bag.setQty(p.slug, qtyOf(p) - 1);
  const remove = (p: Product) => bag.remove(p.slug);
  return { lines, subtotal, delivery, total: subtotal + delivery, count, inc, dec, remove, add: bag.add };
}

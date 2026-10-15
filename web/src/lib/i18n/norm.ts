/** Turns a piece of UI text into a dictionary key: whitespace collapsed, every number replaced by {#}.
 *  The same function runs in the extractor and in the browser, so keys always match. */
const NUM = /\d+(?:[.,:/]\d+)*/g;
export function toKey(s: string): { key: string; nums: string[] } {
  const clean = s.replace(/\s+/g, " ").trim();
  const nums: string[] = [];
  const key = clean.replace(NUM, (m) => { nums.push(m); return "{#}"; });
  return { key, nums };
}
export function fill(t: string, nums: string[]): string {
  let i = 0;
  return t.replace(/\{#\}/g, () => nums[i++] ?? "");
}
/** Translate one string with a dictionary; anything missing stays in English. */
export function translate(dict: Record<string, string> | null, s: string): string {
  if (!dict || !s) return s;
  const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s)!;
  const core = m[2];
  if (!core || !/\p{L}/u.test(core)) return s;
  const exact = dict[core.replace(/\s+/g, " ")];
  if (exact) return m[1] + exact + m[3];
  const { key, nums } = toKey(core);
  const hit = dict[key];
  return hit ? m[1] + fill(hit, nums) + m[3] : s;
}

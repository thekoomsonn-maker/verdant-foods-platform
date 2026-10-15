import { chromium } from 'playwright';
const langs = process.argv[2].split(','); const pages = process.argv[3].split(',');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const res = {};
for (const L of langs) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript((l) => { try { localStorage.setItem('vf-lang', l); } catch {} }, L);
  await ctx.route(/arcgisonline|cartocdn|\.mp4/, r => r.abort());
  for (const pg of pages) {
    const p = await ctx.newPage(); await p.goto('http://localhost:3100' + pg, { waitUntil: 'load' }); await p.waitForTimeout(2500);
    const h = await p.evaluate(() => document.body.scrollHeight); for (let y = 0; y < h; y += 700) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(40); }
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
    const s = await p.evaluate(() => { const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let tot = 0, words = 0; const left = []; for (let n = tw.nextNode(); n; n = tw.nextNode()) { const t = n.data.trim(); if (!t || !/[a-zA-Z]{2}/.test(t) || n.parentElement.closest('script,style,svg')) continue; tot++; words += t.split(/\s+/).length; left.push(t); } return { tot, words, sample: left.slice(0, 400) }; });
    res[L + ' ' + pg] = s;
    if (pg === pages[0]) await p.screenshot({ path: `/tmp/vf/qa/i18n-${L.replace(/\W/g,'')}.png` });
    await p.close();
  }
  await ctx.close();
}
await b.close();
console.log(JSON.stringify(res));

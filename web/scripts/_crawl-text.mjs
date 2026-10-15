import { chromium } from 'playwright'; import fs from 'fs';
const routes = [...new Set([...JSON.parse(fs.readFileSync('/tmp/vf/routes.json','utf8')), '/team','/b2b/sign-in','/fly','/shop/vegetables','/shop/p/garden-eggs','/farms/verdant-farm-somanya','/stories/cold-vans-now-reach-kumasi','/search?q=yam','/nope-404'])];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const found = new Set();
const grab = async (p) => { const arr = await p.evaluate(() => {
  const out = []; const skip = new Set(['SCRIPT','STYLE','NOSCRIPT','svg','SVG','TEXTAREA','CODE']);
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) { const pe = n.parentElement; if (!pe || skip.has(pe.tagName) || pe.closest('svg')) continue; const t = n.data.replace(/\s+/g,' ').trim(); if (t) out.push(t); }
  document.querySelectorAll('[placeholder],[aria-label],[title],[alt]').forEach(e => { for (const a of ['placeholder','aria-label','title','alt']) { const v = e.getAttribute(a); if (v && v.trim()) out.push(v.trim()); } });
  document.querySelectorAll('[data-i18n-skip][aria-label]').forEach(e=>out.push(e.getAttribute('aria-label')));
  out.push(document.title); return out; }); arr.forEach(s => found.add(s)); };
for (const [w, tag] of [[1440,'d'],[390,'m']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 } });
  await ctx.route(/arcgisonline|cartocdn|\.mp4/, r => r.abort());
  const sp = await ctx.newPage();
  for (const area of ['team','business']) await sp.request.post('http://localhost:3100/api/auth/sign-in', { data: { email: 'qa@verdant.com', password: area === 'team' ? 't' : 'b', area } });
  await sp.close();
  for (const r of routes) {
    if (r === '/fly' && tag === 'm') continue;
    const p = await ctx.newPage();
    try {
      await p.goto('http://localhost:3100' + r, { waitUntil: 'load', timeout: 45000 }); await p.waitForTimeout(700);
      const h = await p.evaluate(() => document.body.scrollHeight); for (let y = 0; y < h; y += 700) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(50); }
      await p.waitForTimeout(500); await grab(p);
      // click tabs / pills / accordions / toggles to reveal hidden copy
      const clickable = await p.$$('[role=tab], button[aria-pressed], button[aria-expanded="false"], [role=option]');
      for (const c of clickable.slice(0, 40)) { try { if (await c.isVisible()) { await c.click({ timeout: 800 }); await p.waitForTimeout(150); await grab(p); } } catch {} }
    } catch (e) { console.log('ERR', r, e.message.slice(0,80)); }
    await p.close();
  }
  await ctx.close();
}
await b.close();
fs.writeFileSync('/tmp/vf/i18n/dom-strings.json', JSON.stringify([...found].sort(), null, 1));
console.log('dom strings', found.size);

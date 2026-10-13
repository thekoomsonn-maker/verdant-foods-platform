import { chromium } from 'playwright';
import fs from 'fs';
const base = process.argv[2] || 'http://localhost:3100';
const out = process.argv[3] || '/tmp/vf/crawl';
const only = process.argv[4] ? process.argv[4].split(',') : null;
fs.mkdirSync(out, { recursive: true });
const routes = ['/', '/about', '/farmers', '/business', '/trace-your-food', '/contact', '/impact', '/stories', '/stories/amina-doubled-her-tomato-plot', '/careers', '/help', '/legal', '/nope-404',
 '/shop', '/shop/p/vine-tomatoes', '/farms/nyankpala-women-farmers', '/packs', '/bag', '/checkout', '/checkout/confirmed', '/shop/fruits', '/search?q=tomato', '/weekly-box', '/delivery', '/shop/p/vine-tomatoes/reviews',
 '/account/sign-in', '/account', '/account/orders', '/account/orders/VF-20418', '/account/addresses', '/account/sign-up', '/account/code', '/account/saved', '/account/weekly-box', '/account/report', '/account/settings',
 '/b2b', '/b2b/source', '/b2b/bids', '/b2b/agreements', '/b2b/orders', '/b2b/invoices', '/business/join', '/b2b/quote', '/b2b/team', '/b2b/claims', '/b2b/calendar', '/b2b/reports',
 '/admin', '/admin/orders', '/admin/products', '/admin/buyers', '/admin/farmers', '/admin/groups', '/admin/checks', '/admin/codes', '/admin/payments', '/admin/map', '/admin/batches', '/admin/weights', '/admin/recalls', '/admin/deliveries', '/admin/pricing', '/admin/content', '/admin/users', '/admin/reports', '/admin/settings', '/admin/problems',
 '/t', '/t/VF-TOM-00048', '/t/VF-TOM-00048/farm', '/t/VF-TOM-00048/spray', '/t/VF-XYZ-1'];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const report = [];
for (const [vw, tag] of [[1440, 'd'], [390, 'm']]) {
  const ctx = await b.newContext({ viewport: { width: vw, height: 900 } });
  await ctx.route(/arcgisonline|cartocdn/, r => r.abort());
  for (const r of routes) {
    if (only && !only.includes(r)) continue;
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push('PE ' + e.message.slice(0, 160)));
    p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED|tile|AJAXError|net::/.test(m.text())) errs.push('CE ' + m.text().slice(0, 160)); });
    let status = 0;
    try { const res = await p.goto(base + r, { waitUntil: 'load', timeout: 25000 }); status = res?.status() ?? 0; } catch (e) { errs.push('GOTO ' + e.message.slice(0, 80)); }
    await p.waitForTimeout(600);
    const h = await p.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < h; y += 600) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(90); }
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(900);
    const ov = await p.evaluate(() => { const W = document.documentElement.clientWidth; const bad = []; for (const el of document.querySelectorAll('body *')) { const rc = el.getBoundingClientRect(); if (rc.width && rc.right > W + 2) { let a = el.parentElement, clipped = false; while (a) { const cs = getComputedStyle(a); if (/(hidden|auto|scroll|clip)/.test(cs.overflowX)) { clipped = true; break; } a = a.parentElement; } if (!clipped) bad.push(el.tagName + '.' + String(el.className).slice(0, 40) + ' r=' + Math.round(rc.right)); } } return { sw: document.documentElement.scrollWidth, W, bad: bad.slice(0, 4) }; });
    const name = r.replace(/[\/?=]/g, '_') || 'home';
    await p.screenshot({ path: `${out}/${tag}${name}.jpg`, type: 'jpeg', quality: 50, fullPage: true });
    report.push({ r, tag, status, errs: errs.slice(0, 4), overflow: ov.sw > ov.W ? ov : null });
    await p.close();
  }
  await ctx.close();
}
await b.close();
fs.writeFileSync(out + '/report.json', JSON.stringify(report, null, 1));
for (const x of report) if (x.errs.length || x.overflow || (x.status !== 200 && x.r !== '/nope-404' && x.r !== '/t/VF-XYZ-1')) console.log(x.tag, x.r, x.status, JSON.stringify(x.errs), x.overflow ? JSON.stringify(x.overflow) : '');
console.log('done', report.length);

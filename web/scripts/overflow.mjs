import { chromium } from 'playwright';
const routes = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 900 } }); await ctx.route(/arcgisonline|cartocdn/, r => r.abort());
for (const r of routes) { const p = await ctx.newPage(); await p.goto('http://localhost:3100' + r, { waitUntil: 'load' }); await p.waitForTimeout(800);
 const o = await p.evaluate(() => { const W = document.documentElement.clientWidth; const res = []; for (const el of document.querySelectorAll('body *')) { const rc = el.getBoundingClientRect(); const pr = el.parentElement?.getBoundingClientRect(); if (rc.width && rc.right > W + 2 && pr && pr.right <= W + 2) { const cs = getComputedStyle(el.parentElement); res.push(`${el.tagName}.${String(el.className).slice(0,70)} w=${Math.round(rc.width)} | parent ${el.parentElement.tagName}.${String(el.parentElement.className).slice(0,60)} disp=${cs.display} ovx=${cs.overflowX}`); } } return res.slice(0,3); });
 console.log(r, '\n  ' + o.join('\n  ')); await p.close(); }
await b.close();

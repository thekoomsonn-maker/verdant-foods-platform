import { chromium } from 'playwright';
const [,, url, sel, vw='1440'] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: +vw, height: 900 } });
await p.route(/arcgisonline|cartocdn/, r => r.abort());
await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(800);
const h = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < h; y += 300) { await p.mouse.wheel(0, 300); await p.waitForTimeout(150); }
await p.waitForTimeout(1200);
console.log(await p.evaluate((s) => [...document.querySelectorAll(s)].slice(0,6).map(e => { const cs = getComputedStyle(e); return `${e.tagName} clip=${cs.clipPath} op=${cs.opacity} tf=${cs.transform} h=${e.getBoundingClientRect().height}`; }).join('\n'), sel));
await b.close();

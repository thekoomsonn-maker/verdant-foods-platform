import { chromium } from 'playwright';
const [,, url, out, w='1440', full='1'] = process.argv;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' }).catch(()=>{});
// scroll through to trigger in-view animations
const h = await p.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < h; y += 500) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(120); }
await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(1500);
await p.screenshot({ path: out, fullPage: full === '1' });
await b.close();

import { chromium } from 'playwright';
const base = process.argv[2]; const routes = process.argv.slice(3);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
for (const r of routes) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message.slice(0,150))); p.on('console', m => { if (m.type()==='error') errs.push(m.text().slice(0,150)); });
  await p.goto(base + r, { waitUntil: 'load' });
  const el = await p.$('.maplibregl-map') ;
  if (!el) { // scroll to find it
    for (let y=0; y<8000; y+=500) { await p.evaluate(v=>window.scrollTo(0,v), y); await p.waitForTimeout(250); if (await p.$('.maplibregl-map')) break; }
  }
  const m = await p.$('.maplibregl-map');
  if (m) { await m.scrollIntoViewIfNeeded(); await p.waitForTimeout(7000); await m.screenshot({ path: `/tmp/vf/map${r.replace(/\//g,'_')}.png` }); }
  const info = await p.evaluate(() => ({ maps: document.querySelectorAll('.maplibregl-map').length, markers: document.querySelectorAll('.maplibregl-marker').length, canvas: document.querySelectorAll('.maplibregl-canvas').length }));
  console.log(r, JSON.stringify(info), errs.slice(0,3).join(' | '));
  await p.close();
}
await b.close();

import { chromium } from 'playwright';
import fs from 'fs';
const routes = JSON.parse(fs.readFileSync('/tmp/vf/routes.json','utf8'));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [vw,tag] of [[1440,'d'],[390,'m']]) {
 const ctx = await b.newContext({ viewport: { width: vw, height: 900 } }); await ctx.route(/arcgisonline|cartocdn|\.mp4/, r => r.abort());
 for (const r of routes) { const p = await ctx.newPage(); await p.goto('http://localhost:3100' + r, { waitUntil: 'load' }); 
  const h = await p.evaluate(() => document.body.scrollHeight); for (let y=0;y<h;y+=700){ await p.evaluate(v=>window.scrollTo(0,v),y); await p.waitForTimeout(60);} await p.waitForTimeout(1200);
  const bad = await p.evaluate(() => { const out=[]; for (const g of document.querySelectorAll('.glass,.glass-dark')) { const gr=g.getBoundingClientRect(); if(!gr.width) continue; let a=g.parentElement; while(a && !a.querySelector(':scope > img, :scope > video, :scope > div > img')) a=a.parentElement; if(!a||a===document.body) continue; const ar=a.getBoundingClientRect(); const ratio=(gr.width*gr.height)/(ar.width*ar.height); if(ratio>0.4) out.push(Math.round(ratio*100)+'% '+(g.innerText||'').replace(/\s+/g,' ').slice(0,50)); } return out; });
  if (bad.length) console.log(tag, r, JSON.stringify(bad));
  await p.close(); }
 await ctx.close(); }
await b.close();

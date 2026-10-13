// Build: concat parts -> index.html, number pages, QA, export PDF + PNG previews
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const dir = __dirname;
const parts = fs.readdirSync(path.join(dir, 'parts')).filter(f => f.endsWith('.html')).sort();
let html = parts.map(f => fs.readFileSync(path.join(dir, 'parts', f), 'utf8')).join('\n');
html += `\n<script>document.querySelectorAll('.page').forEach((p,i)=>{const n=p.querySelector('.pn');if(n)n.textContent=String(i+1).padStart(2,'0')+' / '+document.querySelectorAll('.page').length;});</script>\n</body></html>`;
fs.writeFileSync(path.join(dir, 'index.html'), html);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const pg = await b.newPage({ viewport: { width: 1200, height: 900 } });
  await pg.goto('file://' + path.join(dir, 'index.html'));
  await pg.evaluate(() => document.fonts.ready);
  // QA: overflow + overlaps between text-bearing leaf blocks, and content intruding into footer zone
  const qa = await pg.evaluate(() => {
    const out = [];
    document.querySelectorAll('.page').forEach((p, i) => {
      const pr = p.getBoundingClientRect();
      const foot = p.querySelector('.foot');
      const footTop = foot ? foot.getBoundingClientRect().top : pr.bottom;
      // any element whose bottom exceeds page or enters footer
      p.querySelectorAll('*').forEach(el => {
        if (el.closest('.foot') || el.closest('.run') || el.closest('[data-qa-skip]')) return;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
        const hasText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
        if (!hasText) return;
        if (parseFloat(getComputedStyle(el).fontSize) < 12 && !el.closest('.phone')) out.push(`p${i + 1}: small text ${getComputedStyle(el).fontSize} "${el.textContent.trim().slice(0, 30)}"`);
        if (r.bottom > footTop - 4 && !p.hasAttribute('data-nofoot')) out.push(`p${i + 1}: text into footer: "${el.textContent.trim().slice(0, 40)}" (${Math.round(r.bottom - footTop)}px)`);
        if (r.right > pr.right - 20 || r.left < pr.left + 20) out.push(`p${i + 1}: text near/over page edge: "${el.textContent.trim().slice(0, 40)}"`);
        // clipped text: scroll bigger than client
        if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflow !== 'visible') out.push(`p${i + 1}: clipped "${el.textContent.trim().slice(0, 40)}"`);
      });
      // overlaps between sibling text leaves
      const leaves = [...p.querySelectorAll('*')].filter(el => getComputedStyle(el).display !== 'inline' && !el.closest('.run,.foot,[data-qa-skip]') && el.children.length === 0 && el.textContent.trim() && el.getBoundingClientRect().width);
      for (let a = 0; a < leaves.length; a++) for (let c = a + 1; c < leaves.length; c++) {
        const A = leaves[a].getBoundingClientRect(), C = leaves[c].getBoundingClientRect();
        const ox = Math.min(A.right, C.right) - Math.max(A.left, C.left), oy = Math.min(A.bottom, C.bottom) - Math.max(A.top, C.top);
        if (ox > 3 && oy > 3 && !leaves[a].contains(leaves[c]) && !leaves[c].contains(leaves[a])) out.push(`p${i + 1}: overlap "${leaves[a].textContent.trim().slice(0, 25)}" × "${leaves[c].textContent.trim().slice(0, 25)}"`);
      }
    });
    return out;
  });
  console.log('QA issues:', qa.length); qa.slice(0, 60).forEach(x => console.log(' -', x));
  // previews
  const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null;
  fs.mkdirSync(path.join(dir, 'preview'), { recursive: true });
  const pages = await pg.$$('.page');
  for (let i = 0; i < pages.length; i++) {
    if (only && !only.includes(i + 1)) continue;
    await pages[i].screenshot({ path: path.join(dir, 'preview', `p${String(i + 1).padStart(2, '0')}.png`) });
  }
  await pg.pdf({ path: path.join(dir, 'Verdant_Foods_Product_Architecture_UX_Planning_Website_v1.pdf'), width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
  console.log('pages:', pages.length);
  await b.close();
})();

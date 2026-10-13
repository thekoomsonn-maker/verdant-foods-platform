"""Split the approved plan into two Product Architecture & UX Planning documents: Website and App."""
import re, glob, os, shutil

SRC = '/workspace/vdoc2'
S = {}
for f in sorted(glob.glob(f'{SRC}/parts/*.html')):
    s = open(f).read()
    for m in re.finditer(r'<!-- ([^>]+?) -->\s*(<section.*?</section>)', s, re.S):
        S[m.group(1)] = m.group(2)

def sec(name, *reps):
    h = S[name]
    for a, b in reps:
        assert a in h, (name, a[:60])
        h = h.replace(a, b)
    return h

FOOT = '<div class="foot"><span>Verdant Foods · Product plan</span><span class="pn"></span></div>'
def foot(label): return f'<div class="foot"><span>Verdant Foods · Product Architecture &amp; UX Planning · {label}</span><span class="pn"></span></div>'
F = lambda l: (FOOT, foot(l))

STRIP = '''<div class="strip" style="position:absolute;left:0;right:0;bottom:0"><span style="background:var(--deep)"></span><span style="background:var(--leaf)"></span><span style="background:var(--lime)"></span><span style="background:var(--sun)"></span><span style="background:var(--orange)"></span><span style="background:var(--tomato)"></span><span style="background:var(--blush)"></span><span style="background:var(--plum)"></span></div>'''
ART = re.search(r'<svg viewBox="0 0 360 400".*?</svg>', S['COVER'], re.S).group(0)

def cover(sub, covers, ref):
    return f'''<section class="page night" data-nofoot style="padding:0">
  <div style="position:absolute;inset:0;display:grid;grid-template-columns:7fr 5fr">
    <div style="padding:64px 0 0 64px;display:flex;flex-direction:column">
      <img src="assets/logo-cream.png" style="width:190px">
      <div style="margin-top:auto;margin-bottom:72px">
        <div style="font:600 18px Inter;color:var(--lime)">Verdant Foods Digital Platform · Phase 1</div>
        <div style="font:800 70px/.95 Bricolage;letter-spacing:-.03em;margin-top:18px">Product Architecture<br>&amp; UX Planning</div>
        <div style="font:700 34px/1.1 Bricolage;color:var(--lime);margin-top:18px">{sub}</div>
        <p style="font-size:16px;line-height:1.55;color:#C6D8D1;margin-top:24px;max-width:540px">{covers}</p>
      </div>
    </div>
    <div style="background:var(--deep);padding:64px 56px 0 48px;display:flex;flex-direction:column">
      {ART.replace('style="width:100%"','style="width:100%"')}
      <div style="margin-top:auto;margin-bottom:64px;font-size:15px;line-height:1.7;color:#C6D8D1">
        <div style="color:var(--cream);font-weight:600">Version 1.0 · October 2026</div>
        <div>Reference: {ref}</div>
        <div>Based on the Verdant Foods Business Plan<br>and Product Requirements (June 2026)</div>
        <div class="mt16">Prepared by NEXKOOMSON</div>
      </div>
    </div>
  </div>
  {STRIP}
</section>'''

def contents(items, intro):
    # items: list of (title, page)
    half = (len(items) + 1) // 2
    def tab(rows):
        return '<table>' + ''.join(f'<tr><td>{t}</td><td class="right m">{p}</td></tr>' for t, p in rows) + '</table>'
    return f'''<section class="page paper">
  <div class="g c-4-8 gap48">
    <div><div class="title" style="font-size:64px">Contents</div><p class="intro">{intro}</p></div>
    <div class="g c2 gap48" style="align-items:start">{tab(items[:half])}{tab(items[half:])}</div>
  </div>
  {FOOT}
</section>'''

def back(label, ref):
    return f'''<section class="page night" data-nofoot style="padding:0">
  <div style="position:absolute;inset:64px;display:flex;flex-direction:column">
    <img src="assets/logo-cream.png" style="width:160px">
    <div style="margin-top:auto">
      <div style="font:700 26px/1.2 Bricolage">Product Architecture &amp; UX Planning · {label}</div>
      <p style="font-size:16px;line-height:1.6;max-width:680px;color:#C6D8D1;margin-top:16px">Based on the Verdant Foods Business Plan and Product Requirements (June 2026), the Verdant logo and the reference images chosen by NEXKOOMSON. Where this plan adds ideas beyond Verdant's document, they are shown as our recommendations.</p>
      <p style="font-size:14px;color:#9FC0B6;margin-top:24px">Version 1.0 · October 2026 · {ref} · NEXKOOMSON for Verdant Foods</p>
    </div>
  </div>
  {STRIP}
</section>'''

def page(cls, secname, title, body, intro=''):
    i = f'<p class="intro">{intro}</p>' if intro else ''
    return f'''<section class="page {cls}">
  <div class="sec">{secname}</div>
  <div class="title">{title}</div>{i}
  {body}
  {FOOT}
</section>'''

# =====================================================================  WEBSITE
WEB = []
W = lambda t, h: WEB.append((t, h))

W(None, cover('Website',
    'The Verdant Foods Corporate Website, AgTech Marketplace, B2B Procurement Engine, Admin Interface and Traceability Matrix QR Journey Page.',
    'INV-NKL-00704'))
W(None, 'CONTENTS')
W('Verdant in one page', sec('SUMMARY'))
W('The problem and the plan', sec('PROBLEM + PLAN'))
W('How it all connects', sec('ECOSYSTEM'))
W('What the website includes', page('paper', 'What the website includes', 'Six parts, one website.', '''
  <div class="g c3 gap16 mt32">
    <div class="b deep"><h3>Verdant Foods Corporate Website</h3><p class="m s">The brand home: about Verdant, for business, for farmers and impact.</p></div>
    <div class="b lime"><h3>AgTech Marketplace</h3><p class="s" style="color:#2D5A3A">The shop: categories, products, farms, cart and checkout through the Unified Payment Gateway.</p></div>
    <div class="b sun"><h3>AgTech Marketplace: Consumer Accounts</h3><p class="s">Orders, saved items, addresses and payment methods for shoppers.</p></div>
    <div class="b orange"><h3>B2B Procurement Engine</h3><p class="s" style="color:#4A2400">Live farm inventory, filters, wholesale bids, repeat supply and invoices for businesses.</p></div>
    <div class="b night"><h3>Admin Interface</h3><p class="m s">Verdant's control room: farm checks, products, orders, deliveries, payments and VSLA oversight.</p></div>
    <div class="b plum"><h3>Traceability Matrix: QR Journey Page</h3><p class="m s">The public page a QR code opens, showing an order's journey from farm to door.</p></div>
  </div>
  <p class="s m mt24">Names follow Verdant's Business Plan and Product Requirements. The Corporate Website is our addition, as the document does not name one.</p>''',
  'Everything here is built in React / Next.js and previewed on Vercel. The farmer and savings app is planned in a separate document.'))
W('Who uses the website', page('', 'Who uses the website', 'Four kinds of website user', '''
  <div class="g c4 gap16 mt32">
    <div class="b white"><h3>Visitor</h3><p class="m s">Browses the site and shop without signing in. Can check out as a guest.</p></div>
    <div class="b lime"><h3>Shopper</h3><p class="s" style="color:#2D5A3A">Buys quickly and tracks orders. Account tools stay light.</p></div>
    <div class="b orange"><h3>Business buyer</h3><p class="s" style="color:#4A2400">Restaurants, hotels and shops. Needs stock, bids, deliveries and invoices.</p></div>
    <div class="b deep"><h3>Verdant team</h3><p class="m s">Checks farms, runs orders, deliveries and payments, and oversees everything.</p></div>
  </div>
  <table class="mx mt48" style="font-size:14px">
    <tr><th style="width:170px">User</th><th>Corporate Website</th><th>Marketplace</th><th>Consumer Accounts</th><th>B2B Procurement</th><th>Admin Interface</th><th>QR Journey Page</th></tr>
    <tr><td class="k">Visitor</td><td><i class="dot f"></i></td><td><i class="dot f"></i></td><td><i class="dot n"></i></td><td><i class="dot n"></i></td><td><i class="dot n"></i></td><td><i class="dot l"></i></td></tr>
    <tr><td class="k">Shopper</td><td><i class="dot f"></i></td><td><i class="dot f"></i></td><td><i class="dot f"></i></td><td><i class="dot n"></i></td><td><i class="dot n"></i></td><td><i class="dot l"></i></td></tr>
    <tr><td class="k">Business buyer</td><td><i class="dot f"></i></td><td><i class="dot p"></i></td><td><i class="dot n"></i></td><td><i class="dot f"></i></td><td><i class="dot n"></i></td><td><i class="dot l"></i></td></tr>
    <tr><td class="k">Verdant team</td><td><i class="dot f"></i></td><td><i class="dot p"></i></td><td><i class="dot p"></i></td><td><i class="dot p"></i></td><td><i class="dot f"></i></td><td><i class="dot l"></i></td></tr>
  </table>
  <div style="display:flex;gap:36px;margin-top:20px" class="s">
    <span style="display:flex;gap:8px;align-items:center"><i class="dot f"></i>Full use</span>
    <span style="display:flex;gap:8px;align-items:center"><i class="dot p"></i>Limited or view only</span>
    <span style="display:flex;gap:8px;align-items:center"><i class="dot l"></i>Comes in Phase 2</span>
    <span style="display:flex;gap:8px;align-items:center"><i class="dot n"></i>No access</span>
  </div>'''))
W('How the platform is built', sec('PLATFORM'))
W('Verdant Foods Corporate Website', sec('WEBSITE + SHOP', ('<div class="sec">Website and shop</div>', '<div class="sec">Verdant Foods Corporate Website</div>')))
W('AgTech Marketplace and Consumer Accounts', sec('CUSTOMER', ('<div class="sec">Customer account and checkout</div>', '<div class="sec">AgTech Marketplace and Consumer Accounts</div>')))
W('B2B Procurement Engine', sec('BUSINESS', ('<div class="sec">Business buyers</div>', '<div class="sec">B2B Procurement Engine</div>')))
W('Admin Interface', sec('ADMIN', ('<div class="sec">Verdant team tools</div>', '<div class="sec">Admin Interface</div>')))
W('Traceability Matrix: QR Journey Page', sec('TRACE 1', ('<div class="sec">Tracing food from farm to plate</div>', '<div class="sec">Traceability Matrix: QR Journey Page</div>')))
W(None, sec('TRACE 2', ('<div class="sec">Tracing food from farm to plate</div>', '<div class="sec">Traceability Matrix: QR Journey Page</div>')))
W('Key journeys', sec('JOURNEYS 1'))
W('How screens should behave', sec('BEHAVIOUR'))
W('How we keep the website simple', page('', 'How we keep the website simple', 'Our recommendations', '''
  <table class="mt32">
    <tr><th style="width:300px">Question</th><th>Our answer</th></tr>
    <tr><td class="k">Are the menus too long?</td><td>No. The Admin Interface uses 5 groups and the B2B Procurement Engine 7 items.</td></tr>
    <tr><td class="k">Does B2B have the right focus?</td><td>Yes. Built for speed, with bids as Verdant's document describes.</td></tr>
    <tr><td class="k">Is the shopper account too busy?</td><td>No. Orders first, "Buy again", and no charts.</td></tr>
    <tr><td class="k">Is the Admin Interface well organised?</td><td>Yes. Grouped by Sales, People, Trust, Money and Settings, with a queue for farm checks.</td></tr>
    <tr><td class="k">Is tracing pitched right for Phase 1?</td><td>Yes. Products show farm and harvest date in Phase 1; the public QR Journey Page goes live in Phase 2.</td></tr>
    <tr><td class="k">Can guests buy without an account?</td><td>Yes. Name, phone and address, with updates by SMS.</td></tr>
  </table>'''))
W('Look and feel', sec('COLOUR'))
W(None, sec('TYPE'))
W(None, sec('COMPONENTS'))
W(None, sec('REFERENCES'))
W('Phones, tablets and computers', sec('DEVICES', ('<td class="k">Farmer stock</td><td>Table</td><td>Shorter table</td><td>Cards</td>', '<td class="k">B2B inventory</td><td>Table</td><td>Shorter table</td><td>Cards</td>')))
W('Payments on the website', page('paper', 'Payments on the website', 'Pay the way Ghana pays.', '''
  <div class="g c6 gap16 mt32" style="grid-template-columns:repeat(6,1fr)">
    <div class="b sun" style="padding:18px"><h4>MTN MoMo</h4></div><div class="b tomato" style="padding:18px"><h4>Telecel Cash</h4></div>
    <div class="b blush" style="padding:18px"><h4>AT Money</h4></div><div class="b deep" style="padding:18px"><h4>Visa</h4></div>
    <div class="b deep" style="padding:18px"><h4>Mastercard</h4></div><div class="b" style="padding:18px"><h4>Ghanaian banks</h4></div>
  </div>
  <table class="mt32">
    <tr><th style="width:220px">Who</th><th>How they pay</th><th>Where</th></tr>
    <tr><td class="k">Shoppers and guests</td><td>MoMo on all three networks, or Visa / Mastercard</td><td>AgTech Marketplace checkout</td></tr>
    <tr><td class="k">Business buyers</td><td>Bank transfer or company card against invoices</td><td>B2B Procurement Engine</td></tr>
    <tr><td class="k">Verdant team</td><td>Sees every payment in and every payout out</td><td>Admin Interface</td></tr>
  </table>
  <p class="s m mt24">Every payment screen shows a clear "Waiting for payment" state until the payment provider confirms.</p>'''))
W('Roadmap', page('', 'Roadmap', 'Build the base, then trust, then finance.', '''
  <div style="display:grid;grid-template-columns:6fr 12fr 8fr;margin-top:32px;font:600 14px Inter">
    <div style="background:var(--deep);color:var(--lime);padding:12px 16px;border-radius:10px 0 0 10px">Months 1 to 6</div>
    <div style="background:var(--orange);padding:12px 16px">Months 7 to 18</div>
    <div style="background:var(--plum);color:var(--blush);padding:12px 16px;border-radius:0 10px 10px 0">Month 19 onward</div>
  </div>
  <div class="g c3 gap32 mt24">
    <div><h3>Phase 1: pilot</h3><ul class="l mt16 s"><li>Verdant Foods Corporate Website</li><li>AgTech Marketplace with checkout</li><li>Consumer Accounts</li><li>B2B Procurement Engine with bids and repeat supply</li><li>Admin Interface with farm checks</li><li>Farm and harvest date on every product</li></ul></div>
    <div><h3>Phase 2: tracing and delivery</h3><ul class="l mt16 s"><li>QR Journey Page goes public</li><li>QR code on every order</li><li>Collection and delivery tracking</li><li>Soil and carbon filters fully live</li><li>Better reports</li></ul></div>
    <div><h3>Phase 3: finance</h3><ul class="l mt16 s"><li>Invoice financing for businesses</li><li>Carbon rewards shown on farm profiles</li></ul></div>
  </div>'''))
W('Who builds what', sec('WHO BUILDS WHAT', ('<tr><td class="k">Offline</td><td>Saving on the phone and "sending" messages</td><td>Receiving and merging offline entries</td><td>How phones and server sync</td></tr>', '')))
W('What we need from the backend', sec('BACKEND NEEDS', ('<td><b>How offline entries are synced</b></td>', '<td><b>Payment provider details</b> for checkout and invoices</td>')))
W('How we work and what\'s next', page('', 'How we work and what\'s next', 'Figma first. Test three screens, then build the rest.', '''
  <div class="jr mt32" style="grid-template-columns:repeat(4,1fr)">
    <div class="st deep"><div class="n">1</div><h4>Plan</h4><p>Done: this document</p></div>
    <div class="st lime"><div class="n">2</div><h4>Design Lab</h4><p>Colours, type and building blocks in Figma</p></div>
    <div class="st lime"><div class="n">3</div><h4>Three test screens</h4><p>Homepage, Marketplace, Admin dashboard</p></div>
    <div class="st"><div class="n">4</div><h4>Review</h4><p>Approve the look before building more</p></div>
  </div>
  <div class="jr mt8" style="grid-template-columns:repeat(4,1fr)">
    <div class="st"><div class="n">5</div><h4>All screens</h4><p>Accounts, B2B, Admin, QR Journey Page</p></div>
    <div class="st"><div class="n">6</div><h4>Figma prototype</h4><p>Clickable, for Verdant to test</p></div>
    <div class="st"><div class="n">7</div><h4>Build</h4><p>React / Next.js from the approved designs</p></div>
    <div class="st deep"><div class="n">8</div><h4>Preview and hand over</h4><p>On Vercel, then connect the backend</p></div>
  </div>
  <p class="mt32" style="font:700 20px/1.35 Bricolage;color:var(--deep);max-width:820px">Estimated delivery: 4 to 5 weeks, with planning, design and build overlapping where practical.</p>'''))
W('Decisions made', page('paper', 'Decisions made', 'Key decisions for the website', '''
  <div class="g c2 gap48 mt32">
    <table style="font-size:15px;line-height:1.5">
      <tr><td class="k" style="width:150px">Guest checkout</td><td>Yes. Name, phone and address; updates by SMS</td></tr>
      <tr><td class="k">Stock-up packs</td><td>Yes, as ready-made bundles. No shopper subscriptions in Phase 1.</td></tr>
      <tr><td class="k">Bids</td><td>Farmer accepts, declines or counters once. 48 hours to reply.</td></tr>
      <tr><td class="k">QR codes</td><td>One per order. Business deliveries also get one per crate.</td></tr>
    </table>
    <table style="font-size:15px;line-height:1.5">
      <tr><td class="k" style="width:150px">Trace numbers</td><td>VF-TOM-00042, made by the backend</td></tr>
      <tr><td class="k">Payments</td><td>MTN MoMo, Telecel Cash, AT Money, Visa, Mastercard, Ghanaian banks</td></tr>
      <tr><td class="k">Photography</td><td>Art-directed photography and video for marketing; real farmer photos on records</td></tr>
      <tr><td class="k">Hosting</td><td>Previews on Vercel; Verdant's own account for launch</td></tr>
    </table>
  </div>'''))
W(None, back('Website', 'INV-NKL-00704'))

# =====================================================================  APP
APP = []
A = lambda t, h: APP.append((t, h))
A(None, cover('Client Application<br>(Farmers &amp; VSLAs)',
    'An Android app that works offline, for Vendor Onboarding &amp; Verification, Batch Inventory &amp; Tracking and the Digital VSLA Ledger.',
    'INV-NKL-00705'))
A(None, 'CONTENTS')
A('The app in one page', page('paper', 'The app in one page', 'One app for the people who grow the food.', '''
  <div class="g c4 gap16 mt32">
    <div class="b lime"><h3>Farm</h3><p class="s" style="color:#2D5A3A">Farm profile, harvest logging with trace numbers, stock and orders</p></div>
    <div class="b plum"><h3>Savings group</h3><p class="m s">Members, group rules, meetings, loans and the ledger</p></div>
    <div class="b deep"><h3>Money</h3><p class="m s">Payments due and paid, to MoMo or bank</p></div>
    <div class="b orange"><h3>Works offline</h3><p class="s" style="color:#4A2400">Saves on the phone first, sends when signal returns</p></div>
  </div>
  <table class="mt32">
    <tr><td class="k" style="width:220px">Built with</td><td>Flutter, for Android first</td></tr>
    <tr><td class="k">Size</td><td>Under 15MB, so it installs on low-cost phones, as Verdant's document requires</td></tr>
    <tr><td class="k">Languages at launch</td><td>English, Twi, Dagbani and Dagaare, with voice prompts</td></tr>
    <tr><td class="k">Shoppers</td><td>Buy on the AgTech Marketplace website in Phase 1, not in this app</td></tr>
  </table>''',
  'Verdant\'s document calls it the Client Application. In Phase 1 it serves farmers and savings groups (VSLAs).'))
A('Who uses the app', page('', 'Who uses the app', 'Four kinds of app user', '''
  <div class="g c4 gap16 mt32">
    <div class="b lime"><h3>Farmer</h3><p class="s" style="color:#2D5A3A">Uses a phone, often with weak signal. Needs few steps and clear words.</p></div>
    <div class="b plum"><h3>VSLA member</h3><p class="m s">Sees their own savings, shares and loans.</p></div>
    <div class="b plum"><h3>VSLA admin</h3><p class="m s">Records meetings, members and group rules for the whole group.</p></div>
    <div class="b deep"><h3>Extension officer</h3><p class="m s">Signs up farmers and groups in the field and sends farms for checking.</p></div>
  </div>
  <table class="mx mt48" style="font-size:14px">
    <tr><th style="width:200px">User</th><th>Farm space</th><th>Log harvest</th><th>Money</th><th>Savings group</th><th>Group admin tools</th><th>Sign up others</th></tr>
    <tr><td class="k">Farmer</td><td><i class="dot f"></i></td><td><i class="dot f"></i></td><td><i class="dot f"></i></td><td><i class="dot p"></i></td><td><i class="dot n"></i></td><td><i class="dot n"></i></td></tr>
    <tr><td class="k">VSLA member</td><td><i class="dot n"></i></td><td><i class="dot n"></i></td><td><i class="dot p"></i></td><td><i class="dot p"></i></td><td><i class="dot n"></i></td><td><i class="dot n"></i></td></tr>
    <tr><td class="k">VSLA admin</td><td><i class="dot n"></i></td><td><i class="dot n"></i></td><td><i class="dot p"></i></td><td><i class="dot f"></i></td><td><i class="dot f"></i></td><td><i class="dot n"></i></td></tr>
    <tr><td class="k">Extension officer</td><td><i class="dot p"></i></td><td><i class="dot p"></i></td><td><i class="dot n"></i></td><td><i class="dot p"></i></td><td><i class="dot n"></i></td><td><i class="dot f"></i></td></tr>
  </table>
  <div style="display:flex;gap:36px;margin-top:20px" class="s">
    <span style="display:flex;gap:8px;align-items:center"><i class="dot f"></i>Full use</span>
    <span style="display:flex;gap:8px;align-items:center"><i class="dot p"></i>Own records, or helping someone else</span>
    <span style="display:flex;gap:8px;align-items:center"><i class="dot n"></i>No access</span>
  </div>
  <p class="s m mt16">One person can be a farmer and a VSLA member at the same time; the app shows both spaces.</p>'''))
A('How the app fits the platform', page('paper', 'How the app fits the platform', 'Same data, different door.', '''
  <div style="display:grid;grid-template-columns:1fr 60px 1fr 60px 1fr;align-items:center;margin-top:40px">
    <div class="b lime" style="padding:26px"><h3>Client Application</h3><p class="s mt8" style="color:#2D5A3A">Farmers and VSLAs record farms, harvests, orders and savings.</p></div>
    <svg width="60" height="40" viewBox="0 0 60 40"><path d="M4 14h44" stroke="#024639" stroke-width="3"/><path d="M42 6l12 8-12 8z" fill="#024639"/><path d="M56 30H12" stroke="#6C1144" stroke-width="3"/><path d="M18 22L6 30l12 8z" fill="#6C1144"/></svg>
    <div class="b night" style="padding:26px"><h3>Verdant backend</h3><p class="m s mt8">One shared record of farms, harvests, orders, payouts and savings. Built by Verdant's backend developer.</p></div>
    <svg width="60" height="40" viewBox="0 0 60 40"><path d="M4 14h44" stroke="#024639" stroke-width="3"/><path d="M42 6l12 8-12 8z" fill="#024639"/><path d="M56 30H12" stroke="#6C1144" stroke-width="3"/><path d="M18 22L6 30l12 8z" fill="#6C1144"/></svg>
    <div class="b deep" style="padding:26px"><h3>Website</h3><p class="m s mt8">Shoppers and businesses buy the harvests; the Verdant team checks and runs everything.</p></div>
  </div>
  <table class="mt48">
    <tr><td class="k" style="width:300px">A harvest logged in the app</td><td>appears on the AgTech Marketplace and in the B2B Procurement Engine once approved</td></tr>
    <tr><td class="k">An order placed on the website</td><td>appears in the farmer's Orders tab</td></tr>
    <tr><td class="k">A farm sent for checking</td><td>appears in the Admin Interface queue</td></tr>
    <tr><td class="k">A payment to a farmer</td><td>shows in the Money tab, and can go into their savings group</td></tr>
  </table>'''))
A('How the app is organised', page('', 'How the app is organised', 'Two spaces, one simple app.', '''
  <div class="g c2 gap32 mt32">
    <div class="b lime" style="padding:26px">
      <h3>Farm space</h3>
      <div class="g c2 gap16 mt16 s" style="color:#2D5A3A">
        <div><b style="color:var(--deep)">Home</b><br>Today's orders, collections, money due</div>
        <div><b style="color:var(--deep)">Log harvest</b><br>The big central button</div>
        <div><b style="color:var(--deep)">Stock</b><br>Each harvest, what's left, price</div>
        <div><b style="color:var(--deep)">Orders</b><br>Accept and hand over</div>
        <div><b style="color:var(--deep)">Money</b><br>Payments due and paid</div>
        <div><b style="color:var(--deep)">My farm</b><br>Location, size, methods, check status</div>
      </div>
    </div>
    <div class="b plum" style="padding:26px">
      <h3>Savings group space</h3>
      <div class="g c2 gap16 mt16 s" style="color:#EBCFDC">
        <div><b style="color:var(--cream)">Overview</b><br>Group savings, loans out, cash box</div>
        <div><b style="color:var(--cream)">Meeting</b><br>Record everyone in one pass</div>
        <div><b style="color:var(--cream)">Members</b><br>Add members, see balances</div>
        <div><b style="color:var(--cream)">Loans</b><br>Give out, repay, interest</div>
        <div><b style="color:var(--cream)">Ledger</b><br>Every transaction, in order</div>
        <div><b style="color:var(--cream)">Group rules</b><br>Share price, interest, cycle</div>
      </div>
    </div>
  </div>
  <p class="mt32" style="font-size:16px">Sign in with phone number and PIN. A switch at the top moves between the two spaces. Language and sync status are always one tap away.</p>'''))
A('Farmer screens', sec('FARMER', ('<div class="sec">Farmer app</div>', '<div class="sec">Farmer screens</div>')))
A('Logging a harvest', page('paper', 'Logging a harvest', 'Five steps, under two minutes, with or without signal.', '''
  <div class="jr mt32" style="grid-template-columns:repeat(5,1fr)">
    <div class="st"><div class="n">1</div><h4>Crop</h4><p>Pick from pictures: tomato, garden egg, yam, maize</p></div>
    <div class="st"><div class="n">2</div><h4>How much</h4><p>Big number pad, then kg, crate or bunch</p></div>
    <div class="st"><div class="n">3</div><h4>When and where</h4><p>Harvest date and which plot</p></div>
    <div class="st"><div class="n">4</div><h4>Photo and methods</h4><p>One photo; tick the farming methods used</p></div>
    <div class="st lime"><div class="n">5</div><h4>Price and save</h4><p>Set price, tap save</p></div>
  </div>
  <div class="g c2 gap32 mt32">
    <div class="b deep" style="padding:26px"><p class="m s">Right after saving</p><div class="id" style="font-size:34px;color:var(--lime);margin-top:8px">VF-TOM-00042</div><p class="m s mt16">The trace number appears at once, even offline, from a reserve of numbers kept on the phone.</p></div>
    <div><h3>What this covers in Verdant's document</h3><p class="m mt8">Batch Inventory &amp; Tracking: every harvest is a batch with a permanent trace number. Photos and farming methods are added to the farm's record. The photos are always real, taken by the farmer.</p></div>
  </div>'''))
A('Savings groups (VSLA)', sec('VSLA'))
A('Key journeys', sec('JOURNEYS 2', ('<h3 style="color:var(--leaf)">Farmer</h3>', '<div class="sec">Key journeys</div><h3 style="color:var(--leaf)">Farmer</h3>')))
A('Working offline', page('', 'Working offline', 'No signal is normal. The app never waits for it.', '''
  <div class="jr mt32" style="grid-template-columns:repeat(4,1fr)">
    <div class="st"><div class="n">1</div><h4>Save on the phone</h4><p>Every entry is stored on the phone first</p></div>
    <div class="st"><div class="n">2</div><h4>Show it's waiting</h4><p>"2 entries saved, will send when online"</p></div>
    <div class="st"><div class="n">3</div><h4>Send when signal returns</h4><p>Works on 2G, 3G or 4G, in the background</p></div>
    <div class="st lime"><div class="n">4</div><h4>Confirm</h4><p>"All sent", with the time</p></div>
  </div>
  <table class="mt32">
    <tr><th style="width:280px">Situation</th><th>What the app does</th></tr>
    <tr><td class="k">Logging a harvest offline</td><td>Saves it and gives the final trace number straight away</td></tr>
    <tr><td class="k">Recording a savings meeting offline</td><td>Saves the whole meeting; totals are locked once the group agrees</td></tr>
    <tr><td class="k">The same record changed twice</td><td>The newest change wins; the VSLA admin is told if a meeting record clashes</td></tr>
    <tr><td class="k">Money figures</td><td>Always show when they were last updated, so nobody trusts an old balance</td></tr>
  </table>
  <p class="s m mt16">Verdant's document asks for this offline-first mode. The backend developer builds the receiving side of the sync.</p>'''))
A('Languages and payouts', sec('LANGUAGES + PAYMENTS',
    ('<div class="title">Speak the farmer\'s language. Pay the way Ghana pays.</div>', '<div class="title">Speak the farmer\'s language. Pay the way farmers get paid.</div>'),
    ('<h3>Languages in the farmer and savings app</h3>', '<h3>Languages in the app</h3>'),
    ('<h3>Ways to pay and get paid</h3>', '<h3>Where money goes</h3>'),
    ('<tr><td class="k" style="width:150px">Shoppers</td><td>MoMo (all three networks) or card</td></tr>\n        <tr><td class="k">Businesses</td><td>Bank transfer or company card</td></tr>\n        ', ''),
    ('<div class="b deep" style="padding:18px"><h4>Visa</h4></div>\n        <div class="b deep" style="padding:18px"><h4>Mastercard</h4></div>\n        ', ''),
    ('<div class="g c3 gap16 mt16">', '<div class="g c2 gap16 mt16">')))
A('Look and feel', sec('COLOUR'))
A(None, page('paper', 'Look and feel', 'Built for thumbs, sunlight and small screens', '''
  <div class="g c3 gap32 mt32">
    <div><h4 class="m">Big buttons</h4>
      <div style="display:grid;gap:10px;margin-top:12px"><span style="background:var(--deep);color:var(--lime);padding:18px;border-radius:14px;font:700 18px Inter;text-align:center">+ Log harvest</span><span style="background:var(--lime);color:var(--deep);padding:18px;border-radius:14px;font:700 18px Inter;text-align:center">Accept order</span></div>
      <p class="s m mt16">At least 48 pixels tall. Labels in plain words with an icon.</p></div>
    <div><h4 class="m">Sync banner</h4>
      <div style="background:var(--sun-s);color:#8A5A05;border-radius:12px;padding:14px 16px;margin-top:12px;font:600 14px Inter">2 entries saved, will send when online</div>
      <div style="background:#E2F2CF;color:#3F6E08;border-radius:12px;padding:14px 16px;margin-top:10px;font:600 14px Inter">All sent · 9:41</div>
      <p class="s m mt16">Always visible at the top of the Farm and Savings spaces.</p></div>
    <div><h4 class="m">Money card</h4>
      <div class="b white" style="margin-top:12px"><p class="s m">Group savings</p><div style="font:800 34px/1.1 Bricolage;color:var(--plum);margin-top:6px">GH₵ 18,450</div><p class="s m">Updated today, 9:41</p></div>
      <p class="s m mt16">Big figures, small decimals, and the time last updated.</p></div>
  </div>
  <p class="mt32" style="font:700 20px/1.35 Bricolage;color:var(--deep);max-width:860px">Strong contrast for outdoor light, text never below 14px on the phone, and pictures next to crop names.</p>'''))
A('Testing and release', page('', 'Testing and release', 'Three ways for Verdant to try the app.', '''
  <div class="g c3 gap24 mt32">
    <div class="b deep" style="padding:26px"><div class="big" style="color:var(--lime);font-size:48px">1</div><h3 class="mt16">Browser preview</h3><p class="m s mt8">A link on Vercel to click through the screens on any phone or laptop. Best for design and flow reviews.</p></div>
    <div class="b lime" style="padding:26px"><div class="big" style="color:var(--deep);font-size:48px">2</div><h3 class="mt16">Test installs</h3><p class="s mt8" style="color:#2D5A3A">Testers install from an email invite (Firebase App Distribution, free) and get every update. The real test of offline use.</p></div>
    <div class="b plum" style="padding:26px"><div class="big" style="color:var(--blush);font-size:48px">3</div><h3 class="mt16">Play Store</h3><p class="m s mt8">Internal testing, then public release, through Verdant's own Google Play account.</p></div>
  </div>
  <table class="mt32">
    <tr><td class="k" style="width:260px">Test on a low-cost phone</td><td>A phone like the ones farmers use, to check speed and size</td></tr>
    <tr><td class="k">Test with weak signal</td><td>Switch data off and on during harvest logging and meetings</td></tr>
    <tr><td class="k">Test in every launch language</td><td>Native speakers check the wording and voice prompts</td></tr>
  </table>'''))
A('Roadmap', page('paper', 'Roadmap', 'Start simple, add finance later.', '''
  <div style="display:grid;grid-template-columns:6fr 12fr 8fr;margin-top:32px;font:600 14px Inter">
    <div style="background:var(--deep);color:var(--lime);padding:12px 16px;border-radius:10px 0 0 10px">Months 1 to 6</div>
    <div style="background:var(--orange);padding:12px 16px">Months 7 to 18</div>
    <div style="background:var(--plum);color:var(--blush);padding:12px 16px;border-radius:0 10px 10px 0">Month 19 onward</div>
  </div>
  <div class="g c3 gap32 mt24">
    <div><h3>Phase 1: pilot</h3><p class="s m mt8">20 savings groups</p><ul class="l mt16 s"><li>Farm profile and checks</li><li>Harvest logging with trace numbers</li><li>Stock, orders and money</li><li>Savings groups: rules, meetings, loans, ledger</li><li>Offline saving and sync</li><li>English, Twi, Dagbani, Dagaare</li></ul></div>
    <div><h3>Phase 2: tracing and delivery</h3><ul class="l mt16 s"><li>Collection and delivery steps in the app</li><li>Printing QR crate labels at collection</li><li>Gonja, Waale, Ewe and Ga</li></ul></div>
    <div><h3>Phase 3: finance</h3><ul class="l mt16 s"><li>Weather-based crop insurance</li><li>Carbon rewards for farmers</li><li>Credit scores from savings and sales</li><li>Small investments</li></ul></div>
  </div>'''))
A('Who builds what', page('', 'Who builds what', 'Clear lines, so connecting the backend needs no redesign', '''
  <table class="mt32">
    <tr><th style="width:150px"></th><th>NEXKOOMSON builds</th><th>Verdant's backend developer builds</th><th>We agree together</th></tr>
    <tr><td class="k">Design</td><td>All app screens in Figma, in every state</td><td></td><td>Status names and messages</td></tr>
    <tr><td class="k">App</td><td>The Flutter app, test builds and Play Store release</td><td></td><td></td></tr>
    <tr><td class="k">Sign-in</td><td>Phone and PIN screens, who sees what</td><td>Accounts and permissions</td><td>The list of roles</td></tr>
    <tr><td class="k">Offline</td><td>Saving on the phone and sending when online</td><td>Receiving and merging offline entries</td><td>How phones and server sync</td></tr>
    <tr><td class="k">Tracing</td><td>Harvest logging and trace number display</td><td>Trace numbers and the reserve given to phones</td><td>Number format</td></tr>
    <tr><td class="k">Money</td><td>Payout and savings screens</td><td>MoMo and bank connections</td><td>Payment status names</td></tr>
    <tr><td class="k">Languages</td><td>App wording in every language, voice playback</td><td></td><td>Translations by native speakers, at cost</td></tr>
  </table>'''))
A('What we need from the backend', page('paper', 'What we need from the backend', 'Eight things that make connecting smooth', '''
  <div class="g c2 gap48 mt32">
    <table>
      <tr><td class="k" style="width:36px">1</td><td><b>Technical documentation</b> of what the backend offers</td></tr>
      <tr><td class="k">2</td><td><b>Phone and PIN sign-in</b> and roles</td></tr>
      <tr><td class="k">3</td><td><b>The fields</b> for farms, harvests, orders, groups, members and loans</td></tr>
      <tr><td class="k">4</td><td><b>How offline entries are synced</b></td></tr>
    </table>
    <table>
      <tr><td class="k" style="width:36px">5</td><td><b>How trace numbers are reserved</b> for phones</td></tr>
      <tr><td class="k">6</td><td><b>Photo upload rules</b></td></tr>
      <tr><td class="k">7</td><td><b>Payout status names</b> for MoMo and bank</td></tr>
      <tr><td class="k">8</td><td><b>Test logins and test addresses</b></td></tr>
    </table>
  </div>
  <div class="b deep mt48" style="padding:26px 28px"><p style="font:700 20px/1.35 Bricolage">Already set by Verdant's document: secure connections, encrypted data and identity checks for wallets. We build around these.</p></div>'''))
A('How we work and what\'s next', page('', 'How we work and what\'s next', 'Design with the website, build after approval.', '''
  <div class="jr mt32" style="grid-template-columns:repeat(4,1fr)">
    <div class="st deep"><div class="n">1</div><h4>Plan</h4><p>Done: this document</p></div>
    <div class="st lime"><div class="n">2</div><h4>App screens in Figma</h4><p>Farm space, Savings space, offline states</p></div>
    <div class="st lime"><div class="n">3</div><h4>Figma prototype</h4><p>Clickable, for Verdant to try</p></div>
    <div class="st"><div class="n">4</div><h4>Approval</h4><p>Sign off the design</p></div>
  </div>
  <div class="jr mt8" style="grid-template-columns:repeat(4,1fr)">
    <div class="st"><div class="n">5</div><h4>Build</h4><p>Flutter app, Android first</p></div>
    <div class="st"><div class="n">6</div><h4>Test installs</h4><p>Farmers and VSLAs try it on real phones</p></div>
    <div class="st"><div class="n">7</div><h4>Connect backend</h4><p>Sync, payouts, trace numbers</p></div>
    <div class="st plum"><div class="n">8</div><h4>Play Store release</h4><p>Through Verdant's account</p></div>
  </div>
  <p class="mt32" style="font:700 20px/1.35 Bricolage;color:var(--deep);max-width:820px">Estimated build: 6 to 8 weeks after the design is approved.</p>'''))
A('Decisions made', page('paper', 'Decisions made', 'Key decisions for the app', '''
  <div class="g c2 gap48 mt32">
    <table style="font-size:15px;line-height:1.5">
      <tr><td class="k" style="width:160px">Platform</td><td>Flutter, Android first, under 15MB, works offline</td></tr>
      <tr><td class="k">Who it's for</td><td>Farmers and VSLAs. Shoppers use the website in Phase 1.</td></tr>
      <tr><td class="k">Extension officers</td><td>Yes, from Phase 1</td></tr>
      <tr><td class="k">Trace numbers</td><td>Made by the backend, with a reserve kept on each phone</td></tr>
    </table>
    <table style="font-size:15px;line-height:1.5">
      <tr><td class="k" style="width:160px">Payouts</td><td>MTN MoMo, Telecel Cash, AT Money or a Ghanaian bank account</td></tr>
      <tr><td class="k">Languages</td><td>English, Twi, Dagbani, Dagaare at launch; Gonja, Waale, Ewe, Ga in the pilot year</td></tr>
      <tr><td class="k">Photos</td><td>Real photos taken by farmers on every harvest record</td></tr>
      <tr><td class="k">Play Store</td><td>Released under Verdant's own account (US$25 one-time)</td></tr>
    </table>
  </div>'''))
A(None, back('Client Application (Farmers &amp; VSLAs)', 'INV-NKL-00705'))

HEAD = '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>{t}</title><link rel="stylesheet" href="styles.css"></head><body>'

def build(name, items, label, intro, title):
    d = f'/workspace/{name}'
    os.makedirs(f'{d}/parts', exist_ok=True)
    for x in ['styles.css', 'fonts', 'assets', 'node_modules', 'package.json']:
        if not os.path.exists(f'{d}/{x}'):
            (shutil.copytree if os.path.isdir(f'{SRC}/{x}') else shutil.copy)(f'{SRC}/{x}', f'{d}/{x}')
    toc = [(t, i + 1) for i, (t, _) in enumerate(items) if t]
    out = HEAD.format(t=title)
    for t, h in items:
        if h == 'CONTENTS':
            h = contents(toc, intro)
        out += '\n' + h.replace(FOOT, foot(label))
    for f in glob.glob(f'{d}/parts/*.html'): os.remove(f)
    open(f'{d}/parts/01.html', 'w').write(out)
    b = open(f'{SRC}/build.js').read().replace('Verdant_Foods_Product_Plan_v1.pdf', f'{title}.pdf')
    open(f'{d}/build.js', 'w').write(b)
    print(name, len(items), 'pages')

build('plan-web', WEB, 'Website', 'Planning for the Verdant Foods website, written in plain language for Verdant, our design team and the developers who will build it.',
      'Verdant_Foods_Product_Architecture_UX_Planning_Website_v1')
build('plan-app', APP, 'Client Application', 'Planning for the Verdant Foods Client Application for farmers and VSLAs, written in plain language.',
      'Verdant_Foods_Product_Architecture_UX_Planning_App_v1')

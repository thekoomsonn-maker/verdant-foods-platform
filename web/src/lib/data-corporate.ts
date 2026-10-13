// Mock content for the corporate pages (About, Farmers, Business, Trace, Impact, Stories, Careers, Help, Legal).
import { STORIES } from "./data";

export type Story = (typeof STORIES)[number];

/* ---------- FAQs ---------- */
export const FARMER_FAQ: [string, string][] = [
  ["What does it cost to join?", "Nothing. Verdant takes a small fee only when your produce is sold, and you see it before you agree a price."],
  ["Which crops do you buy?", "Tomatoes, peppers, garden eggs, okra, onions, leafy greens, yam, plantain, maize and fruit. Your field officer will tell you what buyers need this season."],
  ["How soon am I paid?", "Within 48 hours of collection, straight to MTN MoMo, Telecel Cash or AT Money. You get a text with every payment."],
  ["Do I need a smartphone?", "No. A field officer can log harvests for you, and you get offers and payment messages by SMS on any phone."],
];

export const HELP_FAQ: [string, string][] = [
  ["When will my order arrive?", "Orders placed before 8 pm arrive the next day in Accra, Kumasi and Tamale. You choose a two-hour slot at checkout."],
  ["Can I pay with mobile money?", "Yes. We take MTN MoMo, Telecel Cash and AT Money, as well as Visa and Mastercard. Business accounts can also pay by invoice."],
  ["What if something arrives damaged?", "Report it from your order page within 24 hours with a photo. We refund or replace it, usually the same day."],
  ["What does the code on my bag show?", "The farm and farmer, the harvest date, the spray record and every handover on the way to you. Scan it or type it on our trace page."],
];

/* ---------- Careers ---------- */
export type Role = { title: string; team: string; place: string; type: string; group: "Field" | "Packhouse" | "Tech" | "Sales"; about: string };
export const ROLES: Role[] = [
  { title: "Field officer", team: "Farm support", place: "Tolon", type: "Full time", group: "Field", about: "Visit farms each week, map plots, check spray records and help farmers log harvests. You need a motorbike licence and Dagbani." },
  { title: "Field officer", team: "Farm support", place: "Wa", type: "Full time", group: "Field", about: "Support farmer groups around Wa and Nadowli. You will run farm checks and train new farmers on the app. Dagaare or Waale helps." },
  { title: "Packhouse lead", team: "Operations", place: "Tamale", type: "Full time", group: "Packhouse", about: "Run the morning shift at our Tamale packhouse: sorting, grading, weighing and labelling every crate with its trace code." },
  { title: "Cold-chain driver", team: "Logistics", place: "Tamale", type: "Full time", group: "Packhouse", about: "Drive our chilled vans between Tamale, Kumasi and Accra. You keep the temperature log and confirm every handover." },
  { title: "Flutter developer", team: "Product", place: "Accra or remote", type: "Full time", group: "Tech", about: "Build the farmer and field officer apps. They work offline, in eight languages, on low-cost Android phones." },
  { title: "Business sales manager", team: "Sales", place: "Accra", type: "Full time", group: "Sales", about: "Look after hotels, restaurants and supermarkets buying from Verdant, and set up their weekly orders and supply agreements." },
  { title: "Data intern", team: "Product", place: "Accra", type: "6 months", group: "Tech", about: "Help us measure farmer income, freshness and waste. You will work with our reports and the impact team." },
];

/* ---------- Story articles ---------- */
export type Article = {
  lede: string; author: string; initials: string; date: string; read: string; hero: string;
  intro: string[]; quote: string; stats: [string, string][]; sub: string; body: string; image: string; close: string;
};
export const ARTICLES: Record<string, Article> = {
  "amina-doubled-her-tomato-plot": {
    lede: "A fair price agreed before harvest changed how she plans her season.", author: "Kojo Mensah", initials: "KM", date: "12 Oct 2026", read: "3 min read", hero: "/img/hands-tomato.jpg",
    intro: ["Two years ago, Amina Seidu sold her tomatoes to whoever reached Nyankpala first. Some weeks the price covered her costs. Many weeks it did not.", "Now her group agrees a price with Verdant before planting. She knows what each crate will earn, so she planted twice as much."],
    quote: "“I stopped guessing. Now I plan.”", stats: [["4 ha", "Tomato plot, up from 2"], ["GH₵ 5,800", "Earned this season"]],
    sub: "What changed", body: "A field officer mapped her plot and logs every spray. Buyers in Accra scan a code and see her name, her farm and the day she picked.",
    image: "/img/farmer-amina.jpg", close: "Next season she wants a small cool room, paid for by her savings group.",
  },
  "every-plot-is-now-on-the-map": {
    lede: "Our field officers have walked the boundary of every farm that sells through Verdant.", author: "Abena Osei", initials: "AO", date: "8 Oct 2026", read: "2 min read", hero: "/img/officer-tablet.jpg",
    intro: ["Since June, twelve field officers have walked the edge of every plot with a GPS tablet. It took 640 visits across seven districts.", "Each plot now shows on the trace page for every order that came from it."],
    quote: "“A buyer in Accra can see the same field I am standing in.”", stats: [["100%", "Selling farms mapped"], ["640", "Farm visits"]],
    sub: "Why it matters", body: "A mapped plot means we can show you exactly where your food grew, and check that it is not near a river bank or protected forest.",
    image: "/img/aerial-plots.jpg", close: "New farms are mapped on their first visit, before they can sell.",
  },
  "how-osu-kitchen-plans-its-week": {
    lede: "A busy Accra restaurant swapped market runs for a standing weekly order.", author: "Kojo Mensah", initials: "KM", date: "2 Oct 2026", read: "4 min read", hero: "/img/restaurant-plating.jpg",
    intro: ["Every Monday, the chef at Osu Kitchen used to send someone to the market at 5 am. Prices changed by the week and quality by the crate.", "Now a weekly order arrives every Tuesday morning, with the farm on every label."],
    quote: "“I plan the menu around what is coming, not what I find.”", stats: [["6 h", "Saved every week"], ["−12%", "Spend on vegetables"]],
    sub: "How it works", body: "The kitchen sets a repeat order in its business account and checks the supply calendar to see what farms will have ready next month.",
    image: "/img/hotel-kitchen.jpg", close: "This season they added a bid for 300 kg of onions a month at a fixed price.",
  },
  "savings-that-pay-for-irrigation": {
    lede: "A savings group in Kumbungu pooled a season of contributions into a shared pump.", author: "Abena Osei", initials: "AO", date: "28 Sep 2026", read: "5 min read", hero: "/img/vsla-savings-box.jpg",
    intro: ["Twenty-two women meet every Thursday under the same tree. For years their records lived in a notebook that got wet in the rains.", "Since they moved their records to the Verdant app, every contribution and loan is saved, even when the phone is offline."],
    quote: "“Nobody argues about the box total any more.”", stats: [["GH₵ 9,400", "Saved this season"], ["22", "Members"]],
    sub: "What they bought", body: "The group voted to buy a solar pump. Now three members can grow vegetables in the dry season, when prices are highest.",
    image: "/img/solar-pump.jpg", close: "Next year they plan a second pump for the onion plots.",
  },
  "inside-this-weeks-box": {
    lede: "What is in season, which farms grew it, and what to cook with it.", author: "Efua Ansah", initials: "EA", date: "25 Sep 2026", read: "2 min read", hero: "/img/box-flatlay.jpg",
    intro: ["This week’s family box has vine tomatoes from Nyankpala, kontomire from Nadowli and the first sugarloaf pineapples from Kumbungu.", "Every item has its own code, so you can see the farm and the day it was picked."],
    quote: "“The kontomire was picked the morning before it reached us.”", stats: [["9", "Items in the box"], ["5", "Farms in the box"]],
    sub: "What to cook", body: "Try kontomire stew with the tomatoes and garden eggs, and keep the pineapple for the weekend. It ripens fast in the heat.",
    image: "/img/family-cooking.jpg", close: "Next week: the first yams of the season from Lawra.",
  },
  "cold-vans-now-reach-kumasi": {
    lede: "Our chilled vans now run between Tamale and Kumasi three times a week.", author: "Kojo Mensah", initials: "KM", date: "19 Sep 2026", read: "2 min read", hero: "/img/van-highway.jpg",
    intro: ["Until this month, Kumasi orders travelled on the Accra van and arrived a day later. Now Kumasi has its own route.", "The vans keep produce at 4 °C and log the temperature every ten minutes."],
    quote: "“Leafy greens now arrive looking like they were picked that morning.”", stats: [["3", "Runs a week"], ["4 °C", "Inside the van"]],
    sub: "What it means for you", body: "Kumasi orders placed before 8 pm now arrive the next day, and the temperature log shows on your trace page.",
    image: "/img/cold-room.jpg", close: "Takoradi is next on the list for early 2027.",
  },
};
export const articleBySlug = (s: string) => ARTICLES[s];

/* ---------- Legal ---------- */
export type LegalSection = { id: string; title: string; list?: string[]; text?: string[] };
export const LEGAL: Record<string, { updated: string; sections: LegalSection[] }> = {
  Privacy: {
    updated: "Last updated 1 October 2026",
    sections: [
      { id: "in-short", title: "In short", list: ["We never sell your data.", "We only share what a farmer or driver needs to serve you.", "You can download or delete your data at any time.", "We follow the Data Protection Act, 2012 (Act 843)."] },
      { id: "what-we-collect", title: "What we collect", text: ["Your name, phone number, delivery address and order history. If you pay by card, our payment partner holds the card details, not us."] },
      { id: "why-we-use-it", title: "Why we use it", text: ["To deliver your food, send updates about your order, and show you where your food came from.", "If you agree, we also send offers. You can stop these at any time."] },
      { id: "who-we-share-it-with", title: "Who we share it with", text: ["Drivers see your first name, phone and address for the day of delivery. Payment partners see what they need to take payment. We do not share your data with anyone else."] },
      { id: "how-long-we-keep-it", title: "How long we keep it", text: ["We keep order records for six years because tax law requires it. Everything else is deleted two years after your last order, or sooner if you ask."] },
      { id: "your-rights", title: "Your rights", text: ["You can ask to see, correct or delete your data. Email privacy@verdantfoods.com.gh and we reply within 14 days."] },
      { id: "contact-our-privacy-lead", title: "Contact our privacy lead", text: ["Write to our privacy lead at privacy@verdantfoods.com.gh or Verdant Foods Ltd., Tamale, Northern Region. You can also complain to the Data Protection Commission of Ghana."] },
    ],
  },
  "Terms of sale": {
    updated: "Last updated 1 October 2026",
    sections: [
      { id: "in-short", title: "In short", list: ["Prices include VAT and are shown before you pay.", "Delivery is free on orders over GH₵ 200.", "Damaged or wrong items are refunded or replaced.", "You can cancel until we start packing your order."] },
      { id: "orders", title: "Placing an order", text: ["Your order is confirmed when you receive a text and an email with your order number. Fresh produce varies in size, so weights can differ by up to 5%. We charge for the weight we send."] },
      { id: "delivery", title: "Delivery", text: ["Orders placed before 8 pm arrive the next day in Accra, Kumasi and Tamale, in the two-hour slot you choose. If we are late, we tell you by text."] },
      { id: "refunds", title: "Refunds and replacements", text: ["Report a problem within 24 hours with a photo. We refund to the way you paid within three working days, or send a replacement."] },
      { id: "business", title: "Business accounts", text: ["Business buyers agree separate supply terms, including credit terms and bid rules, when they open an account."] },
    ],
  },
  Cookies: {
    updated: "Last updated 1 October 2026",
    sections: [
      { id: "in-short", title: "In short", list: ["We use a few cookies to keep you signed in and remember your bag.", "We measure visits without tracking you across other sites.", "We never use cookies for advertising."] },
      { id: "needed", title: "Cookies we need", text: ["These keep you signed in, remember your bag and your delivery area, and keep the site secure. The site does not work without them."] },
      { id: "measurement", title: "Measurement", text: ["We count visits and see which pages are slow so we can fix them. These numbers are not linked to your name."] },
      { id: "choices", title: "Your choices", text: ["You can turn off measurement cookies in your account settings or clear cookies in your browser at any time."] },
    ],
  },
};

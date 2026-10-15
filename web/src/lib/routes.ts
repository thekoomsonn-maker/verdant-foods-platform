// Every page of the website, numbered as in the Figma file, mapped to its route.
export const R = {
  home: "/", about: "/about", farmers: "/farmers", business: "/business", traceInfo: "/trace-your-food", contact: "/contact",
  impact: "/impact", stories: "/stories", story: (slug = "amina-doubled-her-tomato-plot") => `/stories/${slug}`, careers: "/careers",
  help: "/help", legal: "/legal",
  shop: "/shop", product: (slug = "vine-tomatoes") => `/shop/p/${slug}`, farm: (slug = "nyankpala-women-farmers") => `/farms/${slug}`,
  packs: "/packs", bag: "/bag", checkout: "/checkout", confirmed: "/checkout/confirmed",
  category: (cat = "fruits") => `/shop/${cat}`, search: (q = "tomato") => `/search?q=${encodeURIComponent(q)}`,
  weeklyBox: "/weekly-box", delivery: "/delivery", reviews: (slug = "vine-tomatoes") => `/shop/p/${slug}/reviews`,
  signIn: "/account/sign-in", signUp: "/account/sign-up", code: "/account/code", account: "/account", orders: "/account/orders",
  tracking: (id = "VF-20418") => `/account/orders/${id}`, addresses: "/account/addresses", saved: "/account/saved",
  myBox: "/account/weekly-box", report: "/account/report", settings: "/account/settings",
  b2b: "/b2b", b2bSource: "/b2b/source", b2bBids: "/b2b/bids", b2bAgreements: "/b2b/agreements", b2bOrders: "/b2b/orders",
  b2bInvoices: "/b2b/invoices", b2bJoin: "/business/join", b2bQuote: "/b2b/quote", b2bTeam: "/b2b/team", b2bClaims: "/b2b/claims",
  b2bCalendar: "/b2b/calendar", b2bReports: "/b2b/reports", b2bSignIn: "/b2b/sign-in",
  admin: "/admin", adminOrders: "/admin/orders", adminProducts: "/admin/products", adminBuyers: "/admin/buyers",
  adminFarmers: "/admin/farmers", adminGroups: "/admin/groups", adminChecks: "/admin/checks", adminCodes: "/admin/codes",
  adminPayments: "/admin/payments", adminMap: "/admin/map", adminBatches: "/admin/batches", adminWeights: "/admin/weights",
  adminRecalls: "/admin/recalls", adminDeliveries: "/admin/deliveries", adminPricing: "/admin/pricing", adminContent: "/admin/content",
  adminUsers: "/admin/users", adminReports: "/admin/reports", adminSettings: "/admin/settings", adminProblems: "/admin/problems",
  traceSearch: "/t", trace: (code = "VF-TOM-00048") => `/t/${code}`, traceFarm: (code = "VF-TOM-00048") => `/t/${code}/farm`,
  traceSpray: (code = "VF-TOM-00048") => `/t/${code}/spray`,
  team: "/team",
} as const;

export const MAIN_NAV = [
  { label: "Shop", href: R.shop },
  { label: "For Business", href: R.business },
  { label: "For Farmers", href: R.farmers },
  { label: "Trace your food", href: R.traceInfo },
  { label: "About", href: R.about },
];

export const FOOTER = [
  { title: "Shop", links: [["Vegetables", R.shop], ["Fruits", R.category("fruits")], ["Roots and tubers", R.category("roots-and-tubers")], ["Grains and legumes", R.category("grains")], ["Stock-up packs", R.packs], ["Weekly box", R.weeklyBox]] },
  { title: "Business", links: [["Buy for your business", R.business], ["Bids and bulk orders", R.b2bJoin], ["Repeat deliveries", R.b2bJoin], ["Business sign in", R.b2bSignIn]] },
  { title: "Farmers", links: [["Sell with Verdant", R.farmers], ["Savings groups", R.farmers], ["Get the farmer app", R.farmers]] },
  { title: "Company", links: [["About Verdant", R.about], ["Impact", R.impact], ["Stories", R.stories], ["Trace your food", R.traceInfo], ["Careers", R.careers], ["Help centre", R.help], ["Contact us", R.contact]] },
] as const;

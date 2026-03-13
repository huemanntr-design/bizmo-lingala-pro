import { useState, useEffect, useRef, useCallback } from "react";
import logoDrc from "@/assets/logo-drc.png";
import { supabase } from "@/integrations/supabase/client";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

// ─── TWILIO WHATSAPP HELPER ────────────────────────────────────────────────────
const sendWhatsApp = async (to, message) => {
  const { data, error } = await supabase.functions.invoke("send-whatsapp", {
    body: { to, message },
  });
  if (error) throw new Error(error.message || "Failed to send WhatsApp");
  if (data && !data.success) throw new Error(data.error || "Twilio error");
  return data;
};

// ─── FONTS & DATA ──────────────────────────────────────────────────────────────
const FONT_URL = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Space+Grotesk:wght@400;500;600;700&display=swap";

// ─── SVG LOGO COMPONENT ─────────────────────────────────────────────────────
function BizmoLogo({ size = 40, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0052E0"/>
          <stop offset="50%" stopColor="#1A6BFF"/>
          <stop offset="100%" stopColor="#4B8BFF"/>
        </linearGradient>
        <linearGradient id="logo-accent" x1="30" y1="30" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5C518"/>
          <stop offset="100%" stopColor="#FFD84D"/>
        </linearGradient>
        <filter id="logo-glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      {/* Background shape */}
      <rect x="4" y="4" width="112" height="112" rx="28" fill="url(#logo-bg)" />
      <rect x="4" y="4" width="112" height="112" rx="28" fill="url(#logo-bg)" opacity="0.8" />
      {/* Red DRC stripe */}
      <rect x="4" y="50" width="112" height="20" fill="#CE1126" opacity="0.85" />
      {/* Briefcase icon */}
      <g filter="url(#logo-glow)">
        <rect x="32" y="38" width="56" height="44" rx="8" fill="white" opacity="0.95"/>
        <rect x="46" y="28" width="28" height="14" rx="5" fill="none" stroke="white" strokeWidth="3.5" opacity="0.9"/>
        <rect x="36" y="56" width="48" height="3" rx="1.5" fill="url(#logo-accent)"/>
        <circle cx="60" cy="57" r="5" fill="url(#logo-accent)" stroke="white" strokeWidth="1.5"/>
      </g>
      {/* Star accent */}
      <circle cx="96" cy="24" r="6" fill="#F5C518" opacity="0.9"/>
    </svg>
  );
}

// ─── DRC COLOR PALETTE ───────────────────────────────────────────────────────
const DRC = {
  blue:    "#0052E0",    // Primary — DRC flag blue
  blueL:   "#1A6BFF",    // Blue lighter
  blueLL:  "#4B8BFF",    // Blue lightest
  red:     "#CE1126",    // DRC flag red
  redL:    "#E8384F",    // Red lighter
  yellow:  "#F5C518",    // DRC flag yellow
  yellowL: "#FFD84D",    // Yellow lighter
  green:   "#16A34A",    // Success green
  greenL:  "#22C55E",    // Green lighter
  white:   "#FFFFFF",
  offWhite:"#F0F4FF",
};

const initialData = {
  user: { name: "Jean-Baptiste Mukendi", company: "Mukendi Enterprises", avatar: "JM", role: "Directeur Général", phone: "+243812000001" },
  products: [
    { id: 1, name: "Eau Minérale 1.5L", type: "Boisson", unit_price: 1.5, currency: "USD", cogs: 0.8, stock_quantity: 120, low_stock_alert: 20, has_expiry: true, emoji: "💧", image: null },
    { id: 2, name: "Bière Primus 65cl",  type: "Boisson", unit_price: 2.0, currency: "USD", cogs: 1.1, stock_quantity: 8,   low_stock_alert: 15, has_expiry: true, emoji: "🍺", image: null },
    { id: 3, name: "Sac de Riz 25kg",    type: "Alimentaire", unit_price: 22, currency: "USD", cogs: 16, stock_quantity: 45, low_stock_alert: 10, has_expiry: false, emoji: "🌾", image: null },
    { id: 4, name: "Huile Végétale 5L",  type: "Alimentaire", unit_price: 8.5, currency: "USD", cogs: 5.5, stock_quantity: 3, low_stock_alert: 10, has_expiry: true, emoji: "🫙", image: null },
    { id: 5, name: "Savon Monganga",      type: "Hygiène", unit_price: 0.75, currency: "USD", cogs: 0.4, stock_quantity: 200, low_stock_alert: 50, has_expiry: false, emoji: "🧼", image: null },
    { id: 6, name: "Farine Manioc 10kg", type: "Alimentaire", unit_price: 6, currency: "USD", cogs: 3.8, stock_quantity: 30, low_stock_alert: 15, has_expiry: true, emoji: "🥣", image: null },
  ],
  clients: [
    { id: 1, name: "Marie Kabila",          email: "marie@example.com",   phone: "+243812345678", status: "vip",    credit_limit: 500,  credit_balance: 120,  total_revenue: 3200,  address: "Gombe, Kinshasa" },
    { id: 2, name: "Pierre Tshisekedi",     email: "pierre@example.com",  phone: "+243897654321", status: "active", credit_limit: 200,  credit_balance: 0,    total_revenue: 1450,  address: "Limete, Kinshasa" },
    { id: 3, name: "Restaurant Bonne Table",email: "bt@example.com",      phone: "+243856789012", status: "active", credit_limit: 1000, credit_balance: 350,  total_revenue: 8900,  address: "Ngaliema, Kinshasa" },
    { id: 4, name: "Grâce Mutombo",         email: "grace@example.com",   phone: "+243834567890", status: "lead",   credit_limit: 100,  credit_balance: 0,    total_revenue: 0,     address: "Kasa-Vubu, Kinshasa" },
    { id: 5, name: "Hôtel Memling",         email: "memling@example.com", phone: "+243823456789", status: "vip",    credit_limit: 5000, credit_balance: 1200, total_revenue: 24500, address: "Gombe, Kinshasa" },
  ],
  sales: [
    { id: 1,  product_name: "Eau Minérale 1.5L",  client_name: "Marie Kabila",            quantity: 24, unit_price: 1.5,  total_amount: 36,  profit: 16.8, payment_method: "cash",         sale_date: "2025-02-21" },
    { id: 2,  product_name: "Sac de Riz 25kg",    client_name: "Restaurant Bonne Table",  quantity: 5,  unit_price: 22,   total_amount: 110, profit: 30,   payment_method: "mobile_money", sale_date: "2025-02-21" },
    { id: 3,  product_name: "Huile Végétale 5L",  client_name: "Hôtel Memling",           quantity: 20, unit_price: 8.5,  total_amount: 170, profit: 60,   payment_method: "credit",       sale_date: "2025-02-20" },
    { id: 4,  product_name: "Bière Primus 65cl",  client_name: "Pierre Tshisekedi",       quantity: 12, unit_price: 2.0,  total_amount: 24,  profit: 10.8, payment_method: "cash",         sale_date: "2025-02-20" },
    { id: 5,  product_name: "Savon Monganga",      client_name: "Marie Kabila",            quantity: 50, unit_price: 0.75, total_amount: 37.5,profit: 17.5, payment_method: "mobile_money", sale_date: "2025-02-19" },
    { id: 6,  product_name: "Farine Manioc 10kg", client_name: "Restaurant Bonne Table",  quantity: 10, unit_price: 6,    total_amount: 60,  profit: 22,   payment_method: "credit",       sale_date: "2025-02-19" },
    { id: 7,  product_name: "Eau Minérale 1.5L",  client_name: "Hôtel Memling",           quantity: 100,unit_price: 1.5,  total_amount: 150, profit: 70,   payment_method: "bank",         sale_date: "2025-02-18" },
    { id: 8,  product_name: "Sac de Riz 25kg",    client_name: "Marie Kabila",            quantity: 2,  unit_price: 22,   total_amount: 44,  profit: 12,   payment_method: "cash",         sale_date: "2025-02-18" },
    { id: 9,  product_name: "Huile Végétale 5L",  client_name: "Pierre Tshisekedi",       quantity: 3,  unit_price: 8.5,  total_amount: 25.5,profit: 9,    payment_method: "mobile_money", sale_date: "2025-02-17" },
    { id: 10, product_name: "Bière Primus 65cl",  client_name: "Restaurant Bonne Table",  quantity: 48, unit_price: 2.0,  total_amount: 96,  profit: 43.2, payment_method: "cash",         sale_date: "2025-02-17" },
  ],
  expenses: [
    { id: 1, description: "Loyer bureau Gombe",    amount: 500,  category: "Immobilier",   expense_date: "2025-02-01", status: "approved" },
    { id: 2, description: "Transport marchandises",amount: 85,   category: "Transport",    expense_date: "2025-02-15", status: "approved" },
    { id: 3, description: "Salaires employés",     amount: 450,  category: "RH",           expense_date: "2025-02-28", status: "pending"  },
    { id: 4, description: "Internet & Téléphone",  amount: 45,   category: "Communication",expense_date: "2025-02-10", status: "approved" },
    { id: 5, description: "Électricité",            amount: 65,   category: "Utilités",     expense_date: "2025-02-05", status: "approved" },
  ],
  staff: [
    { id: 1, full_name: "Alphonse Ngoy",  role: "Caissier",          commission_rate: 2,   permissions: { sales: true,  inventory: false, accounting: false, clients: true  } },
    { id: 2, full_name: "Cécile Lumbu",   role: "Gestionnaire Stock", commission_rate: 1.5, permissions: { sales: true,  inventory: true,  accounting: false, clients: false } },
    { id: 3, full_name: "David Kongolo",  role: "Comptable",          commission_rate: 0,   permissions: { sales: false, inventory: false, accounting: true,  clients: false } },
  ],
  posts: [
    { id: 1, title: "Promotion Eau Minérale", content: "🌊 Restez hydratés! Eau Minérale fraîche disponible à -20% ce weekend!", platform: "instagram", scheduled_date: "2025-03-05", status: "scheduled", likes: 0, shares: 0 },
    { id: 2, title: "Nouveau Stock Riz",       content: "🍚 Notre riz de qualité supérieure vient d'arriver! Commandez maintenant.",platform: "facebook",  scheduled_date: "2025-02-20", status: "published", likes: 45, shares: 12 },
  ],
  revenueChart: [
    { day: "Lun", amount: 320 }, { day: "Mar", amount: 480 }, { day: "Mer", amount: 390 },
    { day: "Jeu", amount: 620 }, { day: "Ven", amount: 750 }, { day: "Sam", amount: 910 }, { day: "Dim", amount: 580 },
  ],
  budget: { monthly: 2000, spent: 1950, categories: [
    { name: "Alimentation", budget: 400, spent: 350 }, { name: "Transport", budget: 200, spent: 180 },
    { name: "Logement",     budget: 800, spent: 800 }, { name: "Loisirs",   budget: 150, spent: 220 },
    { name: "Épargne",      budget: 450, spent: 400 },
  ]},
};

// ─── UTILS ─────────────────────────────────────────────────────────────────────
let _globalCurrency = "USD";
let _globalRate = 2800;
const setGlobalCurrency = (c) => { _globalCurrency = c; };
const setGlobalRate = (r) => { _globalRate = r; };
const fmt = (v, c) => { const cur = c || _globalCurrency; return cur === "CDF" ? `${Math.round(v * _globalRate).toLocaleString()} FC` : `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; };
const pct = (a, b) => b > 0 ? ((a / b) * 100).toFixed(0) + "%" : "0%";
const initials = (name) => name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
const payIcons = { cash: "💵", mobile_money: "📱", credit: "🏦", bank: "🏛️" };
const statusMeta = {
  lead:      { label: "Lead",      bg: "rgba(26,86,255,0.12)",  color: "#1A56FF" },
  active:    { label: "Actif",     bg: "rgba(22,197,94,0.12)",  color: "#16C55E" },
  vip:       { label: "VIP",       bg: "rgba(245,197,24,0.15)", color: "#F5C518" },
  inactive:  { label: "Inactif",   bg: "rgba(107,114,128,0.12)",color: "#6B7280" },
  pending:   { label: "En attente",bg: "rgba(245,197,24,0.12)", color: "#F5C518" },
  approved:  { label: "Approuvé",  bg: "rgba(22,197,94,0.12)",  color: "#16C55E" },
  rejected:  { label: "Rejeté",    bg: "rgba(212,43,58,0.12)",  color: "#D42B3A" },
  scheduled: { label: "Programmé", bg: "rgba(26,86,255,0.12)",  color: "#1A56FF" },
  published: { label: "Publié",    bg: "rgba(22,197,94,0.12)",  color: "#16C55E" },
  draft:     { label: "Brouillon", bg: "rgba(107,114,128,0.12)",color: "#6B7280" },
  ai_proposed:{ label: "IA ✨",    bg: "rgba(245,197,24,0.12)", color: "#F5C518" },
};

// ─── NAV ───────────────────────────────────────────────────────────────────────
const NAV = [
  { id: "home",       icon: "🏠",  label: "Tableau de Bord", short: "Accueil"  },
  { id: "sales",      icon: "🛍️",  label: "Ventes & POS",    short: "Ventes"   },
  { id: "products",   icon: "📦",  label: "Produits",         short: "Stock",   badge: "2" },
  { id: "clients",    icon: "👥",  label: "Clients",          short: "Clients"  },
  { id: "marketing",  icon: "📣",  label: "Marketing",        short: "Marketing"},
  { id: "accounting", icon: "💰",  label: "Comptabilité",     short: "Compta"   },
  { id: "personal",   icon: "🏦",  label: "Finance Perso",    short: "Finances" },
  { id: "bizplan",    icon: "📋",  label: "Business Plan",     short: "Plan"     },
  { id: "tutorials",  icon: "🎓",  label: "Tutoriels",        short: "Tutos"    },
  { id: "settings",   icon: "⚙️",  label: "Paramètres",       short: "Config"   },
];

const DEFAULT_KPI_GOALS = {
  home_revenue: 2000,
  home_revenue_trend: "+18.4%",
  sales_daily: 1500,
  sales_trend: "+18%",
  clients_revenue: null, // calculated
  marketing_engagement: null,
  accounting_profit: null,
  personal_income: 3200,
  whatsapp_response: 94,
};

// ─── AI MARKETING PROPOSALS ────────────────────────────────────────────────────
const AI_PROPOSALS = [
  { id:"ai1",  day:3,  month:3,year:2025,time:"09:00",platform:"instagram",status:"ai_proposed",title:"Promo Eau Minérale",   content:"🌊 Hydratez-vous!\nEau Minérale 1.5L — 1,20$ seulement!\n✅ Stock disponible · 📍 Livraison Kinshasa\n#Kinshasa #DRC #Promotion",reason:"Lundi matin = fort trafic. Stock eau élevé (120u). Heure de pointe.",estimatedReach:1200,estimatedEngagement:"4.2%",bestTime:"09:00–11:00"},
  { id:"ai2",  day:5,  month:3,year:2025,time:"18:30",platform:"facebook",  status:"ai_proposed",title:"Stock Riz Arrivé",    content:"🌾 NOUVEAU STOCK!\nSac de Riz 25kg — 22$\n⚡ Commandez avant rupture!\n#Riz #Kinshasa #DRC",reason:"Vendredi soir = pic achat familial. Stock bien approvisionné.",estimatedReach:2400,estimatedEngagement:"5.8%",bestTime:"17:00–19:00"},
  { id:"ai3",  day:7,  month:3,year:2025,time:"12:00",platform:"tiktok",    status:"ai_proposed",title:"Démo Savon Monganga", content:"🧴 Savon Monganga — 0,75$!\nPropre, naturel, efficace.\n#Savon #Kinshasa #Hygiène",reason:"TikTok samedi midi = audience jeune. Stock très élevé (200u).",estimatedReach:3800,estimatedEngagement:"7.1%",bestTime:"11:00–13:00"},
  { id:"ai4",  day:10, month:3,year:2025,time:"08:00",platform:"instagram",status:"ai_proposed",title:"⚠️ Stock Bas: Huile",  content:"⚠️ DERNIÈRES UNITÉS!\nHuile Végétale 5L — 8,50$\n3 unités restantes!\n#HuileVégétale #Kinshasa",reason:"Stock huile critique (3u, alerte 10). Urgence à communiquer.",estimatedReach:950,estimatedEngagement:"6.3%",bestTime:"08:00–09:30"},
  { id:"ai5",  day:14, month:3,year:2025,time:"19:00",platform:"facebook",  status:"ai_proposed",title:"Promo Weekend",       content:"🎉 WEEKEND SPÉCIAL!\nRiz 25kg: 20$ · Eau x24: 30$\n📦 Livraison gratuite dès 50$!\n#Promo #Weekend #Kinshasa",reason:"Vendredi = meilleur jour pour promos groupées. Booste panier moyen.",estimatedReach:2900,estimatedEngagement:"8.2%",bestTime:"18:00–20:00"},
];

// ─── WHATSAPP DATA ──────────────────────────────────────────────────────────────
const WA_TEMPLATES = [
  { id:"daily", name:"Rapport Journalier", icon:"📅",
    generate: d => `📊 *RAPPORT — ${new Date().toLocaleDateString("fr-FR")}*\n━━━━━━━━━━━━━━━\n💰 Revenus: *$${d.revenue}*\n📉 Dépenses: *$${d.expenses}*\n✨ Profit: *$${(d.revenue-d.expenses).toFixed(2)}*\n🛍️ Ventes: *${d.sales}*\n━━━━━━━━━━━━━━━\n_Mukendi BizPlatform_ 🇨🇩` },
  { id:"credit", name:"Alerte Crédit", icon:"⚠️",
    generate: d => `⚠️ *RAPPEL DE PAIEMENT*\n━━━━━━━━━━━━━━━\nBonjour *${d.clientName}*,\n\nSolde impayé: *$${d.credit}*\n\nPaiement: 📱 M-PESA +243 8XX XXX XXX\n\nMerci 🙏 _Mukendi Enterprises_` },
  { id:"promo", name:"Promotion", icon:"🎯",
    generate: d => `🎯 *OFFRE SPÉCIALE!*\n━━━━━━━━━━━━━━━\n📦 *${d.productName}*\n\nPrix promo: *$${d.promoPrice}*\n⏰ Valable jusqu'au ${d.deadline}\n\n📞 Commandez: tapez *COMMANDE*\n_Mukendi Enterprises_ 🇨🇩` },
];

// ─── STYLES ────────────────────────────────────────────────────────────────────
export const generatePDF = async (elementId, filename) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  try {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pdf = new jsPDF("p", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

const buildStyles = (dark) => {
  const t = dark ? {
    bg:       "#060A18",
    bg2:      "#0B1028",
    bg3:      "#101838",
    surface:  "rgba(30,50,100,0.45)",
    surface2: "rgba(35,55,110,0.40)",
    border:   "rgba(120,165,255,0.12)",
    border2:  "rgba(120,165,255,0.18)",
    text:     "#EAF0FF",
    text2:    "#8DA4D4",
    text3:    "#4A6499",
    glass:    "rgba(25,40,85,0.50)",
    glass2:   "rgba(30,48,95,0.40)",
    glass3:   "rgba(70,120,255,0.10)",
    inputBg:  "rgba(18,28,60,0.75)",
    modalBg:  "rgba(12,18,40,0.94)",
    shadow:   "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(120,165,255,0.08)",
    shadowNeo: "10px 10px 24px rgba(0,0,0,0.45), -5px -5px 16px rgba(50,80,150,0.06)",
    shadowInset: "inset 2px 2px 6px rgba(0,0,0,0.25), inset -2px -2px 6px rgba(50,80,160,0.05)",
    glow:     "0 0 40px rgba(50,110,255,0.18), 0 0 80px rgba(50,110,255,0.06)",
    scrollBg: "rgba(50,110,255,0.25)",
  } : {
    bg:       "#EFF2FA",
    bg2:      "rgba(255,255,255,0.7)",
    bg3:      "#E8EDFA",
    surface:  "rgba(255,255,255,0.55)",
    surface2: "rgba(240,244,255,0.6)",
    border:   "rgba(100,140,255,0.1)",
    border2:  "rgba(100,140,255,0.16)",
    text:     "#0A0F1E",
    text2:    "#3A4E7A",
    text3:    "#8A9DC0",
    glass:    "rgba(255,255,255,0.65)",
    glass2:   "rgba(255,255,255,0.75)",
    glass3:   "rgba(26,86,255,0.05)",
    inputBg:  "rgba(240,244,255,0.7)",
    modalBg:  "rgba(255,255,255,0.9)",
    shadow:   "0 8px 32px rgba(26,86,255,0.08), 0 0 0 1px rgba(100,140,255,0.06)",
    shadowNeo: "8px 8px 20px rgba(174,184,210,0.35), -6px -6px 16px rgba(255,255,255,0.9)",
    shadowInset: "inset 2px 2px 5px rgba(174,184,210,0.25), inset -2px -2px 5px rgba(255,255,255,0.8)",
    glow:     "0 0 40px rgba(26,86,255,0.08), 0 0 80px rgba(26,86,255,0.03)",
    scrollBg: "rgba(26,86,255,0.2)",
  };
  return `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: ${t.bg}; color: ${t.text};
    overflow-x: hidden; line-height: 1.5; font-size: 14px;
    transition: background 0.4s ease, color 0.4s ease;
  }

  /* ── TYPOGRAPHIC SCALE (5 levels) ── */
  .t-display  { font-family: 'Bricolage Grotesque', sans-serif; font-size: 44px; font-weight: 800; letter-spacing: -1.5px; line-height: 1; }
  .t-h1       { font-family: 'Bricolage Grotesque', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.15; }
  .t-h2       { font-family: 'Bricolage Grotesque', sans-serif; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; line-height: 1.25; }
  .t-h3       { font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: -0.1px; line-height: 1.35; }
  .t-body     { font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 400; line-height: 1.55; }
  .t-caption  { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; line-height: 1.4; }
  .t-money    { font-family: 'Space Grotesk', 'Bricolage Grotesque', sans-serif; font-variant-numeric: tabular-nums; letter-spacing: -0.5px; }

  /* ── WCAG AA CONTRAST FIXES ── */
  .text-primary-accessible { color: ${dark ? "#93B4FF" : "#0043B8"}; }
  .text-secondary-accessible { color: ${dark ? "#B0C4E8" : "#374A6D"}; }
  .text-muted-accessible { color: ${dark ? "#8DA4D4" : "#4A5D80"}; }

  /* ── MICRO-ANIMATIONS ── */
  @keyframes progressPulse {
    0% { box-shadow: 0 0 4px rgba(26,86,255,0.2); }
    50% { box-shadow: 0 0 16px rgba(26,86,255,0.45); }
    100% { box-shadow: 0 0 4px rgba(26,86,255,0.2); }
  }
  @keyframes progressGrow {
    from { width: 0; }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes stateChange {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  .anim-progress-fill {
    animation: progressGrow 1.2s cubic-bezier(.4,0,.2,1) forwards, progressPulse 2.5s ease-in-out 1.2s infinite;
  }
  .anim-count { animation: countUp 0.5s ease-out forwards; }
  .anim-state { animation: stateChange 0.35s ease; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${t.scrollBg}; border-radius: 4px; }

  /* ── LAYOUT ── */
  .app-shell { display: flex; height: 100vh; overflow: hidden; }
  .sidebar {
    width: 68px; min-width: 68px;
    background: ${t.bg2};
    backdrop-filter: blur(24px) saturate(1.5);
    -webkit-backdrop-filter: blur(24px) saturate(1.5);
    border-right: 1px solid ${t.border};
    display: flex; flex-direction: column; align-items: center;
    padding: 0; gap: 0;
    transition: width 0.3s cubic-bezier(.4,0,.2,1), min-width 0.3s cubic-bezier(.4,0,.2,1);
    z-index: 100; overflow: hidden;
    box-shadow: 4px 0 24px rgba(0,0,0,${dark?0.25:0.06});
  }
  .sidebar.expanded { width: 230px; min-width: 230px; align-items: stretch; }
  .main-area {
    flex: 1; overflow-y: auto; display: flex; flex-direction: column;
    background: ${t.bg};
    background-image: radial-gradient(ellipse 80% 60% at 20% 30%, rgba(26,86,255,0.04) 0%, transparent 60%),
                      radial-gradient(ellipse 60% 50% at 80% 80%, rgba(212,43,58,0.02) 0%, transparent 50%);
  }
  .topbar {
    position: sticky; top: 0; z-index: 50;
    height: 60px; min-height: 60px; padding: 0 28px;
    background: ${t.bg2};
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    border-bottom: 1px solid ${t.border};
    display: flex; align-items: center; gap: 14px;
    box-shadow: 0 4px 20px rgba(0,0,0,${dark?0.2:0.04});
  }
  .page-body { padding: 28px; flex: 1; }

  /* ── SIDEBAR LOGO ── */
  .logo-wrap {
    width: 100%; height: 68px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    padding: 0 12px; cursor: pointer;
    border-bottom: 1px solid ${t.border};
    gap: 12px; overflow: hidden;
    transition: all 0.3s ease;
  }
  .logo-wrap:hover { background: ${t.glass3}; }
  .logo-mark {
    width: 40px; height: 40px; min-width: 40px; border-radius: 12px;
    overflow: hidden; display: flex; align-items: center; justify-content: center;
    filter: drop-shadow(0 4px 12px rgba(0,127,255,0.35));
    transition: transform 0.3s ease;
  }
  .logo-wrap:hover .logo-mark { transform: scale(1.08) rotate(-2deg); }
  .logo-mark img { width: 100%; height: 100%; object-fit: contain; }
  .logo-text { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 15px; white-space: nowrap; color: ${t.text}; letter-spacing: -0.3px; }
  .logo-sub { font-size: 10px; color: ${t.text3}; margin-top: 1px; }

  /* ── NAV ITEMS ── */
  .nav-list { flex: 1; overflow-y: auto; padding: 10px 0; display: flex; flex-direction: column; gap: 2px; }
  .nav-item {
    position: relative; height: 44px; border-radius: 12px; margin: 0 8px;
    display: flex; align-items: center; cursor: pointer;
    transition: all 0.22s cubic-bezier(.4,0,.2,1); overflow: hidden;
    padding: 0 12px; gap: 12px; color: ${t.text3};
    font-size: 13px; font-weight: 500; white-space: nowrap;
  }
  .nav-icon { font-size: 17px; min-width: 18px; text-align: center; transition: transform 0.2s ease; }
  .nav-label { overflow: hidden; }
  .nav-item:hover { background: ${t.glass3}; color: ${t.text}; }
  .nav-item:hover .nav-icon { transform: scale(1.15); }
  .nav-item.active {
    background: rgba(26,86,255,0.1);
    color: #1A56FF;
    box-shadow: inset 0 0 20px rgba(26,86,255,0.06), 0 0 12px rgba(26,86,255,0.06);
  }
  .nav-item.active::before {
    content: ''; position: absolute; left: 0; top: 8px; bottom: 8px;
    width: 3px; border-radius: 0 3px 3px 0; background: #1A56FF;
    box-shadow: 0 0 10px rgba(26,86,255,0.5);
  }
  .nav-item.wa-active {
    background: rgba(37,211,102,0.08);
    color: #25D366;
    box-shadow: inset 0 0 20px rgba(37,211,102,0.04);
  }
  .nav-item.wa-active::before { content: ''; position: absolute; left: 0; top: 8px; bottom: 8px; width: 3px; border-radius: 0 3px 3px 0; background: #25D366; box-shadow: 0 0 10px rgba(37,211,102,0.4); }
  .nav-badge {
    position: absolute; top: 8px; right: 8px;
    background: linear-gradient(135deg, #D42B3A, #FF4757); color: white; border-radius: 8px;
    font-size: 9px; font-weight: 700; padding: 1px 6px; min-width: 16px; text-align: center;
    box-shadow: 0 2px 8px rgba(212,43,58,0.4);
    animation: pulse 2s infinite;
  }
  .nav-divider { height: 1px; background: ${t.border}; margin: 8px 16px; }
  .nav-bottom { padding: 8px; border-top: 1px solid ${t.border}; }

  /* ── BUTTONS — NEOMORPHIC GLASS ── */
  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 18px; border-radius: 12px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; border: none;
    transition: all 0.25s cubic-bezier(.4,0,.2,1);
    white-space: nowrap; position: relative; overflow: hidden;
    letter-spacing: 0.2px;
  }
  .btn::before {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
    pointer-events: none; opacity: 0; transition: opacity 0.25s;
  }
  .btn:hover::before { opacity: 1; }
  .btn:active { transform: scale(0.96); }
  .btn-primary {
    background: linear-gradient(135deg, #1A56FF 0%, #2B6BFF 100%);
    color: white;
    box-shadow: 0 4px 16px rgba(26,86,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .btn-primary:hover { box-shadow: 0 6px 28px rgba(26,86,255,0.5), inset 0 1px 0 rgba(255,255,255,0.2); transform: translateY(-2px); }
  .btn-red {
    background: linear-gradient(135deg, #D42B3A, #E8384F);
    color: white;
    box-shadow: 0 4px 16px rgba(212,43,58,0.3), inset 0 1px 0 rgba(255,255,255,0.12);
  }
  .btn-red:hover { box-shadow: 0 6px 24px rgba(212,43,58,0.45); transform: translateY(-2px); }
  .btn-yellow {
    background: linear-gradient(135deg, #F5C518, #FFD84D);
    color: #1a0e00;
    box-shadow: 0 4px 16px rgba(245,197,24,0.3), inset 0 1px 0 rgba(255,255,255,0.2);
  }
  .btn-yellow:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(245,197,24,0.45); }
  .btn-ghost {
    background: ${t.glass2};
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: ${t.text2};
    border: 1px solid ${t.border2};
    box-shadow: ${t.shadowNeo};
  }
  .btn-ghost:hover { background: ${t.glass3}; color: ${t.text}; border-color: rgba(26,86,255,0.25); }
  .btn-success {
    background: linear-gradient(135deg, #16A34A, #22C55E);
    color: white;
    box-shadow: 0 4px 16px rgba(22,163,74,0.3), inset 0 1px 0 rgba(255,255,255,0.12);
  }
  .btn-success:hover { box-shadow: 0 6px 24px rgba(22,163,74,0.45); transform: translateY(-2px); }
  .btn-wa {
    background: linear-gradient(135deg,#25D366,#128C7E);
    color: white;
    box-shadow: 0 4px 16px rgba(37,211,102,0.3), inset 0 1px 0 rgba(255,255,255,0.12);
    border-radius: 20px;
  }
  .btn-wa:hover { box-shadow: 0 6px 28px rgba(37,211,102,0.5); transform: translateY(-2px); }
  .btn-icon { padding: 10px 11px; }

  /* ── INPUTS — GLASS ── */
  input, select, textarea {
    background: ${t.inputBg};
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid ${t.border2};
    color: ${t.text}; border-radius: 12px; padding: 11px 16px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; width: 100%;
    transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
    box-shadow: ${t.shadowInset};
  }
  input:focus, select:focus, textarea:focus {
    border-color: rgba(26,86,255,0.5);
    box-shadow: 0 0 0 3px rgba(26,86,255,0.12), 0 0 20px rgba(26,86,255,0.08), ${t.shadowInset};
  }
  input::placeholder { color: ${t.text3}; }
  select option { background: ${dark ? "#0A0F22" : "#fff"}; color: ${t.text}; }

  /* ── CARDS — GLASSMORPHIC LIGHTER BLUE ── */
  .card {
    background: ${dark ? "rgba(30,48,100,0.38)" : "rgba(220,230,255,0.55)"};
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    border: 1px solid ${dark ? "rgba(120,170,255,0.18)" : "rgba(100,140,255,0.18)"};
    border-radius: 18px;
    transition: transform 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s ease, border-color 0.3s ease;
    box-shadow: ${t.shadowNeo};
    position: relative;
    overflow: hidden;
    cursor: default;
  }
  .card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(140,180,255,${dark?0.22:0.45}), transparent);
    pointer-events: none;
  }
  .card-hover:hover {
    transform: translateY(-6px) scale(1.008);
    box-shadow: ${t.shadow}, 0 0 50px rgba(26,86,255,0.1);
    border-color: rgba(26,86,255,0.3);
  }
  .card-clickable { cursor: pointer; }
  .card-clickable:hover {
    transform: translateY(-6px) scale(1.008);
    box-shadow: ${t.shadow}, 0 0 50px rgba(26,86,255,0.1);
    border-color: rgba(26,86,255,0.3);
  }
  .card-pad { padding: 22px; }
  .card-pad-sm { padding: 16px; }

  /* ── KPI CARDS — NEOMORPHIC GLASS ── */
  .kpi {
    background: ${dark ? "rgba(30,48,100,0.38)" : "rgba(220,230,255,0.55)"};
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    border: 1px solid ${dark ? "rgba(120,170,255,0.18)" : "rgba(100,140,255,0.18)"};
    border-radius: 18px; padding: 22px; position: relative; overflow: hidden;
    transition: transform 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s ease;
    min-width: 210px; flex-shrink: 0;
    box-shadow: ${t.shadowNeo};
    cursor: pointer;
  }
  .kpi::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(140,180,255,${dark?0.22:0.45}), transparent);
    pointer-events: none;
  }
  .kpi:hover { transform: translateY(-6px); box-shadow: ${t.shadow}, 0 0 40px rgba(50,110,255,0.15); border-color: rgba(80,140,255,0.35); }
  .kpi-glow { position: absolute; top: -30px; right: -30px; width: 120px; height: 120px; border-radius: 50%; filter: blur(40px); opacity: 0.25; transition: opacity 0.3s; }
  .kpi:hover .kpi-glow { opacity: 0.4; }
  .kpi-icon {
    width: 44px; height: 44px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center; font-size: 19px; margin-bottom: 14px;
    box-shadow: ${t.shadowInset};
  }
  .kpi-val { font-family: 'Space Grotesk', 'Bricolage Grotesque', sans-serif; font-size: 28px; font-weight: 700; line-height: 1; letter-spacing: -0.5px; font-variant-numeric: tabular-nums; }
  .kpi-label { font-size: 12px; color: ${t.text2}; margin-top: 5px; font-weight: 500; }
  .kpi-trend { font-size: 11px; margin-top: 10px; display: flex; align-items: center; gap: 4px; font-weight: 600; }

  /* ── KPI BANNER ── */
  .kpi-banner { position: relative; margin-bottom: 22px; }
  .kpi-banner-scroll {
    display: flex; gap: 14px; overflow-x: auto; scroll-behavior: smooth;
    scrollbar-width: none; -ms-overflow-style: none; padding: 6px 0;
  }
  .kpi-banner-scroll::-webkit-scrollbar { display: none; }
  .kpi-banner-arrow {
    position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
    width: 34px; height: 34px; border-radius: 50%;
    background: ${t.surface};
    backdrop-filter: blur(16px);
    border: 1px solid ${t.border2};
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 14px; color: ${t.text};
    box-shadow: ${t.shadowNeo}; transition: all 0.2s;
  }
  .kpi-banner-arrow:hover { box-shadow: ${t.shadow}; background: ${t.surface2}; }
  .kpi-banner-arrow.left { left: -14px; }
  .kpi-banner-arrow.right { right: -14px; }
  .kpi-banner-arrow.hidden { opacity: 0; pointer-events: none; }

  /* ── HERO BANNER — GLASS MORPHISM ── */
  .hero-banner {
    background: ${dark ? "rgba(25,40,90,0.42)" : "rgba(255,255,255,0.5)"};
    backdrop-filter: blur(24px) saturate(1.5);
    -webkit-backdrop-filter: blur(24px) saturate(1.5);
    border: 1px solid ${dark ? "rgba(120,170,255,0.16)" : "rgba(100,140,255,0.15)"};
    border-radius: 22px; padding: 28px 32px; position: relative; overflow: hidden;
    margin-bottom: 18px;
    box-shadow: ${t.shadowNeo};
  }
  .hero-banner::before {
    content: ''; position: absolute; top: -50%; right: -15%; width: 300px; height: 300px;
    border-radius: 50%; background: rgba(50,100,255,0.08); filter: blur(80px); pointer-events: none;
  }
  .hero-banner::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(160,200,255,${dark?0.12:0.4}), transparent);
    pointer-events: none;
  }
  .hero-banner-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: ${t.text2}; margin-bottom: 8px; }
  .hero-banner-value { font-family: 'Space Grotesk', 'Bricolage Grotesque', sans-serif; font-size: 44px; font-weight: 800; letter-spacing: -1.5px; line-height: 1; color: ${t.text}; font-variant-numeric: tabular-nums; }
  .hero-banner-sub { font-size: 13px; color: ${t.text2}; margin-top: 8px; }
  .hero-progress {
    height: 10px;
    background: ${dark ? "rgba(26,86,255,0.08)" : "rgba(26,86,255,0.06)"};
    border-radius: 5px; overflow: hidden; margin-top: 18px;
    box-shadow: ${t.shadowInset};
  }
  .hero-progress-fill {
    height: 100%; border-radius: 5px; transition: width 1s cubic-bezier(.4,0,.2,1);
    background: linear-gradient(90deg, #1A56FF, #4B8BFF);
    box-shadow: 0 0 16px rgba(26,86,255,0.4);
  }

  /* ── MINI KPI GRID ── */
  .mini-kpi-grid { display: flex; gap: 14px; margin-bottom: 22px; flex-wrap: wrap; }
  .mini-kpi {
    flex: 1; min-width: 145px;
    background: ${dark ? "rgba(28,44,95,0.40)" : t.surface};
    backdrop-filter: blur(16px) saturate(1.3);
    -webkit-backdrop-filter: blur(16px) saturate(1.3);
    border: 1px solid ${dark ? "rgba(120,165,255,0.14)" : t.border};
    border-radius: 16px; padding: 18px; text-align: center; position: relative; overflow: hidden;
    transition: transform 0.25s cubic-bezier(.4,0,.2,1), box-shadow 0.25s;
    box-shadow: ${t.shadowNeo};
  }
  .mini-kpi::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(140,180,255,${dark?0.15:0.3}), transparent);
    pointer-events: none;
  }
  .mini-kpi:hover { transform: translateY(-3px); box-shadow: ${t.shadow}; }
  .mini-kpi-icon { font-size: 24px; margin-bottom: 8px; }
  .mini-kpi-val { font-family: 'Space Grotesk', 'Bricolage Grotesque', sans-serif; font-size: 22px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; }
  .mini-kpi-label { font-size: 10px; color: ${t.text2}; margin-top: 5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .mini-kpi-trend { font-size: 10px; margin-top: 7px; font-weight: 700; }

  /* ── INSIGHT CARD ── */
  .insight-card {
    background: ${dark ? "rgba(28,44,90,0.35)" : t.glass};
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid ${dark ? "rgba(120,165,255,0.12)" : t.border}; border-radius: 14px; padding: 14px 16px;
    display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px;
    transition: all 0.22s;
  }
  .insight-card:hover { background: ${dark ? "rgba(40,60,120,0.35)" : t.glass3}; transform: translateX(4px); }
  .insight-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; box-shadow: ${t.shadowInset}; }

  /* ── TABS — GLASS PILL ── */
  .tabs {
    display: flex; gap: 3px;
    background: ${dark ? "rgba(20,32,75,0.40)" : t.glass};
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid ${dark ? "rgba(120,165,255,0.12)" : t.border};
    border-radius: 14px; padding: 5px; overflow-x: auto; flex-shrink: 0;
    box-shadow: ${t.shadowInset};
  }
  .tabs::-webkit-scrollbar { display: none; }
  .tab {
    padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 500;
    cursor: pointer; white-space: nowrap; color: ${t.text2};
    transition: all 0.22s cubic-bezier(.4,0,.2,1);
  }
  .tab.active {
    background: linear-gradient(135deg, #1A56FF, #3B7BFF);
    color: white;
    box-shadow: 0 4px 16px rgba(26,86,255,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .tab:hover:not(.active) { color: ${t.text}; background: ${dark ? "rgba(50,80,160,0.20)" : t.glass3}; }

  /* ── TAG / BADGE ── */
  .tag {
    display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.3px;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  /* ── TABLE — GLASS ── */
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th {
    padding: 12px 16px; text-align: left; font-size: 10px; font-weight: 700;
    color: ${t.text3}; text-transform: uppercase; letter-spacing: 0.8px;
    border-bottom: 1px solid ${t.border};
  }
  .data-table td { padding: 14px 16px; font-size: 13px; border-bottom: 1px solid ${t.border}; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr { transition: all 0.18s; }
  .data-table tr:hover td { background: ${t.glass3}; }

  /* ── MODAL — FROSTED GLASS ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,${dark?0.65:0.35});
    backdrop-filter: blur(12px) saturate(0.8);
    -webkit-backdrop-filter: blur(12px) saturate(0.8);
    z-index: 1000;
    display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: fadeIn 0.25s ease;
  }
  .modal-box {
    background: ${t.modalBg};
    backdrop-filter: blur(32px) saturate(1.5);
    -webkit-backdrop-filter: blur(32px) saturate(1.5);
    border: 1px solid ${t.border2};
    border-radius: 22px; width: 100%; max-width: 560px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 32px 100px rgba(0,0,0,${dark?0.55:0.15}), ${t.glow};
    animation: scaleIn 0.25s cubic-bezier(.4,0,.2,1);
  }
  .modal-box::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,${dark?0.08:0.5}), transparent);
    pointer-events: none;
  }
  .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 22px 26px 0; }
  .modal-body { padding: 18px 26px 26px; }

  /* ── FORM ── */
  .form-group { margin-bottom: 16px; }
  .form-label { font-size: 11px; font-weight: 700; color: ${t.text2}; margin-bottom: 7px; display: block; text-transform: uppercase; letter-spacing: 0.6px; }

  /* ── PROGRESS — NEOMORPHIC WITH MICRO-ANIMATIONS ── */
  .progress {
    height: 7px;
    background: ${t.glass3};
    border-radius: 4px; overflow: hidden;
    box-shadow: ${t.shadowInset};
  }
  .progress-fill {
    height: 100%; border-radius: 4px;
    transition: width 0.6s cubic-bezier(.4,0,.2,1);
    box-shadow: 0 0 8px rgba(26,86,255,0.2);
    animation: progressGrow 1s cubic-bezier(.4,0,.2,1) forwards, progressPulse 2.5s ease-in-out 1s infinite;
    position: relative;
  }
  .progress-fill::after {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: shimmer 2.5s ease-in-out infinite 1.2s;
  }

  /* ── TOGGLE — GLASS ── */
  .toggle { position: relative; width: 42px; height: 23px; cursor: pointer; flex-shrink: 0; }
  .toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
  .toggle-track {
    position: absolute; inset: 0;
    background: ${t.glass3};
    border-radius: 12px; transition: 0.3s;
    border: 1px solid ${t.border2};
    box-shadow: ${t.shadowInset};
  }
  .toggle-track::after {
    content: ''; position: absolute; height: 17px; width: 17px; left: 2px; top: 2px;
    background: ${dark ? "#3A4E7A" : "#A0B0D0"};
    border-radius: 50%; transition: 0.3s cubic-bezier(.4,0,.2,1);
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }
  .toggle input:checked + .toggle-track { background: linear-gradient(135deg, #1A56FF, #3B7BFF); border-color: #1A56FF; }
  .toggle input:checked + .toggle-track::after { transform: translateX(19px); background: white; box-shadow: 0 2px 8px rgba(26,86,255,0.3); }

  /* ── SEARCH ── */
  .search-wrap { position: relative; }
  .search-wrap input { padding-left: 40px; }
  .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: ${t.text3}; font-size: 14px; pointer-events: none; }

  /* ── TOAST — GLASS ── */
  .toast {
    position: fixed; bottom: 80px; right: 20px; z-index: 9999;
    background: ${t.glass2};
    backdrop-filter: blur(24px) saturate(1.5);
    -webkit-backdrop-filter: blur(24px) saturate(1.5);
    border: 1px solid ${t.border2};
    border-radius: 16px; padding: 14px 20px; max-width: 340px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 16px 48px rgba(0,0,0,${dark?0.4:0.12}), ${t.glow};
    font-size: 13px;
    animation: slideRight 0.35s cubic-bezier(.4,0,.2,1);
  }

  /* ── SECTION HEADER ── */
  .sec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }
  .sec-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: -0.2px; color: ${t.text}; }

  /* ── SPINNER — GLOW ── */
  .spinner {
    width: 18px; height: 18px;
    border: 2px solid ${t.glass3}; border-top-color: #1A56FF;
    border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
    filter: drop-shadow(0 0 4px rgba(26,86,255,0.3));
  }

  /* ── PAGE BACKGROUND ── */
  .page-bg { position: relative; }
  .page-bg::before {
    content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 70% 50% at 10% 40%, rgba(30,80,255,${dark?0.06:0.04}) 0%, transparent 55%),
      radial-gradient(ellipse 50% 40% at 90% 20%, rgba(245,197,24,${dark?0.04:0.03}) 0%, transparent 50%),
      radial-gradient(ellipse 60% 50% at 50% 90%, rgba(212,43,58,${dark?0.04:0.03}) 0%, transparent 50%);
  }
  .page-content { position: relative; z-index: 1; }

  /* ── GRID ── */
  .g2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; }
  .g3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .g4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }
  @media (max-width: 1200px) { .g4 { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 900px)  { .g3 { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 640px)  {
    .g4,.g3,.g2 { grid-template-columns: 1fr; }
    .hero-banner-value { font-size: 28px; }
    .mini-kpi-grid { gap:10px; }
    .mini-kpi { min-width:120px; padding:14px; }
    .mini-kpi-val { font-size:18px; }
    [style*="grid-template-columns: 1fr 360px"],
    [style*="grid-template-columns: 1fr 330px"],
    [style*="grid-template-columns: 200px 1fr"],
    [style*="grid-template-columns: 240px 1fr"],
    [style*="grid-template-columns: 1fr 300px"],
    [style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
  }

  /* ── MOBILE NAV — GLASS ── */
  @media (max-width: 768px) {
    .sidebar { display: none !important; }
    .mobile-nav {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: ${t.bg2};
      backdrop-filter: blur(24px) saturate(1.5);
      -webkit-backdrop-filter: blur(24px) saturate(1.5);
      border-top: 1px solid ${t.border};
      display: flex; z-index: 200; padding: 6px 0 max(8px, env(safe-area-inset-bottom));
      overflow-x: auto; scrollbar-width: none;
      box-shadow: 0 -4px 24px rgba(0,0,0,${dark?0.3:0.06});
    }
    .mobile-nav::-webkit-scrollbar { display: none; }
    .mobile-nav .mn-item {
      flex: 0 0 auto; min-width: 64px; display: flex; flex-direction: column;
      align-items: center; gap: 3px; padding: 6px 10px;
      cursor: pointer; border-radius: 12px; font-size: 19px;
      transition: all 0.2s;
    }
    .mobile-nav .mn-item:active { transform: scale(0.92); }
    .mobile-nav .mn-label { font-size: 9px; font-weight: 600; color: ${t.text3}; }
    .mobile-nav .mn-item.active .mn-label { color: #1A56FF; }
    .mobile-nav .mn-item.wa-active .mn-label { color: #25D366; }
    .page-body { padding: 16px; padding-bottom: 92px; }
  }
  @media (min-width: 769px) { .mobile-nav { display: none; } }

  /* ── WHATSAPP ── */
  .wa-msg-out {
    background: linear-gradient(135deg,#1A56FF,#0D3DCC); color: white;
    border-radius: 18px 4px 18px 18px; padding: 11px 16px; max-width: 72%;
    font-size: 13px; line-height: 1.5;
    box-shadow: 0 4px 16px rgba(26,86,255,0.25);
    white-space: pre-wrap; word-break: break-word;
  }
  .wa-msg-in {
    background: ${t.surface};
    backdrop-filter: blur(16px);
    border: 1px solid ${t.border};
    border-radius: 4px 18px 18px 18px; padding: 11px 16px; max-width: 72%;
    font-size: 13px; line-height: 1.5; color: ${t.text};
    white-space: pre-wrap; word-break: break-word;
    box-shadow: ${t.shadowNeo};
  }
  .wa-time { font-size: 9px; opacity: 0.6; margin-top: 3px; text-align: right; }

  /* ── QR ── */
  .qr-corner { position: absolute; width: 22px; height: 22px; }

  /* ── THEME TOGGLE BTN — NEOMORPHIC ── */
  .theme-btn {
    width: 38px; height: 38px; border-radius: 12px;
    border: 1px solid ${t.border2};
    background: ${t.glass2};
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 17px;
    transition: all 0.22s; color: ${t.text2};
    box-shadow: ${t.shadowNeo};
  }
  .theme-btn:hover {
    background: ${t.glass3}; color: ${t.text};
    box-shadow: ${t.shadow};
    transform: scale(1.08);
  }
  .theme-btn:active { transform: scale(0.95); }

  /* ── KEYFRAMES ── */
  @keyframes fadeIn    { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn   { from { opacity: 0; transform: scale(0.92);     } to { opacity: 1; transform: scale(1);     } }
  @keyframes slideRight{ from { opacity: 0; transform: translateX(24px);} to { opacity: 1; transform: translateX(0);} }
  @keyframes spin      { to { transform: rotate(360deg); } }
  @keyframes pulse     { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes glow      { 0%,100% { box-shadow: 0 0 20px rgba(26,86,255,0.2); } 50% { box-shadow: 0 0 40px rgba(26,86,255,0.5); } }
  @keyframes barGrow   { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); transform-origin: bottom; } }
  @keyframes float     { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
  @keyframes shimmer   { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

  .fade-in  { animation: fadeIn  0.35s ease forwards; }
  .scale-in { animation: scaleIn 0.25s ease forwards; }
  .float    { animation: float 3s ease-in-out infinite; }
`;
};

// ─── MICRO COMPONENTS ──────────────────────────────────────────────────────────
function Tag({ status }) {
  const m = statusMeta[status] || statusMeta.inactive;
  return <span className="tag" style={{ background: m.bg, color: m.color }}>{m.label}</span>;
}

function KpiBanner({ kpis }) {
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener("scroll", checkScroll); ro.disconnect(); };
  }, [checkScroll, kpis]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  return (
    <div className="kpi-banner">
      <div className={`kpi-banner-arrow left ${!canLeft ? "hidden" : ""}`} onClick={() => scroll(-1)}>◀</div>
      <div className="kpi-banner-scroll" ref={scrollRef}>
        {kpis.map((k, i) => (
          <Kpi key={i} icon={k.icon} label={k.label} value={k.value} trend={k.trend} trendUp={k.trendUp} color={k.color} />
        ))}
      </div>
      <div className={`kpi-banner-arrow right ${!canRight ? "hidden" : ""}`} onClick={() => scroll(1)}>▶</div>
    </div>
  );
}

function Spinner() { return <span className="spinner" />; }

function Avatar({ name, size = 36, color = "#1A56FF" }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `${color}20`, border: `2px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.36, color, flexShrink: 0 }}>
      {initials(name)}
    </div>
  );
}

function Kpi({ icon, label, value, trend, trendUp = true, color = "#1A56FF" }) {
  return (
    <div className="kpi fade-in">
      <div className="kpi-glow" style={{ background: color }} />
      <div className="kpi-icon" style={{ background: `${color}18`, color }}>{icon}</div>
      <div className="kpi-val">{value}</div>
      <div className="kpi-label">{label}</div>
      {trend && <div className="kpi-trend" style={{ color: trendUp ? "#16C55E" : "#D42B3A" }}>
        {trendUp ? "▲" : "▼"} {trend}
      </div>}
    </div>
  );
}

// ─── HERO BANNER COMPONENT ─────────────────────────────────────────────────────
function HeroBanner({ label, value, subtitle, progress, progressLabel, progressColor, trend, trendUp, icon, children, onEditGoal, goalLabel }) {
  const [editOpen, setEditOpen] = useState(false);
  const [tempVal, setTempVal] = useState("");

  return (
    <div className="hero-banner fade-in">
      <div style={{ position:"relative", zIndex:1 }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
          <div>
            <div className="hero-banner-label">{label}</div>
            <div className="hero-banner-value">{value}</div>
            {subtitle && <div className="hero-banner-sub">{subtitle}</div>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            {trend && (
              <span style={{ padding:"4px 10px", borderRadius:20, fontSize:12, fontWeight:700, background: trendUp ? "rgba(22,197,94,0.12)" : "rgba(212,43,58,0.12)", color: trendUp ? "#16C55E" : "#D42B3A" }}>
                {trendUp ? "↗" : "↘"} {trend}
              </span>
            )}
            {onEditGoal && (
              <button onClick={() => { setTempVal(""); setEditOpen(true); }}
                style={{ padding:"6px 12px", borderRadius:9, background:"rgba(26,86,255,0.1)", border:"1px solid rgba(26,86,255,0.25)", color:"#1A56FF", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans'", display:"flex", alignItems:"center", gap:4 }}>
                🎯 Modifier objectif
              </button>
            )}
            {icon && <div style={{ width:48, height:48, borderRadius:14, background:"rgba(26,86,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{icon}</div>}
          </div>
        </div>
        {progress !== undefined && (
          <div>
            <div className="hero-progress">
              <div className="hero-progress-fill" style={{ width:`${Math.min(progress, 100)}%`, background: progressColor || undefined }} />
            </div>
            {progressLabel && <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
              <span style={{ fontSize:11, color:"#7B91C4" }}>{progressLabel}</span>
              <span style={{ fontSize:12, fontWeight:700, color: progress >= 100 ? "#16C55E" : "#1A56FF" }}>● {progress.toFixed(0)}%</span>
            </div>}
          </div>
        )}
        {children}
      </div>
      {editOpen && onEditGoal && (
        <div style={{ marginTop:14, padding:14, background:"rgba(26,86,255,0.06)", borderRadius:12, border:"1px solid rgba(26,86,255,0.15)" }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#7B91C4", marginBottom:8, textTransform:"uppercase", letterSpacing:0.5 }}>🎯 {goalLabel || "Modifier l'objectif"}</div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <input type="number" value={tempVal} onChange={e => setTempVal(e.target.value)} placeholder="Nouvel objectif..." style={{ flex:1, padding:"8px 12px", borderRadius:8 }} />
            <button className="btn btn-primary" style={{ fontSize:12, padding:"8px 16px" }} onClick={() => { if(tempVal) { onEditGoal(Number(tempVal)); setEditOpen(false); } }}>✅ Sauvegarder</button>
            <button className="btn btn-ghost" style={{ fontSize:12, padding:"8px 12px" }} onClick={() => setEditOpen(false)}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniKpiCard({ icon, label, value, trend, trendUp, color = "#1A56FF" }) {
  return (
    <div className="mini-kpi fade-in">
      <div className="mini-kpi-icon">{icon}</div>
      <div className="mini-kpi-val" style={{ color }}>{value}</div>
      <div className="mini-kpi-label">{label}</div>
      {trend && <div className="mini-kpi-trend" style={{ color: trendUp ? "#16C55E" : "#D42B3A" }}>{trendUp ? "↗" : "↘"} {trend}</div>}
    </div>
  );
}

// ─── SVG CHARTS ────────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 120, strokeWidth = 14, centerLabel, centerValue }) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(26,86,255,0.08)" strokeWidth={strokeWidth} />
        {segments.map((seg, i) => {
          const dash = (seg.value / 100) * circumference;
          const o = offset;
          offset += dash;
          return <circle key={i} cx={size/2} cy={size/2} r={r} fill="none" stroke={seg.color} strokeWidth={strokeWidth} strokeDasharray={`${dash} ${circumference - dash}`} strokeDashoffset={-o} strokeLinecap="round" style={{ transition:"stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease" }} />;
        })}
      </svg>
      {(centerLabel || centerValue) && (
        <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          {centerValue && <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:size*0.18, lineHeight:1 }}>{centerValue}</div>}
          {centerLabel && <div style={{ fontSize:size*0.085, color:"#7B91C4", marginTop:2 }}>{centerLabel}</div>}
        </div>
      )}
    </div>
  );
}

const SparkLine = ({ data, width = 100, height = 32, color = "#1A56FF", fill = true }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) - 2}`).join(" ");
  return (
    <svg width={width} height={height} style={{ display:"block" }}>
      {fill && <polygon points={`0,${height} ${points} ${width},${height}`} fill={`${color}15`} />}
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

function MiniBarChartViz({ data, height = 48, barColor = "#1A56FF" }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:3, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
          <div style={{ width:"100%", height:`${Math.max((d.value / max) * 100, 8)}%`, borderRadius:"3px 3px 0 0", background: d.highlight ? "#D42B3A" : barColor, opacity: d.highlight ? 1 : 0.7, transition:"height 0.5s ease" }} />
          {d.label && <span style={{ fontSize:8, color:"#7B91C4" }}>{d.label}</span>}
        </div>
      ))}
    </div>
  );
}

function InsightCard({ icon, iconBg, title, description, action, onAction }) {
  return (
    <div className="insight-card">
      <div className="insight-icon" style={{ background: iconBg }}>{icon}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:600, fontSize:13, marginBottom:2 }}>{title}</div>
        <div style={{ fontSize:12, color:"#7B91C4", lineHeight:1.5 }}>{description}</div>
      </div>
      {action && <button className="btn btn-ghost" style={{ fontSize:11, padding:"5px 10px", flexShrink:0 }} onClick={onAction}>{action}</button>}
    </div>
  );
}

function HelpText({ children, icon = "💡" }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"10px 14px", background:"rgba(26,86,255,0.04)", border:"1px solid rgba(26,86,255,0.1)", borderRadius:10, marginBottom:16, fontSize:12, color:"#7B91C4", lineHeight:1.6 }}>
      <span style={{ flexShrink:0, fontSize:14 }}>{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function Modal({ title, onClose, children, maxWidth = 560 }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth }}>
        <div className="modal-header">
          <h3 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 17, fontWeight: 700 }}>{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ fontSize: 16 }}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

// ─── PRODUCT IMAGE EDITOR ────────────────────────────────────────────────────
function ProductImageEditor({ product, onImageUpdate, showToast }) {
  const [mode, setMode] = useState(null); // null, 'upload', 'capture', 'generating', 'confirm'
  const [rawImage, setRawImage] = useState(null);
  const [aiImage, setAiImage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);
  const streamRef = useRef(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => { return () => stopCamera(); }, [stopCamera]);

  const startCamera = async () => {
    setMode("capture");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: 640, height: 480 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      showToast("❌ Impossible d'accéder à la caméra", "error");
      setMode(null);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    const dataUrl = c.toDataURL("image/jpeg", 0.85);
    setRawImage(dataUrl);
    stopCamera();
    setMode("preview");
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return showToast("Fichier image requis", "error");
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImage(ev.target.result);
      setMode("preview");
    };
    reader.readAsDataURL(file);
  };

  const generateAiImage = async () => {
    if (!rawImage) return;
    setGenerating(true);
    setMode("generating");
    // Simulate AI product shot generation (in production, this calls Lovable AI edge function)
    await new Promise(r => setTimeout(r, 2500));
    // For demo: apply a simulated "professional" effect by creating a styled canvas
    try {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = 600; c.height = 600;
        const ctx = c.getContext("2d");
        // White/gradient background
        const grad = ctx.createRadialGradient(300, 300, 50, 300, 300, 400);
        grad.addColorStop(0, "#ffffff");
        grad.addColorStop(1, "#e8ecf4");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 600, 600);
        // Subtle shadow
        ctx.shadowColor = "rgba(0,0,0,0.15)";
        ctx.shadowBlur = 40;
        ctx.shadowOffsetY = 15;
        // Center and fit image
        const scale = Math.min(460 / img.width, 460 / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (600 - w) / 2, (600 - h) / 2, w, h);
        // Brand watermark
        ctx.shadowColor = "transparent";
        ctx.font = "bold 11px 'DM Sans', sans-serif";
        ctx.fillStyle = "rgba(26,86,255,0.35)";
        ctx.textAlign = "right";
        ctx.fillText("BizPlatform DRC ✨", 580, 585);
        const result = c.toDataURL("image/jpeg", 0.92);
        setAiImage(result);
        setMode("confirm");
        setGenerating(false);
      };
      img.src = rawImage;
    } catch {
      showToast("Erreur lors de la génération", "error");
      setMode("preview");
      setGenerating(false);
    }
  };

  const confirmImage = () => {
    onImageUpdate(aiImage || rawImage);
    showToast("✅ Image produit mise à jour!", "success");
    reset();
  };

  const useOriginal = () => {
    onImageUpdate(rawImage);
    showToast("✅ Image originale appliquée!", "success");
    reset();
  };

  const reset = () => {
    setMode(null); setRawImage(null); setAiImage(null); setGenerating(false); stopCamera();
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Current image or placeholder */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
        <div style={{ width: 80, height: 80, borderRadius: 12, border: "2px dashed rgba(26,86,255,0.25)", background: "rgba(26,86,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
          {product.image ? (
            <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 10 }} />
          ) : (
            <span style={{ fontSize: 36 }}>{product.emoji}</span>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#7B91C4", textTransform: "uppercase", letterSpacing: 0.5 }}>Image Produit</div>
          {!mode && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-primary" style={{ fontSize: 11, padding: "6px 12px" }} onClick={() => { fileRef.current?.click(); }}>📁 Uploader</button>
              <button className="btn btn-ghost" style={{ fontSize: 11, padding: "6px 12px" }} onClick={startCamera}>📷 Capturer</button>
              {product.image && <button className="btn btn-red" style={{ fontSize: 11, padding: "6px 10px" }} onClick={() => { onImageUpdate(null); showToast("Image supprimée", "info"); }}>🗑️</button>}
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleUpload} />
      </div>

      {/* Camera capture */}
      {mode === "capture" && (
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(26,86,255,0.2)", marginBottom: 10 }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", display: "block", maxHeight: 280 }} />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div style={{ display: "flex", gap: 8, padding: 10, background: "rgba(0,0,0,0.3)" }}>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={capturePhoto}>📸 Prendre la photo</button>
            <button className="btn btn-ghost" onClick={() => { stopCamera(); setMode(null); }}>✕ Annuler</button>
          </div>
        </div>
      )}

      {/* Preview raw image */}
      {mode === "preview" && rawImage && (
        <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(26,86,255,0.2)", marginBottom: 10 }}>
          <img src={rawImage} alt="Preview" style={{ width: "100%", maxHeight: 280, objectFit: "contain", background: "#f0f0f0", display: "block" }} />
          <div style={{ display: "flex", gap: 8, padding: 10, background: "rgba(26,86,255,0.04)" }}>
            <button className="btn btn-primary" style={{ flex: 2, justifyContent: "center" }} onClick={generateAiImage}>✨ Générer photo pro IA</button>
            <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={useOriginal}>📎 Utiliser telle quelle</button>
            <button className="btn btn-ghost btn-icon" onClick={reset}>✕</button>
          </div>
        </div>
      )}

      {/* Generating */}
      {mode === "generating" && (
        <div style={{ textAlign: "center", padding: "30px 0", borderRadius: 12, border: "1px solid rgba(245,197,24,0.25)", background: "rgba(245,197,24,0.04)", marginBottom: 10 }}>
          <Spinner />
          <div style={{ fontSize: 13, fontWeight: 600, color: "#F5C518", marginTop: 12 }}>✨ L'IA transforme votre image en photo professionnelle...</div>
          <div style={{ fontSize: 11, color: "#7B91C4", marginTop: 4 }}>Fond propre · Éclairage studio · Qualité e-commerce</div>
        </div>
      )}

      {/* Confirm AI result */}
      {mode === "confirm" && aiImage && (
        <div style={{ borderRadius: 12, overflow: "hidden", border: "2px solid rgba(22,197,94,0.35)", marginBottom: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(26,86,255,0.1)" }}>
            <div style={{ background: "rgba(0,0,0,0.03)", padding: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#7B91C4", textAlign: "center", marginBottom: 4 }}>ORIGINALE</div>
              <img src={rawImage} alt="Original" style={{ width: "100%", height: 160, objectFit: "contain", borderRadius: 8, background: "#f8f8f8" }} />
            </div>
            <div style={{ background: "rgba(22,197,94,0.03)", padding: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#16C55E", textAlign: "center", marginBottom: 4 }}>✨ IA PRO</div>
              <img src={aiImage} alt="AI Enhanced" style={{ width: "100%", height: 160, objectFit: "contain", borderRadius: 8, background: "#f8f8f8" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, padding: 10 }}>
            <button className="btn btn-success" style={{ flex: 2, justifyContent: "center" }} onClick={confirmImage}>✅ Confirmer photo IA</button>
            <button className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={useOriginal}>📎 Garder l'originale</button>
            <button className="btn btn-ghost btn-icon" onClick={() => { setAiImage(null); setMode("preview"); }}>🔄</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const icons = { success: "✅", error: "❌", info: "ℹ️", whatsapp: "💬", warning: "⚠️" };
  const colors = { success: "#16C55E", error: "#D42B3A", info: "#1A56FF", whatsapp: "#25D366", warning: "#F5C518" };
  return (
    <div className="toast">
      <span>{icons[type] || "ℹ️"}</span>
      <span style={{ flex: 1, fontSize: 13 }}>{message}</span>
      <button style={{ background: "none", border: "none", cursor: "pointer", opacity: 0.5, fontSize: 14 }} onClick={onClose}>✕</button>
    </div>
  );
}

const RevenueChart = ({ data: chartData, dark }) => {
  const max = Math.max(...chartData.map(d => d.amount));
  const avg = chartData.reduce((s,d) => s + d.amount, 0) / chartData.length;
  const barColors = [
    "linear-gradient(180deg, #3B82F6, #1D4ED8)",
    "linear-gradient(180deg, #60A5FA, #2563EB)",
    "linear-gradient(180deg, #38BDF8, #0284C7)",
    "linear-gradient(180deg, #34D399, #059669)",
    "linear-gradient(180deg, #FBBF24, #D97706)",
    "linear-gradient(180deg, #F97316, #EA580C)",
    "linear-gradient(180deg, #F43F5E, #BE123C)",
  ];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 140, paddingTop: 10, position: "relative" }}>
      {/* Average line */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: `${(avg / max) * 100 * 1.3 + 20}px`, borderTop: "1.5px dashed rgba(26,86,255,0.3)", zIndex: 1 }}>
        <span style={{ position: "absolute", right: 0, top: -14, fontSize: 9, color: "#7B91C4", background: dark ? "#0E1330" : "#EFF2FA", padding: "1px 4px", borderRadius: 3 }}>moy</span>
      </div>
      {chartData.map((d, i) => {
        const h = Math.max((d.amount / max) * 100, 8);
        const isMax = d.amount === max;
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: isMax ? "#F59E0B" : "#60A5FA", opacity: 0.9 }}>${(d.amount/1000).toFixed(1)}k</div>
            <div style={{ width: "100%", height: `${h}%`, borderRadius: "8px 8px 2px 2px", background: barColors[i % barColors.length], animation: "barGrow 0.6s ease forwards", animationDelay: `${i * 80}ms`, cursor: "pointer", transition: "all 0.25s", boxShadow: isMax ? "0 0 20px rgba(245,158,11,0.4)" : "0 4px 12px rgba(26,86,255,0.15)", border: isMax ? "1px solid rgba(245,158,11,0.5)" : "none" }}
              title={`${d.day}: $${d.amount}`}
              onMouseEnter={e => e.currentTarget.style.transform = "scaleY(1.06)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scaleY(1)"}
            />
            <div style={{ fontSize: 11, color: isMax ? "#F59E0B" : "#7B91C4", fontWeight: isMax ? 800 : 600 }}>{d.day}</div>
          </div>
        );
      })}
    </div>
  );
};

// ─── HOME PAGE ─────────────────────────────────────────────────────────────────
function HomePage({ data, setData, showToast, dark, kpiGoals, updateGoal, setActivePage }) {
  const [showWAModal, setShowWAModal] = useState(false);
  const [expandedCard, setExpandedCard] = useState(null);
  const [dateFilter, setDateFilter] = useState("all");
  const totalRevenue  = data.sales.reduce((s, x) => s + x.total_amount, 0);
  const totalExpenses = data.expenses.filter(e => e.status === "approved").reduce((s, x) => s + x.amount, 0);
  const totalProfit   = data.sales.reduce((s, x) => s + x.profit, 0);
  const lowStock      = data.products.filter(p => p.stock_quantity <= p.low_stock_alert);
  const revenueGoal   = kpiGoals.home_revenue;

  // Date filtering
  const filterByDate = (items, dateField) => {
    if (dateFilter === "all") return items;
    const now = new Date();
    const cutoff = new Date();
    if (dateFilter === "today") cutoff.setDate(now.getDate());
    else if (dateFilter === "week") cutoff.setDate(now.getDate() - 7);
    else if (dateFilter === "month") cutoff.setMonth(now.getMonth() - 1);
    return items.filter(item => new Date(item[dateField]) >= cutoff);
  };

  const filteredSales = filterByDate(data.sales, "sale_date");
  const filteredRevenue = filteredSales.reduce((s, x) => s + x.total_amount, 0);
  const filteredProfit = filteredSales.reduce((s, x) => s + x.profit, 0);

  return (
    <div className="page-bg page-content fade-in">
      {/* Date Filter Bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontSize: 13, color: "#7B91C4", marginBottom: 3 }}>Bienvenue 👋</div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>{data.user.name.split(" ").slice(0,2).join(" ")}</h1>
          <div style={{ fontSize: 12, color: "#7B91C4", marginTop: 3 }}>{data.user.company} · {data.user.role}</div>
        </div>
        <div style={{ display:"flex", gap:4, background:dark?"rgba(15,22,55,0.5)":"rgba(240,244,255,0.7)", padding:4, borderRadius:12, border:"1px solid rgba(26,86,255,0.1)" }}>
          {[["all","📊 Tout"],["today","📅 Aujourd'hui"],["week","📆 7 jours"],["month","🗓️ 30 jours"]].map(([k,l]) => (
            <button key={k} onClick={() => setDateFilter(k)}
              style={{ padding:"6px 14px", borderRadius:9, fontSize:12, fontWeight:dateFilter===k?700:500, cursor:"pointer", border:"none", fontFamily:"'DM Sans'",
                background: dateFilter===k ? "linear-gradient(135deg,#1A56FF,#2B6BFF)" : "transparent",
                color: dateFilter===k ? "white" : "#7B91C4",
                boxShadow: dateFilter===k ? "0 4px 12px rgba(26,86,255,0.3)" : "none",
                transition:"all 0.2s" }}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <HelpText icon="👋">Ceci est votre tableau de bord — c'est un résumé de tout ce qui se passe dans votre business. Utilisez les filtres de date pour voir vos performances sur différentes périodes. Cliquez sur les cartes pour voir plus de détails.</HelpText>

      {/* Hero KPI */}
      <HeroBanner
        label="REVENUS TOTAUX"
        value={fmt(totalRevenue)}
        subtitle={`Objectif: ${fmt(revenueGoal)} · ${data.user.company}`}
        progress={(totalRevenue / revenueGoal) * 100}
        progressLabel={`${fmt(totalRevenue)} sur ${fmt(revenueGoal)}`}
        trend={kpiGoals.home_revenue_trend}
        trendUp={true}
        icon="📊"
        onEditGoal={(v) => { updateGoal("home_revenue", v); showToast(`🎯 Objectif revenus mis à jour: ${fmt(v)}`, "success"); }}
        goalLabel="Objectif de revenus ($)"
      />
      <div className="mini-kpi-grid">
        <MiniKpiCard icon="📉" label="Dépenses" value={fmt(totalExpenses)} trend="+5.1%" trendUp={false} color="#D42B3A" />
        <MiniKpiCard icon="✨" label="Bénéfice" value={fmt(totalProfit)} trend="+23.7%" trendUp={true} color="#16C55E" />
        <MiniKpiCard icon="🛍️" label="Nb de Ventes" value={data.sales.length} trend="+12%" trendUp={true} color="#F5C518" />
        <MiniKpiCard icon="⚠️" label="Produits en rupture" value={lowStock.length} trendUp={false} color={lowStock.length>0?"#D42B3A":"#16C55E"} />
      </div>

      {/* ── VISUAL ANALYTICS ROW ── */}
      <div className="g3" style={{ marginBottom:16 }}>
        {/* Profit Breakdown Donut */}
        <div className="card card-pad">
          <div className="sec-title" style={{ marginBottom:8 }}>💰 Répartition Profit</div>
          <div style={{ fontSize:10, color:"#7B91C4", marginBottom:8 }}>Comment votre argent se divise : ce que vous gardez (profit), ce que vous dépensez, et le coût des marchandises</div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <DonutChart
              segments={[
                { value: totalRevenue > 0 ? (totalProfit/totalRevenue)*100 : 0, color:"#16C55E" },
                { value: totalRevenue > 0 ? (totalExpenses/totalRevenue)*100 : 0, color:"#D42B3A" },
                { value: totalRevenue > 0 ? Math.max(100 - (totalProfit/totalRevenue)*100 - (totalExpenses/totalRevenue)*100, 0) : 0, color:"#1A56FF" },
              ]}
              size={100}
              strokeWidth={14}
              centerValue={totalRevenue > 0 ? ((totalProfit/totalRevenue)*100).toFixed(0)+"%" : "0%"}
              centerLabel="marge"
            />
            <div style={{ flex:1 }}>
              {[["Profit",fmt(totalProfit),"#16C55E"],["Dépenses",fmt(totalExpenses),"#D42B3A"],["COGS",fmt(totalRevenue-totalProfit-totalExpenses > 0 ? totalRevenue-totalProfit-totalExpenses : 0),"#1A56FF"]].map(([l,v,c]) => (
                <div key={l} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0" }}>
                  <div style={{ width:8, height:8, borderRadius:2, background:c }} />
                  <span style={{ fontSize:11, color:"#7B91C4", flex:1 }}>{l}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:c }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Methods Donut */}
        <div className="card card-pad">
          <div className="sec-title" style={{ marginBottom:8 }}>💳 Modes de Paiement</div>
          <div style={{ fontSize:10, color:"#7B91C4", marginBottom:8 }}>Comment vos clients vous paient : cash, M-Pesa/Airtel (mobile), crédit (à rembourser plus tard), ou banque</div>
          {(() => {
            const methods = ["cash","mobile_money","credit","bank"];
            const colors = ["#16C55E","#25D366","#D42B3A","#1A56FF"];
            const labels = ["Cash","Mobile","Crédit","Banque"];
            const totals = methods.map(m => data.sales.filter(s=>s.payment_method===m).reduce((a,s)=>a+s.total_amount,0));
            const sum = totals.reduce((a,b)=>a+b,0) || 1;
            return (
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <DonutChart
                  segments={totals.map((t,i) => ({ value:(t/sum)*100, color:colors[i] }))}
                  size={100}
                  strokeWidth={14}
                  centerValue={data.sales.length+""}
                  centerLabel="ventes"
                />
                <div style={{ flex:1 }}>
                  {labels.map((l,i) => (
                    <div key={l} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0" }}>
                      <div style={{ width:8, height:8, borderRadius:2, background:colors[i] }} />
                      <span style={{ fontSize:11, color:"#7B91C4", flex:1 }}>{l}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:colors[i] }}>{fmt(totals[i])}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Daily Revenue Sparkline card */}
        <div className="card card-pad">
          <div className="sec-title" style={{ marginBottom:8 }}>📈 Tendance Quotidienne</div>
          <div style={{ fontSize:10, color:"#7B91C4", marginBottom:8 }}>Cette courbe montre si vos revenus montent ↗ ou descendent ↘ chaque jour de la semaine</div>
          <SparkLine data={data.revenueChart.map(d=>d.amount)} width={200} height={60} color="#1A56FF" />
          <div style={{ display:"flex", gap:14, marginTop:12 }}>
            {[["Moy",fmt(data.revenueChart.reduce((s,d)=>s+d.amount,0)/7),"#1A56FF"],["Max",fmt(Math.max(...data.revenueChart.map(d=>d.amount))),"#16C55E"],["Min",fmt(Math.min(...data.revenueChart.map(d=>d.amount))),"#D42B3A"]].map(([l,v,c]) => (
              <div key={l}><div style={{ fontSize:10, color:"#7B91C4" }}>{l}</div><div style={{ fontSize:13, fontWeight:700, color:c }}>{v}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16, marginBottom: 16 }}>
        {/* Chart */}
        <div className="card card-pad">
          <div className="sec-head">
            <div className="sec-title">📊 Revenus Hebdomadaires</div>
            <span style={{ fontSize: 11, color: "#7B91C4" }}>7 derniers jours</span>
          </div>
          <RevenueChart data={data.revenueChart} dark={dark} />
          <div style={{ display: "flex", gap: 20, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border, rgba(26,86,255,0.12))" }}>
            {[["Total",fmt(data.revenueChart.reduce((s,d)=>s+d.amount,0))],["Moy/jour",fmt(data.revenueChart.reduce((s,d)=>s+d.amount,0)/7)],["Record",fmt(Math.max(...data.revenueChart.map(d=>d.amount)))]].map(([k,v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: "#7B91C4", marginBottom: 2 }}>{k}</div>
                <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize: 15, fontWeight: 700, color: "#1A56FF" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Quick actions */}
          <div className="card card-pad-sm">
            <div className="sec-title" style={{ marginBottom: 12 }}>⚡ Actions Rapides</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                ["🛒 Nouvelle Vente","btn-primary", () => setActivePage("sales")],
                ["📦 Nouveau Produit","btn-success", () => setActivePage("products")],
                ["📊 Rapport","btn-yellow", () => setShowWAModal(true)],
                ["✍️ Nouveau Post","btn-ghost", () => setActivePage("marketing")],
                ["💸 Nouvelle Dépense","btn-red", () => setActivePage("accounting")],
                ["🧾 Facture","btn-ghost", () => setActivePage("sales")],
              ].map(([l,c,action]) => (
                <button key={l} className={`btn ${c}`} style={{ justifyContent: "center", fontSize: 11, width: "100%", padding:"9px 8px" }} onClick={action}>{l}</button>
              ))}
            </div>
          </div>

          {/* Alerts */}
          {lowStock.length > 0 && (
            <div className="card card-pad-sm" style={{ borderColor: "rgba(245,197,24,0.3)" }}>
              <div className="sec-title" style={{ marginBottom: 10, color: "#F5C518" }}>⚠️ Alertes Stock Bas</div>
              {lowStock.map(p => (
                <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(26,86,255,0.08)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, fontSize: 13 }}><span>{p.emoji}</span>{p.name}</div>
                  <span className="tag" style={{ background:"rgba(212,43,58,0.12)", color:"#D42B3A" }}>{p.stock_quantity}u</span>
                </div>
              ))}
            </div>
          )}

          {/* Top clients */}
          <div className="card card-pad-sm">
            <div className="sec-title" style={{ marginBottom: 10 }}>👑 Top Clients</div>
            {data.clients.filter(c => c.status==="vip").map(c => (
              <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:"1px solid rgba(26,86,255,0.08)" }}>
                <Avatar name={c.name} size={28} color="#F5C518" />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: "#7B91C4" }}>{fmt(c.total_revenue)}</div>
                </div>
                <span className="tag" style={{ background:"rgba(245,197,24,0.12)", color:"#F5C518" }}>VIP</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product Performance Graph */}
      <div className="card card-pad" style={{ marginBottom:16 }}>
        <div className="sec-head">
          <div className="sec-title">📦 Performance par Produit</div>
          <span style={{ fontSize:11, color:"#7B91C4" }}>Revenus & Marges</span>
        </div>
        {(() => {
          const prodData = data.products.map(p => {
            const rev = data.sales.filter(s=>s.product_name===p.name).reduce((a,s)=>a+s.total_amount,0);
            const profit = data.sales.filter(s=>s.product_name===p.name).reduce((a,s)=>a+s.profit,0);
            const sold = data.sales.filter(s=>s.product_name===p.name).reduce((a,s)=>a+s.quantity,0);
            const margin = p.unit_price > 0 ? ((p.unit_price-p.cogs)/p.unit_price*100) : 0;
            return { ...p, rev, profit, sold, margin };
          }).sort((a,b) => b.rev - a.rev);
          const maxRev = Math.max(...prodData.map(p => p.rev), 1);
          const gradients = ["linear-gradient(90deg,#3B82F6,#60A5FA)","linear-gradient(90deg,#10B981,#34D399)","linear-gradient(90deg,#F59E0B,#FBBF24)","linear-gradient(90deg,#F43F5E,#FB7185)","linear-gradient(90deg,#8B5CF6,#A78BFA)","linear-gradient(90deg,#06B6D4,#22D3EE)"];
          return (
            <div>
              {prodData.map((p,i) => (
                <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12, padding:"8px 0", borderBottom: i < prodData.length - 1 ? "1px solid rgba(26,86,255,0.06)" : "none" }}>
                  <span style={{ fontSize:24, width:32, textAlign:"center" }}>{p.emoji}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontSize:13, fontWeight:700, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</span>
                      <span style={{ fontSize:13, fontWeight:800, color:"#3B82F6", flexShrink:0, marginLeft:8 }}>{fmt(p.rev)}</span>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ flex:1, height:10, background:"rgba(26,86,255,0.06)", borderRadius:5, overflow:"hidden" }}>
                        <div style={{ width:`${(p.rev/maxRev)*100}%`, height:"100%", background:gradients[i%gradients.length], borderRadius:5, transition:"width 0.8s ease", boxShadow:"0 0 8px rgba(59,130,246,0.2)" }} />
                      </div>
                      <span style={{ fontSize:10, color:"#16C55E", fontWeight:700, flexShrink:0 }}>{p.margin.toFixed(0)}%</span>
                    </div>
                    <div style={{ display:"flex", gap:12, marginTop:4, fontSize:10, color:"#7B91C4" }}>
                      <span>{p.sold}u vendues</span>
                      <span>Profit: <strong style={{ color:"#16C55E" }}>{fmt(p.profit)}</strong></span>
                      <span>Stock: <strong style={{ color: p.stock_quantity <= p.low_stock_alert ? "#D42B3A" : "#7B91C4" }}>{p.stock_quantity}u</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Transactions */}
      <div className="card card-pad">
        <div className="sec-head">
          <div className="sec-title">🕐 Dernières Transactions</div>
          <button className="btn btn-ghost" style={{ fontSize: 12 }}>Voir tout →</button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead><tr><th>Produit</th><th>Client</th><th>Qté</th><th>Montant</th><th>Profit</th><th>Paiement</th><th>Date</th></tr></thead>
            <tbody>
              {data.sales.slice(0,8).map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500 }}>{s.product_name}</td>
                  <td style={{ color: "#7B91C4" }}>{s.client_name}</td>
                  <td>{s.quantity}</td>
                  <td style={{ color: "#1A56FF", fontWeight: 600 }}>{fmt(s.total_amount)}</td>
                  <td style={{ color: "#16C55E", fontWeight: 600 }}>{fmt(s.profit)}</td>
                  <td>{payIcons[s.payment_method]} <span style={{ fontSize: 11, color: "#7B91C4" }}>{s.payment_method}</span></td>
                  <td style={{ color: "#7B91C4", fontSize: 12 }}>{s.sale_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showWAModal && (
        <Modal title="📱 Envoyer Rapport WhatsApp" onClose={() => setShowWAModal(false)}>
          <div style={{ fontSize: 12, color: "#1A56FF", fontWeight: 600, marginBottom: 8 }}>Rapport Business · {new Date().toLocaleDateString("fr-FR")}</div>
          <textarea readOnly rows={8} style={{ fontFamily:"monospace", fontSize: 11, marginBottom: 14 }}
            value={`📊 RAPPORT — ${data.user.company}\n\n💰 Revenus: ${fmt(totalRevenue)}\n📉 Dépenses: ${fmt(totalExpenses)}\n✨ Profit: ${fmt(totalProfit)}\n🛍️ Ventes: ${data.sales.length}\n\n_Mukendi BizPlatform_ 🇨🇩`} />
          <div className="form-group"><label className="form-label">Numéro destinataire</label><input id="wa-report-num" placeholder="+243 8XX XXX XXX" /></div>
          <button className="btn btn-wa" style={{ width:"100%", justifyContent:"center" }} onClick={async () => {
            const num = document.getElementById("wa-report-num")?.value;
            if (!num) return showToast("Entrez un numéro", "error");
            try {
              await sendWhatsApp(num, `📊 RAPPORT — ${data.user.company}\n\n💰 Revenus: ${fmt(totalRevenue)}\n📉 Dépenses: ${fmt(totalExpenses)}\n✨ Profit: ${fmt(totalProfit)}\n🛍️ Ventes: ${data.sales.length}\n\n_Mukendi BizPlatform_ 🇨🇩`);
              showToast("✅ Rapport envoyé via WhatsApp!", "whatsapp");
              setShowWAModal(false);
            } catch (e) { showToast(`❌ Erreur: ${e.message}`, "error"); }
          }}>📤 Envoyer</button>
        </Modal>
      )}
    </div>
  );
}

// ─── SALES PAGE ────────────────────────────────────────────────────────────────
function SalesPage({ data, setData, showToast, kpiGoals, updateGoal, exchangeRate }) {
  const [tab, setTab] = useState("pos");
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [receipt, setReceipt] = useState(null);
  const receiptRef = useRef(null);

  const filtered = data.products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const cartTotal = cart.reduce((s, i) => s + i.unit_price * i.qty, 0);
  const cartProfit = cart.reduce((s, i) => s + (i.unit_price - i.cogs) * i.qty, 0);
  const salesGoal = kpiGoals.sales_daily;

  const addToCart = (p) => {
    setCart(prev => { const ex = prev.find(i => i.id === p.id); return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }]; });
  };
  const changeQty = (id, d) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i).filter(i => i.qty > 0));
  const changePrice = (id, newPrice) => {
    const val = parseFloat(newPrice);
    if (!isNaN(val) && val >= 0) setCart(prev => prev.map(i => i.id === id ? { ...i, unit_price: val } : i));
  };
  const clearCart = () => setCart([]);

  const printReceipt = () => {
    if (!receiptRef.current) return;
    const printWin = window.open("", "_blank", "width=320,height=600");
    printWin.document.write(`<html><head><title>Reçu</title><style>body{font-family:'Courier New',monospace;font-size:12px;padding:10px;margin:0;color:#000}h2,h3{margin:4px 0;text-align:center}.line{border-top:1px dashed #000;margin:6px 0}.row{display:flex;justify-content:space-between}.total{font-weight:bold;font-size:14px}.center{text-align:center}</style></head><body>`);
    printWin.document.write(receiptRef.current.innerHTML);
    printWin.document.write(`</body></html>`);
    printWin.document.close();
    printWin.focus();
    printWin.print();
  };

  const completeSale = () => {
    if (!cart.length) return showToast("Ajoutez des produits au panier", "error");
    const receiptItems = cart.map(item => ({
      name: item.name, emoji: item.emoji, qty: item.qty, unit_price: item.unit_price, total: item.unit_price * item.qty
    }));
    const receiptData = {
      id: `REC-${Date.now().toString(36).toUpperCase()}`,
      date: new Date().toLocaleString("fr-CD", { dateStyle: "medium", timeStyle: "short" }),
      client: selectedClient || "Client comptoir",
      items: receiptItems,
      subtotal: cartTotal,
      payment_method: payMethod,
      company: data.user.company,
      seller: data.user.name,
      phone: data.user.phone,
    };
    cart.forEach(item => {
      const newSale = { id: Date.now() + item.id, product_name: item.name, client_name: selectedClient || "Client comptoir", quantity: item.qty, unit_price: item.unit_price, total_amount: item.unit_price * item.qty, profit: (item.unit_price - item.cogs) * item.qty, payment_method: payMethod, sale_date: new Date().toISOString().split("T")[0], exchange_rate: exchangeRate, total_cdf: Math.round(item.unit_price * item.qty * exchangeRate) };
      setData(d => ({ ...d, sales: [newSale, ...d.sales], products: d.products.map(p => p.id === item.id ? { ...p, stock_quantity: p.stock_quantity - item.qty } : p) }));
    });
    setReceipt(receiptData);
    showToast(`✅ Vente enregistrée — ${fmt(cartTotal)}`, "success"); clearCart(); setShowInvoice(false);
  };

  return (
    <div className="page-bg page-content fade-in">
      <HeroBanner
        label="OBJECTIF VENTES QUOTIDIEN"
        value={fmt(data.sales.reduce((s,x)=>s+x.total_amount,0))}
        subtitle={`Objectif: ${fmt(salesGoal)}`}
        progress={(data.sales.reduce((s,x)=>s+x.total_amount,0) / salesGoal) * 100}
        progressLabel={`${fmt(data.sales.reduce((s,x)=>s+x.total_amount,0))} sur ${fmt(salesGoal)}`}
        trend={kpiGoals.sales_trend}
        trendUp={true}
        icon="🛒"
        onEditGoal={(v) => { updateGoal("sales_daily", v); showToast(`🎯 Objectif ventes mis à jour: ${fmt(v)}`, "success"); }}
        goalLabel="Objectif ventes quotidien ($)"
      />
      <div className="mini-kpi-grid">
        <MiniKpiCard icon="✨" label="Profit" value={fmt(data.sales.reduce((s,x)=>s+x.profit,0))} trend="+23%" trendUp={true} color="#16C55E" />
        <MiniKpiCard icon="🧾" label="Ventes" value={data.sales.length} trend="+12%" trendUp={true} color="#F5C518" />
        <MiniKpiCard icon="📱" label="Mobile Money" value={data.sales.filter(s=>s.payment_method==="mobile_money").length} color="#25D366" />
        <MiniKpiCard icon="💳" label="Crédit" value={fmt(data.sales.filter(s=>s.payment_method==="credit").reduce((s,x)=>s+x.total_amount,0))} color="#D42B3A" />
      </div>
      <HelpText icon="🛒">Ici vous enregistrez vos ventes. Le «Point de Vente» c'est comme votre caisse : vous choisissez les produits, le client paie, et tout est noté automatiquement. L'historique garde la trace de toutes vos ventes passées.</HelpText>
      <div className="sec-head"><h1 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:22, fontWeight:800 }}>◈ Ventes & POS</h1></div>
      <div className="tabs" style={{ marginBottom: 20 }}>
        {[["pos","🛒 Point de Vente"],["gambiste","📱 Gambiste"],["history","📋 Historique"],["invoices","🧾 Factures"]].map(([k,l]) => (
          <div key={k} className={`tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      {tab === "pos" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 330px", gap:16 }}>
          <div>
            <div className="search-wrap" style={{ marginBottom: 14 }}>
              <span className="search-icon">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..." />
            </div>
            <div className="g3">
              {filtered.map(p => (
                <div key={p.id} className="card card-pad-sm card-hover" style={{ cursor:"pointer", opacity: p.stock_quantity === 0 ? 0.45 : 1 }} onClick={() => p.stock_quantity > 0 && addToCart(p)}>
                  <div style={{ fontSize: 32, marginBottom: 8, textAlign:"center" }}>{p.emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#7B91C4", marginBottom: 8 }}>{p.type}</div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:"'Bricolage Grotesque'", fontWeight: 700, color: "#1A56FF" }}>{fmt(p.unit_price)}</span>
                    <span className="tag" style={{ background: p.stock_quantity < p.low_stock_alert ? "rgba(212,43,58,0.12)" : "rgba(22,197,94,0.12)", color: p.stock_quantity < p.low_stock_alert ? "#D42B3A" : "#16C55E", fontSize: 10 }}>{p.stock_quantity}u</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="card card-pad" style={{ height:"fit-content", position:"sticky", top:0 }}>
            <div className="sec-title" style={{ marginBottom: 14 }}>🛒 Panier ({cart.length})</div>
            {!cart.length ? (
              <div style={{ textAlign:"center", padding:"24px 0", color:"#7B91C4" }}><div style={{ fontSize:32, marginBottom:8 }}>🛒</div>Aucun article</div>
            ) : (
              <>
                {cart.map(item => (
                  <div key={item.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 0", borderBottom:"1px solid rgba(26,86,255,0.08)" }}>
                    <span style={{ fontSize:18 }}>{item.emoji}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{item.name}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2 }}>
                        <span style={{ fontSize:11, color:"#7B91C4" }}>$</span>
                        <input
                          type="number"
                          value={item.unit_price}
                          onChange={e => changePrice(item.id, e.target.value)}
                          style={{ width:58, padding:"2px 6px", fontSize:11, fontWeight:600, color:"#1A56FF", borderRadius:6, border:"1px solid rgba(26,86,255,0.15)", background:"rgba(26,86,255,0.05)", textAlign:"center" }}
                          step="0.01"
                          min="0"
                        />
                        <span style={{ fontSize:11, color:"#7B91C4" }}>× {item.qty}</span>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <button className="btn btn-ghost btn-icon" style={{ padding:"3px 7px", fontSize:14 }} onClick={() => changeQty(item.id,-1)}>−</button>
                      <span style={{ minWidth:18, textAlign:"center", fontWeight:600, fontSize:13 }}>{item.qty}</span>
                      <button className="btn btn-ghost btn-icon" style={{ padding:"3px 7px", fontSize:14 }} onClick={() => changeQty(item.id,1)}>+</button>
                    </div>
                  </div>
                ))}
                <div className="form-group" style={{ marginTop: 14 }}>
                  <label className="form-label">Client</label>
                  <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
                    <option value="">Client comptoir</option>
                    {data.clients.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Paiement</label>
                  <div style={{ display:"flex", gap:6 }}>
                    {[["cash","💵 Cash"],["mobile_money","📱 Mobile"],["credit","🏦 Crédit"],["bank","🏛️ Banque"]].map(([v,l]) => (
                      <div key={v} onClick={() => setPayMethod(v)} style={{ flex:1, padding:"7px 4px", borderRadius:8, textAlign:"center", fontSize:11, fontWeight:600, cursor:"pointer", background: payMethod===v ? "rgba(26,86,255,0.15)" : "transparent", border:`1px solid ${payMethod===v ? "#1A56FF" : "rgba(26,86,255,0.12)"}`, color: payMethod===v ? "#1A56FF" : "#7B91C4" }}>{l}</div>
                    ))}
                  </div>
                </div>
                <div style={{ borderTop:"2px solid rgba(26,86,255,0.15)", paddingTop:12, marginBottom:14 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#7B91C4", marginBottom:4 }}><span>Sous-total</span><span>{fmt(cartTotal)}</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"#16C55E", marginBottom:8 }}><span>Profit estimé</span><span>{fmt(cartProfit)}</span></div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'Bricolage Grotesque'", fontSize:18, fontWeight:800, color:"#1A56FF" }}><span>Total</span><span>{fmt(cartTotal)}</span></div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="btn btn-ghost" onClick={clearCart} style={{ flex:1, justifyContent:"center" }}>🗑️ Vider</button>
                  <button className="btn btn-primary" onClick={completeSale} style={{ flex:2, justifyContent:"center" }}>✅ Valider Vente</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {tab === "history" && (
        <>
          {/* Sales Analytics Row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
            {/* Sales by Product Bar Chart */}
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:14 }}>📊 Ventes par Produit</div>
              <MiniBarChartViz
                data={data.products.map(p => ({
                  value: data.sales.filter(s=>s.product_name===p.name).reduce((a,s)=>a+s.total_amount,0),
                  label: p.emoji,
                  highlight: data.sales.filter(s=>s.product_name===p.name).reduce((a,s)=>a+s.total_amount,0) === Math.max(...data.products.map(pr=>data.sales.filter(s=>s.product_name===pr.name).reduce((a,s)=>a+s.total_amount,0)))
                }))}
                height={80}
              />
              <div style={{ display:"flex", gap:6, marginTop:10, flexWrap:"wrap" }}>
                {data.products.map(p => {
                  const rev = data.sales.filter(s=>s.product_name===p.name).reduce((a,s)=>a+s.total_amount,0);
                  return <span key={p.id} style={{ fontSize:10, color:"#7B91C4" }}>{p.emoji} {fmt(rev)}</span>;
                })}
              </div>
            </div>
            {/* Profit Trend Sparkline */}
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:14 }}>📈 Tendance des Profits</div>
              <SparkLine data={data.sales.map(s=>s.profit)} width={260} height={70} color="#16C55E" />
              <div style={{ display:"flex", gap:14, marginTop:12 }}>
                <div><div style={{ fontSize:10, color:"#7B91C4" }}>Profit total</div><div style={{ fontSize:14, fontWeight:700, color:"#16C55E" }}>{fmt(data.sales.reduce((s,x)=>s+x.profit,0))}</div></div>
                <div><div style={{ fontSize:10, color:"#7B91C4" }}>Moy/vente</div><div style={{ fontSize:14, fontWeight:700, color:"#1A56FF" }}>{fmt(data.sales.reduce((s,x)=>s+x.profit,0)/data.sales.length)}</div></div>
                <div><div style={{ fontSize:10, color:"#7B91C4" }}>Meilleur</div><div style={{ fontSize:14, fontWeight:700, color:"#F5C518" }}>{fmt(Math.max(...data.sales.map(s=>s.profit)))}</div></div>
              </div>
            </div>
          </div>
          <div className="card card-pad">
            <table className="data-table">
              <thead><tr><th>Produit</th><th>Client</th><th>Qté</th><th>Montant</th><th>Profit</th><th>Paiement</th><th>Date</th></tr></thead>
              <tbody>
                {data.sales.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight:500 }}>{s.product_name}</td>
                    <td style={{ color:"#7B91C4" }}>{s.client_name}</td>
                    <td>{s.quantity}</td>
                    <td style={{ color:"#1A56FF", fontWeight:600 }}>{fmt(s.total_amount)}</td>
                    <td style={{ color:"#16C55E", fontWeight:600 }}>{fmt(s.profit)}</td>
                    <td>{payIcons[s.payment_method]}</td>
                    <td style={{ color:"#7B91C4", fontSize:12 }}>{s.sale_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ─ GAMBISTE MODULE ─ */}
      {tab === "gambiste" && (() => {
        const NETWORKS = [
          { id:"vodacom", name:"Vodacom", color:"#E60000", ussd:"*100#", amounts:[50,100,200,500,1000,2000,5000,10000],
            packs:[
              {name:"30 Mo",price:200,validity:"24h",code:"*330*1#"},
              {name:"100 Mo",price:500,validity:"24h",code:"*330*2#"},
              {name:"1.5 Go",price:1500,validity:"7 jours",code:"*330*3#"},
              {name:"7 Go",price:7000,validity:"30 jours",code:"*330*5#"},
              {name:"15 Go",price:14000,validity:"30 jours",code:"*330*6#"},
              {name:"30 Go",price:25000,validity:"30 jours",code:"*330*7#"},
              {name:"Nuit 2 Go",price:500,validity:"6h (00h-06h)",code:"*330*9#"},
            ]},
          { id:"airtel", name:"Airtel", color:"#FF0000", ussd:"*425#", amounts:[50,100,200,500,1000,2000,5000,10000],
            packs:[
              {name:"135 Mo",price:50,validity:"24h",code:"*425*1#"},
              {name:"1 Go",price:1000,validity:"24h",code:"*425*2#"},
              {name:"5 Go",price:4000,validity:"7 jours",code:"*425*3#"},
              {name:"8.5 Go",price:10000,validity:"30 jours",code:"*425*5#"},
              {name:"30 Go",price:20000,validity:"30 jours",code:"*425*7#"},
              {name:"Nuit Illimitée",price:250,validity:"6h (00h-06h)",code:"*425*9#"},
            ]},
          { id:"orange", name:"Orange", color:"#FF6600", ussd:"*144#", amounts:[50,100,200,500,1000,2000,5000,10000],
            packs:[
              {name:"2 Go",price:100,validity:"24h",code:"*144*1#"},
              {name:"4 Go",price:400,validity:"7 jours",code:"*144*3#"},
              {name:"10 Go",price:1000,validity:"30 jours",code:"*144*5#"},
              {name:"35 Go",price:2000,validity:"30 jours",code:"*144*7#"},
              {name:"Réseaux Sociaux 1 Go",price:200,validity:"24h",code:"*144*11#"},
            ]},
          { id:"africell", name:"Africell", color:"#6B21A8", ussd:"*1000#", amounts:[20,50,100,200,500,1000,2000,10000],
            packs:[
              {name:"35 Mo",price:10,validity:"72h",code:"*345*1#"},
              {name:"100 Mo",price:20,validity:"72h",code:"*345*2#"},
              {name:"300 Mo",price:50,validity:"72h",code:"*345*3#"},
              {name:"600 Mo",price:100,validity:"7 jours",code:"*345*4#"},
              {name:"1.2 Go",price:200,validity:"7 jours",code:"*345*5#"},
              {name:"5 Go",price:500,validity:"30 jours",code:"*345*6#"},
              {name:"25 Go",price:2000,validity:"30 jours",code:"*345*7#"},
            ]},
        ];
        const WALLETS = [
          { id:"mpesa", name:"M-Pesa", operator:"Vodacom", color:"#E60000", emoji:"📱", ussd:"*150#", connected:false },
          { id:"airtel_money", name:"Airtel Money", operator:"Airtel", color:"#FF0000", emoji:"📲", ussd:"*501#", connected:false },
          { id:"orange_money", name:"Orange Money", operator:"Orange", color:"#FF6600", emoji:"🟠", ussd:"*144#", connected:false },
          { id:"afrimoney", name:"Afri Money", operator:"Africell", color:"#6B21A8", emoji:"💜", ussd:"*789#", connected:false },
        ];
        return (
          <div>
            <HelpText icon="📱">Le module <strong>Gambiste</strong> c'est pour ceux qui vendent des unités (crédit téléphonique), des forfaits internet, ou qui font des transferts d'argent. Notez chaque transaction ici pour suivre vos commissions et votre bénéfice.</HelpText>

            {/* ── CONNECT MOBILE MONEY ACCOUNTS ── */}
            <div className="card card-pad" style={{ marginBottom:16, borderColor:"rgba(245,197,24,0.25)" }}>
              <div className="sec-title" style={{ marginBottom:6 }}>🔗 Connecter vos comptes Mobile Money</div>
              <div style={{ fontSize:11, color:"#7B91C4", marginBottom:14 }}>Liez votre numéro de téléphone pour envoyer directement des unités, data et transferts depuis l'app. Vos identifiants sont sécurisés.</div>
              <div className="g2">
                {WALLETS.map(w => (
                  <div key={w.id} className="card card-pad-sm" style={{ borderColor:`${w.color}30` }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <span style={{ fontSize:22 }}>{w.emoji}</span>
                        <div>
                          <div style={{ fontWeight:700, fontSize:13, color:w.color }}>{w.name}</div>
                          <div style={{ fontSize:10, color:"#7B91C4" }}>{w.operator} · Code: {w.ussd}</div>
                        </div>
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, color:w.connected?"#16C55E":"#7B91C4", background:w.connected?"rgba(22,197,94,0.12)":"rgba(107,114,128,0.12)", padding:"3px 8px", borderRadius:20 }}>{w.connected?"✅ Connecté":"⭕ Non lié"}</span>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <input placeholder={`+243 8XX XXX XXX (${w.operator})`} style={{ flex:1, fontSize:12 }} />
                      <button className="btn btn-primary" style={{ fontSize:11, padding:"6px 12px", whiteSpace:"nowrap" }}
                        onClick={() => showToast(`📲 Vérification envoyée par SMS sur votre ${w.name}. Entrez le code reçu pour confirmer.`, "info")}>
                        🔗 Lier
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── SERVICE OVERVIEW ── */}
            <div className="g2" style={{ marginBottom:20 }}>
              {[
                { emoji:"📞", name:"Vente d'Unités", desc:"Crédit téléphonique tous réseaux" },
                { emoji:"🌐", name:"Forfaits Internet", desc:"Data, nuit, réseaux sociaux" },
                { emoji:"💸", name:"Transfert d'Argent", desc:"M-Pesa, Airtel Money, Orange Money, Afri Money" },
                { emoji:"🏦", name:"Paiement Factures", desc:"SNEL, REGIDESO, Canal+, DSTV, école" },
              ].map(svc => (
                <div key={svc.name} className="card card-pad card-hover" style={{ cursor:"pointer" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:44, height:44, borderRadius:11, background:"rgba(26,86,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{svc.emoji}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>{svc.name}</div>
                      <div style={{ fontSize:11, color:"#7B91C4" }}>{svc.desc}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── VENTE D'UNITÉS ── */}
            <div className="card card-pad" style={{ marginBottom:16 }}>
              <div className="sec-title" style={{ marginBottom:6 }}>📞 Vente Rapide d'Unités</div>
              <div style={{ fontSize:11, color:"#7B91C4", marginBottom:14 }}>Choisissez le réseau et le montant en unités. Commission moyenne: 3-5% selon le réseau et le volume.</div>
              <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
                {NETWORKS.map(net => (
                  <div key={net.id} style={{ padding:"10px 16px", borderRadius:10, background:`${net.color}12`, border:`1px solid ${net.color}40`, cursor:"pointer", textAlign:"center", minWidth:80 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:net.color }}>{net.name}</div>
                    <div style={{ fontSize:9, color:"#7B91C4", marginTop:2 }}>{net.ussd}</div>
                  </div>
                ))}
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:14 }}>
                {[20,50,100,200,500,1000,2000,5000,10000].map(amt => (
                  <button key={amt} className="btn btn-ghost" style={{ fontSize:12, padding:"7px 12px" }}
                    onClick={() => showToast(`✅ Vente ${amt}u enregistrée! Commission: ~${Math.round(amt*0.04)}u`, "success")}>
                    {amt.toLocaleString()}u
                  </button>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Numéro du client</label>
                <input placeholder="+243 8XX XXX XXX" />
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }}
                  onClick={() => showToast("✅ Unités envoyées!", "success")}>📱 Envoyer</button>
                <button className="btn btn-wa" style={{ justifyContent:"center" }}
                  onClick={() => showToast("Reçu envoyé par WhatsApp!", "whatsapp")}>💬 Reçu WA</button>
              </div>
            </div>

            {/* ── FORFAITS DATA — REAL PLANS ── */}
            <div className="card card-pad" style={{ marginBottom:16 }}>
              <div className="sec-title" style={{ marginBottom:6 }}>🌐 Forfaits Internet — Tarifs Réels DRC</div>
              <div style={{ fontSize:11, color:"#7B91C4", marginBottom:14 }}>Prix en unités (u). 1 unité ≈ $0.01. Votre commission est la différence entre prix d'achat et prix de revente au client.</div>
              {NETWORKS.map(net => (
                <div key={net.id} style={{ marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:net.color }} />
                    <span style={{ fontSize:13, fontWeight:700, color:net.color }}>{net.name}</span>
                    <span style={{ fontSize:10, color:"#7B91C4" }}>— Code USSD: {net.ussd}</span>
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {net.packs.map(pk => (
                      <div key={pk.name+pk.price} className="card card-pad-sm card-hover" style={{ cursor:"pointer", flex:"1 1 140px", minWidth:130 }}
                        onClick={() => showToast(`✅ Forfait ${pk.name} (${net.name}) vendu! Prix: ${pk.price}u · Code: ${pk.code}`, "success")}>
                        <div style={{ fontWeight:700, fontSize:13, marginBottom:2 }}>{pk.name}</div>
                        <div style={{ fontSize:13, color:net.color, fontWeight:800 }}>{pk.price.toLocaleString()}u</div>
                        <div style={{ fontSize:10, color:"#7B91C4", marginTop:2 }}>{pk.validity}</div>
                        <div style={{ fontSize:9, color:"#16C55E", marginTop:3, fontFamily:"monospace" }}>{pk.code}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── TRANSFERT D'ARGENT ── */}
            <div className="card card-pad" style={{ marginBottom:16 }}>
              <div className="sec-title" style={{ marginBottom:6 }}>💸 Transfert d'Argent Mobile</div>
              <div style={{ fontSize:11, color:"#7B91C4", marginBottom:14 }}>Envoyez de l'argent pour vos clients. Frais de transfert M-Pesa: ~1% (min 25 FC). Airtel Money: ~0.5%. Orange Money: ~1%. Votre commission en plus.</div>
              <div className="g2" style={{ marginBottom:14 }}>
                {WALLETS.map(w => (
                  <div key={w.id} className="card card-pad-sm card-hover" style={{ cursor:"pointer", borderColor:`${w.color}30` }}
                    onClick={() => showToast(`${w.name} sélectionné — Composez ${w.ussd}`, "info")}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <span style={{ fontSize:22 }}>{w.emoji}</span>
                      <div>
                        <div style={{ fontWeight:700, fontSize:13, color:w.color }}>{w.name}</div>
                        <div style={{ fontSize:10, color:"#7B91C4" }}>USSD: {w.ussd} · {w.operator}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="g2">
                <div className="form-group"><label className="form-label">Numéro envoyeur</label><input placeholder="+243..." /></div>
                <div className="form-group"><label className="form-label">Numéro receveur</label><input placeholder="+243..." /></div>
              </div>
              <div className="g2">
                <div className="form-group"><label className="form-label">Montant (FC)</label><input type="number" placeholder="Ex: 50 000" /></div>
                <div className="form-group"><label className="form-label">Votre commission (FC)</label><input type="number" placeholder="Ex: 500" /></div>
              </div>
              <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }}
                onClick={() => showToast("✅ Transfert enregistré!", "success")}>💸 Enregistrer le Transfert</button>
            </div>

            {/* ── PAIEMENT FACTURES ── */}
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:6 }}>🏦 Paiement de Factures</div>
              <div style={{ fontSize:11, color:"#7B91C4", marginBottom:14 }}>Payez les factures de vos clients et gagnez une commission. Saisissez la référence client du service concerné.</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {[["⚡","SNEL","Électricité","#F5C518"],["💧","REGIDESO","Eau","#1A56FF"],["📺","Canal+","Télévision","#000"],["📡","DSTV","Satellite","#0066CC"],["🎓","Frais Scolaires","École","#16C55E"],["🏥","INSS","Assurance","#D42B3A"],["📶","Startimes","TV Numérique","#FF6600"],["🎮","Bet243","Paris Sportifs","#16C55E"]].map(([ico,name,desc,col]) => (
                  <div key={name} className="card card-pad-sm card-hover" style={{ cursor:"pointer", flex:"1 1 100px", minWidth:100, textAlign:"center" }}
                    onClick={() => showToast(`Paiement ${name} — entrez le numéro de référence`, "info")}>
                    <div style={{ fontSize:22, marginBottom:3 }}>{ico}</div>
                    <div style={{ fontWeight:700, fontSize:11, color:col }}>{name}</div>
                    <div style={{ fontSize:9, color:"#7B91C4" }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {tab === "invoices" && (
        <div className="card card-pad" style={{ textAlign:"center", padding:40 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🧾</div>
          <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:20, fontWeight:800, marginBottom:8 }}>Générateur de Factures</div>
          <div style={{ fontSize:13, color:"#7B91C4", marginBottom:20 }}>Créez des factures professionnelles PDF en un clic</div>
          <button className="btn btn-primary" onClick={() => showToast("Nouvelle facture créée!", "success")}>➕ Nouvelle Facture</button>
        </div>
      )}
      {/* ─ RECEIPT MODAL ─ */}
      {receipt && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)" }} onClick={() => setReceipt(null)}>
          <div style={{ background:"#fff", color:"#111", borderRadius:16, width:"min(360px, 92vw)", maxHeight:"85vh", overflow:"auto", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }} onClick={e => e.stopPropagation()}>
            <div ref={receiptRef} id="receipt-content" style={{ padding:"24px 20px" }}>
              {/* Header */}
              <div style={{ textAlign:"center", marginBottom:16 }}>
                <div style={{ fontSize:28, fontWeight:900, fontFamily:"'Bricolage Grotesque'", letterSpacing:"-0.5px" }}>{receipt.company}</div>
                <div style={{ fontSize:11, color:"#666", marginTop:4 }}>{receipt.phone}</div>
                <div style={{ fontSize:10, color:"#999", marginTop:2 }}>Vendeur: {receipt.seller}</div>
              </div>
              {/* Dashed line */}
              <div style={{ borderTop:"2px dashed #ccc", margin:"12px 0" }} />
              {/* Receipt info */}
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#555", marginBottom:8 }}>
                <span>N°: {receipt.id}</span>
                <span>{receipt.date}</span>
              </div>
              <div style={{ fontSize:12, marginBottom:12 }}>
                <strong>Client:</strong> {receipt.client}
              </div>
              {/* Items */}
              <div style={{ borderTop:"1px solid #ddd", borderBottom:"1px solid #ddd", padding:"8px 0" }}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, fontWeight:700, color:"#888", marginBottom:6, textTransform:"uppercase" }}>
                  <span style={{ flex:2 }}>Article</span>
                  <span style={{ flex:1, textAlign:"center" }}>Qté</span>
                  <span style={{ flex:1, textAlign:"right" }}>P.U.</span>
                  <span style={{ flex:1, textAlign:"right" }}>Total</span>
                </div>
                {receipt.items.map((item, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"4px 0", borderBottom: i < receipt.items.length - 1 ? "1px dotted #eee" : "none" }}>
                    <span style={{ flex:2, fontWeight:500 }}>{item.emoji} {item.name}</span>
                    <span style={{ flex:1, textAlign:"center", color:"#666" }}>×{item.qty}</span>
                    <span style={{ flex:1, textAlign:"right", color:"#666" }}>{fmt(item.unit_price)}</span>
                    <span style={{ flex:1, textAlign:"right", fontWeight:600 }}>{fmt(item.total)}</span>
                  </div>
                ))}
              </div>
              {/* Total */}
              <div style={{ borderTop:"2px dashed #ccc", margin:"12px 0" }} />
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:18, fontWeight:900, fontFamily:"'Bricolage Grotesque'" }}>
                <span>TOTAL</span>
                <span>{fmt(receipt.subtotal)}</span>
              </div>
              <div style={{ fontSize:11, color:"#666", marginTop:4 }}>
                Paiement: {payIcons[receipt.payment_method]} {receipt.payment_method === "cash" ? "Espèces" : receipt.payment_method === "mobile_money" ? "Mobile Money" : receipt.payment_method === "credit" ? "Crédit" : "Banque"}
              </div>
              {/* Footer */}
              <div style={{ borderTop:"2px dashed #ccc", margin:"14px 0 8px" }} />
              <div style={{ textAlign:"center", fontSize:10, color:"#999" }}>
                <div style={{ fontWeight:700, marginBottom:4 }}>Merci de votre fidélité! 🙏🇨🇩</div>
                <div>Conservez ce reçu comme preuve d'achat</div>
                <div style={{ marginTop:4, fontStyle:"italic" }}>BizPlatform DRC — Votre partenaire business</div>
                <div style={{ marginTop:2, fontSize:9 }}>{receipt.phone} · Kinshasa, RDC</div>
              </div>
            </div>
            {/* Actions */}
            <div style={{ display:"flex", gap:8, padding:"0 20px 20px", flexWrap:"wrap" }}>
              <button onClick={() => generatePDF("receipt-content", `Recu_${receipt?.id || 'bizmo'}.pdf`)} style={{ flex:1, padding:"10px", background:"#D42B3A", color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans'" }}>📥 PDF</button>
              <button onClick={printReceipt} style={{ flex:1, padding:"10px", background:"#1A56FF", color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans'" }}>🖨️ Imprimer</button>
              <button onClick={async () => {
                const client = data.clients.find(c => c.name === receipt.client_name);
                if (!client?.phone) return showToast("Numéro client manquant", "error");
                try {
                  await sendWhatsApp(client.phone, `🧾 *REÇU #${receipt.id}*\n━━━━━━━━━━━━━━━\n${receipt.items.map(i => `• ${i.name} x${i.qty} = ${fmt(i.total)}`).join("\n")}\n\n*TOTAL: ${fmt(receipt.total)}*\nMerci! 🙏 _${data.user.company}_ 🇨🇩`);
                  showToast("✅ Reçu envoyé par WhatsApp!", "whatsapp");
                } catch (e) { showToast(`❌ ${e.message}`, "error"); }
              }} style={{ flex:1, padding:"10px", background:"#25D366", color:"#fff", border:"none", borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"'DM Sans'" }}>💬 WhatsApp</button>
              <button onClick={() => setReceipt(null)} style={{ flex:"0 0 100%", padding:"8px", background:"transparent", border:"1px solid #ddd", borderRadius:10, fontWeight:600, fontSize:12, cursor:"pointer", color:"#666", fontFamily:"'DM Sans'" }}>✕ Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PRODUCTS PAGE ─────────────────────────────────────────────────────────────
function ProductsPage({ data, setData, showToast }) {
  const [tab, setTab] = useState("catalogue");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null); // full edit mode
  const [newProd, setNewProd] = useState({ name:"", type:"Alimentaire", unit_price:"", cogs:"", stock_quantity:"", low_stock_alert:10, has_expiry:false, emoji:"📦", image:null });

  const filtered = data.products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.type.toLowerCase().includes(search.toLowerCase()));

  const addProduct = () => {
    if (!newProd.name || !newProd.unit_price) return showToast("Remplissez nom et prix", "error");
    setData(d => ({ ...d, products: [...d.products, { ...newProd, id: Date.now(), currency:"USD", unit_price: Number(newProd.unit_price), cogs: Number(newProd.cogs), stock_quantity: Number(newProd.stock_quantity), track_batches:false }] }));
    showToast("Produit ajouté!", "success"); setShowAdd(false);
    setNewProd({ name:"", type:"Alimentaire", unit_price:"", cogs:"", stock_quantity:"", low_stock_alert:10, has_expiry:false, emoji:"📦" });
  };

  return (
    <div className="page-bg page-content fade-in">
      <HeroBanner
        label="VALEUR TOTALE DU STOCK"
        value={fmt(data.products.reduce((s,p)=>s+p.unit_price*p.stock_quantity,0))}
        subtitle={`${data.products.length} produits · ${[...new Set(data.products.map(p=>p.type))].length} catégories`}
        progress={((data.products.length - data.products.filter(p=>p.stock_quantity<=p.low_stock_alert).length) / data.products.length) * 100}
        progressLabel={`${data.products.filter(p=>p.stock_quantity>p.low_stock_alert).length}/${data.products.length} produits en stock normal`}
        progressColor={data.products.filter(p=>p.stock_quantity<=p.low_stock_alert).length > 2 ? "linear-gradient(90deg, #F5C518, #D42B3A)" : undefined}
        icon="📦"
      />
      <div className="mini-kpi-grid">
        <MiniKpiCard icon="⚠️" label="Stock Bas" value={data.products.filter(p=>p.stock_quantity<=p.low_stock_alert).length} trendUp={false} color="#D42B3A" />
        <MiniKpiCard icon="📈" label="Marge Moy." value={(data.products.reduce((s,p)=>s+((p.unit_price-p.cogs)/p.unit_price*100),0)/data.products.length).toFixed(0)+"%"} color="#F5C518" />
        <MiniKpiCard icon="📊" label="Unités" value={data.products.reduce((s,p)=>s+p.stock_quantity,0)} color="#25D366" />
      </div>
      <HelpText icon="📦">Vos produits et votre stock. Le «stock» c'est la quantité de marchandises que vous avez en réserve. Quand le stock est bas ⚠️, il faut recommander. La «marge» c'est le bénéfice que vous faites sur chaque produit (prix de vente − prix d'achat).</HelpText>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <h1 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:22, fontWeight:800 }}>◻ Produits & Stock</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>➕ Nouveau Produit</button>
      </div>

      <div className="tabs" style={{ marginBottom:20 }}>
        {[["catalogue","📦 Catalogue"],["stock","📊 Stock"],["analytics","📈 Analytics"]].map(([k,l]) => (
          <div key={k} className={`tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      {tab === "catalogue" && (
        <>
          <div className="search-wrap" style={{ marginBottom:16, maxWidth:400 }}>
            <span className="search-icon">🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher produit..." />
          </div>
          <div className="g4">
            {filtered.map(p => {
              const margin = ((p.unit_price - p.cogs) / p.unit_price * 100).toFixed(0);
              const low = p.stock_quantity <= p.low_stock_alert;
              return (
                <div key={p.id} className="card card-pad card-hover" style={{ cursor:"pointer", borderColor: low ? "rgba(245,197,24,0.3)" : undefined }} onClick={() => setSelected(p)}>
                  <div style={{ height:80, marginBottom:12, textAlign:"center", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", borderRadius:8, background:"rgba(26,86,255,0.03)" }}>
                    {p.image ? <img src={p.image} alt={p.name} style={{ maxHeight:"100%", maxWidth:"100%", objectFit:"contain", borderRadius:8 }} /> : <span style={{ fontSize:40 }}>{p.emoji}</span>}
                  </div>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:2 }}>{p.name}</div>
                  <div style={{ fontSize:11, color:"#7B91C4", marginBottom:12 }}>{p.type}</div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:18, color:"#1A56FF" }}>{fmt(p.unit_price)}</span>
                    <span style={{ fontSize:11, color:"#16C55E", fontWeight:600 }}>{margin}% marge</span>
                  </div>
                  <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                    <div className="progress" style={{ flex:1 }}>
                      <div className="progress-fill" style={{ width: `${Math.min((p.stock_quantity/200)*100,100)}%`, background: low ? "#D42B3A" : "#1A56FF" }} />
                    </div>
                    <span className="tag" style={{ background: low ? "rgba(212,43,58,0.12)" : "rgba(22,197,94,0.12)", color: low ? "#D42B3A" : "#16C55E", fontSize:10 }}>{p.stock_quantity}u</span>
                  </div>
                  {low && <div style={{ fontSize:10, color:"#F5C518", marginTop:6 }}>⚠️ Stock bas!</div>}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "stock" && (
        <div className="card card-pad">
          <table className="data-table">
            <thead><tr><th>Produit</th><th>Type</th><th>Stock</th><th>Alerte</th><th>Prix Vente</th><th>Coût</th><th>Marge</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {data.products.map(p => {
                const low = p.stock_quantity <= p.low_stock_alert;
                const marg = ((p.unit_price-p.cogs)/p.unit_price*100).toFixed(0);
                return (
                  <tr key={p.id}>
                    <td><div style={{ display:"flex", alignItems:"center", gap:8 }}>{p.image ? <img src={p.image} alt="" style={{ width:28, height:28, borderRadius:6, objectFit:"cover" }} /> : <span>{p.emoji}</span>}<span style={{ fontWeight:600 }}>{p.name}</span></div></td>
                    <td style={{ color:"#7B91C4" }}>{p.type}</td>
                    <td style={{ fontWeight:700, color: low ? "#D42B3A" : "#16C55E" }}>{p.stock_quantity}</td>
                    <td style={{ color:"#7B91C4" }}>{p.low_stock_alert}</td>
                    <td style={{ color:"#1A56FF", fontWeight:600 }}>{fmt(p.unit_price)}</td>
                    <td style={{ color:"#7B91C4" }}>{fmt(p.cogs)}</td>
                    <td style={{ color:"#16C55E", fontWeight:600 }}>{marg}%</td>
                    <td><span className="tag" style={{ background: low ? "rgba(245,197,24,0.12)" : "rgba(22,197,94,0.12)", color: low ? "#F5C518" : "#16C55E" }}>{low ? "⚠️ Bas" : "✅ OK"}</span></td>
                    <td><button className="btn btn-ghost" style={{ fontSize:11, padding:"4px 10px" }} onClick={() => setEditing({...p})}>✏️</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "analytics" && (
        <>
          {/* Overview Charts */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:16 }}>
            {/* Stock Distribution Donut */}
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:14 }}>📦 Distribution Stock</div>
              {(() => {
                const totalStock = data.products.reduce((s,p) => s+p.stock_quantity, 0) || 1;
                const colors = ["#1A56FF","#D42B3A","#F5C518","#16C55E","#25D366","#7B91C4"];
                return (
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <DonutChart
                      segments={data.products.map((p,i) => ({ value:(p.stock_quantity/totalStock)*100, color:colors[i%colors.length] }))}
                      size={100} strokeWidth={14} centerValue={totalStock+""} centerLabel="unités"
                    />
                    <div style={{ flex:1 }}>
                      {data.products.map((p,i) => (
                        <div key={p.id} style={{ display:"flex", alignItems:"center", gap:6, padding:"3px 0", fontSize:11 }}>
                          <div style={{ width:8, height:8, borderRadius:2, background:colors[i%colors.length] }} />
                          <span style={{ flex:1, color:"#7B91C4" }}>{p.emoji} {p.name.split(" ")[0]}</span>
                          <span style={{ fontWeight:700 }}>{p.stock_quantity}u</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Margin Comparison */}
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:14 }}>📈 Comparaison Marges</div>
              <MiniBarChartViz
                data={data.products.map(p => ({
                  value: ((p.unit_price-p.cogs)/p.unit_price)*100,
                  label: p.emoji,
                  highlight: ((p.unit_price-p.cogs)/p.unit_price)*100 === Math.max(...data.products.map(pr=>((pr.unit_price-pr.cogs)/pr.unit_price)*100))
                }))}
                height={70}
                barColor="#16C55E"
              />
              <div style={{ fontSize:11, color:"#7B91C4", marginTop:8 }}>
                Marge moyenne: <strong style={{ color:"#16C55E" }}>{(data.products.reduce((s,p)=>s+((p.unit_price-p.cogs)/p.unit_price*100),0)/data.products.length).toFixed(0)}%</strong>
              </div>
            </div>

            {/* Revenue per Product */}
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:14 }}>💰 Revenus par Produit</div>
              {(() => {
                const prodRevs = data.products.map(p => ({
                  name: p.name, emoji: p.emoji,
                  rev: data.sales.filter(s=>s.product_name===p.name).reduce((a,s)=>a+s.total_amount,0)
                })).sort((a,b) => b.rev - a.rev);
                const maxR = prodRevs[0]?.rev || 1;
                return prodRevs.map(p => (
                  <div key={p.name} style={{ marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:3 }}>
                      <span>{p.emoji} {p.name.split(" ")[0]}</span>
                      <span style={{ fontWeight:700, color:"#1A56FF" }}>{fmt(p.rev)}</span>
                    </div>
                    <div className="progress" style={{ height:6 }}>
                      <div className="progress-fill" style={{ width:`${(p.rev/maxR)*100}%`, background:"#1A56FF" }} />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Per-product detail cards */}
          <div className="g2">
            {data.products.map(p => {
              const sold = data.sales.filter(s => s.product_name === p.name).reduce((a,s) => a + s.quantity, 0);
              const rev  = data.sales.filter(s => s.product_name === p.name).reduce((a,s) => a + s.total_amount, 0);
              const margin = ((p.unit_price-p.cogs)/p.unit_price*100);
              return (
                <div key={p.id} className="card card-pad">
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                    <span style={{ fontSize:28 }}>{p.emoji}</span>
                    <div style={{ flex:1 }}><div style={{ fontWeight:700 }}>{p.name}</div><div style={{ fontSize:12, color:"#7B91C4" }}>{p.type}</div></div>
                    <DonutChart segments={[{ value: margin, color: margin>50?"#16C55E":margin>30?"#1A56FF":"#D42B3A" }]} size={48} strokeWidth={6} centerValue={margin.toFixed(0)+"%"} />
                  </div>
                  <div className="g2">
                    {[["Vendus",sold+"u","#1A56FF"],["Revenus",fmt(rev),"#16C55E"],["Stock",p.stock_quantity+"u",p.stock_quantity<=p.low_stock_alert?"#D42B3A":"#F5C518"],["Marge",margin.toFixed(0)+"%","#1A56FF"]].map(([k,v,c]) => (
                      <div key={k} style={{ padding:"10px", background:`${c}0A`, borderRadius:9, border:`1px solid ${c}22` }}>
                        <div style={{ fontSize:11, color:"#7B91C4", marginBottom:3 }}>{k}</div>
                        <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, color:c, fontSize:16 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Product detail modal */}
      {selected && !editing && (
        <Modal title={`${selected.emoji} ${selected.name}`} onClose={() => setSelected(null)} maxWidth={620}>
          {/* Image editor */}
          <ProductImageEditor
            product={selected}
            showToast={showToast}
            onImageUpdate={(img) => {
              setData(d => ({ ...d, products: d.products.map(p => p.id===selected.id ? {...p, image:img} : p) }));
              setSelected(s => ({...s, image:img}));
            }}
          />
          <div className="g2" style={{ marginBottom:14 }}>
            {[["Prix Vente",fmt(selected.unit_price),"#1A56FF"],["Coût",fmt(selected.cogs),"#D42B3A"],["Marge",((selected.unit_price-selected.cogs)/selected.unit_price*100).toFixed(0)+"%","#16C55E"],["Stock",selected.stock_quantity+"u",selected.stock_quantity<=selected.low_stock_alert?"#D42B3A":"#16C55E"]].map(([k,v,c]) => (
              <div key={k} style={{ padding:14, background:`${c}0A`, borderRadius:10, border:`1px solid ${c}22` }}>
                <div style={{ fontSize:11, color:"#7B91C4", marginBottom:4 }}>{k}</div>
                <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:20, color:c }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="form-group"><label className="form-label">Ajuster Stock</label>
            <div style={{ display:"flex", gap:8 }}>
              <input type="number" defaultValue={selected.stock_quantity} style={{ flex:1 }} onChange={e => setData(d => ({ ...d, products: d.products.map(p => p.id===selected.id ? {...p, stock_quantity:Number(e.target.value)} : p) }))} />
              <button className="btn btn-primary" onClick={() => { showToast("Stock mis à jour!", "success"); setSelected(null); }}>Sauvegarder</button>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:10 }}>
            <button className="btn btn-ghost" style={{ flex:1, justifyContent:"center" }} onClick={() => { setEditing({...selected}); }}>✏️ Modifier tout</button>
            <button className="btn btn-red" style={{ justifyContent:"center" }} onClick={() => {
              setData(d => ({ ...d, products: d.products.filter(p => p.id!==selected.id) }));
              showToast("Produit supprimé!", "info"); setSelected(null);
            }}>🗑️ Supprimer</button>
          </div>
        </Modal>
      )}

      {/* Full product edit modal */}
      {editing && (
        <Modal title={`✏️ Modifier: ${editing.name}`} onClose={() => setEditing(null)} maxWidth={620}>
          <ProductImageEditor
            product={editing}
            showToast={showToast}
            onImageUpdate={(img) => {
              setEditing(e => ({...e, image:img}));
              setData(d => ({ ...d, products: d.products.map(p => p.id===editing.id ? {...p, image:img} : p) }));
            }}
          />
          {[["Nom","name","text"],["Prix de vente ($)","unit_price","number"],["Coût d'achat ($)","cogs","number"],["Stock","stock_quantity","number"],["Alerte stock bas","low_stock_alert","number"],["Emoji","emoji","text"]].map(([l,k,t]) => (
            <div className="form-group" key={k}><label className="form-label">{l}</label><input type={t} value={editing[k]} onChange={e => setEditing(p => ({...p,[k]:t==="number"?Number(e.target.value):e.target.value}))} /></div>
          ))}
          <div className="form-group"><label className="form-label">Catégorie</label>
            <select value={editing.type} onChange={e => setEditing(p => ({...p,type:e.target.value}))}>
              {["Alimentaire","Boisson","Hygiène","Électronique","Textile","Autre"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <label className="form-label" style={{ margin:0 }}>Date d'expiration ?</label>
            <label className="toggle"><input type="checkbox" checked={editing.has_expiry} onChange={() => setEditing(p => ({...p, has_expiry:!p.has_expiry}))} /><span className="toggle-track" /></label>
          </div>
          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={() => {
            setData(d => ({ ...d, products: d.products.map(p => p.id===editing.id ? {...editing} : p) }));
            showToast("✅ Produit mis à jour!", "success"); setEditing(null); setSelected(null);
          }}>💾 Sauvegarder les modifications</button>
        </Modal>
      )}

      {showAdd && (
        <Modal title="➕ Nouveau Produit" onClose={() => setShowAdd(false)}>
          {[["Nom","name","text"],["Prix de vente","unit_price","number"],["Coût d'achat","cogs","number"],["Stock initial","stock_quantity","number"],["Alerte stock bas","low_stock_alert","number"],["Emoji","emoji","text"]].map(([l,k,t]) => (
            <div className="form-group" key={k}><label className="form-label">{l}</label><input type={t} value={newProd[k]} onChange={e => setNewProd(p => ({...p,[k]:e.target.value}))} placeholder={l} /></div>
          ))}
          <div className="form-group"><label className="form-label">Catégorie</label>
            <select value={newProd.type} onChange={e => setNewProd(p => ({...p,type:e.target.value}))}>
              {["Alimentaire","Boisson","Hygiène","Électronique","Textile","Autre"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={addProduct}>➕ Ajouter Produit</button>
        </Modal>
      )}
    </div>
  );
}

// ─── CLIENTS PAGE ──────────────────────────────────────────────────────────────
function ClientsPage({ data, setData, showToast, kpiGoals, updateGoal }) {
  const [tab, setTab] = useState("list");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [newClient, setNewClient] = useState({ name:"", email:"", phone:"", address:"", status:"active", credit_limit:200, credit_balance:0, total_revenue:0 });

  const filtered = data.clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
  const statusColors = { vip:"#F5C518", active:"#16C55E", lead:"#1A56FF", inactive:"#7B91C4" };
  const clientRevenueTotal = data.clients.reduce((s,c)=>s+c.total_revenue,0);

  return (
    <div className="page-bg page-content fade-in">
      <HeroBanner
        label="REVENUS CLIENTS"
        value={fmt(clientRevenueTotal)}
        subtitle={`${data.clients.length} clients · ${data.clients.filter(c=>c.status==="vip").length} VIP`}
        progress={(data.clients.filter(c=>c.status!=="inactive").length / data.clients.length) * 100}
        progressLabel={`${data.clients.filter(c=>c.status!=="inactive").length} clients actifs`}
        trend="+15%"
        trendUp={true}
        icon="👥"
        onEditGoal={(v) => { showToast(`🎯 Objectif clients: ${v} clients actifs`, "success"); }}
        goalLabel="Objectif clients actifs"
      />
      <div className="mini-kpi-grid">
        <MiniKpiCard icon="👑" label="VIP" value={data.clients.filter(c=>c.status==="vip").length} color="#F5C518" />
        <MiniKpiCard icon="🟢" label="Actifs" value={data.clients.filter(c=>c.status==="active").length} color="#16C55E" />
        <MiniKpiCard icon="💳" label="Crédit Dû" value={fmt(data.clients.reduce((s,c)=>s+c.credit_balance,0))} trendUp={false} color="#D42B3A" />
        <MiniKpiCard icon="🎯" label="Leads" value={data.clients.filter(c=>c.status==="lead").length} color="#1A56FF" />
      </div>
      <HelpText icon="👥">Vos clients — les gens et entreprises qui achètent chez vous. Les clients «VIP» 👑 sont ceux qui achètent beaucoup et méritent un traitement spécial (remises, priorité). Les clients «Actifs» 🟢 achètent régulièrement. Les «Leads» 🎯 sont des prospects pas encore convertis. Le «crédit» c'est l'argent qu'un client vous doit encore — surveillez-le de près pour éviter les impayés! Le «CRM» (Customer Relationship Management) est un outil pour organiser et suivre vos relations avec chaque client. Plus vous connaissez vos clients, mieux vous vendez.</HelpText>
      <HelpText icon="📊">Conseil: Contactez vos clients VIP au moins 1 fois par semaine. Envoyez des rappels de paiement aux clients ayant un crédit dû. Convertissez les Leads en clients actifs en leur proposant une première commande avec remise.</HelpText>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <h1 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:22, fontWeight:800 }}>◎ Clients</h1>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>➕ Nouveau Client</button>
      </div>

      <div className="tabs" style={{ marginBottom:16 }}>
        {[["list","👥 Liste"],["crm","📊 CRM"],["credits","💳 Crédits"]].map(([k,l]) => (
          <div key={k} className={`tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      {tab !== "crm" && (
        <div className="search-wrap" style={{ marginBottom:16, maxWidth:400 }}>
          <span className="search-icon">🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher par nom ou téléphone..." />
        </div>
      )}

      {tab === "list" && (
        <div className="g2">
          {filtered.map(c => (
            <div key={c.id} className="card card-pad card-hover" style={{ cursor:"pointer" }} onClick={() => setSelected(c)}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                <Avatar name={c.name} size={44} color={statusColors[c.status] || "#1A56FF"} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</div>
                  <div style={{ fontSize:12, color:"#7B91C4" }}>{c.phone}</div>
                </div>
                <Tag status={c.status} />
              </div>
              <div style={{ fontSize:11, color:"#7B91C4", marginBottom:10 }}>📍 {c.address}</div>
              <div style={{ display:"flex", gap:12 }}>
                <div><div style={{ fontSize:10, color:"#7B91C4" }}>Revenus</div><div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, color:"#1A56FF" }}>{fmt(c.total_revenue)}</div></div>
                <div><div style={{ fontSize:10, color:"#7B91C4" }}>Crédit dû</div><div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, color: c.credit_balance > 0 ? "#D42B3A" : "#16C55E" }}>{fmt(c.credit_balance)}</div></div>
                <div><div style={{ fontSize:10, color:"#7B91C4" }}>Limite</div><div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, color:"#7B91C4" }}>{fmt(c.credit_limit)}</div></div>
              </div>
              <div style={{ display:"flex", gap:8, marginTop:12 }}>
                <button className="btn btn-ghost" style={{ flex:1, justifyContent:"center", fontSize:11 }} onClick={e => { e.stopPropagation(); showToast(`Appel: ${c.phone}`, "info"); }}>📞 Appeler</button>
                <button className="btn btn-wa" style={{ flex:1, justifyContent:"center", fontSize:11 }} onClick={async e => { e.stopPropagation(); try { await sendWhatsApp(c.phone, `Bonjour ${c.name}! Comment puis-je vous aider? — ${data.user.company} 🇨🇩`); showToast(`✅ WhatsApp envoyé à ${c.name}`, "whatsapp"); } catch(err) { showToast(`❌ ${err.message}`, "error"); } }}>💬 WA</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "crm" && (
        <>
          {/* Client Analytics Row */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:16 }}>
            {/* Client Status Donut */}
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:14 }}>👥 Pipeline Clients</div>
              {(() => {
                const statuses = ["lead","active","vip","inactive"];
                const colors = ["#1A56FF","#16C55E","#F5C518","#7B91C4"];
                const labels = ["Leads","Actifs","VIP","Inactifs"];
                const counts = statuses.map(s => data.clients.filter(c=>c.status===s).length);
                const total = counts.reduce((a,b)=>a+b,0) || 1;
                return (
                  <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                    <DonutChart segments={counts.map((c,i)=>({ value:(c/total)*100, color:colors[i] }))} size={90} strokeWidth={12} centerValue={total+""} centerLabel="clients" />
                    <div style={{ flex:1 }}>
                      {labels.map((l,i) => (
                        <div key={l} style={{ display:"flex", alignItems:"center", gap:6, padding:"3px 0", fontSize:11 }}>
                          <div style={{ width:8, height:8, borderRadius:2, background:colors[i] }} />
                          <span style={{ flex:1, color:"#7B91C4" }}>{l}</span>
                          <span style={{ fontWeight:700, color:colors[i] }}>{counts[i]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Revenue Distribution */}
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:14 }}>💰 Revenus par Client</div>
              {(() => {
                const sorted = [...data.clients].sort((a,b) => b.total_revenue - a.total_revenue);
                const maxR = sorted[0]?.total_revenue || 1;
                return sorted.slice(0,5).map(c => (
                  <div key={c.id} style={{ marginBottom:8 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:3 }}>
                      <span style={{ display:"flex", alignItems:"center", gap:4 }}><Avatar name={c.name} size={16} color={c.status==="vip"?"#F5C518":"#1A56FF"} /> {c.name.split(" ")[0]}</span>
                      <span style={{ fontWeight:700, color:"#1A56FF" }}>{fmt(c.total_revenue)}</span>
                    </div>
                    <div className="progress" style={{ height:5 }}>
                      <div className="progress-fill" style={{ width:`${(c.total_revenue/maxR)*100}%`, background: c.status==="vip"?"#F5C518":"#1A56FF" }} />
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Credit Risk */}
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:14 }}>⚠️ Risque Crédit</div>
              {(() => {
                const totalCredit = data.clients.reduce((s,c) => s+c.credit_balance, 0);
                const totalLimit = data.clients.reduce((s,c) => s+c.credit_limit, 0) || 1;
                const usage = (totalCredit/totalLimit)*100;
                return (
                  <>
                    <DonutChart segments={[{ value: usage, color: usage>70?"#D42B3A":usage>40?"#F5C518":"#16C55E" }]} size={80} strokeWidth={10} centerValue={usage.toFixed(0)+"%"} centerLabel="utilisé" />
                    <div style={{ marginTop:10, fontSize:12, color:"#7B91C4" }}>
                      <div>Crédit total dû: <strong style={{ color:"#D42B3A" }}>{fmt(totalCredit)}</strong></div>
                      <div>Limite totale: <strong>{fmt(totalLimit)}</strong></div>
                    </div>
                    <InsightCard icon={usage>60?"🔴":"🟢"} iconBg={usage>60?"rgba(212,43,58,0.12)":"rgba(22,197,94,0.12)"} title={usage>60?"Risque crédit élevé":"Crédit sous contrôle"} description={usage>60?"Envisagez de réduire les limites ou d'envoyer des rappels.":"Bonne gestion du crédit client!"} />
                  </>
                );
              })()}
            </div>
          </div>

          {/* CRM Pipeline */}
          <div className="g2">
            {["lead","active","vip","inactive"].map(status => {
              const clients = data.clients.filter(c => c.status === status);
              const m = statusMeta[status];
              return (
                <div key={status} className="card card-pad">
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:m.color }} />
                    <span style={{ fontWeight:700, fontSize:14, color:m.color }}>{m.label}s</span>
                    <span style={{ marginLeft:"auto", fontSize:13, fontWeight:700 }}>{clients.length}</span>
                  </div>
                  {clients.map(c => (
                    <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(26,86,255,0.08)" }}>
                      <Avatar name={c.name} size={30} color={m.color} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:600 }}>{c.name}</div>
                        <div style={{ fontSize:11, color:"#7B91C4" }}>{fmt(c.total_revenue)}</div>
                      </div>
                      <SparkLine data={[c.total_revenue*0.6,c.total_revenue*0.7,c.total_revenue*0.8,c.total_revenue*0.85,c.total_revenue*0.95,c.total_revenue]} width={50} height={20} color={m.color} fill={false} />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "credits" && (
        <div className="card card-pad">
          <table className="data-table">
            <thead><tr><th>Client</th><th>Crédit Dû</th><th>Limite</th><th>Utilisation</th><th>Statut</th><th>Actions</th></tr></thead>
            <tbody>
              {data.clients.filter(c => c.credit_limit > 0).map(c => {
                const usage = (c.credit_balance / c.credit_limit * 100);
                return (
                  <tr key={c.id}>
                    <td><div style={{ display:"flex", alignItems:"center", gap:8 }}><Avatar name={c.name} size={28} /><span style={{ fontWeight:600 }}>{c.name}</span></div></td>
                    <td style={{ color: c.credit_balance>0?"#D42B3A":"#16C55E", fontWeight:700 }}>{fmt(c.credit_balance)}</td>
                    <td style={{ color:"#7B91C4" }}>{fmt(c.credit_limit)}</td>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div className="progress" style={{ flex:1 }}>
                          <div className="progress-fill" style={{ width:`${Math.min(usage,100)}%`, background: usage>80?"#D42B3A":usage>50?"#F5C518":"#1A56FF" }} />
                        </div>
                        <span style={{ fontSize:11, fontWeight:600, color:"#7B91C4", minWidth:30 }}>{usage.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td><Tag status={c.status} /></td>
                    <td>
                      {c.credit_balance > 0 && <button className="btn btn-wa" style={{ fontSize:11, padding:"5px 10px", borderRadius:8 }} onClick={async () => { try { await sendWhatsApp(c.phone, `⚠️ *RAPPEL DE PAIEMENT*\n━━━━━━━━━━━━━━━\nBonjour *${c.name}*,\n\nSolde impayé: *${fmt(c.credit_balance)}*\n\nMerci de régulariser.\n_${data.user.company}_ 🇨🇩`); showToast(`✅ Rappel envoyé à ${c.name}`, "whatsapp"); } catch(err) { showToast(`❌ ${err.message}`, "error"); } }}>💬 Rappel</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selected && !editingClient && (
        <Modal title={`${selected.name}`} onClose={() => setSelected(null)}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20 }}>
            <Avatar name={selected.name} size={52} color={statusColors[selected.status]||"#1A56FF"} />
            <div><div style={{ fontWeight:700, fontSize:16 }}>{selected.name}</div><div style={{ fontSize:12, color:"#7B91C4" }}>{selected.email}</div><div style={{ fontSize:12, color:"#7B91C4" }}>{selected.phone}</div></div>
            <Tag status={selected.status} />
          </div>
          <div className="g2" style={{ marginBottom:14 }}>
            {[["💰 Revenus",fmt(selected.total_revenue),"#1A56FF"],["💳 Crédit dû",fmt(selected.credit_balance),"#D42B3A"],["📊 Limite",fmt(selected.credit_limit),"#7B91C4"],["📍 Zone",selected.address,"#F5C518"]].map(([k,v,c]) => (
              <div key={k} style={{ padding:12, background:`${c}0A`, borderRadius:9, border:`1px solid ${c}22` }}>
                <div style={{ fontSize:11, color:"#7B91C4", marginBottom:3 }}>{k}</div>
                <div style={{ fontWeight:700, color:c, fontSize:14 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={() => showToast("Message envoyé!", "info")}>📧 Email</button>
            <button className="btn btn-wa" style={{ flex:1, justifyContent:"center" }} onClick={async () => { try { await sendWhatsApp(selected.phone, `Bonjour ${selected.name}! — ${data.user.company} 🇨🇩`); showToast(`✅ WhatsApp à ${selected.name}!`, "whatsapp"); } catch(err) { showToast(`❌ ${err.message}`, "error"); } }}>💬 WhatsApp</button>
            <button className="btn btn-red" onClick={async () => { try { await sendWhatsApp(selected.phone, `⚠️ *RAPPEL DE PAIEMENT*\nBonjour *${selected.name}*,\nSolde: *${fmt(selected.credit_balance)}*\nMerci de régulariser.\n_${data.user.company}_ 🇨🇩`); showToast("✅ Rappel de paiement envoyé!", "whatsapp"); } catch(err) { showToast(`❌ ${err.message}`, "error"); } }}>⚠️ Rappel</button>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <button className="btn btn-ghost" style={{ flex:1, justifyContent:"center" }} onClick={() => setEditingClient({...selected})}>✏️ Modifier</button>
            <button className="btn btn-red" style={{ justifyContent:"center" }} onClick={() => {
              setData(d => ({ ...d, clients: d.clients.filter(c => c.id!==selected.id) }));
              showToast("Client supprimé!", "info"); setSelected(null);
            }}>🗑️ Supprimer</button>
          </div>
        </Modal>
      )}

      {/* Edit client modal */}
      {editingClient && (
        <Modal title={`✏️ Modifier: ${editingClient.name}`} onClose={() => setEditingClient(null)}>
          {[["Nom complet","name"],["Email","email"],["Téléphone","phone"],["Adresse","address"]].map(([l,k]) => (
            <div className="form-group" key={k}><label className="form-label">{l}</label><input value={editingClient[k]} onChange={e => setEditingClient(p => ({...p,[k]:e.target.value}))} /></div>
          ))}
          <div className="form-group"><label className="form-label">Statut</label>
            <select value={editingClient.status} onChange={e => setEditingClient(p => ({...p,status:e.target.value}))}>
              {["lead","active","vip","inactive"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Limite Crédit ($)</label><input type="number" value={editingClient.credit_limit} onChange={e => setEditingClient(p => ({...p,credit_limit:Number(e.target.value)}))} /></div>
            <div className="form-group"><label className="form-label">Solde Crédit ($)</label><input type="number" value={editingClient.credit_balance} onChange={e => setEditingClient(p => ({...p,credit_balance:Number(e.target.value)}))} /></div>
          </div>
          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={() => {
            setData(d => ({ ...d, clients: d.clients.map(c => c.id===editingClient.id ? {...editingClient} : c) }));
            showToast("✅ Client mis à jour!", "success"); setEditingClient(null); setSelected(null);
          }}>💾 Sauvegarder les modifications</button>
        </Modal>
      )}

      {showAdd && (
        <Modal title="➕ Nouveau Client" onClose={() => setShowAdd(false)}>
          {[["Nom complet","name"],["Email","email"],["Téléphone","phone"],["Adresse","address"]].map(([l,k]) => (
            <div className="form-group" key={k}><label className="form-label">{l}</label><input value={newClient[k]} onChange={e => setNewClient(p => ({...p,[k]:e.target.value}))} placeholder={l} /></div>
          ))}
          <div className="form-group"><label className="form-label">Statut</label>
            <select value={newClient.status} onChange={e => setNewClient(p => ({...p,status:e.target.value}))}>
              {["lead","active","vip","inactive"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Limite Crédit ($)</label><input type="number" value={newClient.credit_limit} onChange={e => setNewClient(p => ({...p,credit_limit:Number(e.target.value)}))} /></div>
          </div>
          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={() => { setData(d => ({ ...d, clients: [...d.clients, { ...newClient, id:Date.now() }] })); showToast("Client ajouté!", "success"); setShowAdd(false); }}>➕ Ajouter Client</button>
        </Modal>
      )}
    </div>
  );
}

// ─── MARKETING PAGE ─────────────────────────────────────────────────────────────
function MarketingPage({ data, setData, showToast, kpiGoals, updateGoal }) {
  const [tab, setTab] = useState("content");
  const [calView, setCalView] = useState("calendar");
  const [month, setMonth] = useState({ m:3, y:2025 });
  const [aiPosts, setAiPosts] = useState(AI_PROPOSALS);
  const [hovPost, setHovPost] = useState(null);
  const [weekOff, setWeekOff] = useState(0);
  const [composer, setComposer] = useState({ title:"", content:"", platform:"instagram", scheduled_date:"" });
  const [editPost, setEditPost] = useState(null);
  const tooltipRef = useRef(null);

  // ── META CONNECTION STATE ──
  const [metaConnections, setMetaConnections] = useState({
    instagram: { connected: false, loading: false },
    facebook: { connected: false, loading: false },
    whatsapp: { connected: false, loading: false },
  });
  const [metaSubTab, setMetaSubTab] = useState("overview");
  const [metaDemo, setMetaDemo] = useState(null);

  const MOCK_META_DATA = {
    instagram: {
      profile: { username: "@mukendi_enterprises", followers: 2847, following: 312, posts: 89, bio: "🏢 Mukendi Enterprises · Kinshasa\n📦 Distribution alimentaire & hygiène\n📲 Commandes WhatsApp", profilePic: "🏢", verified: false },
      insights: { reach: 12450, impressions: 34200, engagement_rate: 4.7, website_clicks: 186, profile_visits: 423, accounts_reached: 8930 },
      recentPosts: [
        { id: 1, type: "image", caption: "🌊 Eau Minérale fraîche disponible!", likes: 127, comments: 23, shares: 8, saves: 45, reach: 2340, date: "2025-03-08" },
        { id: 2, type: "carousel", caption: "🍚 Nouveau stock de Riz premium!", likes: 89, comments: 15, shares: 12, saves: 31, reach: 1890, date: "2025-03-06" },
        { id: 3, type: "reel", caption: "📦 Livraison rapide à Kinshasa!", likes: 312, comments: 67, shares: 45, saves: 98, reach: 5670, date: "2025-03-04" },
        { id: 4, type: "image", caption: "🧼 Savon Monganga – qualité garantie", likes: 76, comments: 11, shares: 5, saves: 22, reach: 1450, date: "2025-03-02" },
        { id: 5, type: "reel", caption: "🎉 Promo weekend -20% sur tout!", likes: 245, comments: 52, shares: 34, saves: 87, reach: 4230, date: "2025-02-28" },
      ],
      audience: { cities: [["Kinshasa",68],["Lubumbashi",12],["Mbuji-Mayi",7],["Kisangani",5],["Autres",8]], ageGender: [["18-24",18],["25-34",42],["35-44",28],["45-54",9],["55+",3]], topHours: [9,12,13,18,19,20] },
      stories: { posted: 34, avgViews: 890, avgReplies: 12, completionRate: 78 }
    },
    facebook: {
      profile: { name: "Mukendi Enterprises", likes: 4521, followers: 4890, category: "Commerce de détail", rating: 4.6, reviews: 67, coverEmoji: "🏪" },
      insights: { reach: 18700, impressions: 42300, engagement: 2890, page_views: 1230, actions_on_page: 345, post_engagement_rate: 3.8 },
      recentPosts: [
        { id: 1, type: "photo", message: "Nos produits de qualité vous attendent!", reactions: { like: 89, love: 23, wow: 5 }, comments: 34, shares: 12, reach: 3400, date: "2025-03-07" },
        { id: 2, type: "link", message: "Commander sur WhatsApp maintenant!", reactions: { like: 56, love: 12, wow: 2 }, comments: 18, shares: 23, reach: 2890, date: "2025-03-05" },
        { id: 3, type: "video", message: "Visite de notre entrepôt!", reactions: { like: 145, love: 45, wow: 12 }, comments: 56, shares: 34, reach: 6700, date: "2025-03-03" },
      ],
      audience: { cities: [["Kinshasa",72],["Lubumbashi",10],["Goma",6],["Matadi",5],["Autres",7]], ageGender: [["18-24",15],["25-34",38],["35-44",30],["45-54",12],["55+",5]] }
    },
    whatsapp: {
      profile: { name: "Mukendi Enterprises", phone: "+243812000001", status: "Verified Business", category: "Retail", description: "Distribution alimentaire & hygiène à Kinshasa", businessHours: "Lun-Sam 7h-19h" },
      insights: { messages_sent: 1245, messages_delivered: 1198, messages_read: 987, response_rate: 94, avg_response_time: "12 min", conversations: 342 },
      templates: [
        { name: "order_confirmation", status: "approved", sent: 234, delivered: 228, read: 189, category: "UTILITY" },
        { name: "promotion_weekly", status: "approved", sent: 890, delivered: 865, read: 612, category: "MARKETING" },
        { name: "delivery_update", status: "approved", sent: 121, delivered: 119, read: 98, category: "UTILITY" },
      ],
      topConversations: [
        { name: "Marie Kabila", messages: 45, lastMessage: "Merci pour la livraison!", date: "2025-03-09" },
        { name: "Restaurant Bonne Table", messages: 89, lastMessage: "Commande 50 sacs de riz SVP", date: "2025-03-09" },
        { name: "Hôtel Memling", messages: 67, lastMessage: "Facture reçue, paiement en cours", date: "2025-03-08" },
      ]
    }
  };

  const connectMeta = (platform) => {
    setMetaConnections(c => ({ ...c, [platform]: { ...c[platform], loading: true } }));
    setTimeout(() => {
      setMetaConnections(c => ({ ...c, [platform]: { connected: true, loading: false } }));
      if (!metaDemo) setMetaDemo(MOCK_META_DATA);
      showToast(`✅ ${platform === "instagram" ? "Instagram" : platform === "facebook" ? "Facebook" : "WhatsApp Business"} connecté!`, "success");
    }, 2000);
  };

  const disconnectMeta = (platform) => {
    setMetaConnections(c => ({ ...c, [platform]: { connected: false, loading: false } }));
    const anyConnected = Object.entries(metaConnections).some(([k, v]) => k !== platform && v.connected);
    if (!anyConnected) setMetaDemo(null);
    showToast(`${platform} déconnecté`, "info");
  };

  const connectedCount = Object.values(metaConnections).filter(c => c.connected).length;

  const PLATFORMS = [
    { id:"instagram",icon:"📸",name:"Instagram",color:"#E1306C" },
    { id:"facebook", icon:"📘",name:"Facebook", color:"#1877F2" },
    { id:"tiktok",   icon:"🎵",name:"TikTok",   color:"#69C9D0" },
    { id:"linkedin", icon:"💼",name:"LinkedIn", color:"#0A66C2" },
  ];
  const plat = (id) => PLATFORMS.find(p => p.id===id) || PLATFORMS[0];
  const monthNames = ["Janv","Févr","Mars","Avr","Mai","Juin","Juil","Août","Sept","Oct","Nov","Déc"];
  const daysInMonth = new Date(month.y, month.m, 0).getDate();
  const firstDow = (new Date(month.y, month.m-1, 1).getDay()+6)%7;

  const allPosts = [
    ...data.posts.filter(p => { const d = new Date(p.scheduled_date); return d.getMonth()+1===month.m && d.getFullYear()===month.y; }).map(p => ({ ...p, day: new Date(p.scheduled_date).getDate(), isAI:false })),
    ...aiPosts.filter(p => p.month===month.m && p.year===month.y),
  ];
  const dayPosts = (d) => allPosts.filter(p => p.day===d);

  const validate = (id) => { setAiPosts(p => p.map(x => x.id===id ? {...x,status:"scheduled"} : x)); setHovPost(null); showToast("✅ Post validé!", "success"); };
  const reject   = (id) => { setAiPosts(p => p.map(x => x.id===id ? {...x,status:"rejected"} : x)); setHovPost(null); showToast("Post rejeté", "info"); };

  const startEdit = (post, isAI) => {
    setEditPost({ ...post, isAI });
    setHovPost(null);
  };
  const saveEdit = () => {
    if (!editPost) return;
    const { isAI, ...updated } = editPost;
    if (isAI) {
      setAiPosts(p => p.map(x => x.id===updated.id ? { ...x, title:updated.title, content:updated.content, platform:updated.platform, time:updated.time } : x));
    } else {
      setData(d => ({ ...d, posts: d.posts.map(x => x.id===updated.id ? { ...x, title:updated.title, content:updated.content, platform:updated.platform, scheduled_date:updated.scheduled_date } : x) }));
    }
    setEditPost(null);
    showToast("✅ Post modifié!", "success");
  };

  const postColor = (p) => {
    if (p.status==="rejected") return "#4a5678";
    if (p.status==="ai_proposed") return "#F5C518";
    if (p.status==="published") return "#16C55E";
    return plat(p.platform).color;
  };

  const Tooltip = ({ post, rect }) => {
    const p2 = plat(post.platform);
    const isAI = post.status === "ai_proposed";
    const isRej = post.status === "rejected";
    let left = rect.left + rect.width/2 - 155;
    let top  = rect.bottom + 8;
    if (left + 310 > window.innerWidth - 8) left = window.innerWidth - 318;
    if (left < 8) left = 8;
    if (top + 360 > window.innerHeight - 8) top = rect.top - 370;
    return (
      <div ref={tooltipRef} style={{ position:"fixed", left, top, width:310, zIndex:3000, borderRadius:14, overflow:"hidden", animation:"scaleIn 0.18s ease", background: "#0A0F1E", border:`1px solid ${isAI?"rgba(245,197,24,0.35)":"rgba(26,86,255,0.2)"}`, boxShadow:"0 20px 60px rgba(0,0,0,0.7)" }}
        onMouseLeave={() => setHovPost(null)}>
        <div style={{ background: isAI?"rgba(245,197,24,0.08)":"rgba(26,86,255,0.06)", padding:"12px 14px 10px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:18 }}>{p2.icon}</span>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:p2.color }}>{p2.name}</div>
                <div style={{ fontSize:10, color:"#7B91C4" }}>{post.time} · {String(post.day).padStart(2,"0")}/{String(month.m).padStart(2,"0")}/{month.y}</div>
              </div>
            </div>
            {isAI && <span style={{ fontSize:10, fontWeight:700, color:"#F5C518", background:"rgba(245,197,24,0.12)", padding:"2px 8px", borderRadius:20 }}>✨ IA</span>}
          </div>
          <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:13, color:"#EEF2FF" }}>{post.title}</div>
        </div>
        <div style={{ padding:"10px 14px", maxHeight:80, overflowY:"auto", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize:11, color:"#7B91C4", lineHeight:1.6, whiteSpace:"pre-wrap" }}>{post.content?.slice(0,160)}…</div>
        </div>
        {isAI && post.reason && (
          <div style={{ padding:"10px 14px", background:"rgba(245,197,24,0.04)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize:10, fontWeight:700, color:"#F5C518", marginBottom:4 }}>🧠 ANALYSE IA</div>
            <div style={{ fontSize:11, color:"#7B91C4", lineHeight:1.6, marginBottom:8 }}>{post.reason}</div>
            <div style={{ display:"flex", gap:8 }}>
              {[["👁️",post.estimatedReach?.toLocaleString(),"Portée"],["💬",post.estimatedEngagement,"Engagement"],["⏰",post.bestTime,"Heure"]].map(([ico,v,k]) => (
                <div key={k} style={{ flex:1, background:"rgba(255,255,255,0.04)", borderRadius:7, padding:"6px 8px" }}>
                  <div style={{ fontSize:9, color:"#3A4E7A" }}>{ico} {k}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:"#EEF2FF", marginTop:1 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div style={{ padding:"10px 14px", display:"flex", gap:8 }}>
          {isAI && !isRej ? (
            <>
              <button onClick={() => validate(post.id)} style={{ flex:1, padding:"8px", background:"#16A34A", border:"none", borderRadius:8, color:"white", fontFamily:"'DM Sans'", fontSize:12, fontWeight:700, cursor:"pointer" }}>✅ Valider</button>
              <button onClick={() => startEdit(post, true)} style={{ flex:1, padding:"8px", background:"rgba(26,86,255,0.12)", border:"1px solid rgba(26,86,255,0.3)", borderRadius:8, color:"#1A56FF", fontFamily:"'DM Sans'", fontSize:12, fontWeight:700, cursor:"pointer" }}>✏️ Modifier</button>
              <button onClick={() => reject(post.id)}   style={{ flex:1, padding:"8px", background:"rgba(212,43,58,0.12)", border:"1px solid rgba(212,43,58,0.3)", borderRadius:8, color:"#D42B3A", fontFamily:"'DM Sans'", fontSize:12, fontWeight:700, cursor:"pointer" }}>✕ Rejeter</button>
            </>
          ) : !isRej && post.status!=="published" ? (
            <>
              <button onClick={() => startEdit(post, false)} style={{ flex:1, padding:"8px", background:"rgba(26,86,255,0.12)", border:"1px solid rgba(26,86,255,0.3)", borderRadius:8, color:"#1A56FF", fontFamily:"'DM Sans'", fontSize:12, fontWeight:700, cursor:"pointer" }}>✏️ Modifier</button>
              <div style={{ fontSize:11, color:"#16C55E", fontWeight:600, display:"flex", alignItems:"center" }}>✅ Programmé</div>
            </>
          ) : <div style={{ fontSize:11, color: isRej?"#4a5678":"#16C55E", fontWeight:600 }}>{isRej?"✕ Rejeté":"✅ Publié"}</div>}
        </div>
      </div>
    );
  };

  const PostChip = ({ post }) => {
    const color = postColor(post);
    const p2 = plat(post.platform);
    const isAI = post.status==="ai_proposed";
    return (
      <div onMouseEnter={e => setHovPost({ post, rect: e.currentTarget.getBoundingClientRect() })}
        onMouseLeave={e => { if (!tooltipRef.current?.contains(e.relatedTarget)) setHovPost(null); }}
        style={{ display:"flex", alignItems:"center", gap:3, padding:"2px 6px", borderRadius:6, background:`${color}18`, border:`1px solid ${color}44`, cursor:"pointer", fontSize:10, fontWeight:600, color, overflow:"hidden", maxWidth:"100%", animation: isAI&&post.status!=="rejected"?"pulse 3s infinite":"none", flexShrink:0 }}>
        <span style={{ fontSize:11 }}>{p2.icon}</span>
        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:80 }}>{post.title?.slice(0,14)}</span>
        {isAI && post.status!=="rejected" && <span style={{ flexShrink:0 }}>✨</span>}
      </div>
    );
  };

  const pendingAI = aiPosts.filter(p => p.month===month.m && p.year===month.y && p.status==="ai_proposed").length;

  return (
    <div className="page-bg page-content fade-in" style={{ position:"relative" }}>
      <HeroBanner
        label="ENGAGEMENT MARKETING"
        value={data.posts.reduce((s,p)=>s+p.likes,0) + " likes"}
        subtitle={`${data.posts.length + aiPosts.length} posts · ${aiPosts.filter(p=>p.status==="ai_proposed").length} propositions IA`}
        trend="+45%"
        trendUp={true}
        icon="📈"
      />
      <div className="mini-kpi-grid">
        <MiniKpiCard icon="📝" label="Posts" value={data.posts.length + aiPosts.length} color="#1A56FF" />
        <MiniKpiCard icon="✅" label="Publiés" value={data.posts.filter(p=>p.status==="published").length} color="#16C55E" />
        <MiniKpiCard icon="✨" label="IA" value={aiPosts.filter(p=>p.status==="ai_proposed").length} color="#F5C518" />
        <MiniKpiCard icon="🔄" label="Partages" value={data.posts.reduce((s,p)=>s+p.shares,0)} color="#69C9D0" />
      </div>
      <HelpText icon="📣">Le Marketing, c'est comment vous faites connaître vos produits. Ici, l'IA vous aide à créer des publications pour Facebook, Instagram et TikTok. Vous pouvez programmer à l'avance et l'IA propose les meilleurs moments pour publier.</HelpText>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h1 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:22, fontWeight:800 }}>◉ Marketing Hub</h1>
        <button className="btn btn-primary" onClick={() => showToast("Analytics...", "info")}>📊 Analytics</button>
      </div>
      <div className="tabs" style={{ marginBottom:20 }}>
        {[["content","🤖 AI Content"],["calendar","📅 Calendrier & Timeline"],["posts","📱 Posts"],["campaigns","🚀 Campagnes"],["meta","📊 Meta Analytics"]].map(([k,l]) => (
          <div key={k} className={`tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      {/* ─ CONTENT ─ */}
      {tab==="content" && (
        <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:16 }}>
          <div>
            <div className="card card-pad-sm" style={{ marginBottom:12 }}>
              <div className="sec-title" style={{ marginBottom:12 }}>🤖 Templates IA</div>
              {[["🎯 Promotion","Créer un post promo pour produit"],["📦 Nouveau Stock","Annonce de réapprovisionnement"],["⭐ Témoignage","Partager retour client VIP"],["🎉 Offre Spéciale","Offre limitée dans le temps"],["📊 Résultats","Résultats mensuels business"],["📱 Tutoriel","Comment utiliser un produit"]].map(([n,p]) => (
                <div key={n} onClick={() => { setComposer(c => ({...c, content:`✨ ${p}\n\n[Contenu IA généré pour ${data.user.company}]\n\n#Kinshasa #Business #DRC`})); showToast("Template chargé!", "info"); }}
                  style={{ padding:"9px 10px", background:"rgba(26,86,255,0.04)", borderRadius:9, marginBottom:7, cursor:"pointer", border:"1px solid rgba(26,86,255,0.1)", transition:"all 0.18s" }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{n}</div>
                  <div style={{ fontSize:11, color:"#7B91C4", marginTop:1 }}>{p}</div>
                </div>
              ))}
            </div>
            <div className="card card-pad-sm">
              <div className="sec-title" style={{ marginBottom:10 }}>📱 Plateformes</div>
              {PLATFORMS.map(p => (
                <div key={p.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(26,86,255,0.08)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}><span style={{ fontSize:16 }}>{p.icon}</span><span style={{ fontSize:13 }}>{p.name}</span></div>
                  <span style={{ fontSize:11, color:"#16C55E", fontWeight:600 }}>● Connecté</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card card-pad">
            <div className="sec-title" style={{ marginBottom:16 }}>✍️ Compositeur</div>
            <div className="form-group"><label className="form-label">Plateforme</label>
              <div style={{ display:"flex", gap:8 }}>
                {PLATFORMS.map(p => (
                  <div key={p.id} onClick={() => setComposer(c => ({...c,platform:p.id}))}
                    style={{ flex:1, padding:"10px 6px", borderRadius:9, textAlign:"center", cursor:"pointer", background:composer.platform===p.id?`${p.color}18`:"transparent", border:`1px solid ${composer.platform===p.id?p.color:"rgba(26,86,255,0.12)"}` }}>
                    <div style={{ fontSize:20 }}>{p.icon}</div>
                    <div style={{ fontSize:9, marginTop:2, fontWeight:600, color:composer.platform===p.id?p.color:"#7B91C4" }}>{p.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group"><label className="form-label">Titre</label><input value={composer.title} onChange={e => setComposer(c => ({...c,title:e.target.value}))} placeholder="Titre du post..." /></div>
            <div className="form-group"><label className="form-label">Contenu</label>
              <div style={{ position:"relative" }}>
                <textarea value={composer.content} onChange={e => setComposer(c => ({...c,content:e.target.value}))} rows={7} style={{ resize:"vertical", paddingBottom:28 }} placeholder="Rédigez votre post..." />
                <div style={{ position:"absolute", bottom:8, right:10, fontSize:10, color:"#7B91C4" }}>{composer.content.length}/2200</div>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Programmer pour</label><input type="datetime-local" value={composer.scheduled_date} onChange={e => setComposer(c => ({...c,scheduled_date:e.target.value}))} /></div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={() => { if(!composer.content) return showToast("Rédigez un message","error"); const post={...composer,id:Date.now(),status:composer.scheduled_date?"scheduled":"draft",likes:0,shares:0}; setData(d=>({...d,posts:[post,...d.posts]})); setComposer({title:"",content:"",platform:"instagram",scheduled_date:""}); showToast("Post programmé!","success"); }}>{composer.scheduled_date?"⏰ Programmer":"💾 Brouillon"}</button>
              <button className="btn btn-yellow" onClick={() => showToast("Publié immédiatement!", "success")}>📤 Publier</button>
              <button className="btn btn-wa btn-icon" onClick={() => showToast("Partagé sur WhatsApp!", "whatsapp")}>💬</button>
            </div>
          </div>
        </div>
      )}

      {/* ─ CALENDAR & TIMELINE ─ */}
      {tab==="calendar" && (
        <div>
          {/* Controls */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <button className="btn btn-ghost btn-icon" onClick={() => setMonth(m => m.m===1?{m:12,y:m.y-1}:{m:m.m-1,y:m.y})}>‹</button>
              <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:16, fontWeight:800, minWidth:160, textAlign:"center" }}>{monthNames[month.m-1]} {month.y}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setMonth(m => m.m===12?{m:1,y:m.y+1}:{m:m.m+1,y:m.y})}>›</button>
            </div>
            <div className="tabs" style={{ marginBottom:0, background:"transparent", padding:0, gap:6 }}>
              <div className={`tab ${calView==="calendar"?"active":""}`} onClick={() => setCalView("calendar")}>📅 Calendrier</div>
              <div className={`tab ${calView==="timeline"?"active":""}`} onClick={() => setCalView("timeline")}>⏱ Timeline</div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {[[allPosts.filter(p=>p.status==="scheduled").length,"Programmés","#1A56FF"],[pendingAI,"IA En attente","#F5C518"],[allPosts.filter(p=>p.status==="published").length,"Publiés","#16C55E"]].map(([v,l,c]) => (
                <div key={l} style={{ padding:"5px 12px", background:`${c}12`, border:`1px solid ${c}30`, borderRadius:9, textAlign:"center" }}>
                  <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:16, color:c }}>{v}</div>
                  <div style={{ fontSize:9, color:"#7B91C4", textTransform:"uppercase", letterSpacing:0.3 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {pendingAI > 0 && (
            <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px", background:"rgba(245,197,24,0.06)", border:"1px solid rgba(245,197,24,0.2)", borderRadius:10, marginBottom:14, flexWrap:"wrap" }}>
              <span>🤖</span>
              <div style={{ flex:1, fontSize:12, color:"#F5C518" }}><strong>{pendingAI}</strong> propositions IA — survolez les <span>✨</span> pour valider</div>
              <button className="btn btn-yellow" style={{ fontSize:11, padding:"5px 12px" }} onClick={() => aiPosts.filter(p=>p.month===month.m&&p.status==="ai_proposed").forEach(p=>validate(p.id))}>✅ Tout valider</button>
            </div>
          )}

          <div className="card card-pad">
            {calView === "calendar" ? (
              <>
                <div style={{ display:"flex", gap:12, marginBottom:12, flexWrap:"wrap" }}>
                  {[["📸","Instagram"],["📘","Facebook"],["🎵","TikTok"],["💼","LinkedIn"],["✨","Proposition IA"]].map(([ico,n]) => (
                    <div key={n} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11, color:"#7B91C4" }}><span>{ico}</span>{n}</div>
                  ))}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
                  {["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(d => (
                    <div key={d} style={{ textAlign:"center", fontSize:11, color:"#7B91C4", padding:"5px 0", fontWeight:700 }}>{d}</div>
                  ))}
                  {Array.from({length:firstDow},(_,i) => <div key={`e${i}`} />)}
                  {Array.from({length:daysInMonth},(_,i) => {
                    const day = i+1;
                    const posts = dayPosts(day);
                    const today = new Date();
                    const isToday = day===today.getDate() && month.m===today.getMonth()+1 && month.y===today.getFullYear();
                    return (
                      <div key={day} style={{ minHeight:72, padding:"5px 4px 3px", borderRadius:8, background: isToday?"rgba(26,86,255,0.1)":posts.length?"rgba(26,86,255,0.03)":"transparent", border:`1px solid ${isToday?"rgba(26,86,255,0.35)":posts.length?"rgba(26,86,255,0.1)":"rgba(26,86,255,0.04)"}`, cursor:"pointer", transition:"all 0.18s" }}
                        onClick={() => {
                          const dateStr = `${month.y}-${String(month.m).padStart(2,"0")}-${String(day).padStart(2,"0")}T10:00`;
                          setComposer(c => ({...c, scheduled_date: dateStr}));
                          setTab("content");
                          showToast(`📅 Post programmé pour le ${day}/${month.m}/${month.y} — complétez le contenu`, "info");
                        }}
                        onMouseEnter={e => { if(!isToday) e.currentTarget.style.background = "rgba(26,86,255,0.06)"; e.currentTarget.style.borderColor = "rgba(26,86,255,0.25)"; }}
                        onMouseLeave={e => { if(!isToday) e.currentTarget.style.background = posts.length?"rgba(26,86,255,0.03)":"transparent"; e.currentTarget.style.borderColor = isToday?"rgba(26,86,255,0.35)":posts.length?"rgba(26,86,255,0.1)":"rgba(26,86,255,0.04)"; }}
                      >
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:3 }}>
                          <span style={{ fontSize:12, fontWeight:isToday?800:400, color:isToday?"#1A56FF":posts.length?"#EEF2FF":"#7B91C4" }}>{day}</span>
                          {posts.some(p=>p.status==="ai_proposed") && <span style={{ fontSize:9, animation:"pulse 2s infinite" }}>✨</span>}
                          {!posts.length && <span style={{ fontSize:9, color:"#3A4E7A", opacity:0.5 }}>+</span>}
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                          {posts.slice(0,3).map((p,i) => <PostChip key={p.id||i} post={p} />)}
                          {posts.length>3 && <div style={{ fontSize:9, color:"#7B91C4" }}>+{posts.length-3}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              /* TIMELINE */
              <div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                  <button className="btn btn-ghost" style={{ fontSize:12 }} onClick={() => setWeekOff(w => Math.max(w-1,0))}>← Semaine préc.</button>
                  <span style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:13 }}>Semaine {weekOff+1} · {monthNames[month.m-1]} {month.y}</span>
                  <button className="btn btn-ghost" style={{ fontSize:12 }} onClick={() => setWeekOff(w => Math.min(w+1,3))}>Semaine suiv. →</button>
                </div>
                <div style={{ overflowX:"auto" }}>
                  <div style={{ minWidth:680 }}>
                    <div style={{ display:"grid", gridTemplateColumns:"50px repeat(7,1fr)", gap:2, marginBottom:4 }}>
                      <div />
                      {Array.from({length:7},(_,i) => {
                        const day = 1 + weekOff*7 + i;
                        const valid = day >= 1 && day <= daysInMonth;
                        return (
                          <div key={i} style={{ padding:"7px 4px", borderRadius:8, background:"rgba(26,86,255,0.05)", border:"1px solid rgba(26,86,255,0.1)", textAlign:"center" }}>
                            <div style={{ fontSize:10, color:"#7B91C4", fontWeight:600 }}>{"LunMarMerJeuVenSamDim".slice(i*3,i*3+3)}</div>
                            <div style={{ fontSize:15, fontWeight:800, color: valid?"#EEF2FF":"#3A4E7A" }}>{valid?day:""}</div>
                          </div>
                        );
                      })}
                    </div>
                    {["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"].map(hour => {
                      const h = hour.split(":")[0];
                      return (
                        <div key={hour} style={{ display:"grid", gridTemplateColumns:"50px repeat(7,1fr)", gap:2, marginBottom:2, minHeight:42 }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", paddingRight:8 }}>
                            <span style={{ fontSize:10, color:"#3A4E7A", fontFamily:"monospace" }}>{hour}</span>
                          </div>
                          {Array.from({length:7},(_,di) => {
                            const day = 1 + weekOff*7 + di;
                            const valid = day>=1 && day<=daysInMonth;
                            const posts2 = valid ? allPosts.filter(p => p.day===day && p.time?.startsWith(h)) : [];
                            return (
                              <div key={di} style={{ background: posts2.length?"rgba(26,86,255,0.03)":"transparent", borderRadius:5, border:`1px solid ${posts2.length?"rgba(26,86,255,0.08)":"rgba(26,86,255,0.03)"}`, padding:2, minHeight:42, display:"flex", flexDirection:"column", gap:2 }}>
                                {posts2.map((p,pi) => {
                                  const p2 = plat(p.platform);
                                  const isAI = p.status==="ai_proposed";
                                  const color = postColor(p);
                                  return (
                                    <div key={p.id||pi}
                                      onMouseEnter={e => setHovPost({ post:p, rect:e.currentTarget.getBoundingClientRect() })}
                                      onMouseLeave={e => { if (!tooltipRef.current?.contains(e.relatedTarget)) setHovPost(null); }}
                                      style={{ padding:"3px 6px", borderRadius:5, cursor:"pointer", background:`${color}15`, border:`1px solid ${color}40`, animation:isAI&&p.status!=="rejected"?"pulse 3s infinite":"none" }}>
                                      <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                                        <span style={{ fontSize:11 }}>{p2.icon}</span>
                                        <span style={{ fontSize:10, fontWeight:700, color, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.title?.slice(0,18)}</span>
                                        {isAI && p.status!=="rejected" && <span style={{ fontSize:8, flexShrink:0 }}>✨</span>}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {tab==="posts" && (
        <div className="g2">
          {[...data.posts,...aiPosts.filter(p=>p.status!=="rejected")].map((p,i) => {
            const p2 = plat(p.platform);
            const isAI = p.status==="ai_proposed";
            return (
              <div key={p.id||i} className="card card-pad" style={{ borderColor:isAI?"rgba(245,197,24,0.25)":undefined }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:20 }}>{p2.icon}</span>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:p2.color }}>{p2.name}</div>
                      <div style={{ fontSize:10, color:"#7B91C4" }}>{p.scheduled_date || `${String(p.day||"?").padStart(2,"0")}/${String(p.month||"?").padStart(2,"0")}/${p.year||"?"} ${p.time||""}`}</div>
                    </div>
                  </div>
                  {isAI ? <span className="tag" style={{ background:"rgba(245,197,24,0.12)", color:"#F5C518" }}>✨ IA</span> : <Tag status={p.status} />}
                </div>
                {p.title && <div style={{ fontWeight:700, marginBottom:6, fontSize:13 }}>{p.title}</div>}
                <div style={{ fontSize:11, color:"#7B91C4", lineHeight:1.6, marginBottom:10 }}>{p.content?.slice(0,100)}…</div>
                {p.status !== "published" && (
                  <div style={{ display:"flex", gap:8 }}>
                    {isAI && <button onClick={() => validate(p.id)} className="btn btn-success" style={{ flex:1, justifyContent:"center", fontSize:11 }}>✅ Valider</button>}
                    <button onClick={() => startEdit(p, isAI)} className="btn btn-primary" style={{ flex:1, justifyContent:"center", fontSize:11 }}>✏️ Modifier</button>
                    {isAI && <button onClick={() => reject(p.id)} className="btn btn-red" style={{ flex:1, justifyContent:"center", fontSize:11 }}>✕ Rejeter</button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab==="campaigns" && (
        <div className="card card-pad" style={{ textAlign:"center", padding:40 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🚀</div>
          <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:20, fontWeight:800, marginBottom:8 }}>Campagnes Multi-Plateformes</div>
          <div style={{ fontSize:13, color:"#7B91C4", marginBottom:20 }}>Créez des campagnes avec suivi ROI en temps réel</div>
          <button className="btn btn-primary" onClick={() => showToast("Créateur de campagne ouvert!", "info")}>🚀 Nouvelle Campagne</button>
        </div>
      )}

      {/* ─ META ANALYTICS TAB ─ */}
      {tab==="meta" && (
        <div>
          {/* Connection Cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
            {[
              { id:"instagram", icon:"📸", name:"Instagram", color:"#E1306C", desc:"Insights, followers, posts & stories" },
              { id:"facebook", icon:"📘", name:"Facebook Page", color:"#1877F2", desc:"Page likes, reach & post analytics" },
              { id:"whatsapp", icon:"💬", name:"WhatsApp Business", color:"#25D366", desc:"Messages, templates & conversations" },
            ].map(p => {
              const conn = metaConnections[p.id];
              return (
                <div key={p.id} className="card card-pad" style={{ borderColor: conn.connected ? `${p.color}40` : undefined, position:"relative", overflow:"hidden" }}>
                  {conn.connected && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:p.color }} />}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:`${p.color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>{p.icon}</div>
                    <div>
                      <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:14 }}>{p.name}</div>
                      <div style={{ fontSize:11, color:"#7B91C4" }}>{p.desc}</div>
                    </div>
                  </div>
                  {conn.connected ? (
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
                        <div style={{ width:8, height:8, borderRadius:4, background:p.color, animation:"pulse 2s infinite" }} />
                        <span style={{ fontSize:12, fontWeight:700, color:p.color }}>Connecté</span>
                      </div>
                      {p.id === "instagram" && metaDemo && (
                        <div style={{ display:"flex", gap:8 }}>
                          {[["Followers", metaDemo.instagram.profile.followers.toLocaleString()],["Posts", metaDemo.instagram.profile.posts],["Engage.", metaDemo.instagram.insights.engagement_rate+"%"]].map(([l,v]) => (
                            <div key={l} style={{ flex:1, background:"rgba(225,48,108,0.06)", borderRadius:8, padding:"6px 8px", textAlign:"center" }}>
                              <div style={{ fontSize:9, color:"#7B91C4", textTransform:"uppercase" }}>{l}</div>
                              <div style={{ fontSize:14, fontWeight:800, color:"#E1306C" }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {p.id === "facebook" && metaDemo && (
                        <div style={{ display:"flex", gap:8 }}>
                          {[["Likes", metaDemo.facebook.profile.likes.toLocaleString()],["Followers", metaDemo.facebook.profile.followers.toLocaleString()],["Note", metaDemo.facebook.profile.rating+"⭐"]].map(([l,v]) => (
                            <div key={l} style={{ flex:1, background:"rgba(24,119,242,0.06)", borderRadius:8, padding:"6px 8px", textAlign:"center" }}>
                              <div style={{ fontSize:9, color:"#7B91C4", textTransform:"uppercase" }}>{l}</div>
                              <div style={{ fontSize:14, fontWeight:800, color:"#1877F2" }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      {p.id === "whatsapp" && metaDemo && (
                        <div style={{ display:"flex", gap:8 }}>
                          {[["Envoyés", metaDemo.whatsapp.insights.messages_sent.toLocaleString()],["Taux réponse", metaDemo.whatsapp.insights.response_rate+"%"],["Convos", metaDemo.whatsapp.insights.conversations]].map(([l,v]) => (
                            <div key={l} style={{ flex:1, background:"rgba(37,211,102,0.06)", borderRadius:8, padding:"6px 8px", textAlign:"center" }}>
                              <div style={{ fontSize:9, color:"#7B91C4", textTransform:"uppercase" }}>{l}</div>
                              <div style={{ fontSize:14, fontWeight:800, color:"#25D366" }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <button onClick={() => disconnectMeta(p.id)} style={{ marginTop:10, width:"100%", padding:"7px", background:"rgba(212,43,58,0.08)", border:"1px solid rgba(212,43,58,0.2)", borderRadius:8, color:"#D42B3A", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans'" }}>Déconnecter</button>
                    </div>
                  ) : (
                    <button onClick={() => connectMeta(p.id)} disabled={conn.loading}
                      style={{ width:"100%", padding:"10px", background:conn.loading?"rgba(255,255,255,0.04)":`${p.color}15`, border:`1px solid ${p.color}40`, borderRadius:10, color: conn.loading?"#7B91C4":p.color, fontSize:13, fontWeight:700, cursor: conn.loading?"wait":"pointer", fontFamily:"'DM Sans'", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                      {conn.loading ? (
                        <><span style={{ display:"inline-block", width:14, height:14, border:"2px solid #7B91C4", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /> Connexion en cours...</>
                      ) : (
                        <>{p.icon} Connecter {p.name}</>
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detailed Stats - only when connected */}
          {connectedCount > 0 && metaDemo && (
            <div>
              <div className="tabs" style={{ marginBottom:16 }}>
                {[["overview","📊 Vue d'ensemble"],
                  ...(metaConnections.instagram.connected ? [["instagram","📸 Instagram"]] : []),
                  ...(metaConnections.facebook.connected ? [["facebook","📘 Facebook"]] : []),
                  ...(metaConnections.whatsapp.connected ? [["whatsapp","💬 WhatsApp"]] : []),
                ].map(([k,l]) => (
                  <div key={k} className={`tab ${metaSubTab===k?"active":""}`} onClick={() => setMetaSubTab(k)}>{l}</div>
                ))}
              </div>

              {/* OVERVIEW */}
              {metaSubTab === "overview" && (
                <div>
                  <div className="card card-pad" style={{ marginBottom:16 }}>
                    <div className="sec-title" style={{ marginBottom:14 }}>📊 Performance Globale Meta</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                      {[
                        ["👁️","Portée Totale", (metaConnections.instagram.connected ? metaDemo.instagram.insights.reach : 0) + (metaConnections.facebook.connected ? metaDemo.facebook.insights.reach : 0), "#1A56FF"],
                        ["👥","Audience Totale", (metaConnections.instagram.connected ? metaDemo.instagram.profile.followers : 0) + (metaConnections.facebook.connected ? metaDemo.facebook.profile.followers : 0), "#16C55E"],
                        ["💬","Messages", metaConnections.whatsapp.connected ? metaDemo.whatsapp.insights.messages_sent : 0, "#25D366"],
                        ["📈","Engagement Moy.", metaConnections.instagram.connected ? metaDemo.instagram.insights.engagement_rate+"%" : metaConnections.facebook.connected ? metaDemo.facebook.insights.post_engagement_rate+"%" : "N/A", "#F5C518"],
                      ].map(([ico,label,value,color]) => (
                        <div key={label} style={{ background:`${color}08`, border:`1px solid ${color}20`, borderRadius:12, padding:"14px 12px", textAlign:"center" }}>
                          <div style={{ fontSize:22, marginBottom:6 }}>{ico}</div>
                          <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:20, fontWeight:800, color }}>{typeof value==="number"?value.toLocaleString():value}</div>
                          <div style={{ fontSize:10, color:"#7B91C4", marginTop:4, textTransform:"uppercase", letterSpacing:0.5 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="g2">
                    {metaConnections.instagram.connected && (
                      <div className="card card-pad">
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                          <span style={{ fontSize:18 }}>📸</span>
                          <div className="sec-title" style={{ margin:0 }}>Top Posts Instagram</div>
                        </div>
                        {metaDemo.instagram.recentPosts.slice(0,3).map(post => (
                          <div key={post.id} style={{ padding:"10px 0", borderBottom:"1px solid rgba(26,86,255,0.08)" }}>
                            <div style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>{post.caption}</div>
                            <div style={{ display:"flex", gap:12, fontSize:11, color:"#7B91C4" }}>
                              <span>❤️ {post.likes}</span><span>💬 {post.comments}</span><span>🔄 {post.shares}</span><span>📌 {post.saves}</span><span>👁️ {post.reach.toLocaleString()}</span>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                              <span className="tag" style={{ background:"rgba(225,48,108,0.1)", color:"#E1306C", fontSize:9, padding:"2px 6px" }}>{post.type}</span>
                              <span style={{ fontSize:10, color:"#3A4E7A" }}>{post.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {metaConnections.facebook.connected && (
                      <div className="card card-pad">
                        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
                          <span style={{ fontSize:18 }}>📘</span>
                          <div className="sec-title" style={{ margin:0 }}>Top Posts Facebook</div>
                        </div>
                        {metaDemo.facebook.recentPosts.map(post => (
                          <div key={post.id} style={{ padding:"10px 0", borderBottom:"1px solid rgba(26,86,255,0.08)" }}>
                            <div style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>{post.message}</div>
                            <div style={{ display:"flex", gap:12, fontSize:11, color:"#7B91C4" }}>
                              <span>👍 {post.reactions.like}</span><span>❤️ {post.reactions.love}</span><span>💬 {post.comments}</span><span>🔄 {post.shares}</span><span>👁️ {post.reach.toLocaleString()}</span>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                              <span className="tag" style={{ background:"rgba(24,119,242,0.1)", color:"#1877F2", fontSize:9, padding:"2px 6px" }}>{post.type}</span>
                              <span style={{ fontSize:10, color:"#3A4E7A" }}>{post.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* INSTAGRAM DETAIL */}
              {metaSubTab === "instagram" && metaConnections.instagram.connected && (
                <div>
                  {/* Profile Card */}
                  <div className="card card-pad" style={{ marginBottom:16, borderColor:"rgba(225,48,108,0.2)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                      <div style={{ width:64, height:64, borderRadius:32, background:"linear-gradient(135deg, #E1306C, #F77737, #FCAF45)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🏢</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, fontWeight:800 }}>{metaDemo.instagram.profile.username}</div>
                        <div style={{ fontSize:11, color:"#7B91C4", whiteSpace:"pre-wrap", marginTop:4 }}>{metaDemo.instagram.profile.bio}</div>
                      </div>
                      <div style={{ display:"flex", gap:16, textAlign:"center" }}>
                        {[["Posts", metaDemo.instagram.profile.posts],["Followers", metaDemo.instagram.profile.followers.toLocaleString()],["Following", metaDemo.instagram.profile.following]].map(([l,v]) => (
                          <div key={l}><div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, fontWeight:800 }}>{v}</div><div style={{ fontSize:10, color:"#7B91C4" }}>{l}</div></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Insights Grid */}
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
                    {[
                      ["👁️","Portée", metaDemo.instagram.insights.reach.toLocaleString(), "+12%", true],
                      ["📊","Impressions", metaDemo.instagram.insights.impressions.toLocaleString(), "+8%", true],
                      ["💬","Taux d'engagement", metaDemo.instagram.insights.engagement_rate+"%", "+0.3%", true],
                      ["🔗","Clics site web", metaDemo.instagram.insights.website_clicks, "+24%", true],
                      ["👤","Visites profil", metaDemo.instagram.insights.profile_visits, "+15%", true],
                      ["🌐","Comptes atteints", metaDemo.instagram.insights.accounts_reached.toLocaleString(), "+18%", true],
                    ].map(([ico,label,value,trend,up]) => (
                      <div key={label} className="card card-pad-sm" style={{ textAlign:"center" }}>
                        <div style={{ fontSize:20, marginBottom:4 }}>{ico}</div>
                        <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:20, fontWeight:800, color:"#E1306C" }}>{value}</div>
                        <div style={{ fontSize:10, color:"#7B91C4", marginBottom:2 }}>{label}</div>
                        <div style={{ fontSize:10, color:"#16C55E", fontWeight:700 }}>↑ {trend}</div>
                      </div>
                    ))}
                  </div>
                  {/* Stories & Audience */}
                  <div className="g2">
                    <div className="card card-pad">
                      <div className="sec-title" style={{ marginBottom:12 }}>📖 Stories (30 derniers jours)</div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
                        {[["Stories publiées", metaDemo.instagram.stories.posted],["Vues moyennes", metaDemo.instagram.stories.avgViews],["Réponses moy.", metaDemo.instagram.stories.avgReplies],["Taux complétion", metaDemo.instagram.stories.completionRate+"%"]].map(([l,v]) => (
                          <div key={l} style={{ background:"rgba(225,48,108,0.05)", borderRadius:10, padding:"10px 12px" }}>
                            <div style={{ fontSize:10, color:"#7B91C4" }}>{l}</div>
                            <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, fontWeight:800, color:"#E1306C" }}>{v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="card card-pad">
                      <div className="sec-title" style={{ marginBottom:12 }}>🌍 Audience — Villes</div>
                      {metaDemo.instagram.audience.cities.map(([city, pct]) => (
                        <div key={city} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                          <span style={{ fontSize:12, minWidth:90 }}>{city}</span>
                          <div style={{ flex:1, height:8, background:"rgba(225,48,108,0.08)", borderRadius:4, overflow:"hidden" }}>
                            <div style={{ width:`${pct}%`, height:"100%", background:"#E1306C", borderRadius:4 }} />
                          </div>
                          <span style={{ fontSize:11, fontWeight:700, color:"#E1306C", minWidth:30 }}>{pct}%</span>
                        </div>
                      ))}
                      <div className="sec-title" style={{ marginBottom:10, marginTop:16 }}>👥 Âge</div>
                      {metaDemo.instagram.audience.ageGender.map(([age, pct]) => (
                        <div key={age} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                          <span style={{ fontSize:11, minWidth:50 }}>{age}</span>
                          <div style={{ flex:1, height:8, background:"rgba(225,48,108,0.08)", borderRadius:4, overflow:"hidden" }}>
                            <div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,#E1306C,#F77737)", borderRadius:4 }} />
                          </div>
                          <span style={{ fontSize:11, fontWeight:700, color:"#E1306C", minWidth:30 }}>{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Recent Posts */}
                  <div className="card card-pad" style={{ marginTop:16 }}>
                    <div className="sec-title" style={{ marginBottom:14 }}>📸 Posts Récents</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:12 }}>
                      {metaDemo.instagram.recentPosts.map(post => (
                        <div key={post.id} style={{ background:"rgba(225,48,108,0.04)", border:"1px solid rgba(225,48,108,0.12)", borderRadius:12, padding:14 }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                            <span className="tag" style={{ background:"rgba(225,48,108,0.12)", color:"#E1306C", fontSize:10 }}>{post.type}</span>
                            <span style={{ fontSize:10, color:"#3A4E7A" }}>{post.date}</span>
                          </div>
                          <div style={{ fontSize:12, fontWeight:600, marginBottom:10, lineHeight:1.5 }}>{post.caption}</div>
                          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:4 }}>
                            {[["❤️",post.likes],["💬",post.comments],["🔄",post.shares],["📌",post.saves],["👁️",post.reach.toLocaleString()]].map(([ico,v]) => (
                              <div key={ico} style={{ textAlign:"center", background:"rgba(225,48,108,0.06)", borderRadius:6, padding:"4px 2px" }}>
                                <div style={{ fontSize:12 }}>{ico}</div>
                                <div style={{ fontSize:11, fontWeight:700, color:"#E1306C" }}>{v}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* FACEBOOK DETAIL */}
              {metaSubTab === "facebook" && metaConnections.facebook.connected && (
                <div>
                  <div className="card card-pad" style={{ marginBottom:16, borderColor:"rgba(24,119,242,0.2)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                      <div style={{ width:64, height:64, borderRadius:12, background:"#1877F2", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, color:"white" }}>🏪</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, fontWeight:800 }}>{metaDemo.facebook.profile.name}</div>
                        <div style={{ fontSize:11, color:"#7B91C4" }}>{metaDemo.facebook.profile.category} · ⭐ {metaDemo.facebook.profile.rating} ({metaDemo.facebook.profile.reviews} avis)</div>
                      </div>
                      <div style={{ display:"flex", gap:16, textAlign:"center" }}>
                        {[["Likes", metaDemo.facebook.profile.likes.toLocaleString()],["Followers", metaDemo.facebook.profile.followers.toLocaleString()]].map(([l,v]) => (
                          <div key={l}><div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, fontWeight:800 }}>{v}</div><div style={{ fontSize:10, color:"#7B91C4" }}>{l}</div></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
                    {[
                      ["👁️","Portée", metaDemo.facebook.insights.reach.toLocaleString()],
                      ["📊","Impressions", metaDemo.facebook.insights.impressions.toLocaleString()],
                      ["💬","Engagement", metaDemo.facebook.insights.engagement.toLocaleString()],
                      ["👤","Vues page", metaDemo.facebook.insights.page_views.toLocaleString()],
                      ["🖱️","Actions sur page", metaDemo.facebook.insights.actions_on_page],
                      ["📈","Taux engagement", metaDemo.facebook.insights.post_engagement_rate+"%"],
                    ].map(([ico,label,value]) => (
                      <div key={label} className="card card-pad-sm" style={{ textAlign:"center" }}>
                        <div style={{ fontSize:20, marginBottom:4 }}>{ico}</div>
                        <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:20, fontWeight:800, color:"#1877F2" }}>{value}</div>
                        <div style={{ fontSize:10, color:"#7B91C4" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="g2">
                    <div className="card card-pad">
                      <div className="sec-title" style={{ marginBottom:12 }}>📝 Posts Récents</div>
                      {metaDemo.facebook.recentPosts.map(post => (
                        <div key={post.id} style={{ padding:"12px 0", borderBottom:"1px solid rgba(26,86,255,0.08)" }}>
                          <div style={{ fontSize:12, fontWeight:600, marginBottom:6 }}>{post.message}</div>
                          <div style={{ display:"flex", gap:8, marginBottom:4 }}>
                            {Object.entries(post.reactions).map(([k,v]) => (
                              <span key={k} style={{ fontSize:11, color:"#7B91C4" }}>{k==="like"?"👍":k==="love"?"❤️":"😮"} {v}</span>
                            ))}
                            <span style={{ fontSize:11, color:"#7B91C4" }}>💬 {post.comments}</span>
                            <span style={{ fontSize:11, color:"#7B91C4" }}>🔄 {post.shares}</span>
                          </div>
                          <div style={{ fontSize:10, color:"#3A4E7A" }}>👁️ Portée: {post.reach.toLocaleString()} · {post.date}</div>
                        </div>
                      ))}
                    </div>
                    <div className="card card-pad">
                      <div className="sec-title" style={{ marginBottom:12 }}>🌍 Audience — Villes</div>
                      {metaDemo.facebook.audience.cities.map(([city, pct]) => (
                        <div key={city} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                          <span style={{ fontSize:12, minWidth:90 }}>{city}</span>
                          <div style={{ flex:1, height:8, background:"rgba(24,119,242,0.08)", borderRadius:4, overflow:"hidden" }}>
                            <div style={{ width:`${pct}%`, height:"100%", background:"#1877F2", borderRadius:4 }} />
                          </div>
                          <span style={{ fontSize:11, fontWeight:700, color:"#1877F2", minWidth:30 }}>{pct}%</span>
                        </div>
                      ))}
                      <div className="sec-title" style={{ marginBottom:10, marginTop:16 }}>👥 Âge</div>
                      {metaDemo.facebook.audience.ageGender.map(([age, pct]) => (
                        <div key={age} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                          <span style={{ fontSize:11, minWidth:50 }}>{age}</span>
                          <div style={{ flex:1, height:8, background:"rgba(24,119,242,0.08)", borderRadius:4, overflow:"hidden" }}>
                            <div style={{ width:`${pct}%`, height:"100%", background:"#1877F2", borderRadius:4 }} />
                          </div>
                          <span style={{ fontSize:11, fontWeight:700, color:"#1877F2", minWidth:30 }}>{pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* WHATSAPP DETAIL */}
              {metaSubTab === "whatsapp" && metaConnections.whatsapp.connected && (
                <div>
                  <div className="card card-pad" style={{ marginBottom:16, borderColor:"rgba(37,211,102,0.2)" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                      <div style={{ width:64, height:64, borderRadius:12, background:"#25D366", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, color:"white" }}>💬</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, fontWeight:800 }}>{metaDemo.whatsapp.profile.name}</div>
                        <div style={{ fontSize:11, color:"#7B91C4" }}>{metaDemo.whatsapp.profile.phone} · {metaDemo.whatsapp.profile.status}</div>
                        <div style={{ fontSize:11, color:"#7B91C4" }}>{metaDemo.whatsapp.profile.description}</div>
                      </div>
                      <div style={{ background:"rgba(37,211,102,0.08)", borderRadius:10, padding:"8px 14px", textAlign:"center" }}>
                        <div style={{ fontSize:10, color:"#7B91C4" }}>Heures</div>
                        <div style={{ fontSize:12, fontWeight:700, color:"#25D366" }}>{metaDemo.whatsapp.profile.businessHours}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:16 }}>
                    {[
                      ["📤","Messages envoyés", metaDemo.whatsapp.insights.messages_sent.toLocaleString()],
                      ["✅","Délivrés", metaDemo.whatsapp.insights.messages_delivered.toLocaleString()],
                      ["👁️","Lus", metaDemo.whatsapp.insights.messages_read.toLocaleString()],
                      ["💬","Conversations", metaDemo.whatsapp.insights.conversations],
                      ["⚡","Taux réponse", metaDemo.whatsapp.insights.response_rate+"%"],
                      ["⏱️","Temps moy.", metaDemo.whatsapp.insights.avg_response_time],
                    ].map(([ico,label,value]) => (
                      <div key={label} className="card card-pad-sm" style={{ textAlign:"center" }}>
                        <div style={{ fontSize:20, marginBottom:4 }}>{ico}</div>
                        <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:20, fontWeight:800, color:"#25D366" }}>{value}</div>
                        <div style={{ fontSize:10, color:"#7B91C4" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="g2">
                    <div className="card card-pad">
                      <div className="sec-title" style={{ marginBottom:12 }}>📋 Templates de Messages</div>
                      {metaDemo.whatsapp.templates.map((t,i) => (
                        <div key={i} style={{ padding:"10px 0", borderBottom:"1px solid rgba(26,86,255,0.08)" }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                            <div style={{ fontWeight:700, fontSize:13 }}>{t.name.replace(/_/g," ").replace(/\b\w/g,c=>c.toUpperCase())}</div>
                            <span className="tag" style={{ background: t.status==="approved"?"rgba(22,197,94,0.12)":"rgba(245,197,24,0.12)", color: t.status==="approved"?"#16C55E":"#F5C518", fontSize:9 }}>{t.status==="approved"?"✅ Approuvé":"⏳ En attente"}</span>
                          </div>
                          <div style={{ display:"flex", gap:12, fontSize:11, color:"#7B91C4" }}>
                            <span>📤 {t.sent}</span><span>✅ {t.delivered}</span><span>👁️ {t.read}</span>
                            <span style={{ marginLeft:"auto", fontSize:10, color:"#3A4E7A" }}>{t.category}</span>
                          </div>
                          <div style={{ marginTop:6, height:4, background:"rgba(37,211,102,0.08)", borderRadius:2, overflow:"hidden" }}>
                            <div style={{ width:`${(t.read/t.sent*100).toFixed(0)}%`, height:"100%", background:"#25D366", borderRadius:2 }} />
                          </div>
                          <div style={{ fontSize:9, color:"#3A4E7A", marginTop:2 }}>Taux de lecture: {(t.read/t.sent*100).toFixed(0)}%</div>
                        </div>
                      ))}
                    </div>
                    <div className="card card-pad">
                      <div className="sec-title" style={{ marginBottom:12 }}>💬 Conversations Récentes</div>
                      {metaDemo.whatsapp.topConversations.map((c,i) => (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid rgba(26,86,255,0.08)" }}>
                          <div style={{ width:40, height:40, borderRadius:20, background:"rgba(37,211,102,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, color:"#25D366" }}>{c.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                          <div style={{ flex:1 }}>
                            <div style={{ fontWeight:700, fontSize:13 }}>{c.name}</div>
                            <div style={{ fontSize:11, color:"#7B91C4", marginTop:2 }}>{c.lastMessage}</div>
                          </div>
                          <div style={{ textAlign:"right" }}>
                            <div style={{ fontSize:10, color:"#3A4E7A" }}>{c.date}</div>
                            <div style={{ fontSize:11, fontWeight:700, color:"#25D366" }}>{c.messages} msgs</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {connectedCount === 0 && (
            <div className="card card-pad" style={{ textAlign:"center", padding:40 }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🔗</div>
              <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:20, fontWeight:800, marginBottom:8 }}>Connectez vos comptes Meta</div>
              <div style={{ fontSize:13, color:"#7B91C4", maxWidth:400, margin:"0 auto", lineHeight:1.7 }}>
                Connectez Instagram, Facebook ou WhatsApp Business pour voir vos statistiques, l'engagement de vos posts et les données de votre audience — le tout depuis un seul endroit.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─ EDIT POST MODAL ─ */}
      {editPost && (
        <div style={{ position:"fixed", inset:0, zIndex:5000, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)" }} onClick={() => setEditPost(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:520, background:"#0A0F1E", border:"1px solid rgba(26,86,255,0.2)", borderRadius:16, padding:24, animation:"scaleIn 0.2s ease" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, fontWeight:800 }}>✏️ Modifier le Post</div>
              <button onClick={() => setEditPost(null)} style={{ background:"none", border:"none", color:"#7B91C4", fontSize:20, cursor:"pointer" }}>✕</button>
            </div>
            <div className="form-group"><label className="form-label">Plateforme</label>
              <div style={{ display:"flex", gap:8 }}>
                {PLATFORMS.map(p => (
                  <div key={p.id} onClick={() => setEditPost(ep => ({...ep, platform:p.id}))}
                    style={{ flex:1, padding:"10px 6px", borderRadius:9, textAlign:"center", cursor:"pointer", background:editPost.platform===p.id?`${p.color}18`:"transparent", border:`1px solid ${editPost.platform===p.id?p.color:"rgba(26,86,255,0.12)"}` }}>
                    <div style={{ fontSize:20 }}>{p.icon}</div>
                    <div style={{ fontSize:9, marginTop:2, fontWeight:600, color:editPost.platform===p.id?p.color:"#7B91C4" }}>{p.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="form-group"><label className="form-label">Titre</label>
              <input value={editPost.title||""} onChange={e => setEditPost(ep => ({...ep, title:e.target.value}))} placeholder="Titre du post..." />
            </div>
            <div className="form-group"><label className="form-label">Contenu</label>
              <div style={{ position:"relative" }}>
                <textarea value={editPost.content||""} onChange={e => setEditPost(ep => ({...ep, content:e.target.value}))} rows={6} style={{ resize:"vertical", paddingBottom:28 }} placeholder="Contenu du post..." />
                <div style={{ position:"absolute", bottom:8, right:10, fontSize:10, color:"#7B91C4" }}>{(editPost.content||"").length}/2200</div>
              </div>
            </div>
            {editPost.isAI ? (
              <div className="form-group"><label className="form-label">Heure</label>
                <input type="time" value={editPost.time||""} onChange={e => setEditPost(ep => ({...ep, time:e.target.value}))} />
              </div>
            ) : (
              <div className="form-group"><label className="form-label">Date programmée</label>
                <input type="datetime-local" value={editPost.scheduled_date||""} onChange={e => setEditPost(ep => ({...ep, scheduled_date:e.target.value}))} />
              </div>
            )}
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={saveEdit}>💾 Enregistrer</button>
              <button className="btn btn-ghost" style={{ flex:1, justifyContent:"center" }} onClick={() => setEditPost(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ACCOUNTING PAGE ───────────────────────────────────────────────────────────
function AccountingPage({ data, setData, showToast, kpiGoals, updateGoal }) {
  const [tab, setTab] = useState("cashbook");
  const [showAdd, setShowAdd] = useState(false);
  const [newExp, setNewExp] = useState({ description:"", amount:"", category:"Transport", expense_date:new Date().toISOString().split("T")[0], status:"pending" });
  const [selectedTx, setSelectedTx] = useState(null);

  const totalRev  = data.sales.reduce((s,x) => s+x.total_amount, 0);
  const totalExp  = data.expenses.filter(e=>e.status==="approved").reduce((s,x) => s+x.amount, 0);
  const netProfit = totalRev - totalExp;

  const cashbook = [
    ...data.sales.map(s   => ({ date:s.sale_date, desc:`Vente: ${s.product_name}`, type:"in", amount:s.total_amount, source:"sale", detail: s })),
    ...data.expenses.filter(e=>e.status==="approved").map(e => ({ date:e.expense_date, desc:e.description, type:"out", amount:e.amount, source:"expense", detail: e })),
  ].sort((a,b) => new Date(b.date)-new Date(a.date));

  return (
    <div className="page-bg page-content fade-in" id="accounting-content">
      <HeroBanner
        label="PROFIT NET"
        value={fmt(netProfit)}
        subtitle={`Revenus: ${fmt(totalRev)} · Dépenses: ${fmt(totalExp)}`}
        progress={totalRev > 0 ? ((netProfit/totalRev)*100) : 0}
        progressLabel={`Marge nette: ${totalRev>0?((netProfit/totalRev)*100).toFixed(0):0}%`}
        trend="+23%"
        trendUp={true}
        icon="📊"
        onEditGoal={(v) => { showToast(`🎯 Objectif profit net: ${fmt(v)}`, "success"); }}
        goalLabel="Objectif profit net ($)"
      />
      <div className="mini-kpi-grid">
        <MiniKpiCard icon="💵" label="Revenus" value={fmt(totalRev)} trend="+18%" trendUp={true} color="#1A56FF" />
        <MiniKpiCard icon="📉" label="Dépenses" value={fmt(totalExp)} trend="+5%" trendUp={false} color="#D42B3A" />
        <MiniKpiCard icon="🧾" label="Nb Dépenses" value={data.expenses.length} color="#7B91C4" />
        <MiniKpiCard icon="✅" label="Approuvées" value={data.expenses.filter(e=>e.status==="approved").length} color="#16C55E" />
      </div>
      <HelpText icon="🧾">La comptabilité c'est le suivi de tout l'argent qui entre et sort de votre business. Le «journal de caisse» note chaque mouvement d'argent, entrée (💵) ou sortie (📉). Les «revenus» c'est l'argent gagné par vos ventes. Les «dépenses» c'est l'argent dépensé (loyer, transport, salaires...). Le «profit net» c'est ce qui vous reste : Revenus - Dépenses = Profit. Une bonne marge nette est au-dessus de 20%.</HelpText>
      <HelpText icon="💡">Conseils importants: 1) Notez TOUTES vos dépenses, même les petites — elles s'accumulent vite! 2) Séparez l'argent du business et l'argent personnel. 3) Gardez toujours un fonds de roulement pour les urgences. 4) Exportez vos rapports en PDF chaque mois pour vos archives.</HelpText>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h1 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:22, fontWeight:800 }}>⊛ Comptabilité</h1>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-ghost" onClick={() => { showToast("Génération PDF en cours...", "info"); generatePDF("accounting-content", "Comptabilite.pdf"); }}>📥 Export PDF</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>➕ Dépense</button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom:20 }}>
        {[["cashbook","📒 Journal"],["expenses","💸 Dépenses"],["reports","📊 Rapports"],["taxes","🏛️ Taxes"]].map(([k,l]) => (
          <div key={k} className={`tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      {tab==="cashbook" && (
        <>
          {/* Cashflow Visual */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:16 }}>
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:10 }}>📈 Flux Entrant</div>
              <SparkLine data={cashbook.filter(e=>e.type==="in").slice(0,10).map(e=>e.amount)} width={180} height={50} color="#16C55E" />
              <div style={{ marginTop:8, fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:18, color:"#16C55E" }}>+{fmt(totalRev)}</div>
              <div style={{ fontSize:11, color:"#7B91C4" }}>{cashbook.filter(e=>e.type==="in").length} entrées</div>
            </div>
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:10 }}>📉 Flux Sortant</div>
              <SparkLine data={cashbook.filter(e=>e.type==="out").slice(0,10).map(e=>e.amount)} width={180} height={50} color="#D42B3A" />
              <div style={{ marginTop:8, fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:18, color:"#D42B3A" }}>-{fmt(totalExp)}</div>
              <div style={{ fontSize:11, color:"#7B91C4" }}>{cashbook.filter(e=>e.type==="out").length} sorties</div>
            </div>
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:10 }}>💰 Dépenses par Catégorie</div>
              {(() => {
                const cats = {};
                data.expenses.filter(e=>e.status==="approved").forEach(e => { cats[e.category] = (cats[e.category]||0) + e.amount; });
                const entries = Object.entries(cats).sort((a,b) => b[1]-a[1]);
                const colors = ["#1A56FF","#D42B3A","#F5C518","#16C55E","#25D366","#7B91C4"];
                const total = entries.reduce((s,e)=>s+e[1],0) || 1;
                return (
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <DonutChart segments={entries.map((e,i) => ({ value:(e[1]/total)*100, color:colors[i%colors.length] }))} size={80} strokeWidth={10} centerValue={entries.length+""} centerLabel="catég." />
                    <div style={{ flex:1 }}>
                      {entries.map((e,i) => (
                        <div key={e[0]} style={{ display:"flex", alignItems:"center", gap:6, padding:"2px 0", fontSize:10 }}>
                          <div style={{ width:6, height:6, borderRadius:2, background:colors[i%colors.length] }} />
                          <span style={{ flex:1, color:"#7B91C4" }}>{e[0]}</span>
                          <span style={{ fontWeight:700 }}>{fmt(e[1])}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
          <div className="card card-pad">
            <div style={{ overflowX:"auto" }}>
              <table className="data-table">
                <thead><tr><th>Date</th><th>Description</th><th>Type</th><th>Montant</th></tr></thead>
                <tbody>
                  {cashbook.slice(0,20).map((e,i) => (
                    <tr key={i} onClick={() => setSelectedTx(e)} style={{ cursor:"pointer" }}>
                      <td style={{ color:"#7B91C4", fontSize:12 }}>{e.date}</td>
                      <td style={{ fontWeight:500 }}>{e.desc}</td>
                      <td><span className="tag" style={{ background:e.type==="in"?"rgba(22,197,94,0.12)":"rgba(212,43,58,0.12)", color:e.type==="in"?"#16C55E":"#D42B3A" }}>{e.type==="in"?"📈 Entrée":"📉 Sortie"}</span></td>
                      <td style={{ fontWeight:700, color:e.type==="in"?"#16C55E":"#D42B3A" }}>{e.type==="in"?"+":"-"}{fmt(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction Detail Modal */}
          {selectedTx && (
            <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)" }} onClick={() => setSelectedTx(null)} />
              <div className="card" style={{ position:"relative", zIndex:1, width:"100%", maxWidth:480, padding:28, animation:"fadeUp .25s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                  <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:20, display:"flex", alignItems:"center", gap:8 }}>
                    {selectedTx.type==="in" ? "📈" : "📉"} Détails Transaction
                  </h2>
                  <button className="btn btn-ghost" onClick={() => setSelectedTx(null)} style={{ fontSize:18 }}>✕</button>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  <div>
                    <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Date</div>
                    <div style={{ fontWeight:600 }}>{selectedTx.date}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Type</div>
                    <span className="tag" style={{ background:selectedTx.type==="in"?"rgba(22,197,94,0.12)":"rgba(212,43,58,0.12)", color:selectedTx.type==="in"?"#16C55E":"#D42B3A" }}>
                      {selectedTx.type==="in"?"Entrée":"Sortie"}
                    </span>
                  </div>
                  <div style={{ gridColumn:"1/-1" }}>
                    <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Description</div>
                    <div style={{ fontWeight:600 }}>{selectedTx.desc}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Montant</div>
                    <div style={{ fontWeight:800, fontSize:22, color:selectedTx.type==="in"?"#16C55E":"#D42B3A" }}>
                      {selectedTx.type==="in"?"+":"-"}{fmt(selectedTx.amount)}
                    </div>
                  </div>

                  {selectedTx.source === "sale" && selectedTx.detail && (
                    <>
                      <div>
                        <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Client</div>
                        <div style={{ fontWeight:600 }}>{selectedTx.detail.client_name}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Produit</div>
                        <div style={{ fontWeight:600 }}>{selectedTx.detail.product_name}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Quantité</div>
                        <div style={{ fontWeight:600 }}>{selectedTx.detail.quantity}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Prix Unitaire</div>
                        <div style={{ fontWeight:600 }}>{fmt(selectedTx.detail.unit_price)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Profit</div>
                        <div style={{ fontWeight:700, color:"#16C55E" }}>+{fmt(selectedTx.detail.profit)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Paiement</div>
                        <div style={{ fontWeight:600 }}>{payIcons[selectedTx.detail.payment_method]||""} {selectedTx.detail.payment_method}</div>
                      </div>
                      {selectedTx.detail.exchange_rate && (
                        <div>
                          <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Taux Change</div>
                          <div style={{ fontWeight:600 }}>1 USD = {selectedTx.detail.exchange_rate.toLocaleString()} FC</div>
                        </div>
                      )}
                      {selectedTx.detail.total_cdf && (
                        <div>
                          <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Total CDF</div>
                          <div style={{ fontWeight:700, color:"#F5C518" }}>{selectedTx.detail.total_cdf.toLocaleString()} FC</div>
                        </div>
                      )}
                    </>
                  )}

                  {selectedTx.source === "expense" && selectedTx.detail && (
                    <>
                      <div>
                        <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Catégorie</div>
                        <div style={{ fontWeight:600 }}>{selectedTx.detail.category}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:1, marginBottom:4 }}>Statut</div>
                        <span className="tag" style={{ background: statusMeta[selectedTx.detail.status]?.bg, color: statusMeta[selectedTx.detail.status]?.color }}>
                          {statusMeta[selectedTx.detail.status]?.label || selectedTx.detail.status}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab==="expenses" && (
        <>
          {/* Expense breakdown visual */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:14 }}>📊 Répartition Dépenses</div>
              {(() => {
                const cats = {};
                data.expenses.forEach(e => { cats[e.category] = (cats[e.category]||0) + e.amount; });
                const entries = Object.entries(cats).sort((a,b) => b[1]-a[1]);
                const maxV = entries[0]?.[1] || 1;
                const colors = ["#1A56FF","#D42B3A","#F5C518","#16C55E","#25D366","#7B91C4"];
                return entries.map((e,i) => (
                  <div key={e[0]} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                      <span style={{ fontWeight:600 }}>{e[0]}</span>
                      <span style={{ fontWeight:700, color:colors[i%colors.length] }}>{fmt(e[1])}</span>
                    </div>
                    <div className="progress" style={{ height:8 }}>
                      <div className="progress-fill" style={{ width:`${(e[1]/maxV)*100}%`, background:colors[i%colors.length] }} />
                    </div>
                  </div>
                ));
              })()}
            </div>
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:14 }}>📈 Statut des Dépenses</div>
              {(() => {
                const approved = data.expenses.filter(e=>e.status==="approved").length;
                const pending = data.expenses.filter(e=>e.status==="pending").length;
                const total = data.expenses.length || 1;
                return (
                  <>
                    <DonutChart segments={[
                      { value:(approved/total)*100, color:"#16C55E" },
                      { value:(pending/total)*100, color:"#F5C518" },
                    ]} size={100} strokeWidth={14} centerValue={total+""} centerLabel="dépenses" />
                    <div style={{ display:"flex", gap:16, marginTop:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:8, height:8, borderRadius:2, background:"#16C55E" }} /><span style={{ fontSize:12, color:"#7B91C4" }}>Approuvées: {approved}</span></div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}><div style={{ width:8, height:8, borderRadius:2, background:"#F5C518" }} /><span style={{ fontSize:12, color:"#7B91C4" }}>En attente: {pending}</span></div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          <div className="card card-pad">
            <table className="data-table">
              <thead><tr><th>Description</th><th>Catégorie</th><th>Montant</th><th>Date</th><th>Statut</th></tr></thead>
              <tbody>
                {data.expenses.map(e => (
                  <tr key={e.id}>
                    <td style={{ fontWeight:500 }}>{e.description}</td>
                    <td><span style={{ fontSize:12, color:"#7B91C4" }}>{e.category}</span></td>
                    <td style={{ color:"#D42B3A", fontWeight:700 }}>{fmt(e.amount)}</td>
                    <td style={{ color:"#7B91C4", fontSize:12 }}>{e.expense_date}</td>
                    <td><Tag status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab==="reports" && (
        <>
          {/* P&L Visual */}
          <div className="card card-pad" style={{ marginBottom:16 }}>
            <div className="sec-title" style={{ marginBottom:16 }}>📊 Compte de Résultat (P&L)</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr auto 1fr", gap:12, alignItems:"center", textAlign:"center" }}>
              <div style={{ padding:16, background:"rgba(22,197,94,0.06)", borderRadius:12, border:"1px solid rgba(22,197,94,0.15)" }}>
                <div style={{ fontSize:11, color:"#7B91C4", marginBottom:4 }}>Revenus</div>
                <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:24, color:"#16C55E" }}>{fmt(totalRev)}</div>
              </div>
              <div style={{ fontSize:20, color:"#7B91C4" }}>−</div>
              <div style={{ padding:16, background:"rgba(212,43,58,0.06)", borderRadius:12, border:"1px solid rgba(212,43,58,0.15)" }}>
                <div style={{ fontSize:11, color:"#7B91C4", marginBottom:4 }}>Dépenses</div>
                <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:24, color:"#D42B3A" }}>{fmt(totalExp)}</div>
              </div>
              <div style={{ fontSize:20, color:"#7B91C4" }}>=</div>
              <div style={{ padding:16, background: netProfit >= 0 ? "rgba(26,86,255,0.06)" : "rgba(212,43,58,0.06)", borderRadius:12, border:`1px solid ${netProfit>=0?"rgba(26,86,255,0.15)":"rgba(212,43,58,0.15)"}` }}>
                <div style={{ fontSize:11, color:"#7B91C4", marginBottom:4 }}>Profit Net</div>
                <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:24, color: netProfit>=0?"#1A56FF":"#D42B3A" }}>{fmt(netProfit)}</div>
              </div>
            </div>
            <div style={{ marginTop:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6, color:"#7B91C4" }}>
                <span>Marge nette</span>
                <span style={{ fontWeight:700, color: netProfit/totalRev > 0.2 ? "#16C55E" : "#F5C518" }}>{totalRev > 0 ? ((netProfit/totalRev)*100).toFixed(1) : 0}%</span>
              </div>
              <div className="progress" style={{ height:10 }}>
                <div className="progress-fill" style={{ width:`${totalRev > 0 ? Math.min((netProfit/totalRev)*100,100) : 0}%`, background:"linear-gradient(90deg, #1A56FF, #16C55E)" }} />
              </div>
            </div>
          </div>

          <div className="g2">
            {[["📊 P&L Mensuel","Revenus vs Dépenses","Février 2025"],["🧾 Bilan","Actifs et passifs","2025"],["💹 Flux de trésorerie","Entrées et sorties","Trim. 1"],["📈 Croissance","Évolution revenus","12 mois"]].map(([t,d,p]) => (
              <div key={t} className="card card-pad card-hover" style={{ cursor:"pointer" }} onClick={() => showToast(`Rapport ${t} généré!`, "info")}>
                <div style={{ fontSize:28, marginBottom:10 }}>{t.slice(0,2)}</div>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{t.slice(3)}</div>
                <div style={{ fontSize:12, color:"#7B91C4", marginBottom:8 }}>{d}</div>
                <div style={{ fontSize:11, color:"#1A56FF", fontWeight:600 }}>{p} →</div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab==="taxes" && (
        <div className="card card-pad" style={{ textAlign:"center", padding:40 }}>
          <div style={{ fontSize:48, marginBottom:12 }}>🏛️</div>
          <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:20, fontWeight:800, marginBottom:8 }}>Gestion Fiscale DRC</div>
          <div style={{ fontSize:13, color:"#7B91C4", marginBottom:20 }}>TVA 16% · Impôts DGI · Déclarations automatiques</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:20 }}>
            <div style={{ padding:14, background:"rgba(26,86,255,0.06)", borderRadius:10, border:"1px solid rgba(26,86,255,0.15)" }}>
              <div style={{ fontSize:11, color:"#7B91C4", marginBottom:4 }}>TVA collectée</div>
              <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:18, color:"#1A56FF" }}>{fmt(totalRev * 0.16)}</div>
            </div>
            <div style={{ padding:14, background:"rgba(212,43,58,0.06)", borderRadius:10, border:"1px solid rgba(212,43,58,0.15)" }}>
              <div style={{ fontSize:11, color:"#7B91C4", marginBottom:4 }}>TVA déductible</div>
              <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:18, color:"#D42B3A" }}>{fmt(totalExp * 0.16)}</div>
            </div>
            <div style={{ padding:14, background:"rgba(22,197,94,0.06)", borderRadius:10, border:"1px solid rgba(22,197,94,0.15)" }}>
              <div style={{ fontSize:11, color:"#7B91C4", marginBottom:4 }}>TVA à payer</div>
              <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:18, color:"#16C55E" }}>{fmt((totalRev - totalExp) * 0.16)}</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => showToast("Module fiscal ouvert!", "info")}>🏛️ Déclarer TVA</button>
        </div>
      )}

      {showAdd && (
        <Modal title="➕ Nouvelle Dépense" onClose={() => setShowAdd(false)}>
          {[["Description","description","text"],["Montant ($)","amount","number"],["Date","expense_date","date"]].map(([l,k,t]) => (
            <div className="form-group" key={k}><label className="form-label">{l}</label><input type={t} value={newExp[k]} onChange={e => setNewExp(p => ({...p,[k]:e.target.value}))} placeholder={l} /></div>
          ))}
          <div className="form-group"><label className="form-label">Catégorie</label>
            <select value={newExp.category} onChange={e => setNewExp(p => ({...p,category:e.target.value}))}>
              {["Transport","RH","Immobilier","Communication","Utilités","Marketing","Autre"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={() => {
            setData(d => ({ ...d, expenses: [...d.expenses, { ...newExp, id:Date.now(), amount:Number(newExp.amount) }] }));
            showToast("Dépense ajoutée!", "success"); setShowAdd(false);
          }}>➕ Ajouter Dépense</button>
        </Modal>
      )}
    </div>
  );
}

// ─── PERSONAL FINANCE PAGE ─────────────────────────────────────────────────────
function PersonalPage({ data, setData, showToast, kpiGoals, updateGoal }) {
  const [tab, setTab] = useState("overview");
  const [goals, setGoals] = useState([
    { id:1,name:"Fonds d'urgence",   emoji:"🛡️",target:5000, current:2200 },
    { id:2,name:"Voiture",            emoji:"🚗",target:15000,current:4500 },
    { id:3,name:"Investissement",     emoji:"📈",target:10000,current:1800 },
    { id:4,name:"Vacances famille",   emoji:"✈️",target:3000, current:900  },
  ]);

  // Editable state
  const [income, setIncome] = useState(3200);
  const [editingIncome, setEditingIncome] = useState(false);
  const [tempIncome, setTempIncome] = useState(3200);
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null); // goal object or "new"
  const [tempGoal, setTempGoal] = useState({ name:"", emoji:"🎯", target:0, current:0 });
  const [editingCategory, setEditingCategory] = useState(null); // index
  const [tempCategory, setTempCategory] = useState({ name:"", budget:0, spent:0 });

  const totalIncome   = income;
  const totalPersonal = data.budget.spent;
  const savingsRate   = (((totalIncome-totalPersonal)/totalIncome)*100).toFixed(0);

  const budgetUsed = (data.budget.spent / data.budget.monthly) * 100;
  const remaining = data.budget.monthly - data.budget.spent;
  const totalGoalsSaved = goals.reduce((s,g) => s + g.current, 0);
  const totalGoalsTarget = goals.reduce((s,g) => s + g.target, 0);

  // Budget donut segments
  const budgetSegments = data.budget.categories.map((c, i) => {
    const colors = ["#1A56FF","#D42B3A","#F5C518","#16C55E","#25D366","#7B91C4"];
    return { value: (c.spent / data.budget.spent) * 100, color: colors[i % colors.length], label: c.name, amount: c.spent };
  });

  const saveIncome = () => { setIncome(Number(tempIncome)); setEditingIncome(false); showToast("✅ Revenus mis à jour!", "success"); };
  const saveBudgetTotal = () => { setData(d => ({ ...d, budget: { ...d.budget, monthly: Number(tempBudget) } })); setEditingBudget(false); showToast("✅ Budget mensuel mis à jour!", "success"); };
  const saveGoal = () => {
    if (!tempGoal.name) return showToast("Nom requis", "error");
    if (editingGoal === "new") {
      setGoals(prev => [...prev, { ...tempGoal, id: Date.now(), target: Number(tempGoal.target), current: Number(tempGoal.current) }]);
      showToast("✅ Objectif ajouté!", "success");
    } else {
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? { ...tempGoal, id: g.id, target: Number(tempGoal.target), current: Number(tempGoal.current) } : g));
      showToast("✅ Objectif modifié!", "success");
    }
    setEditingGoal(null);
  };
  const deleteGoal = (id) => { setGoals(prev => prev.filter(g => g.id !== id)); showToast("Objectif supprimé", "info"); };
  const saveCategory = () => {
    if (!tempCategory.name) return showToast("Nom requis", "error");
    setData(d => {
      const cats = [...d.budget.categories];
      if (editingCategory === "new") {
        cats.push({ name: tempCategory.name, budget: Number(tempCategory.budget), spent: Number(tempCategory.spent) });
      } else {
        cats[editingCategory] = { name: tempCategory.name, budget: Number(tempCategory.budget), spent: Number(tempCategory.spent) };
      }
      const newSpent = cats.reduce((s,c) => s + c.spent, 0);
      return { ...d, budget: { ...d.budget, categories: cats, spent: newSpent } };
    });
    setEditingCategory(null); showToast("✅ Catégorie sauvegardée!", "success");
  };

  return (
    <div className="page-bg page-content fade-in">
      {/* Hero: Budget Health */}
      <HeroBanner
        label="SANTÉ FINANCIÈRE DU MOIS"
        value={fmt(remaining)}
        subtitle={remaining >= 0 ? "💚 Il vous reste ce montant à dépenser ce mois" : "🔴 Vous avez dépassé votre budget!"}
        progress={Math.min(budgetUsed, 100)}
        progressLabel={`${fmt(data.budget.spent)} dépensés sur ${fmt(data.budget.monthly)}`}
        progressColor={budgetUsed > 90 ? "linear-gradient(90deg, #F5C518, #D42B3A)" : budgetUsed > 70 ? "linear-gradient(90deg, #1A56FF, #F5C518)" : undefined}
        trend={savingsRate + "% épargné"}
        trendUp={Number(savingsRate) > 0}
        icon="🏦"
      >
        {/* Pedagogic flow: Income → Expenses → Savings */}
        <div style={{ display:"flex", gap:12, marginTop:16, paddingTop:14, borderTop:"1px solid rgba(26,86,255,0.1)", flexWrap:"wrap", justifyContent:"center" }}>
          <div style={{ flex:"1 1 80px", textAlign:"center", cursor:"pointer", padding:"6px 4px", borderRadius:8, transition:"background 0.18s" }} onClick={() => { setTempIncome(income); setEditingIncome(true); }}>
            <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:0.5, marginBottom:2 }}>Revenus ✏️</div>
            <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:18, color:"#16C55E" }}>{fmt(totalIncome)}</div>
          </div>
          <div style={{ fontSize:20, color:"#7B91C4", display:"flex", alignItems:"center" }}>→</div>
          <div style={{ flex:"1 1 80px", textAlign:"center", cursor:"pointer", padding:"6px 4px", borderRadius:8 }} onClick={() => { setTempBudget(data.budget.monthly); setEditingBudget(true); }}>
            <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:0.5, marginBottom:2 }}>Dépenses ✏️</div>
            <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:18, color:"#D42B3A" }}>{fmt(totalPersonal)}</div>
          </div>
          <div style={{ fontSize:20, color:"#7B91C4", display:"flex", alignItems:"center" }}>→</div>
          <div style={{ flex:"1 1 80px", textAlign:"center", padding:"6px 4px" }}>
            <div style={{ fontSize:10, color:"#7B91C4", textTransform:"uppercase", letterSpacing:0.5, marginBottom:2 }}>Épargne</div>
            <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:18, color:"#1A56FF" }}>{fmt(totalIncome - totalPersonal)}</div>
          </div>
        </div>
      </HeroBanner>

      <div className="mini-kpi-grid">
        <MiniKpiCard icon="💵" label="Revenus" value={fmt(totalIncome)} trend="+8%" trendUp={true} color="#1A56FF" />
        <MiniKpiCard icon="💸" label="Dépensé" value={fmt(totalPersonal)} trend="+3%" trendUp={false} color="#D42B3A" />
        <MiniKpiCard icon="🏦" label="Épargne" value={savingsRate+"%"} trend="+2%" trendUp={true} color="#16C55E" />
        <MiniKpiCard icon="📱" label="M-PESA" value="+$320" color="#25D366" />
      </div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <h1 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:22, fontWeight:800 }}>◷ Finance Personnelle</h1>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-ghost" onClick={() => showToast("Synchronisation...", "info")}>🔄 Sync</button>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom:20 }}>
        {[["overview","📊 Vue d'ensemble"],["budget","🎯 Budget"],["goals","🎯 Objectifs"],["debts","⚠️ Dettes"]].map(([k,l]) => (
          <div key={k} className={`tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      {tab==="overview" && (
        <>
          <div className="g2" style={{ marginBottom:16 }}>
            {/* Budget Donut */}
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:16 }}>📊 Où va votre argent?</div>
              <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap", justifyContent:"center" }}>
                <DonutChart
                  segments={budgetSegments}
                  size={130}
                  strokeWidth={16}
                  centerValue={budgetUsed.toFixed(0)+"%"}
                  centerLabel="utilisé"
                />
                <div style={{ flex:"1 1 140px", minWidth:0 }}>
                  {data.budget.categories.map((c, i) => {
                    const colors = ["#1A56FF","#D42B3A","#F5C518","#16C55E","#25D366","#7B91C4"];
                    const over = c.spent > c.budget;
                    return (
                      <div key={c.name} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 0", borderBottom:"1px solid rgba(26,86,255,0.06)", cursor:"pointer" }}
                        onClick={() => { setEditingCategory(i); setTempCategory({ name:c.name, budget:c.budget, spent:c.spent }); }}>
                        <div style={{ width:10, height:10, borderRadius:3, background:colors[i%colors.length], flexShrink:0 }} />
                        <div style={{ flex:1, fontSize:12, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</div>
                        <div style={{ fontSize:12, fontWeight:700, color: over ? "#D42B3A" : "#7B91C4" }}>{fmt(c.spent)}</div>
                        <span style={{ fontSize:10, color:"#7B91C4", opacity:0.6 }}>✏️</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginTop:14, padding:"10px 14px", background:"rgba(26,86,255,0.04)", borderRadius:10, border:"1px solid rgba(26,86,255,0.08)" }}>
                <div style={{ fontSize:11, color:"#7B91C4", lineHeight:1.6 }}>
                  💡 <strong>Astuce:</strong> La règle <strong>50/30/20</strong> — 50% besoins, 30% envies, 20% épargne. Votre taux d'épargne est de <strong style={{ color: Number(savingsRate) >= 20 ? "#16C55E" : "#F5C518" }}>{savingsRate}%</strong>.
                </div>
              </div>
            </div>

            {/* Income vs Expense trend */}
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:16 }}>📈 Tendance Mensuelle</div>
              <div style={{ marginBottom:16 }}>
                <SparkLine data={[2800,2600,3000,2900,3100,3200,3200]} width={Math.min(280, 260)} height={60} color="#16C55E" />
                <div style={{ fontSize:11, color:"#7B91C4", marginTop:6 }}>↗ Revenus en hausse constante ces 7 derniers mois</div>
              </div>
              <div style={{ marginBottom:16 }}>
                <SparkLine data={[1800,1900,1850,1700,1950,1920,1950]} width={Math.min(280, 260)} height={40} color="#D42B3A" />
                <div style={{ fontSize:11, color:"#7B91C4", marginTop:4 }}>⚡ Dépenses stables — bon signe!</div>
              </div>

              {/* AI Insights */}
              <div className="sec-title" style={{ marginBottom:10, fontSize:13 }}>💡 Conseils Personnalisés</div>
              <InsightCard icon="🔴" iconBg="rgba(212,43,58,0.12)" title="Loisirs: +$70 au-dessus du budget" description="Vous avez dépensé $220 au lieu de $150. Essayez de limiter les sorties la dernière semaine." />
              <InsightCard icon="🟡" iconBg="rgba(245,197,24,0.12)" title={`Épargne: ${savingsRate}% — Objectif 20%`} description="Augmentez votre virement automatique de $50/mois pour atteindre l'objectif." action="Ajuster" onAction={() => { setTempIncome(income); setEditingIncome(true); }} />
              <InsightCard icon="🟢" iconBg="rgba(22,197,94,0.12)" title="Alimentation: Sous contrôle!" description="$350 dépensés sur un budget de $400. Excellent travail ce mois!" />
            </div>
          </div>

          {/* Mobile Money */}
          <div className="card card-pad">
            <div className="sec-title" style={{ marginBottom:14 }}>📱 Comptes Mobile Money</div>
            <div className="g3">
              {[["M-PESA","💚","#25D366",320,[280,310,290,320,300,350,320]],["Airtel Money","🔴","#D42B3A",180,[150,160,170,180,190,175,180]],["Orange Money","🟠","#F5C518",450,[400,380,420,430,440,460,450]]].map(([n,ico,c,a,trend]) => (
                <div key={n} className="card card-pad-sm" style={{ borderColor:`${c}30` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                    <div style={{ width:32, height:32, borderRadius:"50%", background:`${c}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>{ico}</div>
                    <span style={{ fontWeight:600, fontSize:13 }}>{n}</span>
                  </div>
                  <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:22, color:c, marginBottom:4 }}>+{fmt(a)}</div>
                  <SparkLine data={trend} width={100} height={28} color={c} />
                  <div style={{ fontSize:10, color:"#7B91C4", marginTop:4 }}>Ce mois</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab==="goals" && (
        <>
          {/* Goals progress overview */}
          <div className="card card-pad" style={{ marginBottom:16 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:8 }}>
              <div className="sec-title">🎯 Progression Globale de vos Objectifs</div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, color:"#1A56FF" }}>{fmt(totalGoalsSaved)} / {fmt(totalGoalsTarget)}</div>
                <button className="btn btn-primary" style={{ fontSize:11, padding:"6px 12px" }} onClick={() => { setEditingGoal("new"); setTempGoal({ name:"", emoji:"🎯", target:0, current:0 }); }}>➕ Objectif</button>
              </div>
            </div>
            <div className="hero-progress" style={{ height:12 }}>
              <div className="hero-progress-fill" style={{ width:`${(totalGoalsSaved/totalGoalsTarget*100)}%` }} />
            </div>
            <div style={{ fontSize:12, color:"#7B91C4", marginTop:8 }}>
              💡 Vous avez épargné <strong style={{ color:"#16C55E" }}>{(totalGoalsSaved/totalGoalsTarget*100).toFixed(0)}%</strong> de vos objectifs totaux. {totalGoalsSaved/totalGoalsTarget < 0.5 ? "Continuez, chaque petit montant compte!" : "Excellent travail, vous y êtes presque!"}
            </div>
          </div>
          <div className="g2">
            {goals.map(g => {
              const p = Math.min((g.current/g.target)*100,100);
              const monthsLeft = Math.ceil((g.target - g.current) / (g.current > 0 ? g.current / 6 : 100));
              return (
                <div key={g.id} className="card card-pad">
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                    <div style={{ width:48, height:48, borderRadius:12, background:"rgba(26,86,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>{g.emoji}</div>
                    <div style={{ flex:1 }}><div style={{ fontWeight:700 }}>{g.name}</div><div style={{ fontSize:11, color:"#7B91C4" }}>Objectif: {fmt(g.target)}</div></div>
                    <DonutChart segments={[{ value: p, color: p>80?"#16C55E":p>50?"#1A56FF":"#F5C518" }]} size={56} strokeWidth={7} centerValue={p.toFixed(0)+"%"} />
                  </div>
                  <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:24, fontWeight:800, color:"#1A56FF", marginBottom:4 }}>{fmt(g.current)}</div>
                  <div style={{ fontSize:11, color:"#7B91C4", marginBottom:10 }}>
                    Il reste <strong>{fmt(g.target-g.current)}</strong> · ~{monthsLeft} mois au rythme actuel
                  </div>
                  <div className="progress" style={{ height:8, marginBottom:8 }}>
                    <div className="progress-fill" style={{ width:`${p}%`, background:p>80?"#16C55E":p>50?"#1A56FF":"#F5C518" }} />
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                    <span style={{ fontSize:11, color:"#7B91C4" }}>{p.toFixed(0)}% atteint</span>
                    <div style={{ display:"flex", gap:6 }}>
                      <button style={{ background:"none", border:"none", color:"#1A56FF", cursor:"pointer", fontSize:11, fontWeight:700 }}
                        onClick={() => { setGoals(prev => prev.map(x => x.id===g.id?{...x,current:Math.min(x.current+100,x.target)}:x)); showToast(`+$100 ajouté à "${g.name}"!`,"success"); }}>
                        + $100
                      </button>
                      <button style={{ background:"none", border:"none", color:"#F5C518", cursor:"pointer", fontSize:11, fontWeight:700 }}
                        onClick={() => { setEditingGoal(g); setTempGoal({ name:g.name, emoji:g.emoji, target:g.target, current:g.current }); }}>
                        ✏️ Modifier
                      </button>
                      <button style={{ background:"none", border:"none", color:"#D42B3A", cursor:"pointer", fontSize:11, fontWeight:700 }}
                        onClick={() => deleteGoal(g.id)}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab==="budget" && (
        <div className="g2" style={{ gridTemplateColumns:"1fr", maxWidth:"100%" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:16 }}>
            <div className="card card-pad" style={{ minWidth:0 }}>
              <div className="sec-head" style={{ flexWrap:"wrap", gap:8 }}>
                <div className="sec-title">🎯 Budget Mensuel par Catégorie</div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="btn btn-ghost" style={{ fontSize:11, padding:"5px 10px" }} onClick={() => { setTempBudget(data.budget.monthly); setEditingBudget(true); }}>✏️ Budget: {fmt(data.budget.monthly)}</button>
                  <button className="btn btn-primary" style={{ fontSize:11, padding:"5px 10px" }} onClick={() => { setEditingCategory("new"); setTempCategory({ name:"", budget:0, spent:0 }); }}>➕</button>
                </div>
              </div>
              {data.budget.categories.map((c, i) => {
                const over = c.spent > c.budget;
                const pct2 = Math.min((c.spent/c.budget)*100, 100);
                const colors = ["#1A56FF","#D42B3A","#F5C518","#16C55E","#25D366"];
                const emojis = ["🍽️","🚗","🏠","🎮","💰"];
                return (
                  <div key={c.name} style={{ marginBottom:18, cursor:"pointer" }} onClick={() => { setEditingCategory(i); setTempCategory({ name:c.name, budget:c.budget, spent:c.spent }); }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, alignItems:"center" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span>{emojis[i] || "📋"}</span>
                        <span style={{ fontWeight:600, fontSize:13 }}>{c.name}</span>
                        <span style={{ fontSize:10, color:"#7B91C4", opacity:0.5 }}>✏️</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:12, fontWeight:700, color: over?"#D42B3A":"#7B91C4" }}>{fmt(c.spent)}</span>
                        <span style={{ fontSize:11, color:"#7B91C4" }}>/ {fmt(c.budget)}</span>
                      </div>
                    </div>
                    <div className="progress" style={{ height:8 }}>
                      <div className="progress-fill" style={{ width:`${pct2}%`, background: over?"#D42B3A":pct2>80?colors[i%colors.length]+"CC":colors[i%colors.length] }} />
                    </div>
                    {over && (
                      <div style={{ fontSize:10, color:"#D42B3A", marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
                        ⚠️ Dépassé de {fmt(c.spent-c.budget)} — {((c.spent/c.budget-1)*100).toFixed(0)}% au-dessus
                      </div>
                    )}
                    {!over && pct2 > 80 && (
                      <div style={{ fontSize:10, color:"#F5C518", marginTop:4 }}>
                        ⚡ Attention: {(100-pct2).toFixed(0)}% restant ({fmt(c.budget-c.spent)})
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right: Summary */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div className="card card-pad" style={{ textAlign:"center" }}>
                <DonutChart
                  segments={[
                    { value: (data.budget.spent/data.budget.monthly)*100, color: budgetUsed > 90 ? "#D42B3A" : "#1A56FF" },
                  ]}
                  size={140}
                  strokeWidth={18}
                  centerValue={fmt(remaining)}
                  centerLabel="restant"
                />
                <div style={{ marginTop:14, fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:16 }}>
                  {budgetUsed > 100 ? "🔴 Budget dépassé!" : budgetUsed > 90 ? "🟡 Presque épuisé" : budgetUsed > 70 ? "🟢 En bonne voie" : "✅ Excellent contrôle"}
                </div>
                <div style={{ fontSize:12, color:"#7B91C4", marginTop:4, lineHeight:1.6 }}>
                  {budgetUsed > 100
                    ? `Vous avez dépensé ${fmt(data.budget.spent - data.budget.monthly)} de plus que prévu.`
                    : `Il vous reste ${fmt(remaining)} pour les ${30 - new Date().getDate()} jours restants, soit ~${fmt(remaining / Math.max(30 - new Date().getDate(), 1))}/jour.`
                  }
                </div>
              </div>

              <div className="card card-pad-sm" style={{ background:"rgba(26,86,255,0.04)", borderColor:"rgba(26,86,255,0.15)" }}>
                <div style={{ fontSize:12, fontWeight:700, color:"#1A56FF", marginBottom:8 }}>📚 Le saviez-vous?</div>
                <div style={{ fontSize:12, color:"#7B91C4", lineHeight:1.7 }}>
                  La <strong>règle 50/30/20</strong> est simple:<br/>
                  • <strong>50%</strong> pour les besoins (loyer, nourriture)<br/>
                  • <strong>30%</strong> pour les envies (loisirs, sorties)<br/>
                  • <strong>20%</strong> pour l'épargne et les dettes<br/><br/>
                  Sur vos {fmt(totalIncome)}, visez {fmt(totalIncome*0.2)} d'épargne minimum.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab==="debts" && (
        <>
          <div className="card card-pad" style={{ marginBottom:16 }}>
            <div className="sec-title" style={{ marginBottom:8 }}>📊 Vue d'ensemble de vos Dettes</div>
            <div style={{ fontSize:12, color:"#7B91C4", marginBottom:14, lineHeight:1.6 }}>
              💡 <strong>Stratégie avalanche:</strong> Remboursez d'abord la dette au taux le plus élevé pour économiser sur les intérêts. Ou utilisez la <strong>stratégie boule de neige:</strong> commencez par la plus petite dette pour la satisfaction rapide.
            </div>
            <div className="g3">
              {[["Total Restant",fmt(3400),"#D42B3A","rgba(212,43,58,0.06)","rgba(212,43,58,0.15)"],["Déjà Remboursé",fmt(2800),"#16C55E","rgba(22,197,94,0.06)","rgba(22,197,94,0.15)"],["Paiement/Mois",fmt(450),"#1A56FF","rgba(26,86,255,0.06)","rgba(26,86,255,0.15)"]].map(([l,v,c,bg,bc]) => (
                <div key={l} style={{ padding:14, background:bg, borderRadius:10, border:`1px solid ${bc}`, textAlign:"center" }}>
                  <div style={{ fontSize:11, color:"#7B91C4", marginBottom:4 }}>{l}</div>
                  <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:22, color:c }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {[{name:"Prêt Banque",total:5000,remaining:2800,monthly:250,rate:"12%",emoji:"🏦",tip:"Priorité #1 — taux élevé. Envisagez un paiement supplémentaire."},{name:"Crédit Fournisseur",total:1200,remaining:600,monthly:200,rate:"0%",emoji:"📦",tip:"Pas d'intérêts! Maintenez les paiements réguliers."}].map(d => (
              <div key={d.name} className="card card-pad" style={{ borderColor:"rgba(212,43,58,0.2)" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12, flexWrap:"wrap", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontSize:28 }}>{d.emoji}</span>
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>{d.name}</div>
                      <div style={{ fontSize:11, color:"#7B91C4" }}>Taux: {d.rate} · {fmt(d.monthly)}/mois</div>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:20, color:"#D42B3A" }}>{fmt(d.remaining)}</div>
                    <div style={{ fontSize:10, color:"#7B91C4" }}>/ {fmt(d.total)}</div>
                  </div>
                </div>
                <div className="progress" style={{ height:8 }}><div className="progress-fill" style={{ width:`${((d.total-d.remaining)/d.total)*100}%`, background:"#16C55E" }} /></div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                  <span style={{ fontSize:11, color:"#16C55E", fontWeight:600 }}>{((d.total-d.remaining)/d.total*100).toFixed(0)}% remboursé</span>
                  <span style={{ fontSize:11, color:"#7B91C4" }}>~{Math.ceil(d.remaining / d.monthly)} mois restants</span>
                </div>
                <div style={{ marginTop:8, padding:"8px 12px", background:"rgba(245,197,24,0.06)", borderRadius:8, border:"1px solid rgba(245,197,24,0.12)" }}>
                  <div style={{ fontSize:11, color:"#F5C518" }}>💡 {d.tip}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── EDIT INCOME MODAL ── */}
      {editingIncome && (
        <Modal title="✏️ Modifier vos Revenus Mensuels" onClose={() => setEditingIncome(false)}>
          <div style={{ padding:"12px 14px", background:"rgba(26,86,255,0.04)", borderRadius:10, border:"1px solid rgba(26,86,255,0.1)", marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#7B91C4", lineHeight:1.6 }}>💡 Entrez votre revenu mensuel total (salaires, revenus business, etc.)</div>
          </div>
          <div className="form-group"><label className="form-label">Montant ($)</label>
            <input type="number" value={tempIncome} onChange={e => setTempIncome(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={saveIncome}>💾 Sauvegarder</button>
        </Modal>
      )}

      {/* ── EDIT BUDGET TOTAL MODAL ── */}
      {editingBudget && (
        <Modal title="✏️ Modifier Budget Mensuel Total" onClose={() => setEditingBudget(false)}>
          <div style={{ padding:"12px 14px", background:"rgba(26,86,255,0.04)", borderRadius:10, border:"1px solid rgba(26,86,255,0.1)", marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#7B91C4", lineHeight:1.6 }}>💡 Définissez votre plafond de dépenses mensuel. Astuce: essayez de ne pas dépasser 80% de vos revenus ({fmt(income * 0.8)}).</div>
          </div>
          <div className="form-group"><label className="form-label">Budget mensuel ($)</label>
            <input type="number" value={tempBudget} onChange={e => setTempBudget(e.target.value)} />
          </div>
          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={saveBudgetTotal}>💾 Sauvegarder</button>
        </Modal>
      )}

      {/* ── EDIT GOAL MODAL ── */}
      {editingGoal && (
        <Modal title={editingGoal === "new" ? "➕ Nouvel Objectif d'Épargne" : `✏️ Modifier: ${editingGoal.name || ""}`} onClose={() => setEditingGoal(null)}>
          <div style={{ padding:"12px 14px", background:"rgba(26,86,255,0.04)", borderRadius:10, border:"1px solid rgba(26,86,255,0.1)", marginBottom:14 }}>
            <div style={{ fontSize:11, color:"#7B91C4", lineHeight:1.6 }}>💡 Définissez un objectif clair et réaliste. Les petits objectifs réguliers fonctionnent mieux que les gros objectifs lointains!</div>
          </div>
          <div className="form-group"><label className="form-label">Emoji</label>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {["🎯","🛡️","🚗","📈","✈️","🏠","💻","🎓","💍","🏖️","🏥","👶"].map(e => (
                <div key={e} onClick={() => setTempGoal(p => ({...p, emoji:e}))} style={{ width:36, height:36, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, cursor:"pointer", background: tempGoal.emoji===e ? "rgba(26,86,255,0.15)" : "rgba(26,86,255,0.04)", border: `1px solid ${tempGoal.emoji===e ? "#1A56FF" : "rgba(26,86,255,0.1)"}` }}>{e}</div>
              ))}
            </div>
          </div>
          <div className="form-group"><label className="form-label">Nom de l'objectif</label>
            <input value={tempGoal.name} onChange={e => setTempGoal(p => ({...p, name:e.target.value}))} placeholder="Ex: Fonds d'urgence" />
          </div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Montant cible ($)</label>
              <input type="number" value={tempGoal.target} onChange={e => setTempGoal(p => ({...p, target:e.target.value}))} />
            </div>
            <div className="form-group"><label className="form-label">Déjà épargné ($)</label>
              <input type="number" value={tempGoal.current} onChange={e => setTempGoal(p => ({...p, current:e.target.value}))} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={saveGoal}>💾 {editingGoal === "new" ? "Ajouter" : "Sauvegarder"}</button>
        </Modal>
      )}

      {/* ── EDIT CATEGORY MODAL ── */}
      {editingCategory !== null && (
        <Modal title={editingCategory === "new" ? "➕ Nouvelle Catégorie Budget" : `✏️ Modifier: ${tempCategory.name}`} onClose={() => setEditingCategory(null)}>
          <div className="form-group"><label className="form-label">Nom de la catégorie</label>
            <input value={tempCategory.name} onChange={e => setTempCategory(p => ({...p, name:e.target.value}))} placeholder="Ex: Transport" />
          </div>
          <div className="g2">
            <div className="form-group"><label className="form-label">Budget alloué ($)</label>
              <input type="number" value={tempCategory.budget} onChange={e => setTempCategory(p => ({...p, budget:e.target.value}))} />
            </div>
            <div className="form-group"><label className="form-label">Dépensé ce mois ($)</label>
              <input type="number" value={tempCategory.spent} onChange={e => setTempCategory(p => ({...p, spent:e.target.value}))} />
            </div>
          </div>
          {editingCategory !== "new" && (
            <button className="btn btn-red" style={{ width:"100%", justifyContent:"center", marginBottom:10 }} onClick={() => {
              setData(d => {
                const cats = d.budget.categories.filter((_, idx) => idx !== editingCategory);
                const newSpent = cats.reduce((s,c) => s + c.spent, 0);
                return { ...d, budget: { ...d.budget, categories: cats, spent: newSpent } };
              });
              setEditingCategory(null); showToast("Catégorie supprimée", "info");
            }}>🗑️ Supprimer cette catégorie</button>
          )}
          <button className="btn btn-primary" style={{ width:"100%", justifyContent:"center" }} onClick={saveCategory}>💾 Sauvegarder</button>
        </Modal>
      )}
    </div>
  );
}

// (WhatsApp Bot module removed — functionality available in Marketing)

// ─── BUSINESS PLAN PAGE ────────────────────────────────────────────────────────
function BusinessPlanPage({ data, showToast, dark }) {
  const [step, setStep] = useState(0); // 0=intro, 1-5=onboarding, 6=generating, 7=plan
  const [answers, setAnswers] = useState({
    businessType: "", sector: "", targetMarket: "", uniqueValue: "",
    shortTermGoal: "", longTermGoal: "", challenges: "", teamSize: "",
    monthlyBudget: "", fundingNeeded: false, fundingAmount: "",
  });
  const [plan, setPlan] = useState(null);
  const [generating, setGenerating] = useState(false);

  const totalRevenue = data.sales.reduce((s,x)=>s+x.total_amount,0);
  const totalProfit  = data.sales.reduce((s,x)=>s+x.profit,0);
  const totalExpenses = data.expenses.filter(e=>e.status==="approved").reduce((s,x)=>s+x.amount,0);
  const avgMargin = data.products.reduce((s,p)=>s+((p.unit_price-p.cogs)/p.unit_price*100),0)/data.products.length;
  const topProduct = [...data.products].sort((a,b) => {
    const revA = data.sales.filter(s=>s.product_name===a.name).reduce((s,x)=>s+x.total_amount,0);
    const revB = data.sales.filter(s=>s.product_name===b.name).reduce((s,x)=>s+x.total_amount,0);
    return revB - revA;
  })[0];
  const topClient = [...data.clients].sort((a,b) => b.total_revenue - a.total_revenue)[0];

  const questions = [
    {
      title: "🏢 Type d'Entreprise",
      subtitle: "Décrivez votre activité principale",
      fields: [
        { key:"businessType", label:"Type de business", placeholder:"Ex: Commerce de détail, Distribution, Import-Export...", type:"text" },
        { key:"sector", label:"Secteur d'activité", placeholder:"Ex: Alimentation, Boissons, Hygiène, Multi-produits...", type:"select", options:["Commerce Général","Alimentation & Boissons","Hygiène & Cosmétiques","Électronique","Distribution","Import-Export","Restauration","Autre"] },
      ]
    },
    {
      title: "🎯 Marché Cible",
      subtitle: "Qui sont vos clients?",
      fields: [
        { key:"targetMarket", label:"Marché cible", placeholder:"Ex: Ménages de Kinshasa, Restaurants, Hôtels...", type:"text" },
        { key:"uniqueValue", label:"Avantage compétitif", placeholder:"Qu'est-ce qui vous différencie? Prix, qualité, livraison...", type:"textarea" },
      ]
    },
    {
      title: "📈 Objectifs",
      subtitle: "Vos ambitions à court et long terme",
      fields: [
        { key:"shortTermGoal", label:"Objectif 6 mois", placeholder:"Ex: Doubler les ventes, ouvrir un 2e point de vente...", type:"text" },
        { key:"longTermGoal", label:"Vision 3 ans", placeholder:"Ex: Leader régional, franchise, export...", type:"textarea" },
      ]
    },
    {
      title: "⚡ Défis & Équipe",
      subtitle: "Vos obstacles et ressources humaines",
      fields: [
        { key:"challenges", label:"Principaux défis", placeholder:"Ex: Concurrence, trésorerie, logistique, stock...", type:"textarea" },
        { key:"teamSize", label:"Taille de l'équipe", placeholder:"Nombre d'employés", type:"select", options:["1 (solo)","2-5","6-10","11-25","26-50","50+"] },
      ]
    },
    {
      title: "💰 Financement",
      subtitle: "Budget et besoins de financement",
      fields: [
        { key:"monthlyBudget", label:"Budget opérationnel mensuel ($)", placeholder:"Ex: 2000", type:"number" },
        { key:"fundingNeeded", label:"Cherchez-vous un financement?", type:"toggle" },
        ...(answers.fundingNeeded ? [{ key:"fundingAmount", label:"Montant recherché ($)", placeholder:"Ex: 10000", type:"number" }] : []),
      ]
    },
  ];

  const generatePlan = () => {
    setStep(6);
    setGenerating(true);
    // Simulate AI generation (in production, this calls Lovable AI edge function)
    setTimeout(() => {
      const projectedRevenue = totalRevenue * 12 * 1.5;
      const projectedProfit = totalProfit * 12 * 1.4;

      setPlan({
        title: `Plan d'Affaires — ${data.user.company}`,
        date: new Date().toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" }),
        sections: [
          {
            title: "1. Résumé Exécutif",
            icon: "📋",
            content: [
              `**${data.user.company}** est une entreprise de ${answers.sector || "commerce"} basée à Kinshasa, République Démocratique du Congo, dirigée par ${data.user.name}.`,
              `L'entreprise propose ${data.products.length} produits dans les catégories: ${[...new Set(data.products.map(p=>p.type))].join(", ")}.`,
              `Avec un chiffre d'affaires actuel de **${fmt(totalRevenue)}** et une marge brute moyenne de **${avgMargin.toFixed(0)}%**, l'entreprise démontre une solide capacité commerciale.`,
              answers.uniqueValue ? `**Avantage compétitif:** ${answers.uniqueValue}` : "",
            ].filter(Boolean)
          },
          {
            title: "2. Analyse du Marché",
            icon: "🎯",
            content: [
              `**Marché cible:** ${answers.targetMarket || "Consommateurs et entreprises de Kinshasa"}`,
              `**Base clients actuelle:** ${data.clients.length} clients dont ${data.clients.filter(c=>c.status==="vip").length} VIP et ${data.clients.filter(c=>c.status==="active").length} actifs.`,
              `**Client principal:** ${topClient?.name || "N/A"} (${fmt(topClient?.total_revenue || 0)} de revenus).`,
              `**Opportunité:** La RDC, avec plus de 100 millions d'habitants et une urbanisation croissante à Kinshasa, offre un marché en expansion pour le commerce de détail.`,
              `**Concurrence:** ${answers.challenges || "Marché compétitif avec des défis logistiques à surmonter."}`
            ]
          },
          {
            title: "3. Produits & Services",
            icon: "📦",
            content: [
              `**Catalogue:** ${data.products.length} produits actifs.`,
              `**Produit phare:** ${topProduct?.emoji} ${topProduct?.name} — ${fmt(data.sales.filter(s=>s.product_name===topProduct?.name).reduce((a,s)=>a+s.total_amount,0))} de revenus.`,
              `**Marge moyenne:** ${avgMargin.toFixed(1)}%`,
              `**Structure de prix:**`,
              ...data.products.map(p => `  • ${p.emoji} ${p.name}: ${fmt(p.unit_price)} (marge: ${((p.unit_price-p.cogs)/p.unit_price*100).toFixed(0)}%)`),
            ]
          },
          {
            title: "4. Stratégie Commerciale",
            icon: "🚀",
            content: [
              `**Modes de paiement:** Cash, Mobile Money (M-PESA, Airtel, Orange), Crédit, Banque.`,
              `**Canaux de vente:** Point de vente physique, commandes WhatsApp, livraison.`,
              `**Marketing:** ${data.posts.length} publications social media programmées (Instagram, Facebook, TikTok).`,
              `**CRM:** Gestion client intégrée avec suivi des crédits (${fmt(data.clients.reduce((s,c)=>s+c.credit_balance,0))} en créances).`,
              answers.shortTermGoal ? `**Objectif 6 mois:** ${answers.shortTermGoal}` : "",
            ].filter(Boolean)
          },
          {
            title: "5. Projections Financières",
            icon: "💹",
            content: [
              `**Revenus actuels (période):** ${fmt(totalRevenue)}`,
              `**Dépenses opérationnelles:** ${fmt(totalExpenses)}`,
              `**Profit net actuel:** ${fmt(totalProfit)} (marge nette: ${totalRevenue > 0 ? ((totalProfit/totalRevenue)*100).toFixed(1) : 0}%)`,
              `**Projection annuelle (croissance 50%):** ${fmt(projectedRevenue)}`,
              `**Profit projeté:** ${fmt(projectedProfit)}`,
              `**Budget mensuel:** ${answers.monthlyBudget ? fmt(Number(answers.monthlyBudget)) : fmt(totalExpenses)}`,
              `**Seuil de rentabilité estimé:** ${fmt(totalExpenses * 12 / (avgMargin/100))} /an`,
              answers.fundingNeeded ? `**Financement recherché:** ${fmt(Number(answers.fundingAmount || 0))}` : "",
            ].filter(Boolean)
          },
          {
            title: "6. Équipe & Organisation",
            icon: "👥",
            content: [
              `**Dirigeant:** ${data.user.name} — ${data.user.role}`,
              `**Effectif:** ${answers.teamSize || `${data.staff?.length || 3} employés`}`,
              ...(data.staff || []).map(s => `  • ${s.full_name} — ${s.role} (commission: ${s.commission_rate}%)`),
              `**Rôles clés:** Caissier, Gestionnaire de stock, Comptable.`,
            ]
          },
          {
            title: "7. Plan d'Action",
            icon: "✅",
            content: [
              `**Mois 1-2:** Optimiser la gestion des stocks (${data.products.filter(p=>p.stock_quantity<=p.low_stock_alert).length} produits en rupture).`,
              `**Mois 3-4:** Intensifier le marketing digital et les campagnes WhatsApp.`,
              `**Mois 5-6:** ${answers.shortTermGoal || "Développer la base clients et augmenter le panier moyen."}`,
              `**Année 2:** ${answers.longTermGoal || "Consolider la position sur le marché de Kinshasa."}`,
              `**Année 3:** Expansion géographique et diversification des produits.`,
            ]
          },
          {
            title: "8. Risques & Mitigation",
            icon: "⚠️",
            content: [
              `**Risque de trésorerie:** ${fmt(data.clients.reduce((s,c)=>s+c.credit_balance,0))} en créances clients. Mitigation: resserrer les conditions de crédit.`,
              `**Rupture de stock:** ${data.products.filter(p=>p.stock_quantity<=p.low_stock_alert).length} produits à risque. Mitigation: automatiser les réapprovisionnements.`,
              `**Volatilité du marché:** Fluctuation des prix de gros. Mitigation: contrats fournisseurs à terme.`,
              `**Concurrence:** ${answers.challenges || "Pression concurrentielle sur les prix. Différenciation par la qualité et le service."}`,
            ]
          },
        ]
      });
      setGenerating(false);
      setStep(7);
    }, 3000);
  };

  if (step === 0) {
    return (
      <div className="page-bg page-content fade-in">
        <div style={{ maxWidth:700, margin:"0 auto", textAlign:"center", padding:"40px 0" }}>
          <div style={{ fontSize:64, marginBottom:20 }}>📋</div>
          <h1 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:32, fontWeight:800, letterSpacing:"-0.5px", marginBottom:12 }}>Créateur de Business Plan</h1>
          <div style={{ fontSize:15, color:"#7B91C4", lineHeight:1.8, marginBottom:32, maxWidth:500, margin:"0 auto 32px" }}>
            Générez un plan d'affaires professionnel et complet basé sur vos <strong style={{ color:"#1A56FF" }}>données réelles</strong> — produits, ventes, clients, et finances. L'IA analyse votre activité et crée un document prêt pour investisseurs et partenaires.
          </div>

          <div className="g3" style={{ marginBottom:32 }}>
            {[
              ["📊","Données Réelles","Utilise vos ventes, produits, clients et finances existants"],
              ["🧠","Analyse IA","L'IA structure un plan professionnel avec projections"],
              ["📥","Export PDF","Document prêt pour banques et investisseurs"],
            ].map(([ico,t,d]) => (
              <div key={t} className="card card-pad" style={{ textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:10 }}>{ico}</div>
                <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{t}</div>
                <div style={{ fontSize:12, color:"#7B91C4", lineHeight:1.5 }}>{d}</div>
              </div>
            ))}
          </div>

          <div className="card card-pad" style={{ textAlign:"left", marginBottom:24 }}>
            <div className="sec-title" style={{ marginBottom:12 }}>📈 Données disponibles pour votre plan</div>
            <div className="g4">
              {[
                ["🛍️","Produits",data.products.length,"#1A56FF"],
                ["💰","Revenus",fmt(totalRevenue),"#16C55E"],
                ["👥","Clients",data.clients.length,"#F5C518"],
                ["📊","Marge moy.",avgMargin.toFixed(0)+"%","#25D366"],
              ].map(([ico,l,v,c]) => (
                <div key={l} style={{ padding:12, background:`${c}0A`, borderRadius:10, border:`1px solid ${c}22`, textAlign:"center" }}>
                  <div style={{ fontSize:18 }}>{ico}</div>
                  <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:18, color:c }}>{v}</div>
                  <div style={{ fontSize:10, color:"#7B91C4" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{ fontSize:16, padding:"14px 40px" }} onClick={() => setStep(1)}>
            🚀 Commencer
          </button>
        </div>
      </div>
    );
  }

  if (step >= 1 && step <= 5) {
    const q = questions[step - 1];
    const canNext = q.fields.filter(f=>f.type!=="toggle").every(f => answers[f.key] !== "" && answers[f.key] !== undefined);
    return (
      <div className="page-bg page-content fade-in">
        <div style={{ maxWidth:600, margin:"0 auto" }}>
          {/* Progress */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
            <button className="btn btn-ghost btn-icon" onClick={() => setStep(s => s-1)}>←</button>
            <div style={{ flex:1 }}>
              <div className="progress" style={{ height:8 }}>
                <div className="progress-fill" style={{ width:`${(step/5)*100}%`, background:"linear-gradient(90deg, #1A56FF, #16C55E)" }} />
              </div>
            </div>
            <span style={{ fontSize:12, fontWeight:700, color:"#7B91C4" }}>Étape {step}/5</span>
          </div>

          <div className="card card-pad">
            <div style={{ fontSize:32, marginBottom:12 }}>{q.title.slice(0,2)}</div>
            <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:22, fontWeight:800, marginBottom:4 }}>{q.title.slice(3)}</h2>
            <div style={{ fontSize:13, color:"#7B91C4", marginBottom:24 }}>{q.subtitle}</div>

            {q.fields.map(f => (
              <div className="form-group" key={f.key}>
                <label className="form-label">{f.label}</label>
                {f.type === "text" && <input value={answers[f.key]} onChange={e => setAnswers(a=>({...a,[f.key]:e.target.value}))} placeholder={f.placeholder} />}
                {f.type === "number" && <input type="number" value={answers[f.key]} onChange={e => setAnswers(a=>({...a,[f.key]:e.target.value}))} placeholder={f.placeholder} />}
                {f.type === "textarea" && <textarea value={answers[f.key]} onChange={e => setAnswers(a=>({...a,[f.key]:e.target.value}))} placeholder={f.placeholder} rows={3} style={{ resize:"vertical" }} />}
                {f.type === "select" && (
                  <select value={answers[f.key]} onChange={e => setAnswers(a=>({...a,[f.key]:e.target.value}))}>
                    <option value="">Sélectionner...</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                )}
                {f.type === "toggle" && (
                  <label className="toggle" style={{ marginTop:4 }}>
                    <input type="checkbox" checked={!!answers[f.key]} onChange={() => setAnswers(a=>({...a,[f.key]:!a[f.key]}))} />
                    <span className="toggle-track" />
                  </label>
                )}
              </div>
            ))}

            <div style={{ display:"flex", gap:10, marginTop:20 }}>
              <button className="btn btn-ghost" style={{ flex:1, justifyContent:"center" }} onClick={() => setStep(s => s-1)}>← Retour</button>
              {step < 5 ? (
                <button className="btn btn-primary" style={{ flex:2, justifyContent:"center" }} onClick={() => setStep(s => s+1)}>Suivant →</button>
              ) : (
                <button className="btn btn-primary" style={{ flex:2, justifyContent:"center" }} onClick={generatePlan}>🧠 Générer le Business Plan</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 6) {
    return (
      <div className="page-bg page-content fade-in">
        <div style={{ maxWidth:500, margin:"60px auto", textAlign:"center" }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(26,86,255,0.12)", border:"2px solid rgba(26,86,255,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 24px", animation:"pulse 2s infinite" }}>🧠</div>
          <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:24, fontWeight:800, marginBottom:12 }}>Génération en cours...</h2>
          <div style={{ fontSize:13, color:"#7B91C4", lineHeight:1.8, marginBottom:24 }}>
            L'IA analyse vos <strong>{data.products.length} produits</strong>, <strong>{data.sales.length} ventes</strong>, <strong>{data.clients.length} clients</strong> et vos finances pour créer un plan d'affaires complet.
          </div>
          <Spinner />
          <div style={{ marginTop:16 }}>
            {["📊 Analyse des données financières...", "📦 Évaluation du catalogue produits...", "👥 Étude de la base clients...", "📈 Calcul des projections...", "📋 Rédaction du plan..."].map((t,i) => (
              <div key={i} style={{ fontSize:12, color: i < 3 ? "#16C55E" : "#7B91C4", padding:"4px 0", animation:`fadeIn 0.5s ease ${i*0.6}s both` }}>
                {i < 3 ? "✅" : "⏳"} {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (step === 7 && plan) {
    return (
      <div className="page-bg page-content fade-in">
        <div id="business-plan-content" style={{ maxWidth:800, margin:"0 auto", padding: "20px", background: "inherit" }}>
          {/* Plan Header */}
          <div className="hero-banner" style={{ marginBottom:24, textAlign:"center" }}>
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"#7B91C4", marginBottom:8 }}>📋 BUSINESS PLAN GÉNÉRÉ</div>
              <h1 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:28, fontWeight:800, letterSpacing:"-0.5px", marginBottom:8 }}>{plan.title}</h1>
              <div style={{ fontSize:13, color:"#7B91C4" }}>{plan.date} · Kinshasa, RDC 🇨🇩</div>
              <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:20 }}>
                <button className="btn btn-primary" onClick={() => { showToast("📥 Export PDF en cours...", "info"); generatePDF("business-plan-content", "Business_Plan.pdf"); }}>📥 Télécharger PDF</button>
                <button className="btn btn-wa" onClick={() => showToast("📤 Envoyé via WhatsApp!", "whatsapp")}>💬 Envoyer WA</button>
                <button className="btn btn-ghost" onClick={() => { setStep(0); setPlan(null); setAnswers({businessType:"",sector:"",targetMarket:"",uniqueValue:"",shortTermGoal:"",longTermGoal:"",challenges:"",teamSize:"",monthlyBudget:"",fundingNeeded:false,fundingAmount:""}); }}>🔄 Recommencer</button>
              </div>
            </div>
          </div>

          {/* Plan Sections */}
          {plan.sections.map((section, idx) => (
            <div key={idx} className="card card-pad" style={{ marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:"rgba(26,86,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>{section.icon}</div>
                <h2 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:18, fontWeight:800 }}>{section.title}</h2>
              </div>
              {section.content.map((line, li) => {
                const isBold = line.startsWith("**");
                const isBullet = line.startsWith("  •");
                const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                return (
                  <div key={li} style={{ fontSize:13, color: isBold ? undefined : "#7B91C4", lineHeight:1.8, marginBottom: isBullet ? 2 : 8, paddingLeft: isBullet ? 12 : 0 }}
                    dangerouslySetInnerHTML={{ __html: rendered }} />
                );
              })}
            </div>
          ))}

          {/* Footer */}
          <div className="card card-pad" style={{ textAlign:"center", marginBottom:40, background:"rgba(26,86,255,0.04)", borderColor:"rgba(26,86,255,0.15)" }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#1A56FF", marginBottom:8 }}>📋 Document généré par BizPlatform DRC</div>
            <div style={{ fontSize:12, color:"#7B91C4", lineHeight:1.7 }}>
              Ce business plan a été créé automatiquement à partir de vos données réelles.<br/>
              Pour un plan plus détaillé avec analyse de marché approfondie, connectez Lovable Cloud.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}


function SettingsPage({ data, setData, showToast, dark, setDark }) {
  const [tab, setTab] = useState("profile");
  return (
    <div className="page-bg page-content fade-in">
      <HeroBanner
        label="CONFIGURATION SYSTÈME"
        value={data.user.company}
        subtitle={`${data.user.name} · ${data.user.role}`}
        icon="⚙️"
      />
      <div className="mini-kpi-grid">
        <MiniKpiCard icon="👨‍💼" label="Employés" value={data.staff?.length||3} color="#F5C518" />
        <MiniKpiCard icon="🔌" label="Intégrations" value="4" color="#25D366" />
        <MiniKpiCard icon={dark?"🌙":"☀️"} label="Thème" value={dark?"Sombre":"Clair"} color="#7B91C4" />
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h1 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:22, fontWeight:800 }}>◉ Paramètres</h1>
      </div>
      <div className="tabs" style={{ marginBottom:20 }}>
        {[["profile","👤 Profil"],["company","🏢 Entreprise"],["appearance","🎨 Apparence"],["security","🔐 Sécurité"],["integrations","🔌 Intégrations"]].map(([k,l]) => (
          <div key={k} className={`tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</div>
        ))}
      </div>

      {tab==="profile" && (
        <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:16 }}>
          <div className="card card-pad" style={{ textAlign:"center" }}>
            <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(26,86,255,0.12)", border:"3px solid rgba(26,86,255,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Bricolage Grotesque'", fontWeight:800, fontSize:28, color:"#1A56FF", margin:"0 auto 12px" }}>{data.user.avatar}</div>
            <div style={{ fontWeight:700, fontSize:15 }}>{data.user.name}</div>
            <div style={{ fontSize:12, color:"#7B91C4", marginTop:2 }}>{data.user.role}</div>
            <button className="btn btn-ghost" style={{ width:"100%", justifyContent:"center", marginTop:14, fontSize:12 }} onClick={() => showToast("Photo mise à jour!", "success")}>📷 Changer photo</button>
          </div>
          <div className="card card-pad">
            <div className="sec-title" style={{ marginBottom:16 }}>Informations Personnelles</div>
            {[["Nom complet","name",data.user.name],["Entreprise","company",data.user.company],["Rôle","role",data.user.role],["Téléphone","phone",data.user.phone]].map(([l,k,v]) => (
              <div className="form-group" key={k}><label className="form-label">{l}</label><input defaultValue={v} onChange={e => setData(d => ({...d,user:{...d.user,[k]:e.target.value}}))} /></div>
            ))}
            <button className="btn btn-primary" onClick={() => showToast("Profil sauvegardé!", "success")}>💾 Sauvegarder</button>
          </div>
        </div>
      )}

      {tab==="appearance" && (
        <div className="card card-pad" style={{ maxWidth:500 }}>
          <div className="sec-title" style={{ marginBottom:20 }}>🎨 Apparence & Thème</div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 0", borderBottom:"1px solid rgba(26,86,255,0.08)", marginBottom:14 }}>
            <div>
              <div style={{ fontWeight:600, fontSize:14 }}>{dark?"🌙 Mode Sombre":"☀️ Mode Clair"}</div>
              <div style={{ fontSize:12, color:"#7B91C4", marginTop:2 }}>Basculer entre les thèmes clair et sombre</div>
            </div>
            <label className="toggle"><input type="checkbox" checked={dark} onChange={() => setDark(d => !d)} /><span className="toggle-track" /></label>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#7B91C4", marginBottom:10, textTransform:"uppercase", letterSpacing:0.5 }}>Palette de couleurs DRC</div>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              {[["#1A56FF","Bleu (60%)","Dominant"],["#D42B3A","Rouge (30%)","Accent"],["#F5C518","Jaune (10%)","Spark"],["white","Blanc","Fond"]].map(([col,n,role]) => (
                <div key={n} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <div style={{ width:44, height:44, borderRadius:9, background:col, border:`1px solid rgba(0,0,0,0.1)`, boxShadow:`0 0 12px ${col}40` }} />
                  <div style={{ fontSize:10, fontWeight:700, textAlign:"center" }}>{n}</div>
                  <div style={{ fontSize:9, color:"#7B91C4", textAlign:"center" }}>{role}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ padding:"12px 14px", background:"rgba(26,86,255,0.05)", borderRadius:9, border:"1px solid rgba(26,86,255,0.12)" }}>
            <div style={{ fontSize:12, fontWeight:600, color:"#1A56FF", marginBottom:4 }}>ℹ️ Typographie</div>
            <div style={{ fontSize:12, color:"#7B91C4" }}>Titres: <strong style={{ color:"#EEF2FF" }}>Bricolage Grotesque</strong> · Corps: <strong style={{ color:"#EEF2FF" }}>DM Sans</strong></div>
          </div>
        </div>
      )}

      {tab==="security" && (
        <div className="g2">
          <div className="card card-pad">
            <div className="sec-title" style={{ marginBottom:16 }}>🔐 Sécurité du Compte</div>
            <div className="form-group"><label className="form-label">Mot de passe actuel</label><input type="password" placeholder="••••••••" /></div>
            <div className="form-group"><label className="form-label">Nouveau mot de passe</label><input type="password" placeholder="••••••••" /></div>
            <div className="form-group"><label className="form-label">Confirmer</label><input type="password" placeholder="••••••••" /></div>
            <button className="btn btn-primary" onClick={() => showToast("Mot de passe mis à jour!", "success")}>🔐 Mettre à jour</button>
          </div>
          <div className="card card-pad">
            <div className="sec-title" style={{ marginBottom:16 }}>📋 Sessions Actives</div>
            {[["Chrome · Windows 11","Kinshasa, DRC","Actif maintenant"],["Safari · iPhone 14","Kinshasa, DRC","Il y a 2h"]].map((s,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(26,86,255,0.07)" }}>
                <div><div style={{ fontSize:12, fontWeight:600 }}>{s[0]}</div><div style={{ fontSize:11, color:"#7B91C4" }}>{s[1]} · {s[2]}</div></div>
                <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={() => showToast("Session révoquée", "info")}>Révoquer</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==="integrations" && (
        <div className="g2">
          {[["💬","WhatsApp Business","Bot automatique · Messages directs","Connecté","#25D366"],["📊","Google Analytics","Suivi des performances marketing","Non connecté","#D42B3A"],["📧","Email Marketing","Mailchimp · Sendinblue","Non connecté","#D42B3A"],["🏦","Banque Mobile","M-PESA · Airtel · Orange","Connecté","#16C55E"],["📦","Gestion Stock","Système de stock interne","Actif","#16C55E"],["🧾","Comptabilité","Export PDF · Excel · CSV","Actif","#16C55E"]].map(([ico,n,d,status2,col]) => (
            <div key={n} className="card card-pad card-hover" style={{ display:"flex", alignItems:"center", gap:14, cursor:"pointer" }} onClick={() => showToast(`${n} — configuration ouverte`, "info")}>
              <div style={{ width:46, height:46, borderRadius:12, background:`${col}12`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{ico}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{n}</div>
                <div style={{ fontSize:11, color:"#7B91C4", marginTop:2 }}>{d}</div>
              </div>
              <span className="tag" style={{ background:`${col}12`, color:col }}>{status2}</span>
            </div>
          ))}
        </div>
      )}

      {tab==="company" && (
        <div className="card card-pad" style={{ maxWidth:500 }}>
          <div className="sec-title" style={{ marginBottom:16 }}>🏢 Informations Entreprise</div>
          {[["Raison sociale","Mukendi Enterprises"],["Secteur","Commerce & Distribution"],["RCCM","CD/KIN/RCCM/25-B-0001"],["NIF","A2500001234M"],["Adresse","Gombe, Kinshasa, DRC"],["Tel professionnel","+243 812 000 001"]].map(([l,v]) => (
            <div className="form-group" key={l}><label className="form-label">{l}</label><input defaultValue={v} /></div>
          ))}
          <button className="btn btn-primary" onClick={() => showToast("Infos entreprise sauvegardées!", "success")}>💾 Sauvegarder</button>
        </div>
      )}
    </div>
  );
}

// ─── TUTORIALS PAGE ──────────────────────────────────────────────────────────────
function TutorialsPage({ data, showToast, setActivePage }) {
  const [activeTutorial, setActiveTutorial] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState({});

  const markStep = (tutId, stepIdx) => {
    setCompletedSteps(prev => ({ ...prev, [`${tutId}-${stepIdx}`]: true }));
    showToast("Étape marquée comme terminée ✅", "success");
  };

  const tutorials = [
    { id: "t1", title: "Faire sa première vente", category: "Ventes", duration: "5 min", difficulty: "Facile", icon: "🛒",
      description: "Apprenez à enregistrer une vente complète, du choix du produit jusqu'à l'encaissement. Ce tutoriel couvre le processus POS complet.",
      steps: [
        { text: "Accéder au module Ventes & POS", action: "sales",
          screenshot: { bg: "linear-gradient(135deg, #1A56FF22, #1A56FF08)", icon: "🖥️", label: "Écran d'accueil → Menu latéral" },
          detail: "Dans le menu de navigation à gauche, cliquez sur l'icône 'Ventes & POS'. C'est le module principal pour enregistrer toutes vos transactions.",
          tip: "💡 Raccourci : Vous pouvez aussi utiliser la barre de recherche (Ctrl+K) et taper 'ventes' pour y accéder rapidement." },
        { text: "Sélectionner un produit", action: "sales",
          screenshot: { bg: "linear-gradient(135deg, #16C55E22, #16C55E08)", icon: "📋", label: "Liste des produits disponibles" },
          detail: "La grille affiche tous vos produits avec leur prix, stock et emoji. Cliquez sur un produit pour l'ajouter au panier. Vous pouvez en ajouter plusieurs.",
          tip: "💡 Les produits avec un stock faible sont signalés en rouge. Vérifiez le stock avant de vendre.",
          note: "⚠️ Si un produit a un stock de 0, il ne pourra pas être vendu." },
        { text: "Choisir un client (optionnel)", action: "sales",
          screenshot: { bg: "linear-gradient(135deg, #F5C51822, #F5C51808)", icon: "👤", label: "Sélecteur de client" },
          detail: "Cliquez sur le menu déroulant 'Client' pour associer cette vente à un client existant. Cela permet de suivre l'historique d'achat et de gérer le crédit.",
          tip: "💡 Les clients VIP ont des limites de crédit plus élevées et bénéficient de réductions automatiques." },
        { text: "Choisir le mode de paiement", action: "sales",
          screenshot: { bg: "linear-gradient(135deg, #9B59B622, #9B59B608)", icon: "💳", label: "Options de paiement" },
          detail: "Sélectionnez le mode de paiement : Espèces (💵), Mobile Money (📱), Crédit (🏦), ou Banque (🏛️). Chaque mode est enregistré dans la comptabilité.",
          note: "⚠️ Le paiement à crédit augmente le solde créditeur du client. Assurez-vous que le client n'a pas dépassé sa limite." },
        { text: "Confirmer et encaisser", action: "sales",
          screenshot: { bg: "linear-gradient(135deg, #D42B3A22, #D42B3A08)", icon: "✅", label: "Bouton Encaisser" },
          detail: "Vérifiez le récapitulatif : produits, quantités, total. Cliquez sur 'Encaisser' pour finaliser la vente. Le stock sera automatiquement mis à jour.",
          tip: "💡 Après l'encaissement, vous pouvez générer un reçu en PDF pour le client." }
      ]},
    { id: "t2", title: "Gérer son inventaire", category: "Stock", duration: "6 min", difficulty: "Moyen", icon: "📦",
      description: "Maîtrisez la gestion de vos produits : ajout, modification, alertes de stock bas et suivi des dates d'expiration.",
      steps: [
        { text: "Ouvrir le module Produits", action: "products",
          screenshot: { bg: "linear-gradient(135deg, #1A56FF22, #1A56FF08)", icon: "📦", label: "Menu → Produits" },
          detail: "Naviguez vers l'onglet 'Produits' dans le menu latéral. Vous verrez la liste complète de vos articles avec stock, prix et catégorie.",
          tip: "💡 La barre de recherche en haut permet de filtrer rapidement par nom ou catégorie." },
        { text: "Ajouter un nouveau produit", action: "products",
          screenshot: { bg: "linear-gradient(135deg, #16C55E22, #16C55E08)", icon: "➕", label: "Formulaire Nouveau Produit" },
          detail: "Cliquez sur 'Nouveau Produit'. Remplissez le nom, le type (Boisson, Alimentaire, Hygiène...), le prix unitaire, le coût d'achat (COGS), et la quantité initiale en stock.",
          tip: "💡 Le COGS (coût d'achat) est important : il permet de calculer automatiquement votre marge bénéficiaire sur chaque vente.",
          note: "⚠️ N'oubliez pas de définir le seuil d'alerte stock bas pour être prévenu quand il faut recommander." },
        { text: "Configurer les alertes de stock", action: "products",
          screenshot: { bg: "linear-gradient(135deg, #F5C51822, #F5C51808)", icon: "🔔", label: "Paramètre d'alerte stock" },
          detail: "Pour chaque produit, définissez un 'seuil d'alerte stock bas'. Quand le stock descend en dessous de ce seuil, une alerte apparaît sur le tableau de bord.",
          tip: "💡 Recommandation : mettez le seuil à la quantité que vous vendez en une semaine pour avoir le temps de recommander." },
        { text: "Surveiller les produits à date d'expiration", action: "products",
          screenshot: { bg: "linear-gradient(135deg, #D42B3A22, #D42B3A08)", icon: "📅", label: "Produits avec expiration" },
          detail: "Les produits marqués 'has_expiry' sont surveillés. Le système vous prévient si un produit approche de sa date d'expiration pour éviter les pertes.",
          note: "⚠️ Vendez en priorité les produits qui expirent bientôt (méthode FIFO : First In, First Out)." },
        { text: "Mettre à jour le stock manuellement", action: "products",
          screenshot: { bg: "linear-gradient(135deg, #9B59B622, #9B59B608)", icon: "✏️", label: "Modifier quantité" },
          detail: "Cliquez sur un produit existant pour modifier sa quantité en stock (livraison reçue, ajustement d'inventaire). Tout changement est enregistré.",
          tip: "💡 Faites un inventaire physique régulier (hebdomadaire) et ajustez les quantités dans l'app pour rester précis." }
      ]},
    { id: "t3", title: "Suivre ses finances", category: "Comptabilité", duration: "8 min", difficulty: "Avancé", icon: "💰",
      description: "Comprenez vos finances : journal comptable, suivi des dépenses, calcul du profit net et gestion du budget mensuel.",
      steps: [
        { text: "Consulter le tableau de bord financier", action: "home",
          screenshot: { bg: "linear-gradient(135deg, #1A56FF22, #1A56FF08)", icon: "📊", label: "Dashboard → KPIs financiers" },
          detail: "Le tableau de bord affiche vos KPIs clés : chiffre d'affaires, profit net, nombre de ventes, et le graphique des revenus de la semaine.",
          tip: "💡 Les flèches vertes/rouges à côté des chiffres indiquent la tendance par rapport à la période précédente." },
        { text: "Ouvrir le journal comptable", action: "accounting",
          screenshot: { bg: "linear-gradient(135deg, #16C55E22, #16C55E08)", icon: "📒", label: "Module Comptabilité → Journal" },
          detail: "Dans 'Comptabilité', le journal liste toutes les écritures : ventes (revenus), achats (dépenses), et le profit/perte pour chaque transaction.",
          tip: "💡 Utilisez les filtres par date et catégorie pour analyser une période spécifique.",
          note: "⚠️ Les écritures sont automatiquement générées à chaque vente ou dépense enregistrée." },
        { text: "Enregistrer une dépense", action: "accounting",
          screenshot: { bg: "linear-gradient(135deg, #F5C51822, #F5C51808)", icon: "💸", label: "Formulaire de dépense" },
          detail: "Cliquez sur 'Nouvelle Dépense'. Choisissez la catégorie (Loyer, Transport, RH, Communication...), entrez le montant et la date. Validez.",
          tip: "💡 Catégorisez toujours vos dépenses pour mieux comprendre où va votre argent à la fin du mois." },
        { text: "Analyser le budget mensuel", action: "personal",
          screenshot: { bg: "linear-gradient(135deg, #9B59B622, #9B59B608)", icon: "📈", label: "Budget → Suivi par catégorie" },
          detail: "L'onglet budget montre votre budget alloué vs dépensé par catégorie. Les barres de progression indiquent le pourcentage utilisé.",
          tip: "💡 Si une catégorie dépasse 90% du budget, réduisez les dépenses ou réallouez depuis une catégorie sous-utilisée.",
          note: "⚠️ Les catégories en rouge (>100%) signifient un dépassement de budget. Attention aux dépenses récurrentes !" },
        { text: "Exporter un rapport financier", action: "accounting",
          screenshot: { bg: "linear-gradient(135deg, #D42B3A22, #D42B3A08)", icon: "📄", label: "Bouton Export PDF" },
          detail: "Générez un rapport PDF complet de vos finances en cliquant sur 'Exporter PDF'. Idéal pour les réunions, les banques, ou les investisseurs.",
          tip: "💡 Exportez un rapport mensuel pour garder une trace et comparer les performances mois par mois." }
      ]},
    { id: "t4", title: "Créer un Business Plan", category: "Stratégie", duration: "15 min", difficulty: "Avancé", icon: "📋",
      description: "Rédigez un business plan professionnel étape par étape : vision, analyse de marché, plan financier et export PDF.",
      steps: [
        { text: "Ouvrir le module Business Plan", action: "bizplan",
          screenshot: { bg: "linear-gradient(135deg, #1A56FF22, #1A56FF08)", icon: "📋", label: "Menu → Business Plan" },
          detail: "Accédez au module 'Business Plan' depuis le menu. Vous trouverez un formulaire structuré en sections à remplir progressivement.",
          tip: "💡 Vous n'avez pas besoin de tout remplir d'un coup. Sauvegardez et revenez plus tard." },
        { text: "Rédiger le Résumé Exécutif", action: "bizplan",
          screenshot: { bg: "linear-gradient(135deg, #16C55E22, #16C55E08)", icon: "🎯", label: "Section Vision & Mission" },
          detail: "Commencez par votre Vision (où voulez-vous aller ?), votre Mission (comment y arriver ?), et vos Valeurs (ce qui guide vos décisions).",
          tip: "💡 Soyez concis et ambitieux. Un bon résumé exécutif tient en 2-3 paragraphes et donne envie de lire la suite.",
          note: "⚠️ C'est la section la plus lue par les investisseurs et les banquiers. Soignez-la !" },
        { text: "Analyser le marché et la concurrence", action: "bizplan",
          screenshot: { bg: "linear-gradient(135deg, #F5C51822, #F5C51808)", icon: "🔍", label: "Analyse SWOT & Concurrence" },
          detail: "Identifiez vos forces, faiblesses, opportunités et menaces (SWOT). Listez vos 3-5 principaux concurrents et expliquez votre avantage compétitif.",
          tip: "💡 Visitez les boutiques concurrentes, notez leurs prix et leurs points forts. Cette info rend votre plan crédible." },
        { text: "Définir la stratégie opérationnelle", action: "bizplan",
          screenshot: { bg: "linear-gradient(135deg, #9B59B622, #9B59B608)", icon: "⚙️", label: "Stratégie & Opérations" },
          detail: "Décrivez comment vous allez fonctionner : approvisionnement, logistique, gestion du personnel, horaires, processus de vente.",
          tip: "💡 Incluez un organigramme simple même si vous êtes seul. Montrez comment vous allez grandir." },
        { text: "Établir le plan financier", action: "bizplan",
          screenshot: { bg: "linear-gradient(135deg, #D42B3A22, #D42B3A08)", icon: "💰", label: "Projections financières" },
          detail: "Remplissez vos projections de revenus mensuels, vos coûts fixes et variables, et votre point mort (break-even). Utilisez vos données réelles de vente comme base.",
          tip: "💡 L'app peut pré-remplir certains chiffres depuis votre historique de ventes. Vérifiez et ajustez.",
          note: "⚠️ Soyez réaliste dans vos projections. Les investisseurs préfèrent des chiffres conservateurs mais crédibles." },
        { text: "Exporter le Business Plan en PDF", action: "bizplan",
          screenshot: { bg: "linear-gradient(135deg, #1A56FF22, #1A56FF08)", icon: "📥", label: "Export → PDF professionnel" },
          detail: "Une fois toutes les sections remplies, cliquez sur 'Exporter PDF'. Le document sera formaté professionnellement avec votre logo et les données financières.",
          tip: "💡 Relisez le PDF avant de l'envoyer. Faites-le lire par un ami ou un mentor pour des retours." }
      ],
      videos: [
        { title: "1. Introduction au Business Plan", duration: "2:30" },
        { title: "2. Comment analyser son marché", duration: "3:15" },
        { title: "3. Remplir le Plan Financier", duration: "4:20" }
      ]},
    { id: "t5", title: "Gérer ses clients (CRM)", category: "Clients", duration: "5 min", difficulty: "Moyen", icon: "👥",
      description: "Organisez votre base client : ajout, segmentation VIP/actif/lead, suivi du crédit et historique d'achat.",
      steps: [
        { text: "Accéder au module Clients (CRM)", action: "clients",
          screenshot: { bg: "linear-gradient(135deg, #1A56FF22, #1A56FF08)", icon: "👥", label: "Menu → Clients" },
          detail: "Naviguez vers 'Clients' dans le menu. Vous verrez la liste de tous vos clients avec leur statut, solde crédit, et revenu total généré.",
          tip: "💡 Triez par 'Revenu total' pour identifier vos meilleurs clients rapidement." },
        { text: "Ajouter un nouveau client", action: "clients",
          screenshot: { bg: "linear-gradient(135deg, #16C55E22, #16C55E08)", icon: "➕", label: "Formulaire nouveau client" },
          detail: "Cliquez sur 'Nouveau Client'. Renseignez le nom, téléphone, email, adresse, et définissez sa limite de crédit et son statut initial (Lead, Actif, VIP).",
          tip: "💡 Commencez tous les nouveaux contacts comme 'Lead' et passez-les en 'Actif' après leur premier achat." },
        { text: "Comprendre les statuts client", action: "clients",
          screenshot: { bg: "linear-gradient(135deg, #F5C51822, #F5C51808)", icon: "🏷️", label: "Statuts : Lead → Actif → VIP" },
          detail: "Lead = prospect pas encore client. Actif = client régulier. VIP = gros acheteur fidèle. Inactif = n'a pas acheté depuis longtemps.",
          note: "⚠️ Les clients VIP méritent une attention particulière : appelez-les régulièrement et offrez-leur des avantages." },
        { text: "Suivre le crédit client", action: "clients",
          screenshot: { bg: "linear-gradient(135deg, #D42B3A22, #D42B3A08)", icon: "🏦", label: "Solde crédit & limite" },
          detail: "Chaque client a une limite de crédit et un solde actuel. Quand vous vendez à crédit, le solde augmente. Suivez les paiements pour le réduire.",
          tip: "💡 N'accordez du crédit qu'aux clients avec un historique d'achat positif. Commencez avec des petites limites." }
      ]},
    { id: "t6", title: "Marketing & Réseaux sociaux", category: "Marketing", duration: "4 min", difficulty: "Facile", icon: "📣",
      description: "Créez et programmez des publications pour promouvoir vos produits sur Facebook, Instagram et WhatsApp.",
      steps: [
        { text: "Ouvrir le module Marketing", action: "marketing",
          screenshot: { bg: "linear-gradient(135deg, #1A56FF22, #1A56FF08)", icon: "📣", label: "Menu → Marketing" },
          detail: "Dans le module Marketing, vous pouvez créer des publications, les programmer, et suivre leurs performances (likes, partages).",
          tip: "💡 Publiez régulièrement (2-3 fois par semaine) pour garder votre audience engagée." },
        { text: "Créer une nouvelle publication", action: "marketing",
          screenshot: { bg: "linear-gradient(135deg, #16C55E22, #16C55E08)", icon: "✍️", label: "Éditeur de publication" },
          detail: "Cliquez 'Nouveau Post'. Donnez un titre, rédigez le contenu avec des emojis, choisissez la plateforme (Facebook, Instagram, WhatsApp) et la date de publication.",
          tip: "💡 Utilisez des emojis et des appels à l'action ('Commandez maintenant !', 'Quantités limitées !') pour plus d'engagement." },
        { text: "Programmer et publier", action: "marketing",
          screenshot: { bg: "linear-gradient(135deg, #F5C51822, #F5C51808)", icon: "📅", label: "Calendrier de publication" },
          detail: "Programmez vos posts à l'avance ou publiez immédiatement. Les posts programmés passent automatiquement au statut 'Publié' à la date choisie.",
          note: "⚠️ Les meilleurs moments pour publier au Congo : 7h-9h (matin), 12h-14h (pause), 18h-21h (soir)." }
      ]}
  ];

  const progress = (tutId, stepsCount) => {
    let done = 0;
    for (let i = 0; i < stepsCount; i++) if (completedSteps[`${tutId}-${i}`]) done++;
    return done;
  };

  if (activeTutorial) {
    const step = activeTutorial.steps[activeStep];
    const totalDone = progress(activeTutorial.id, activeTutorial.steps.length);
    const pctDone = Math.round((totalDone / activeTutorial.steps.length) * 100);

    return (
      <div className="fade-in" style={{ paddingBottom: 40, height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:16 }}>
          <button className="btn btn-outline" onClick={() => { setActiveTutorial(null); setActiveStep(0); }}>← Retour</button>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ fontSize:24 }}>{activeTutorial.icon}</span>
              <h2 style={{ fontSize:22, margin:0 }}>{activeTutorial.title}</h2>
            </div>
            <div style={{ fontSize:13, color:"#7B91C4", marginTop:4 }}>
              {activeTutorial.category} · {activeTutorial.duration} · {activeTutorial.difficulty}
            </div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:13, color:"#7B91C4", marginBottom:4 }}>{totalDone}/{activeTutorial.steps.length} étapes</div>
            <div style={{ width:120, height:6, background:"var(--border)", borderRadius:3, overflow:"hidden" }}>
              <div style={{ width:`${pctDone}%`, height:"100%", background:"#16C55E", borderRadius:3, transition:"width 0.3s" }} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="card" style={{ padding:16, marginBottom:20, background:"var(--surface2)", border:"1px solid var(--border)" }}>
          <p style={{ margin:0, fontSize:14, color:"var(--text2)", lineHeight:1.6 }}>{activeTutorial.description}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, flex: 1, minHeight: 0 }}>
          {/* Step sidebar */}
          <div style={{ display:"flex", flexDirection:"column", gap:8, overflowY:"auto" }}>
            {activeTutorial.steps.map((s, idx) => {
              const isDone = completedSteps[`${activeTutorial.id}-${idx}`];
              const isActive = idx === activeStep;
              return (
                <div key={idx} onClick={() => setActiveStep(idx)}
                  style={{ display:"flex", alignItems:"center", gap:12, padding:12, borderRadius:12, cursor:"pointer",
                    background: isActive ? "rgba(26,86,255,0.12)" : "transparent",
                    border: isActive ? "1px solid rgba(26,86,255,0.3)" : "1px solid transparent",
                    transition:"all 0.2s" }}>
                  <div style={{ width:28, height:28, minWidth:28, borderRadius:"50%",
                    background: isDone ? "#16C55E" : isActive ? "#1A56FF" : "var(--border)",
                    color:"white", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:12 }}>
                    {isDone ? "✓" : idx + 1}
                  </div>
                  <span style={{ fontSize:13, fontWeight: isActive ? 600 : 400, color: isActive ? "var(--text)" : "var(--text2)", lineHeight:1.3 }}>{s.text}</span>
                </div>
              );
            })}
          </div>

          {/* Step detail panel */}
          <div style={{ display:"flex", flexDirection:"column", gap:16, overflowY:"auto" }}>
            {/* Screenshot mockup */}
            <div className="card" style={{ padding:0, overflow:"hidden", border:"1px solid var(--border)" }}>
              <div style={{ background: step.screenshot?.bg || "var(--surface2)", padding:48, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:220, position:"relative" }}>
                <div style={{ position:"absolute", top:12, left:16, display:"flex", gap:6 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:"#D42B3A" }} />
                  <div style={{ width:10, height:10, borderRadius:"50%", background:"#F5C518" }} />
                  <div style={{ width:10, height:10, borderRadius:"50%", background:"#16C55E" }} />
                </div>
                <div style={{ position:"absolute", top:10, right:16, fontSize:11, color:"var(--text3)", background:"var(--glass2)", padding:"4px 10px", borderRadius:6 }}>
                  📸 Capture d'écran
                </div>
                <span style={{ fontSize:56, marginBottom:12 }}>{step.screenshot?.icon || "📸"}</span>
                <div style={{ fontSize:16, fontWeight:600, color:"var(--text)", textAlign:"center" }}>{step.screenshot?.label || step.text}</div>
                <div style={{ marginTop:12, display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
                  <span style={{ fontSize:11, background:"rgba(26,86,255,0.15)", color:"#1A56FF", padding:"4px 10px", borderRadius:20, fontWeight:600 }}>
                    Étape {activeStep + 1} / {activeTutorial.steps.length}
                  </span>
                </div>
              </div>
              {/* Annotation bar */}
              <div style={{ padding:"12px 20px", background:"var(--surface)", borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:16 }}>👆</span>
                <span style={{ fontSize:13, color:"var(--text2)", fontStyle:"italic" }}>{step.text}</span>
              </div>
            </div>

            {/* Detailed explanation */}
            <div className="card" style={{ padding:20 }}>
              <h4 style={{ fontSize:16, marginBottom:12, display:"flex", alignItems:"center", gap:8 }}>📝 Explication détaillée</h4>
              <p style={{ fontSize:14, color:"var(--text2)", lineHeight:1.7, margin:0 }}>{step.detail}</p>
            </div>

            {/* Tip & Note */}
            <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
              {step.tip && (
                <div style={{ flex:1, minWidth:240, padding:16, borderRadius:12, background:"rgba(26,86,255,0.06)", border:"1px solid rgba(26,86,255,0.15)" }}>
                  <div style={{ fontSize:14, lineHeight:1.6, color:"var(--text)" }}>{step.tip}</div>
                </div>
              )}
              {step.note && (
                <div style={{ flex:1, minWidth:240, padding:16, borderRadius:12, background:"rgba(245,197,24,0.08)", border:"1px solid rgba(245,197,24,0.2)" }}>
                  <div style={{ fontSize:14, lineHeight:1.6, color:"var(--text)" }}>{step.note}</div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display:"flex", gap:12, alignItems:"center", marginTop:8 }}>
              <button className="btn btn-outline" style={{ padding:"8px 16px", fontSize:13 }}
                onClick={() => { showToast(`Navigation vers ${step.action}...`, "info"); setActivePage(step.action); }}>
                🚀 Essayer maintenant
              </button>
              {!completedSteps[`${activeTutorial.id}-${activeStep}`] && (
                <button className="theme-btn" style={{ padding:"8px 16px", fontSize:13, background:"#16C55E", color:"white", border:"none", borderRadius:8 }}
                  onClick={() => markStep(activeTutorial.id, activeStep)}>
                  ✅ Marquer comme fait
                </button>
              )}
              <div style={{ flex:1 }} />
              {activeStep > 0 && (
                <button className="btn btn-outline" style={{ padding:"8px 16px", fontSize:13 }}
                  onClick={() => setActiveStep(activeStep - 1)}>← Précédent</button>
              )}
              {activeStep < activeTutorial.steps.length - 1 && (
                <button className="theme-btn" style={{ padding:"8px 16px", fontSize:13, background:"#1A56FF", color:"white", border:"none", borderRadius:8 }}
                  onClick={() => setActiveStep(activeStep + 1)}>Suivant →</button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, marginBottom: 8, display:"flex", alignItems:"center", gap:12 }}>🎓 Centre d'Apprentissage</h2>
        <p style={{ color: "#7B91C4", fontSize: 16 }}>Découvrez comment maîtriser BizPlatform grâce à nos tutoriels interactifs détaillés.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
        {tutorials.map(tut => {
          const done = progress(tut.id, tut.steps.length);
          const pctDone = Math.round((done / tut.steps.length) * 100);
          return (
            <div key={tut.id} className="card card-hover" onClick={() => { setActiveTutorial(tut); setActiveStep(0); }}
              style={{ padding: 24, cursor: "pointer", display:"flex", flexDirection:"column", gap:14, border: "1px solid var(--border)", transition: "all 0.2s ease" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
                <div style={{ fontSize:32, background:"var(--surface2)", width:64, height:64, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                  {tut.icon}
                </div>
                <span className="tag" style={{ background:"rgba(26,86,255,0.1)", color:"#1A56FF", fontWeight:700, padding: "6px 12px" }}>{tut.difficulty}</span>
              </div>
              <div>
                <h3 style={{ fontSize:19, marginBottom:6, fontWeight: 600 }}>{tut.title}</h3>
                <p style={{ fontSize:13, color:"#7B91C4", lineHeight:1.5, margin:0 }}>{tut.description}</p>
              </div>
              {/* Progress bar */}
              {done > 0 && (
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ flex:1, height:5, background:"var(--border)", borderRadius:3, overflow:"hidden" }}>
                    <div style={{ width:`${pctDone}%`, height:"100%", background:"#16C55E", borderRadius:3 }} />
                  </div>
                  <span style={{ fontSize:12, color:"#16C55E", fontWeight:600 }}>{pctDone}%</span>
                </div>
              )}
              <div style={{ display:"flex", alignItems:"center", gap:16, marginTop:"auto", paddingTop:16, borderTop:"1px solid var(--border)" }}>
                <span style={{ fontSize:13, color:"#7B91C4", display:"flex", alignItems:"center", gap:6, fontWeight: 500 }}>🏷️ {tut.category}</span>
                <span style={{ fontSize:13, color:"#7B91C4", display:"flex", alignItems:"center", gap:6, fontWeight: 500 }}>⏱️ {tut.duration}</span>
                <span style={{ fontSize:13, color:"#7B91C4", display:"flex", alignItems:"center", gap:6, fontWeight: 500 }}>📖 {tut.steps.length} étapes</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function BizPlatform() {
  const [dark, setDark]             = useState(true);
  const [data, setData]             = useState(initialData);
  const [activePage, setActivePage] = useState("home");
  const [sidebarExp, setSidebarExp] = useState(false);
  const [toast, setToast]           = useState(null);
  const [time, setTime]             = useState(new Date());
  const [kpiGoals, setKpiGoals]     = useState(DEFAULT_KPI_GOALS);
  const [globalSearch, setGlobalSearch] = useState("");
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [currency, setCurrency]     = useState("USD");
  const [exchangeRate, setExchangeRate] = useState(2800);

  // Keep global currency & rate in sync for fmt()
  _globalCurrency = currency;
  _globalRate = exchangeRate;

  const updateGoal = useCallback((key, value) => {
    setKpiGoals(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  // Auto-fetch exchange rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const { data: rateData, error } = await supabase.functions.invoke("get-exchange-rate");
        if (!error && rateData?.success && rateData.rate) {
          setExchangeRate(rateData.rate);
          console.log(`Exchange rate updated: 1 USD = ${rateData.rate} CDF (${rateData.source})`);
        }
      } catch (e) {
        console.log("Exchange rate fetch failed, using default:", e);
      }
    };
    fetchRate();
    const interval = setInterval(fetchRate, 3600000); // refresh every hour
    return () => clearInterval(interval);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setShowGlobalSearch(s => !s); }
      if (e.key === "Escape") { setShowGlobalSearch(false); setShowQuickAdd(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const styles = buildStyles(dark);

  const cssVarOverride = `
    :root {
      --border: ${dark ? "rgba(100,140,255,0.08)" : "rgba(100,140,255,0.1)"};
      --border2:${dark ? "rgba(100,140,255,0.14)" : "rgba(100,140,255,0.16)"};
      --text:   ${dark ? "#E8EDFF" : "#0A0F1E"};
      --text2:  ${dark ? "#7B91C4" : "#3A4E7A"};
      --text3:  ${dark ? "#3A4E7A" : "#8A9DC0"};
      --glass3: ${dark ? "rgba(60,100,255,0.08)" : "rgba(26,86,255,0.05)"};
      --glass2: ${dark ? "rgba(20,30,70,0.35)" : "rgba(255,255,255,0.75)"};
    }
  `;

  const pages = {
    home:       <HomePage       data={data} setData={setData} showToast={showToast} dark={dark} kpiGoals={kpiGoals} updateGoal={updateGoal} setActivePage={setActivePage} />,
    sales:      <SalesPage      data={data} setData={setData} showToast={showToast} kpiGoals={kpiGoals} updateGoal={updateGoal} exchangeRate={exchangeRate} />,
    products:   <ProductsPage   data={data} setData={setData} showToast={showToast} />,
    clients:    <ClientsPage    data={data} setData={setData} showToast={showToast} kpiGoals={kpiGoals} updateGoal={updateGoal} />,
    marketing:  <MarketingPage  data={data} setData={setData} showToast={showToast} kpiGoals={kpiGoals} updateGoal={updateGoal} />,
    accounting: <AccountingPage data={data} setData={setData} showToast={showToast} kpiGoals={kpiGoals} updateGoal={updateGoal} />,
    personal:   <PersonalPage   data={data} setData={setData} showToast={showToast} kpiGoals={kpiGoals} updateGoal={updateGoal} />,
    bizplan:    <BusinessPlanPage data={data} showToast={showToast} dark={dark} />,
    tutorials:  <TutorialsPage  data={data} showToast={showToast} setActivePage={setActivePage} />,
    settings:   <SettingsPage   data={data} setData={setData} showToast={showToast} dark={dark} setDark={setDark} />,
  };

  // Global search results
  const searchResults = globalSearch.length >= 2 ? [
    ...data.products.filter(p => p.name.toLowerCase().includes(globalSearch.toLowerCase())).map(p => ({ type: "product", icon: p.emoji, name: p.name, sub: `${fmt(p.unit_price)} · ${p.stock_quantity}u`, page: "products" })),
    ...data.clients.filter(c => c.name.toLowerCase().includes(globalSearch.toLowerCase())).map(c => ({ type: "client", icon: "👤", name: c.name, sub: c.phone, page: "clients" })),
    ...NAV.filter(n => n.label.toLowerCase().includes(globalSearch.toLowerCase())).map(n => ({ type: "page", icon: n.icon, name: n.label, sub: "Page", page: n.id })),
  ].slice(0, 8) : [];

  const quickActions = [
    { icon: "🛒", label: "Nouvelle Vente", action: () => { setActivePage("sales"); setShowQuickAdd(false); } },
    { icon: "📦", label: "Ajouter Produit", action: () => { setActivePage("products"); setShowQuickAdd(false); } },
    { icon: "👤", label: "Nouveau Client", action: () => { setActivePage("clients"); setShowQuickAdd(false); } },
    { icon: "📝", label: "Créer Post", action: () => { setActivePage("marketing"); setShowQuickAdd(false); } },
    { icon: "💰", label: "Ajouter Dépense", action: () => { setActivePage("accounting"); setShowQuickAdd(false); } },
    { icon: "📋", label: "Business Plan", action: () => { setActivePage("bizplan"); setShowQuickAdd(false); } },
  ];

  return (
    <>
      <style>{styles + cssVarOverride}</style>
      <div className="app-shell">

        {/* ─ SIDEBAR ─ */}
        <div className={`sidebar ${sidebarExp ? "expanded" : ""}`}>
          <div className="logo-wrap" onClick={() => setSidebarExp(e => !e)}>
            <div className="logo-mark"><BizmoLogo size={40} /></div>
            {sidebarExp && <div><div className="logo-text">BizPlatform</div><div className="logo-sub">DRC Enterprise Suite</div></div>}
          </div>

          <div className="nav-list">
            {NAV.slice(0,-1).map(n => (
              <div key={n.id} className={`nav-item ${activePage===n.id?"active":""}`} onClick={() => setActivePage(n.id)} title={n.label}>
                <span className="nav-icon">{n.icon}</span>
                {sidebarExp && <span className="nav-label">{n.label}</span>}
                {n.badge && <span className="nav-badge">{n.badge}</span>}
              </div>
            ))}
          </div>

          <div className="nav-bottom">
            <div className={`nav-item ${activePage==="settings"?"active":""}`} onClick={() => setActivePage("settings")} title="Paramètres">
              <Avatar name={data.user.name} size={28} />
              {sidebarExp && (
                <div style={{ display:"flex", flexDirection:"column", marginLeft:2 }}>
                  <span style={{ fontSize:12, fontWeight:600 }}>{data.user.name.split(" ")[0]}</span>
                  <span style={{ fontSize:10, color:"#7B91C4" }}>{data.user.role}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─ MAIN ─ */}
        <div className="main-area">
          {/* Topbar */}
          <div className="topbar">
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:15, letterSpacing:"-0.2px" }}>
                {NAV.find(n => n.id===activePage)?.label || "Tableau de Bord"}
              </div>
              <div style={{ fontSize:10, color:"#7B91C4" }}>
                {time.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · {time.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
              </div>
            </div>

            {/* Global Search Trigger */}
            <div onClick={() => setShowGlobalSearch(true)}
              style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 14px", borderRadius:12, cursor:"pointer",
                background: dark ? "rgba(15,22,55,0.5)" : "rgba(240,244,255,0.7)",
                backdropFilter:"blur(12px)", border:`1px solid ${dark?"rgba(100,140,255,0.1)":"rgba(100,140,255,0.12)"}`,
                transition:"all 0.2s", minWidth:160 }}>
              <span style={{ fontSize:13, color:"#7B91C4" }}>🔍</span>
              <span style={{ fontSize:12, color:"#7B91C4", flex:1 }}>Rechercher...</span>
              <span style={{ fontSize:9, padding:"2px 6px", borderRadius:5, background: dark?"rgba(100,140,255,0.1)":"rgba(26,86,255,0.08)", color:"#7B91C4", fontWeight:700, fontFamily:"monospace" }}>⌘K</span>
            </div>

            {/* Quick Add */}
            <button className="theme-btn" onClick={() => setShowQuickAdd(true)} title="Action rapide" style={{ background:"linear-gradient(135deg, #1A56FF, #2B6BFF)", color:"white", border:"none", boxShadow:"0 4px 16px rgba(26,86,255,0.3)" }}>
              ＋
            </button>

            {/* DRC colours */}
            <div style={{ display:"flex", gap:3, alignItems:"center" }}>
              {["#1A56FF","#F5C518","#D42B3A"].map(c => <div key={c} style={{ width:7, height:7, borderRadius:"50%", background:c, boxShadow:`0 0 6px ${c}50` }} />)}
            </div>

            {/* Currency toggle + rate */}
            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
              <button className="theme-btn" onClick={() => setCurrency(c => c === "USD" ? "CDF" : "USD")} title={currency === "USD" ? "Afficher en Francs Congolais" : "Afficher en Dollars"} style={{ fontSize:12, fontWeight:700, letterSpacing:0.3 }}>
                {currency === "USD" ? "🇺🇸$" : "🇨🇩FC"}
              </button>
              {currency === "CDF" && (
                <div style={{ display:"flex", alignItems:"center", gap:3, padding:"4px 8px", borderRadius:10, background: dark?"rgba(26,86,255,0.08)":"rgba(26,86,255,0.06)", border:"1px solid rgba(26,86,255,0.12)" }}>
                  <span style={{ fontSize:10, color:"#7B91C4", fontWeight:600 }}>1$=</span>
                  <input
                    type="number"
                    value={exchangeRate}
                    onChange={e => { const v = parseInt(e.target.value); if (v > 0) setExchangeRate(v); }}
                    style={{ width:60, padding:"2px 4px", fontSize:11, fontWeight:700, color:"#1A56FF", borderRadius:6, border:"1px solid rgba(26,86,255,0.15)", background:"transparent", textAlign:"center" }}
                    min="1"
                  />
                  <span style={{ fontSize:10, color:"#7B91C4", fontWeight:600 }}>FC</span>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button className="theme-btn" onClick={() => setDark(d => !d)} title={dark?"Mode Clair":"Mode Sombre"}>
              {dark ? "☀️" : "🌙"}
            </button>

            {/* Notifications */}
            <button className="theme-btn" onClick={() => showToast("🔔 Aucune nouvelle alerte", "info")} title="Notifications" style={{ position:"relative" }}>
              🔔
              <div style={{ position:"absolute", top:6, right:6, width:6, height:6, borderRadius:"50%", background:"#D42B3A", boxShadow:"0 0 6px rgba(212,43,58,0.5)" }} />
            </button>

            {/* Avatar */}
            <div style={{ cursor:"pointer", transition:"transform 0.2s" }}
              onClick={() => setActivePage("settings")}
              onMouseEnter={e => e.currentTarget.style.transform="scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
              <Avatar name={data.user.name} size={36} />
            </div>
          </div>

          {/* Page */}
          <div className="page-body" key={activePage}>
            {pages[activePage]}
          </div>
        </div>

        {/* ─ MOBILE NAV ─ */}
        <nav className="mobile-nav">
          {NAV.map(n => (
            <div key={n.id} className={`mn-item ${activePage===n.id?"active":""}`} onClick={() => setActivePage(n.id)}>
              <span>{n.icon}</span>
              <span className="mn-label">{n.short}</span>
            </div>
          ))}
        </nav>
      </div>

      {/* ── GLOBAL SEARCH MODAL ── */}
      {showGlobalSearch && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowGlobalSearch(false)}>
          <div className="modal-box" style={{ maxWidth:520, overflow:"visible" }}>
            <div style={{ padding:"16px 20px 0" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:"0 4px" }}>
                <span style={{ fontSize:18 }}>🔍</span>
                <input
                  autoFocus
                  value={globalSearch}
                  onChange={e => setGlobalSearch(e.target.value)}
                  placeholder="Rechercher produits, clients, pages..."
                  style={{ border:"none", background:"transparent", boxShadow:"none", fontSize:16, fontWeight:500, padding:"12px 0" }}
                />
                <span onClick={() => setShowGlobalSearch(false)} style={{ cursor:"pointer", padding:"4px 8px", borderRadius:6, background:dark?"rgba(100,140,255,0.08)":"rgba(26,86,255,0.06)", fontSize:11, fontWeight:700, color:"#7B91C4" }}>ESC</span>
              </div>
            </div>
            <div style={{ borderTop:`1px solid ${dark?"rgba(100,140,255,0.08)":"rgba(100,140,255,0.1)"}`, padding:"8px 12px 12px", maxHeight:320, overflowY:"auto" }}>
              {globalSearch.length < 2 ? (
                <div style={{ padding:"20px 8px", textAlign:"center" }}>
                  <div style={{ fontSize:11, color:"#7B91C4", marginBottom:12 }}>NAVIGATION RAPIDE</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
                    {NAV.map(n => (
                      <div key={n.id} onClick={() => { setActivePage(n.id); setShowGlobalSearch(false); setGlobalSearch(""); }}
                        style={{ padding:"8px 14px", borderRadius:10, cursor:"pointer", fontSize:12, fontWeight:600,
                          background: dark?"rgba(60,100,255,0.06)":"rgba(26,86,255,0.04)",
                          border:`1px solid ${dark?"rgba(100,140,255,0.08)":"rgba(100,140,255,0.1)"}`,
                          transition:"all 0.18s", display:"flex", alignItems:"center", gap:6 }}
                        onMouseEnter={e => e.currentTarget.style.background=dark?"rgba(60,100,255,0.12)":"rgba(26,86,255,0.08)"}
                        onMouseLeave={e => e.currentTarget.style.background=dark?"rgba(60,100,255,0.06)":"rgba(26,86,255,0.04)"}>
                        <span>{n.icon}</span> {n.short}
                      </div>
                    ))}
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div style={{ padding:"24px", textAlign:"center", color:"#7B91C4", fontSize:13 }}>Aucun résultat pour "{globalSearch}"</div>
              ) : (
                searchResults.map((r, i) => (
                  <div key={i} onClick={() => { setActivePage(r.page); setShowGlobalSearch(false); setGlobalSearch(""); }}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10, cursor:"pointer", transition:"all 0.18s" }}
                    onMouseEnter={e => e.currentTarget.style.background=dark?"rgba(60,100,255,0.08)":"rgba(26,86,255,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                    <span style={{ fontSize:20, width:32, textAlign:"center" }}>{r.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:13 }}>{r.name}</div>
                      <div style={{ fontSize:11, color:"#7B91C4" }}>{r.sub}</div>
                    </div>
                    <span className="tag" style={{ background:dark?"rgba(60,100,255,0.08)":"rgba(26,86,255,0.06)", color:"#7B91C4", fontSize:9 }}>{r.type}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── QUICK ADD MODAL ── */}
      {showQuickAdd && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowQuickAdd(false)}>
          <div className="modal-box" style={{ maxWidth:400 }}>
            <div className="modal-header">
              <h3 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:17, fontWeight:700 }}>⚡ Action Rapide</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowQuickAdd(false)} style={{ fontSize:16 }}>✕</button>
            </div>
            <div className="modal-body" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {quickActions.map(qa => (
                <div key={qa.label} onClick={qa.action}
                  className="card card-hover"
                  style={{ padding:"18px 14px", cursor:"pointer", textAlign:"center", transition:"all 0.22s" }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>{qa.icon}</div>
                  <div style={{ fontSize:12, fontWeight:600 }}>{qa.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

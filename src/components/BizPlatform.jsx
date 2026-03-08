import { useState, useEffect, useRef, useCallback } from "react";
import logoDrc from "@/assets/logo-drc.png";

// ─── FONTS & DATA ──────────────────────────────────────────────────────────────
const FONT_URL = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap";

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
    { id: 3, description: "Salaires employés",     amount: 1200, category: "RH",           expense_date: "2025-02-28", status: "pending"  },
    { id: 4, description: "Internet & Téléphone",  amount: 45,   category: "Communication",expense_date: "2025-02-10", status: "approved" },
    { id: 5, description: "Électricité",            amount: 120,  category: "Utilités",     expense_date: "2025-02-05", status: "approved" },
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
const fmt = (v, c = "USD") => c === "CDF" ? `${(v * 2800).toLocaleString()} FC` : `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  { id: "home",       icon: "⊞",  label: "Tableau de Bord", short: "Accueil"  },
  { id: "sales",      icon: "◈",  label: "Ventes & POS",    short: "Ventes"   },
  { id: "products",   icon: "◻",  label: "Produits",         short: "Stock",   badge: "2" },
  { id: "clients",    icon: "◎",  label: "Clients",          short: "Clients"  },
  { id: "marketing",  icon: "◉",  label: "Marketing",        short: "Marketing"},
  { id: "accounting", icon: "⊛",  label: "Comptabilité",     short: "Compta"   },
  { id: "personal",   icon: "◷",  label: "Finance Perso",    short: "Finances" },
  { id: "bizplan",    icon: "📋", label: "Business Plan",     short: "Plan"     },
  { id: "whatsapp",   icon: "◈",  label: "WhatsApp Bot",     short: "WA Bot"   },
  { id: "settings",   icon: "◉",  label: "Paramètres",       short: "Config"   },
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
const buildStyles = (dark) => {
  const t = dark ? {
    bg:       "#050D1F",
    bg2:      "#080F22",
    bg3:      "#0C1428",
    surface:  "#0F1A30",
    surface2: "#142040",
    border:   "rgba(26,86,255,0.12)",
    border2:  "rgba(26,86,255,0.20)",
    text:     "#EEF2FF",
    text2:    "#7B91C4",
    text3:    "#3A4E7A",
    glass:    "rgba(26,86,255,0.04)",
    glass2:   "rgba(26,86,255,0.08)",
    glass3:   "rgba(26,86,255,0.14)",
    inputBg:  "#0C1428",
    modalBg:  "#080F22",
    shadow:   "0 8px 32px rgba(0,0,0,0.5)",
    scrollBg: "rgba(26,86,255,0.15)",
  } : {
    bg:       "#F4F6FF",
    bg2:      "#FFFFFF",
    bg3:      "#EEF1FF",
    surface:  "#FFFFFF",
    surface2: "#F0F4FF",
    border:   "rgba(26,86,255,0.14)",
    border2:  "rgba(26,86,255,0.22)",
    text:     "#0A0F1E",
    text2:    "#3A4E7A",
    text3:    "#8A9DC0",
    glass:    "rgba(255,255,255,0.9)",
    glass2:   "rgba(255,255,255,0.95)",
    glass3:   "rgba(26,86,255,0.06)",
    inputBg:  "#F4F6FF",
    modalBg:  "#FFFFFF",
    shadow:   "0 4px 20px rgba(26,86,255,0.10)",
    scrollBg: "rgba(26,86,255,0.2)",
  };
  return `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: ${t.bg}; color: ${t.text};
    overflow-x: hidden; line-height: 1.5; font-size: 14px;
    transition: background 0.3s, color 0.3s;
  }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${t.scrollBg}; border-radius: 4px; }

  /* ── LAYOUT ── */
  .app-shell { display: flex; height: 100vh; overflow: hidden; }
  .sidebar {
    width: 66px; min-width: 66px;
    background: ${t.bg2}; border-right: 1px solid ${t.border};
    display: flex; flex-direction: column; align-items: center;
    padding: 0; gap: 0; transition: width 0.25s cubic-bezier(.4,0,.2,1);
    z-index: 100; overflow: hidden;
  }
  .sidebar.expanded { width: 224px; min-width: 224px; align-items: stretch; }
  .main-area { flex: 1; overflow-y: auto; display: flex; flex-direction: column; background: ${t.bg}; }
  .topbar {
    position: sticky; top: 0; z-index: 50;
    height: 58px; min-height: 58px; padding: 0 24px;
    background: ${t.bg2}; border-bottom: 1px solid ${t.border};
    display: flex; align-items: center; gap: 12px;
    backdrop-filter: blur(20px);
  }
  .page-body { padding: 24px; flex: 1; }

  /* ── SIDEBAR LOGO ── */
  .logo-wrap {
    width: 100%; height: 66px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    padding: 0 11px; cursor: pointer;
    border-bottom: 1px solid ${t.border};
    gap: 12px; overflow: hidden;
  }
  .logo-mark {
    width: 40px; height: 40px; min-width: 40px; border-radius: 10px;
    background: linear-gradient(180deg, #007FFF 0%, #007FFF 40%, #CE1126 40%, #CE1126 60%, #F7D618 60%, #F7D618 100%);
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800;
    font-size: 17px; color: white; letter-spacing: -0.5px;
    box-shadow: 0 4px 14px rgba(0,127,255,0.35);
    position: relative; overflow: hidden;
  }
  .logo-mark::before {
    content: ''; position: absolute; top: 0; left: -2px; right: -2px; bottom: 0;
    background: linear-gradient(135deg, transparent 35%, #F7D618 35%, #F7D618 42%, transparent 42%);
    pointer-events: none;
  }
  .logo-text { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 800; font-size: 15px; white-space: nowrap; color: ${t.text}; letter-spacing: -0.3px; }
  .logo-sub { font-size: 10px; color: ${t.text3}; margin-top: 1px; }

  /* ── NAV ITEMS ── */
  .nav-list { flex: 1; overflow-y: auto; padding: 8px 0; display: flex; flex-direction: column; gap: 2px; }
  .nav-item {
    position: relative; height: 42px; border-radius: 10px; margin: 0 8px;
    display: flex; align-items: center; cursor: pointer;
    transition: all 0.18s; overflow: hidden;
    padding: 0 11px; gap: 11px; color: ${t.text3};
    font-size: 13px; font-weight: 500; white-space: nowrap;
  }
  .nav-icon { font-size: 17px; min-width: 18px; text-align: center; }
  .nav-label { overflow: hidden; }
  .nav-item:hover { background: ${t.glass3}; color: ${t.text}; }
  .nav-item.active { background: rgba(26,86,255,0.12); color: #1A56FF; }
  .nav-item.active::before {
    content: ''; position: absolute; left: 0; top: 8px; bottom: 8px;
    width: 3px; border-radius: 0 3px 3px 0; background: #1A56FF;
  }
  .nav-item.wa-active { background: rgba(37,211,102,0.12); color: #25D366; }
  .nav-item.wa-active::before { content: ''; position: absolute; left: 0; top: 8px; bottom: 8px; width: 3px; border-radius: 0 3px 3px 0; background: #25D366; }
  .nav-badge {
    position: absolute; top: 8px; right: 8px;
    background: #D42B3A; color: white; border-radius: 8px;
    font-size: 9px; font-weight: 700; padding: 1px 5px; min-width: 16px; text-align: center;
  }
  .nav-divider { height: 1px; background: ${t.border}; margin: 8px 16px; }
  .nav-bottom { padding: 8px; border-top: 1px solid ${t.border}; }

  /* ── BUTTONS ── */
  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 16px; border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
    cursor: pointer; border: none; transition: all 0.18s; white-space: nowrap;
  }
  .btn:active { transform: scale(0.97); }
  .btn-primary { background: #1A56FF; color: white; box-shadow: 0 3px 12px rgba(26,86,255,0.35); }
  .btn-primary:hover { background: #1447E0; box-shadow: 0 5px 20px rgba(26,86,255,0.45); transform: translateY(-1px); }
  .btn-red    { background: #D42B3A; color: white; box-shadow: 0 3px 12px rgba(212,43,58,0.3); }
  .btn-red:hover { background: #B82233; box-shadow: 0 5px 20px rgba(212,43,58,0.4); transform: translateY(-1px); }
  .btn-yellow { background: #F5C518; color: #1a0e00; box-shadow: 0 3px 12px rgba(245,197,24,0.3); }
  .btn-yellow:hover { background: #E0B400; transform: translateY(-1px); }
  .btn-ghost  { background: ${t.glass2}; color: ${t.text2}; border: 1px solid ${t.border2}; }
  .btn-ghost:hover { background: ${t.glass3}; color: ${t.text}; }
  .btn-success{ background: #16A34A; color: white; box-shadow: 0 3px 12px rgba(22,163,74,0.3); }
  .btn-success:hover { background: #15803D; transform: translateY(-1px); }
  .btn-wa     { background: linear-gradient(135deg,#25D366,#128C7E); color: white; box-shadow: 0 3px 12px rgba(37,211,102,0.3); border-radius: 20px; }
  .btn-wa:hover { box-shadow: 0 5px 20px rgba(37,211,102,0.45); transform: translateY(-1px); }
  .btn-icon   { padding: 9px 10px; }

  /* ── INPUTS ── */
  input, select, textarea {
    background: ${t.inputBg}; border: 1px solid ${t.border2};
    color: ${t.text}; border-radius: 9px; padding: 10px 14px;
    font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; width: 100%;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  input:focus, select:focus, textarea:focus {
    border-color: #1A56FF; box-shadow: 0 0 0 3px rgba(26,86,255,0.15);
  }
  input::placeholder { color: ${t.text3}; }
  select option { background: ${t.modalBg}; color: ${t.text}; }

  /* ── CARDS ── */
  .card {
    background: ${t.surface}; border: 1px solid ${t.border};
    border-radius: 14px; transition: transform 0.18s, box-shadow 0.18s;
  }
  .card-hover:hover { transform: translateY(-2px); box-shadow: ${t.shadow}; }
  .card-pad { padding: 20px; }
  .card-pad-sm { padding: 14px; }

  /* ── KPI CARDS ── */
  .kpi {
    background: ${t.surface}; border: 1px solid ${t.border};
    border-radius: 14px; padding: 20px; position: relative; overflow: hidden;
    transition: transform 0.18s, box-shadow 0.18s;
    min-width: 200px; flex-shrink: 0;
  }
  .kpi:hover { transform: translateY(-2px); box-shadow: ${t.shadow}; }
  .kpi-glow { position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; border-radius: 50%; filter: blur(30px); opacity: 0.3; }
  .kpi-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 14px; }
  .kpi-val { font-family: 'Bricolage Grotesque', sans-serif; font-size: 26px; font-weight: 700; line-height: 1; letter-spacing: -0.5px; }
  .kpi-label { font-size: 12px; color: ${t.text2}; margin-top: 4px; font-weight: 500; }
  .kpi-trend { font-size: 11px; margin-top: 10px; display: flex; align-items: center; gap: 4px; font-weight: 600; }

  /* ── KPI BANNER ── */
  .kpi-banner { position: relative; margin-bottom: 20px; }
  .kpi-banner-scroll {
    display: flex; gap: 12px; overflow-x: auto; scroll-behavior: smooth;
    scrollbar-width: none; -ms-overflow-style: none; padding: 4px 0;
  }
  .kpi-banner-scroll::-webkit-scrollbar { display: none; }
  .kpi-banner-arrow {
    position: absolute; top: 50%; transform: translateY(-50%); z-index: 10;
    width: 32px; height: 32px; border-radius: 50%;
    background: ${t.surface}; border: 1px solid ${t.border2};
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 14px; color: ${t.text};
    box-shadow: ${t.shadow}; transition: opacity 0.2s, background 0.2s;
  }
  .kpi-banner-arrow:hover { background: ${t.surface2}; }
  .kpi-banner-arrow.left { left: -12px; }
  .kpi-banner-arrow.right { right: -12px; }
  .kpi-banner-arrow.hidden { opacity: 0; pointer-events: none; }

  /* ── HERO BANNER ── */
  .hero-banner {
    background: linear-gradient(135deg, ${dark ? "rgba(26,86,255,0.15)" : "rgba(26,86,255,0.08)"} 0%, ${dark ? "rgba(26,86,255,0.04)" : "rgba(26,86,255,0.02)"} 100%);
    border: 1px solid ${dark ? "rgba(26,86,255,0.25)" : "rgba(26,86,255,0.18)"};
    border-radius: 18px; padding: 24px 28px; position: relative; overflow: hidden;
    margin-bottom: 16px;
  }
  .hero-banner::before {
    content: ''; position: absolute; top: -40%; right: -10%; width: 260px; height: 260px;
    border-radius: 50%; background: rgba(26,86,255,0.08); filter: blur(60px); pointer-events: none;
  }
  .hero-banner-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: ${t.text2}; margin-bottom: 8px; }
  .hero-banner-value { font-family: 'Bricolage Grotesque', sans-serif; font-size: 42px; font-weight: 800; letter-spacing: -1px; line-height: 1; color: ${t.text}; }
  .hero-banner-sub { font-size: 13px; color: ${t.text2}; margin-top: 8px; }
  .hero-progress { height: 8px; background: ${dark ? "rgba(26,86,255,0.12)" : "rgba(26,86,255,0.08)"}; border-radius: 4px; overflow: hidden; margin-top: 16px; }
  .hero-progress-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; background: linear-gradient(90deg, #1A56FF, #4B7BFF); }

  /* ── MINI KPI GRID ── */
  .mini-kpi-grid { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .mini-kpi {
    flex: 1; min-width: 140px; background: ${t.surface}; border: 1px solid ${t.border};
    border-radius: 14px; padding: 16px; text-align: center; position: relative; overflow: hidden;
    transition: transform 0.18s, box-shadow 0.18s;
  }
  .mini-kpi:hover { transform: translateY(-2px); box-shadow: ${t.shadow}; }
  .mini-kpi-icon { font-size: 22px; margin-bottom: 8px; }
  .mini-kpi-val { font-family: 'Bricolage Grotesque', sans-serif; font-size: 22px; font-weight: 700; line-height: 1; }
  .mini-kpi-label { font-size: 11px; color: ${t.text2}; margin-top: 4px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }
  .mini-kpi-trend { font-size: 10px; margin-top: 6px; font-weight: 700; }

  /* ── INSIGHT CARD ── */
  .insight-card {
    background: ${dark ? "rgba(26,86,255,0.04)" : "rgba(26,86,255,0.02)"};
    border: 1px solid ${t.border}; border-radius: 12px; padding: 14px 16px;
    display: flex; align-items: flex-start; gap: 12px; margin-bottom: 8px;
    transition: background 0.18s;
  }
  .insight-card:hover { background: ${dark ? "rgba(26,86,255,0.08)" : "rgba(26,86,255,0.05)"}; }
  .insight-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }

  /* ── TABS ── */
  .tabs { display: flex; gap: 2px; background: ${t.glass3}; border-radius: 11px; padding: 4px; overflow-x: auto; flex-shrink: 0; }
  .tabs::-webkit-scrollbar { display: none; }
  .tab { padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; white-space: nowrap; color: ${t.text2}; transition: all 0.18s; }
  .tab.active { background: #1A56FF; color: white; box-shadow: 0 2px 8px rgba(26,86,255,0.3); }
  .tab:hover:not(.active) { color: ${t.text}; background: ${dark ? "rgba(26,86,255,0.08)" : "rgba(255,255,255,0.8)"}; }

  /* ── TAG / BADGE ── */
  .tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.3px; }

  /* ── TABLE ── */
  .data-table { width: 100%; border-collapse: collapse; }
  .data-table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 700; color: ${t.text3}; text-transform: uppercase; letter-spacing: 0.6px; border-bottom: 1px solid ${t.border}; }
  .data-table td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid ${t.border}; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:hover td { background: ${t.glass3}; }

  /* ── MODAL ── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,${dark?0.7:0.4});
    backdrop-filter: blur(8px); z-index: 1000;
    display: flex; align-items: center; justify-content: center; padding: 20px;
    animation: fadeIn 0.2s ease;
  }
  .modal-box {
    background: ${t.modalBg}; border: 1px solid ${t.border2};
    border-radius: 18px; width: 100%; max-width: 560px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 25px 80px rgba(0,0,0,${dark?0.6:0.18});
    animation: scaleIn 0.22s cubic-bezier(.4,0,.2,1);
  }
  .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
  .modal-body { padding: 16px 24px 24px; }

  /* ── FORM ── */
  .form-group { margin-bottom: 14px; }
  .form-label { font-size: 11px; font-weight: 700; color: ${t.text2}; margin-bottom: 6px; display: block; text-transform: uppercase; letter-spacing: 0.5px; }

  /* ── PROGRESS ── */
  .progress { height: 6px; background: ${t.glass3}; border-radius: 3px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.5s ease; }

  /* ── TOGGLE ── */
  .toggle { position: relative; width: 38px; height: 21px; cursor: pointer; flex-shrink: 0; }
  .toggle input { opacity: 0; width: 0; height: 0; position: absolute; }
  .toggle-track { position: absolute; inset: 0; background: ${t.glass3}; border-radius: 11px; transition: 0.25s; border: 1px solid ${t.border2}; }
  .toggle-track::after { content: ''; position: absolute; height: 15px; width: 15px; left: 2px; top: 2px; background: ${dark ? "#3A4E7A" : "#A0B0D0"}; border-radius: 50%; transition: 0.25s; }
  .toggle input:checked + .toggle-track { background: #1A56FF; border-color: #1A56FF; }
  .toggle input:checked + .toggle-track::after { transform: translateX(17px); background: white; }

  /* ── SEARCH ── */
  .search-wrap { position: relative; }
  .search-wrap input { padding-left: 38px; }
  .search-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: ${t.text3}; font-size: 14px; pointer-events: none; }

  /* ── TOAST ── */
  .toast {
    position: fixed; bottom: 80px; right: 20px; z-index: 9999;
    background: ${t.bg2}; border: 1px solid ${t.border2};
    border-radius: 12px; padding: 13px 18px; max-width: 320px;
    display: flex; align-items: center; gap: 12px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.3); font-size: 13px;
    animation: slideRight 0.3s cubic-bezier(.4,0,.2,1);
  }

  /* ── SECTION HEADER ── */
  .sec-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .sec-title { font-family: 'Bricolage Grotesque', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: -0.2px; color: ${t.text}; }

  /* ── SPINNER ── */
  .spinner { width: 18px; height: 18px; border: 2px solid ${t.glass3}; border-top-color: #1A56FF; border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block; }

  /* ── PAGE BACKGROUND ── */
  .page-bg { position: relative; }
  .page-bg::before {
    content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 70% 50% at 10% 40%, rgba(26,86,255,0.06) 0%, transparent 55%),
      radial-gradient(ellipse 50% 40% at 90% 20%, rgba(245,197,24,0.04) 0%, transparent 50%),
      radial-gradient(ellipse 60% 50% at 50% 90%, rgba(212,43,58,0.04) 0%, transparent 50%);
  }
  .page-content { position: relative; z-index: 1; }

  /* ── GRID ── */
  .g2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .g3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .g4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  @media (max-width: 1200px) { .g4 { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 900px)  { .g3 { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 640px)  {
    .g4,.g3,.g2 { grid-template-columns: 1fr; }
    .hero-banner-value { font-size: 28px; }
    .mini-kpi-grid { gap:8px; }
    .mini-kpi { min-width:120px; padding:12px; }
    .mini-kpi-val { font-size:18px; }
    [style*="grid-template-columns: 1fr 360px"],
    [style*="grid-template-columns: 1fr 330px"],
    [style*="grid-template-columns: 200px 1fr"],
    [style*="grid-template-columns: 240px 1fr"],
    [style*="grid-template-columns: 1fr 300px"],
    [style*="gridTemplateColumns"] { grid-template-columns: 1fr !important; }
  }

  /* ── MOBILE NAV ── */
  @media (max-width: 768px) {
    .sidebar { display: none !important; }
    .mobile-nav {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: ${t.bg2}; border-top: 1px solid ${t.border};
      display: flex; z-index: 200; padding: 6px 0 8px;
      overflow-x: auto; scrollbar-width: none;
    }
    .mobile-nav::-webkit-scrollbar { display: none; }
    .mobile-nav .mn-item {
      flex: 0 0 auto; min-width: 64px; display: flex; flex-direction: column;
      align-items: center; gap: 2px; padding: 4px 8px;
      cursor: pointer; border-radius: 10px; font-size: 19px;
    }
    .mobile-nav .mn-label { font-size: 9px; font-weight: 600; color: ${t.text3}; }
    .mobile-nav .mn-item.active .mn-label { color: #1A56FF; }
    .mobile-nav .mn-item.wa-active .mn-label { color: #25D366; }
    .page-body { padding: 14px; padding-bottom: 88px; }
  }
  @media (min-width: 769px) { .mobile-nav { display: none; } }

  /* ── WHATSAPP ── */
  .wa-msg-out {
    background: linear-gradient(135deg,#1A56FF,#0D3DCC); color: white;
    border-radius: 16px 4px 16px 16px; padding: 10px 14px; max-width: 72%;
    font-size: 13px; line-height: 1.5; box-shadow: 0 2px 10px rgba(26,86,255,0.25);
    white-space: pre-wrap; word-break: break-word;
  }
  .wa-msg-in {
    background: ${t.surface}; border: 1px solid ${t.border};
    border-radius: 4px 16px 16px 16px; padding: 10px 14px; max-width: 72%;
    font-size: 13px; line-height: 1.5; color: ${t.text};
    white-space: pre-wrap; word-break: break-word;
  }
  .wa-time { font-size: 9px; opacity: 0.6; margin-top: 3px; text-align: right; }

  /* ── QR ── */
  .qr-corner { position: absolute; width: 22px; height: 22px; }

  /* ── THEME TOGGLE BTN ── */
  .theme-btn {
    width: 36px; height: 36px; border-radius: 9px; border: 1px solid ${t.border2};
    background: ${t.glass2}; display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 17px; transition: all 0.18s; color: ${t.text2};
  }
  .theme-btn:hover { background: ${t.glass3}; color: ${t.text}; }

  /* ── KEYFRAMES ── */
  @keyframes fadeIn    { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn   { from { opacity: 0; transform: scale(0.95);     } to { opacity: 1; transform: scale(1);     } }
  @keyframes slideRight{ from { opacity: 0; transform: translateX(20px);} to { opacity: 1; transform: translateX(0);} }
  @keyframes spin      { to { transform: rotate(360deg); } }
  @keyframes pulse     { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
  @keyframes glow      { 0%,100% { box-shadow: 0 0 18px rgba(26,86,255,0.25); } 50% { box-shadow: 0 0 35px rgba(26,86,255,0.5); } }
  @keyframes barGrow   { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); transform-origin: bottom; } }

  .fade-in  { animation: fadeIn  0.28s ease forwards; }
  .scale-in { animation: scaleIn 0.22s ease forwards; }
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
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120, paddingTop: 10 }}>
      {chartData.map((d, i) => {
        const h = Math.max((d.amount / max) * 100, 6);
        return (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#1A56FF", opacity: 0.8 }}>${(d.amount/1000).toFixed(1)}k</div>
            <div style={{ width: "100%", height: `${h}%`, borderRadius: "6px 6px 0 0", background: i === chartData.length - 1 ? "linear-gradient(180deg,#D42B3A,#A01A27)" : "linear-gradient(180deg,#1A56FF,#0D3DCC)", animation: "barGrow 0.5s ease forwards", animationDelay: `${i * 60}ms`, cursor: "pointer", transition: "opacity 0.18s" }}
              title={`${d.day}: $${d.amount}`}
            />
            <div style={{ fontSize: 10, color: "#7B91C4", fontWeight: 500 }}>{d.day}</div>
          </div>
        );
      })}
    </div>
  );
};

// ─── HOME PAGE ─────────────────────────────────────────────────────────────────
function HomePage({ data, setData, showToast, dark, kpiGoals, updateGoal }) {
  const [showWAModal, setShowWAModal] = useState(false);
  const totalRevenue  = data.sales.reduce((s, x) => s + x.total_amount, 0);
  const totalExpenses = data.expenses.filter(e => e.status === "approved").reduce((s, x) => s + x.amount, 0);
  const totalProfit   = data.sales.reduce((s, x) => s + x.profit, 0);
  const lowStock      = data.products.filter(p => p.stock_quantity <= p.low_stock_alert);
  const revenueGoal   = kpiGoals.home_revenue;

  return (
    <div className="page-bg page-content fade-in">
      {/* Greeting */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 13, color: "#7B91C4", marginBottom: 3 }}>Bienvenue 👋</div>
          <h1 style={{ fontFamily: "'Bricolage Grotesque'", fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>{data.user.name.split(" ").slice(0,2).join(" ")}</h1>
          <div style={{ fontSize: 12, color: "#7B91C4", marginTop: 3 }}>{data.user.company} · {data.user.role}</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className="btn btn-ghost" onClick={() => showToast("Export PDF en cours...", "info")}>📥 Export</button>
          <button className="btn btn-wa" onClick={() => setShowWAModal(true)}>💬 Rapport WA</button>
        </div>
      </div>

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
        <MiniKpiCard icon="✨" label="Profit Net" value={fmt(totalProfit)} trend="+23.7%" trendUp={true} color="#16C55E" />
        <MiniKpiCard icon="🛍️" label="Ventes" value={data.sales.length} trend="+12%" trendUp={true} color="#F5C518" />
        <MiniKpiCard icon="⚠️" label="Stock Bas" value={lowStock.length} trendUp={false} color={lowStock.length>0?"#D42B3A":"#16C55E"} />
      </div>

      {/* ── VISUAL ANALYTICS ROW ── */}
      <div className="g3" style={{ marginBottom:16 }}>
        {/* Profit Breakdown Donut */}
        <div className="card card-pad">
          <div className="sec-title" style={{ marginBottom:14 }}>💰 Répartition Profit</div>
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
          <div className="sec-title" style={{ marginBottom:14 }}>💳 Modes de Paiement</div>
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
          <div className="sec-title" style={{ marginBottom:14 }}>📈 Tendance Quotidienne</div>
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
            <div className="g2">
              {[["🛒 Nouvelle Vente","btn-primary"],["🧾 Facture","btn-yellow"],["📝 Devis","btn-ghost"],["📦 Réappro","btn-ghost"]].map(([l,c]) => (
                <button key={l} className={`btn ${c}`} style={{ justifyContent: "center", fontSize: 12, width: "100%" }} onClick={() => showToast(`${l.replace(/[🛒🧾📝📦]/g,"")} lancé`, "info")}>{l}</button>
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

      {/* Product Performance Mini Bars */}
      <div className="card card-pad" style={{ marginBottom:16 }}>
        <div className="sec-title" style={{ marginBottom:14 }}>📦 Performance par Produit</div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:100 }}>
          {data.products.map(p => {
            const rev = data.sales.filter(s=>s.product_name===p.name).reduce((a,s)=>a+s.total_amount,0);
            const maxRev = Math.max(...data.products.map(pr => data.sales.filter(s=>s.product_name===pr.name).reduce((a,s)=>a+s.total_amount,0)), 1);
            return (
              <div key={p.id} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#1A56FF" }}>{fmt(rev)}</div>
                <div style={{ width:"100%", height:`${Math.max((rev/maxRev)*100,6)}%`, borderRadius:"6px 6px 0 0", background:"linear-gradient(180deg,#1A56FF,#0D3DCC)", transition:"height 0.5s" }} />
                <div style={{ fontSize:9, color:"#7B91C4", textAlign:"center", maxWidth:60, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.emoji} {p.name.split(" ")[0]}</div>
              </div>
            );
          })}
        </div>
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
          <div className="form-group"><label className="form-label">Numéro destinataire</label><input placeholder="+243 8XX XXX XXX" /></div>
          <button className="btn btn-wa" style={{ width:"100%", justifyContent:"center" }} onClick={() => { showToast("Rapport envoyé via WhatsApp!", "whatsapp"); setShowWAModal(false); }}>📤 Envoyer</button>
        </Modal>
      )}
    </div>
  );
}

// ─── SALES PAGE ────────────────────────────────────────────────────────────────
function SalesPage({ data, setData, showToast, kpiGoals, updateGoal }) {
  const [tab, setTab] = useState("pos");
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");
  const [payMethod, setPayMethod] = useState("cash");

  const filtered = data.products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const cartTotal = cart.reduce((s, i) => s + i.unit_price * i.qty, 0);
  const cartProfit = cart.reduce((s, i) => s + (i.unit_price - i.cogs) * i.qty, 0);
  const salesGoal = kpiGoals.sales_daily;

  const addToCart = (p) => {
    setCart(prev => { const ex = prev.find(i => i.id === p.id); return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }]; });
  };
  const changeQty = (id, d) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + d) } : i).filter(i => i.qty > 0));
  const clearCart = () => setCart([]);

  const completeSale = () => {
    if (!cart.length) return showToast("Ajoutez des produits au panier", "error");
    cart.forEach(item => {
      const newSale = { id: Date.now() + item.id, product_name: item.name, client_name: selectedClient || "Client comptoir", quantity: item.qty, unit_price: item.unit_price, total_amount: item.unit_price * item.qty, profit: (item.unit_price - item.cogs) * item.qty, payment_method: payMethod, sale_date: new Date().toISOString().split("T")[0] };
      setData(d => ({ ...d, sales: [newSale, ...d.sales], products: d.products.map(p => p.id === item.id ? { ...p, stock_quantity: p.stock_quantity - item.qty } : p) }));
    });
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
      <div className="sec-head"><h1 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:22, fontWeight:800 }}>◈ Ventes & POS</h1></div>
      <div className="tabs" style={{ marginBottom: 20 }}>
        {[["pos","🛒 Point de Vente"],["history","📋 Historique"],["invoices","🧾 Factures"]].map(([k,l]) => (
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
                      <div style={{ fontSize:11, color:"#1A56FF" }}>{fmt(item.unit_price)} × {item.qty}</div>
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

      {tab === "invoices" && (
        <div className="card card-pad" style={{ textAlign:"center", padding:40 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🧾</div>
          <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:20, fontWeight:800, marginBottom:8 }}>Générateur de Factures</div>
          <div style={{ fontSize:13, color:"#7B91C4", marginBottom:20 }}>Créez des factures professionnelles PDF en un clic</div>
          <button className="btn btn-primary" onClick={() => showToast("Nouvelle facture créée!", "success")}>➕ Nouvelle Facture</button>
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
                <button className="btn btn-wa" style={{ flex:1, justifyContent:"center", fontSize:11 }} onClick={e => { e.stopPropagation(); showToast(`WhatsApp à ${c.name}`, "whatsapp"); }}>💬 WA</button>
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
                      {c.credit_balance > 0 && <button className="btn btn-wa" style={{ fontSize:11, padding:"5px 10px", borderRadius:8 }} onClick={() => showToast(`Rappel envoyé à ${c.name}`, "whatsapp")}>💬 Rappel</button>}
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
            <button className="btn btn-wa" style={{ flex:1, justifyContent:"center" }} onClick={() => showToast(`WhatsApp à ${selected.name}!`, "whatsapp")}>💬 WhatsApp</button>
            <button className="btn btn-red" onClick={() => showToast("Rappel de paiement envoyé!", "whatsapp")}>⚠️ Rappel</button>
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
  const [editPost, setEditPost] = useState(null); // { ...post, isAI:bool }
  const tooltipRef = useRef(null);

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
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h1 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:22, fontWeight:800 }}>◉ Marketing Hub</h1>
        <button className="btn btn-primary" onClick={() => showToast("Analytics...", "info")}>📊 Analytics</button>
      </div>
      <div className="tabs" style={{ marginBottom:20 }}>
        {[["content","🤖 AI Content"],["calendar","📅 Calendrier & Timeline"],["posts","📱 Posts"],["campaigns","🚀 Campagnes"]].map(([k,l]) => (
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
                      <div key={day} style={{ minHeight:72, padding:"5px 4px 3px", borderRadius:8, background: isToday?"rgba(26,86,255,0.1)":posts.length?"rgba(26,86,255,0.03)":"transparent", border:`1px solid ${isToday?"rgba(26,86,255,0.35)":posts.length?"rgba(26,86,255,0.1)":"rgba(26,86,255,0.04)"}` }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:3 }}>
                          <span style={{ fontSize:12, fontWeight:isToday?800:400, color:isToday?"#1A56FF":posts.length?"#EEF2FF":"#7B91C4" }}>{day}</span>
                          {posts.some(p=>p.status==="ai_proposed") && <span style={{ fontSize:9, animation:"pulse 2s infinite" }}>✨</span>}
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

      {hovPost && <Tooltip post={hovPost.post} rect={hovPost.rect} />}

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

  const totalRev  = data.sales.reduce((s,x) => s+x.total_amount, 0);
  const totalExp  = data.expenses.filter(e=>e.status==="approved").reduce((s,x) => s+x.amount, 0);
  const netProfit = totalRev - totalExp;

  const cashbook = [
    ...data.sales.map(s   => ({ date:s.sale_date,   desc:`Vente: ${s.product_name}`,   type:"in",  amount:s.total_amount })),
    ...data.expenses.filter(e=>e.status==="approved").map(e => ({ date:e.expense_date, desc:e.description, type:"out", amount:e.amount })),
  ].sort((a,b) => new Date(b.date)-new Date(a.date));

  return (
    <div className="page-bg page-content fade-in">
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
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <h1 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:22, fontWeight:800 }}>⊛ Comptabilité</h1>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-ghost" onClick={() => showToast("Export comptable...", "info")}>📥 Export</button>
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
                    <tr key={i}>
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

// ─── WHATSAPP BOT PAGE ─────────────────────────────────────────────────────────
const WA_BOT_CMDS = [
  { cmd:"AIDE",     icon:"❓", desc:"Liste toutes les commandes" },
  { cmd:"SOLDE",    icon:"💳", desc:"Solde crédit du client" },
  { cmd:"FACTURE",  icon:"🧾", desc:"Dernière facture" },
  { cmd:"COMMANDE", icon:"🛒", desc:"Passer une commande" },
  { cmd:"RAPPORT",  icon:"📊", desc:"Rapport journalier (admin)" },
  { cmd:"STOCK",    icon:"📦", desc:"Disponibilité produit" },
];
const BOT_REPLIES = {
  AIDE:     "🤖 *Commandes disponibles:*\n💳 SOLDE · 🧾 FACTURE · 🛒 COMMANDE\n📊 RAPPORT · 📦 STOCK · ❓ AIDE\n\n_Bot Mukendi BizPlatform_ 🇨🇩",
  SOLDE:    "💳 *VOTRE SOLDE*\n━━━━━━━━━━━━━━━\nSolde dû: *$120.00*\nLimite: $500.00\n\nPaiement: 📱 M-PESA +243 8XX XXX XXX\n_Mukendi BizPlatform_ 🇨🇩",
  FACTURE:  "🧾 *FACTURE #FAC-000234*\n━━━━━━━━━━━━━━━\n• Sac de Riz 25kg x5 = $110.00\n• Eau Minérale x24 = $36.00\n\n*TOTAL: $146.00*\n_Mukendi BizPlatform_ 🇨🇩",
  COMMANDE: "🛒 Pour commander, envoyez:\n*ARTICLE: [nom]*\n*QTÉ: [quantité]*\n\nUn agent confirmera sous peu.\n_Mukendi Enterprises_ 🇨🇩",
  RAPPORT:  "📊 *RAPPORT DU JOUR*\n━━━━━━━━━━━━━━━\n💰 Revenus: *$753.50*\n✨ Profit: *$241.20*\n🛍️ Ventes: *12*\n_Mukendi BizPlatform_ 🇨🇩",
  STOCK:    "📦 Envoyez *STOCK [nom produit]* pour vérifier la disponibilité.\nEx: STOCK Eau Minérale\n_Mukendi BizPlatform_ 🇨🇩",
};

function WhatsAppPage({ data, showToast, kpiGoals, updateGoal }) {
  const [waTab, setWaTab] = useState("connect");
  const [status, setStatus] = useState("disconnected"); // disconnected | scanning | connected
  const [qrVisible, setQrVisible] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [serverOk, setServerOk] = useState(null); // null=unknown, true, false
  const [checking, setChecking] = useState(false);
  const [messages, setMessages] = useState([
    { id:1, contactId:"243812345678", from:"243812345678", body:"Bonjour! Je voudrais commander du riz.",            fromMe:false, time:"09:14" },
    { id:2, contactId:"243812345678", from:"me",           body:"Bonjour Marie! Bien sûr, quelle quantité?",        fromMe:true,  time:"09:15" },
    { id:3, contactId:"243856789012", from:"243856789012", body:"FACTURE",                                           fromMe:false, time:"10:22" },
    { id:4, contactId:"243856789012", from:"me",           body:"🧾 *FACTURE #FAC-000234*\n━━━━━━━━━━━━━━━\n• Sac de Riz 25kg x5 = $110.00\n• Eau Minérale x24 = $36.00\n\n*TOTAL: $146.00*\n_Mukendi BizPlatform_ 🇨🇩", fromMe:true, time:"10:22" },
    { id:5, contactId:"243823456789", from:"243823456789", body:"SOLDE",                                             fromMe:false, time:"11:05" },
    { id:6, contactId:"243823456789", from:"me",           body:"💳 *VOTRE SOLDE*\n━━━━━━━━━━━━━━━\nSolde dû: *$1,200.00*\nLimite: $5,000.00\n\nPaiement: 📱 M-PESA +243 8XX XXX XXX\n_Mukendi BizPlatform_ 🇨🇩", fromMe:true, time:"11:05" },
  ]);
  const [activeContact, setActiveContact] = useState(null);
  const [input, setInput] = useState("");
  const [showCmds, setShowCmds] = useState(false);
  const [broadcastSel, setBroadcastSel] = useState(new Set());
  const [broadcastTpl, setBroadcastTpl] = useState("daily");
  const [broadcastDelay, setBroadcastDelay] = useState(3);
  const [broadcastCustom, setBroadcastCustom] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [broadcastResults, setBroadcastResults] = useState([]);
  const [broadcasting, setBroadcasting] = useState(false);
  const [testNumber, setTestNumber] = useState("");
  const [testMsg, setTestMsg] = useState("Bonjour! Ceci est un test du bot Mukendi BizPlatform 🇨🇩");
  const [sendingTest, setSendingTest] = useState(false);
  const bottomRef = useRef(null);

  const contacts = data.clients.map(c => ({ id: c.phone.replace(/\D/g,""), name:c.name, phone:c.phone, status:c.status, credit:c.credit_balance }));

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, activeContact]);

  // ── Real server check ──
  const checkServer = async () => {
    setChecking(true);
    try {
      const r = await fetch("http://localhost:3001/health", { signal: AbortSignal.timeout(2500) });
      const d = await r.json();
      setServerOk(true);
      if (d.whatsapp === "connected") setStatus("connected");
      showToast("✅ Serveur backend trouvé!", "success");
    } catch {
      setServerOk(false);
      showToast("Backend non trouvé — mode démo activé", "warning");
    } finally { setChecking(false); }
  };

  const requestQR = async () => {
    setQrLoading(true); setStatus("scanning");
    if (serverOk) {
      try {
        const r = await fetch("http://localhost:3001/qr");
        const d = await r.json();
        if (d.qr) { setQrVisible(true); showToast("QR reçu du serveur!", "success"); }
      } catch { /* fallback demo */ }
    }
    setTimeout(() => { setQrVisible(true); setQrLoading(false); }, 1200);
  };

  const simulateConnect = () => { setStatus("connected"); setQrVisible(false); showToast("✅ WhatsApp connecté!", "whatsapp"); };

  const disconnect = async () => {
    if (serverOk) { try { await fetch("http://localhost:3001/disconnect",{method:"POST"}); } catch {} }
    setStatus("disconnected"); setQrVisible(false); showToast("Déconnecté de WhatsApp", "info");
  };

  // ── Real send via server or demo ──
  const sendMessage = useCallback(async (contactId, body) => {
    const time = new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
    const contact = contacts.find(c => c.id === contactId);
    setMessages(p => [...p, { id:Date.now(), contactId, from:"me", body, fromMe:true, time }]);

    if (serverOk && contact) {
      try {
        await fetch("http://localhost:3001/send", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ phone: contact.phone, message: body }) });
        return;
      } catch {}
    }

    // Demo bot auto-reply
    const cmd = body.trim().toUpperCase().split(" ")[0];
    if (BOT_REPLIES[cmd]) {
      setTimeout(() => {
        setMessages(p => [...p, { id:Date.now()+1, contactId, from:contactId, body:BOT_REPLIES[cmd], fromMe:false, time:new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}) }]);
      }, 1200);
    }
  }, [serverOk, contacts]);

  const sendTest = async () => {
    if (!testNumber.trim()) return showToast("Entrez un numéro", "error");
    setSendingTest(true);
    try {
      if (serverOk) {
        const r = await fetch("http://localhost:3001/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone:testNumber,message:testMsg})});
        const d = await r.json();
        if (d.success) { showToast("✅ Message envoyé via serveur!", "whatsapp"); }
        else { throw new Error(); }
      } else {
        await new Promise(r => setTimeout(r, 1000));
        showToast("✅ Message simulé envoyé! (mode démo)", "whatsapp");
      }
    } catch { showToast("Échec envoi — vérifiez le serveur", "error"); }
    finally { setSendingTest(false); }
  };

  const doBroadcast = async () => {
    if (!broadcastSel.size) return showToast("Sélectionnez des contacts", "error");
    if (status !== "connected") return showToast("Connectez WhatsApp d'abord", "error");
    setBroadcasting(true); setBroadcastResults([]);
    const ids = [...broadcastSel];
    const tpl = WA_TEMPLATES.find(t => t.id === broadcastTpl);
    const body = useCustom ? broadcastCustom : tpl?.generate({ revenue:753.5, expenses:195, sales:12, clientName:"[Client]", credit:350, productName:"Eau Minérale", promoPrice:1.2, deadline:"28/03/2025" }) || "";
    for (const id of ids) {
      const c = contacts.find(x => x.id === id);
      await new Promise(r => setTimeout(r, broadcastDelay * 1000));
      sendMessage(id, body);
      setBroadcastResults(p => [...p, { contact:c, success:true }]);
    }
    setBroadcasting(false);
    showToast(`✅ Diffusion terminée: ${ids.length} envoyés!`, "whatsapp");
  };

  const contactMsgs = messages.filter(m => m.contactId === activeContact?.id);
  const unread = (id) => messages.filter(m => m.from===id && !m.fromMe).length;

  const sColors = { connected:"#16C55E", scanning:"#F5C518", disconnected:"#D42B3A" };
  const sLabels = { connected:"Connecté", scanning:"Connexion...", disconnected:"Déconnecté" };

  const WA_TABS = [["connect","🔗 Connexion"],["chat","💬 Chat"],["broadcast","📢 Diffusion"],["test","🧪 Test Direct"],["commands","🤖 Bot Config"]];

  return (
    <div className="page-bg page-content fade-in">
      <HeroBanner
        label="TAUX DE RÉPONSE BOT"
        value="94%"
        subtitle={`${messages.length} messages · ${contacts.length} contacts`}
        progress={94}
        progressLabel="Réponse automatique"
        trend="+2%"
        trendUp={true}
        icon="🤖"
      />
      <div className="mini-kpi-grid">
        <MiniKpiCard icon="💬" label="Messages" value={messages.length} color="#25D366" />
        <MiniKpiCard icon="👥" label="Contacts" value={contacts.length} color="#1A56FF" />
        <MiniKpiCard icon="📢" label="Diffusions" value={broadcastResults.length} color="#F5C518" />
        <MiniKpiCard icon="🔗" label="Statut" value={status==="connected"?"✅":"⭕"} color={status==="connected"?"#16C55E":"#D42B3A"} />
      </div>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:46, height:46, borderRadius:12, background:"linear-gradient(135deg,#25D366,#075E54)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:"0 4px 16px rgba(37,211,102,0.3)" }}>💬</div>
          <div>
            <h1 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:22, fontWeight:800, letterSpacing:"-0.3px" }}>WhatsApp Bot Hub</h1>
            <div style={{ fontSize:11, color:"#7B91C4" }}>Bot automatique · Chat en direct · Diffusion</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button className="btn btn-ghost" onClick={checkServer} disabled={checking} style={{ fontSize:12 }}>
            {checking ? <Spinner /> : "🔌"} Tester serveur
          </button>
          {serverOk !== null && (
            <span className="tag" style={{ background: serverOk?"rgba(22,197,94,0.12)":"rgba(212,43,58,0.12)", color: serverOk?"#16C55E":"#D42B3A" }}>
              {serverOk ? "✅ Serveur OK" : "⚠️ Mode démo"}
            </span>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:7, padding:"6px 14px", background:`${sColors[status]}12`, border:`1px solid ${sColors[status]}40`, borderRadius:20 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:sColors[status], animation:status==="connected"?"pulse 2s infinite":"none" }} />
            <span style={{ fontSize:12, fontWeight:700, color:sColors[status] }}>{sLabels[status]}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom:20 }}>
        {WA_TABS.map(([k,l]) => <div key={k} className={`tab ${waTab===k?"active":""}`} onClick={() => setWaTab(k)}>{l}</div>)}
      </div>

      {/* ── CONNECT TAB ── */}
      {waTab==="connect" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div className="card card-pad">
            {status==="connected" ? (
              <div style={{ textAlign:"center", padding:"32px 0" }}>
                <div style={{ width:72, height:72, borderRadius:"50%", background:"rgba(37,211,102,0.12)", border:"2px solid rgba(37,211,102,0.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, margin:"0 auto 16px", animation:"pulse 2s infinite" }}>✅</div>
                <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:22, fontWeight:800, color:"#25D366", marginBottom:6 }}>WhatsApp Connecté!</div>
                <div style={{ fontSize:13, color:"#7B91C4", marginBottom:24 }}>Le bot répond automatiquement à vos clients.</div>
                <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                  <button className="btn btn-wa" onClick={() => setWaTab("chat")}>💬 Ouvrir Chat</button>
                  <button style={{ padding:"9px 18px", background:"rgba(37,211,102,0.08)", border:"1px solid rgba(37,211,102,0.25)", borderRadius:9, color:"#25D366", fontFamily:"'DM Sans'", fontSize:13, fontWeight:600, cursor:"pointer" }} onClick={() => setWaTab("broadcast")}>📢 Diffuser</button>
                  <button className="btn btn-red" onClick={disconnect}>🔌 Déconnecter</button>
                </div>
              </div>
            ) : !qrVisible ? (
              <div style={{ textAlign:"center", padding:"32px 0" }}>
                <div style={{ fontSize:56, marginBottom:14 }}>📱</div>
                <div style={{ fontFamily:"'Bricolage Grotesque'", fontSize:22, fontWeight:800, marginBottom:8 }}>Lier WhatsApp</div>
                <div style={{ fontSize:13, color:"#7B91C4", marginBottom:6 }}>Sans clé API · Sans frais mensuels</div>
                <div style={{ fontSize:11, color:"#7B91C4", marginBottom:24 }}>Via <strong>whatsapp-web.js</strong> · connexion QR</div>
                <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
                  <button onClick={requestQR} style={{ padding:"12px 28px", background:"linear-gradient(135deg,#25D366,#128C7E)", border:"none", borderRadius:10, color:"white", fontFamily:"'DM Sans'", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 16px rgba(37,211,102,0.3)", display:"inline-flex", alignItems:"center", gap:8 }}>
                    {qrLoading ? <Spinner /> : "📷"} Générer QR Code
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"24px 0" }}>
                {/* QR Frame */}
                <div style={{ position:"relative", marginBottom:20 }}>
                  {/* Corners */}
                  {[[{top:-7,left:-7},{borderTop:"3px solid #25D366",borderLeft:"3px solid #25D366",borderRadius:"4px 0 0 0"}],[{top:-7,right:-7},{borderTop:"3px solid #25D366",borderRight:"3px solid #25D366",borderRadius:"0 4px 0 0"}],[{bottom:-7,left:-7},{borderBottom:"3px solid #25D366",borderLeft:"3px solid #25D366",borderRadius:"0 0 0 4px"}],[{bottom:-7,right:-7},{borderBottom:"3px solid #25D366",borderRight:"3px solid #25D366",borderRadius:"0 0 4px 0"}]].map(([pos,brd],i) => (
                    <div key={i} style={{ position:"absolute", width:22, height:22, ...pos, ...brd }} />
                  ))}
                  <div style={{ width:192, height:192, background:"white", borderRadius:10, padding:10, display:"grid", gridTemplateColumns:"repeat(21,1fr)", gap:"0.5px", boxShadow:"0 0 0 1px rgba(37,211,102,0.3),0 0 24px rgba(37,211,102,0.12)" }}>
                    {Array.from({length:441},(_,i) => {
                      const r=Math.floor(i/21),c=i%21;
                      const finder=(r<7&&c<7)||(r<7&&c>13)||(r>13&&c<7);
                      const inner=(r>=1&&r<=5&&c>=1&&c<=5)||(r>=1&&r<=5&&c>=15&&c<=19)||(r>=15&&r<=19&&c>=1&&c<=5);
                      const center=(r>=2&&r<=4&&c>=2&&c<=4)||(r>=2&&r<=4&&c>=16&&c<=18)||(r>=16&&r<=18&&c>=2&&c<=4);
                      const seed=((i*2654435761)>>>0);
                      const dark2=finder?(!inner||center):(seed%3!==0);
                      return <div key={i} style={{ background:dark2?"#111":"white", borderRadius:1 }} />;
                    })}
                  </div>
                  <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:40, height:40, background:"#25D366", borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center", border:"3px solid white", fontSize:20 }}>💬</div>
                </div>
                <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:15, marginBottom:6 }}>Scanner avec WhatsApp</div>
                <div style={{ fontSize:12, color:"#7B91C4", textAlign:"center", lineHeight:1.7, marginBottom:16 }}>
                  WhatsApp → ⋮ → <strong>Appareils liés</strong><br />→ <strong>Lier un appareil</strong> → Scanner ce code
                </div>
                <div style={{ display:"flex", gap:10 }}>
                  <button onClick={requestQR} style={{ padding:"8px 14px", background:"rgba(37,211,102,0.08)", border:"1px solid rgba(37,211,102,0.25)", borderRadius:8, color:"#25D366", fontFamily:"'DM Sans'", fontSize:12, fontWeight:600, cursor:"pointer" }}>🔄 Nouveau QR</button>
                  <button onClick={simulateConnect} style={{ padding:"8px 14px", background:"rgba(37,211,102,0.15)", border:"1px solid rgba(37,211,102,0.35)", borderRadius:8, color:"#25D366", fontFamily:"'DM Sans'", fontSize:12, fontWeight:700, cursor:"pointer" }}>✅ Simuler connexion</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* System status */}
            <div className="card card-pad-sm">
              <div className="sec-title" style={{ marginBottom:12 }}>⚙️ Statut Système</div>
              {[["🖥️ Backend Node.js","ws://localhost:3001",serverOk?true:false],["📱 Session WhatsApp","Appareil principal",status==="connected"],["🤖 Bot Auto-réponse","6 commandes actives",status==="connected"]].map(([lbl,detail,ok],i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom: i<2?"1px solid rgba(26,86,255,0.08)":"none" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600 }}>{lbl}</div>
                    <div style={{ fontSize:10, color:"#7B91C4", marginTop:1 }}>{detail}</div>
                  </div>
                  <span className="tag" style={{ background:ok?"rgba(22,197,94,0.12)":"rgba(212,43,58,0.1)", color:ok?"#16C55E":"#D42B3A", fontSize:10 }}>{ok?"✅ OK":"⭕ OFF"}</span>
                </div>
              ))}
            </div>

            {/* Setup guide */}
            <div className="card card-pad-sm">
              <div className="sec-title" style={{ marginBottom:12 }}>🚀 Guide de démarrage</div>
              {[["1","Installer dépendances","npm install whatsapp-web.js express ws"],["2","Démarrer le serveur","node whatsapp-server.js"],["3","Tester la connexion","Bouton «Tester serveur»"],["4","Générer le QR","Cliquez «Générer QR Code»"],["5","Scanner & profiter","WhatsApp → Appareils liés"]].map(([n,t,d]) => (
                <div key={n} style={{ display:"flex", gap:10, padding:"6px 0" }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:"rgba(37,211,102,0.12)", border:"1px solid rgba(37,211,102,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"#25D366", flexShrink:0, marginTop:1 }}>{n}</div>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600 }}>{t}</div>
                    <div style={{ fontSize:10, color:"#7B91C4", fontFamily:"monospace", marginTop:1 }}>{d}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding:"12px 14px", background:"rgba(245,197,24,0.06)", border:"1px solid rgba(245,197,24,0.2)", borderRadius:10 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#F5C518", marginBottom:4 }}>⚠️ Note importante</div>
              <div style={{ fontSize:11, color:"#7B91C4", lineHeight:1.6 }}>Cette intégration utilise <strong>whatsapp-web.js</strong> (non-officiel). Pour usage commercial intensif, utilisez l'API Meta Business officielle.</div>
            </div>
          </div>
        </div>
      )}

      {/* ── CHAT TAB ── */}
      {waTab==="chat" && (
        <div>
          {status !== "connected" && (
            <div style={{ padding:"10px 14px", marginBottom:14, background:"rgba(245,197,24,0.06)", border:"1px solid rgba(245,197,24,0.2)", borderRadius:9, display:"flex", alignItems:"center", gap:8 }}>
              <span>⚠️</span><span style={{ fontSize:12, color:"#F5C518" }}>WhatsApp non connecté — </span>
              <span style={{ fontSize:12, color:"#F5C518", textDecoration:"underline", cursor:"pointer" }} onClick={() => setWaTab("connect")}>Se connecter →</span>
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"240px 1fr", borderRadius:14, overflow:"hidden", border:"1px solid rgba(26,86,255,0.14)", height:520 }}>
            {/* Contact list */}
            <div style={{ background:"rgba(5,13,31,0.8)", borderRight:"1px solid rgba(26,86,255,0.1)", display:"flex", flexDirection:"column" }}>
              <div style={{ padding:"12px", borderBottom:"1px solid rgba(26,86,255,0.08)" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#3A4E7A", textTransform:"uppercase", letterSpacing:0.5 }}>Conversations</div>
              </div>
              <div style={{ flex:1, overflowY:"auto" }}>
                {contacts.map(c => {
                  const last = [...messages].reverse().find(m => m.contactId===c.id);
                  const u = unread(c.id);
                  const isActive = activeContact?.id === c.id;
                  return (
                    <div key={c.id} onClick={() => setActiveContact(c)}
                      style={{ padding:"10px 12px", cursor:"pointer", display:"flex", alignItems:"center", gap:10, background: isActive?"rgba(37,211,102,0.08)":"transparent", borderLeft:`3px solid ${isActive?"#25D366":"transparent"}` }}>
                      <div style={{ position:"relative", flexShrink:0 }}>
                        <Avatar name={c.name} size={32} color={c.status==="vip"?"#F5C518":"#1A56FF"} />
                        {u > 0 && <div style={{ position:"absolute", top:-2, right:-2, width:14, height:14, borderRadius:"50%", background:"#25D366", fontSize:8, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", color:"white" }}>{u}</div>}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.name}</div>
                        <div style={{ fontSize:10, color:"#3A4E7A", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", marginTop:1 }}>{last?last.body.slice(0,24)+"…":c.phone}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat window */}
            <div style={{ display:"flex", flexDirection:"column", background:"rgba(5,13,31,0.95)" }}>
              {activeContact ? (
                <>
                  <div style={{ padding:"10px 14px", borderBottom:"1px solid rgba(26,86,255,0.08)", display:"flex", alignItems:"center", gap:12 }}>
                    <Avatar name={activeContact.name} size={34} color="#25D366" />
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:13 }}>{activeContact.name}</div>
                      <div style={{ fontSize:10, color:"#25D366" }}>● {activeContact.phone}</div>
                    </div>
                    {activeContact.credit > 0 && <span className="tag" style={{ background:"rgba(212,43,58,0.12)", color:"#D42B3A", fontSize:10 }}>💳 ${activeContact.credit}</span>}
                    <button className="btn btn-wa btn-icon" style={{ fontSize:11, padding:"6px 12px" }} onClick={() => showToast(`Ouvrir WhatsApp pour ${activeContact.name}`, "whatsapp")}>📤 Ouvrir WA</button>
                  </div>

                  <div style={{ flex:1, overflowY:"auto", padding:14, display:"flex", flexDirection:"column", gap:10 }}>
                    {contactMsgs.length === 0 && (
                      <div style={{ textAlign:"center", padding:"40px 0", color:"#3A4E7A" }}>
                        <div style={{ fontSize:32, marginBottom:6 }}>💬</div>
                        <div style={{ fontSize:12 }}>Aucun message. Envoyez le premier!</div>
                      </div>
                    )}
                    {contactMsgs.map((m) => (
                      <div key={m.id} style={{ display:"flex", justifyContent: m.fromMe?"flex-end":"flex-start", animation:"fadeIn 0.2s ease" }}>
                        <div className={m.fromMe?"wa-msg-out":"wa-msg-in"}>
                          {m.body}
                          <div className="wa-time">{m.time}{m.fromMe&&" ✓✓"}</div>
                        </div>
                      </div>
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  {showCmds && (
                    <div style={{ padding:"6px 10px", borderTop:"1px solid rgba(26,86,255,0.08)", display:"flex", flexWrap:"wrap", gap:5 }}>
                      {WA_BOT_CMDS.map(c => (
                        <button key={c.cmd} onClick={() => { setInput(c.cmd); setShowCmds(false); }}
                          style={{ padding:"4px 10px", background:"rgba(37,211,102,0.08)", border:"1px solid rgba(37,211,102,0.2)", borderRadius:20, fontSize:11, color:"#25D366", cursor:"pointer", display:"flex", alignItems:"center", gap:4, fontFamily:"'DM Sans'", fontWeight:600 }}>
                          {c.icon} {c.cmd}
                        </button>
                      ))}
                    </div>
                  )}

                  <div style={{ padding:"8px 10px", borderTop:"1px solid rgba(26,86,255,0.08)", display:"flex", gap:6, alignItems:"flex-end" }}>
                    <button onClick={() => setShowCmds(s => !s)}
                      style={{ width:34, height:34, borderRadius:"50%", background: showCmds?"rgba(37,211,102,0.15)":"rgba(255,255,255,0.05)", border:`1px solid ${showCmds?"rgba(37,211,102,0.35)":"rgba(26,86,255,0.15)"}`, cursor:"pointer", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      ⚡
                    </button>
                    <textarea value={input} onChange={e => setInput(e.target.value)}
                      onKeyDown={e => { if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); if(!input.trim()) return; sendMessage(activeContact.id,input.trim()); setInput(""); setShowCmds(false); } }}
                      placeholder={status==="connected"?"Message ou ⚡ commandes bot...":"Connectez WhatsApp d'abord..."}
                      disabled={status!=="connected"} rows={1}
                      style={{ flex:1, borderRadius:18, padding:"9px 14px", fontSize:12, resize:"none", maxHeight:80, overflowY:"auto" }} />
                    <button onClick={() => { if(!input.trim()) return; sendMessage(activeContact.id,input.trim()); setInput(""); setShowCmds(false); }}
                      disabled={status!=="connected"||!input.trim()}
                      style={{ width:34, height:34, borderRadius:"50%", background: status==="connected"&&input.trim()?"#25D366":"rgba(255,255,255,0.05)", border:"none", cursor: status==="connected"&&input.trim()?"pointer":"default", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s", color:"white" }}>
                      ➤
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:"#3A4E7A" }}>
                  <div style={{ fontSize:44, marginBottom:10 }}>💬</div>
                  <div style={{ fontSize:14, fontWeight:600, color:"#7B91C4" }}>Sélectionnez une conversation</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TEST DIRECT TAB ── */}
      {waTab==="test" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div className="card card-pad">
            <div className="sec-title" style={{ marginBottom:16 }}>🧪 Envoyer un Message Test</div>
            <div className="form-group"><label className="form-label">Numéro WhatsApp destinataire</label>
              <input value={testNumber} onChange={e => setTestNumber(e.target.value)} placeholder="+243 8XX XXX XXX" />
            </div>
            <div className="form-group"><label className="form-label">Message</label>
              <textarea value={testMsg} onChange={e => setTestMsg(e.target.value)} rows={5} />
            </div>
            <div style={{ marginBottom:14, padding:"10px 12px", background:status==="connected"?"rgba(22,197,94,0.06)":"rgba(212,43,58,0.06)", border:`1px solid ${status==="connected"?"rgba(22,197,94,0.2)":"rgba(212,43,58,0.15)"}`, borderRadius:9 }}>
              <div style={{ fontSize:11, fontWeight:600, color:status==="connected"?"#16C55E":"#D42B3A" }}>
                {status==="connected" ? serverOk?"✅ Envoi réel via serveur Node.js":"✅ Envoi simulé (mode démo)" : "⚠️ WhatsApp non connecté — envoi simulé"}
              </div>
            </div>
            <button className="btn btn-wa" style={{ width:"100%", justifyContent:"center" }} onClick={sendTest} disabled={sendingTest}>
              {sendingTest ? <Spinner /> : "📤"} Envoyer Message Test
            </button>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:12 }}>🤖 Tester les Commandes Bot</div>
              <div style={{ fontSize:12, color:"#7B91C4", marginBottom:12 }}>Cliquez pour préremplir et tester en Chat:</div>
              {WA_BOT_CMDS.map(c => (
                <div key={c.cmd} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(26,86,255,0.07)", cursor:"pointer" }}
                  onClick={() => { setTestMsg(c.cmd); setWaTab("chat"); if(contacts[0]) setActiveContact(contacts[0]); showToast(`Commande ${c.cmd} prête à tester!`, "info"); }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:"rgba(37,211,102,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>{c.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"monospace", fontWeight:800, fontSize:14, color:"#25D366" }}>{c.cmd}</div>
                    <div style={{ fontSize:11, color:"#7B91C4" }}>{c.desc}</div>
                  </div>
                  <span style={{ fontSize:11, color:"#1A56FF" }}>→ Tester</span>
                </div>
              ))}
            </div>

            <div className="card card-pad-sm" style={{ background:"rgba(37,211,102,0.03)", borderColor:"rgba(37,211,102,0.2)" }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#25D366", marginBottom:8 }}>📋 Réponse attendue: FACTURE</div>
              <div style={{ fontSize:11, color:"#7B91C4", whiteSpace:"pre-wrap", fontFamily:"monospace", lineHeight:1.7 }}>{BOT_REPLIES.FACTURE}</div>
            </div>
          </div>
        </div>
      )}

      {/* ── BROADCAST TAB ── */}
      {waTab==="broadcast" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div className="card card-pad">
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
                <div className="sec-title">👥 Destinataires</div>
                <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={() => setBroadcastSel(s => s.size===contacts.length?new Set():new Set(contacts.map(c=>c.id)))}>
                  {broadcastSel.size===contacts.length?"Désélectionner":"Tout sélectionner"}
                </button>
              </div>
              {contacts.map(c => (
                <label key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid rgba(26,86,255,0.07)", cursor:"pointer" }}>
                  <input type="checkbox" checked={broadcastSel.has(c.id)} onChange={() => setBroadcastSel(s => { const n=new Set(s); n.has(c.id)?n.delete(c.id):n.add(c.id); return n; })} style={{ accentColor:"#25D366", width:14, height:14, cursor:"pointer" }} />
                  <Avatar name={c.name} size={28} color={c.status==="vip"?"#F5C518":"#1A56FF"} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600 }}>{c.name}</div>
                    <div style={{ fontSize:10, color:"#7B91C4" }}>{c.phone}</div>
                  </div>
                  <Tag status={c.status} />
                </label>
              ))}
              <div style={{ fontSize:12, color:"#25D366", fontWeight:600, marginTop:8 }}>{broadcastSel.size} sélectionné(s)</div>
            </div>

            <div className="card card-pad-sm">
              <div style={{ fontSize:12, fontWeight:600, color:"#7B91C4", marginBottom:8 }}>⏱️ Délai anti-spam</div>
              <div style={{ display:"flex", gap:6 }}>
                {[1,3,5,10].map(d => (
                  <button key={d} onClick={() => setBroadcastDelay(d)}
                    style={{ flex:1, padding:"7px 0", background:broadcastDelay===d?"rgba(37,211,102,0.12)":"transparent", border:`1px solid ${broadcastDelay===d?"rgba(37,211,102,0.35)":"rgba(26,86,255,0.12)"}`, borderRadius:8, color:broadcastDelay===d?"#25D366":"#7B91C4", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans'" }}>
                    {d}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div className="card card-pad">
              <div className="sec-title" style={{ marginBottom:12 }}>📋 Modèle de Message</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                {WA_TEMPLATES.map(t => (
                  <button key={t.id} onClick={() => { setBroadcastTpl(t.id); setUseCustom(false); }}
                    style={{ padding:"5px 12px", background:!useCustom&&broadcastTpl===t.id?"rgba(37,211,102,0.12)":"rgba(26,86,255,0.06)", border:`1px solid ${!useCustom&&broadcastTpl===t.id?"rgba(37,211,102,0.35)":"rgba(26,86,255,0.15)"}`, borderRadius:8, fontSize:12, color:!useCustom&&broadcastTpl===t.id?"#25D366":"#7B91C4", cursor:"pointer", fontFamily:"'DM Sans'", fontWeight:600 }}>
                    {t.icon} {t.name}
                  </button>
                ))}
                <button onClick={() => setUseCustom(true)}
                  style={{ padding:"5px 12px", background:useCustom?"rgba(26,86,255,0.12)":"rgba(26,86,255,0.06)", border:`1px solid ${useCustom?"rgba(26,86,255,0.35)":"rgba(26,86,255,0.15)"}`, borderRadius:8, fontSize:12, color:useCustom?"#1A56FF":"#7B91C4", cursor:"pointer", fontFamily:"'DM Sans'", fontWeight:600 }}>
                  ✏️ Personnalisé
                </button>
              </div>
              {useCustom ? (
                <textarea value={broadcastCustom} onChange={e => setBroadcastCustom(e.target.value)} rows={7} placeholder="*Gras* _Italique_ ~Barré~" />
              ) : (
                <div style={{ background:"rgba(5,13,31,0.6)", borderRadius:9, padding:"10px 14px", fontSize:11, lineHeight:1.7, color:"#7B91C4", whiteSpace:"pre-wrap", maxHeight:180, overflowY:"auto", border:"1px solid rgba(26,86,255,0.1)", fontFamily:"monospace" }}>
                  {(WA_TEMPLATES.find(t=>t.id===broadcastTpl)||WA_TEMPLATES[0]).generate({ revenue:753.5, expenses:195, sales:12, clientName:"[Client]", credit:350, productName:"Eau Minérale", promoPrice:1.2, deadline:"28/03/2025" })}
                </div>
              )}
            </div>

            <button onClick={doBroadcast} disabled={!broadcastSel.size||broadcasting}
              style={{ padding:"13px", background:broadcastSel.size&&!broadcasting?"linear-gradient(135deg,#25D366,#128C7E)":"rgba(26,86,255,0.08)", border:"none", borderRadius:10, color:"white", fontFamily:"'DM Sans'", fontSize:14, fontWeight:700, cursor:broadcastSel.size&&!broadcasting?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", gap:10, transition:"all 0.2s", boxShadow:broadcastSel.size?"0 4px 16px rgba(37,211,102,0.25)":"none" }}>
              {broadcasting ? <><Spinner /> Envoi... ({broadcastResults.length}/{broadcastSel.size})</> : <>📤 Diffuser à {broadcastSel.size} contact(s)</>}
            </button>

            {broadcastResults.length > 0 && (
              <div className="card card-pad-sm" style={{ maxHeight:180, overflowY:"auto" }}>
                <div style={{ fontSize:12, fontWeight:700, marginBottom:8 }}>📊 Résultats</div>
                {broadcastResults.map((r,i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0", fontSize:12 }}>
                    <span>{r.success?"✅":"❌"}</span>
                    <span style={{ flex:1, color:"#7B91C4" }}>{r.contact?.name}</span>
                    <span style={{ color:r.success?"#16C55E":"#D42B3A", fontWeight:600, fontSize:11 }}>{r.success?"Envoyé":"Échec"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BOT CONFIG TAB ── */}
      {waTab==="commands" && (
        <div>
          <div style={{ padding:"12px 16px", background:"rgba(37,211,102,0.05)", border:"1px solid rgba(37,211,102,0.15)", borderRadius:10, marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#25D366" }}>🤖 Bot {status==="connected"?"● Actif":"○ Inactif"}</div>
            <div style={{ fontSize:12, color:"#7B91C4", marginTop:3 }}>Les clients envoient ces mots-clés à votre numéro et reçoivent des réponses automatiques.</div>
          </div>
          <div className="g3" style={{ marginBottom:20 }}>
            {WA_BOT_CMDS.map(c => (
              <div key={c.cmd} className="card card-pad">
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <div style={{ width:36, height:36, borderRadius:9, background:"rgba(37,211,102,0.08)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:17 }}>{c.icon}</div>
                  <div>
                    <div style={{ fontFamily:"monospace", fontWeight:800, fontSize:16, color:"#25D366" }}>{c.cmd}</div>
                    <div style={{ fontSize:11, color:"#7B91C4" }}>{c.desc}</div>
                  </div>
                </div>
                <div style={{ fontSize:10, color:"#3A4E7A", padding:"7px 9px", background:"rgba(0,0,0,0.2)", borderRadius:6, fontFamily:"monospace" }}>
                  {BOT_REPLIES[c.cmd]?.slice(0,80)}…
                </div>
              </div>
            ))}
          </div>

          <div className="card card-pad">
            <div className="sec-title" style={{ marginBottom:14 }}>⚙️ Messages Personnalisés</div>
            <div className="g2">
              {[["Message de Bienvenue","Bonjour! 👋 Je suis le bot Mukendi.\nTapez *AIDE* pour les commandes. 🇨🇩"],["Hors ligne","Nous sommes fermés.\nHoraires: Lun-Sam 8h-18h.\nVotre message sera traité à notre retour. 🙏"],["Commande inconnue","Je n'ai pas compris. 🤔\nTapez *AIDE* pour les commandes."],["Confirmation Commande","✅ Commande reçue!\nUn agent confirmera sous peu. _Mukendi_"]].map(([l,v]) => (
                <div key={l} className="form-group">
                  <label className="form-label">{l}</label>
                  <textarea defaultValue={v} rows={3} style={{ resize:"none", fontSize:12 }} />
                </div>
              ))}
            </div>
            <button className="btn btn-success" onClick={() => showToast("Configuration sauvegardée!", "success")}>💾 Sauvegarder Configuration</button>
          </div>
        </div>
      )}
    </div>
  );
}

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
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          {/* Plan Header */}
          <div className="hero-banner" style={{ marginBottom:24, textAlign:"center" }}>
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:1, color:"#7B91C4", marginBottom:8 }}>📋 BUSINESS PLAN GÉNÉRÉ</div>
              <h1 style={{ fontFamily:"'Bricolage Grotesque'", fontSize:28, fontWeight:800, letterSpacing:"-0.5px", marginBottom:8 }}>{plan.title}</h1>
              <div style={{ fontSize:13, color:"#7B91C4" }}>{plan.date} · Kinshasa, RDC 🇨🇩</div>
              <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:20 }}>
                <button className="btn btn-primary" onClick={() => showToast("📥 Export PDF en cours...", "info")}>📥 Télécharger PDF</button>
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

// ─── MAIN APP ──────────────────────────────────────────────────────────────────
export default function BizPlatform() {
  const [dark, setDark]             = useState(true);
  const [data, setData]             = useState(initialData);
  const [activePage, setActivePage] = useState("home");
  const [sidebarExp, setSidebarExp] = useState(false);
  const [toast, setToast]           = useState(null);
  const [time, setTime]             = useState(new Date());
  const [kpiGoals, setKpiGoals]     = useState(DEFAULT_KPI_GOALS);

  const updateGoal = useCallback((key, value) => {
    setKpiGoals(prev => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const styles = buildStyles(dark);

  // Inject CSS vars for card/border that can't be passed inline
  const cssVarOverride = `
    :root {
      --border: ${dark ? "rgba(26,86,255,0.12)" : "rgba(26,86,255,0.14)"};
      --border2:${dark ? "rgba(26,86,255,0.20)" : "rgba(26,86,255,0.22)"};
      --text:   ${dark ? "#EEF2FF" : "#0A0F1E"};
      --text2:  ${dark ? "#7B91C4" : "#3A4E7A"};
      --text3:  ${dark ? "#3A4E7A" : "#8A9DC0"};
      --glass3: ${dark ? "rgba(26,86,255,0.14)" : "rgba(26,86,255,0.06)"};
      --glass2: ${dark ? "rgba(26,86,255,0.08)" : "rgba(255,255,255,0.95)"};
    }
  `;

  const pages = {
    home:       <HomePage       data={data} setData={setData} showToast={showToast} dark={dark} kpiGoals={kpiGoals} updateGoal={updateGoal} />,
    sales:      <SalesPage      data={data} setData={setData} showToast={showToast} kpiGoals={kpiGoals} updateGoal={updateGoal} />,
    products:   <ProductsPage   data={data} setData={setData} showToast={showToast} />,
    clients:    <ClientsPage    data={data} setData={setData} showToast={showToast} kpiGoals={kpiGoals} updateGoal={updateGoal} />,
    marketing:  <MarketingPage  data={data} setData={setData} showToast={showToast} kpiGoals={kpiGoals} updateGoal={updateGoal} />,
    accounting: <AccountingPage data={data} setData={setData} showToast={showToast} kpiGoals={kpiGoals} updateGoal={updateGoal} />,
    personal:   <PersonalPage   data={data} setData={setData} showToast={showToast} kpiGoals={kpiGoals} updateGoal={updateGoal} />,
    whatsapp:   <WhatsAppPage   data={data} showToast={showToast} kpiGoals={kpiGoals} updateGoal={updateGoal} />,
    bizplan:    <BusinessPlanPage data={data} showToast={showToast} dark={dark} />,
    settings:   <SettingsPage   data={data} setData={setData} showToast={showToast} dark={dark} setDark={setDark} />,
  };

  return (
    <>
      <style>{styles + cssVarOverride}</style>
      <div className="app-shell">

        {/* ─ SIDEBAR ─ */}
        <div className={`sidebar ${sidebarExp ? "expanded" : ""}`}>
          <div className="logo-wrap" onClick={() => setSidebarExp(e => !e)}>
            <div className="logo-mark">M</div>
            {sidebarExp && <div><div className="logo-text">BizPlatform</div><div className="logo-sub">DRC Enterprise Suite</div></div>}
          </div>

          <div className="nav-list">
            {NAV.slice(0,-1).map(n => (
              <div key={n.id} className={`nav-item ${activePage===n.id?(n.id==="whatsapp"?"wa-active":"active"):""}`} onClick={() => setActivePage(n.id)} title={n.label}>
                <span className="nav-icon">{n.icon}</span>
                {sidebarExp && <span className="nav-label">{n.label}</span>}
                {n.badge && <span className="nav-badge">{n.badge}</span>}
              </div>
            ))}

            <div className="nav-divider" />

            <div className={`nav-item ${activePage==="whatsapp"?"wa-active":""}`} onClick={() => setActivePage("whatsapp")} title="WhatsApp Bot">
              <span className="nav-icon">💬</span>
              {sidebarExp && <span className="nav-label">WhatsApp Bot</span>}
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#25D366", position:"absolute", top:8, right:8, animation:"pulse 2s infinite" }} />
            </div>
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
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Bricolage Grotesque'", fontWeight:700, fontSize:15 }}>
                {NAV.find(n => n.id===activePage)?.label || "Tableau de Bord"}
              </div>
              <div style={{ fontSize:10, color:"#7B91C4" }}>
                {time.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})} · {time.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}
              </div>
            </div>

            {/* DRC colours */}
            <div style={{ display:"flex", gap:4, alignItems:"center" }}>
              {["#1A56FF","#F5C518","#D42B3A"].map(c => <div key={c} style={{ width:8, height:8, borderRadius:"50%", background:c }} />)}
            </div>

            {/* Theme toggle */}
            <button className="theme-btn" onClick={() => setDark(d => !d)} title={dark?"Mode Clair":"Mode Sombre"}>
              {dark ? "☀️" : "🌙"}
            </button>

            {/* Notifications */}
            <button className="theme-btn" onClick={() => showToast("🔔 Aucune nouvelle alerte", "info")} title="Notifications">
              🔔
            </button>

            {/* WA status indicator */}
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", background:"rgba(37,211,102,0.06)", border:"1px solid rgba(37,211,102,0.2)", borderRadius:20, cursor:"pointer" }} onClick={() => setActivePage("whatsapp")}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#25D366", animation:"pulse 2s infinite" }} />
              <span style={{ fontSize:11, fontWeight:600, color:"#25D366" }}>WA Bot</span>
            </div>

            {/* Avatar */}
            <div style={{ cursor:"pointer" }} onClick={() => setActivePage("settings")}>
              <Avatar name={data.user.name} size={34} />
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
            <div key={n.id} className={`mn-item ${activePage===n.id?(n.id==="whatsapp"?"wa-active":"active"):""}`} onClick={() => setActivePage(n.id)}>
              <span>{n.icon}</span>
              <span className="mn-label">{n.short}</span>
            </div>
          ))}
        </nav>
      </div>

      {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}

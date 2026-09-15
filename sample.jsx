import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Sofa, BedDouble, UtensilsCrossed, Armchair, Shirt, Tv, Briefcase, Coffee,
  BookOpen, Trees, Search, Heart, ShoppingCart, User, Menu, X, Star,
  ChevronRight, ChevronLeft, Plus, Minus, MapPin, Truck, ShieldCheck,
  RotateCcw, SlidersHorizontal, Check, Package, CreditCard, Trash2,
  Pencil, LogOut, ChevronDown, Phone, Mail, Clock, ArrowRight, Quote,
} from "lucide-react";

/* ---------------------------------------------------------------- */
/* DESIGN TOKENS (plain CSS, since Tailwind here is core-classes only) */
/* ---------------------------------------------------------------- */
const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,450;0,9..144,600;1,9..144,450&family=Inter:wght@400;500;600;700&display=swap');
    .gv-root { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; background:#FAF6EF; color:#2B2420; }
    .gv-serif { font-family: 'Fraunces', Georgia, serif; }
    .gv-grain {
      background:
        repeating-linear-gradient(100deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 18px),
        linear-gradient(135deg, #6B4A34 0%, #4A3223 55%, #382518 100%);
    }
    .gv-scrollbar-none::-webkit-scrollbar{ display:none; }
    .gv-scrollbar-none{ -ms-overflow-style:none; scrollbar-width:none; }
    @keyframes gvRise { from { opacity:0; transform: translateY(14px);} to { opacity:1; transform:translateY(0);} }
    .gv-hero-in { animation: gvRise 0.9s cubic-bezier(.2,.7,.2,1) both; }
    .gv-hero-in-1 { animation-delay: .05s; }
    .gv-hero-in-2 { animation-delay: .18s; }
    .gv-hero-in-3 { animation-delay: .32s; }
    /* Hero enhancements */
    @keyframes heroFloat { 0% { transform: translateY(0); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0); } }
    @keyframes heroPulse { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
    @keyframes heroPop { 0% { opacity: 0; transform: translateY(10px) scale(.99); } 100% { opacity:1; transform: translateY(0) scale(1); } }
    .hero-title { animation: heroPop .8s cubic-bezier(.2,.9,.2,1) both; }
    .hero-sub { animation: heroPop .9s cubic-bezier(.2,.9,.2,1) both; animation-delay:.08s }
    .hero-cta { animation: heroPop 1s cubic-bezier(.2,.9,.2,1) both; animation-delay:.15s }
    .hero-cta .primary { animation: heroPulse 6s ease-in-out infinite; }
    .hero-image img { transition: transform .9s cubic-bezier(.2,.7,.2,1); will-change: transform; }
    .hero-image:hover img { transform: scale(1.035) translateY(-4px); }
    .hero-shape { position:absolute; border-radius:50%; opacity:0.12; filter: blur(10px); pointer-events:none; }
    .hero-shape.s1 { width:160px; height:160px; right:6%; top:8%; background: radial-gradient(circle at 30% 30%, #A9772F, transparent); animation: heroFloat 7s ease-in-out infinite; }
    .hero-shape.s2 { width:110px; height:110px; right:18%; bottom:18%; background: radial-gradient(circle at 30% 30%, #6B4A34, transparent); animation: heroFloat 6s ease-in-out .6s infinite; }
    .hero-shape.s3 { width:80px; height:80px; left:10%; bottom:6%; background: radial-gradient(circle at 30% 30%, #C99348, transparent); animation: heroFloat 8s ease-in-out .2s infinite; }
    .gv-card { transition: transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s ease; }
    .gv-card:hover { transform: translateY(-4px); box-shadow: 0 18px 40px -18px rgba(43,36,32,0.35); }
    .gv-underline { position:relative; }
    .gv-underline::after{ content:''; position:absolute; left:0; right:100%; bottom:-3px; height:1.5px; background:#A9772F; transition: right .3s ease; }
    .gv-underline:hover::after{ right:0; }
    input:focus, textarea:focus, select:focus { outline: 2px solid #A9772F; outline-offset: 2px; }
    button:focus-visible, a:focus-visible { outline: 2px solid #A9772F; outline-offset: 2px; }
    .gv-img { object-fit: cover; width: 100%; height: 100%; display: block; }
    .gv-img-wrap { position: relative; overflow: hidden; background: #E7DDCB; }
    .gv-img-wrap::after {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(180deg, rgba(43,36,32,0) 55%, rgba(43,36,32,0.28) 100%);
      pointer-events: none;
    }
    .gv-img-plain::after { display: none; }
    @media (prefers-reduced-motion: reduce){ .gv-hero-in, .gv-card { animation:none !important; transition:none !important; } }
  `}</style>
);

/* ---------------------------------------------------------------- */
/* DATA                                                              */
/* ---------------------------------------------------------------- */
const CATEGORIES = [
  { id: "sofas", name: "Sofas", icon: Sofa, tint: "from-amber-800 to-amber-950" },
  { id: "beds", name: "Beds", icon: BedDouble, tint: "from-stone-700 to-stone-900" },
  { id: "dining", name: "Dining Tables", icon: UtensilsCrossed, tint: "from-orange-800 to-amber-950" },
  { id: "chairs", name: "Chairs", icon: Armchair, tint: "from-amber-700 to-stone-900" },
  { id: "wardrobes", name: "Wardrobes", icon: Shirt, tint: "from-stone-600 to-stone-900" },
  { id: "tvunits", name: "TV Units", icon: Tv, tint: "from-amber-900 to-stone-950" },
  { id: "office", name: "Office Furniture", icon: Briefcase, tint: "from-stone-700 to-amber-950" },
  { id: "coffee", name: "Coffee Tables", icon: Coffee, tint: "from-amber-800 to-stone-900" },
  { id: "bookshelves", name: "Bookshelves", icon: BookOpen, tint: "from-orange-900 to-stone-950" },
  { id: "outdoor", name: "Outdoor", icon: Trees, tint: "from-stone-700 to-amber-900" },
];
const catMap = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));

/* Real photography, one representative Unsplash image per category.
   Swap any of these for your own product photography later —
   just replace the URL string, the rest of the layout won't change. */
const CATEGORY_IMAGES = {
  sofas: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcRnZ2yxY9LFGDDpi6-SMF_QJE4Yvkc9ligtitkZx5NMSMEpnM6zMLHYthU0t45u_yaCYAdcZVkIlqtdV00DXEXXzRzqetpzOtqo4B-eCFE2trAQgBsEtwuArbY3pOyyLh4ppkxRlr8&usqp=CAc",
  beds: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLi9KSZlrpEqCiRTlwLjQrZpeEddYgUC77_IqdOOPz3g&s=10",
  dining: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSvF0m-QDqtIyyTC71qhnHkmgyjmwtMc6FLa3pO45VkKw&s=10",
  chairs: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBrTkkSLZp68Wzrffg3eobuP6DWLkyNgo8IOwFE5YxvA&s=10",
  wardrobes: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvtIrU0WNlyHQ8TLk8KZ1qzN2BUPrqQ2ArJZ32VKz7fA&s=10",
  tvunits: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBsaUgef2hn75f9nSjGdOzET54rjiZcc4LQkEETN9YIA&s=10",
  office: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2icU7jkuONUw9hPZXm4KbXpF2yil_b1wAWWJfNy3tEQ&s=10",
  coffee: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsJjbZKWMUhQAEkK8caM1lA7ubUnYvBGjgxRDIpNN21w&s=10",
  bookshelves: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6LpHFBhn4Rsgd0SAQwcfJcQbMLD_oKaZ2KjULOQF2tQ&s=10",
  outdoor: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4mmvxCNuoGf7OBjO-DtomKdCTLg1OPVCp34pqVQ2bUyRB7ldzyhWw7Sw&s=10",
};
const HERO_IMAGE = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCZ_5cug5XBvpDt1R_oXBVmZ_JdwlHopzjbpkEui9vpA&s=10";
const WORKSHOP_IMAGE = "https://images.unsplash.com/photo-LFlbLb8vJls?w=1400&q=80&auto=format&fit=crop";

const NAMES = {
  sofas: ["Verona 3-Seater Sofa", "Camber L-Shape Sectional", "Winslow 2-Seater Loveseat"],
  beds: ["Kyoto Sheesham King Bed", "Halden Upholstered Queen Bed", "Nordov Storage Bed"],
  dining: ["Marlowe 6-Seater Dining Set", "Ravello Round Dining Table", "Foster 4-Seater Dining Set"],
  chairs: ["Oslo Accent Chair", "Bramwell Rocking Chair", "Delano Dining Chair (Set of 2)"],
  wardrobes: ["Bergen 4-Door Wardrobe", "Calder 3-Door Sliding Wardrobe", "Priory 2-Door Wardrobe"],
  tvunits: ["Milano TV Console", "Harlow Wall-Mounted TV Unit", "Fenwick Entertainment Unit"],
  office: ["Hudson Ergonomic Office Chair", "Lennox Study Table", "Arden Bookcase Office Desk"],
  coffee: ["Nordic Coffee Table", "Alder Nesting Coffee Tables (Set of 2)", "Teakwood Round Coffee Table"],
  bookshelves: ["Camden 5-Tier Bookshelf", "Wexford Ladder Bookshelf", "Grantham Corner Bookshelf"],
  outdoor: ["Alfresco Rattan Sofa Set", "Sundeck Balcony Chair Duo", "Meridian Outdoor Dining Set"],
};
const MATERIALS = ["Sheesham Wood", "Engineered Wood", "Solid Teakwood", "Velvet & Metal Frame", "Rattan & Wicker", "Fabric Upholstery", "Mango Wood"];
const BADGES = [null, null, "Bestseller", null, "New", null, "Sale", null];

function genProducts() {
  let id = 1;
  const list = [];
  CATEGORIES.forEach((cat) => {
    NAMES[cat.id].forEach((name, i) => {
      const base = 8999 + ((id * 733) % 55000);
      const mrp = Math.round((base * (1 + ((id % 4) * 6 + 10) / 100)) / 100) * 100;
      const rating = (3.9 + ((id * 37) % 11) / 10).toFixed(1);
      const reviews = 8 + ((id * 53) % 240);
      list.push({
        id,
        name,
        category: cat.id,
        price: base,
        mrp,
        rating: Number(rating),
        reviewCount: reviews,
        material: MATERIALS[id % MATERIALS.length],
        badge: BADGES[id % BADGES.length],
        stock: 3 + ((id * 17) % 20),
        desc: `The ${name} brings understated craftsmanship to your home — built on a frame of ${MATERIALS[id % MATERIALS.length].toLowerCase()} and finished by hand for a warm, lasting grain. Designed in-house by Vitthal Furniture and assembled by our Pune workshop artisans.`,
        dims: `${60 + (id % 5) * 10}cm (W) x ${45 + (id % 4) * 8}cm (D) x ${70 + (id % 6) * 5}cm (H)`,
        colors: ["Walnut", "Honey Oak", "Charcoal Grey"].slice(0, 1 + (id % 3)),
        warranty: "1 Year Manufacturer Warranty",
      });
      id++;
    });
  });
  return list;
}
const PRODUCTS = genProducts();

const REVIEW_POOL = [
  { name: "Ananya R.", text: "Excellent build quality, exactly as pictured. Delivery team was careful and professional." },
  { name: "Rohit S.", text: "Took a week longer than promised but the finish is genuinely premium. Worth the wait." },
  { name: "Meera K.", text: "Assembled easily, very sturdy. The wood grain looks even better in person." },
  { name: "Vikram P.", text: "Great value for the price point. Customer support helped me pick the right size." },
  { name: "Fatima A.", text: "Bought this for our new flat — feels solid and the color matched the listing perfectly." },
  { name: "Kunal D.", text: "Comfortable and well packed. Minor scuff on arrival but support replaced it quickly." },
];
function reviewsFor(productId) {
  const n = 2 + (productId % 3);
  return Array.from({ length: n }, (_, i) => {
    const r = REVIEW_POOL[(productId + i * 3) % REVIEW_POOL.length];
    return { ...r, rating: 3 + ((productId + i) % 3), date: `${(productId + i) % 28 + 1} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"][(productId + i) % 8]} 2026` };
  });
}

const HOME_TESTIMONIALS = [
  { name: "siddhartha Patil", city: "Pune", text: "The dining set is easily the best piece of furniture we own. You can feel the difference in the joinery compared to showroom stock." },
  { name: "Pranita Patil", city: "Mumbai", text: "Ordered a custom wardrobe to fit an awkward alcove. The design team measured everything twice and it fits perfectly." },
  { name: "Bhushan Gavhane", city: "Dharashiv", text: "Delivery was on time, assembly was handled on-site, and the sheesham finish looks even better than the photos." },
];

const SERVICEABLE_PINCODES = new Set([
  "411001","411045","411057","411014","400001","400059","400072","110001","110034",
  "560001","560034","560103","600001","600028","500001","500081","700001","700091",
  "380001","382481","302001","302017","226001","201301","122001","141001","462001",
]);

const COUPONS = {
  WELCOME10: { type: "pct", value: 10, cap: 2000, label: "10% off, up to ₹2,000" },
  FLAT500: { type: "flat", value: 500, min: 5000, label: "₹500 off on orders above ₹5,000" },
};

const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

/* ---------------------------------------------------------------- */
/* SMALL UI ATOMS                                                    */
/* ---------------------------------------------------------------- */
const Stars = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={size} className={i < Math.round(rating) ? "fill-amber-600 text-amber-600" : "text-stone-300"} />
    ))}
  </div>
);

const Badge = ({ children, tone = "amber" }) => {
  const tones = {
    amber: "bg-amber-800 text-amber-50",
    stone: "bg-stone-800 text-stone-50",
    rose: "bg-rose-700 text-rose-50",
    green: "bg-green-700 text-green-50",
  };
  return <span className={`text-[11px] font-medium px-2 py-1 rounded-sm tracking-wide ${tones[tone]}`}>{children}</span>;
};

const Btn = ({ children, variant = "primary", className = "", ...props }) => {
  const base = "inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-amber-900 text-amber-50 hover:bg-amber-800",
    secondary: "bg-stone-900 text-stone-50 hover:bg-stone-800",
    outline: "border border-stone-400 text-stone-800 hover:border-amber-800 hover:text-amber-900",
    ghost: "text-stone-700 hover:text-amber-900",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

/* Real photo for a category, with the icon+gradient as a graceful
   fallback if the image ever fails to load (offline, blocked host, etc). */
const CategoryArt = ({ catId, className = "", plain = false }) => {
  const cat = catMap[catId];
  const Icon = cat.icon;
  const [failed, setFailed] = useState(false);
  const src = CATEGORY_IMAGES[catId];
  if (failed || !src) {
    return (
      <div className={`bg-gradient-to-br ${cat.tint} flex items-center justify-center ${className}`}>
        <Icon size={56} strokeWidth={1.1} className="text-amber-50/85" />
      </div>
    );
  }
  return (
    <div className={`gv-img-wrap ${plain ? "gv-img-plain" : ""} ${className}`}>
      <img src={src} alt={cat.name} className="gv-img" loading="lazy" onError={() => setFailed(true)} />
    </div>
  );
};

/* Brand mark: a simple, professional monogram used in the header and footer
   instead of relying on wordmark alone. */
const VithalMark = ({ size = 48, dark = false }) => (
  <div
    className="shrink-0 flex items-center justify-center rounded-full overflow-hidden"
    style={{
      width: size,
      height: size,
      background: dark
        ? "linear-gradient(150deg, #C99348 0%, #8A5A22 100%)"
        : "linear-gradient(150deg, #A9772F 0%, #6B4A22 100%)",
      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)",
    }}
  >
    <img
      src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSxaXLNAsJSno8ooNmTrUP9D2rsyXxsczm4VJhIYhBaA&s=10"
      alt="Vithal logo"
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </div>
);

const QtyStepper = ({ qty, onChange, max = 10 }) => (
  <div className="inline-flex items-center border border-stone-300 rounded-sm">
    <button onClick={() => onChange(Math.max(1, qty - 1))} className="p-2 text-stone-600 hover:text-amber-900" aria-label="Decrease quantity"><Minus size={14} /></button>
    <span className="w-8 text-center text-sm font-medium">{qty}</span>
    <button onClick={() => onChange(Math.min(max, qty + 1))} className="p-2 text-stone-600 hover:text-amber-900" aria-label="Increase quantity"><Plus size={14} /></button>
  </div>
);

const Toast = ({ msg }) =>
  msg ? (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] bg-stone-900 text-stone-50 px-5 py-3 rounded-sm text-sm shadow-xl flex items-center gap-2">
      <Check size={15} className="text-amber-400" /> {msg}
    </div>
  ) : null;

/* ---------------------------------------------------------------- */
/* HEADER / FOOTER                                                   */
/* ---------------------------------------------------------------- */
const NAV_LINKS = [
  { label: "Shop", route: "shop" },
  { label: "Categories", route: "categories" },
  { label: "Custom Furniture", route: "custom" },
  { label: "Services", route: "services" },
  { label: "About Us", route: "about" },
  { label: "Contact", route: "contact" },
];

const Header = ({ go, cartCount, wishCount, user, searchQuery, setSearchQuery, onSearchSubmit }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState(searchQuery || "");
  return (
    <header className="sticky top-0 z-40 bg-[#FAF6EF]/95 backdrop-blur border-b border-stone-200">
      <div className="hidden sm:block bg-stone-900 text-stone-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-8 flex items-center justify-center gap-2">
          <Truck size={12} className="text-amber-500" />
          <span>Free shipping over ₹4,999 · Handcrafted in Pune, delivered across India</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <button onClick={() => go("home")} className="flex items-center gap-2.5 shrink-0">
            <VithalMark size={36} />
            <span className="flex flex-col items-start leading-none">
              <span className="gv-serif text-xl md:text-2xl font-semibold text-stone-900">Vitthal</span>
              <span className="text-[10px] tracking-wide text-amber-800 font-medium">FURNITURE</span>
            </span>
          </button>

          <nav className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((l) => (
              <button key={l.route} onClick={() => go(l.route)} className="gv-underline text-[13.5px] text-stone-700 hover:text-amber-900">
                {l.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center flex-1 max-w-xs relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearchSubmit(q)}
              placeholder="Search furniture..."
              className="w-full bg-stone-100 border border-stone-200 rounded-sm pl-9 pr-3 py-2 text-sm"
            />
            <Search size={15} className="absolute left-3 text-stone-500" />
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <button onClick={() => onSearchSubmit(q)} className="md:hidden p-2 text-stone-700"><Search size={19} /></button>
            <button onClick={() => go("wishlist")} className="relative p-2 text-stone-700 hover:text-amber-900">
              <Heart size={19} />
              {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-amber-800 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{wishCount}</span>}
            </button>
            <button onClick={() => go("cart")} className="relative p-2 text-stone-700 hover:text-amber-900">
              <ShoppingCart size={19} />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-amber-800 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>}
            </button>
            <button onClick={() => go(user ? "profile" : "login")} className="p-2 text-stone-700 hover:text-amber-900"><User size={19} /></button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-stone-700">{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-[#FAF6EF] px-4 py-3">
          <div className="flex md:hidden items-center relative mb-3">
            <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSearchSubmit(q)} placeholder="Search furniture..." className="w-full bg-stone-100 border border-stone-200 rounded-sm pl-9 pr-3 py-2 text-sm" />
            <Search size={15} className="absolute left-3 text-stone-500" />
          </div>
          {NAV_LINKS.map((l) => (
            <button key={l.route} onClick={() => { go(l.route); setMobileOpen(false); }} className="block w-full text-left py-2.5 text-sm text-stone-700 border-b border-stone-100">
              {l.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

const FOOTER_POLICY_LINKS = [
  { label: "Privacy Policy", route: "privacy" },
  { label: "Terms of Service", route: "terms" },
  { label: "Return, Refund & Shipping", route: "returns" },
  { label: "FAQ", route: "faq" },
];

const Footer = ({ go }) => (
  <footer className="bg-stone-950 text-stone-300 mt-20">
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
      <div className="col-span-2 md:col-span-1">
        <div className="flex items-center gap-2.5 mb-3">
          <VithalMark size={32} dark />
          <div className="gv-serif text-xl text-white">Vithal Furniture</div>
        </div>
        <p className="text-sm text-stone-400 leading-relaxed">Handcrafted, premium furniture for Indian homes — designed in-house, built to last generations.</p>
        <div className="flex items-center gap-2 mt-4 text-sm text-stone-400"><Phone size={14} /> +91 7276523381</div>
        <div className="flex items-center gap-2 mt-1.5 text-sm text-stone-400"><Mail size={14} /> shrikantmahamuni2000@gmail.com</div>
      </div>
      <div>
        <div className="text-sm font-medium text-white mb-3">Shop</div>
        <div className="flex flex-col gap-2">
          {CATEGORIES.slice(0, 6).map((c) => (
            <button key={c.id} onClick={() => go("shop", { category: c.id })} className="text-sm text-stone-400 hover:text-amber-500 text-left">{c.name}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-sm font-medium text-white mb-3">Company</div>
        <div className="flex flex-col gap-2">
          <button onClick={() => go("about")} className="text-sm text-stone-400 hover:text-amber-500 text-left">About Us</button>
          <button onClick={() => go("custom")} className="text-sm text-stone-400 hover:text-amber-500 text-left">Custom Furniture</button>
          <button onClick={() => go("services")} className="text-sm text-stone-400 hover:text-amber-500 text-left">Services</button>
          <button onClick={() => go("contact")} className="text-sm text-stone-400 hover:text-amber-500 text-left">Contact</button>
        </div>
      </div>
      <div>
        <div className="text-sm font-medium text-white mb-3">Policies</div>
        <div className="flex flex-col gap-2">
          {FOOTER_POLICY_LINKS.map((p) => (
            <button key={p.route} onClick={() => go(p.route)} className="text-sm text-stone-400 hover:text-amber-500 text-left">{p.label}</button>
          ))}
        </div>
      </div>
    </div>
    <div className="border-t border-stone-800 py-5 text-center text-xs text-stone-500">© 2026 Vithal Furniture. All rights reserved. Dharashiv, Kini, Maharashtra, India.</div>
  </footer>
);

/* ---------------------------------------------------------------- */
/* PRODUCT CARD                                                      */
/* ---------------------------------------------------------------- */
const ProductCard = ({ p, go, wishlist, toggleWish, addToCart }) => {
  const isWished = wishlist.includes(p.id);
  const off = Math.round(100 - (p.price / p.mrp) * 100);
  return (
    <div className="gv-card bg-white rounded-sm overflow-hidden border border-stone-100 group">
      <div className="relative">
        <button onClick={() => go("product", { id: p.id })} className="block w-full">
          <CategoryArt catId={p.category} className="h-52 w-full" />
        </button>
        {p.badge && <div className="absolute top-3 left-3"><Badge tone={p.badge === "Sale" ? "rose" : p.badge === "New" ? "green" : "amber"}>{p.badge}</Badge></div>}
        <button
          onClick={() => toggleWish(p.id)}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Toggle wishlist"
        >
          <Heart size={15} className={isWished ? "fill-rose-600 text-rose-600" : "text-stone-600"} />
        </button>
      </div>
      <div className="p-4">
        <div className="text-[11px] text-stone-500 mb-1">{catMap[p.category].name}</div>
        <button onClick={() => go("product", { id: p.id })} className="text-left">
          <div className="text-sm font-medium text-stone-900 leading-snug mb-1.5 hover:text-amber-900">{p.name}</div>
        </button>
        <div className="flex items-center gap-1.5 mb-2">
          <Stars rating={p.rating} />
          <span className="text-xs text-stone-500">({p.reviewCount})</span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-semibold text-stone-900">{inr(p.price)}</span>
          {off > 0 && <><span className="text-xs text-stone-400 line-through">{inr(p.mrp)}</span><span className="text-xs text-green-700 font-medium">{off}% off</span></>}
        </div>
        <Btn variant="outline" className="w-full !py-2" onClick={() => addToCart(p.id)}>
          <ShoppingCart size={14} /> Add to Cart
        </Btn>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* HOME PAGE                                                         */
/* ---------------------------------------------------------------- */
const Home = ({ go, wishlist, toggleWish, addToCart }) => {
  const bestsellers = PRODUCTS.filter((p) => p.badge === "Bestseller").slice(0, 4);
  const newArrivals = PRODUCTS.filter((p) => p.badge === "New").slice(0, 4);
  return (
    <div>
      <section className="relative max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-20 pb-16 grid md:grid-cols-2 gap-8 items-center">
        <div className="relative z-10 gv-hero-in gv-hero-in-1">
          <div className="text-xs tracking-wide text-amber-800 font-medium mb-4">Dharashiv-crafted · Solid wood · Since 2010</div>
          <h1 className="gv-serif hero-title text-4xl md:text-[3.8rem] lg:text-[4rem] leading-tight text-stone-900 mb-5 max-w-2xl">
            Furniture built to hold a home together.
          </h1>
          <p className="hero-sub text-stone-600 text-[16px] max-w-lg leading-relaxed mb-7">
            Sheesham, teak and mango wood — handcrafted in our Dharashiv workshop. Timeless designs, honest pricing, and white-glove delivery.
          </p>
          <div className="flex flex-wrap gap-3 hero-cta">
            <Btn onClick={() => go("shop")} className="primary">Shop the collection <ArrowRight size={15} /></Btn>
            <Btn variant="outline" onClick={() => go("custom")} className="!py-2">Design something custom</Btn>
          </div>
        </div>

        <div className="hero-image gv-hero-in gv-hero-in-2 rounded-sm h-72 md:h-[28rem] lg:h-[32rem] relative overflow-hidden flex items-end p-6">
          <img src={HERO_IMAGE} alt="The Verona Sofa in a warm, wood-panelled living room" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent mix-blend-multiply" />
          <div className="hero-shape s1" />
          <div className="hero-shape s2" />
          <div className="hero-shape s3" />
          <div className="relative text-amber-50">
            <div className="gv-serif text-2xl mb-1">The Verona Sofa</div>
            <div className="text-sm text-amber-100/80">₹{PRODUCTS[0].price.toLocaleString("en-IN")} · Sheesham frame</div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="gv-serif text-2xl text-stone-900">Shop by category</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto gv-scrollbar-none pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => go("shop", { category: c.id })} className="gv-card shrink-0 w-32 flex flex-col items-center gap-2.5 bg-white rounded-sm border border-stone-100 p-3 overflow-hidden">
              <CategoryArt catId={c.id} className="w-full h-20 rounded-sm" plain />
              <span className="text-xs text-stone-700 text-center leading-tight">{c.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="gv-serif text-2xl text-stone-900">Bestsellers</h2>
          <button onClick={() => go("shop")} className="text-sm text-amber-800 gv-underline">View all</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {bestsellers.map((p) => <ProductCard key={p.id} p={p} go={go} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} />)}
        </div>
      </section>

      <section className="bg-amber-900 my-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="gv-serif text-3xl text-amber-50 mb-3">Can't find the exact piece?</h2>
            <p className="text-amber-100/85 text-sm leading-relaxed max-w-md">Tell us your dimensions, wood preference and budget — our design team will send a custom quote within 48 hours.</p>
          </div>
          <div className="md:text-right">
            <Btn variant="secondary" onClick={() => go("custom")}>Start a custom order <ArrowRight size={15} /></Btn>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="gv-serif text-2xl text-stone-900">New arrivals</h2>
          <button onClick={() => go("shop")} className="text-sm text-amber-800 gv-underline">View all</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {newArrivals.map((p) => <ProductCard key={p.id} p={p} go={go} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} />)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-14 border-t border-stone-200">
        <h2 className="gv-serif text-2xl text-stone-900 mb-8">What homes are saying</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {HOME_TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white border border-stone-100 rounded-sm p-5 flex flex-col gap-4">
              <Stars rating={5} size={13} />
              <p className="text-sm text-stone-600 leading-relaxed">{t.text}</p>
              <div className="flex items-center gap-3 mt-auto pt-1">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium text-amber-50 shrink-0"
                  style={{ background: "linear-gradient(150deg, #A9772F 0%, #6B4A22 100%)" }}
                >
                  {t.name.split(" ").map((w) => w[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium text-stone-900">{t.name}</div>
                  <div className="text-xs text-stone-500">{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-stone-200">
        {[
          { icon: Truck, t: "Free shipping", d: "On orders above ₹4,999" },
          { icon: ShieldCheck, t: "1-year warranty", d: "On all manufacturer defects" },
          { icon: RotateCcw, t: "7-day returns", d: "Easy pickup & refund" },
          { icon: CreditCard, t: "Secure payments", d: "UPI, cards, net banking" },
        ].map((u, i) => (
          <div key={i} className="flex flex-col items-start gap-2">
            <u.icon size={22} className="text-amber-800" strokeWidth={1.4} />
            <div className="text-sm font-medium text-stone-900">{u.t}</div>
            <div className="text-xs text-stone-500">{u.d}</div>
          </div>
        ))}
      </section>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* SHOP / SEARCH PAGE                                                 */
/* ---------------------------------------------------------------- */
const Shop = ({ go, params, wishlist, toggleWish, addToCart, searchQuery }) => {
  const [category, setCategory] = useState(params?.category || "all");
  const [sort, setSort] = useState("relevance");
  const [maxPrice, setMaxPrice] = useState(70000);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => { setCategory(params?.category || "all"); }, [params?.category]);

  const results = useMemo(() => {
    let list = PRODUCTS.filter((p) => p.price <= maxPrice);
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || catMap[p.category].name.toLowerCase().includes(q) || p.material.toLowerCase().includes(q));
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [category, sort, maxPrice, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="gv-serif text-3xl text-stone-900">{searchQuery ? `Results for "${searchQuery}"` : "Shop All Furniture"}</h1>
        <p className="text-sm text-stone-500 mt-1">{results.length} products</p>
      </div>
      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside className={`${filterOpen ? "block" : "hidden"} md:block`}>
          <div className="text-sm font-medium text-stone-900 mb-3">Category</div>
          <div className="flex flex-col gap-2 mb-6">
            <button onClick={() => setCategory("all")} className={`text-left text-sm ${category === "all" ? "text-amber-900 font-medium" : "text-stone-600"}`}>All</button>
            {CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => setCategory(c.id)} className={`text-left text-sm ${category === c.id ? "text-amber-900 font-medium" : "text-stone-600"}`}>{c.name}</button>
            ))}
          </div>
          <div className="text-sm font-medium text-stone-900 mb-3">Max price: {inr(maxPrice)}</div>
          <input type="range" min="5000" max="70000" step="1000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-amber-800" />
        </aside>
        <div>
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => setFilterOpen(!filterOpen)} className="md:hidden flex items-center gap-1.5 text-sm text-stone-700 border border-stone-300 rounded-sm px-3 py-1.5">
              <SlidersHorizontal size={14} /> Filters
            </button>
            <div className="ml-auto flex items-center gap-2 text-sm">
              <span className="text-stone-500">Sort:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-stone-300 rounded-sm px-2 py-1.5 bg-white">
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
          {results.length === 0 ? (
            <div className="text-center py-20 text-stone-500 text-sm">No products match your filters. Try widening your price range.</div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((p) => <ProductCard key={p.id} p={p} go={go} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* CATEGORIES PAGE                                                    */
/* ---------------------------------------------------------------- */
const CategoriesPage = ({ go }) => (
  <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
    <h1 className="gv-serif text-3xl text-stone-900 mb-2">Categories</h1>
    <p className="text-sm text-stone-500 mb-8">Browse our full range, from statement sofas to everyday essentials.</p>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
      {CATEGORIES.map((c) => {
        const count = PRODUCTS.filter((p) => p.category === c.id).length;
        return (
          <button key={c.id} onClick={() => go("shop", { category: c.id })} className="gv-card relative rounded-sm overflow-hidden text-left">
            <CategoryArt catId={c.id} className="h-40" />
            <div className="bg-white p-4 border border-t-0 border-stone-100">
              <div className="text-sm font-medium text-stone-900">{c.name}</div>
              <div className="text-xs text-stone-500 mt-0.5">{count} products</div>
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

/* ---------------------------------------------------------------- */
/* PRODUCT DETAILS PAGE                                              */
/* ---------------------------------------------------------------- */
const ProductDetails = ({ params, go, wishlist, toggleWish, addToCart }) => {
  const p = PRODUCTS.find((x) => x.id === params?.id) || PRODUCTS[0];
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("desc");
  const [pin, setPin] = useState("");
  const [pinResult, setPinResult] = useState(null);
  const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const reviews = reviewsFor(p.id);
  const off = Math.round(100 - (p.price / p.mrp) * 100);

  const checkPin = () => {
    if (!/^\d{6}$/.test(pin)) { setPinResult({ ok: false, msg: "Enter a valid 6-digit PIN code." }); return; }
    if (SERVICEABLE_PINCODES.has(pin)) setPinResult({ ok: true, msg: "Delivery in 3–5 business days. Free shipping eligible." });
    else setPinResult({ ok: true, msg: "Deliverable via courier partner in 7–10 business days." });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <button onClick={() => go("shop", { category: p.category })} className="flex items-center gap-1 text-sm text-stone-500 hover:text-amber-900 mb-6"><ChevronLeft size={15} /> Back to {catMap[p.category].name}</button>
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <CategoryArt catId={p.category} className="h-96 rounded-sm" plain />
          <div className="grid grid-cols-4 gap-3 mt-3">
            {Array.from({ length: 4 }).map((_, i) => <CategoryArt key={i} catId={p.category} className="h-20 rounded-sm opacity-90" plain />)}
          </div>
        </div>
        <div>
          {p.badge && <div className="mb-3"><Badge tone={p.badge === "Sale" ? "rose" : p.badge === "New" ? "green" : "amber"}>{p.badge}</Badge></div>}
          <h1 className="gv-serif text-3xl text-stone-900 mb-2">{p.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <Stars rating={p.rating} />
            <span className="text-sm text-stone-500">{p.rating} · {p.reviewCount} reviews</span>
          </div>
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-2xl font-semibold text-stone-900">{inr(p.price)}</span>
            {off > 0 && <><span className="text-stone-400 line-through text-sm">{inr(p.mrp)}</span><span className="text-green-700 text-sm font-medium">{off}% off</span></>}
          </div>
          <div className="text-xs text-stone-500 mb-6">Inclusive of GST · Free shipping over ₹4,999</div>

          <div className="mb-5">
            <div className="text-sm font-medium text-stone-900 mb-2">Finish</div>
            <div className="flex gap-2">
              {p.colors.map((c) => <span key={c} className="text-xs border border-stone-300 rounded-sm px-3 py-1.5 text-stone-700">{c}</span>)}
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <QtyStepper qty={qty} onChange={setQty} max={p.stock} />
            <span className="text-xs text-stone-500">{p.stock} in stock</span>
          </div>

          <div className="flex gap-3 mb-6">
            <Btn className="flex-1" onClick={() => { addToCart(p.id, qty); }}><ShoppingCart size={15} /> Add to Cart</Btn>
            <Btn variant="outline" onClick={() => toggleWish(p.id)}>
              <Heart size={15} className={wishlist.includes(p.id) ? "fill-rose-600 text-rose-600" : ""} />
            </Btn>
          </div>

          <div className="border border-stone-200 rounded-sm p-4 mb-6">
            <div className="text-sm font-medium text-stone-900 mb-2 flex items-center gap-2"><MapPin size={15} /> Check delivery to your PIN code</div>
            <div className="flex gap-2">
              <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="e.g. 411045" className="flex-1 border border-stone-300 rounded-sm px-3 py-2 text-sm" />
              <Btn variant="secondary" onClick={checkPin}>Check</Btn>
            </div>
            {pinResult && <div className={`text-xs mt-2 ${pinResult.ok ? "text-green-700" : "text-rose-600"}`}>{pinResult.msg}</div>}
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs text-stone-600">
            <div className="flex flex-col items-center text-center gap-1 border border-stone-200 rounded-sm p-3"><Truck size={17} className="text-amber-800" /> Free shipping</div>
            <div className="flex flex-col items-center text-center gap-1 border border-stone-200 rounded-sm p-3"><ShieldCheck size={17} className="text-amber-800" /> {p.warranty}</div>
            <div className="flex flex-col items-center text-center gap-1 border border-stone-200 rounded-sm p-3"><RotateCcw size={17} className="text-amber-800" /> 7-day returns</div>
          </div>
        </div>
      </div>

      <div className="mt-14 border-t border-stone-200 pt-8">
        <div className="flex gap-6 border-b border-stone-200 mb-6">
          {[["desc", "Description"], ["specs", "Specifications"], ["reviews", `Reviews (${reviews.length})`]].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`pb-3 text-sm ${tab === k ? "text-amber-900 border-b-2 border-amber-800 font-medium" : "text-stone-500"}`}>{label}</button>
          ))}
        </div>
        {tab === "desc" && <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">{p.desc}</p>}
        {tab === "specs" && (
          <table className="text-sm text-stone-700 w-full max-w-md">
            <tbody>
              <tr className="border-b border-stone-100"><td className="py-2 text-stone-500">Material</td><td className="py-2">{p.material}</td></tr>
              <tr className="border-b border-stone-100"><td className="py-2 text-stone-500">Dimensions</td><td className="py-2">{p.dims}</td></tr>
              <tr className="border-b border-stone-100"><td className="py-2 text-stone-500">Warranty</td><td className="py-2">{p.warranty}</td></tr>
              <tr><td className="py-2 text-stone-500">Finish options</td><td className="py-2">{p.colors.join(", ")}</td></tr>
            </tbody>
          </table>
        )}
        {tab === "reviews" && (
          <div className="flex flex-col gap-5 max-w-2xl">
            {reviews.map((r, i) => (
              <div key={i} className="border-b border-stone-100 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-stone-900">{r.name}</span>
                  <span className="text-xs text-stone-400">{r.date}</span>
                </div>
                <Stars rating={r.rating} size={12} />
                <p className="text-sm text-stone-600 mt-1.5">{r.text}</p>
              </div>
            ))}
            <Btn variant="outline" className="w-fit" onClick={() => go("reviews", { id: p.id })}>Write a review</Btn>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="gv-serif text-2xl text-stone-900 mb-5">You may also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map((rp) => <ProductCard key={rp.id} p={rp} go={go} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} />)}
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* WISHLIST PAGE                                                      */
/* ---------------------------------------------------------------- */
const WishlistPage = ({ go, wishlist, toggleWish, addToCart }) => {
  const items = PRODUCTS.filter((p) => wishlist.includes(p.id));
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <h1 className="gv-serif text-3xl text-stone-900 mb-6">Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={36} className="mx-auto text-stone-300 mb-3" />
          <p className="text-stone-500 text-sm mb-5">Nothing saved yet. Tap the heart on any product to save it here.</p>
          <Btn onClick={() => go("shop")}>Browse products</Btn>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((p) => <ProductCard key={p.id} p={p} go={go} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} />)}
        </div>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* CART + CHECKOUT LOGIC HELPERS                                     */
/* ---------------------------------------------------------------- */
function computeTotals(cart, coupon) {
  const items = cart.map((ci) => ({ ...ci, product: PRODUCTS.find((p) => p.id === ci.id) }));
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  let discount = 0;
  if (coupon && COUPONS[coupon]) {
    const c = COUPONS[coupon];
    if (c.type === "pct") discount = Math.min(subtotal * (c.value / 100), c.cap);
    else if (subtotal >= (c.min || 0)) discount = c.value;
  }
  const taxable = Math.max(subtotal - discount, 0);
  const gst = taxable * 0.18;
  const shipping = taxable >= 4999 || taxable === 0 ? 0 : 299;
  const total = taxable + gst + shipping;
  return { items, subtotal, discount, gst, shipping, total };
}

/* ---------------------------------------------------------------- */
/* CART PAGE                                                          */
/* ---------------------------------------------------------------- */
const CartPage = ({ go, cart, updateQty, removeFromCart, coupon, setCoupon }) => {
  const [couponInput, setCouponInput] = useState(coupon || "");
  const [couponMsg, setCouponMsg] = useState("");
  const { items, subtotal, discount, gst, shipping, total } = computeTotals(cart, coupon);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!COUPONS[code]) { setCouponMsg("Invalid coupon code."); return; }
    const c = COUPONS[code];
    if (c.min && subtotal < c.min) { setCouponMsg(`Add ${inr(c.min - subtotal)} more to use this coupon.`); return; }
    setCoupon(code); setCouponMsg(`Applied: ${c.label}`);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <ShoppingCart size={36} className="mx-auto text-stone-300 mb-3" />
        <h1 className="gv-serif text-2xl text-stone-900 mb-2">Your cart is empty</h1>
        <p className="text-sm text-stone-500 mb-6">Add a few pieces and they'll show up here.</p>
        <Btn onClick={() => go("shop")}>Start shopping</Btn>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
      <h1 className="gv-serif text-3xl text-stone-900 mb-6">Your Cart</h1>
      <div className="grid md:grid-cols-[1fr_340px] gap-10">
        <div className="flex flex-col gap-4">
          {items.map((i) => (
            <div key={i.id} className="flex gap-4 border border-stone-100 rounded-sm p-3 bg-white">
              <CategoryArt catId={i.product.category} className="w-24 h-24 rounded-sm shrink-0" plain />
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <button onClick={() => go("product", { id: i.product.id })} className="text-sm font-medium text-stone-900 hover:text-amber-900">{i.product.name}</button>
                  <button onClick={() => removeFromCart(i.id)} className="text-stone-400 hover:text-rose-600"><Trash2 size={16} /></button>
                </div>
                <div className="text-xs text-stone-500">{i.product.material}</div>
                <div className="flex items-center justify-between mt-2">
                  <QtyStepper qty={i.qty} onChange={(q) => updateQty(i.id, q)} max={i.product.stock} />
                  <span className="text-sm font-semibold text-stone-900">{inr(i.product.price * i.qty)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border border-stone-200 rounded-sm p-5 h-fit bg-white">
          <div className="text-sm font-medium text-stone-900 mb-3">Have a coupon?</div>
          <div className="flex gap-2 mb-2">
            <input value={couponInput} onChange={(e) => setCouponInput(e.target.value)} placeholder="WELCOME10" className="flex-1 border border-stone-300 rounded-sm px-3 py-2 text-sm" />
            <Btn variant="outline" onClick={applyCoupon}>Apply</Btn>
          </div>
          {couponMsg && <div className="text-xs text-amber-800 mb-3">{couponMsg}</div>}
          <div className="text-xs text-stone-400 mb-4">Try WELCOME10 or FLAT500</div>

          <div className="flex flex-col gap-2 text-sm border-t border-stone-100 pt-4">
            <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-{inr(discount)}</span></div>}
            <div className="flex justify-between text-stone-600"><span>GST (18%)</span><span>{inr(gst)}</span></div>
            <div className="flex justify-between text-stone-600"><span>Shipping</span><span>{shipping === 0 ? "Free" : inr(shipping)}</span></div>
            <div className="flex justify-between text-base font-semibold text-stone-900 border-t border-stone-100 pt-2 mt-1"><span>Total</span><span>{inr(total)}</span></div>
          </div>
          <Btn className="w-full mt-5" onClick={() => go("checkout")}>Proceed to Checkout <ArrowRight size={15} /></Btn>
        </div>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* LOGIN / REGISTER                                                    */
/* ---------------------------------------------------------------- */
const LoginPage = ({ go, onLogin }) => {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="flex border border-stone-300 rounded-sm mb-8 overflow-hidden">
        <button onClick={() => setMode("login")} className={`flex-1 py-2.5 text-sm ${mode === "login" ? "bg-amber-900 text-amber-50" : "bg-white text-stone-600"}`}>Login</button>
        <button onClick={() => setMode("register")} className={`flex-1 py-2.5 text-sm ${mode === "register" ? "bg-amber-900 text-amber-50" : "bg-white text-stone-600"}`}>Register</button>
      </div>
      <h1 className="gv-serif text-2xl text-stone-900 mb-6">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
      <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); onLogin({ name: form.name || form.email.split("@")[0] || "Guest", email: form.email || "guest@example.com" }); }}>
        {mode === "register" && <input required value={form.name} onChange={set("name")} placeholder="Full name" className="border border-stone-300 rounded-sm px-3 py-2.5 text-sm" />}
        <input required type="email" value={form.email} onChange={set("email")} placeholder="Email address" className="border border-stone-300 rounded-sm px-3 py-2.5 text-sm" />
        {mode === "register" && <input required value={form.phone} onChange={set("phone")} placeholder="Phone number" className="border border-stone-300 rounded-sm px-3 py-2.5 text-sm" />}
        <input required type="password" value={form.password} onChange={set("password")} placeholder="Password" className="border border-stone-300 rounded-sm px-3 py-2.5 text-sm" />
        <Btn className="mt-2">{mode === "login" ? "Login" : "Create account"}</Btn>
      </form>
      <p className="text-xs text-stone-400 mt-4">This demo form signs you in locally in the browser. The production backend will verify credentials with hashed passwords and issue a JWT/session.</p>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* PROFILE / ADDRESSES / ORDERS / TRACKING                            */
/* ---------------------------------------------------------------- */
const ProfilePage = ({ user, go, onLogout }) => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <h1 className="gv-serif text-3xl text-stone-900 mb-6">My Account</h1>
    <div className="border border-stone-200 rounded-sm p-5 mb-6 flex items-center justify-between bg-white">
      <div>
        <div className="text-sm font-medium text-stone-900">{user?.name}</div>
        <div className="text-xs text-stone-500">{user?.email}</div>
      </div>
      <button onClick={onLogout} className="flex items-center gap-1.5 text-sm text-rose-600"><LogOut size={14} /> Logout</button>
    </div>
    <div className="grid sm:grid-cols-3 gap-4">
      {[
        { icon: Package, label: "My Orders", route: "orders" },
        { icon: MapPin, label: "Addresses", route: "addresses" },
        { icon: Heart, label: "Wishlist", route: "wishlist" },
      ].map((x) => (
        <button key={x.route} onClick={() => go(x.route)} className="gv-card border border-stone-200 rounded-sm p-5 bg-white text-left flex flex-col gap-2">
          <x.icon size={20} className="text-amber-800" />
          <span className="text-sm font-medium text-stone-900">{x.label}</span>
        </button>
      ))}
    </div>
  </div>
);

const AddressesPage = ({ addresses, addAddress, setDefaultAddress, removeAddress, go, embedded, onSelect, selectedId }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", line1: "", city: "", state: "", pin: "", type: "Home" });
  const submit = (e) => {
    e.preventDefault();
    addAddress({ ...form, id: Date.now() });
    setForm({ name: "", phone: "", line1: "", city: "", state: "", pin: "", type: "Home" });
    setShowForm(false);
  };
  return (
    <div className={embedded ? "" : "max-w-2xl mx-auto px-4 py-12"}>
      {!embedded && <h1 className="gv-serif text-3xl text-stone-900 mb-6">Saved Addresses</h1>}
      <div className="flex flex-col gap-3 mb-4">
        {addresses.length === 0 && <div className="text-sm text-stone-500">No addresses saved yet.</div>}
        {addresses.map((a) => (
          <div key={a.id} onClick={() => onSelect && onSelect(a.id)} className={`border rounded-sm p-4 bg-white ${embedded ? "cursor-pointer" : ""} ${selectedId === a.id ? "border-amber-800 ring-1 ring-amber-800" : "border-stone-200"}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-medium text-stone-900">{a.name} <span className="text-xs text-stone-400 ml-1">{a.type}</span></div>
                <div className="text-xs text-stone-500 mt-1">{a.line1}, {a.city}, {a.state} - {a.pin}</div>
                <div className="text-xs text-stone-500">{a.phone}</div>
              </div>
              {!embedded && <button onClick={(e) => { e.stopPropagation(); removeAddress(a.id); }} className="text-stone-400 hover:text-rose-600"><Trash2 size={15} /></button>}
            </div>
          </div>
        ))}
      </div>
      {!showForm ? (
        <Btn variant="outline" onClick={() => setShowForm(true)}>+ Add new address</Btn>
      ) : (
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3 border border-stone-200 rounded-sm p-4 bg-white">
          <input required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border border-stone-300 rounded-sm px-3 py-2 text-sm sm:col-span-2" />
          <input required placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-stone-300 rounded-sm px-3 py-2 text-sm sm:col-span-2" />
          <input required placeholder="Address line" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="border border-stone-300 rounded-sm px-3 py-2 text-sm sm:col-span-2" />
          <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border border-stone-300 rounded-sm px-3 py-2 text-sm" />
          <input required placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="border border-stone-300 rounded-sm px-3 py-2 text-sm" />
          <input required placeholder="PIN code" value={form.pin} onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g,"").slice(0,6) })} className="border border-stone-300 rounded-sm px-3 py-2 text-sm" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="border border-stone-300 rounded-sm px-3 py-2 text-sm">
            <option>Home</option><option>Work</option>
          </select>
          <div className="sm:col-span-2 flex gap-2 mt-1">
            <Btn>Save address</Btn>
            <Btn variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Btn>
          </div>
        </form>
      )}
    </div>
  );
};

const ORDER_STATUSES = ["Placed", "Confirmed", "Shipped", "Out for Delivery", "Delivered"];

const MyOrdersPage = ({ orders, go }) => (
  <div className="max-w-3xl mx-auto px-4 py-12">
    <h1 className="gv-serif text-3xl text-stone-900 mb-6">My Orders</h1>
    {orders.length === 0 ? (
      <div className="text-center py-16">
        <Package size={32} className="mx-auto text-stone-300 mb-3" />
        <p className="text-sm text-stone-500 mb-5">No orders yet.</p>
        <Btn onClick={() => go("shop")}>Shop now</Btn>
      </div>
    ) : (
      <div className="flex flex-col gap-3">
        {orders.map((o) => (
          <button key={o.id} onClick={() => go("tracking", { id: o.id })} className="border border-stone-200 rounded-sm p-4 bg-white text-left flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-stone-900">Order #{o.id}</div>
              <div className="text-xs text-stone-500">{o.date} · {o.items.length} item(s) · {inr(o.total)}</div>
            </div>
            <Badge tone={o.status === "Delivered" ? "green" : "amber"}>{o.status}</Badge>
          </button>
        ))}
      </div>
    )}
  </div>
);

const OrderTrackingPage = ({ orders, params, go }) => {
  const order = orders.find((o) => o.id === params?.id) || orders[0];
  if (!order) return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-stone-500 text-sm">No order found. <button onClick={() => go("shop")} className="text-amber-800 underline">Go shopping</button></div>;
  const stepIdx = ORDER_STATUSES.indexOf(order.status);
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <button onClick={() => go("orders")} className="flex items-center gap-1 text-sm text-stone-500 mb-6"><ChevronLeft size={15} /> Back to orders</button>
      <h1 className="gv-serif text-2xl text-stone-900 mb-1">Order #{order.id}</h1>
      <p className="text-xs text-stone-500 mb-8">Placed on {order.date}</p>
      <div className="flex justify-between mb-10 relative">
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-stone-200" />
        <div className="absolute top-3 left-0 h-0.5 bg-amber-800" style={{ width: `${(stepIdx / (ORDER_STATUSES.length - 1)) * 100}%` }} />
        {ORDER_STATUSES.map((s, i) => (
          <div key={s} className="relative flex flex-col items-center gap-2 z-10" style={{ width: `${100 / ORDER_STATUSES.length}%` }}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${i <= stepIdx ? "bg-amber-800 text-white" : "bg-stone-200 text-stone-500"}`}>{i <= stepIdx ? <Check size={12} /> : i + 1}</div>
            <span className="text-[11px] text-stone-600 text-center">{s}</span>
          </div>
        ))}
      </div>
      <div className="border border-stone-200 rounded-sm p-4 bg-white mb-4">
        <div className="text-sm font-medium text-stone-900 mb-3">Items</div>
        {order.items.map((i) => (
          <div key={i.id} className="flex justify-between text-sm text-stone-600 mb-1.5">
            <span>{i.product.name} × {i.qty}</span><span>{inr(i.product.price * i.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-semibold text-stone-900 border-t border-stone-100 pt-2 mt-2"><span>Total</span><span>{inr(order.total)}</span></div>
      </div>
      <div className="border border-stone-200 rounded-sm p-4 bg-white text-sm text-stone-600">
        <div className="font-medium text-stone-900 mb-1">Delivery address</div>
        {order.address.name}, {order.address.line1}, {order.address.city}, {order.address.state} - {order.address.pin}
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* CHECKOUT + ORDER SUCCESS                                           */
/* ---------------------------------------------------------------- */
const CheckoutPage = ({ cart, coupon, addresses, addAddress, user, go, placeOrder }) => {
  const [step, setStep] = useState(user ? 1 : 0);
  const [selectedAddr, setSelectedAddr] = useState(addresses[0]?.id || null);
  const [payMethod, setPayMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const { items, subtotal, discount, gst, shipping, total } = computeTotals(cart, coupon);
  const address = addresses.find((a) => a.id === selectedAddr);

  const steps = ["Address", "Review", "Payment"];

  const handlePlaceOrder = () => {
    setProcessing(true);
    // In production: create a Razorpay order server-side, open Razorpay Checkout,
    // then verify the payment signature server-side via /api/payments/verify
    // before marking this order paid. Simulated here since no backend is connected.
    setTimeout(() => {
      const order = placeOrder({ items, total, address, payMethod });
      setProcessing(false);
      go("order-success", { id: order.id });
    }, 1400);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-sm text-stone-600 mb-5">Please login to continue to checkout.</p>
        <Btn onClick={() => go("login")}>Login / Register</Btn>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
      <h1 className="gv-serif text-3xl text-stone-900 mb-6">Checkout</h1>
      <div className="flex gap-6 mb-8 text-sm">
        {steps.map((s, i) => (
          <div key={s} className={`flex items-center gap-2 ${step >= i + 1 ? "text-amber-900 font-medium" : "text-stone-400"}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step >= i + 1 ? "bg-amber-800 text-white" : "bg-stone-200"}`}>{i + 1}</span>{s}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <AddressesPage addresses={addresses} addAddress={addAddress} embedded onSelect={setSelectedAddr} selectedId={selectedAddr} />
          <Btn className="mt-4" disabled={!selectedAddr} onClick={() => setStep(2)}>Continue to review</Btn>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="flex flex-col gap-3 mb-6">
            {items.map((i) => (
              <div key={i.id} className="flex justify-between text-sm border-b border-stone-100 pb-2">
                <span className="text-stone-700">{i.product.name} × {i.qty}</span>
                <span className="text-stone-900">{inr(i.product.price * i.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1.5 text-sm mb-6 max-w-xs">
            <div className="flex justify-between text-stone-600"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-700"><span>Discount ({coupon})</span><span>-{inr(discount)}</span></div>}
            <div className="flex justify-between text-stone-600"><span>GST (18%)</span><span>{inr(gst)}</span></div>
            <div className="flex justify-between text-stone-600"><span>Shipping</span><span>{shipping === 0 ? "Free" : inr(shipping)}</span></div>
            <div className="flex justify-between font-semibold text-stone-900 border-t border-stone-100 pt-1.5"><span>Total payable</span><span>{inr(total)}</span></div>
          </div>
          <div className="flex gap-3">
            <Btn variant="ghost" onClick={() => setStep(1)}>Back</Btn>
            <Btn onClick={() => setStep(3)}>Continue to payment</Btn>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="text-sm font-medium text-stone-900 mb-3">Choose payment method (Razorpay)</div>
          <div className="grid sm:grid-cols-4 gap-3 mb-6">
            {["upi", "card", "netbanking", "wallet"].map((m) => (
              <button key={m} onClick={() => setPayMethod(m)} className={`border rounded-sm p-3 text-sm capitalize ${payMethod === m ? "border-amber-800 bg-amber-50 text-amber-900" : "border-stone-200 text-stone-600"}`}>{m === "upi" ? "UPI" : m === "netbanking" ? "Net Banking" : m}</button>
            ))}
          </div>
          <div className="text-lg font-semibold text-stone-900 mb-4">Payable: {inr(total)}</div>
          <Btn onClick={handlePlaceOrder} disabled={processing}>{processing ? "Processing payment…" : `Pay ${inr(total)} securely`}</Btn>
          <p className="text-xs text-stone-400 mt-4 max-w-md leading-relaxed">
            In production this opens Razorpay Checkout using an order created by the backend (<code>/api/payments/create-order</code>), and the order is only confirmed after the backend verifies the payment signature (<code>/api/payments/verify</code>) and the webhook fires. No secret key is ever present in frontend code.
          </p>
        </div>
      )}
    </div>
  );
};

const OrderSuccessPage = ({ orders, params, go }) => {
  const order = orders.find((o) => o.id === params?.id);
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5"><Check size={26} className="text-green-700" /></div>
      <h1 className="gv-serif text-2xl text-stone-900 mb-2">Order confirmed</h1>
      <p className="text-sm text-stone-500 mb-1">Order #{order?.id}</p>
      <p className="text-sm text-stone-500 mb-8">Thank you — we'll email your invoice and shipping updates.</p>
      <div className="flex gap-3 justify-center">
        <Btn onClick={() => go("tracking", { id: order?.id })}>Track order</Btn>
        <Btn variant="outline" onClick={() => go("shop")}>Continue shopping</Btn>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* REVIEWS PAGE (site-wide + write review)                            */
/* ---------------------------------------------------------------- */
const ReviewsPage = ({ params, go }) => {
  const productId = params?.id || PRODUCTS[0].id;
  const product = PRODUCTS.find((p) => p.id === productId);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="max-w-xl mx-auto px-4 py-14">
      <button onClick={() => go("product", { id: product.id })} className="flex items-center gap-1 text-sm text-stone-500 mb-6"><ChevronLeft size={15} /> Back to product</button>
      <h1 className="gv-serif text-2xl text-stone-900 mb-1">Review: {product.name}</h1>
      <p className="text-sm text-stone-500 mb-6">Share your honest experience — it helps other buyers.</p>
      {submitted ? (
        <div className="border border-green-200 bg-green-50 text-green-800 text-sm rounded-sm p-4">Thanks — your review has been submitted for moderation.</div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="flex flex-col gap-4">
          <div>
            <div className="text-sm font-medium text-stone-900 mb-2">Your rating</div>
            <div className="flex gap-1">
              {[1,2,3,4,5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)}><Star size={24} className={n <= rating ? "fill-amber-600 text-amber-600" : "text-stone-300"} /></button>
              ))}
            </div>
          </div>
          <textarea required value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="What did you like or dislike?" className="border border-stone-300 rounded-sm px-3 py-2.5 text-sm" />
          <Btn className="w-fit">Submit review</Btn>
        </form>
      )}
    </div>
  );
};

/* ---------------------------------------------------------------- */
/* INFO PAGES (About, Contact, Custom, Services, FAQ, Policies)       */
/* ---------------------------------------------------------------- */
const InfoShell = ({ title, subtitle, children }) => (
  <div className="max-w-3xl mx-auto px-4 md:px-8 py-14">
    <h1 className="gv-serif text-3xl md:text-4xl text-stone-900 mb-3">{title}</h1>
    {subtitle && <p className="text-stone-500 text-sm mb-8 max-w-xl">{subtitle}</p>}
    {children}
  </div>
);

const AboutPage = () => (
  <InfoShell title="About Vithal Furniture" subtitle="Family-run, Pune-based, and building furniture the slower way since 2010.">
    <div className="rounded-sm overflow-hidden h-56 mb-8">
      <img src={WORKSHOP_IMAGE} alt="Wood grain detail from the Vithal workshop" className="w-full h-full object-cover" loading="lazy" />
    </div>
    <div className="prose-none text-sm text-stone-600 leading-relaxed flex flex-col gap-4">
      <p>Vithal Furniture began as a small carpentry workshop on the outskirts of Pune, building dining tables and cupboards for neighbours who wanted something sturdier than what the local market offered. Sixteen years later, we still cut, join and finish every piece in that same workshop — we've just gotten better at it.</p>
      <p>We work almost entirely in solid sheesham, mango and teak, sourced from certified suppliers, and every design is drawn in-house before it reaches a saw. No two batches are identical, because wood isn't identical — and we think that's the point.</p>
      <p>Today we ship across India, but the workshop hasn't changed: a small team of artisans, honest pricing, and furniture meant to outlast a few house moves.</p>
    </div>
    <div className="grid sm:grid-cols-3 gap-5 mt-10">
      {[["16+", "Years of craftsmanship"], ["30,000+", "Homes furnished"], ["4.6/5", "Average customer rating"]].map(([n, l]) => (
        <div key={l} className="border border-stone-200 rounded-sm p-5 bg-white">
          <div className="gv-serif text-2xl text-amber-900">{n}</div>
          <div className="text-xs text-stone-500 mt-1">{l}</div>
        </div>
      ))}
    </div>
  </InfoShell>
);

const ContactPage = () => {
  const [sent, setSent] = useState(false);
  return (
    <InfoShell title="Contact Us" subtitle="We usually reply within one business day.">
      <div className="grid md:grid-cols-2 gap-10">
        {sent ? (
          <div className="border border-green-200 bg-green-50 text-green-800 text-sm rounded-sm p-4 h-fit">Message sent — thanks for reaching out. We'll be in touch shortly.</div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="flex flex-col gap-3">
            <input required placeholder="Your name" className="border border-stone-300 rounded-sm px-3 py-2.5 text-sm" />
            <input required type="email" placeholder="Email address" className="border border-stone-300 rounded-sm px-3 py-2.5 text-sm" />
            <textarea required rows={5} placeholder="How can we help?" className="border border-stone-300 rounded-sm px-3 py-2.5 text-sm" />
            <Btn className="w-fit">Send message</Btn>
          </form>
        )}
        <div className="flex flex-col gap-4 text-sm text-stone-600">
          <div className="flex items-start gap-3"><MapPin size={17} className="text-amber-800 mt-0.5" /> Vithal Furniture Workshop, Hadapsar Industrial Estate, Pune, Maharashtra 411013</div>
          <div className="flex items-start gap-3"><Phone size={17} className="text-amber-800 mt-0.5" /> +91 98765 43210</div>
          <div className="flex items-start gap-3"><Mail size={17} className="text-amber-800 mt-0.5" /> care@vitthalfurniture.in</div>
          <div className="flex items-start gap-3"><Clock size={17} className="text-amber-800 mt-0.5" /> Mon–Sat, 10am–7pm IST</div>
        </div>
      </div>
    </InfoShell>
  );
};

const CustomFurniturePage = ({ go }) => {
  const [sent, setSent] = useState(false);
  return (
    <InfoShell title="Custom Furniture" subtitle="Send us your dimensions and style, and our design team will quote within 48 hours.">
      <div className="grid sm:grid-cols-4 gap-4 mb-10">
        {[["Share details","Room size, wood preference, budget"],["We sketch a design","Our in-house designer proposes 1-2 concepts"],["You approve","Refine finish, price is locked"],["We build & deliver","4-6 weeks, white-glove delivery"]].map(([t,d],i) => (
          <div key={t} className="border border-stone-200 rounded-sm p-4 bg-white">
            <div className="text-xs text-amber-800 font-medium mb-1">Step {i+1}</div>
            <div className="text-sm font-medium text-stone-900 mb-1">{t}</div>
            <div className="text-xs text-stone-500">{d}</div>
          </div>
        ))}
      </div>
      {sent ? (
        <div className="border border-green-200 bg-green-50 text-green-800 text-sm rounded-sm p-4 max-w-lg">Request received — our design team will email you within 48 hours.</div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="grid sm:grid-cols-2 gap-3 max-w-xl">
          <input required placeholder="Your name" className="border border-stone-300 rounded-sm px-3 py-2.5 text-sm sm:col-span-2" />
          <input required type="email" placeholder="Email" className="border border-stone-300 rounded-sm px-3 py-2.5 text-sm" />
          <input required placeholder="Phone" className="border border-stone-300 rounded-sm px-3 py-2.5 text-sm" />
          <select className="border border-stone-300 rounded-sm px-3 py-2.5 text-sm sm:col-span-2">
            {CATEGORIES.map((c) => <option key={c.id}>{c.name}</option>)}
          </select>
          <textarea rows={4} placeholder="Describe what you're looking for, rough dimensions, and budget" className="border border-stone-300 rounded-sm px-3 py-2.5 text-sm sm:col-span-2" />
          <Btn className="w-fit sm:col-span-2">Request a quote</Btn>
        </form>
      )}
    </InfoShell>
  );
};

const ServicesPage = () => (
  <InfoShell title="Services" subtitle="Beyond selling furniture — we help you plan, install and maintain it.">
    <div className="grid sm:grid-cols-2 gap-5">
      {[
        ["Interior Consultation", "A designer visits (or video-calls) to help plan furniture for your space and budget."],
        ["Custom Design & Build", "Bespoke pieces built to your measurements in our Pune workshop."],
        ["White-Glove Installation", "Assembly and placement handled by our own delivery team, not a courier."],
        ["Annual Maintenance (AMC)", "Polishing, hardware tightening and upholstery checks, once a year."],
      ].map(([t, d]) => (
        <div key={t} className="border border-stone-200 rounded-sm p-5 bg-white">
          <div className="text-sm font-medium text-stone-900 mb-1.5">{t}</div>
          <div className="text-xs text-stone-500 leading-relaxed">{d}</div>
        </div>
      ))}
    </div>
  </InfoShell>
);

const FAQ_ITEMS = [
  ["How long does delivery take?", "3–5 business days in serviceable metro PIN codes, 7–10 days elsewhere. You can check your PIN code on any product page."],
  ["Do you offer EMI or Pay Later?", "Card EMI and Pay Later are available via Razorpay at checkout, subject to your bank's eligibility."],
  ["Can I return a product?", "Yes — unused items in original packaging can be returned within 7 days of delivery. See our Return, Refund & Shipping Policy for details."],
  ["Is assembly included?", "Yes, our delivery partners assemble larger furniture (beds, wardrobes, dining sets) on-site at no extra cost in serviceable cities."],
  ["What wood do you use?", "Primarily sheesham, mango and teak, with some pieces in engineered wood for lighter, budget-friendly options — material is listed on every product page."],
  ["Do you offer GST invoices?", "Yes, a GST-compliant invoice is generated automatically and emailed after every order."],
];

const FAQPage = () => {
  const [open, setOpen] = useState(0);
  return (
    <InfoShell title="Frequently Asked Questions">
      <div className="flex flex-col gap-2">
        {FAQ_ITEMS.map(([q, a], i) => (
          <div key={i} className="border border-stone-200 rounded-sm bg-white">
            <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between p-4 text-left text-sm font-medium text-stone-900">
              {q} <ChevronDown size={16} className={`transition-transform ${open === i ? "rotate-180" : ""}`} />
            </button>
            {open === i && <div className="px-4 pb-4 text-sm text-stone-600 leading-relaxed">{a}</div>}
          </div>
        ))}
      </div>
    </InfoShell>
  );
};

const PrivacyPage = () => (
  <InfoShell title="Privacy Policy" subtitle="Last updated: September 2026">
    <div className="text-sm text-stone-600 leading-relaxed flex flex-col gap-4">
      <p>Vithal Furniture collects the information you provide when creating an account, placing an order, or contacting support — including your name, email, phone number, delivery address, and order history. Payment details are processed directly by Razorpay; we never store your card, UPI, or net banking credentials on our servers.</p>
      <p>We use your data to process orders, provide delivery updates, respond to support requests, and — with your consent — send offers and product updates. We do not sell your personal data to third parties. Data may be shared with logistics and payment partners strictly to fulfil your order.</p>
      <p>You can request a copy of your data or ask us to delete your account at any time by writing to care@vitthalfurniture.in. We retain order records as required by Indian tax law even after account deletion.</p>
    </div>
  </InfoShell>
);

const TermsPage = () => (
  <InfoShell title="Terms of Service" subtitle="Last updated: September 2026">
    <div className="text-sm text-stone-600 leading-relaxed flex flex-col gap-4">
      <p>By using vitthalfurniture.in you agree to purchase products for personal, non-commercial use unless otherwise agreed in writing. Prices are listed in Indian Rupees (₹) and are inclusive of applicable GST unless stated otherwise; shipping charges are shown separately at checkout.</p>
      <p>Product images are representative — natural wood grain and color may vary slightly from what's shown. Orders are confirmed only after successful payment verification; we reserve the right to cancel and refund orders that fail inventory or payment checks.</p>
      <p>Vithal Furniture is not liable for delays caused by circumstances outside our reasonable control, including courier disruptions or force majeure events. Disputes are subject to the jurisdiction of courts in Pune, Maharashtra.</p>
    </div>
  </InfoShell>
);

const ReturnsPage = () => (
  <InfoShell title="Return, Refund & Shipping Policy" subtitle="Last updated: September 2026">
    <div className="text-sm text-stone-600 leading-relaxed flex flex-col gap-5">
      <div>
        <div className="font-medium text-stone-900 mb-1.5">Shipping</div>
        <p>Free shipping on orders above ₹4,999; a flat ₹299 fee applies below that. Delivery takes 3–5 business days in serviceable metro PIN codes and 7–10 business days elsewhere. Large furniture is delivered with on-site assembly in serviceable cities.</p>
      </div>
      <div>
        <div className="font-medium text-stone-900 mb-1.5">Returns</div>
        <p>Unused products in original packaging can be returned within 7 days of delivery. Custom-built furniture (see Custom Furniture) is made to order and is non-returnable unless defective. To start a return, go to My Orders and select "Return item," or contact care@vitthalfurniture.in with your order number.</p>
      </div>
      <div>
        <div className="font-medium text-stone-900 mb-1.5">Refunds</div>
        <p>Approved refunds are issued to the original payment method via Razorpay within 5–7 business days of us receiving the returned item. Shipping charges are non-refundable except where the return is due to our error or a manufacturing defect.</p>
      </div>
    </div>
  </InfoShell>
);

/* ---------------------------------------------------------------- */
/* APP SHELL                                                          */
/* ---------------------------------------------------------------- */
export default function App() {
  const [route, setRoute] = useState({ name: "home", params: {} });
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2200);
  };

  const go = (name, params = {}) => {
    setRoute({ name, params });
    window.scrollTo({ top: 0, behavior: "instant" });
    if (name !== "shop") setSearchQuery("");
  };

  const addToCart = (id, qty = 1) => {
    setCart((c) => {
      const existing = c.find((i) => i.id === id);
      if (existing) return c.map((i) => (i.id === id ? { ...i, qty: Math.min(i.qty + qty, 10) } : i));
      return [...c, { id, qty }];
    });
    showToast("Added to cart");
  };
  const updateQty = (id, qty) => setCart((c) => c.map((i) => (i.id === id ? { ...i, qty } : i)));
  const removeFromCart = (id) => setCart((c) => c.filter((i) => i.id !== id));

  const toggleWish = (id) => {
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
    showToast(wishlist.includes(id) ? "Removed from wishlist" : "Saved to wishlist");
  };

  const onLogin = (u) => { setUser(u); showToast(`Welcome, ${u.name}`); go("profile"); };
  const onLogout = () => { setUser(null); go("home"); };

  const addAddress = (a) => { setAddresses((prev) => [...prev, a]); showToast("Address saved"); };
  const removeAddress = (id) => setAddresses((prev) => prev.filter((a) => a.id !== id));

  const placeOrder = ({ items, total, address, payMethod }) => {
    const order = { id: "GF" + Math.floor(100000 + Math.random() * 899999), date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }), items, total, address, payMethod, status: "Confirmed" };
    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setCoupon(null);
    return order;
  };

  const onSearchSubmit = (q) => { setSearchQuery(q); go("shop", { category: "all" }); };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  let Page = null;
  switch (route.name) {
    case "home": Page = <Home go={go} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} />; break;
    case "shop": Page = <Shop go={go} params={route.params} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} searchQuery={searchQuery} />; break;
    case "categories": Page = <CategoriesPage go={go} />; break;
    case "product": Page = <ProductDetails params={route.params} go={go} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} />; break;
    case "wishlist": Page = <WishlistPage go={go} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} />; break;
    case "cart": Page = <CartPage go={go} cart={cart} updateQty={updateQty} removeFromCart={removeFromCart} coupon={coupon} setCoupon={setCoupon} />; break;
    case "login": Page = <LoginPage go={go} onLogin={onLogin} />; break;
    case "profile": Page = user ? <ProfilePage user={user} go={go} onLogout={onLogout} /> : <LoginPage go={go} onLogin={onLogin} />; break;
    case "addresses": Page = <AddressesPage addresses={addresses} addAddress={addAddress} removeAddress={removeAddress} go={go} />; break;
    case "checkout": Page = <CheckoutPage cart={cart} coupon={coupon} addresses={addresses} addAddress={addAddress} user={user} go={go} placeOrder={placeOrder} />; break;
    case "order-success": Page = <OrderSuccessPage orders={orders} params={route.params} go={go} />; break;
    case "orders": Page = <MyOrdersPage orders={orders} go={go} />; break;
    case "tracking": Page = <OrderTrackingPage orders={orders} params={route.params} go={go} />; break;
    case "reviews": Page = <ReviewsPage params={route.params} go={go} />; break;
    case "about": Page = <AboutPage />; break;
    case "contact": Page = <ContactPage />; break;
    case "custom": Page = <CustomFurniturePage go={go} />; break;
    case "services": Page = <ServicesPage />; break;
    case "faq": Page = <FAQPage />; break;
    case "privacy": Page = <PrivacyPage />; break;
    case "terms": Page = <TermsPage />; break;
    case "returns": Page = <ReturnsPage />; break;
    default: Page = <Home go={go} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} />;
  }

  return (
    <div className="gv-root min-h-screen flex flex-col">
      <GlobalStyle />
      <Header go={go} cartCount={cartCount} wishCount={wishlist.length} user={user} searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearchSubmit={onSearchSubmit} />
      <main className="flex-1">{Page}</main>
      <Footer go={go} />
      <Toast msg={toast} />
    </div>
  );
}
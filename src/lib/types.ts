import supabase from './supabase';
export type Shade = {
  id: string;
  code: string;
  name: string;
  color: string;
  stock: number;
  image?: string;
};

export type Product = {
  id: string;
  name: string;
  english: string;
  description: string;
  category: string;
  price: number;
  oldPrice: number;
  weight: number;
  stock: number;
  image: string;
  badge: string;
  featured: boolean;
  active: boolean;
  shades: Shade[];
};

export type Category = {
  id: string;
  name: string;
  image: string;
};

export type Faq = { question: string; answer: string };

export type Settings = {
  name: string;
  tagline: string;
  announcement: string;
  announcementEnabled: boolean;
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  heroImage: string;
  heroButtonText: string;
  categoriesTitle: string;
  featuredTitle: string;
  featuredCount: number;
  shadeTitle: string;
  shadeDescription: string;
  shadeImage: string;
  storyTitle: string;
  showStory: boolean;
  showDelivery: boolean;
  showCategories: boolean;
  showShades: boolean;
  accent: string;
  about: string;
  email: string;
  phone: string;
  address: string;
  inside: number;
  outside: number;
  weightEnabled: boolean;
  baseWeight: number;
  weightStep: number;
  extraCharge: number;
  freeThreshold: number;
  faqs: Faq[];
};

export type CartItem = {
  productId: string;
  shadeId: string;
  quantity: number;
};

export type OrderItem = {
  productId?: string;
  name: string;
  shade?: string;
  shadeId?: string;
  quantity: number;
  price: number;
  weight?: number;
  image?: string;
};

export type PaymentMethod = 'cod' | 'bkash' | 'nagad' | 'rocket' | 'card';

export const PAYMENT_OPTIONS: { id: PaymentMethod; label: string }[] = [
  { id: 'cod', label: 'ক্যাশ অন ডেলিভারি' },
  { id: 'bkash', label: 'বিকাশ' },
  { id: 'nagad', label: 'নগদ' },
  { id: 'rocket', label: 'রকেট' },
  { id: 'card', label: 'কার্ড / অন্যান্য (ডেলিভারিতে)' },
];

export type Order = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  address: string;
  region: 'inside' | 'outside';
  note: string;
  payment: string;
  items: OrderItem[];
  subtotal: number;
  weight: number;
  delivery: number;
  total: number;
  status: string;
  adminNote: string;
  source: 'cloud' | 'local';
};

/** Store contact — phone & WhatsApp (01818898944) */
export const STORE_PHONE = '01818898944';
export const STORE_PHONE_TEL = 'tel:01818898944';
export const STORE_WHATSAPP = 'https://wa.me/8801818898944';
export const STORE_WHATSAPP_MSG =
  'আসসালামু আলাইকুম, আমি একটি পণ্য সম্পর্কে জানতে চাই।';
export function whatsappLink(message = STORE_WHATSAPP_MSG) {
  return `${STORE_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export type Panel = 'cart' | 'orders' | 'wishlist' | 'help' | 'privacy' | null;

export type SelectedProduct = { id: string; shadeId?: string } | null;

export const ORDER_STATUSES = [
  'অপেক্ষমাণ',
  'নিশ্চিত',
  'প্রসেসিং',
  'পাঠানো হয়েছে',
  'ডেলিভার্ড',
  'বাতিল',
] as const;

export const ACCENT_COLORS = ['#e6004c', '#c60036', '#db2777', '#ea580c', '#047857'];

export const BADGES = ['বেস্টসেলার', 'জনপ্রিয়', 'নতুন'];

export const SHADE_PALETTE: [string, string][] = [
  ['সেজ গ্রিন', '#8b9d7d'],
  ['ডাস্টি রোজ', '#d59891'],
  ['ন্যাচারাল ক্রিম', '#e9dfc8'],
  ['মাস্টার্ড', '#c8a04d'],
  ['আকাশি', '#99b8c9'],
  ['ল্যাভেন্ডার', '#b3a1c8'],
  ['টেরাকোটা', '#bd7257'],
  ['ফরেস্ট গ্রিন', '#506957'],
  ['বেবি পিংক', '#edc1c4'],
  ['পিচ', '#eac0a5'],
  ['অলিভ', '#8c9163'],
  ['নেভি ব্লু', '#405366'],
  ['সাদা', '#faf7f0'],
  ['বেজ', '#caba9e'],
  ['রুবি রেড', '#b55459'],
  ['ম্যারুন', '#814752'],
  ['লেমন', '#e3d795'],
  ['মিন্ট', '#afcfbc'],
  ['সানসেট', '#d79469'],
  ['চকলেট', '#856854'],
  ['সিলভার', '#babcb8'],
  ['চারকোল', '#545451'],
  ['ব্ল্যাক', '#30322f'],
  ['লিলাক', '#d4c5d9'],
  ['ডেনিম', '#6f8da2'],
  ['কোরাল', '#d98278'],
  ['আইভরি', '#f0e8d9'],
  ['স্যান্ড', '#d3bd97'],
  ['মস গ্রিন', '#697955'],
  ['প্লাম', '#855c7d'],
  ['পাউডার ব্লু', '#bed1df'],
  ['রোজ উড', '#aa7873'],
  ['হানি', '#d8b66c'],
  ['সি গ্রিন', '#7eaaa0'],
  ['কফি', '#90745f'],
  ['অর্কিড', '#bf8fae'],
];

export function makeShades(n: number, prefix: string): Shade[] {
  return SHADE_PALETTE.slice(0, n).map(([name, color], d) => ({
    id: `${prefix}-${d + 1}`,
    code: `${prefix.toUpperCase()}-${String(d + 1).padStart(2, '0')}`,
    name,
    color,
    stock: 12 + (d * 7) % 28,
  }));
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cotton', name: 'কটন সুতা', image: '/images/cotton.webp' },
  { id: 'wool', name: 'উল ও মিল্ক কটন', image: '/images/milk-cotton.webp' },
  { id: 'hooks', name: 'কুশি কাঁটা', image: '/images/hooks.webp' },
  { id: 'macrame', name: 'ম্যাক্রামে কর্ড', image: '/images/cat-macrame.jpg' },
  { id: 'tools', name: 'ক্রাফট এক্সেসরিজ', image: '/images/prod-buttons.jpg' },
  { id: 'kits', name: 'ক্রোশেট কিট', image: '/images/cat-amigurumi.jpg' },
];

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'cotton-100',
    name: 'প্রিমিয়াম কটন সুতা',
    english: 'Premium cotton yarn',
    description:
      'নরম, মসৃণ ও শ্বাসপ্রশ্বাসযোগ্য প্রিমিয়াম কটন সুতা — ব্যাগ, কোস্টার, হোম ডেকর ও দৈনন্দিন ক্রোশেটের জন্য আদর্শ। রঙ টিকে থাকে, সহজে ধোয়া যায়। প্রস্তাবিত কুশি কাঁটা: ৩–৪ মিমি। ১০০ গ্রাম প্যাক।',
    category: 'cotton',
    price: 180,
    oldPrice: 220,
    weight: 100,
    stock: 0,
    image: '/images/cotton.webp',
    badge: 'বেস্টসেলার',
    featured: true,
    active: true,
    shades: makeShades(36, 'c'),
  },
  {
    id: 'milk-50',
    name: 'মিল্ক কটন সুতা — 5 প্লাই',
    english: 'Milk cotton yarn 5 ply',
    description:
      'কোমল প্যাস্টেল শেডের ৫ প্লাই মিল্ক কটন — বেবি পোশাক, অ্যামিগুরুমি ও উপহার আইটেমের জন্য নরম স্পর্শ। গিঁট সহজে পড়ে, ফিনিশিং সুন্দর। প্রস্তাবিত কাঁটা: ২.৫–৩.৫ মিমি। ৫০ গ্রাম প্যাক।',
    category: 'wool',
    price: 130,
    oldPrice: 150,
    weight: 50,
    stock: 0,
    image: '/images/milk-cotton.webp',
    badge: 'জনপ্রিয়',
    featured: true,
    active: true,
    shades: makeShades(28, 'm'),
  },
  {
    id: 'hooks-set',
    name: 'সফট গ্রিপ কুশি কাঁটা সেট',
    english: 'Ergonomic crochet hook set',
    description:
      'আরামদায়ক সফট গ্রিপসহ ৭টি বিভিন্ন মাপের কুশি কাঁটার সম্পূর্ণ সেট। নতুন ও অভিজ্ঞ — সবার হাতে মানানসই। দীর্ঘক্ষণ বুনলেও হাত ক্লান্ত হয় কম। আপনার নিত্যদিনের বুননের নির্ভরযোগ্য সঙ্গী।',
    category: 'hooks',
    price: 650,
    oldPrice: 750,
    weight: 180,
    stock: 18,
    image: '/images/hooks.webp',
    badge: '',
    featured: true,
    active: true,
    shades: [],
  },
  {
    id: 'velvet-100',
    name: 'সফট ভেলভেট সুতা',
    english: 'Soft velvet chenille yarn',
    description:
      'মোলায়েম ভেলভেট/চেনিল সুতা — প্লাশ টয়, কুশন কভার ও নরম কম্বলের জন্য। লাক্সারি লুক, সহজে বোনা যায়। পছন্দের শেড বেছে নিন। প্রস্তাবিত কাঁটা: ৪–৬ মিমি। ১০০ গ্রাম প্যাক।',
    category: 'wool',
    price: 220,
    oldPrice: 260,
    weight: 100,
    stock: 0,
    image: '/images/velvet.webp',
    badge: 'নতুন',
    featured: true,
    active: true,
    shades: makeShades(24, 'v'),
  },
  {
    id: 'macrame-250',
    name: 'ন্যাচারাল ম্যাক্রামে কর্ড',
    english: 'Natural macrame cord 3mm',
    description:
      '৩ মিমি প্রাকৃতিক ম্যাক্রামে কর্ড — ওয়াল হ্যাংগিং, প্ল্যান্ট হ্যাঙ্গার ও হোম ডেকর প্রজেক্টের জন্য মজবুত ও সুন্দর ফিনিশ। ন্যাচারাল টোন, সহজে গিঁট বাঁধা যায়। ২৫০ গ্রাম রোল।',
    category: 'macrame',
    price: 320,
    oldPrice: 0,
    weight: 250,
    stock: 0,
    image: '/images/prod-jute.jpg',
    badge: 'নতুন',
    featured: false,
    active: true,
    shades: makeShades(12, 'n'),
  },
  {
    id: 'wood-buttons',
    name: 'কাঠের বাটন — 20 পিস',
    english: 'Wooden craft buttons',
    description:
      'হাতে তৈরি পোশাক, ব্যাগ ও ক্রাফট প্রজেক্টে ন্যাচারাল ফিনিশিং দিতে বিভিন্ন ডিজাইনের ২০টি কাঠের বাটনের প্যাকেট। হালকা, টেকসই ও সহজে সেলাইযোগ্য।',
    category: 'tools',
    price: 90,
    oldPrice: 120,
    weight: 20,
    stock: 35,
    image: '/images/prod-buttons.jpg',
    badge: '',
    featured: false,
    active: true,
    shades: [],
  },
  {
    id: 'amigurumi-kit',
    name: 'অ্যামিগুরুমি স্টার্টার কিট',
    english: 'Amigurumi crochet starter kit',
    description:
      'প্রথম হাতে বোনা খেলনার সম্পূর্ণ কিট — সুতা, কুশি কাঁটা, সফট ফিলিং ও সেফটি আই একসাথে। নতুনদের জন্য সহজ বাংলা নির্দেশনাসহ। উপহার বা নিজে শুরু করার আদর্শ প্যাক।',
    category: 'kits',
    price: 580,
    oldPrice: 650,
    weight: 350,
    stock: 12,
    image: '/images/cat-amigurumi.jpg',
    badge: 'নতুন',
    featured: false,
    active: true,
    shades: [],
  },
  {
    id: 'toy-filling',
    name: 'সফট টয় ফিলিং',
    english: 'Soft toy poly fiber filling',
    description:
      'হাতে বোনা খেলনা, কুশন ও অ্যামিগুরুমির জন্য হালকা নরম পলিফাইবার ফিলিং। সহজে ভরা যায়, আকৃতি ধরে রাখে, ধোয়ার পরও ফ্লাফি থাকে। ১০০ গ্রাম প্যাক।',
    category: 'tools',
    price: 120,
    oldPrice: 0,
    weight: 100,
    stock: 40,
    image: '/images/prod-filling.jpg',
    badge: '',
    featured: false,
    active: true,
    shades: [],
  },
];

export const DEFAULT_SETTINGS: Settings = {
  name: 'কুশি শিল্প',
  tagline: 'শখের বুননে, ভালোবাসার গল্প',
  announcement: 'হাতে বোনায় মিশুক ভালোবাসা',
  announcementEnabled: true,
  heroEyebrow: 'সৃষ্টির আনন্দ, প্রতিটি বুননে',
  heroTitle: 'আপনার সৃজনশীলতায়',
  heroAccent: 'লাগুক রঙের ছোঁয়া।',
  heroDescription:
    'সুন্দর কিছু তৈরির শুরু হোক সেরা উপকরণে। রঙিন সুতা, কুশি কাঁটা আর ক্রাফটের সবকিছু — আপনার শখের ছোট্ট সঙ্গী কুশি শিল্প।',
  heroImage: '/images/reference-rose-yarn.webp',
  heroButtonText: 'পছন্দের পণ্য খুঁজুন',
  categoriesTitle: 'কী দিয়ে শুরু করবেন?',
  featuredTitle: 'বুননের প্রিয় সঙ্গীরা',
  featuredCount: 4,
  shadeTitle: 'একই সুতা,\nআপনার মনের শত রঙ।',
  shadeDescription:
    'সেজ গ্রিন নাকি ডাস্টি রোজ? প্রতিটি সুতার সব শেড একসাথে দেখুন। শেড কোড মিলিয়ে বেছে নিন আপনার প্রিয় রঙ।',
  shadeImage: '/images/shade-collection.webp',
  storyTitle: 'ছোট্ট শখ থেকে, সুন্দর কিছুর শুরু।',
  showStory: true,
  showDelivery: true,
  showCategories: true,
  showShades: true,
  accent: '#e6004c',
  about:
    'একটা সুতা, একটা কুশি কাঁটা আর একটু ভালোবাসা — এভাবেই শুরু হয় সুন্দর কিছু তৈরির গল্প। আপনার সেই সৃজনশীল যাত্রার সঙ্গী হতে চায় কুশি শিল্প। যত্নে বেছে নেওয়া সুতা, মনের মতো শেড এবং প্রয়োজনীয় সব উপকরণ নিয়ে আমরা আছি আপনার পাশে।',
  email: '',
  phone: STORE_PHONE,
  address: 'বাংলাদেশ',
  inside: 80,
  outside: 130,
  weightEnabled: true,
  baseWeight: 500,
  weightStep: 500,
  extraCharge: 20,
  freeThreshold: 2000,
  faqs: [
    {
      question: 'একই সুতার একাধিক শেড কীভাবে অর্ডার করব?',
      answer:
        'পণ্যের পেজে পছন্দের শেডটি বেছে নিয়ে পরিমাণ দিয়ে ব্যাগে যোগ করুন। এরপর অন্য শেড বেছে নিয়ে আবার যোগ করুন। প্রতিটি শেড আপনার ব্যাগে আলাদা আইটেম হিসেবে থাকবে।',
    },
    {
      question: 'ডেলিভারি চার্জ কীভাবে হিসাব করা হয়?',
      answer:
        'আপনার এলাকার বেস চার্জের সাথে পার্সেলের অতিরিক্ত ওজনের চার্জ যোগ হয়। ব্যাগে পণ্য যোগ করার পর মোট ওজন ও সম্পূর্ণ ডেলিভারি হিসাব দেখতে পারবেন।',
    },
    {
      question: 'ছবির সাথে সুতার রঙ কি হুবহু মিলবে?',
      answer:
        'আলো এবং আপনার স্ক্রিনের সেটিংসের কারণে রঙের সামান্য তারতম্য হতে পারে। প্রতিটি রঙের আলাদা শেড কোড আছে — অর্ডারের আগে কোডটি দেখে নিন।',
    },
    {
      question: 'এখান থেকে কি সরাসরি অর্ডার দেওয়া যাবে?',
      answer:
        'হ্যাঁ। ওয়েবসাইট থেকে সরাসরি অর্ডার করুন অথবা WhatsApp 01818898944-এ মেসেজ দিন। ক্যাশ অন ডেলিভারি, বিকাশ, নগদ বা রকেটে পেমেন্ট করা যায়।',
    },
    {
      question: 'কী কী পেমেন্ট অপশন আছে?',
      answer:
        'ক্যাশ অন ডেলিভারি (COD), বিকাশ, নগদ, রকেট এবং কার্ড/অন্যান্য। চেকআউটে আপনার সুবিধামতো পদ্ধতি বেছে নিন।',
    },
  ],
};

export function mapProduct(n: Record<string, unknown>): Product {
  return {
    id: String(n.id),
    name: String(n.name || ''),
    english: String(n.english || ''),
    description: String(n.description || ''),
    category: String(n.category || ''),
    price: Number(n.price || 0),
    oldPrice: Number(n.old_price ?? n.oldPrice ?? 0),
    weight: Number(n.weight || 0),
    stock: Number(n.stock || 0),
    image: String(n.image || ''),
    badge: String(n.badge || ''),
    featured: !!n.featured,
    active: n.active !== false,
    shades: Array.isArray(n.shades) ? (n.shades as Shade[]) : [],
  };
}

export function mapOrder(n: Record<string, unknown>): Order {
  const rawNote = String(n.note || '');
  let payment = String(n.payment || n.payment_method || '');
  let note = rawNote;
  const payMatch = rawNote.match(/^\[পেমেন্ট:\s*([^\]]+)\]\n?/);
  if (payMatch) {
    payment = payment || payMatch[1].trim();
    note = rawNote.replace(payMatch[0], '').trim();
  }
  if (!payment) payment = 'ক্যাশ অন ডেলিভারি';
  return {
    id: String(n.id),
    createdAt: String(n.created_at || n.createdAt || new Date().toISOString()),
    name: String(n.name || ''),
    phone: String(n.phone || ''),
    address: String(n.address || ''),
    region: n.region === 'outside' ? 'outside' : 'inside',
    note,
    payment,
    items: Array.isArray(n.items) ? (n.items as Order['items']) : [],
    subtotal: Number(n.subtotal || 0),
    weight: Number(n.weight || 0),
    delivery: Number(n.delivery || 0),
    total: Number(n.total || 0),
    status: String(n.status || ''),
    adminNote: String(n.admin_note ?? n.adminNote ?? ''),
    source: 'cloud',
  };
}

export function mapSettings(n: Record<string, unknown>): Partial<Settings> {
  const out: Partial<Settings> = {};
  const pairs: [keyof Settings, string][] = [
    ['name', 'name'],
    ['tagline', 'tagline'],
    ['announcement', 'announcement'],
    ['heroEyebrow', 'heroEyebrow'],
    ['heroTitle', 'heroTitle'],
    ['heroAccent', 'heroAccent'],
    ['heroDescription', 'heroDescription'],
    ['heroImage', 'heroImage'],
    ['heroButtonText', 'heroButtonText'],
    ['categoriesTitle', 'categoriesTitle'],
    ['featuredTitle', 'featuredTitle'],
    ['shadeTitle', 'shadeTitle'],
    ['shadeDescription', 'shadeDescription'],
    ['shadeImage', 'shadeImage'],
    ['storyTitle', 'storyTitle'],
    ['accent', 'accent'],
    ['about', 'about'],
    ['email', 'email'],
    ['phone', 'phone'],
    ['address', 'address'],
  ];
  for (const [k, sk] of pairs) {
    if (n[sk] !== undefined) (out as Record<string, unknown>)[k] = n[sk];
  }
  if (n.announcementEnabled !== undefined) out.announcementEnabled = !!n.announcementEnabled;
  if (n.featuredCount !== undefined) out.featuredCount = Number(n.featuredCount);
  if (n.showStory !== undefined) out.showStory = !!n.showStory;
  if (n.showDelivery !== undefined) out.showDelivery = !!n.showDelivery;
  if (n.showCategories !== undefined) out.showCategories = !!n.showCategories;
  if (n.showShades !== undefined) out.showShades = !!n.showShades;
  if (n.inside !== undefined) out.inside = Number(n.inside);
  if (n.outside !== undefined) out.outside = Number(n.outside);
  if (n.weightEnabled !== undefined) out.weightEnabled = !!n.weightEnabled;
  if (n.baseWeight !== undefined) out.baseWeight = Number(n.baseWeight);
  if (n.weightStep !== undefined) out.weightStep = Number(n.weightStep);
  if (n.extraCharge !== undefined) out.extraCharge = Number(n.extraCharge);
  if (n.freeThreshold !== undefined) out.freeThreshold = Number(n.freeThreshold);
  if (Array.isArray(n.faqs)) out.faqs = n.faqs as Faq[];
  return out;
}

export const fmt = (n: number | string) => String(n);
export const money = (n: number) => `৳${Number(n).toLocaleString('en-US')}`;
export const weightLabel = (n: number) =>
  n >= 1000 ? `${Number((n / 1000).toFixed(2))} কেজি` : `${n} গ্রাম`;
export const totalStock = (p: Product) =>
  p.shades.length ? p.shades.reduce((a, s) => a + s.stock, 0) : p.stock;
export const uid = (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

export function deliveryCharge(
  s: Settings,
  weight: number,
  region: 'inside' | 'outside',
  subtotal = 0
) {
  if (s.freeThreshold > 0 && subtotal >= s.freeThreshold) return 0;
  const steps = s.weightEnabled
    ? Math.ceil(Math.max(0, weight - s.baseWeight) / Math.max(1, s.weightStep))
    : 0;
  return s[region] + steps * s.extraCharge;
}

export function formatDate(n: string) {
  try {
    return new Date(n).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return n;
  }
}

export function downloadReceipt(o: Order) {
  const a = `কুশি শিল্প — ${o.source === 'cloud' ? 'অনলাইন অর্ডার' : 'প্রিভিউ অর্ডার'}
${o.id}
${formatDate(o.createdAt)}

${o.name}
${o.phone}
${o.address}
পেমেন্ট: ${o.payment || 'ক্যাশ অন ডেলিভারি'}

${o.items
  .map(
    (d) =>
      `${d.name}${d.shade ? ' (' + d.shade + ')' : ''} × ${d.quantity} — ${money(d.price * d.quantity)}`
  )
  .join('\n')}

পণ্যমূল্য: ${money(o.subtotal)}
ওজন: ${weightLabel(o.weight)}
ডেলিভারি: ${money(o.delivery)}
মোট: ${money(o.total)}

যোগাযোগ: 01818898944 | WhatsApp: https://wa.me/8801818898944
${
  o.source === 'cloud'
    ? 'অর্ডার অনলাইনে সংরক্ষিত। নির্বাচিত পেমেন্ট পদ্ধতি অনুসারে সম্পন্ন করুন।'
    : 'পুরোনো লোকাল প্রিভিউ; বিক্রেতার কাছে পাঠানো হয়নি।'
}`;
  const url = URL.createObjectURL(new Blob([a], { type: 'text/plain;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `${o.id}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function authHeaders(): Promise<Record<string, string>> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) h.Authorization = `Bearer ${token}`;
  } catch {
    /* ignore */
  }
  return h;
}

export async function compressImageToWebp(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const max = 1600;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.82)
  );
  if (!blob) throw new Error('ছবি প্রস্তুত করা যায়নি');
  if (blob.size > 5 * 1024 * 1024) throw new Error('সংকুচিত ছবির আকার 5 এমবির বেশি।');
  const buf = await blob.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function uploadImage(file: File): Promise<string> {
  if (file.size > 8 * 1024 * 1024) throw new Error('ছবির আকার বেশি। ছোট ছবি বেছে নিন।');
  const base64 = await compressImageToWebp(file);
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 60) || 'photo';
  const fileName = `${Date.now()}-${safe}.webp`;
  const headers = await authHeaders();
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers,
    body: JSON.stringify({ fileName, fileBase64: base64, contentType: 'image/webp' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.url) throw new Error(data.error || 'ছবি যোগ করা যায়নি।');
  return data.url as string;
}

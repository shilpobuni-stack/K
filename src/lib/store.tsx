import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import supabase from './supabase';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_SETTINGS,
  authHeaders,
  mapOrder,
  mapProduct,
  mapSettings,
  type CartItem,
  type Category,
  type Order,
  type Panel,
  type Product,
  type SelectedProduct,
  type Settings,
} from './types';

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      /* ignore */
    }
    return initial;
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

type CloudState = {
  enabled: boolean;
  published: boolean;
  temporary: boolean;
  dirty: boolean;
  phase: 'ready' | 'saving';
  error: string;
  user: { email: string } | null;
  isMerchant: boolean;
  lastSynced: string;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

type StoreValue = {
  products: Product[];
  categories: Category[];
  settings: Settings;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  wishlist: string[];
  orders: Order[];
  merchantOrders: Order[];
  ordersLoading: boolean;
  cloud: CloudState;
  toast: string;
  notify: (msg: string) => void;
  toggleWish: (id: string) => void;
  addToCart: (product: Product, shadeId: string, qty: number) => boolean;
  placeOrder: (
    customer: {
      name: string;
      phone: string;
      address: string;
      region: 'inside' | 'outside';
      note: string;
      payment?: string;
    },
    requestId: string,
    expectedTotal: number
  ) => Promise<Order>;
  updateOrder: (order: Order, status: string, note: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
  searchOrders: (q: string) => Promise<Order[]>;
  saveProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  saveCategory: (c: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveSettings: (s: Settings) => Promise<void>;
  selectedProduct: SelectedProduct;
  setSelectedProduct: (v: SelectedProduct) => void;
  panel: Panel;
  setPanel: (v: Panel) => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [cart, setCart] = useLocalStorage<CartItem[]>('kushi-v2-cart', []);
  const [wishlist, setWishlist] = useLocalStorage<string[]>('kushi-v2-wishlist', []);
  const [myOrderIds, setMyOrderIds] = useLocalStorage<string[]>('kushi-my-orders', []);
  const [orders, setOrders] = useState<Order[]>([]);
  const [merchantOrders, setMerchantOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [phase, setPhase] = useState<'ready' | 'saving'>('ready');
  const [cloudError, setCloudError] = useState('');
  const [lastSynced, setLastSynced] = useState('');

  const notify = useCallback((msg: string) => setToast(msg), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', settings.accent);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', settings.accent);
    document.title = `${settings.name} — শখের বুননে, ভালোবাসার গল্প`;
  }, [settings.accent, settings.name]);

  const refreshCatalog = useCallback(async () => {
    try {
      const [pRes, cRes, sRes] = await Promise.all([
        fetch('/api/products').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/categories').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/settings').then((r) => (r.ok ? r.json() : null)),
      ]);
      if (Array.isArray(pRes) && pRes.length) setProducts(pRes.map(mapProduct));
      if (Array.isArray(cRes) && cRes.length) setCategories(cRes);
      if (sRes && typeof sRes === 'object') {
        setSettings((prev) => ({ ...prev, ...mapSettings(sRes), ...sRes }));
      }
      setLastSynced(new Date().toLocaleTimeString('en-GB'));
    } catch {
      /* keep defaults */
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? { email: data.session.user.email || '' } : null);
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { email: session.user.email || '' } : null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!myOrderIds.length) {
      setOrders([]);
      return;
    }
    fetch(`/api/orders?ids=${encodeURIComponent(myOrderIds.join(','))}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setOrders(data.map(mapOrder));
      })
      .catch(() => {});
  }, [JSON.stringify(myOrderIds)]);

  const refreshOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const headers = await authHeaders();
      const res = await fetch('/api/orders?all=1', { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMerchantOrders(data.map(mapOrder));
          setLastSynced(new Date().toLocaleTimeString('en-GB'));
        }
      }
    } catch {
      /* ignore */
    }
    setOrdersLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      setMerchantOrders([]);
      return;
    }
    refreshOrders();
    const t = setInterval(refreshOrders, 10000);
    return () => clearInterval(t);
  }, [user, refreshOrders]);

  const searchOrders = useCallback(async (q: string) => {
    const res = await fetch(`/api/orders?search=${encodeURIComponent(q)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map(mapOrder) : [];
  }, []);

  const toggleWish = useCallback(
    (id: string) => {
      setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    },
    [setWishlist]
  );

  const addToCart = useCallback(
    (product: Product, shadeId: string, qty: number) => {
      if (!product.active) return false;
      const shade = product.shades.find((s) => s.id === shadeId);
      const stock = product.shades.length ? shade?.stock ?? 0 : product.stock;
      if (product.shades.length && !shade) return false;
      let ok = true;
      setCart((prev) => {
        const existing = prev.find((c) => c.productId === product.id && c.shadeId === shadeId);
        const nextQty = (existing?.quantity || 0) + qty;
        if (nextQty > stock) {
          ok = false;
          return prev;
        }
        if (existing) {
          return prev.map((c) =>
            c.productId === product.id && c.shadeId === shadeId ? { ...c, quantity: nextQty } : c
          );
        }
        return [...prev, { productId: product.id, shadeId, quantity: qty }];
      });
      setTimeout(() => {
        notify(ok ? 'ব্যাগে যোগ করা হয়েছে।' : 'এই পরিমাণ পণ্য স্টকে নেই। কম পরিমাণ বেছে নিন।');
      }, 0);
      return ok;
    },
    [setCart, notify]
  );

  const placeOrder = useCallback(
    async (
      customer: {
        name: string;
        phone: string;
        address: string;
        region: 'inside' | 'outside';
        note: string;
        payment?: string;
      },
      requestId: string,
      expectedTotal: number
    ) => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, items: cart, customer, expectedTotal }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'অর্ডার পাঠানো যায়নি। আবার চেষ্টা করুন।');
      const order = mapOrder(data);
      setCart([]);
      setMyOrderIds((ids) => [order.id, ...ids.filter((x) => x !== order.id)].slice(0, 30));
      setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
      await refreshCatalog();
      return order;
    },
    [cart, setCart, setMyOrderIds, refreshCatalog]
  );

  const updateOrder = useCallback(
    async (order: Order, status: string, note: string) => {
      const headers = await authHeaders();
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ id: order.id, status, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'অর্ডার আপডেট হয়নি।');
      setMerchantOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status, adminNote: note } : o))
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status, adminNote: note } : o))
      );
      notify('অর্ডার অনলাইনে আপডেট হয়েছে।');
    },
    [notify]
  );

  const saveProduct = useCallback(
    async (p: Product) => {
      const headers = await authHeaders();
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          id: p.id,
          name: p.name,
          english: p.english,
          description: p.description,
          category: p.category,
          price: p.price,
          old_price: p.oldPrice,
          weight: p.weight,
          stock: p.stock,
          image: p.image,
          badge: p.badge,
          featured: p.featured,
          active: p.active,
          shades: p.shades,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'সেভ হয়নি।');
      }
      const data = await res.json();
      const mapped = mapProduct(data);
      setProducts((prev) =>
        prev.some((x) => x.id === mapped.id)
          ? prev.map((x) => (x.id === mapped.id ? mapped : x))
          : [...prev, mapped]
      );
      notify('পণ্যের তথ্য সেভ হয়েছে।');
    },
    [notify]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      const headers = await authHeaders();
      if (!(await fetch('/api/products', { method: 'DELETE', headers, body: JSON.stringify({ id }) })).ok)
        throw new Error('মুছা যায়নি।');
      setProducts((prev) => prev.filter((p) => p.id !== id));
      notify('পণ্যটি মুছে ফেলা হয়েছে।');
    },
    [notify]
  );

  const saveCategory = useCallback(
    async (c: Category) => {
      const headers = await authHeaders();
      if (!(await fetch('/api/categories', { method: 'PUT', headers, body: JSON.stringify(c) })).ok)
        throw new Error('সেভ হয়নি।');
      setCategories((prev) =>
        prev.some((x) => x.id === c.id) ? prev.map((x) => (x.id === c.id ? c : x)) : [...prev, c]
      );
      notify('ক্যাটাগরি সেভ হয়েছে।');
    },
    [notify]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const headers = await authHeaders();
      if (!(await fetch('/api/categories', { method: 'DELETE', headers, body: JSON.stringify({ id }) })).ok)
        throw new Error('মুছা যায়নি।');
      setCategories((prev) => prev.filter((c) => c.id !== id));
      notify('ক্যাটাগরি মুছে ফেলা হয়েছে।');
    },
    [notify]
  );

  const saveSettings = useCallback(async (s: Settings) => {
    const headers = await authHeaders();
    if (!(await fetch('/api/settings', { method: 'PUT', headers, body: JSON.stringify(s) })).ok)
      throw new Error('সেভ হয়নি।');
    setSettings(s);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setPhase('saving');
      setCloudError('');
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw new Error('ইমেইল বা পাসওয়ার্ড সঠিক নয়।');
        await refreshCatalog();
        await refreshOrders();
      } catch (e) {
        setCloudError(e instanceof Error ? e.message : 'সংযোগ ব্যর্থ হয়েছে।');
        throw e;
      } finally {
        setPhase('ready');
      }
    },
    [refreshCatalog, refreshOrders]
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const cloud: CloudState = {
    enabled: true,
    published: true,
    temporary: false,
    dirty: false,
    phase,
    error: cloudError,
    user,
    isMerchant: !!user,
    lastSynced,
    signIn,
    signOut,
    refresh: async () => {
      await refreshCatalog();
      if (user) await refreshOrders();
    },
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        settings,
        cart,
        setCart,
        wishlist,
        orders,
        merchantOrders,
        ordersLoading,
        cloud,
        toast,
        notify,
        toggleWish,
        addToCart,
        placeOrder,
        updateOrder,
        refreshOrders,
        searchOrders,
        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        saveSettings,
        selectedProduct,
        setSelectedProduct,
        panel,
        setPanel,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Clock3,
  CreditCard,
  Download,
  Heart,
  HelpCircle,
  Home,
  LayoutGrid,
  Leaf,
  MapPin,
  Menu,
  Minus,
  Moon,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Store,
  Sun,
  Trash2,
  Utensils,
  Volume2,
  WifiOff,
  X,
  Accessibility,
  Keyboard,
  ScanEye,
} from "lucide-react";
import {
  useSaved,
  initialProducts,
  defaultConfig,
  dates,
  windows,
  chime,
  type Product,
  type CartItem,
  type Order,
  type Subscription,
} from "./lib/store";
import Modal from "./components/Modal";

type View = "menu" | "orders" | "subscriptions" | "pos" | "kitchen" | "admin";
type AuditResult = { title: string; count: number; impact: string };
export default function Wanchai() {
  const [lang, setLang] = useSaved<"en" | "th">("lang", "en");
  const tr = (en: string, th: string) => (lang === "en" ? en : th);
  const [theme, setTheme] = useSaved("theme", "light");
  const [contrast, setContrast] = useSaved("contrast", false);
  const [large, setLarge] = useSaved("large", false);
  const [motion, setMotion] = useSaved("motion", false);
  const [config, setConfig] = useSaved("config", defaultConfig);
  const [products, setProducts] = useSaved<Product[]>(
    "products",
    initialProducts,
  );
  const [cart, setCart] = useSaved<CartItem[]>("cart", []);
  const [orders, setOrders] = useSaved<Order[]>("orders", []);
  const [subscriptions, setSubscriptions] = useSaved<Subscription[]>(
    "subscriptions",
    [],
  );
  const [view, setView] = useState<View>("menu");
  const [mobileNav, setMobileNav] = useState(false);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [date, setDate] = useSaved("date", dates()[0]);
  const [slot, setSlot] = useSaved("slot", windows[1]);
  const [modal, setModal] = useState<
    "checkout" | "plan" | "a11y" | "help" | "location" | null
  >(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [customer, setCustomer] = useSaved("customer", { name: "", phone: "" });
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(false);
  const [planCount, setPlanCount] = useState(3);
  const [planProduct, setPlanProduct] = useState("original");
  const [online, setOnline] = useState(navigator.onLine);
  const [cacheReady, setCacheReady] = useState(false);
  const [dial, setDial] = useState("");
  const [selected, setSelected] = useState("original");
  const [adminTab, setAdminTab] = useState("settings");
  const [audit, setAudit] = useState<AuditResult[] | null>(null);
  const [auditing, setAuditing] = useState(false);
  const [outline, setOutline] = useState(false);
  const [orderFilter, setOrderFilter] = useState("all");
  const availableDates = dates();
  const pickupDate = availableDates.includes(date) ? date : availableDates[0];
  const money = (v: number) =>
    new Intl.NumberFormat(lang === "en" ? "en-TH" : "th-TH", {
      style: "currency",
      currency: "THB",
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
    }).format(v);
  const formatDate = (v: string, full = false) =>
    new Intl.DateTimeFormat(lang === "en" ? "en-GB" : "th-TH", {
      day: "numeric",
      month: full ? "long" : "short",
      ...(full ? { weekday: "long" as const } : {}),
    }).format(new Date(v + "T12:00:00+07:00"));
  const pname = (p: Product) => tr(p.en, p.th);
  const totalCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = cart.reduce(
    (sum, item) =>
      sum + (products.find((p) => p.id === item.id)?.price || 0) * item.qty,
    0,
  );
  const total = plan ? Math.round(subtotal * 0.9) : subtotal;
  const occupancy = orders.filter(
    (o) =>
      o.date === pickupDate && o.window === slot && o.status !== "collected",
  ).length;
  const labels: Record<View, string> = {
    menu: tr("Our menu", "เมนูของเรา"),
    orders: tr("My orders", "ออเดอร์ของฉัน"),
    subscriptions: tr("Subscriptions", "แพ็กเกจรายสัปดาห์"),
    pos: tr("Point of sale", "จุดขาย"),
    kitchen: tr("Kitchen orders", "ออเดอร์ในครัว"),
    admin: tr("Settings & admin", "ตั้งค่าและจัดการ"),
  };
  const notify = (text: string) => setToast(text);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.contrast = String(contrast);
    document.documentElement.dataset.large = String(large);
    document.documentElement.dataset.motion = String(motion);
    document.documentElement.dataset.inspect = String(outline);
  }, [lang, theme, contrast, large, motion, outline]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    if ("serviceWorker" in navigator)
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then(() => setCacheReady(true))
        .catch(() => setCacheReady(false));
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  const go = (next: View) => {
    setView(next);
    setMobileNav(false);
    setError("");
    window.scrollTo({ top: 0, behavior: motion ? "instant" : "smooth" });
  };
  const add = (id: string, qty = 1) => {
    const p = products.find((p) => p.id === id);
    if (!p || qty < 1) return;
    const existing = cart.find((i) => i.id === id)?.qty || 0;
    if (existing + qty > p.stock) {
      notify(
        tr(
          "This batch has no more stock available.",
          "สินค้ารอบนี้มีไม่เพียงพอ",
        ),
      );
      return;
    }
    setPlan(false);
    setCart((old) => [
      ...old.filter((i) => i.id !== id),
      { id, qty: existing + qty },
    ]);
    notify(tr(`${p.en} added to your bag`, `เพิ่ม${p.th}ในตะกร้าแล้ว`));
  };
  const changeQty = (id: string, delta: number) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    setPlan(false);
    if (delta > 0) {
      add(id);
      return;
    }
    setCart((old) =>
      old
        .map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    );
  };
  const openCheckout = () => {
    if (!cart.length) {
      notify(
        tr(
          "Add a little goodness to your bag first.",
          "กรุณาเพิ่มสินค้าในตะกร้าก่อน",
        ),
      );
      return;
    }
    setError("");
    setModal("checkout");
  };
  const placeOrder = (e: FormEvent) => {
    e.preventDefault();
    if (!cart.length) return;
    if (occupancy >= config.capacity) {
      setError(
        tr(
          "This pickup window is full. Please choose another.",
          "ช่วงเวลานี้เต็มแล้ว กรุณาเลือกช่วงเวลาอื่น",
        ),
      );
      return;
    }
    if (
      cart.some(
        (i) => i.qty > (products.find((p) => p.id === i.id)?.stock || 0),
      )
    ) {
      setError(
        tr(
          "Stock has changed. Please update your bag.",
          "สต็อกมีการเปลี่ยนแปลง กรุณาตรวจสอบตะกร้า",
        ),
      );
      return;
    }
    if (
      !/^[+\d\s()-]{9,18}$/.test(customer.phone.trim()) ||
      !/^\d{9,15}$/.test(customer.phone.replace(/\D/g, "")) ||
      customer.name.trim().length < 2
    ) {
      setError(
        tr(
          "Please enter your name and a valid phone number (9–15 digits).",
          "กรุณากรอกชื่อและเบอร์โทรศัพท์ที่ถูกต้อง (9–15 หลัก)",
        ),
      );
      return;
    }
    const id = "WC-" + crypto.randomUUID().slice(0, 6).toUpperCase();
    const order: Order = {
      id,
      items: cart.map((item) => {
        const p = products.find((p) => p.id === item.id)!;
        return { name: p.en, nameTh: p.th, qty: item.qty, price: p.price };
      }),
      total,
      date: pickupDate,
      window: slot,
      name: customer.name.trim(),
      phone: customer.phone.trim(),
      status: "received",
      created: new Date().toISOString(),
      plan,
    };
    setOrders((old) => [order, ...old]);
    setProducts((old) =>
      old.map((p) => ({
        ...p,
        stock: p.stock - (cart.find((i) => i.id === p.id)?.qty || 0),
      })),
    );
    if (
      plan &&
      !subscriptions.some(
        (s) => s.product === cart[0].id && s.count === cart[0].qty && s.active,
      )
    )
      setSubscriptions((old) => [
        {
          id: "SP-" + crypto.randomUUID().slice(0, 6),
          product: cart[0].id,
          count: cart[0].qty,
          date: pickupDate,
          window: slot,
          active: true,
          name: customer.name.trim(),
        },
        ...old,
      ]);
    setCart([]);
    setPlan(false);
    setModal(null);
    chime(config.audio);
    go("orders");
    notify(
      tr(
        `Your order ${id} is saved. See you at the house!`,
        `บันทึกออเดอร์ ${id} แล้ว พบกันที่บ้านนะคะ`,
      ),
    );
  };
  const updateStatus = (id: string, status: Order["status"]) => {
    setOrders((old) => old.map((o) => (o.id === id ? { ...o, status } : o)));
    if (status === "ready") chime(config.audio, true);
    notify(
      tr(
        "Order status updated on this device.",
        "อัปเดตสถานะออเดอร์บนอุปกรณ์นี้แล้ว",
      ),
    );
  };
  const statusLabel = (s: Order["status"]) =>
    ({
      received: tr("Received", "รับออเดอร์แล้ว"),
      preparing: tr("Brewing with care", "กำลังเตรียม"),
      ready: tr("Ready for pickup", "พร้อมรับสินค้า"),
      collected: tr("Picked up", "รับสินค้าแล้ว"),
    })[s];
  const startPlan = () => {
    const p = products.find((p) => p.id === planProduct)!;
    if (p.stock < planCount) {
      notify(
        tr("Not enough bottles in this batch.", "สินค้าในรอบนี้ไม่เพียงพอ"),
      );
      return;
    }
    setCart([{ id: planProduct, qty: planCount }]);
    setPlan(true);
    setModal("checkout");
  };
  const runAudit = async () => {
    setAuditing(true);
    try {
      const axe = (await import("axe-core")).default;
      const result = await axe.run(document.querySelector("main")!, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      });
      setAudit(
        result.violations.map((v) => ({
          title: v.help,
          count: v.nodes.length,
          impact: v.impact || "review",
        })),
      );
    } catch {
      notify(
        tr(
          "The inspector could not complete. Please try again.",
          "ตรวจสอบไม่สำเร็จ กรุณาลองใหม่",
        ),
      );
    } finally {
      setAuditing(false);
    }
  };
  const exportOrders = () => {
    const csv = [
      ["Order", "Name", "Pickup date", "Window", "Total THB", "Status"],
      ...orders.map((o) => [
        o.id,
        o.name,
        o.date,
        o.window,
        String(o.total),
        o.status,
      ]),
    ]
      .map((row) =>
        row.map((c) => '"' + String(c).replace(/"/g, '""') + '"').join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "wanchai-orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  const cartContents = (
    <>
      {cart.length ? (
        <div className="cart-items">
          {cart.map((item) => {
            const p = products.find((p) => p.id === item.id);
            if (!p) return null;
            return (
              <div className="cart-item" key={item.id}>
                <img src={p.image} alt="" />
                <div className="cart-item-info">
                  <strong>{pname(p)}</strong>
                  <small>{money(p.price)}</small>
                  <div className="quantity">
                    <button
                      aria-label={tr(
                        `Remove one ${p.en}`,
                        `ลด${p.th}หนึ่งรายการ`,
                      )}
                      onClick={() => changeQty(p.id, -1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span>{item.qty}</span>
                    <button
                      aria-label={tr(
                        `Add one ${p.en}`,
                        `เพิ่ม${p.th}หนึ่งรายการ`,
                      )}
                      onClick={() => changeQty(p.id, 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <b>{money(p.price * item.qty)}</b>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-bag">
          <div className="empty-icon">
            <ShoppingBag size={29} strokeWidth={1.3} />
            <span>
              <Heart size={10} />
            </span>
          </div>
          <strong>
            {tr(
              "Your bag is waiting for a little joy",
              "ตะกร้ารอความอร่อยอยู่นะ",
            )}
          </strong>
          <p>
            {tr(
              "Pick your favorites from today’s brew.",
              "เลือกเมนูโปรดจากเมนูวันนี้ได้เลย",
            )}
          </p>
        </div>
      )}
    </>
  );
  const pickupFields = (
    <div className="pickup-fields">
      <label>
        <CalendarDays size={15} />
        {tr("Pickup day", "วันรับสินค้า")}
        <div className="select-wrap">
          <select value={pickupDate} onChange={(e) => setDate(e.target.value)}>
            {availableDates.map((d, i) => (
              <option key={d} value={d}>
                {i === 0 ? tr("Tomorrow", "พรุ่งนี้") + ", " : ""}
                {formatDate(d)}
              </option>
            ))}
          </select>
          <ChevronDown size={14} />
        </div>
      </label>
      <label>
        <Clock3 size={15} />
        {tr("Pickup window", "ช่วงเวลารับสินค้า")}
        <div className="select-wrap">
          <select value={slot} onChange={(e) => setSlot(e.target.value)}>
            {windows.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <ChevronDown size={14} />
        </div>
      </label>
    </div>
  );
  const orderBox = (
    <aside className="order-box panel" id="your-bag">
      <div className="order-box-head">
        <h3>{tr("Your little bag", "ตะกร้าของคุณ")}</h3>
        <span>
          {totalCount} {tr("items", "รายการ")}
        </span>
      </div>
      <div className="pickup-only">
        <MapPin size={14} />
        {tr("Pickup at Wanchai · Hai Ya", "รับที่บ้านวันชัย · หายยา")}
        <span className="green-dot" />
      </div>
      {cartContents}
      <div className="pickup-section">
        <h4>{tr("Make time for something good", "เลือกเวลามารับความอร่อย")}</h4>
        {pickupFields}
        <small className="availability">
          <span className="green-dot" />
          {occupancy < config.capacity
            ? tr(
                "Pre-orders open for this window",
                "เปิดรับออเดอร์สำหรับช่วงเวลานี้",
              )
            : tr("This window is full", "ช่วงเวลานี้เต็มแล้ว")}
        </small>
      </div>
      <div className="order-total">
        <span>{tr("Subtotal", "ยอดรวมย่อย")}</span>
        <b>{money(subtotal)}</b>
      </div>
      {plan && (
        <div className="discount-line">
          <span>
            {tr("Weekly plan savings · 10%", "ส่วนลดรายสัปดาห์ · 10%")}
          </span>
          <b>−{money(subtotal - total)}</b>
        </div>
      )}
      <button
        className="primary full checkout-button"
        onClick={openCheckout}
        disabled={!cart.length}
      >
        {tr("Review pre-order", "ตรวจสอบออเดอร์")}
        <ArrowRight size={16} />
      </button>
      <p className="pay-note">
        <ShieldCheck size={12} />
        {tr(
          "Pay at pickup. Made fresh for you.",
          "ชำระเงินเมื่อรับสินค้า ทำสดเพื่อคุณ",
        )}
      </p>
    </aside>
  );
  const filtered = products
    .filter(
      (p) =>
        (category === "all" || p.category === category) &&
        `${p.en} ${p.th}`.toLowerCase().includes(search.toLowerCase()),
    )
    .sort((a, b) => (sort ? a.price - b.price : 0));
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        {tr("Skip to main content", "ข้ามไปเนื้อหาหลัก")}
      </a>
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <button
          className="brand"
          onClick={() => go("menu")}
          aria-label={tr("Wanchai home", "หน้าหลักวันชัย")}
        >
          <span className="brand-symbol">
            <Sprout size={31} strokeWidth={1.4} />
          </span>
          <span>
            <b>
              WANCHAI<span className="brand-period">.</span>
            </b>
            <small>SOY MILK HOUSE</small>
          </span>
        </button>
        <div className="sidebar-intro">
          <span className="green-dot" />
          {tr("A good morning starts here.", "เริ่มต้นเช้าวันดี ๆ ที่นี่")}
        </div>
        <div className="nav-label">{tr("THE HOUSE", "บ้านของเรา")}</div>
        <nav aria-label={tr("Main navigation", "เมนูหลัก")}>
          {(
            [
              ["menu", LayoutGrid],
              ["orders", ShoppingBag],
              ["subscriptions", RefreshCw],
            ] as const
          ).map(([id, Icon]) => (
            <button
              key={id}
              className={`nav-item ${view === id ? "active" : ""}`}
              onClick={() => go(id)}
              aria-current={view === id ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{labels[id]}</span>
              {id === "menu" && <span className="nav-active-dot" />}
              {id === "orders" &&
                orders.filter((o) => o.status !== "collected").length > 0 && (
                  <span className="nav-count">
                    {orders.filter((o) => o.status !== "collected").length}
                  </span>
                )}
            </button>
          ))}
        </nav>
        <div className="nav-label operations-label">
          {tr("BEHIND THE COUNTER", "หลังเคาน์เตอร์")}
        </div>
        <nav aria-label={tr("Operations navigation", "เมนูจัดการร้าน")}>
          {(
            [
              ["pos", CreditCard],
              ["kitchen", Utensils],
              ["admin", Settings2],
            ] as const
          ).map(([id, Icon]) => (
            <button
              key={id}
              className={`nav-item ${view === id ? "active" : ""}`}
              onClick={() => go(id)}
              aria-current={view === id ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{labels[id]}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="house-note">
            <div className="house-note-icon">
              <Leaf size={21} />
            </div>
            <strong>
              {tr("One kitchen. One community.", "หนึ่งครัว หนึ่งชุมชน")}
            </strong>
            <p>
              {tr(
                "Small batches, big heart. Made fresh in Chiang Mai.",
                "ทำสดทีละน้อย ใส่ใจทุกขวด จากเชียงใหม่",
              )}
            </p>
            <span>
              CHIANG MAI, THAILAND <Heart size={10} />
            </span>
          </div>
          <button
            className="accessibility-link"
            onClick={() => setModal("a11y")}
          >
            <Accessibility size={17} />
            {tr("Accessibility & comfort", "การเข้าถึงและความสะดวก")}
          </button>
          <div className="sidebar-status">
            <span className="green-dot" />
            {cacheReady
              ? tr("Offline menu ready", "เมนูพร้อมใช้ออฟไลน์")
              : tr("Made with care, always", "ทำด้วยใจเสมอ")}
            <span>v 2.0</span>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label={tr("Toggle navigation", "เปิดเมนู")}
              onClick={() => setMobileNav(!mobileNav)}
            >
              {mobileNav ? <X size={21} /> : <Menu size={21} />}
            </button>
            <Home size={15} />
            <ChevronRight size={13} />
            <span>{labels[view]}</span>
          </div>
          <div className="header-actions">
            <span className="fresh-status">
              <span className="green-dot" />
              {tr("Freshly brewed, daily", "ต้มสดใหม่ทุกวัน")}
            </span>
            <span className="header-divider" />
            <button
              className="language-button"
              onClick={() => setLang(lang === "en" ? "th" : "en")}
              aria-label={tr("Switch to Thai", "เปลี่ยนเป็นภาษาอังกฤษ")}
            >
              <span className={lang === "en" ? "selected" : ""}>EN</span>
              <i>/</i>
              <span className={lang === "th" ? "selected" : ""}>ไทย</span>
            </button>
            <button
              className="icon-button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label={tr(
                "Toggle light or dark theme",
                "เปลี่ยนโหมดสว่างหรือมืด",
              )}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              className="icon-button notification"
              aria-label={tr("View order updates", "ดูสถานะออเดอร์")}
              onClick={() => go("orders")}
            >
              <Bell size={18} />
              {orders.some((o) => o.status === "ready") && <span />}
            </button>
            <button
              className="avatar"
              aria-label={tr("Open house settings", "เปิดการตั้งค่าร้าน")}
              onClick={() => go("admin")}
            >
              W
            </button>
          </div>
        </header>
        {!online && (
          <div className="offline-banner">
            <WifiOff size={16} />
            {tr(
              "You’re offline. Menu and orders are available on this device; no server sync is connected.",
              "คุณออฟไลน์ เมนูและออเดอร์ใช้งานบนอุปกรณ์นี้ได้ ยังไม่ได้เชื่อมต่อเซิร์ฟเวอร์",
            )}
          </div>
        )}
        <main id="main-content" tabIndex={-1}>
          {view === "menu" && (
            <>
              <section className="hero">
                <div className="hero-copy">
                  <div className="hero-eyebrow">
                    <span className="green-dot" />
                    {tr(
                      "FRESH FROM OUR CHIANG MAI KITCHEN",
                      "สดใหม่จากครัวของเราในเชียงใหม่",
                    )}
                  </div>
                  <h1>
                    {tr(config.heading, config.headingTh)
                      .split("\n")
                      .map((line, i) => (
                        <span key={i}>
                          {line}
                          {i === 0 && <br />}
                        </span>
                      ))}
                  </h1>
                  <p>
                    {tr(
                      config.note,
                      "ทำสดใหม่ เรียบง่ายด้วยความใส่ใจ น้ำเต้าหู้ทีละน้อยจากครัวเชียงใหม่ เพื่อเติมความสุขเล็ก ๆ ให้ทุกวันของคุณ",
                    )}
                  </p>
                  <button
                    className="primary"
                    onClick={() =>
                      document
                        .getElementById("todays-brew")
                        ?.scrollIntoView({
                          behavior: motion ? "instant" : "smooth",
                        })
                    }
                  >
                    {tr(
                      "Find your morning favorite",
                      "เลือกเมนูโปรดสำหรับเช้านี้",
                    )}
                    <ArrowRight size={17} />
                  </button>
                  <div className="hero-footer">
                    <Leaf size={14} />
                    {tr("100% plant-based", "จากพืช 100%")}
                    <i /> {tr("No preservatives", "ไม่ใส่สารกันเสีย")}
                    <i />
                    {tr("Made with heart", "ทำด้วยใจ")}
                  </div>
                </div>
                <div className="hero-image">
                  <img
                    src="/images/hero.webp"
                    alt={tr(
                      "Fresh soy milk in a Wanchai bottle, a glass and a bowl of soybeans in the morning light",
                      "น้ำเต้าหู้สดในขวดวันชัย พร้อมแก้วและถั่วเหลืองในแสงยามเช้า",
                    )}
                    fetchPriority="high"
                  />
                  <div className="hero-stamp">
                    <Sprout size={23} />
                    <span>
                      {tr("Small batch.", "ทำทีละน้อย")}
                      <br />
                      {tr("Big goodness.", "ความอร่อยเต็มขวด")}
                    </span>
                  </div>
                  <div className="photo-caption">
                    <span className="green-dot" />
                    {tr(
                      "BREWED FRESH. NEVER RUSHED.",
                      "ต้มสดใหม่ ใส่ใจทุกขั้นตอน",
                    )}
                  </div>
                </div>
              </section>
              <section
                className="promise-strip"
                aria-label={tr(
                  "How our house works",
                  "วิธีการสั่งและรับสินค้า",
                )}
              >
                <div>
                  <span className="promise-icon">
                    <Sprout size={21} />
                  </span>
                  <p>
                    <strong>
                      {tr("Fresh, every single morning", "ต้มสดใหม่ทุกเช้า")}
                    </strong>
                    <small>
                      {tr(
                        "Soaked, ground & brewed in small batches.",
                        "แช่ บด และต้มทีละน้อยด้วยความใส่ใจ",
                      )}
                    </small>
                  </p>
                </div>
                <div>
                  <span className="promise-icon">
                    <MapPin size={21} />
                  </span>
                  <p>
                    <strong>
                      {tr(
                        "One house. Your pickup spot.",
                        "บ้านเดียว จุดรับของคุณ",
                      )}
                    </strong>
                    <small>
                      {tr(
                        "A friendly little corner in Hai Ya, Chiang Mai.",
                        "มุมอบอุ่นเล็ก ๆ ที่หายยา เชียงใหม่",
                      )}
                    </small>
                  </p>
                </div>
                <div>
                  <span className="promise-icon">
                    <CalendarDays size={21} />
                  </span>
                  <p>
                    <strong>
                      {tr(
                        "Your time, your little ritual",
                        "เวลาของคุณ ความสุขประจำวัน",
                      )}
                    </strong>
                    <small>
                      {tr(
                        "Pre-order ahead. Pick up when it suits you.",
                        "สั่งล่วงหน้า เลือกรับในเวลาที่สะดวก",
                      )}
                    </small>
                  </p>
                </div>
              </section>
              <div className="store-layout">
                <section className="menu-section" id="todays-brew">
                  <div className="section-heading">
                    <div>
                      <div className="section-kicker">
                        {tr(
                          "GOOD THINGS, MADE SIMPLY",
                          "ความอร่อยที่เรียบง่าย",
                        )}
                      </div>
                      <h2>
                        {tr("Today’s little joys", "ความสุขเล็ก ๆ ของวันนี้")}
                        <span className="heading-leaf">
                          <Leaf size={21} />
                        </span>
                      </h2>
                      <p>
                        {tr(
                          "Made fresh to order. A bottle of goodness for every kind of morning.",
                          "ทำสดเพื่อคุณ ความอร่อยสำหรับเช้าทุกรูปแบบ",
                        )}
                      </p>
                    </div>
                    <button
                      className="icon-button search-button"
                      onClick={() => setSearchOpen(!searchOpen)}
                      aria-expanded={searchOpen}
                      aria-label={tr("Search the menu", "ค้นหาเมนู")}
                    >
                      <Search size={19} />
                    </button>
                  </div>
                  <div className="menu-tools">
                    <div
                      className="category-tabs"
                      aria-label={tr("Product categories", "หมวดสินค้า")}
                    >
                      {[
                        ["all", tr("All goodness", "ทั้งหมด")],
                        ["milk", tr("Soy milk", "น้ำเต้าหู้")],
                        ["treat", tr("Little bites", "ของทานเล่น")],
                      ].map(([id, title]) => (
                        <button
                          key={id}
                          className={category === id ? "active" : ""}
                          onClick={() => setCategory(id)}
                          aria-pressed={category === id}
                        >
                          {id === "all" && <LayoutGrid size={13} />} {title}
                        </button>
                      ))}
                    </div>
                    <button
                      className={`sort-button ${sort ? "sorted" : ""}`}
                      onClick={() => setSort(!sort)}
                      aria-pressed={sort}
                    >
                      <ArrowDownUp size={13} />
                      {sort
                        ? tr("Price: low to high", "ราคา: น้อยไปมาก")
                        : tr("Popular", "ยอดนิยม")}
                    </button>
                  </div>
                  {searchOpen && (
                    <div className="search-field">
                      <Search size={17} />
                      <input
                        autoFocus
                        aria-label={tr("Search products", "ค้นหาสินค้า")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={tr(
                          "Find your favorite…",
                          "ค้นหาเมนูโปรด…",
                        )}
                      />
                      <button
                        aria-label={tr("Clear search", "ล้างคำค้นหา")}
                        className="icon-button"
                        onClick={() => setSearch("")}
                      >
                        <X size={15} />
                      </button>
                    </div>
                  )}
                  <div className="product-grid">
                    {filtered.map((p) => (
                      <article className="product-card" key={p.id}>
                        <button
                          className="product-image"
                          onClick={() => setDetail(p)}
                          aria-label={tr(
                            `View ${p.en} details`,
                            `ดูรายละเอียด${p.th}`,
                          )}
                        >
                          <img src={p.image} alt={pname(p)} loading="lazy" />
                          {p.tag && (
                            <span className={`product-tag ${p.id}`}>
                              {tr(p.tag, p.tagTh || p.tag)}
                            </span>
                          )}
                          <span className="product-volume">
                            {p.category === "milk"
                              ? "350 ml"
                              : tr("Freshly made", "ทำสดใหม่")}
                          </span>
                        </button>
                        <div className="product-info">
                          <button
                            className="product-name"
                            onClick={() => setDetail(p)}
                          >
                            {pname(p)}
                          </button>
                          <p>{tr(p.desc, p.descTh)}</p>
                          <div className="product-meta">
                            <Leaf size={11} />
                            {tr("Plant-based", "จากพืช")}
                            <span>·</span>
                            {tr("Fresh daily", "ทำสดทุกวัน")}
                          </div>
                          <div className="product-bottom">
                            <div>
                              <strong>{money(p.price)}</strong>
                              <small>
                                {tr(
                                  p.category === "milk"
                                    ? "/ bottle"
                                    : "/ serving",
                                  p.category === "milk" ? "/ ขวด" : "/ ชุด",
                                )}
                              </small>
                            </div>
                            <button
                              className="add-button"
                              disabled={p.stock === 0}
                              onClick={() => add(p.id)}
                              aria-label={tr(
                                `Add ${p.en} to bag`,
                                `เพิ่ม${p.th}ลงตะกร้า`,
                              )}
                            >
                              <Plus size={15} />
                              {p.stock
                                ? tr("Add", "เพิ่ม")
                                : tr("Sold out", "หมด")}
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                  {!filtered.length && (
                    <div className="empty-state">
                      <Search size={28} />
                      <h3>{tr("No little joys found", "ไม่พบเมนูที่ค้นหา")}</h3>
                      <p>
                        {tr(
                          "Try another search or category.",
                          "ลองคำค้นหรือหมวดหมู่อื่น",
                        )}
                      </p>
                      <button
                        className="secondary"
                        onClick={() => {
                          setSearch("");
                          setCategory("all");
                        }}
                      >
                        {tr("Show all products", "ดูสินค้าทั้งหมด")}
                      </button>
                    </div>
                  )}
                  <div className="subscription-banner">
                    <span className="subscription-art">
                      <RefreshCw size={27} />
                      <Leaf size={16} />
                    </span>
                    <div>
                      <span className="section-kicker">
                        {tr(
                          "A GOOD HABIT TO KEEP",
                          "ความสุขดี ๆ ที่มีได้ทุกสัปดาห์",
                        )}
                      </span>
                      <h3>
                        {tr(
                          "Your weekly dose of goodness.",
                          "ความอร่อยประจำสัปดาห์ของคุณ",
                        )}
                      </h3>
                      <p>
                        {tr(
                          "A little routine, a little saving. Enjoy 10% off with a weekly pickup plan.",
                          "เติมความสุขเป็นประจำ รับส่วนลด 10% กับแพ็กเกจรับรายสัปดาห์",
                        )}
                      </p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setModal("plan")}
                    >
                      {tr("Explore plans", "ดูแพ็กเกจ")}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                  <div className="allergen-note">
                    <HelpCircle size={14} />
                    {tr(
                      "A little heads-up: our kitchen handles soy, sesame and wheat. Ask us if you have an allergy.",
                      "ครัวของเราใช้ถั่วเหลือง งา และข้าวสาลี โปรดแจ้งหากคุณมีอาการแพ้",
                    )}
                  </div>
                </section>
                <div className="store-aside">
                  {orderBox}
                  <button
                    className="location-teaser"
                    onClick={() => setModal("location")}
                  >
                    <span className="location-icon">
                      <Store size={21} />
                    </span>
                    <span>
                      <strong>
                        {tr(
                          "Come by our little house",
                          "แวะมาที่บ้านเล็ก ๆ ของเรา",
                        )}
                      </strong>
                      <small>
                        {tr(
                          "Hai Ya, Chiang Mai · 06:30–15:00",
                          "หายยา เชียงใหม่ · 06:30–15:00",
                        )}
                      </small>
                    </span>
                    <ChevronRight size={16} />
                  </button>
                  <div className="local-label">
                    <Heart size={12} />
                    {tr(
                      "Locally made. Lovingly shared.",
                      "ทำด้วยใจ ส่งต่อด้วยความรัก",
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          {view === "orders" && (
            <>
              <PageHeading
                kicker={tr("YOUR MORNING RITUAL", "ความสุขยามเช้าของคุณ")}
                title={labels.orders}
                description={tr(
                  "From our kitchen to your hands. Keep an eye on your next little joy.",
                  "จากครัวของเราสู่มือคุณ ติดตามความอร่อยครั้งถัดไปได้ที่นี่",
                )}
              />
              <div className="notice">
                <ShieldCheck size={18} />
                {tr(
                  "On-device orders: these reservations are stored in this browser only. The kitchen and POS below use the same local workspace. No remote kitchen has been notified.",
                  "ออเดอร์ถูกบันทึกเฉพาะในเบราว์เซอร์นี้ ครัวและจุดขายใช้งานข้อมูลเดียวกัน ยังไม่ได้ส่งออเดอร์ไปยังร้านผ่านเซิร์ฟเวอร์",
                )}
              </div>
              <div className="page-toolbar">
                <div className="category-tabs">
                  {[
                    ["all", tr("All orders", "ทั้งหมด")],
                    ["active", tr("Upcoming", "กำลังดำเนินการ")],
                    ["collected", tr("Picked up", "รับแล้ว")],
                  ].map(([id, text]) => (
                    <button
                      key={id}
                      onClick={() => setOrderFilter(id)}
                      className={orderFilter === id ? "active" : ""}
                    >
                      {text}
                    </button>
                  ))}
                </div>
                <button
                  className="secondary"
                  disabled={!orders.length}
                  onClick={exportOrders}
                >
                  <Download size={15} />
                  {tr("Export orders", "ส่งออกออเดอร์")}
                </button>
              </div>
              {orders
                .filter(
                  (o) =>
                    orderFilter === "all" ||
                    (orderFilter === "active"
                      ? o.status !== "collected"
                      : o.status === "collected"),
                )
                .map((o) => (
                  <article className="order-card panel" key={o.id}>
                    <div className="order-card-top">
                      <div>
                        <span className="eyebrow">{o.id}</span>
                        <h3>{formatDate(o.date, true)}</h3>
                        <p>
                          <Clock3 size={14} />
                          {o.window}
                          <span>·</span>
                          <MapPin size={14} />
                          {tr("Wanchai, Hai Ya", "วันชัย หายยา")}
                        </p>
                      </div>
                      <span className={`status-badge ${o.status}`}>
                        <span className="green-dot" />
                        {statusLabel(o.status)}
                      </span>
                    </div>
                    <div className="order-progress">
                      {(
                        ["received", "preparing", "ready", "collected"] as const
                      ).map((s, i) => (
                        <div
                          key={s}
                          className={
                            [
                              "received",
                              "preparing",
                              "ready",
                              "collected",
                            ].indexOf(o.status) >= i
                              ? "complete"
                              : ""
                          }
                        >
                          <span>
                            {[
                              "received",
                              "preparing",
                              "ready",
                              "collected",
                            ].indexOf(o.status) >= i ? (
                              <Check size={12} />
                            ) : (
                              i + 1
                            )}
                          </span>
                          <small>{statusLabel(s)}</small>
                        </div>
                      ))}
                    </div>
                    <div className="order-lines">
                      {o.items.map((i, n) => (
                        <div key={n}>
                          <span>
                            {i.qty} × {tr(i.name, i.nameTh)}
                          </span>
                          <b>{money(i.qty * i.price)}</b>
                        </div>
                      ))}
                      {o.plan && (
                        <div className="discount-line">
                          {tr(
                            "Weekly plan savings included · 10%",
                            "รวมส่วนลดรายสัปดาห์ 10% แล้ว",
                          )}
                        </div>
                      )}
                    </div>
                    <div className="order-card-footer">
                      <span>
                        {o.name} · {tr("Pay at pickup", "ชำระเมื่อรับสินค้า")}
                      </span>
                      <strong>{money(o.total)}</strong>
                    </div>
                  </article>
                ))}
              {!orders.length && (
                <div className="empty-state panel">
                  <ShoppingBag size={42} strokeWidth={1.2} />
                  <h2>
                    {tr(
                      "Your next good morning starts here.",
                      "เช้าวันดี ๆ ครั้งถัดไป เริ่มที่นี่",
                    )}
                  </h2>
                  <p>
                    {tr(
                      "Your pre-orders will appear here, ready to follow from brew to pickup.",
                      "ออเดอร์ของคุณจะแสดงที่นี่ ติดตามตั้งแต่เตรียมจนถึงรับสินค้า",
                    )}
                  </p>
                  <button className="primary" onClick={() => go("menu")}>
                    {tr("Explore our menu", "ดูเมนูของเรา")}
                    <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
          {view === "subscriptions" && (
            <>
              <PageHeading
                kicker={tr(
                  "MAKE GOODNESS A HABIT",
                  "เติมความอร่อยให้เป็นกิจวัตร",
                )}
                title={tr(
                  "A little ritual. Every week.",
                  "ความสุขเล็ก ๆ ในทุกสัปดาห์",
                )}
                description={tr(
                  "Your favorites, brewed for your weekly pickup. Save 10%, with no automatic charges.",
                  "เมนูโปรด ต้มสดสำหรับรับทุกสัปดาห์ ประหยัด 10% ไม่มีการหักเงินอัตโนมัติ",
                )}
              />
              <div className="plans-grid">
                {[3, 5].map((n) => (
                  <div
                    className={`plan-card panel ${n === 5 ? "featured" : ""}`}
                    key={n}
                  >
                    <div className="plan-icon">
                      <Sprout size={30} />
                    </div>
                    <span className="eyebrow">
                      {n === 3
                        ? tr("THE LITTLE RITUAL", "ความสุขเล็ก ๆ")
                        : tr("THE HOUSE FAVORITE", "เมนูโปรดประจำบ้าน")}
                    </span>
                    <h2>
                      {n} {tr("bottles of goodness", "ขวดแห่งความอร่อย")}
                    </h2>
                    <p>
                      {tr(
                        "Original Soy Milk · one pickup every week",
                        "น้ำเต้าหู้สูตรดั้งเดิม · รับสัปดาห์ละครั้ง",
                      )}
                    </p>
                    <div className="plan-price">
                      {money(Math.round(n * 35 * 0.9))}
                      <small>
                        {tr("/ weekly pickup", "/ รอบรับรายสัปดาห์")}
                      </small>
                      <del>{money(n * 35)}</del>
                    </div>
                    <ul>
                      <li>
                        <Check size={15} />
                        {tr(
                          "Freshly brewed 350 ml bottles",
                          "ขวด 350 มล. ต้มสดใหม่",
                        )}
                      </li>
                      <li>
                        <Check size={15} />
                        {tr(
                          "10% off your weekly batch",
                          "ส่วนลด 10% ทุกรอบรายสัปดาห์",
                        )}
                      </li>
                      <li>
                        <Check size={15} />
                        {tr(
                          "Pause or cancel your plan anytime",
                          "พักหรือยกเลิกแพ็กเกจได้ทุกเมื่อ",
                        )}
                      </li>
                      <li>
                        <Check size={15} />
                        {tr(
                          "Pay at pickup, no automatic billing",
                          "จ่ายเมื่อรับสินค้า ไม่มีตัดเงินอัตโนมัติ",
                        )}
                      </li>
                    </ul>
                    <button
                      className={n === 5 ? "primary full" : "secondary full"}
                      onClick={() => {
                        setPlanCount(n);
                        setPlanProduct("original");
                        setModal("plan");
                      }}
                    >
                      {tr("Choose this little ritual", "เลือกแพ็กเกจนี้")}
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="section-heading spaced">
                <h2>{tr("Your pickup plans", "แพ็กเกจของคุณ")}</h2>
              </div>
              {!subscriptions.length && (
                <div className="panel empty-state">
                  <RefreshCw size={30} />
                  <h3>
                    {tr(
                      "No weekly ritual just yet",
                      "ยังไม่มีแพ็กเกจรายสัปดาห์",
                    )}
                  </h3>
                  <p>
                    {tr(
                      "Start a plan above. Your preference is saved on this device; future pickups are created when you request them.",
                      "เลือกแพ็กเกจด้านบน ระบบบันทึกความต้องการบนอุปกรณ์นี้ สร้างออเดอร์รอบถัดไปเมื่อคุณกดยืนยัน",
                    )}
                  </p>
                </div>
              )}
              {subscriptions.map((s) => {
                const p = products.find((p) => p.id === s.product)!;
                return (
                  <div className="subscription-row panel" key={s.id}>
                    <img src={p.image} alt="" />
                    <div>
                      <h3>
                        {s.count} × {pname(p)}
                      </h3>
                      <p>
                        {tr("Weekly pickup", "รับรายสัปดาห์")} · {s.window} ·{" "}
                        {s.active
                          ? tr("Active preference", "กำลังใช้งาน")
                          : tr("Paused", "พักชั่วคราว")}
                      </p>
                      <small>
                        {tr(
                          "Each next pickup needs your confirmation. No automatic billing.",
                          "ยืนยันออเดอร์ในแต่ละรอบ ไม่มีการตัดเงินอัตโนมัติ",
                        )}
                      </small>
                    </div>
                    <button
                      className="secondary"
                      onClick={() =>
                        setSubscriptions((old) =>
                          old.map((i) =>
                            i.id === s.id ? { ...i, active: !i.active } : i,
                          ),
                        )
                      }
                    >
                      {s.active ? tr("Pause", "พัก") : tr("Resume", "เริ่มต่อ")}
                    </button>
                    <button
                      disabled={!s.active}
                      className="primary"
                      onClick={() => {
                        setCart([{ id: s.product, qty: s.count }]);
                        setPlan(true);
                        setModal("checkout");
                      }}
                    >
                      {tr("Book next pickup", "จองรับรอบถัดไป")}
                    </button>
                    <button
                      className="icon-button"
                      aria-label={tr("Cancel subscription", "ยกเลิกแพ็กเกจ")}
                      onClick={() => {
                        setSubscriptions((old) =>
                          old.filter((i) => i.id !== s.id),
                        );
                        notify(
                          tr(
                            "Plan cancelled. Existing orders are unchanged.",
                            "ยกเลิกแพ็กเกจแล้ว ออเดอร์เดิมไม่เปลี่ยนแปลง",
                          ),
                        );
                      }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                );
              })}
            </>
          )}
          {view === "pos" && (
            <>
              <PageHeading
                kicker={tr("BEHIND THE COUNTER", "หลังเคาน์เตอร์")}
                title={tr(
                  "A friendly little point of sale.",
                  "จุดขายเล็ก ๆ ที่เป็นมิตร",
                )}
                description={tr(
                  "Choose a product, dial the quantity, then add to bag. Payments are collected at pickup.",
                  "เลือกสินค้า กดจำนวน แล้วเพิ่มลงตะกร้า ชำระเงินเมื่อรับสินค้า",
                )}
              />
              <div className="pos-layout">
                <section className="panel pos-panel">
                  <h3>{tr("1. Choose a little goodness", "1. เลือกสินค้า")}</h3>
                  <div className="pos-products">
                    {products.map((p) => (
                      <button
                        className={selected === p.id ? "selected" : ""}
                        onClick={() => setSelected(p.id)}
                        key={p.id}
                      >
                        <img src={p.image} alt="" />
                        <strong>{pname(p)}</strong>
                        <span>{money(p.price)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="dial-header">
                    <h3>{tr("2. How many?", "2. จำนวนเท่าไร?")}</h3>
                    <span>
                      <Keyboard size={15} />
                      {tr("Large touch targets", "ปุ่มกดขนาดใหญ่")}
                    </span>
                  </div>
                  <output className="dial-display" aria-live="polite">
                    <span>
                      {pname(products.find((p) => p.id === selected)!)}
                    </span>
                    <b>{dial || "0"}</b>
                  </output>
                  <div className="dial-pad">
                    {[
                      "1",
                      "2",
                      "3",
                      "4",
                      "5",
                      "6",
                      "7",
                      "8",
                      "9",
                      "C",
                      "0",
                      "⌫",
                    ].map((key) => (
                      <button
                        aria-label={
                          key === "C"
                            ? tr("Clear quantity", "ล้างจำนวน")
                            : key === "⌫"
                              ? tr("Delete last digit", "ลบตัวเลขท้าย")
                              : key
                        }
                        key={key}
                        onClick={() => {
                          if (navigator.vibrate)
                            navigator.vibrate(
                              config.haptic === "double"
                                ? [20, 30, 40]
                                : config.haptic === "strong"
                                  ? 50
                                  : 15,
                            );
                          setDial((d) =>
                            key === "C"
                              ? ""
                              : key === "⌫"
                                ? d.slice(0, -1)
                                : d.length < 3
                                  ? d === "0"
                                    ? key
                                    : d + key
                                  : d,
                          );
                        }}
                      >
                        {key}
                      </button>
                    ))}
                  </div>
                  <button
                    className="primary full pos-add"
                    disabled={!Number(dial)}
                    onClick={() => {
                      add(selected, Number(dial));
                      setDial("");
                    }}
                  >
                    <Plus size={18} />
                    {tr("Add quantity to bag", "เพิ่มจำนวนลงตะกร้า")}
                  </button>
                </section>
                {orderBox}
              </div>
            </>
          )}
          {view === "kitchen" && (
            <>
              <PageHeading
                kicker={tr(
                  "ONE KITCHEN. MADE WITH CARE.",
                  "หนึ่งครัว ทำด้วยใจ",
                )}
                title={tr(
                  "From our kitchen, with love.",
                  "จากครัวของเรา ด้วยความรัก",
                )}
                description={tr(
                  "Manage this device’s pre-orders. Mark a batch ready to play a gentle pickup chime.",
                  "จัดการออเดอร์บนอุปกรณ์นี้ เมื่อพร้อมรับ ระบบจะเล่นเสียงแจ้งเตือนเบา ๆ",
                )}
              />
              <div className="stats-grid">
                {[
                  [
                    tr("To brew", "รอเตรียม"),
                    orders.filter((o) => o.status === "received").length,
                  ],
                  [
                    tr("In the kitchen", "กำลังเตรียม"),
                    orders.filter((o) => o.status === "preparing").length,
                  ],
                  [
                    tr("Ready for pickup", "พร้อมรับ"),
                    orders.filter((o) => o.status === "ready").length,
                  ],
                  [
                    tr("Picked up", "รับแล้ว"),
                    orders.filter((o) => o.status === "collected").length,
                  ],
                ].map(([text, n]) => (
                  <div className="stat panel" key={text}>
                    <span>{text}</span>
                    <strong>{n}</strong>
                  </div>
                ))}
              </div>
              <div className="kitchen-grid">
                {orders
                  .filter((o) => o.status !== "collected")
                  .map((o) => (
                    <div className="kitchen-card panel" key={o.id}>
                      <div className="order-card-top">
                        <span className="eyebrow">{o.id}</span>
                        <span className="status-badge">
                          {statusLabel(o.status)}
                        </span>
                      </div>
                      <h3>{o.name}</h3>
                      <p>
                        {formatDate(o.date)} · {o.window}
                      </p>
                      <div className="order-lines">
                        {o.items.map((i, n) => (
                          <div key={n}>
                            <strong>
                              {i.qty} × {tr(i.name, i.nameTh)}
                            </strong>
                          </div>
                        ))}
                      </div>
                      <p>
                        <MapPin size={14} />
                        {tr(
                          "Hai Ya pickup · one house only",
                          "รับที่หายยา · จุดรับเดียว",
                        )}
                      </p>
                      <button
                        className="primary full"
                        onClick={() =>
                          updateStatus(
                            o.id,
                            o.status === "received"
                              ? "preparing"
                              : o.status === "preparing"
                                ? "ready"
                                : "collected",
                          )
                        }
                      >
                        {o.status === "received"
                          ? tr("Start preparing", "เริ่มเตรียม")
                          : o.status === "preparing"
                            ? tr(
                                "Mark ready for pickup",
                                "ทำเครื่องหมายพร้อมรับ",
                              )
                            : tr("Confirm pickup", "ยืนยันรับสินค้า")}
                        <Check size={16} />
                      </button>
                    </div>
                  ))}
              </div>
              {!orders.some((o) => o.status !== "collected") && (
                <div className="empty-state panel">
                  <Utensils size={38} />
                  <h2>
                    {tr(
                      "A peaceful moment in the kitchen.",
                      "ช่วงเวลาเงียบสงบในครัว",
                    )}
                  </h2>
                  <p>
                    {tr(
                      "New pre-orders made on this device will appear here.",
                      "ออเดอร์ใหม่ที่สร้างบนอุปกรณ์นี้จะแสดงที่นี่",
                    )}
                  </p>
                </div>
              )}
            </>
          )}
          {view === "admin" && (
            <>
              <PageHeading
                kicker={tr("THE LITTLE DETAILS", "ใส่ใจในรายละเอียด")}
                title={tr("Make the house your own.", "จัดการบ้านของเรา")}
                description={tr(
                  "Your local operations workspace. Settings are saved on this device.",
                  "พื้นที่จัดการร้านบนอุปกรณ์นี้ การตั้งค่าถูกบันทึกในเบราว์เซอร์",
                )}
              />
              <div className="notice">
                <ShieldCheck size={18} />
                {tr(
                  "Local workspace — no authentication, shared server, online payments or automatic billing is connected. Use sample/customer data only with consent.",
                  "พื้นที่ทำงานภายในอุปกรณ์ ยังไม่เชื่อมระบบเข้าสู่ระบบ เซิร์ฟเวอร์ร่วม หรือการชำระเงินออนไลน์ โปรดใช้ข้อมูลลูกค้าเมื่อได้รับความยินยอม",
                )}
              </div>
              <div className="category-tabs admin-tabs">
                {[
                  ["settings", tr("House settings", "ตั้งค่าร้าน")],
                  ["inventory", tr("Products & stock", "สินค้าและสต็อก")],
                  ["content", tr("Content studio", "จัดการเนื้อหา")],
                  ["accessibility", tr("Accessibility", "การเข้าถึง")],
                  ["diagnostics", tr("Diagnostics", "ตรวจสอบระบบ")],
                ].map(([id, text]) => (
                  <button
                    key={id}
                    className={adminTab === id ? "active" : ""}
                    onClick={() => setAdminTab(id)}
                  >
                    {text}
                  </button>
                ))}
              </div>
              {adminTab === "settings" && (
                <form
                  className="panel settings-panel"
                  onSubmit={(e) => {
                    e.preventDefault();
                    notify(
                      tr(
                        "House settings saved on this device.",
                        "บันทึกการตั้งค่าบนอุปกรณ์นี้แล้ว",
                      ),
                    );
                  }}
                >
                  <h3>
                    <Store size={20} />
                    {tr(
                      "One kitchen. One pickup spot.",
                      "หนึ่งครัว หนึ่งจุดรับสินค้า",
                    )}
                  </h3>
                  <p>
                    {tr(
                      "Keep your operation simple. Pickup only, open daily 06:30–15:00.",
                      "เรียบง่ายด้วยการรับที่ร้านเท่านั้น เปิดทุกวัน 06:30–15:00",
                    )}
                  </p>
                  <div className="form-grid">
                    <label>
                      {tr(
                        "Pickup address · English",
                        "ที่อยู่รับสินค้า · อังกฤษ",
                      )}
                      <input
                        required
                        value={config.address}
                        onChange={(e) =>
                          setConfig({ ...config, address: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      {tr("Pickup address · Thai", "ที่อยู่รับสินค้า · ไทย")}
                      <input
                        required
                        value={config.addressTh}
                        onChange={(e) =>
                          setConfig({ ...config, addressTh: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      {tr(
                        "Orders per pickup window",
                        "จำนวนออเดอร์ต่อช่วงเวลา",
                      )}
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={config.capacity}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            capacity: Math.min(
                              100,
                              Math.max(1, Number(e.target.value)),
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      {tr("POS haptic feedback", "การสั่นของแป้นจุดขาย")}
                      <select
                        value={config.haptic}
                        onChange={(e) =>
                          setConfig({ ...config, haptic: e.target.value })
                        }
                      >
                        <option value="soft">
                          {tr("Soft tap · 15 ms", "แตะเบา · 15 มิลลิวินาที")}
                        </option>
                        <option value="strong">
                          {tr(
                            "Strong click · 50 ms",
                            "แตะหนัก · 50 มิลลิวินาที",
                          )}
                        </option>
                        <option value="double">
                          {tr("Double pulse", "สั่นสองครั้ง")}
                        </option>
                      </select>
                    </label>
                  </div>
                  <Toggle
                    label={tr(
                      "Gentle order & pickup sounds",
                      "เสียงแจ้งเตือนออเดอร์และพร้อมรับ",
                    )}
                    note={tr(
                      "A soft chime, with a visual status update too.",
                      "เสียงเบา ๆ พร้อมอัปเดตสถานะด้วยภาพ",
                    )}
                    checked={config.audio}
                    change={() =>
                      setConfig({ ...config, audio: !config.audio })
                    }
                  />
                  <div className="form-footer">
                    <button
                      className="secondary"
                      type="button"
                      onClick={() => {
                        chime(true);
                        if (navigator.vibrate)
                          navigator.vibrate(
                            config.haptic === "strong"
                              ? 50
                              : config.haptic === "double"
                                ? [20, 30, 40]
                                : 15,
                          );
                        notify(
                          tr(
                            "Feedback tested. Vibration requires device support.",
                            "ทดสอบแล้ว การสั่นขึ้นอยู่กับอุปกรณ์",
                          ),
                        );
                      }}
                    >
                      <Volume2 size={16} />
                      {tr("Test feedback", "ทดสอบเสียงและสั่น")}
                    </button>
                    <button className="primary" type="submit">
                      <Check size={16} />
                      {tr("Save house settings", "บันทึกการตั้งค่า")}
                    </button>
                  </div>
                </form>
              )}
              {adminTab === "inventory" && (
                <section className="panel inventory-panel">
                  <h3>{tr("The day’s batch", "สินค้าของวันนี้")}</h3>
                  <p>
                    {tr(
                      "Update remaining stock and prices. Completed local orders reduce stock automatically.",
                      "ปรับสต็อกและราคา ออเดอร์ที่ยืนยันบนอุปกรณ์นี้จะหักสต็อกอัตโนมัติ",
                    )}
                  </p>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>{tr("Product", "สินค้า")}</th>
                          <th>{tr("Price · THB", "ราคา · บาท")}</th>
                          <th>{tr("Available", "คงเหลือ")}</th>
                          <th>{tr("Photo", "รูปภาพ")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <div className="table-product">
                                <img src={p.image} alt="" />
                                <strong>{pname(p)}</strong>
                              </div>
                            </td>
                            <td>
                              <input
                                aria-label={tr(`${p.en} price`, `ราคา${p.th}`)}
                                type="number"
                                min="1"
                                max="9999"
                                value={p.price}
                                onChange={(e) =>
                                  setProducts((old) =>
                                    old.map((i) =>
                                      i.id === p.id
                                        ? {
                                            ...i,
                                            price: Math.max(
                                              1,
                                              Math.min(
                                                9999,
                                                Number(e.target.value),
                                              ),
                                            ),
                                          }
                                        : i,
                                    ),
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                aria-label={tr(`${p.en} stock`, `สต็อก${p.th}`)}
                                type="number"
                                min="0"
                                max="999"
                                value={p.stock}
                                onChange={(e) =>
                                  setProducts((old) =>
                                    old.map((i) =>
                                      i.id === p.id
                                        ? {
                                            ...i,
                                            stock: Math.max(
                                              0,
                                              Math.min(
                                                999,
                                                Number(e.target.value),
                                              ),
                                            ),
                                          }
                                        : i,
                                    ),
                                  )
                                }
                              />
                            </td>
                            <td>
                              <label className="upload-button">
                                {tr("Upload", "อัปโหลด")}
                                <input
                                  type="file"
                                  accept="image/*"
                                  aria-label={tr(
                                    `Upload photo for ${p.en}`,
                                    `อัปโหลดรูป${p.th}`,
                                  )}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    if (file.size > 600000) {
                                      notify(
                                        tr(
                                          "Please choose an image under 600 KB for device storage.",
                                          "โปรดเลือกภาพขนาดต่ำกว่า 600 KB",
                                        ),
                                      );
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onload = () =>
                                      setProducts((old) =>
                                        old.map((i) =>
                                          i.id === p.id
                                            ? {
                                                ...i,
                                                image: String(reader.result),
                                              }
                                            : i,
                                        ),
                                      );
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="save-note">
                    <CheckCheck size={15} />
                    {tr(
                      "Changes are saved automatically on this device.",
                      "บันทึกการเปลี่ยนแปลงบนอุปกรณ์นี้อัตโนมัติ",
                    )}
                  </p>
                </section>
              )}
              {adminTab === "content" && (
                <form
                  className="panel settings-panel"
                  onSubmit={(e) => {
                    e.preventDefault();
                    notify(
                      tr(
                        "Your story has been saved.",
                        "บันทึกเรื่องราวของคุณแล้ว",
                      ),
                    );
                  }}
                >
                  <h3>
                    <Leaf size={19} />
                    {tr("Tell the house story", "เล่าเรื่องราวของบ้านเรา")}
                  </h3>
                  <div className="form-grid">
                    <label>
                      {tr("Hero heading · English", "หัวเรื่อง · อังกฤษ")}
                      <textarea
                        rows={3}
                        required
                        value={config.heading}
                        onChange={(e) =>
                          setConfig({ ...config, heading: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      {tr("Hero heading · Thai", "หัวเรื่อง · ไทย")}
                      <textarea
                        rows={3}
                        required
                        value={config.headingTh}
                        onChange={(e) =>
                          setConfig({ ...config, headingTh: e.target.value })
                        }
                      />
                    </label>
                    <label className="span-two">
                      {tr("Our story · English", "เรื่องราวของเรา · อังกฤษ")}
                      <textarea
                        rows={4}
                        required
                        value={config.note}
                        onChange={(e) =>
                          setConfig({ ...config, note: e.target.value })
                        }
                      />
                    </label>
                  </div>
                  <div className="form-footer">
                    <button className="primary" type="submit">
                      {tr("Save story", "บันทึกเรื่องราว")}
                      <Check size={15} />
                    </button>
                  </div>
                </form>
              )}
              {adminTab === "accessibility" && (
                <section className="panel settings-panel">
                  <h3>
                    <ScanEye size={21} />
                    {tr(
                      "Visual accessibility inspector",
                      "ตัวตรวจสอบการเข้าถึงด้วยภาพ",
                    )}
                  </h3>
                  <p>
                    {tr(
                      "Run an axe-core audit of the current main content against WCAG A/AA rules. Automated checks are not a full accessibility certification.",
                      "ตรวจสอบเนื้อหาหลักด้วย axe-core ตามกฎ WCAG A/AA การตรวจอัตโนมัติไม่ใช่การรับรองการเข้าถึงทั้งหมด",
                    )}
                  </p>
                  <div className="inspector-preview">
                    <div className="contrast-swatch">Aa</div>
                    <div>
                      <strong>
                        {tr("Clear by nature.", "ชัดเจนอย่างเป็นธรรมชาติ")}
                      </strong>
                      <p>
                        {tr(
                          "Visible focus. Readable text. Room to tap.",
                          "เห็นจุดโฟกัส ตัวอักษรอ่านง่าย ปุ่มกดสะดวก",
                        )}
                      </p>
                    </div>
                    <button
                      className="primary"
                      onClick={() => void runAudit()}
                      disabled={auditing}
                    >
                      <ScanEye size={16} />
                      {auditing
                        ? tr("Inspecting…", "กำลังตรวจสอบ…")
                        : tr("Run live audit", "ตรวจสอบตอนนี้")}
                    </button>
                  </div>
                  {audit !== null && (
                    <div
                      className={`audit-results ${audit.length ? "has-issues" : ""}`}
                      role="status"
                    >
                      <h4>
                        {audit.length
                          ? tr(
                              `${audit.length} rule groups need review`,
                              `มีกฎ ${audit.length} กลุ่มที่ต้องตรวจสอบ`,
                            )
                          : tr(
                              "No automated A/AA violations detected in this view.",
                              "ไม่พบปัญหา A/AA จากการตรวจอัตโนมัติในหน้านี้",
                            )}
                      </h4>
                      {audit.map((a, i) => (
                        <p key={i}>
                          {a.title} · {a.count} {tr("elements", "องค์ประกอบ")} ·{" "}
                          {a.impact}
                        </p>
                      ))}
                    </div>
                  )}
                  <Toggle
                    label={tr(
                      "Outline interactive elements",
                      "แสดงกรอบองค์ประกอบที่โต้ตอบได้",
                    )}
                    note={tr(
                      "Visually inspect buttons, links and form controls.",
                      "ตรวจสอบปุ่ม ลิงก์ และช่องกรอกข้อมูลด้วยภาพ",
                    )}
                    checked={outline}
                    change={() => setOutline(!outline)}
                  />
                  <button
                    className="secondary"
                    onClick={() => setModal("a11y")}
                  >
                    <Accessibility size={16} />
                    {tr(
                      "Comfort & accessibility preferences",
                      "ตั้งค่าความสะดวกและการเข้าถึง",
                    )}
                  </button>
                </section>
              )}
              {adminTab === "diagnostics" && (
                <section className="panel settings-panel">
                  <h3>
                    <ShieldCheck size={21} />
                    {tr("An honest little status check", "ตรวจสอบสถานะระบบ")}
                  </h3>
                  <div className="diagnostic-list">
                    {[
                      [
                        tr("Network", "เครือข่าย"),
                        online
                          ? tr("Online", "ออนไลน์")
                          : tr("Offline", "ออฟไลน์"),
                      ],
                      [
                        tr("Service worker", "เซอร์วิสเวิร์กเกอร์"),
                        cacheReady
                          ? tr(
                              "Registered · same-origin cache",
                              "ลงทะเบียนแล้ว · แคชภายในเว็บไซต์",
                            )
                          : tr("Not active", "ยังไม่ทำงาน"),
                      ],
                      [
                        tr("Local orders", "ออเดอร์ในอุปกรณ์"),
                        String(orders.length),
                      ],
                      [
                        tr("Storage", "ที่เก็บข้อมูล"),
                        tr(
                          "Browser localStorage · this device only",
                          "localStorage · เฉพาะอุปกรณ์นี้",
                        ),
                      ],
                      [
                        tr("Payment processing", "ระบบชำระเงิน"),
                        tr(
                          "Not connected · pay at pickup",
                          "ยังไม่เชื่อมต่อ · จ่ายเมื่อรับสินค้า",
                        ),
                      ],
                      [
                        tr(
                          "Authentication & backend",
                          "การเข้าสู่ระบบและเซิร์ฟเวอร์",
                        ),
                        tr("Not connected", "ยังไม่เชื่อมต่อ"),
                      ],
                    ].map(([text, value]) => (
                      <div key={text}>
                        <span>{text}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                  <button className="secondary" onClick={exportOrders}>
                    <Download size={16} />
                    {tr("Back up orders as CSV", "สำรองออเดอร์เป็น CSV")}
                  </button>
                </section>
              )}
            </>
          )}
          <footer className="main-footer">
            <span>
              © {new Date().getFullYear()} Wanchai Soy Milk House <i>·</i>{" "}
              {tr(
                "A little goodness from Chiang Mai.",
                "ความอร่อยเล็ก ๆ จากเชียงใหม่",
              )}
            </span>
            <div>
              <button onClick={() => setModal("help")}>
                {tr("A little help?", "ให้เราช่วยไหม?")}
              </button>
              <span>·</span>
              <button onClick={() => setModal("location")}>
                {tr("Find our house", "หาบ้านของเรา")}
                <ArrowRight size={12} />
              </button>
            </div>
          </footer>
        </main>
      </div>
      {view === "menu" && totalCount > 0 && !modal && (
        <button
          className="mobile-bag-bar"
          onClick={() =>
            document
              .getElementById("your-bag")
              ?.scrollIntoView({ behavior: motion ? "instant" : "smooth" })
          }
        >
          <span>
            <ShoppingBag size={17} />
            {tr("View your little bag", "ดูตะกร้าของคุณ")} · {totalCount}
          </span>
          <b>
            {money(total)} <ArrowRight size={15} />
          </b>
        </button>
      )}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={16} />
          </span>
          {toast}
          <button
            aria-label={tr("Dismiss notification", "ปิดการแจ้งเตือน")}
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
      {detail && (
        <Modal
          title={pname(detail)}
          close={() => setDetail(null)}
          closeLabel={tr("Close details", "ปิดรายละเอียด")}
        >
          <img
            className="detail-image"
            src={detail.image}
            alt={pname(detail)}
          />
          <div className="modal-body">
            <p>{tr(detail.desc, detail.descTh)}</p>
            <div className="detail-pills">
              <span>
                <Leaf size={14} />
                {tr("Plant-based", "จากพืช")}
              </span>
              <span>
                {detail.category === "milk"
                  ? "350 ml"
                  : tr("Made fresh", "ทำสดใหม่")}
              </span>
              <span>
                {detail.stock} {tr("available", "คงเหลือ")}
              </span>
            </div>
            <div className="notice">
              <HelpCircle size={17} />
              {tr(
                "Contains soy. Sesame and wheat are handled in the same kitchen. Refrigerate after pickup and consume within 24 hours.",
                "มีถั่วเหลือง ครัวใช้ทั้งงาและข้าวสาลี ควรแช่เย็นหลังรับและบริโภคภายใน 24 ชั่วโมง",
              )}
            </div>
            <button
              className="primary full"
              disabled={!detail.stock}
              onClick={() => {
                add(detail.id);
                setDetail(null);
              }}
            >
              <Plus size={17} />
              {tr("Add to your little bag", "เพิ่มในตะกร้า")} ·{" "}
              {money(detail.price)}
            </button>
          </div>
        </Modal>
      )}
      {modal === "checkout" && (
        <Modal
          title={tr("Your little order, all together.", "ตรวจสอบออเดอร์ของคุณ")}
          close={() => setModal(null)}
          closeLabel={tr("Close summary", "ปิดสรุปออเดอร์")}
        >
          <form onSubmit={placeOrder}>
            <div className="modal-body">
              <p>
                {tr(
                  "A quick check before we make your morning.",
                  "ตรวจสอบอีกนิด ก่อนเริ่มเช้าวันดี ๆ ของคุณ",
                )}
                {plan && (
                  <span className="plan-label">
                    {tr(
                      " Weekly pickup plan · 10% savings",
                      " แพ็กเกจรายสัปดาห์ · ลด 10%",
                    )}
                  </span>
                )}
              </p>
              <div className="summary-cart">{cartContents}</div>
              <div className="form-grid">
                <label>
                  {tr("Your name", "ชื่อของคุณ")}
                  <input
                    required
                    autoComplete="name"
                    minLength={2}
                    maxLength={80}
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                    placeholder={tr(
                      "What should we call you?",
                      "ชื่อสำหรับรับสินค้า",
                    )}
                  />
                </label>
                <label>
                  {tr("Phone number", "เบอร์โทรศัพท์")}
                  <input
                    required
                    type="tel"
                    autoComplete="tel"
                    maxLength={18}
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                    placeholder="08X XXX XXXX"
                  />
                </label>
              </div>
              <div className="summary-location">
                <MapPin size={21} />
                <div>
                  <strong>
                    {tr("One house. One pickup spot.", "บ้านเดียว จุดรับเดียว")}
                  </strong>
                  <p>{tr(config.address, config.addressTh)}</p>
                </div>
              </div>
              {pickupFields}
              <div className="summary-money">
                <span>{tr("Subtotal", "ยอดรวมย่อย")}</span>
                <b>{money(subtotal)}</b>
                {plan && (
                  <>
                    <span>
                      {tr(
                        "Weekly plan savings · 10%",
                        "ส่วนลดรายสัปดาห์ · 10%",
                      )}
                    </span>
                    <b>−{money(subtotal - total)}</b>
                  </>
                )}
                <strong>{tr("Pay at pickup", "ชำระเมื่อรับสินค้า")}</strong>
                <strong>{money(total)}</strong>
              </div>
              <div className="notice">
                <ShieldCheck size={17} />
                {tr(
                  "Saved on this device only. No online charge or notification to a remote kitchen. Please confirm your reservation with the house before traveling.",
                  "บันทึกบนอุปกรณ์นี้เท่านั้น ไม่มีตัดเงินออนไลน์หรือแจ้งครัวระยะไกล โปรดยืนยันการจองกับร้านก่อนเดินทาง",
                )}
              </div>
              {error && (
                <p className="error-message" role="alert">
                  {error}
                </p>
              )}
              <p className="privacy-note">
                {tr(
                  "Your name and phone are stored in this browser for pickup identification. No data is sent to an external server.",
                  "ชื่อและเบอร์โทรจะเก็บในเบราว์เซอร์เพื่อใช้ระบุผู้รับ ไม่มีการส่งข้อมูลไปเซิร์ฟเวอร์ภายนอก",
                )}
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="secondary"
                onClick={() => setModal(null)}
              >
                <ArrowLeft size={15} />
                {tr("Back to bag", "กลับไปตะกร้า")}
              </button>
              <button
                className="primary"
                type="submit"
                disabled={occupancy >= config.capacity || !cart.length}
              >
                {tr("Confirm pre-order", "ยืนยันออเดอร์")}
                <Check size={16} />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {modal === "plan" && (
        <Modal
          title={tr("Make goodness a weekly thing.", "เติมความอร่อยทุกสัปดาห์")}
          close={() => setModal(null)}
          closeLabel={tr("Close plans", "ปิดแพ็กเกจ")}
        >
          <div className="modal-body">
            <p>
              {tr(
                "One fresh batch, one pickup each week. Choose your favorite and save 10%.",
                "รับสินค้าสดใหม่สัปดาห์ละครั้ง เลือกเมนูโปรดและรับส่วนลด 10%",
              )}
            </p>
            <label className="form-label">
              {tr("Your weekly favorite", "เมนูประจำสัปดาห์")}
              <select
                value={planProduct}
                onChange={(e) => setPlanProduct(e.target.value)}
              >
                {products
                  .filter((p) => p.category === "milk")
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {pname(p)} · {money(p.price)}
                    </option>
                  ))}
              </select>
            </label>
            <div className="plan-choices">
              {[3, 5].map((n) => (
                <button
                  className={n === planCount ? "selected" : ""}
                  onClick={() => setPlanCount(n)}
                  key={n}
                >
                  <Sprout size={24} />
                  <strong>
                    {n} {tr("bottles", "ขวด")}
                  </strong>
                  <span>
                    {money(
                      Math.round(
                        (products.find((p) => p.id === planProduct)?.price ||
                          35) *
                          n *
                          0.9,
                      ),
                    )}
                  </span>
                  <small>
                    {tr("per weekly pickup", "ต่อรอบรับรายสัปดาห์")}
                  </small>
                  {n === planCount && <Check size={15} />}
                </button>
              ))}
            </div>
            <div className="notice">
              <RefreshCw size={18} />
              {tr(
                "Your first batch will replace the current bag. Your plan is saved on this device. Confirm each future pickup in Subscriptions; no auto-orders or automatic charges.",
                "แพ็กเกจแรกจะแทนที่ตะกร้าเดิม แพ็กเกจบันทึกบนอุปกรณ์นี้ ยืนยันรอบต่อไปในหน้าแพ็กเกจ ไม่มีออเดอร์หรือตัดเงินอัตโนมัติ",
              )}
            </div>
            <button className="primary full" onClick={startPlan}>
              {tr("Choose pickup & review", "เลือกเวลาและตรวจสอบ")}
              <ArrowRight size={16} />
            </button>
          </div>
        </Modal>
      )}
      {modal === "a11y" && (
        <Modal
          title={tr(
            "Comfort looks different for everyone.",
            "ความสะดวกที่เหมาะกับคุณ",
          )}
          close={() => setModal(null)}
          closeLabel={tr(
            "Close accessibility preferences",
            "ปิดตั้งค่าการเข้าถึง",
          )}
        >
          <div className="modal-body">
            <p>
              {tr(
                "A few little ways to make the house feel right for you. Your choices stay on this device.",
                "ปรับให้บ้านนี้เหมาะกับคุณ การตั้งค่าจะถูกบันทึกบนอุปกรณ์นี้",
              )}
            </p>
            <Toggle
              label={tr("High contrast", "คอนทราสต์สูง")}
              note={tr(
                "Stronger colors and clearer boundaries.",
                "สีชัดและขอบเขตที่อ่านง่ายขึ้น",
              )}
              checked={contrast}
              change={() => setContrast(!contrast)}
            />
            <Toggle
              label={tr("Larger text", "ตัวอักษรขนาดใหญ่")}
              note={tr(
                "A little more room to read.",
                "อ่านข้อความได้สบายตาขึ้น",
              )}
              checked={large}
              change={() => setLarge(!large)}
            />
            <Toggle
              label={tr("Reduce motion", "ลดการเคลื่อนไหว")}
              note={tr(
                "Keep things calm and still.",
                "ลดภาพเคลื่อนไหวและการเลื่อนแบบนุ่ม",
              )}
              checked={motion}
              change={() => setMotion(!motion)}
            />
            <Toggle
              label={tr("Gentle audio feedback", "เสียงแจ้งเตือนเบา ๆ")}
              note={tr(
                "Soft chimes for placed and ready orders.",
                "เสียงเบาเมื่อสั่งสำเร็จและพร้อมรับ",
              )}
              checked={config.audio}
              change={() => setConfig({ ...config, audio: !config.audio })}
            />
            <Toggle
              label={tr("Dark theme", "ธีมมืด")}
              note={tr(
                "A softer view for darker rooms.",
                "สบายตาเมื่อใช้งานในที่มืด",
              )}
              checked={theme === "dark"}
              change={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
            <div className="notice">
              <Keyboard size={19} />
              {tr(
                "Use Tab to move, Enter to choose, and Esc to close dialogs. Focus stays inside open dialogs. Audio is never the only status signal.",
                "ใช้ Tab เพื่อเลื่อนโฟกัส Enter เพื่อเลือก และ Esc เพื่อปิดหน้าต่าง มีการแจ้งสถานะด้วยภาพเสมอ",
              )}
            </div>
            <button className="primary full" onClick={() => setModal(null)}>
              {tr("Feeling good", "เรียบร้อยแล้ว")}
              <Check size={16} />
            </button>
          </div>
        </Modal>
      )}
      {modal === "location" && (
        <Modal
          title={tr("Find our little house.", "แวะมาที่บ้านของเรา")}
          close={() => setModal(null)}
          closeLabel={tr("Close location", "ปิดตำแหน่ง")}
        >
          <div className="modal-body">
            <div className="location-illustration">
              <Store size={70} strokeWidth={1} />
              <span>HAI YA · CHIANG MAI</span>
            </div>
            <h3>{tr("Wanchai Soy Milk House", "บ้านน้ำเต้าหู้วันชัย")}</h3>
            <p>{tr(config.address, config.addressTh)}</p>
            <p>
              <Clock3 size={16} />
              {tr(
                "Open daily · 06:30–15:00 · Pickup only",
                "เปิดทุกวัน · 06:30–15:00 · รับที่ร้านเท่านั้น",
              )}
            </p>
            <div className="notice">
              <MapPin size={18} />
              {tr(
                "One central kitchen, one pickup location. Bring your order number and come during your chosen window.",
                "หนึ่งครัวกลาง หนึ่งจุดรับสินค้า เตรียมเลขออเดอร์และมารับในช่วงเวลาที่เลือก",
              )}
            </div>
            <a
              className="primary full"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.addressTh)}`}
              target="_blank"
              rel="noreferrer"
            >
              {tr("Open in Google Maps", "เปิดใน Google Maps")}
              <ArrowRight size={16} />
            </a>
          </div>
        </Modal>
      )}
      {modal === "help" && (
        <Modal
          title={tr("A little help, from the house.", "ให้บ้านเราช่วยคุณ")}
          close={() => setModal(null)}
          closeLabel={tr("Close help", "ปิดความช่วยเหลือ")}
        >
          <div className="modal-body faq">
            {[
              [
                tr("How does pre-ordering work?", "สั่งล่วงหน้าอย่างไร?"),
                tr(
                  "Choose your favorites, select a pickup day and time, then review your order. Your reservation is stored on this device. Please confirm it with the house before visiting.",
                  "เลือกเมนูโปรด วันและเวลารับ แล้วตรวจสอบออเดอร์ การจองถูกบันทึกบนอุปกรณ์นี้ โปรดยืนยันกับร้านก่อนเดินทาง",
                ),
              ],
              [
                tr("Can you deliver?", "มีบริการจัดส่งไหม?"),
                tr(
                  "We keep it simple: one kitchen and one pickup spot in Hai Ya. No delivery is offered.",
                  "เราเน้นความเรียบง่าย มีครัวเดียวและจุดรับเดียวที่หายยา ไม่มีบริการจัดส่ง",
                ),
              ],
              [
                tr(
                  "How do weekly plans work?",
                  "แพ็กเกจรายสัปดาห์ทำงานอย่างไร?",
                ),
                tr(
                  "Choose 3 or 5 bottles for one weekly pickup and save 10%. Pay at pickup. Request each future batch from your Subscriptions page; you can pause or cancel anytime.",
                  "เลือก 3 หรือ 5 ขวดเพื่อรับสัปดาห์ละครั้ง ลด 10% จ่ายเมื่อรับสินค้า จองแต่ละรอบจากหน้าแพ็กเกจ พักหรือยกเลิกได้ทุกเมื่อ",
                ),
              ],
              [
                tr(
                  "How should I store my soy milk?",
                  "ควรเก็บน้ำเต้าหู้อย่างไร?",
                ),
                tr(
                  "Refrigerate promptly and enjoy within 24 hours. Our small batches have no preservatives. Our kitchen handles soy, sesame and wheat.",
                  "แช่เย็นทันทีและบริโภคภายใน 24 ชั่วโมง เราไม่ใส่สารกันเสีย ครัวมีถั่วเหลือง งา และข้าวสาลี",
                ),
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <Plus size={16} />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
function Toggle({
  label,
  note,
  checked,
  change,
}: {
  label: string;
  note: string;
  checked: boolean;
  change: () => void;
}) {
  return (
    <div className="toggle-row">
      <div>
        <strong>{label}</strong>
        <p>{note}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`toggle ${checked ? "on" : ""}`}
        onClick={change}
      >
        <span />
      </button>
    </div>
  );
}
function PageHeading({
  kicker,
  title,
  description,
}: {
  kicker: string;
  title: string;
  description: string;
}) {
  return (
    <div className="page-heading">
      <div className="section-kicker">{kicker}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

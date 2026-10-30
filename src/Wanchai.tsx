import { useEffect, useState, useMemo, type FormEvent } from "react";
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
  CheckCircle2,
  Receipt,
  RotateCcw,
  History,
  ArrowUp,
  ArrowDown,
  Edit2,
  PlusCircle,
  Coins,
  Sparkles,
  FileSpreadsheet,
  UploadCloud,
  AlertTriangle,
  Send,
  Mail,
  Upload,
  Camera,
} from "lucide-react";
import {
  useSaved,
  initialProducts,
  initialOrders,
  defaultConfig,
  dates,
  windows,
  chime,
  triggerHaptic,
  exportOrdersToCSV,
  isLowStock,
  LOW_STOCK_THRESHOLD,
  sendLowStockEmailAlert,
  getAdminEmailLogs,
  type Product,
  type CartItem,
  type Order,
  type Subscription,
  type AdminEmailNotification,
} from "./lib/store";
import Modal from "./components/Modal";
import { RichTextEditor } from "./components/RichTextEditor";
import { useLanguage, LanguageToggle } from "./context/LanguageContext";
import { useToast, RealtimeOrderStatusNotifier } from "./context/ToastContext";
import AccessibilityMenu from "./components/AccessibilityMenu";
import BackToTop from "./components/BackToTop";
import AdminRevenueChart from "./components/AdminRevenueChart";
import { CartDrawer } from "./components/CartDrawer";
import QRCodeDisplay from "./components/QRCodeDisplay";
import InventoryImportModal from "./components/InventoryImportModal";
import AdminDrawer from "./components/AdminDrawer";
import CustomerSpendingChart from "./components/CustomerSpendingChart";
import ReorderConfirmModal from "./components/ReorderConfirmModal";
import OrderTrackingProgress from "./components/OrderTrackingProgress";
import OrderConfirmationModal from "./components/OrderConfirmationModal";

type View =
  | "menu"
  | "orders"
  | "history"
  | "subscriptions"
  | "pos"
  | "kitchen"
  | "admin";
type AuditResult = { title: string; count: number; impact: string };

export default function Wanchai() {
  const { lang, tr } = useLanguage();
  const { addToast } = useToast();
  const [theme, setTheme] = useSaved("theme", "light");
  const [contrast, setContrast] = useSaved("contrast", false);
  const [large, setLarge] = useSaved("large", false);
  const [motion, setMotion] = useSaved("motion", false);
  const [orderType, setOrderType] = useSaved<"walk-in" | "pickup">("orderType", "walk-in");
  const [adminSearch, setAdminSearch] = useState("");
  const [posSearch, setPosSearch] = useState("");
  const [config, setConfig] = useSaved("config", defaultConfig);
  const [products, setProducts] = useSaved<Product[]>(
    "products-v3",
    initialProducts,
  );
  const [cart, setCart] = useSaved<CartItem[]>("cart", []);
  const [orders, setOrders] = useSaved<Order[]>("orders", initialOrders);
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
    "checkout" | "plan" | "a11y" | "help" | "location" | "receipt" | null
  >(null);
  const [detail, setDetail] = useState<Product | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useSaved("customer", { name: "", phone: "" });
  const [historyFilter, setHistoryFilter] = useState<
    "all" | "collected" | "active"
  >("all");
  const [historySearch, setHistorySearch] = useState("");
  const [error, setError] = useState("");
  const [plan, setPlan] = useState(false);
  const [planCount, setPlanCount] = useState(3);
  const [planProduct, setPlanProduct] = useState("original");
  const [online, setOnline] = useState(navigator.onLine);
  const [cacheReady, setCacheReady] = useState(false);
  const [dial, setDial] = useState("");
  const [selected, setSelected] = useState("original");
  const [adminTab, setAdminTab] = useState("settings");
  const [adminCategory, setAdminCategory] = useState<
    "all" | "milk" | "freshmilk" | "ginger" | "treat"
  >("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    category: "milk",
    en: "",
    th: "",
    desc: "",
    descTh: "",
    price: 15,
    stock: 50,
    image: "/images/hot_soy_milk_bowl_1792747451795.jpg",
  });
  const [posCategory, setPosCategory] = useState<
    "all" | "milk" | "freshmilk" | "ginger" | "treat"
  >("all");
  const [posMode, setPosMode] = useState<"dial" | "cash">("dial");
  const [cashTendered, setCashTendered] = useState("");
  const [audit, setAudit] = useState<AuditResult[] | null>(null);
  const [auditing, setAuditing] = useState(false);
  const [outline, setOutline] = useState(false);
  const [orderFilter, setOrderFilter] = useState("all");
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isAdminDrawerOpen, setIsAdminDrawerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [specialRequests, setSpecialRequests] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkStockVal, setBulkStockVal] = useState<string>("");
  const [emailLogs, setEmailLogs] = useState<AdminEmailNotification[]>(getAdminEmailLogs());
  const [reorderTargetOrder, setReorderTargetOrder] = useState<Order | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const moveProduct = (id: string, direction: "up" | "down") => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, item);
      return copy;
    });
    notify(tr("Product order updated.", "ปรับลำดับสินค้าแล้ว"));
  };

  const renderRich = (content: string) => {
    if (!content) return null;
    if (/<[a-z][\s\S]*>/i.test(content)) {
      return <span dangerouslySetInnerHTML={{ __html: content }} />;
    }
    return (
      <span>
        {content.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            {i < content.split("\n").length - 1 && <br />}
          </span>
        ))}
      </span>
    );
  };
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
    history: tr("Previous orders", "ประวัติคำสั่งซื้อ"),
    subscriptions: tr("Subscriptions", "แพ็กเกจรายสัปดาห์"),
    pos: tr("Point of sale", "จุดขาย"),
    kitchen: tr("Kitchen orders", "ออเดอร์ในครัว"),
    admin: tr("Settings & admin", "ตั้งค่าและจัดการ"),
  };

  const notify = (
    text: string,
    type: "success" | "info" | "warning" = "info",
  ) => {
    addToast({ type, message: text });
  };

  const notifySuccess = (
    title: string,
    message: string,
    action?: { label: string; onClick: () => void },
  ) => {
    addToast({
      type: "success",
      title,
      message,
      action,
      duration: 5000,
    });
  };

  const reorder = (o: Order) => {
    const newItems: CartItem[] = [];
    o.items.forEach((item) => {
      const prod = products.find(
        (p) => p.en === item.name || p.th === item.nameTh,
      );
      if (prod && prod.stock > 0) {
        newItems.push({ id: prod.id, qty: item.qty });
      }
    });
    if (newItems.length === 0) {
      addToast({
        type: "warning",
        title: tr("Items unavailable", "สินค้าไม่พร้อมจำหน่าย"),
        message: tr(
          "Items from this previous order are currently out of stock.",
          "สินค้าจากออเดอร์ก่อนหน้านี้หมดชั่วคราว",
        ),
      });
      return;
    }
    setPlan(o.plan);
    setCart(newItems);
    if (config.audio) chime(true);
    notifySuccess(
      tr("Added to your bag!", "เพิ่มลงในตะกร้าแล้ว!"),
      tr(
        `Loaded ${newItems.length} item(s) from order #${o.id}.`,
        `เพิ่มสินค้า ${newItems.length} รายการจากออเดอร์ #${o.id} แล้ว`,
      ),
      {
        label: tr("Review bag", "ตรวจสอบตะกร้า"),
        onClick: () => {
          const el = document.getElementById("your-bag");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          } else {
            openCheckout();
          }
        },
      },
    );
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.contrast = String(contrast);
    document.documentElement.dataset.large = String(large);
    document.documentElement.dataset.motion = String(motion);
    document.documentElement.dataset.inspect = String(outline);
  }, [lang, theme, contrast, large, motion, outline]);

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
    window.scrollTo(0, 0);
  };

  const add = (id: string, qty = 1) => {
    const p = products.find((p) => p.id === id);
    if (!p || qty < 1) return;
    const existing = cart.find((i) => i.id === id)?.qty || 0;
    if (existing + qty > p.stock) {
      triggerHaptic("heavy");
      addToast({
        type: "warning",
        title: tr("Stock limit", "สินค้ามีไม่เพียงพอ"),
        message: tr(
          "This batch has no more stock available.",
          "สินค้ารอบนี้มีไม่เพียงพอสำหรับจำนวนที่เลือก",
        ),
      });
      return;
    }
    triggerHaptic("light");
    setPlan(false);
    setCart((old) => [
      ...old.filter((i) => i.id !== id),
      { id, qty: existing + qty },
    ]);
    if (config.audio) chime(true);
    notifySuccess(
      tr("Added to bag!", "เพิ่มลงตะกร้าแล้ว!"),
      tr(
        `Added ${pname(p)} (${existing + qty} in bag)`,
        `เพิ่ม ${pname(p)} (รวม ${existing + qty} ชิ้นในตะกร้า)`,
      ),
      {
        label: tr("Review bag", "ตรวจสอบตะกร้า"),
        onClick: () => {
          const el = document.getElementById("your-bag");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          } else {
            openCheckout();
          }
        },
      },
    );
  };
  const changeQty = (id: string, delta: number) => {
    const item = cart.find((i) => i.id === id);
    if (!item) return;
    triggerHaptic(delta > 0 ? "light" : "medium");
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
    const isWalkIn = orderType === "walk-in";
    if (!isWalkIn) {
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
    }
    const id = "WC-" + crypto.randomUUID().slice(0, 6).toUpperCase();
    const order: Order = {
      id,
      items: cart.map((item) => {
        const p = products.find((p) => p.id === item.id)!;
        return { name: p.en, nameTh: p.th, qty: item.qty, price: p.price };
      }),
      total,
      date: isWalkIn ? new Date().toISOString().split("T")[0] : pickupDate,
      window: isWalkIn ? tr("Immediate (Walk-in)", "ทันที (หน้าร้าน)") : slot,
      name: customer.name.trim() || (isWalkIn ? tr("Walk-in Guest", "ลูกค้าหน้าร้าน") : tr("Guest", "ลูกค้า")),
      phone: customer.phone.trim() || (isWalkIn ? "Walk-in" : "-"),
      status: "received",
      created: new Date().toISOString(),
      plan: isWalkIn ? false : plan,
      orderType,
      specialRequests: specialRequests.trim() || undefined,
    };
    triggerHaptic("success");
    setOrders((old) => [order, ...old]);

    const updatedProds = products.map((p) => {
      const deduction = cart.find((i) => i.id === p.id)?.qty || 0;
      return {
        ...p,
        stock: Math.max(0, p.stock - deduction),
      };
    });
    setProducts(updatedProds);

    // Automated Low Stock Email Alert Dispatch
    updatedProds.forEach((p) => {
      if (isLowStock(p, LOW_STOCK_THRESHOLD)) {
        sendLowStockEmailAlert(p, LOW_STOCK_THRESHOLD, "banheruka@gmail.com");
      }
    });
    setEmailLogs(getAdminEmailLogs());

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
    setSpecialRequests("");
    setModal(null);
    chime(config.audio, true);
    setConfirmedOrder(order);
    notifySuccess(
      tr("Order placed successfully!", "สั่งซื้อสำเร็จเรียบร้อยแล้ว!"),
      tr(
        `Order #${id} is confirmed. Total: ${money(total)} for ${formatDate(pickupDate)} (${slot}).`,
        `บันทึกออเดอร์ #${id} เรียบร้อยแล้ว ยอดรวม ${money(total)} รับวันที่ ${formatDate(pickupDate)} (${slot})`,
      ),
      {
        label: tr("View tracking & confirmation", "ดูการติดตามและใบเสร็จ"),
        onClick: () => setConfirmedOrder(order),
      },
    );
  };

  const finalizePosOrder = () => {
    if (!cart.length) {
      notify(tr("Please add items to the POS order first.", "กรุณาเพิ่มสินค้าลงในออเดอร์ก่อน"));
      return;
    }
    const id = "WC-" + crypto.randomUUID().slice(0, 6).toUpperCase();
    const isWalkIn = orderType === "walk-in";
    const tenderedVal = Number(cashTendered) || total;
    const changeVal = tenderedVal >= total ? tenderedVal - total : 0;

    const newOrder: Order = {
      id,
      items: cart.map((item) => {
        const p = products.find((p) => p.id === item.id)!;
        return { name: p.en, nameTh: p.th, qty: item.qty, price: p.price };
      }),
      total,
      date: isWalkIn ? new Date().toISOString().split("T")[0] : pickupDate,
      window: isWalkIn ? tr("Immediate (Walk-in Counter)", "ทันที (เคาน์เตอร์หน้าร้าน)") : slot,
      name: customer.name.trim() || (isWalkIn ? tr("Walk-in Customer", "ลูกค้าหน้าร้าน") : tr("Guest", "ลูกค้า")),
      phone: customer.phone.trim() || (isWalkIn ? "Walk-in" : "-"),
      status: "ready",
      created: new Date().toISOString(),
      plan: false,
      orderType,
      tendered: tenderedVal,
      change: changeVal,
      specialRequests: specialRequests.trim() || undefined,
    };

    const updatedProds = products.map((p) => {
      const deduction = cart.find((i) => i.id === p.id)?.qty || 0;
      return {
        ...p,
        stock: Math.max(0, p.stock - deduction),
      };
    });
    setProducts(updatedProds);

    // Automated Low Stock Email Alert Dispatch
    updatedProds.forEach((p) => {
      if (isLowStock(p, LOW_STOCK_THRESHOLD)) {
        sendLowStockEmailAlert(p, LOW_STOCK_THRESHOLD, "banheruka@gmail.com");
      }
    });
    setEmailLogs(getAdminEmailLogs());

    setOrders((old) => [newOrder, ...old]);
    setCart([]);
    setSpecialRequests("");
    setDial("");
    setCashTendered("");
    triggerHaptic("success");
    chime(config.audio, true);

    setReceiptOrder(newOrder);
    setModal("receipt");

    notifySuccess(
      tr("Order completed & paid!", "บันทึกออเดอร์และรับเงินเรียบร้อยแล้ว!"),
      tr(
        `Order #${id} created. Total: ${money(total)}${tenderedVal > total ? ` · Change: ${money(changeVal)}` : ""}`,
        `สร้างออเดอร์ #${id} เรียบร้อยแล้ว ยอดรวม ${money(total)}${tenderedVal > total ? ` · เงินทอน: ${money(changeVal)}` : ""}`
      ),
      {
        label: tr("View receipt", "ดูใบเสร็จ"),
        onClick: () => {
          setReceiptOrder(newOrder);
          setModal("receipt");
        },
      }
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
  const { todayStr, tomorrowStr } = useMemo(() => {
    const now = new Date();
    const tStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(now);
    const tmrw = new Date(now.getTime() + 86400000);
    const tmrwStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(tmrw);
    return { todayStr: tStr, tomorrowStr: tmrwStr };
  }, []);

  const pickupFields = (
    <div className="pickup-fields">
      <label>
        <CalendarDays size={15} />
        {tr("Pickup day", "วันรับสินค้า")}
        <div className="select-wrap">
          <select value={pickupDate} onChange={(e) => setDate(e.target.value)}>
            {availableDates.map((d) => (
              <option key={d} value={d}>
                {d === todayStr
                  ? tr("Today (Same-day)", "วันนี้ (รับได้เลย)") + ", "
                  : d === tomorrowStr
                    ? tr("Tomorrow", "พรุ่งนี้") + ", "
                    : ""}
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
                {w === "Anytime (Ready in 15–30 mins)"
                  ? tr("⚡ Anytime (Ready in 15–30 mins)", "⚡ ตลอดวัน (รอรับ 15–30 นาที)")
                  : w}
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
              ["history", Clock3],
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
              {id === "history" && orders.length > 0 && (
                <span className="nav-count">
                  {orders.length}
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
            <AccessibilityMenu
              contrast={contrast}
              setContrast={setContrast}
              large={large}
              setLarge={setLarge}
              motion={motion}
              setMotion={setMotion}
            />
            <LanguageToggle />
            <button
              className="icon-button"
              style={{ position: "relative" }}
              onClick={() => {
                triggerHaptic("light");
                setIsCartDrawerOpen(true);
              }}
              aria-label={tr("Open cart drawer", "เปิดตะกร้าสินค้า")}
              title={tr("Your Little Bag", "ตะกร้าสินค้า")}
            >
              <ShoppingBag size={18} />
              {totalCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-4px",
                    right: "-4px",
                    background: "var(--green)",
                    color: "#fff",
                    fontSize: "10px",
                    fontWeight: "bold",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {totalCount}
                </span>
              )}
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
              aria-label={tr("Open staff operations drawer", "เปิดเมนูพนักงานและการตั้งค่า")}
              title={tr("Staff & Operations Drawer", "เมนูจัดการร้าน")}
              onClick={() => {
                triggerHaptic("light");
                setIsAdminDrawerOpen(true);
              }}
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
              {/* Walk-in & Passersby Banner */}
              <div className="walkin-passersby-banner" style={{ margin: "0 0 20px" }}>
                <div className="walkin-content">
                  <span className="walkin-badge">
                    <Store size={14} /> {tr("Walk-in & Passersby Welcome", "ยินดีต้อนรับลูกค้าหน้าร้านและผู้สัญจร")}
                  </span>
                  <h4>{tr("Need fresh soy milk right now?", "แวะรับน้ำเต้าหู้สดทันที?")}</h4>
                  <p>
                    {tr(
                      "Instant 1–2 minute counter grab & go on Hai Ya Road, Chiang Mai. No advance scheduling required for daily walk-ins.",
                      "แวะซื้อหน้าร้านได้ทันทีที่ถนนหายยา เชียงใหม่ รอเพียง 1–2 นาที ไม่ต้องจองรอบเวลาล่วงหน้าสำหรับลูกค้าหน้าร้าน",
                    )}
                  </p>
                </div>
                <div className="walkin-actions">
                  <button
                    type="button"
                    className={`walkin-toggle-btn ${orderType === "walk-in" ? "active" : ""}`}
                    onClick={() => {
                      triggerHaptic("light");
                      setOrderType("walk-in");
                      notify(
                        tr("Walk-in Mode: Instant counter pickup selected.", "โหมดหน้าร้าน: เลือกรับด่วนที่เคาน์เตอร์แล้ว"),
                        "info",
                      );
                    }}
                  >
                    🚶 {tr("Walk-in Counter (Immediate)", "ซื้อทันทีหน้าร้าน")}
                  </button>
                  <button
                    type="button"
                    className={`walkin-toggle-btn ${orderType === "pickup" ? "active" : ""}`}
                    onClick={() => {
                      triggerHaptic("light");
                      setOrderType("pickup");
                      notify(
                        tr("Pre-order Mode: Scheduled pickup window selected.", "โหมดจองล่วงหน้า: เลือกรอบเวลารับแล้ว"),
                        "info",
                      );
                    }}
                  >
                    🛵 {tr("Pre-order Pickup (Scheduled)", "สั่งจองล่วงหน้า")}
                  </button>
                </div>
              </div>

              <section className="hero">
                <div className="hero-copy">
                  <div className="hero-eyebrow">
                    <span className="green-dot" />
                    {tr(
                      "FRESH FROM OUR CHIANG MAI KITCHEN",
                      "สดใหม่จากครัวของเราในเชียงใหม่",
                    )}
                  </div>
                  {Boolean(config.announcement) && (
                    <div
                      className="hero-announcement"
                      style={{
                        marginBottom: "12px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "var(--soft-green)",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "11px",
                        color: "var(--green)",
                        fontWeight: 500,
                      }}
                    >
                      <Sparkles size={13} />
                      {renderRich(
                        tr(
                          config.announcement,
                          config.announcementTh || config.announcement,
                        ),
                      )}
                    </div>
                  )}
                  <h1>
                    {renderRich(tr(config.heading, config.headingTh))}
                  </h1>
                  <p>
                    {renderRich(
                      tr(
                        config.note,
                        config.noteTh ||
                          "ทำสดใหม่ เรียบง่ายด้วยความใส่ใจ น้ำเต้าหู้ทีละน้อยจากครัวเชียงใหม่ เพื่อเติมความสุขเล็ก ๆ ให้ทุกวันของคุณ",
                      ),
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
                        ["all", tr("All items", "ทั้งหมด")],
                        ["milk", tr("Soy milk", "น้ำเต้าหู้")],
                        ["freshmilk", tr("Fresh milk", "นมสด")],
                        ["ginger", tr("Ginger water", "น้ำขิง")],
                        ["treat", tr("Donuts & bread", "ปาท่องโก๋ & ขนมปัง")],
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
                    {filtered.map((p, index) => (
                      <article
                        className="product-card"
                        key={`${category}-${p.id}`}
                        style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
                      >
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
                            {p.category === "treat"
                              ? tr("Freshly made", "ทำสดใหม่")
                              : tr("Fresh bowl", "ทำสดใหม่")}
                          </span>
                        </button>
                        <div className="product-info">
                          <button
                            className="product-name"
                            onClick={() => setDetail(p)}
                          >
                            {pname(p)}
                          </button>
                          <p>{renderRich(tr(p.desc, p.descTh))}</p>
                          <div className="product-meta">
                            <Leaf size={11} />
                            {tr(
                              p.category === "freshmilk"
                                ? "Fresh milk"
                                : "Plant-based",
                              p.category === "freshmilk"
                                ? "นมสดแท้"
                                : "จากพืชธรรมชาติ",
                            )}
                            <span>·</span>
                            {tr("Fresh daily", "ทำสดทุกวัน")}
                          </div>
                          <div className="product-bottom">
                            <div>
                              <strong>{money(p.price)}</strong>
                              <small>
                                {tr(
                                  p.category === "treat"
                                    ? "/ serving"
                                    : "/ bowl",
                                  p.category === "treat" ? "/ ชิ้น/ชุด" : "/ ชาม",
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
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    className="secondary"
                    onClick={() => go("history")}
                  >
                    <Clock3 size={15} />
                    {tr("Full order history", "ดูประวัติคำสั่งซื้อ")}
                  </button>
                  <button
                    className="secondary"
                    disabled={!orders.length}
                    onClick={exportOrders}
                  >
                    <Download size={15} />
                    {tr("Export orders", "ส่งออกออเดอร์")}
                  </button>
                </div>
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
                    <OrderTrackingProgress
                      order={o}
                      onStatusChange={(newStatus) => updateStatus(o.id, newStatus)}
                      interactive={true}
                    />
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
                    <div className="order-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <span style={{ display: "block", fontSize: "11px", color: "var(--muted)" }}>
                          {o.name} · {tr("Pay at pickup", "ชำระเมื่อรับสินค้า")}
                        </span>
                        <strong style={{ fontSize: "15px" }}>{money(o.total)}</strong>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <button
                          type="button"
                          className="secondary"
                          style={{ padding: "6px 12px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "5px" }}
                          onClick={() => {
                            setReceiptOrder(o);
                            setModal("receipt");
                          }}
                        >
                          <Receipt size={13} />
                          {tr("Receipt & QR", "ใบเสร็จ & QR")}
                        </button>
                        <button
                          type="button"
                          className="primary"
                          style={{ padding: "6px 12px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "5px" }}
                          onClick={() => {
                            triggerHaptic("light");
                            setReorderTargetOrder(o);
                          }}
                        >
                          <RotateCcw size={13} />
                          {tr("Reorder", "สั่งซ้ำ")}
                        </button>
                      </div>
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
          {view === "history" && (
            <>
              <PageHeading
                kicker={tr("CUSTOMER DASHBOARD", "แดชบอร์ดลูกค้า")}
                title={tr("Previous Orders & History", "ประวัติคำสั่งซื้อทั้งหมด")}
                description={tr(
                  "Review all your previous orders, current pickup statuses, itemized breakdowns, and total prices. Re-order your morning favorites in one tap.",
                  "ดูประวัติคำสั่งซื้อทั้งหมดของคุณ ตรวจสอบสถานะ รายการสินค้า และราคารวม พร้อมสั่งซ้ำได้ในคลิกเดียว",
                )}
              />

              {/* Customer Stats Cards */}
              <div className="customer-stats-grid">
                <div className="customer-stat-card">
                  <span className="stat-label">
                    <ShoppingBag size={14} />
                    {tr("Total Orders", "จำนวนออเดอร์ทั้งหมด")}
                  </span>
                  <span className="stat-value">{orders.length}</span>
                  <span className="stat-hint">
                    {tr("Recorded on this device", "บันทึกบนอุปกรณ์นี้")}
                  </span>
                </div>
                <div className="customer-stat-card">
                  <span className="stat-label">
                    <CreditCard size={14} />
                    {tr("Total Spent", "ยอดสั่งซื้อสะสม")}
                  </span>
                  <span className="stat-value">
                    {money(orders.reduce((sum, o) => sum + o.total, 0))}
                  </span>
                  <span className="stat-hint">
                    {tr("All completed & pending", "รวมทุกรายการ")}
                  </span>
                </div>
                <div className="customer-stat-card">
                  <span className="stat-label">
                    <CheckCircle2 size={14} />
                    {tr("Completed Pickups", "รับสินค้าสำเร็จแล้ว")}
                  </span>
                  <span className="stat-value">
                    {orders.filter((o) => o.status === "collected").length}
                  </span>
                  <span className="stat-hint">
                    {tr("Picked up at Hai Ya", "รับสินค้าเรียบร้อย")}
                  </span>
                </div>
                <div className="customer-stat-card">
                  <span className="stat-label">
                    <Clock3 size={14} />
                    {tr("In Progress", "กำลังดำเนินการ")}
                  </span>
                  <span className="stat-value">
                    {orders.filter((o) => o.status !== "collected").length}
                  </span>
                  <span className="stat-hint">
                    {tr("Brewing or ready", "กำลังเตรียมหรือพร้อมรับ")}
                  </span>
                </div>
              </div>

              {/* Customer Monthly Spending Trends Bar Chart */}
              <CustomerSpendingChart orders={orders} />

              {/* Recent Orders Section with Quick Reorder */}
              {orders.length > 0 && (
                <div style={{ marginBottom: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, display: "flex", alignItems: "center", gap: "6px" }}>
                        <Sparkles size={16} className="text-amber-500" />
                        {tr("Recent Orders & Quick Reorder", "ออเดอร์ล่าสุด & สั่งซ้ำทันใจ")}
                      </h3>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--muted)" }}>
                        {tr("Reorder your breakfast favorites with itemized confirmation in one tap.", "สั่งซ้ำเมนูโปรดของคุณพร้อมหน้าต่างยืนยันรายการในคลิกเดียว")}
                      </p>
                    </div>
                  </div>

                  <div className="recent-orders-shelf">
                    {orders.slice(0, 6).map((ro) => (
                      <div key={ro.id} className="recent-order-pill-card">
                        <div>
                          <div className="recent-order-pill-header">
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--green)" }}>
                              #{ro.id}
                            </span>
                            <span className={`status-badge ${ro.status}`} style={{ fontSize: "9px", padding: "2px 6px" }}>
                              {statusLabel(ro.status)}
                            </span>
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                            {formatDate(ro.date)} · {ro.window}
                          </div>
                          <div className="recent-order-items-preview">
                            {ro.items.map((it) => `${it.qty}× ${tr(it.name, it.nameTh)}`).join(", ")}
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid var(--line)" }}>
                          <strong style={{ fontSize: "14px", color: "var(--text)" }}>
                            {money(ro.total)}
                          </strong>
                          <button
                            type="button"
                            className="primary"
                            style={{ padding: "5px 12px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                            onClick={() => {
                              triggerHaptic("light");
                              setReorderTargetOrder(ro);
                            }}
                          >
                            <RotateCcw size={12} />
                            {tr("Reorder", "สั่งซ้ำ")}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dedicated My Orders Section */}
              <div className="my-orders-section-header">
                <div>
                  <h3 style={{ margin: 0, fontSize: "19px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", color: "var(--foreground)" }}>
                    <ShoppingBag size={20} className="text-emerald-600" />
                    {tr("My Orders", "ออเดอร์ของฉัน")}
                  </h3>
                  <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--muted)" }}>
                    {tr(
                      "All past orders, current preparation statuses, items breakdown, and one-tap reordering.",
                      "ประวัติคำสั่งซื้อทั้งหมด ติดตามสถานะการทำสดแบบเรียลไทม์ พร้อมปุ่มสั่งซ้ำทันใจ",
                    )}
                  </p>
                </div>
              </div>

              {/* Toolbar with Search and Filters */}
              <div className="page-toolbar">
                <div className="category-tabs">
                  {[
                    {
                      id: "all" as const,
                      text: tr("All orders", "ทั้งหมด"),
                      count: orders.length,
                    },
                    {
                      id: "collected" as const,
                      text: tr("Completed", "รับแล้ว"),
                      count: orders.filter((o) => o.status === "collected")
                        .length,
                    },
                    {
                      id: "active" as const,
                      text: tr("In progress", "กำลังดำเนินการ"),
                      count: orders.filter((o) => o.status !== "collected")
                        .length,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setHistoryFilter(tab.id)}
                      className={historyFilter === tab.id ? "active" : ""}
                    >
                      {tab.text} ({tab.count})
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    className="search-field"
                    style={{ margin: 0, minWidth: "220px" }}
                  >
                    <Search size={15} />
                    <input
                      aria-label={tr("Search orders", "ค้นหาออเดอร์")}
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder={tr(
                        "Search by ID, item, or name…",
                        "ค้นหาตามรหัส, สินค้า, หรือชื่อ…",
                      )}
                    />
                    {historySearch && (
                      <button
                        aria-label={tr("Clear search", "ล้างการค้นหา")}
                        className="icon-button"
                        onClick={() => setHistorySearch("")}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button
                    className="secondary"
                    disabled={!orders.length}
                    onClick={exportOrders}
                  >
                    <Download size={14} />
                    {tr("Export CSV", "ส่งออก")}
                  </button>
                </div>
              </div>

              {/* Orders List */}
              {orders
                .filter((o) => {
                  const matchesFilter =
                    historyFilter === "all" ||
                    (historyFilter === "collected"
                      ? o.status === "collected"
                      : o.status !== "collected");
                  const q = historySearch.toLowerCase().trim();
                  if (!q) return matchesFilter;
                  const matchesSearch =
                    o.id.toLowerCase().includes(q) ||
                    o.name.toLowerCase().includes(q) ||
                    o.phone.includes(q) ||
                    o.items.some(
                      (item) =>
                        item.name.toLowerCase().includes(q) ||
                        item.nameTh.toLowerCase().includes(q),
                    );
                  return matchesFilter && matchesSearch;
                })
                .map((o) => (
                  <article
                    className="order-card previous-order-card clickable-order-card"
                    key={o.id}
                    tabIndex={0}
                    role="button"
                    aria-label={tr(`View itemized receipt for order ${o.id}`, `ดูใบเสร็จคำสั่งซื้อ ${o.id}`)}
                    onClick={() => {
                      setReceiptOrder(o);
                      setModal("receipt");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setReceiptOrder(o);
                        setModal("receipt");
                      }
                    }}
                  >
                    {/* Header */}
                    <div className="previous-order-header">
                      <div className="previous-order-meta">
                        <div className="order-pill-row">
                          <span className="order-id-code">{o.id}</span>
                          <span>·</span>
                          <span>{formatDate(o.date, true)}</span>
                          <span>·</span>
                          <span className="receipt-click-hint">
                            <Receipt size={12} />
                            {tr("Itemized receipt", "ใบเสร็จฉบับเต็ม")}
                          </span>
                        </div>
                        <h3
                          style={{
                            fontFamily: "var(--serif)",
                            fontSize: "19px",
                            marginTop: "4px",
                          }}
                        >
                          {o.name}
                        </h3>
                        <div className="order-pickup-time">
                          <Clock3 size={13} />
                          <span>{o.window}</span>
                          <span>·</span>
                          <MapPin size={13} />
                          <span>{tr("Wanchai, Hai Ya", "วันชัย หายยา")}</span>
                          <span>·</span>
                          <span>{o.phone}</span>
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "6px",
                        }}
                      >
                        <span className={`status-badge ${o.status}`}>
                          <span className="green-dot" />
                          {statusLabel(o.status)}
                        </span>
                        <small
                          style={{ fontSize: "10px", color: "var(--muted)" }}
                        >
                          {tr("Status:", "สถานะ:")}{" "}
                          {o.status === "collected"
                            ? tr("Completed", "สำเร็จ")
                            : tr("Active", "รอรับ")}
                        </small>
                      </div>
                    </div>

                    {/* Real-time Order Tracking Stepper */}
                    <OrderTrackingProgress
                      order={o}
                      onStatusChange={(newStatus) => updateStatus(o.id, newStatus)}
                      interactive={true}
                    />

                    {/* Items List (Explicit requirement: "showing status, items, and total price") */}
                    <div className="previous-order-items-wrapper">
                      <div className="previous-order-items-title">
                        {tr("Ordered Items & Quantity", "รายการสินค้าและจำนวน")}
                      </div>
                      {o.items.map((item, idx) => (
                        <div className="previous-order-item-row" key={idx}>
                          <div className="item-left-desc">
                            <span className="item-qty-badge">{item.qty} ×</span>
                            <strong>{tr(item.name, item.nameTh)}</strong>
                            <span className="item-unit-price">
                              (@ {money(item.price)}{" "}
                              {tr("each", "/ ชิ้น")})
                            </span>
                          </div>
                          <b>{money(item.qty * item.price)}</b>
                        </div>
                      ))}
                    </div>

                    {/* Pricing summary */}
                    <div className="previous-order-pricing-summary">
                      <div>
                        {o.plan && (
                          <div
                            className="discount-line"
                            style={{ margin: "0 0 4px 0" }}
                          >
                            <span>
                              {tr(
                                "Weekly plan savings (10% applied)",
                                "รวมส่วนลดรายสัปดาห์ 10%",
                              )}
                            </span>
                          </div>
                        )}
                        <small
                          style={{ fontSize: "11px", color: "var(--muted)" }}
                        >
                          <ShieldCheck
                            size={12}
                            style={{
                              display: "inline",
                              verticalAlign: "middle",
                              marginRight: "4px",
                            }}
                          />
                          {tr(
                            "Pay at pickup · Cash or PromptPay QR",
                            "ชำระเงินเมื่อรับสินค้า · เงินสดหรือพร้อมเพย์",
                          )}
                        </small>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--muted)",
                            display: "block",
                          }}
                        >
                          {tr("Total price", "ราคารวม")}
                        </span>
                        <span className="order-total-price-large">
                          {money(o.total)}
                        </span>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="previous-order-actions-row">
                      <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                        {tr("Order created:", "สั่งเมื่อ:")}{" "}
                        {new Date(o.created).toLocaleDateString(
                          lang === "en" ? "en-US" : "th-TH",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </div>
                      <div className="previous-order-actions-buttons">
                        <button
                          type="button"
                          className="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReceiptOrder(o);
                            setModal("receipt");
                          }}
                        >
                          <Receipt size={14} />
                          {tr("View receipt", "ดูใบเสร็จ")}
                        </button>
                        <button
                          type="button"
                          className="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerHaptic("light");
                            setReorderTargetOrder(o);
                          }}
                        >
                          <RotateCcw size={14} />
                          {tr("Order again", "สั่งซ้ำเมนูนี้")}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}

              {/* Empty state when no orders match */}
              {!orders.filter((o) => {
                const matchesFilter =
                  historyFilter === "all" ||
                  (historyFilter === "collected"
                    ? o.status === "collected"
                    : o.status !== "collected");
                const q = historySearch.toLowerCase().trim();
                if (!q) return matchesFilter;
                return (
                  matchesFilter &&
                  (o.id.toLowerCase().includes(q) ||
                    o.name.toLowerCase().includes(q) ||
                    o.items.some(
                      (item) =>
                        item.name.toLowerCase().includes(q) ||
                        item.nameTh.toLowerCase().includes(q),
                    ))
                );
              }).length && (
                <div className="empty-state panel">
                  <History size={40} strokeWidth={1.3} />
                  <h2>
                    {historySearch
                      ? tr(
                          "No orders match your search",
                          "ไม่พบออเดอร์ที่ตรงกับคำค้นหา",
                        )
                      : tr(
                          "No previous orders found",
                          "ยังไม่มีประวัติคำสั่งซื้อ",
                        )}
                  </h2>
                  <p>
                    {historySearch
                      ? tr(
                          "Try clearing your search terms or filter tabs.",
                          "ลองล้างคำค้นหาหรือเปลี่ยนแท็บตัวกรอง",
                        )
                      : tr(
                          "When you pre-order fresh soy milk or treats from our kitchen, they will appear here with full status tracking, items breakdown, and total prices.",
                          "เมื่อคุณสั่งซื้อน้ำเต้าหู้หรือของว่างสดใหม่ รายการจะแสดงที่นี่พร้อมการติดตามสถานะ รายการสินค้า และราคารวม",
                        )}
                  </p>
                  <button
                    className="primary"
                    onClick={() => {
                      if (historySearch) {
                        setHistorySearch("");
                        setHistoryFilter("all");
                      } else {
                        go("menu");
                      }
                    }}
                  >
                    {historySearch
                      ? tr("Clear search", "ล้างการค้นหา")
                      : tr("Explore today's menu", "ดูเมนูของวันนี้")}
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
              <div className="pos-layout pos-layout-tablet-duo">
                {/* Column 1: Product Selection Catalog */}
                <div className="pos-catalog-column">
                  <section className="panel pos-panel">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Store size={18} className="text-emerald-800" />
                        <h3 style={{ margin: 0 }}>{tr("1. Product Catalog", "1. เมนูสินค้าทั้งหมด")}</h3>
                      </div>

                      {/* POS search bar */}
                      <div className="inventory-search-bar-wrap" style={{ maxWidth: "240px", padding: "4px 10px" }}>
                        <Search size={14} className="text-muted" />
                        <input
                          type="text"
                          placeholder={tr("Quick filter...", "ค้นหาเร็ว...")}
                          value={posSearch}
                          onChange={(e) => setPosSearch(e.target.value)}
                          style={{ fontSize: "12px" }}
                        />
                        {posSearch && (
                          <button
                            type="button"
                            onClick={() => setPosSearch("")}
                            style={{ border: 0, padding: 0, cursor: "pointer", color: "var(--muted)", fontSize: "11px" }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Category switcher */}
                    <div className="inventory-category-tabs" style={{ marginBottom: "14px" }}>
                      {[
                        { id: "all" as const, label: tr("All items", "ทั้งหมด") },
                        { id: "milk" as const, label: tr("Soy milk", "น้ำเต้าหู้") },
                        { id: "freshmilk" as const, label: tr("Fresh milk", "นมสด") },
                        { id: "ginger" as const, label: tr("Ginger", "น้ำขิง") },
                        { id: "treat" as const, label: tr("Donuts & bread", "ปาท่องโก๋ & ขนมปัง") },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className={posCategory === t.id ? "active" : ""}
                          onClick={() => {
                            triggerHaptic("light");
                            setPosCategory(t.id);
                          }}
                          style={{ padding: "5px 12px", fontSize: "11px" }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Products Grid */}
                    <div className="pos-products">
                      {products
                        .filter((p) => posCategory === "all" || p.category === posCategory)
                        .filter((p) => {
                          if (!posSearch.trim()) return true;
                          const q = posSearch.toLowerCase();
                          return p.en.toLowerCase().includes(q) || p.th.toLowerCase().includes(q);
                        })
                        .map((p) => (
                          <button
                            className={selected === p.id ? "selected" : ""}
                            onClick={() => {
                              setSelected(p.id);
                              add(p.id, 1);
                            }}
                            key={p.id}
                            title={tr(`Click to add 1 ${p.en}`, `คลิกเพื่อเพิ่ม ${p.th} 1 รายการ`)}
                          >
                            <img src={p.image} alt="" />
                            <strong>{pname(p)}</strong>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginTop: "3px" }}>
                              <span style={{ fontWeight: "700" }}>{money(p.price)}</span>
                              <span style={{
                                fontSize: "9px",
                                padding: "1px 5px",
                                borderRadius: "6px",
                                background: p.stock <= 10 ? "#fee2e2" : "var(--soft-green)",
                                color: p.stock <= 10 ? "#b91c1c" : "var(--green)",
                                fontWeight: "600"
                              }}>
                                {p.stock > 0 ? `${p.stock} left` : "Out"}
                              </span>
                            </div>
                          </button>
                        ))}
                    </div>
                  </section>
                </div>

                {/* Column 2: Active Order Summary & Terminal */}
                <div className="pos-order-column">
                  <aside className="order-box panel liquid-glass-card" style={{ width: "100%" }}>
                    <div className="order-box-head">
                      <div>
                        <h3 style={{ margin: 0 }}>{tr("Active Order Summary", "สรุปออเดอร์")}</h3>
                        <small style={{ color: "var(--muted)", fontSize: "11px" }}>
                          {tr("Register #01 ·Hai Ya House", "แคชเชียร์ 01 · บ้านหายยา")}
                        </small>
                      </div>
                      <span style={{ fontSize: "12px", fontWeight: "600" }}>
                        {totalCount} {tr("items", "รายการ")}
                      </span>
                    </div>

                    {/* Walk-in vs Pickup toggle */}
                    <div className="order-type-toggle" style={{ marginTop: "10px" }}>
                      <button
                        type="button"
                        className={`order-type-btn ${orderType === "walk-in" ? "active" : ""}`}
                        onClick={() => {
                          triggerHaptic("light");
                          setOrderType("walk-in");
                        }}
                      >
                        <Store size={14} />
                        {tr("Walk-in (Counter)", "หน้าร้าน (รับทันที)")}
                      </button>
                      <button
                        type="button"
                        className={`order-type-btn ${orderType === "pickup" ? "active" : ""}`}
                        onClick={() => {
                          triggerHaptic("light");
                          setOrderType("pickup");
                        }}
                      >
                        <Clock3 size={14} />
                        {tr("Daily Pickup", "รับประจำวัน")}
                      </button>
                    </div>

                    {/* Cart Items List */}
                    {cartContents}

                    {/* POS Mode Switch: Dialpad VS Cash Calculator */}
                    <div className="pos-mode-switch" style={{ marginTop: "14px" }}>
                      <button
                        type="button"
                        className={`pos-mode-btn ${posMode === "dial" ? "active" : ""}`}
                        onClick={() => {
                          triggerHaptic("light");
                          setPosMode("dial");
                        }}
                      >
                        <Keyboard size={14} />
                        {tr("Dialpad", "แป้นกดจำนวน")}
                      </button>
                      <button
                        type="button"
                        className={`pos-mode-btn ${posMode === "cash" ? "active" : ""}`}
                        onClick={() => {
                          triggerHaptic("light");
                          setPosMode("cash");
                        }}
                      >
                        <Coins size={14} />
                        {tr("Cash & Change", "เงินสด/เงินทอน")}
                      </button>
                    </div>

                    {posMode === "dial" ? (
                      <div style={{ marginTop: "10px" }}>
                        <output className="dial-display" aria-live="polite">
                          <span>
                            {pname(products.find((p) => p.id === selected) || products[0])}
                          </span>
                          <b>{dial || "0"}</b>
                        </output>

                        {/* Quick Presets */}
                        <div className="pos-quick-presets">
                          {[1, 2, 5, 10].map((num) => (
                            <button
                              key={num}
                              type="button"
                              className="pos-quick-btn"
                              onClick={() => {
                                triggerHaptic("light");
                                chime(config.audio);
                                setDial(String(num));
                              }}
                            >
                              +{num}
                            </button>
                          ))}
                        </div>

                        {/* Big Dialpad */}
                        <div className="dial-pad big-dialpad">
                          {[
                            "1", "2", "3",
                            "4", "5", "6",
                            "7", "8", "9",
                            "C", "0", "⌫",
                          ].map((key) => (
                            <button
                              key={key}
                              className={
                                key === "C"
                                  ? "action-clear"
                                  : key === "⌫"
                                    ? "action-backspace"
                                    : ""
                              }
                              onClick={() => {
                                triggerHaptic("light");
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
                          style={{ marginTop: "8px" }}
                        >
                          <Plus size={16} />
                          {tr("Add selected quantity", "เพิ่มจำนวนที่กด")}
                        </button>
                      </div>
                    ) : (
                      /* Cash Tender & Change Calculator */
                      <div className="cash-calculator-box" style={{ marginTop: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <small style={{ color: "var(--muted)" }}>{tr("Current Total", "ยอดชำระ")}</small>
                            <h2 style={{ fontSize: "24px", color: "var(--green)", margin: "2px 0" }}>{money(total)}</h2>
                          </div>
                        </div>

                        <div style={{ marginTop: "8px" }}>
                          <small style={{ color: "var(--muted)", fontSize: "11px" }}>{tr("Tendered Cash", "รับเงินสดมา")}</small>
                          <div className="cash-quick-denominations">
                            <button
                              type="button"
                              className="cash-bill-btn exact-btn"
                              onClick={() => {
                                triggerHaptic("light");
                                setCashTendered(String(total));
                              }}
                            >
                              {tr("Exact", "พอดี")}
                            </button>
                            {[20, 50, 100, 500, 1000].map((bill) => (
                              <button
                                key={bill}
                                type="button"
                                className="cash-bill-btn"
                                onClick={() => {
                                  triggerHaptic("light");
                                  setCashTendered(String(bill));
                                }}
                              >
                                ฿{bill}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                          <input
                            type="number"
                            min="0"
                            placeholder={tr("Enter cash amount...", "ใส่ยอดเงินที่รับ...")}
                            value={cashTendered}
                            onChange={(e) => setCashTendered(e.target.value)}
                            style={{ fontSize: "16px", fontWeight: "600", padding: "6px 10px" }}
                          />
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => {
                              triggerHaptic("light");
                              setCashTendered("");
                            }}
                          >
                            {tr("Clear", "ล้าง")}
                          </button>
                        </div>

                        {/* Change Due banner */}
                        {Boolean(cashTendered && Number(cashTendered) > 0) && (
                          <div
                            className={`change-due-banner ${
                              Number(cashTendered) >= total ? "positive" : "negative"
                            }`}
                            style={{ marginTop: "8px" }}
                          >
                            <div>
                              <strong>
                                {Number(cashTendered) >= total
                                  ? tr("Change Due:", "เงินทอน:")
                                  : tr("Short:", "ยังขาด:")}
                              </strong>
                            </div>
                            <strong>
                              {Number(cashTendered) >= total
                                ? money(Number(cashTendered) - total)
                                : money(total - Number(cashTendered))}
                            </strong>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Order Total row */}
                    <div className="order-total" style={{ marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
                      <span>{tr("Order Total", "ยอดรวมทั้งหมด")}</span>
                      <b>{money(total)}</b>
                    </div>

                    {/* Finalize Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                      <button
                        type="button"
                        className="primary full"
                        disabled={!cart.length}
                        onClick={finalizePosOrder}
                        style={{ minHeight: "46px", fontSize: "13px", fontWeight: "700" }}
                      >
                        <Check size={18} />
                        {tr("Complete & Print Order", "จบการขายและพิมพ์ใบเสร็จ")}
                      </button>

                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="secondary full"
                          disabled={!cart.length}
                          onClick={openCheckout}
                          style={{ fontSize: "11px" }}
                        >
                          {tr("Review Details", "ดูรายละเอียด")}
                        </button>
                        {cart.length > 0 && (
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => {
                              triggerHaptic("heavy");
                              setCart([]);
                              setCashTendered("");
                            }}
                            title={tr("Clear bag", "ล้างตะกร้า")}
                            style={{ fontSize: "11px", color: "#b91c1c" }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </aside>
                </div>
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
                    <div
                      className="order-card kitchen-card panel clickable-order-card"
                      key={o.id}
                      tabIndex={0}
                      role="button"
                      aria-label={tr(`View full receipt for order ${o.id}`, `ดูใบเสร็จคำสั่งซื้อ ${o.id}`)}
                      onClick={() => {
                        setReceiptOrder(o);
                        setModal("receipt");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setReceiptOrder(o);
                          setModal("receipt");
                        }
                      }}
                    >
                      <div className="order-card-top">
                        <span className="eyebrow">{o.id}</span>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                          {o.orderType === "walk-in" || o.window?.includes("Walk-in") ? (
                            <span className="walk-in-pill">🚶 {tr("Walk-in", "หน้าร้าน")}</span>
                          ) : (
                            <span className="pickup-pill">🛵 {tr("Pickup", "รับล่วงหน้า")}</span>
                          )}
                          <span className="receipt-click-hint">
                            <Receipt size={11} /> {tr("Receipt", "ใบเสร็จ")}
                          </span>
                          <span className="status-badge">
                            {statusLabel(o.status)}
                          </span>
                        </div>
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
                      {o.specialRequests && (
                        <div style={{ margin: "6px 0", padding: "6px 8px", background: "#fef3c7", borderRadius: "6px", fontSize: "11px", color: "#92400e", border: "1px dashed #f59e0b" }}>
                          <strong>⚠️ {tr("Notes / Allergies:", "หมายเหตุ / แพ้อาหาร:")}</strong> {o.specialRequests}
                        </div>
                      )}
                      <p>
                        <MapPin size={14} />
                        {tr(
                          "Hai Ya pickup · one house only",
                          "รับที่หายยา · จุดรับเดียว",
                        )}
                      </p>
                      <button
                        className="primary full"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateStatus(
                            o.id,
                            o.status === "received"
                              ? "preparing"
                              : o.status === "preparing"
                                ? "ready"
                                : "collected",
                          );
                        }}
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
                  ["analytics", tr("Revenue & Analytics", "รายได้และแนวโน้ม")],
                  ["inventory", tr("Products & stock", "สินค้าและสต็อก")],
                  ["alerts", tr("Automated Alerts Log", "บันทึกแจ้งเตือนอัตโนมัติ")],
                  ["settings", tr("House settings", "ตั้งค่าร้าน")],
                  ["content", tr("Hero wall & story", "ผนังฮีโร่และเรื่องราว")],
                  ["accessibility", tr("Accessibility", "การเข้าถึง")],
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
              {adminTab === "analytics" && (
                <section style={{ marginBottom: "20px" }}>
                  <AdminRevenueChart orders={orders} />
                </section>
              )}
              {adminTab === "alerts" && (
                <section className="panel settings-panel" style={{ marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 0 4px" }}>
                        <Mail size={18} className="text-emerald-700" />
                        {tr("Automated Admin Email Alerts Log", "บันทึกการส่งอีเมลแจ้งเตือนสต็อกอัตโนมัติ")}
                      </h3>
                      <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
                        {tr(
                          "Automated stock alerts dispatched to store manager at banheruka@gmail.com whenever inventory drops to ≤ 10 units.",
                          "ระบบส่งแจ้งเตือนอัตโนมัติไปยัง banheruka@gmail.com เมื่อสต็อกสินค้าลดลงเหลือ ≤ 10 ชิ้น"
                        )}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        className="secondary"
                        onClick={() => {
                          const testProd = products[0] || initialProducts[0];
                          const alert = sendLowStockEmailAlert(testProd, LOW_STOCK_THRESHOLD, "banheruka@gmail.com");
                          setEmailLogs(getAdminEmailLogs());
                          triggerHaptic("success");
                          notifySuccess(
                            tr("Test alert sent!", "ส่งการแจ้งเตือนทดสอบแล้ว!"),
                            tr(`Simulated alert #${alert.id} dispatched to banheruka@gmail.com.`, `ส่งการแจ้งเตือน #${alert.id} ไปยัง banheruka@gmail.com สำเร็จ`)
                          );
                        }}
                      >
                        <Send size={14} />
                        {tr("Send Test Email Alert", "ส่งแจ้งเตือนทดสอบ")}
                      </button>
                      <button
                        type="button"
                        className="secondary"
                        style={{ color: "#dc2626" }}
                        onClick={() => {
                          localStorage.removeItem("wanchai-v2-admin-emails");
                          setEmailLogs([]);
                          notify(tr("Alert log cleared.", "ล้างประวัติแจ้งเตือนแล้ว"));
                        }}
                      >
                        <Trash2 size={14} />
                        {tr("Clear Log", "ล้างบันทึก")}
                      </button>
                    </div>
                  </div>

                  {emailLogs.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "30px", background: "var(--surface-warm)", borderRadius: "8px" }}>
                      <Mail size={32} style={{ color: "var(--muted)", margin: "0 auto 8px" }} />
                      <p style={{ margin: 0, color: "var(--muted)", fontSize: "13px" }}>
                        {tr("No low stock email notifications triggered yet.", "ยังไม่มีประวัติการส่งอีเมลแจ้งเตือนสต็อกต่ำ")}
                      </p>
                    </div>
                  ) : (
                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <th>{tr("Timestamp", "เวลา")}</th>
                            <th>{tr("Recipient", "ผู้รับ")}</th>
                            <th>{tr("Subject", "หัวข้อ")}</th>
                            <th>{tr("Product", "สินค้า")}</th>
                            <th>{tr("Stock Left", "คงเหลือ")}</th>
                            <th>{tr("Status", "สถานะ")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {emailLogs.map((log) => (
                            <tr key={log.id}>
                              <td style={{ fontSize: "11px", whiteSpace: "nowrap" }}>
                                {new Date(log.timestamp).toLocaleString("en-GB", {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </td>
                              <td style={{ fontSize: "11px", fontWeight: 600 }}>{log.to}</td>
                              <td style={{ fontSize: "11px" }}>{log.subject}</td>
                              <td style={{ fontSize: "11px" }}>
                                <strong>{lang === "en" ? log.productName : log.productNameTh}</strong>
                              </td>
                              <td>
                                <span className="inventory-badge-low">
                                  {log.stock} / {log.threshold}
                                </span>
                              </td>
                              <td>
                                <span style={{ color: "#059669", fontWeight: 700, fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                                  ✓ {tr("Dispatched", "ส่งแล้ว")}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}
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
                  <div className="inventory-header-bar">
                    <div>
                      <h3 style={{ margin: "0 0 4px" }}>
                        {tr("Products & Menu Management", "จัดการสินค้าและเมนู")}
                      </h3>
                      <p style={{ margin: 0 }}>
                        {tr(
                          "Organize products per category, edit with rich text, arrange display order, bulk update stock, or import from CSV.",
                          "จัดการสินค้าตามหมวดหมู่ แก้ไขข้อความด้วยโปรแกรมจัดรูปแบบ ปรับลำดับ ปรับสต็อกพร้อมกัน หรือนำเข้าจากไฟล์ CSV",
                        )}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        className="secondary"
                        type="button"
                        onClick={() => {
                          triggerHaptic("light");
                          setIsImportModalOpen(true);
                        }}
                      >
                        <UploadCloud size={15} />
                        {tr("Import Inventory (CSV)", "นำเข้าสต็อก (CSV)")}
                      </button>
                      <button
                        className="secondary"
                        type="button"
                        onClick={() => {
                          triggerHaptic("medium");
                          exportOrdersToCSV(orders);
                          notifySuccess(
                            tr("Orders CSV Exported", "ส่งออกไฟล์ CSV แล้ว"),
                            tr(`Downloaded orders spreadsheet with ${orders.length} records.`, `ดาวน์โหลดประวัติออเดอร์ทั้งหมด ${orders.length} รายการแล้ว`)
                          );
                        }}
                      >
                        <FileSpreadsheet size={15} />
                        {tr("Export Orders CSV", "ส่งออกคำสั่งซื้อ CSV")}
                      </button>
                      <button
                        className="primary"
                        type="button"
                        onClick={() => {
                          setNewProduct({
                            category: "milk",
                            en: "",
                            th: "",
                            desc: "",
                            descTh: "",
                            price: 15,
                            stock: 50,
                            image: "/images/hot_soy_milk_bowl_1792747451795.jpg",
                          });
                          setIsAddingProduct(true);
                        }}
                      >
                        <PlusCircle size={16} />
                        {tr("Add new product", "เพิ่มสินค้าใหม่")}
                      </button>
                    </div>
                  </div>

                  {/* Search and Category Filter Bar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", margin: "14px 0", flexWrap: "wrap" }}>
                    <div className="inventory-search-bar-wrap">
                      <Search size={15} className="text-muted" />
                      <input
                        type="text"
                        placeholder={tr("Search by product name or code...", "ค้นหาสินค้าตามชื่อหรือรหัส...")}
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                      />
                      {adminSearch && (
                        <button
                          type="button"
                          onClick={() => setAdminSearch("")}
                          style={{ border: 0, padding: 0, cursor: "pointer", color: "var(--muted)", fontSize: "12px" }}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="inventory-category-tabs" style={{ margin: 0 }}>
                      {[
                        { id: "all" as const, label: tr("All items", "ทั้งหมด"), count: products.length },
                        { id: "milk" as const, label: tr("Soy milk", "น้ำเต้าหู้"), count: products.filter(p => p.category === "milk").length },
                        { id: "freshmilk" as const, label: tr("Fresh milk", "นมสด"), count: products.filter(p => p.category === "freshmilk").length },
                        { id: "ginger" as const, label: tr("Ginger water", "น้ำขิง"), count: products.filter(p => p.category === "ginger").length },
                        { id: "treat" as const, label: tr("Donuts & bread", "ปาท่องโก๋ & ขนมปัง"), count: products.filter(p => p.category === "treat").length },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          className={adminCategory === tab.id ? "active" : ""}
                          onClick={() => setAdminCategory(tab.id)}
                        >
                          {tab.label} ({tab.count})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bulk Action Bar */}
                  {selectedProductIds.length > 0 && (
                    <div className="bulk-action-bar" style={{ margin: "0 0 12px" }}>
                      <span style={{ fontSize: "12px", fontWeight: 700 }}>
                        {selectedProductIds.length} {tr("products selected", "สินค้าที่เลือก")}
                      </span>
                      <button
                        type="button"
                        className="bulk-btn"
                        onClick={() => {
                          setProducts((old) =>
                            old.map((p) =>
                              selectedProductIds.includes(p.id)
                                ? { ...p, stock: p.stock + 10 }
                                : p
                            )
                          );
                          notify(tr(`Added +10 stock to ${selectedProductIds.length} products.`, `เพิ่มสต็อก +10 ให้สินค้า ${selectedProductIds.length} รายการ`));
                        }}
                      >
                        +10 {tr("Stock", "สต็อก")}
                      </button>
                      <button
                        type="button"
                        className="bulk-btn"
                        onClick={() => {
                          setProducts((old) =>
                            old.map((p) =>
                              selectedProductIds.includes(p.id)
                                ? { ...p, stock: p.stock + 25 }
                                : p
                            )
                          );
                          notify(tr(`Added +25 stock to ${selectedProductIds.length} products.`, `เพิ่มสต็อก +25 ให้สินค้า ${selectedProductIds.length} รายการ`));
                        }}
                      >
                        +25 {tr("Stock", "สต็อก")}
                      </button>
                      <button
                        type="button"
                        className="bulk-btn"
                        style={{ color: "#fca5a5" }}
                        onClick={() => {
                          setProducts((old) =>
                            old.map((p) =>
                              selectedProductIds.includes(p.id)
                                ? { ...p, stock: 0 }
                                : p
                            )
                          );
                          notify(tr(`Marked ${selectedProductIds.length} products as Out of Stock.`, `ตั้งสินค้า ${selectedProductIds.length} รายการเป็นสินค้าหมด`));
                        }}
                      >
                        {tr("Set 0 (Out of Stock)", "ตั้งเป็น 0 (สินค้าหมด)")}
                      </button>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <input
                          type="number"
                          className="bulk-input"
                          placeholder="Qty"
                          min="0"
                          max="999"
                          value={bulkStockVal}
                          onChange={(e) => setBulkStockVal(e.target.value)}
                        />
                        <button
                          type="button"
                          className="bulk-btn primary-bulk"
                          onClick={() => {
                            const val = parseInt(bulkStockVal, 10);
                            if (isNaN(val) || val < 0) return;
                            setProducts((old) =>
                              old.map((p) =>
                                selectedProductIds.includes(p.id)
                                  ? { ...p, stock: val }
                                  : p
                              )
                            );
                            setBulkStockVal("");
                            notify(tr(`Updated stock to ${val} for ${selectedProductIds.length} products.`, `ปรับสต็อกเป็น ${val} ให้สินค้า ${selectedProductIds.length} รายการแล้ว`));
                          }}
                        >
                          {tr("Set Qty", "ตั้งยอด")}
                        </button>
                      </div>
                      <button
                        type="button"
                        className="bulk-btn"
                        onClick={() => setSelectedProductIds([])}
                      >
                        {tr("Deselect All", "ยกเลิกเลือก")}
                      </button>
                    </div>
                  )}

                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: "36px", textAlign: "center" }}>
                            <input
                              type="checkbox"
                              aria-label={tr("Select all visible products", "เลือกสินค้าทั้งหมดที่แสดง")}
                              checked={
                                products
                                  .filter((p) => adminCategory === "all" || p.category === adminCategory)
                                  .length > 0 &&
                                products
                                  .filter((p) => adminCategory === "all" || p.category === adminCategory)
                                  .every((p) => selectedProductIds.includes(p.id))
                              }
                              onChange={(e) => {
                                const currentFiltered = products.filter(
                                  (p) => adminCategory === "all" || p.category === adminCategory
                                );
                                if (e.target.checked) {
                                  const ids = Array.from(new Set([...selectedProductIds, ...currentFiltered.map((p) => p.id)]));
                                  setSelectedProductIds(ids);
                                } else {
                                  const currentIds = currentFiltered.map((p) => p.id);
                                  setSelectedProductIds(selectedProductIds.filter((id) => !currentIds.includes(id)));
                                }
                              }}
                            />
                          </th>
                          <th style={{ width: "70px" }}>{tr("Arrange", "ลำดับ")}</th>
                          <th>{tr("Product", "สินค้า")}</th>
                          <th>{tr("Category", "หมวดหมู่")}</th>
                          <th>{tr("Price · THB", "ราคา · บาท")}</th>
                          <th>{tr("Available & Status", "คงเหลือและสถานะ")}</th>
                          <th style={{ textAlign: "right" }}>{tr("Actions", "การจัดการ")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products
                          .filter((p) => adminCategory === "all" || p.category === adminCategory)
                          .filter((p) => {
                            if (!adminSearch.trim()) return true;
                            const q = adminSearch.toLowerCase();
                            return (
                              p.en.toLowerCase().includes(q) ||
                              p.th.toLowerCase().includes(q) ||
                              p.id.toLowerCase().includes(q)
                            );
                          })
                          .map((p, filteredIdx, currentList) => (
                            <tr key={p.id}>
                              <td style={{ textAlign: "center" }}>
                                <input
                                  type="checkbox"
                                  aria-label={tr(`Select ${p.en}`, `เลือก ${p.th}`)}
                                  checked={selectedProductIds.includes(p.id)}
                                  onChange={() => {
                                    setSelectedProductIds((prev) =>
                                      prev.includes(p.id)
                                        ? prev.filter((id) => id !== p.id)
                                        : [...prev, p.id]
                                    );
                                  }}
                                />
                              </td>
                              <td>
                                <div className="reorder-controls">
                                  <button
                                    type="button"
                                    className="reorder-btn"
                                    title={tr("Move up", "เลื่อนขึ้น")}
                                    aria-label={tr(`Move ${p.en} up`, `เลื่อน${p.th}ขึ้น`)}
                                    disabled={filteredIdx === 0}
                                    onClick={() => moveProduct(p.id, "up")}
                                  >
                                    <ArrowUp size={13} />
                                  </button>
                                  <button
                                    type="button"
                                    className="reorder-btn"
                                    title={tr("Move down", "เลื่อนลง")}
                                    aria-label={tr(`Move ${p.en} down`, `เลื่อน${p.th}ลง`)}
                                    disabled={filteredIdx === currentList.length - 1}
                                    onClick={() => moveProduct(p.id, "down")}
                                  >
                                    <ArrowDown size={13} />
                                  </button>
                                </div>
                              </td>
                              <td>
                                <div className="table-product">
                                  <img src={p.image} alt="" />
                                  <div>
                                    <strong>{pname(p)}</strong>
                                    <small style={{ display: "block", color: "var(--muted)", fontSize: "11px" }}>
                                      {lang === "en" ? p.th : p.en}
                                    </small>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <span style={{
                                  fontSize: "11px",
                                  padding: "3px 8px",
                                  borderRadius: "12px",
                                  background: "var(--surface-warm, #f3f5ee)",
                                  border: "1px solid var(--border)",
                                }}>
                                  {p.category === "milk"
                                    ? tr("Soy milk", "น้ำเต้าหู้")
                                    : p.category === "freshmilk"
                                      ? tr("Fresh milk", "นมสด")
                                      : p.category === "ginger"
                                        ? tr("Ginger water", "น้ำขิง")
                                        : tr("Donuts & bread", "ปาท่องโก๋ & ขนมปัง")}
                                </span>
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
                                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
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
                                  {p.stock === 0 ? (
                                    <span className="inventory-badge-out">
                                      ✕ {tr("Out of Stock", "สินค้าหมด")}
                                    </span>
                                  ) : isLowStock(p, LOW_STOCK_THRESHOLD) ? (
                                    <span className="inventory-badge-low">
                                      <AlertTriangle size={12} />
                                      {tr(`Low Stock (${p.stock})`, `เหลือน้อย (${p.stock})`)}
                                    </span>
                                  ) : (
                                    <span className="inventory-badge-ok">
                                      ✓ {tr("Adequate", "สต็อกพร้อม")} ({p.stock})
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td style={{ textAlign: "right" }}>
                                <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                                  <button
                                    type="button"
                                    className="secondary"
                                    style={{ padding: "5px 10px", fontSize: "11px" }}
                                    title={tr("Edit product with rich text", "แก้ไขด้วยโปรแกรมแก้ไขข้อความ")}
                                    onClick={() => setEditingProduct(p)}
                                  >
                                    <Edit2 size={13} />
                                    {tr("Edit", "แก้ไข")}
                                  </button>
                                  <button
                                    type="button"
                                    className="icon-button"
                                    style={{ color: "#dc2626" }}
                                    title={tr("Delete product", "ลบสินค้า")}
                                    aria-label={tr(`Delete ${p.en}`, `ลบ${p.th}`)}
                                    onClick={() => setDeletingProduct(p)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="save-note">
                    <CheckCheck size={15} />
                    {tr(
                      "Changes and category display arrangements are saved on this device.",
                      "บันทึกการเปลี่ยนแปลงและลำดับสินค้าบนอุปกรณ์นี้อัตโนมัติ",
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
                        "Hero wall & story have been saved.",
                        "บันทึกผนังฮีโร่และเรื่องราวแล้ว",
                      ),
                    );
                  }}
                >
                  <div className="section-heading" style={{ marginBottom: "16px" }}>
                    <div>
                      <h3 style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Sparkles size={19} />
                        {tr("Hero Wall & Story Studio", "สตูดิโอผนังฮีโร่และเรื่องราว")}
                      </h3>
                      <p>
                        {tr(
                          "Design your storefront hero wall, announcement ticker, and brand story with the rich text editor.",
                          "ปรับแต่งผนังฮีโร่หน้าร้าน แถบประกาศ และเรื่องราวแบรนด์ด้วยโปรแกรมแก้ไขข้อความ",
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Live Hero Wall Preview */}
                  <div className="hero-wall-preview">
                    <div className="hero-wall-preview-header">
                      <Sparkles size={14} />
                      {tr("Live Storefront Hero Wall Preview", "ตัวอย่างผนังฮีโร่หน้าร้านจริง")}
                    </div>
                    <div className="hero-wall-preview-body" style={{ background: "var(--surface)" }}>
                      {Boolean(config.announcement) && (
                        <div style={{ marginBottom: "12px", display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--soft-green)", padding: "3px 12px", borderRadius: "16px", fontSize: "11px", color: "var(--green)", fontWeight: 500 }}>
                          <Sparkles size={12} />
                          {renderRich(tr(config.announcement, config.announcementTh || config.announcement))}
                        </div>
                      )}
                      <h2 style={{ fontFamily: "var(--serif)", fontSize: "24px", margin: "6px 0 10px", color: "var(--text)" }}>
                        {renderRich(tr(config.heading, config.headingTh))}
                      </h2>
                      <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.6, maxWidth: "650px" }}>
                        {renderRich(tr(config.note, config.noteTh || config.note))}
                      </p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="span-two">
                      <label>
                        {tr("Hero Wall Heading · English (Rich Text)", "หัวเรื่องผนังฮีโร่ · อังกฤษ (จัดรูปแบบได้)")}
                        <RichTextEditor
                          value={config.heading}
                          onChange={(val) => setConfig({ ...config, heading: val })}
                          placeholder="e.g. A little goodness, every morning."
                          minHeight="90px"
                        />
                      </label>
                    </div>
                    <div className="span-two">
                      <label>
                        {tr("Hero Wall Heading · Thai (Rich Text)", "หัวเรื่องผนังฮีโร่ · ไทย (จัดรูปแบบได้)")}
                        <RichTextEditor
                          value={config.headingTh}
                          onChange={(val) => setConfig({ ...config, headingTh: val })}
                          placeholder="เช่น ความอร่อยเล็ก ๆ ในทุกเช้าของคุณ"
                          minHeight="90px"
                        />
                      </label>
                    </div>
                    <div className="span-two">
                      <label>
                        {tr("Announcement / Special Ticker · English (Rich Text)", "แถบประกาศพิเศษ · อังกฤษ (จัดรูปแบบได้)")}
                        <RichTextEditor
                          value={config.announcement || ""}
                          onChange={(val) => setConfig({ ...config, announcement: val })}
                          placeholder="e.g. Fresh daily batch · Pickups 06:30 – 15:00"
                          minHeight="70px"
                        />
                      </label>
                    </div>
                    <div className="span-two">
                      <label>
                        {tr("Announcement / Special Ticker · Thai (Rich Text)", "แถบประกาศพิเศษ · ไทย (จัดรูปแบบได้)")}
                        <RichTextEditor
                          value={config.announcementTh || ""}
                          onChange={(val) => setConfig({ ...config, announcementTh: val })}
                          placeholder="เช่น ต้มสดใหม่ทุกวัน · รับสินค้า 06:30 – 15:00"
                          minHeight="70px"
                        />
                      </label>
                    </div>
                    <div className="span-two">
                      <label>
                        {tr("Our Story & Philosophy · English (Rich Text)", "เรื่องราวและปรัชญาของเรา · อังกฤษ (จัดรูปแบบได้)")}
                        <RichTextEditor
                          value={config.note}
                          onChange={(val) => setConfig({ ...config, note: val })}
                          placeholder="Tell customers about your kitchen and craft..."
                          minHeight="110px"
                        />
                      </label>
                    </div>
                    <div className="span-two">
                      <label>
                        {tr("Our Story & Philosophy · Thai (Rich Text)", "เรื่องราวและปรัชญาของเรา · ไทย (จัดรูปแบบได้)")}
                        <RichTextEditor
                          value={config.noteTh || ""}
                          onChange={(val) => setConfig({ ...config, noteTh: val })}
                          placeholder="เล่าเรื่องราวความใส่ใจและวัตถุดิบของร้าน..."
                          minHeight="110px"
                        />
                      </label>
                    </div>
                    <div className="span-two">
                      <label>
                        {tr("Hero Wall Image", "รูปภาพผนังฮีโร่")}
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "6px" }}>
                          <img
                            src={config.heroImage || "/images/hero.webp"}
                            alt=""
                            style={{ width: "64px", height: "64px", borderRadius: "8px", objectFit: "cover", border: "1px solid var(--border)" }}
                          />
                          <input
                            type="text"
                            value={config.heroImage || "/images/hero.webp"}
                            onChange={(e) => setConfig({ ...config, heroImage: e.target.value })}
                            placeholder="/images/hero.webp"
                            style={{ flex: 1 }}
                          />
                          <label className="upload-button" style={{ margin: 0 }}>
                            {tr("Upload", "อัปโหลด")}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setConfig({ ...config, heroImage: String(reader.result) });
                                };
                                reader.readAsDataURL(file);
                              }}
                            />
                          </label>
                        </div>
                      </label>
                    </div>
                  </div>
                  <div className="form-footer" style={{ marginTop: "20px" }}>
                    <button className="primary" type="submit">
                      {tr("Save Hero Wall & Story", "บันทึกผนังฮีโร่และเรื่องราว")}
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
      <RealtimeOrderStatusNotifier
        orders={orders}
        onViewReceipt={(ord) => {
          setReceiptOrder(ord);
          setModal("receipt");
        }}
      />
      <BackToTop />
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
            <p>{renderRich(tr(detail.desc, detail.descTh))}</p>
            <div className="detail-pills">
              <span>
                <Leaf size={14} />
                {detail.category === "freshmilk"
                  ? tr("Fresh Dairy", "นมสดแท้")
                  : tr("Plant-based", "จากพืช")}
              </span>
              <span>
                {detail.category === "treat"
                  ? tr("Made fresh", "ทำสดใหม่")
                  : tr("House-brewed", "ต้มสดใหม่")}
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

              {/* Walk-in Counter VS Daily Pickup toggle */}
              <div className="order-type-toggle">
                <button
                  type="button"
                  className={`order-type-btn ${orderType === "walk-in" ? "active" : ""}`}
                  onClick={() => {
                    triggerHaptic("light");
                    setOrderType("walk-in");
                  }}
                >
                  <Store size={14} />
                  {tr("Walk-in Counter (Immediate)", "รับทันทีที่ร้าน (หน้าร้าน)")}
                </button>
                <button
                  type="button"
                  className={`order-type-btn ${orderType === "pickup" ? "active" : ""}`}
                  onClick={() => {
                    triggerHaptic("light");
                    setOrderType("pickup");
                  }}
                >
                  <Clock3 size={14} />
                  {tr("Scheduled Daily Pickup", "จองรับล่วงหน้าประจำวัน")}
                </button>
              </div>

              <div className="form-grid">
                <label>
                  {tr("Your name", "ชื่อของคุณ")} {orderType === "walk-in" ? `(${tr("optional", "ไม่ระบุก็ได้")})` : ""}
                  <input
                    required={orderType === "pickup"}
                    autoComplete="name"
                    minLength={orderType === "pickup" ? 2 : 0}
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
                  {tr("Phone number", "เบอร์โทรศัพท์")} {orderType === "walk-in" ? `(${tr("optional", "ไม่ระบุก็ได้")})` : ""}
                  <input
                    required={orderType === "pickup"}
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
                    {orderType === "walk-in"
                      ? tr("Walk-in Counter Service · Ready in minutes", "บริการหน้าร้าน · พร้อมรับทันที")
                      : tr("One house. One pickup spot.", "บ้านเดียว จุดรับเดียว")}
                  </strong>
                  <p>{tr(config.address, config.addressTh)}</p>
                </div>
              </div>
              {orderType === "pickup" ? (
                pickupFields
              ) : (
                <div style={{
                  padding: "10px 14px",
                  background: "var(--soft-green)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--green)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  margin: "8px 0"
                }}>
                  <span className="green-dot" />
                  {tr(
                    "Walk-in order prepared immediately upon ordering. Pay at counter.",
                    "ออเดอร์หน้าร้านจัดเตรียมทันทีเมื่อสั่ง ชำระเงินสดหรือสแกนที่เคาน์เตอร์"
                  )}
                </div>
              )}
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
                  .filter((p) => p.category === "milk" || p.category === "freshmilk" || p.category === "ginger")
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
      {modal === "receipt" && receiptOrder && (
        <Modal
          title={tr("Order Receipt", "ใบเสร็จคำสั่งซื้อ")}
          close={() => {
            setModal(null);
            setReceiptOrder(null);
          }}
          closeLabel={tr("Close receipt", "ปิดใบเสร็จ")}
        >
          <div className="receipt-paper">
            <div className="receipt-header">
              <Sprout size={28} style={{ color: "var(--green)", margin: "0 auto 6px" }} />
              <h3>WANCHAI SOY MILK HOUSE</h3>
              <p>16 Hai Ya Road, Hai Ya, Chiang Mai 50100</p>
              <p>{tr("Fresh small-batch soy milk & treats", "น้ำเต้าหู้และของว่างสดใหม่ทีละน้อย")}</p>
            </div>
            <div className="receipt-meta">
              <div>
                <strong>{tr("Order No:", "เลขที่:")}</strong> {receiptOrder.id}
              </div>
              <div>
                <strong>{tr("Date:", "วันที่:")}</strong> {formatDate(receiptOrder.date)}
              </div>
            </div>
            <div className="receipt-meta">
              <div>
                <strong>{tr("Customer:", "ลูกค้า:")}</strong> {receiptOrder.name}
              </div>
              <div>
                <strong>{tr("Window:", "ช่วงเวลา:")}</strong> {receiptOrder.window}
              </div>
            </div>
            <div className="receipt-meta">
              <div>
                <strong>{tr("Status:", "สถานะ:")}</strong> {statusLabel(receiptOrder.status)}
              </div>
              <div>
                <strong>{tr("Service:", "ประเภท:")}</strong>{" "}
                {receiptOrder.orderType === "walk-in" || receiptOrder.window?.includes("Walk-in")
                  ? tr("Walk-in Counter", "ลูกค้าหน้าร้าน")
                  : tr("Scheduled Pickup", "รับตามรอบ")}
              </div>
            </div>
            <div className="receipt-meta">
              <div>
                <strong>{tr("Phone:", "โทร:")}</strong> {receiptOrder.phone}
              </div>
            </div>

            {/* Real-time Order Tracking Stepper */}
            <OrderTrackingProgress
              order={receiptOrder}
              onStatusChange={(newStatus) => updateStatus(receiptOrder.id, newStatus)}
              interactive={true}
            />
            <table className="receipt-items-table">
              <thead>
                <tr>
                  <th>{tr("Item", "รายการ")}</th>
                  <th style={{ textAlign: "center" }}>{tr("Qty", "จำนวน")}</th>
                  <th style={{ textAlign: "right" }}>{tr("Price", "ราคา")}</th>
                  <th style={{ textAlign: "right" }}>{tr("Total", "รวม")}</th>
                </tr>
              </thead>
              <tbody>
                {receiptOrder.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{tr(item.name, item.nameTh)}</td>
                    <td style={{ textAlign: "center" }}>{item.qty}</td>
                    <td style={{ textAlign: "right" }}>{money(item.price)}</td>
                    <td style={{ textAlign: "right" }}>{money(item.qty * item.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {receiptOrder.plan && (
              <div className="discount-line" style={{ margin: "6px 0" }}>
                <span>{tr("Weekly plan savings (10%)", "ส่วนลดแพ็กเกจรายสัปดาห์ (10%)")}</span>
                <b>-{money(Math.round((receiptOrder.total / 0.9) * 0.1))}</b>
              </div>
            )}
            <div className="receipt-total-row">
              <span>{tr("Grand Total", "ยอดสุทธิ")}</span>
              <span className="order-total-price-large">{money(receiptOrder.total)}</span>
            </div>
            {receiptOrder.tendered && receiptOrder.tendered > 0 ? (
              <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px dashed #ccc", fontSize: "11px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
                  <span>{tr("Cash Tendered", "เงินสดที่รับ:")}</span>
                  <strong>{money(receiptOrder.tendered)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", margin: "2px 0", color: "#047857" }}>
                  <span>{tr("Change Given", "เงินทอน:")}</span>
                  <strong>{money(receiptOrder.change || 0)}</strong>
                </div>
              </div>
            ) : null}
            {receiptOrder.specialRequests && (
              <div style={{ marginTop: "10px", padding: "8px 12px", background: "#fef3c7", borderRadius: "8px", border: "1px dashed #d97706", fontSize: "12px", textAlign: "left" }}>
                <strong style={{ color: "#b45309", display: "block", marginBottom: "2px" }}>
                  ⚠️ {tr("Special Requests / Allergy Notes:", "คำขอพิเศษ / ข้อมูลการแพ้อาหาร:")}
                </strong>
                <p style={{ margin: 0, color: "#78350f" }}>{receiptOrder.specialRequests}</p>
              </div>
            )}
            <div style={{ margin: "14px 0" }}>
              <QRCodeDisplay
                value={`https://wanchai.house/orders/${receiptOrder.id}`}
                orderId={receiptOrder.id}
                pickupWindow={receiptOrder.window}
                size={140}
              />
            </div>
            <div className="receipt-footer-note">
              <p>{tr("Payment due at pickup (Cash / PromptPay QR)", "ชำระเงินเมื่อรับสินค้า (เงินสด / สแกนคิวอาร์โค้ด)")}</p>
              <p>{tr("Thank you for choosing Wanchai!", "ขอบพระคุณที่อุดหนุนบ้านวันชัยค่ะ")}</p>
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => {
                  window.print();
                }}
              >
                <Download size={14} />
                {tr("Print slip", "พิมพ์ใบเสร็จ")}
              </button>
              <button
                type="button"
                className="primary full"
                onClick={() => {
                  const target = receiptOrder;
                  setModal(null);
                  setReceiptOrder(null);
                  triggerHaptic("light");
                  setReorderTargetOrder(target);
                }}
              >
                <RotateCcw size={14} />
                {tr("Re-order items", "สั่งซ้ำเมนูนี้")}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {/* Add New Product Modal */}
      {isAddingProduct && (
        <Modal
          title={tr("Add New Product", "เพิ่มสินค้าใหม่")}
          close={() => setIsAddingProduct(false)}
          closeLabel={tr("Close add product modal", "ปิดหน้าต่างเพิ่มสินค้า")}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newProduct.en?.trim() || !newProduct.th?.trim()) {
                addToast({
                  type: "warning",
                  message: tr("Please enter both English and Thai names.", "กรุณากรอกชื่อสินค้าทั้งภาษาไทยและอังกฤษ"),
                });
                return;
              }
              const created: Product = {
                id: "prod-" + Date.now(),
                en: newProduct.en.trim(),
                th: newProduct.th.trim(),
                desc: newProduct.desc || "",
                descTh: newProduct.descTh || "",
                price: Number(newProduct.price) || 15,
                stock: Number(newProduct.stock) || 50,
                category: (newProduct.category as Product["category"]) || "milk",
                image: newProduct.image || "/images/hot_soy_milk_bowl_1792747451795.jpg",
                tag: newProduct.tag?.trim() || undefined,
                tagTh: newProduct.tagTh?.trim() || undefined,
              };
              setProducts((prev) => [created, ...prev]);
              setIsAddingProduct(false);
              notifySuccess(
                tr("Product created successfully", "เพิ่มสินค้าสำเร็จแล้ว"),
                tr(`"${created.en}" is now active in the catalog and POS.`, `เพิ่ม "${created.th}" ลงในระบบและจุดขายเรียบร้อยแล้ว`),
              );
            }}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="field-label">{tr("Category", "หมวดหมู่")}</label>
                <select
                  className="full"
                  value={newProduct.category || "milk"}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value as Product["category"] }))}
                >
                  <option value="milk">{tr("Soy milk (น้ำเต้าหู้)", "น้ำเต้าหู้")}</option>
                  <option value="freshmilk">{tr("Fresh milk (นมสด)", "นมสด")}</option>
                  <option value="ginger">{tr("Ginger water (น้ำขิง)", "น้ำขิง")}</option>
                  <option value="treat">{tr("Donuts & bread (ปาท่องโก๋ & ขนมปัง)", "ปาท่องโก๋ & ขนมปัง")}</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label className="field-label">{tr("Price (THB)", "ราคา (บาท)")}</label>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    required
                    value={newProduct.price || 15}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="field-label">{tr("Initial stock", "สต็อกเริ่มต้น")}</label>
                  <input
                    type="number"
                    min="0"
                    max="9999"
                    required
                    value={newProduct.stock || 50}
                    onChange={(e) => setNewProduct((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="field-label">{tr("English name", "ชื่อภาษาอังกฤษ (English)")} *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Soy Milk with Gingko & Sesame Dumplings"
                  value={newProduct.en || ""}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, en: e.target.value }))}
                />
              </div>
              <div>
                <label className="field-label">{tr("Thai name", "ชื่อภาษาไทย (Thai)")} *</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น น้ำเต้าหู้บัวลอยงาดำแปะก๊วย"
                  value={newProduct.th || ""}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, th: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="field-label">{tr("English description (Rich text)", "รายละเอียดภาษาอังกฤษ (Rich text)")}</label>
              <RichTextEditor
                value={newProduct.desc || ""}
                onChange={(val) => setNewProduct((prev) => ({ ...prev, desc: val }))}
                placeholder="Describe product highlights, serving style, or organic beans..."
                ariaLabel="Product English description"
                minHeight="100px"
              />
            </div>

            <div>
              <label className="field-label">{tr("Thai description (Rich text)", "รายละเอียดภาษาไทย (Rich text)")}</label>
              <RichTextEditor
                value={newProduct.descTh || ""}
                onChange={(val) => setNewProduct((prev) => ({ ...prev, descTh: val }))}
                placeholder="รายละเอียดวัตถุดิบ ความหวาน หรือกรรมวิธีคั่วสด..."
                ariaLabel="Product Thai description"
                minHeight="100px"
              />
            </div>

            <div>
              <label className="field-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{tr("Product Image", "รูปภาพสินค้า")} *</span>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>{tr("Upload device photo, paste URL, or select preset", "อัปโหลดรูปจากเครื่อง หรือเลือกตัวอย่าง")}</span>
              </label>

              {/* Upload Drop Zone & Picker */}
              <div
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: "12px",
                  padding: "14px",
                  textAlign: "center",
                  background: "var(--card-subtle, rgba(0,0,0,0.02))",
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => document.getElementById("add-product-file-input")?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith("image/")) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === "string") {
                        setNewProduct((prev) => ({ ...prev, image: reader.result as string }));
                        addToast({ type: "success", message: tr("Image uploaded successfully!", "อัปโหลดรูปภาพเรียบร้อยแล้ว!") });
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              >
                <input
                  id="add-product-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === "string") {
                          setNewProduct((prev) => ({ ...prev, image: reader.result as string }));
                          addToast({ type: "success", message: tr("Image uploaded successfully!", "อัปโหลดรูปภาพเรียบร้อยแล้ว!") });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                {newProduct.image ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", justifyContent: "center" }}>
                    <img
                      src={newProduct.image}
                      alt="Product preview"
                      style={{
                        width: "64px",
                        height: "64px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "2px solid var(--primary, #059669)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    />
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--foreground)" }}>
                        {tr("Photo Selected", "เลือกรูปภาพแล้ว")}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                        {tr("Click or drop to replace photo", "คลิกหรือลากวางเพื่อเปลี่ยนรูปใหม่")}
                      </div>
                      <button
                        type="button"
                        className="secondary"
                        style={{ padding: "3px 8px", fontSize: "11px", marginTop: "4px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewProduct((prev) => ({ ...prev, image: "" }));
                        }}
                      >
                        <Trash2 size={12} style={{ marginRight: "4px" }} />
                        {tr("Remove photo", "ลบรูป")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: "8px", color: "var(--primary, #059669)" }}>
                      <Upload size={22} />
                      <Camera size={22} />
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "13px" }}>
                        {tr("Click to upload product image", "คลิกเพื่ออัปโหลดรูปสินค้า")}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>
                        {tr("Supports PNG, JPG, WebP, Camera capture or Drag & Drop", "รองรับไฟล์ PNG, JPG, WebP ถ่ายรูป หรือลากไฟล์มาวาง")}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Direct URL input alternative */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input
                  type="text"
                  placeholder={tr("Or enter image URL / path (/images/...)", "หรือใส่ URL / ที่อยู่ไฟล์รูป")}
                  value={newProduct.image || ""}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, image: e.target.value }))}
                />
              </div>

              {/* Preset buttons */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", fontSize: "11px" }}>
                <span style={{ color: "var(--muted)", alignSelf: "center" }}>{tr("Presets:", "ตัวอย่าง:")}</span>
                {[
                  { label: tr("Soy bowl", "น้ำเต้าหู้"), path: "/images/hot_soy_milk_bowl_1792747451795.jpg" },
                  { label: tr("Dumplings", "บัวลอย"), path: "/images/sesame_dumpling_milk_1792747451641.jpg" },
                  { label: tr("Ginger", "น้ำขิง"), path: "/images/ginger_tofu_pudding_1792747451451.jpg" },
                  { label: tr("Youtiao", "ปาท่องโก๋"), path: "/images/youtiao_pandan_dip_1792747449551.jpg" },
                  { label: tr("Steamed bread", "ขนมปังนึ่ง"), path: "/images/steamed_bread_kaya_1792747450824.jpg" },
                  { label: tr("Original menu", "เมนูจริง"), path: "/assets/aistudio/Menu-Taofu_5311a441.jpg" },
                ].map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    className="secondary"
                    style={{ padding: "3px 8px", fontSize: "11px" }}
                    onClick={() => setNewProduct((prev) => ({ ...prev, image: item.path }))}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="field-label">{tr("Badge / Tag (EN, Optional)", "ป้ายกำกับภาษาอังกฤษ (ถ้ามี)")}</label>
                <input
                  type="text"
                  placeholder="e.g. POPULAR, NEW, ORGANIC"
                  value={newProduct.tag || ""}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, tag: e.target.value }))}
                />
              </div>
              <div>
                <label className="field-label">{tr("Badge / Tag (TH, Optional)", "ป้ายกำกับภาษาไทย (ถ้ามี)")}</label>
                <input
                  type="text"
                  placeholder="เช่น ยอดนิยม, เมนูใหม่"
                  value={newProduct.tagTh || ""}
                  onChange={(e) => setNewProduct((prev) => ({ ...prev, tagTh: e.target.value }))}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => setIsAddingProduct(false)}
              >
                {tr("Cancel", "ยกเลิก")}
              </button>
              <button type="submit" className="primary full">
                <PlusCircle size={15} />
                {tr("Save & Publish Product", "บันทึกและเผยแพร่สินค้า")}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <Modal
          title={tr(`Edit: ${editingProduct.en}`, `แก้ไข: ${editingProduct.th}`)}
          close={() => setEditingProduct(null)}
          closeLabel={tr("Close edit modal", "ปิดหน้าต่างแก้ไข")}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!editingProduct.en.trim() || !editingProduct.th.trim()) {
                addToast({
                  type: "warning",
                  message: tr("Please enter both English and Thai names.", "กรุณากรอกชื่อสินค้าทั้งภาษาไทยและอังกฤษ"),
                });
                return;
              }
              setProducts((prev) =>
                prev.map((p) => (p.id === editingProduct.id ? editingProduct : p))
              );
              setEditingProduct(null);
              notifySuccess(
                tr("Product updated", "อัปเดตสินค้าสำเร็จ"),
                tr(`Changes to "${editingProduct.en}" saved.`, `บันทึกการแก้ไข "${editingProduct.th}" แล้ว`),
              );
            }}
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="field-label">{tr("Category", "หมวดหมู่")}</label>
                <select
                  className="full"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct((prev) => prev ? ({ ...prev, category: e.target.value as Product["category"] }) : null)}
                >
                  <option value="milk">{tr("Soy milk (น้ำเต้าหู้)", "น้ำเต้าหู้")}</option>
                  <option value="freshmilk">{tr("Fresh milk (นมสด)", "นมสด")}</option>
                  <option value="ginger">{tr("Ginger water (น้ำขิง)", "น้ำขิง")}</option>
                  <option value="treat">{tr("Donuts & bread (ปาท่องโก๋ & ขนมปัง)", "ปาท่องโก๋ & ขนมปัง")}</option>
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label className="field-label">{tr("Price (THB)", "ราคา (บาท)")}</label>
                  <input
                    type="number"
                    min="1"
                    max="9999"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct((prev) => prev ? ({ ...prev, price: Number(e.target.value) }) : null)}
                  />
                </div>
                <div>
                  <label className="field-label">{tr("Stock", "สต็อก")}</label>
                  <input
                    type="number"
                    min="0"
                    max="9999"
                    required
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct((prev) => prev ? ({ ...prev, stock: Number(e.target.value) }) : null)}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="field-label">{tr("English name", "ชื่อภาษาอังกฤษ (English)")} *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.en}
                  onChange={(e) => setEditingProduct((prev) => prev ? ({ ...prev, en: e.target.value }) : null)}
                />
              </div>
              <div>
                <label className="field-label">{tr("Thai name", "ชื่อภาษาไทย (Thai)")} *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.th}
                  onChange={(e) => setEditingProduct((prev) => prev ? ({ ...prev, th: e.target.value }) : null)}
                />
              </div>
            </div>

            <div>
              <label className="field-label">{tr("English description (Rich text)", "รายละเอียดภาษาอังกฤษ (Rich text)")}</label>
              <RichTextEditor
                value={editingProduct.desc || ""}
                onChange={(val) => setEditingProduct((prev) => prev ? ({ ...prev, desc: val }) : null)}
                placeholder="Describe product highlights..."
                ariaLabel="Product English description"
                minHeight="100px"
              />
            </div>

            <div>
              <label className="field-label">{tr("Thai description (Rich text)", "รายละเอียดภาษาไทย (Rich text)")}</label>
              <RichTextEditor
                value={editingProduct.descTh || ""}
                onChange={(val) => setEditingProduct((prev) => prev ? ({ ...prev, descTh: val }) : null)}
                placeholder="รายละเอียดสินค้า..."
                ariaLabel="Product Thai description"
                minHeight="100px"
              />
            </div>

            <div>
              <label className="field-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{tr("Product Image", "รูปภาพสินค้า")} *</span>
                <span style={{ fontSize: "11px", color: "var(--muted)" }}>{tr("Upload device photo, paste URL, or select preset", "อัปโหลดรูปจากเครื่อง หรือเลือกตัวอย่าง")}</span>
              </label>

              {/* Upload Drop Zone & Picker */}
              <div
                style={{
                  border: "2px dashed var(--border)",
                  borderRadius: "12px",
                  padding: "14px",
                  textAlign: "center",
                  background: "var(--card-subtle, rgba(0,0,0,0.02))",
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onClick={() => document.getElementById("edit-product-file-input")?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file && file.type.startsWith("image/")) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === "string") {
                        setEditingProduct((prev) => prev ? ({ ...prev, image: reader.result as string }) : null);
                        addToast({ type: "success", message: tr("Image updated successfully!", "อัปเดตรูปภาพเรียบร้อยแล้ว!") });
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              >
                <input
                  id="edit-product-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === "string") {
                          setEditingProduct((prev) => prev ? ({ ...prev, image: reader.result as string }) : null);
                          addToast({ type: "success", message: tr("Image updated successfully!", "อัปเดตรูปภาพเรียบร้อยแล้ว!") });
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                {editingProduct.image ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", justifyContent: "center" }}>
                    <img
                      src={editingProduct.image}
                      alt="Product preview"
                      style={{
                        width: "64px",
                        height: "64px",
                        objectFit: "cover",
                        borderRadius: "10px",
                        border: "2px solid var(--primary, #059669)",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                    />
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--foreground)" }}>
                        {tr("Photo Selected", "เลือกรูปภาพแล้ว")}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--muted)" }}>
                        {tr("Click or drop to replace photo", "คลิกหรือลากวางเพื่อเปลี่ยนรูปใหม่")}
                      </div>
                      <button
                        type="button"
                        className="secondary"
                        style={{ padding: "3px 8px", fontSize: "11px", marginTop: "4px" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProduct((prev) => prev ? ({ ...prev, image: "" }) : null);
                        }}
                      >
                        <Trash2 size={12} style={{ marginRight: "4px" }} />
                        {tr("Remove photo", "ลบรูป")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: "8px", color: "var(--primary, #059669)" }}>
                      <Upload size={22} />
                      <Camera size={22} />
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: "13px" }}>
                        {tr("Click to upload product image", "คลิกเพื่ออัปโหลดรูปสินค้า")}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--muted)", display: "block" }}>
                        {tr("Supports PNG, JPG, WebP, Camera capture or Drag & Drop", "รองรับไฟล์ PNG, JPG, WebP ถ่ายรูป หรือลากไฟล์มาวาง")}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Direct URL input alternative */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input
                  type="text"
                  placeholder={tr("Or enter image URL / path (/images/...)", "หรือใส่ URL / ที่อยู่ไฟล์รูป")}
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct((prev) => prev ? ({ ...prev, image: e.target.value }) : null)}
                />
              </div>

              {/* Preset buttons */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", fontSize: "11px" }}>
                <span style={{ color: "var(--muted)", alignSelf: "center" }}>{tr("Presets:", "ตัวอย่าง:")}</span>
                {[
                  { label: tr("Soy bowl", "น้ำเต้าหู้"), path: "/images/hot_soy_milk_bowl_1792747451795.jpg" },
                  { label: tr("Dumplings", "บัวลอย"), path: "/images/sesame_dumpling_milk_1792747451641.jpg" },
                  { label: tr("Ginger", "น้ำขิง"), path: "/images/ginger_tofu_pudding_1792747451451.jpg" },
                  { label: tr("Youtiao", "ปาท่องโก๋"), path: "/images/youtiao_pandan_dip_1792747449551.jpg" },
                  { label: tr("Steamed bread", "ขนมปังนึ่ง"), path: "/images/steamed_bread_kaya_1792747450824.jpg" },
                  { label: tr("Original menu", "เมนูจริง"), path: "/assets/aistudio/Menu-Taofu_5311a441.jpg" },
                ].map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    className="secondary"
                    style={{ padding: "3px 8px", fontSize: "11px" }}
                    onClick={() => setEditingProduct((prev) => prev ? ({ ...prev, image: item.path }) : null)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label className="field-label">{tr("Badge / Tag (EN)", "ป้ายกำกับภาษาอังกฤษ")}</label>
                <input
                  type="text"
                  placeholder="e.g. POPULAR, HOT"
                  value={editingProduct.tag || ""}
                  onChange={(e) => setEditingProduct((prev) => prev ? ({ ...prev, tag: e.target.value }) : null)}
                />
              </div>
              <div>
                <label className="field-label">{tr("Badge / Tag (TH)", "ป้ายกำกับภาษาไทย")}</label>
                <input
                  type="text"
                  placeholder="เช่น ยอดนิยม, เมนูแนะนำ"
                  value={editingProduct.tagTh || ""}
                  onChange={(e) => setEditingProduct((prev) => prev ? ({ ...prev, tagTh: e.target.value }) : null)}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => setEditingProduct(null)}
              >
                {tr("Cancel", "ยกเลิก")}
              </button>
              <button type="submit" className="primary full">
                <Check size={15} />
                {tr("Save Changes", "บันทึกข้อมูล")}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <Modal
          title={tr("Delete Product", "ยืนยันการลบสินค้า")}
          close={() => setDeletingProduct(null)}
          closeLabel={tr("Close delete confirmation", "ปิดหน้าต่างยืนยันการลบ")}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "center", padding: "12px", background: "var(--surface-warm)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
              <img
                src={deletingProduct.image}
                alt=""
                style={{ width: "54px", height: "54px", objectFit: "cover", borderRadius: "8px", border: "1px solid var(--border)" }}
              />
              <div>
                <strong style={{ fontSize: "16px", display: "block" }}>{pname(deletingProduct)}</strong>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                  {money(deletingProduct.price)} · {tr(`Stock: ${deletingProduct.stock}`, `คงเหลือ: ${deletingProduct.stock}`)}
                </span>
              </div>
            </div>
            <p style={{ color: "#b91c1c", fontSize: "13px", lineHeight: "1.5" }}>
              {tr(
                "Are you sure you want to remove this product? It will be removed from the online customer catalog, POS register, and kitchen tickets.",
                "คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้? สินค้าจะถูกนำออกจากหน้าร้าน ระบบจุดขาย (POS) และรายการในครัว",
              )}
            </p>
            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button
                type="button"
                className="secondary full"
                onClick={() => setDeletingProduct(null)}
              >
                {tr("Cancel", "ยกเลิก")}
              </button>
              <button
                type="button"
                className="primary full"
                style={{ background: "#dc2626", borderColor: "#b91c1c", color: "#fff" }}
                onClick={() => {
                  const idToRemove = deletingProduct.id;
                  const nameToRemove = pname(deletingProduct);
                  setProducts((prev) => prev.filter((p) => p.id !== idToRemove));
                  setCart((prev) => prev.filter((item) => item.id !== idToRemove));
                  setDeletingProduct(null);
                  notify(tr(`Removed "${nameToRemove}" from menu.`, `ลบ "${nameToRemove}" ออกจากเมนูแล้ว`));
                }}
              >
                <Trash2 size={15} />
                {tr("Confirm Delete", "ยืนยันการลบ")}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Slide-out Cart Drawer with Special Requests & Allergies */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cart={cart}
        products={products}
        orderType={orderType}
        setOrderType={setOrderType}
        specialRequests={specialRequests}
        setSpecialRequests={setSpecialRequests}
        onAdd={add}
        onChangeQty={changeQty}
        onCheckout={() => {
          setIsCartDrawerOpen(false);
          openCheckout();
        }}
        plan={plan}
        money={money}
        pickupFields={pickupFields}
      />

      {/* Collapsible Staff & Admin Operations Drawer */}
      <AdminDrawer
        isOpen={isAdminDrawerOpen}
        onClose={() => setIsAdminDrawerOpen(false)}
        currentView={view}
        onSelectView={(v) => go(v)}
        adminTab={adminTab}
        onSelectAdminTab={(tab) => setAdminTab(tab)}
        onExportCSV={() => exportOrdersToCSV(orders)}
        lowStockCount={products.filter((p) => isLowStock(p, LOW_STOCK_THRESHOLD)).length}
        kitchenPendingCount={orders.filter((o) => o.status !== "collected").length}
      />

      {/* Spreadsheet & CSV Inventory Import Modal */}
      <InventoryImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        products={products}
        onApplyUpdates={(updated) => {
          setProducts(updated);
        }}
        onNotify={(title, message) => {
          notifySuccess(title, message);
        }}
      />

      {/* Customer Quick Reorder Confirmation Modal */}
      <ReorderConfirmModal
        isOpen={Boolean(reorderTargetOrder)}
        order={reorderTargetOrder}
        products={products}
        onConfirm={(target) => {
          reorder(target);
          setReorderTargetOrder(null);
        }}
        onClose={() => setReorderTargetOrder(null)}
        money={money}
      />

      {/* Real-time Order Confirmation & Visual Progress Stepper Modal */}
      <OrderConfirmationModal
        isOpen={Boolean(confirmedOrder)}
        order={confirmedOrder}
        onClose={() => setConfirmedOrder(null)}
        onViewOrders={() => {
          setConfirmedOrder(null);
          go("history");
        }}
        onReorder={(target) => {
          setConfirmedOrder(null);
          setReorderTargetOrder(target);
        }}
        onStatusChange={(newStatus) => {
          if (confirmedOrder) {
            updateStatus(confirmedOrder.id, newStatus);
            setConfirmedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
          }
        }}
        money={money}
        formatDate={formatDate}
      />
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

import { useState } from "react";
export function useSaved<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem("wanchai-v2-" + key);
      return item ? (JSON.parse(item) as T) : initial;
    } catch {
      return initial;
    }
  });
  const update = (next: T | ((old: T) => T)) =>
    setValue((old) => {
      const result =
        typeof next === "function" ? (next as (old: T) => T)(old) : next;
      try {
        localStorage.setItem("wanchai-v2-" + key, JSON.stringify(result));
      } catch {
        console.warn("Device storage is unavailable");
      }
      return result;
    });
  return [value, update] as const;
}
export type Product = {
  id: string;
  en: string;
  th: string;
  desc: string;
  descTh: string;
  price: number;
  stock: number;
  image: string;
  category: "milk" | "treat";
  tag?: string;
  tagTh?: string;
};
export type CartItem = { id: string; qty: number };
export type Order = {
  id: string;
  items: { name: string; nameTh: string; qty: number; price: number }[];
  total: number;
  date: string;
  window: string;
  name: string;
  phone: string;
  status: "received" | "preparing" | "ready" | "collected";
  created: string;
  plan: boolean;
};
export type Subscription = {
  id: string;
  product: string;
  count: number;
  date: string;
  window: string;
  active: boolean;
  name: string;
};
export const initialProducts: Product[] = [
  {
    id: "original",
    en: "Original Soy Milk",
    th: "น้ำเต้าหู้สูตรดั้งเดิม",
    desc: "Simple, creamy. The one that started it all.",
    descTh: "หอมมัน หวานน้อย สูตรดั้งเดิมของบ้านเรา",
    price: 35,
    stock: 48,
    image: "/images/soy-milk.jpg",
    category: "milk",
    tag: "HOUSE FAVORITE",
    tagTh: "เมนูขายดี",
  },
  {
    id: "sesame",
    en: "Black Sesame Soy",
    th: "น้ำเต้าหู้งาดำ",
    desc: "Nutty, roasted sesame. A little comfort.",
    descTh: "หอมงาดำคั่ว อุ่นใจทุกครั้งที่ดื่ม",
    price: 45,
    stock: 32,
    image: "/images/sesame-product.webp",
    category: "milk",
    tag: "SMALL-BATCH",
    tagTh: "ทำสดจำนวนจำกัด",
  },
  {
    id: "matcha",
    en: "Matcha Soy Latte",
    th: "มัทฉะลาเต้น้ำเต้าหู้",
    desc: "Earthy Uji matcha meets silky soy.",
    descTh: "มัทฉะอุจิแท้กับน้ำเต้าหู้เนื้อนุ่ม ไม่หวาน",
    price: 65,
    stock: 20,
    image: "/images/matcha.jpg",
    category: "milk",
    tag: "UNSWEETENED",
    tagTh: "ไม่เติมน้ำตาล",
  },
  {
    id: "ginger",
    en: "Ginger Brown Sugar",
    th: "น้ำเต้าหู้ขิงน้ำตาลทรายแดง",
    desc: "Fresh ginger, a gently sweet finish.",
    descTh: "ขิงสดหอมละมุนกับน้ำตาลทรายแดง",
    price: 40,
    stock: 15,
    image: "/images/soy-milk.jpg",
    category: "milk",
  },
  {
    id: "pudding",
    en: "Tofu Pudding",
    th: "เต้าฮวยน้ำขิง",
    desc: "Silky douhua with warming ginger syrup.",
    descTh: "เต้าฮวยเนื้อนุ่มละมุนในน้ำขิงอุ่น",
    price: 30,
    stock: 25,
    image: "/images/pudding.jpg",
    category: "treat",
  },
  {
    id: "youtiao",
    en: "Youtiao · 2 pieces",
    th: "ปาท่องโก๋ · 2 ชิ้น",
    desc: "Golden, crisp, made for dipping.",
    descTh: "ทอดสด กรอบนอกนุ่มใน เหมาะกับน้ำเต้าหู้",
    price: 25,
    stock: 60,
    image: "/images/youtiao.jpg",
    category: "treat",
  },
];
export const defaultConfig = {
  capacity: 20,
  audio: true,
  haptic: "soft",
  address: "16 Hai Ya Road, Hai Ya, Chiang Mai 50100",
  addressTh: "บ้านไชยวุฒิเครื่องเงิน 16 ถนนหายยา เชียงใหม่ 50100",
  heading: "A little goodness,\nevery morning.",
  headingTh: "ความอร่อยเล็ก ๆ\nในทุกเช้าของคุณ",
  note: "Freshly made. Thoughtfully simple. Our small-batch soy milk is a little daily ritual, made right here in Chiang Mai.",
};
export const windows = [
  "06:30 – 08:00",
  "08:00 – 10:00",
  "10:00 – 12:00",
  "12:00 – 15:00",
];
export function dates() {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() + (i + 1) * 86400000);
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  });
}
export function chime(enabled: boolean, ready = false) {
  if (!enabled) return;
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    [ready ? 880 : 660, ready ? 1109 : 880].forEach((frequency, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.055, now + i * 0.15 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.5);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.55);
    });
    setTimeout(() => {
      void ctx.close();
    }, 1000);
  } catch {
    /* Audio is optional when browser permissions prevent playback. */
  }
}

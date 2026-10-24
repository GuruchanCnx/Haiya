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
  category: "milk" | "freshmilk" | "ginger" | "treat";
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
  orderType?: "walk-in" | "pickup";
  tendered?: number;
  change?: number;
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
  // --- SNACKS & BREAD (ปาท่องโก๋ & ขนมปัง) ---
  {
    id: "youtiao-single",
    en: "Chinese Donut (Youtiao)",
    th: "ปาท่องโก๋ (1 ชิ้น)",
    desc: "Golden crispy fried Chinese cruller (1 pc).",
    descTh: "ปาท่องโก๋ทอดสดใหม่ กรอบนอกนุ่มใน ไม่อมน้ำมัน (ชิ้นละ)",
    price: 1,
    stock: 200,
    image: "/images/youtiao.jpg",
    category: "treat",
  },
  {
    id: "pandan-sauce",
    en: "Pandan Kaya Sauce Dip",
    th: "สังขยาใบเตย",
    desc: "Aromatic coconut pandan custard dip.",
    descTh: "สังขยาใบเตยแท้ หอมมัน กลมกล่อม",
    price: 10,
    stock: 50,
    image: "/images/youtiao_pandan_dip_1792747449551.jpg",
    category: "treat",
  },
  {
    id: "condensed-milk",
    en: "Sweet Condensed Milk Dip",
    th: "นมข้นหวาน",
    desc: "Classic sweet rich condensed milk dipping sauce.",
    descTh: "นมข้นหวานเข้มข้น หวานมันเข้ากันดี",
    price: 10,
    stock: 50,
    image: "/images/steamed_bread_kaya_1792747450824.jpg",
    category: "treat",
  },
  {
    id: "youtiao-pandan-set",
    en: "Chinese Donuts with Pandan Sauce",
    th: "ปาท่องโก๋สังขยา",
    desc: "Crispy youtiao served with silky fragrant pandan kaya sauce.",
    descTh: "ปาท่องโก๋กรอบนอกนุ่มใน เสิร์ฟพร้อมสังขยาใบเตยหอมละมุน",
    price: 20,
    stock: 60,
    image: "/images/youtiao_pandan_dip_1792747449551.jpg",
    category: "treat",
    tag: "POPULAR",
    tagTh: "ยอดนิยม",
  },
  {
    id: "youtiao-condensed-set",
    en: "Chinese Donuts with Condensed Milk",
    th: "ปาท่องโก๋นมข้น",
    desc: "Crisp golden youtiao served with sweetened condensed milk.",
    descTh: "ปาท่องโก๋ทอดกรอบเสิร์ฟคู่กับนมข้นหวาน",
    price: 20,
    stock: 50,
    image: "/images/youtiao.jpg",
    category: "treat",
  },
  {
    id: "youtiao-stuffed-milk",
    en: "Chinese Donuts Stuffed with Condensed Milk",
    th: "ปาท่องโก๋ไส้นมข้น",
    desc: "Sliced youtiao generously stuffed and drizzled with sweet condensed milk.",
    descTh: "ปาท่องโก๋ผ่าไส้ราดด้วยนมข้นหวานฉ่ำ",
    price: 10,
    stock: 40,
    image: "/images/youtiao.jpg",
    category: "treat",
  },
  {
    id: "youtiao-stuffed-pandan",
    en: "Chinese Donuts Stuffed with Pandan Sauce",
    th: "ปาท่องโก๋ไส้สังขยา",
    desc: "Sliced crispy youtiao filled with smooth aromatic pandan custard.",
    descTh: "ปาท่องโก๋ผ่าไส้สอดไส้สังขยาใบเตยเนื้อเนียน",
    price: 10,
    stock: 40,
    image: "/images/youtiao_pandan_dip_1792747449551.jpg",
    category: "treat",
  },
  {
    id: "bread-condensed",
    en: "Steamed Bread with Condensed Milk",
    th: "ขนมปังนมข้น",
    desc: "Soft steamed cubed bread served with rich condensed milk dip.",
    descTh: "ขนมปังนึ่งนุ่มร้อน ๆ หั่นชิ้นพอดีคำ จิ้มนมข้นหวาน",
    price: 25,
    stock: 35,
    image: "/images/steamed_bread_kaya_1792747450824.jpg",
    category: "treat",
  },
  {
    id: "bread-pandan",
    en: "Steamed Bread with Pandan Sauce",
    th: "ขนมปังสังขยา",
    desc: "Warm steamed fluffy bread with authentic fragrant pandan kaya custard dip.",
    descTh: "ขนมปังนึ่งนุ่มฟู เสิร์ฟพร้อมสังขยาใบเตยเข้มข้นหอมกรุ่น",
    price: 25,
    stock: 35,
    image: "/images/steamed_bread_kaya_1792747450824.jpg",
    category: "treat",
    tag: "HOUSE FAVORITE",
    tagTh: "เมนูโปรด",
  },

  // --- SOY MILK (น้ำเต้าหู้) ---
  {
    id: "soy-hot",
    en: "Hot Soy Milk",
    th: "น้ำเต้าหู้ร้อน",
    desc: "Fresh, smooth, small-batch boiled hot soy milk.",
    descTh: "น้ำเต้าหู้แท้ต้มสดร้อน ๆ หอมมันธรรมชาติ หวานน้อย",
    price: 10,
    stock: 80,
    image: "/images/hot_soy_milk_bowl_1792747451795.jpg",
    category: "milk",
    tag: "MORNING RITUAL",
    tagTh: "ต้มสดทุกเช้า",
  },
  {
    id: "soy-cold",
    en: "Cold Soy Milk",
    th: "น้ำเต้าหู้เย็น",
    desc: "Chilled pure fresh soy milk, smooth and refreshing.",
    descTh: "น้ำเต้าหู้เย็นสดชื่น ดับกระหาย หอมมันลงตัว",
    price: 15,
    stock: 60,
    image: "/images/soy-milk.jpg",
    category: "milk",
  },
  {
    id: "soy-pudding",
    en: "Soy Milk with Tofu Pudding",
    th: "น้ำเต้าหู้ใส่เนื้อเต้าฮวย",
    desc: "Silky soft douhua tofu pudding served in warm soy milk.",
    descTh: "น้ำเต้าหู้ร้อนใส่เนื้อเต้าฮวยนุ่มละลายในปาก",
    price: 15,
    stock: 45,
    image: "/images/hot_soy_milk_bowl_1792747451795.jpg",
    category: "milk",
  },
  {
    id: "soy-jelly-barley",
    en: "Soy Milk with Jelly, Basil Seeds & Barley",
    th: "น้ำเต้าหู้วุ้นแมงลักบาร์เล่ต์",
    desc: "Fresh soy milk with grass jelly, basil seeds, and tender pearl barley.",
    descTh: "น้ำเต้าหู้ใส่เครื่อง วุ้น เม็ดแมงลัก และลูกเดือยบาร์เล่ต์",
    price: 15,
    stock: 40,
    image: "/images/hot_soy_milk_bowl_1792747451795.jpg",
    category: "milk",
  },
  {
    id: "soy-sesame-dumplings",
    en: "Soy Milk with Black Sesame Dumplings",
    th: "น้ำเต้าหู้บัวลอยงาดำ",
    desc: "Warm soy milk with chewy dumplings filled with molten roasted sesame.",
    descTh: "น้ำเต้าหู้ร้อนใส่บัวลอยงาดำลาวา หอมงาคั่วเข้มข้น",
    price: 25,
    stock: 40,
    image: "/images/sesame_dumpling_milk_1792747451641.jpg",
    category: "milk",
    tag: "RECOMMENDED",
    tagTh: "แนะนำ",
  },
  {
    id: "soy-black-sesame",
    en: "Black Sesame Soy Milk",
    th: "น้ำเต้าหู้งาดำ",
    desc: "Soy milk infused with fragrant pure roasted black sesame.",
    descTh: "น้ำเต้าหู้ผสมงาดำคั่วบดเข้มข้น หอมมันสุขภาพดี",
    price: 15,
    stock: 45,
    image: "/images/sesame-product.webp",
    category: "milk",
  },
  {
    id: "soy-ovaltine",
    en: "Soy Milk with Ovaltine",
    th: "น้ำเต้าหู้โอวัลติน",
    desc: "Rich malty chocolate Ovaltine swirled into warm soy milk.",
    descTh: "น้ำเต้าหู้ผสมโอวัลติน หอมมอลต์ช็อกโกแลตเข้มข้น",
    price: 15,
    stock: 35,
    image: "/images/soy-milk.jpg",
    category: "milk",
  },
  {
    id: "soy-ginkgo",
    en: "Soy Milk with Ginkgo Nuts",
    th: "น้ำเต้าหู้แปะก๊วย",
    desc: "Warm soy milk with sweet, tender ginkgo nuts.",
    descTh: "น้ำเต้าหู้ใส่เม็ดแปะก๊วยต้มเชื่อมหนึบหนับ บำรุงร่างกาย",
    price: 25,
    stock: 30,
    image: "/images/hot_soy_milk_bowl_1792747451795.jpg",
    category: "milk",
  },
  {
    id: "soy-tao-tung",
    en: "Soy Milk Tao Tung (Assorted Sweet Grains)",
    th: "น้ำเต้าหู้เต้าทึง",
    desc: "Traditional Chinese assorted grains and fruits in hot soy milk.",
    descTh: "น้ำเต้าหู้เต้าทึงรวมมิตร เครื่องแน่นหวานอร่อย",
    price: 25,
    stock: 30,
    image: "/images/hot_soy_milk_bowl_1792747451795.jpg",
    category: "milk",
  },
  {
    id: "soy-combo-deluxe",
    en: "Soy Milk Royal Combo (Dumplings & Full Toppings)",
    th: "น้ำเต้าหู้บัวลอยลูกชิดพุทราแปะก๊วยรากบัว",
    desc: "Complete royal bowl: black sesame dumplings, palm fruit, jujube, ginkgo and lotus root in soy milk.",
    descTh: "น้ำเต้าหู้ทรงเครื่องพิเศษ บัวลอยงาดำ ลูกชิด พุทราจีน แปะก๊วย และรากบัว",
    price: 25,
    stock: 25,
    image: "/images/sesame_dumpling_milk_1792747451641.jpg",
    category: "milk",
    tag: "FULL TOPPINGS",
    tagTh: "เครื่องครบเซ็ต",
  },

  // --- FRESH MILK (นมสด) ---
  {
    id: "fresh-milk-hot",
    en: "Hot Fresh Milk",
    th: "นมสดร้อน",
    desc: "Warm, rich, pure cow's milk steamed fresh to order.",
    descTh: "นมสดแท้ 100% ต้มร้อน หอมมันละมุนลิ้น",
    price: 15,
    stock: 50,
    image: "/images/sesame_dumpling_milk_1792747451641.jpg",
    category: "freshmilk",
  },
  {
    id: "fresh-milk-cold",
    en: "Cold Fresh Milk",
    th: "นมสดเย็น",
    desc: "Chilled fresh farm milk, thirst-quenching and smooth.",
    descTh: "นมสดเย็นแท้ 100% หอมมัน สดชื่น",
    price: 25,
    stock: 45,
    image: "/images/sesame_dumpling_milk_1792747451641.jpg",
    category: "freshmilk",
  },
  {
    id: "fresh-milk-pudding",
    en: "Fresh Milk with Tofu Pudding",
    th: "นมสดเนื้อเต้าฮวย",
    desc: "Silky soft tofu pudding in a bowl of creamy fresh milk.",
    descTh: "นมสดแท้เสิร์ฟพร้อมเนื้อเต้าฮวยนุ่มละลายในปาก",
    price: 20,
    stock: 35,
    image: "/images/pudding.jpg",
    category: "freshmilk",
  },
  {
    id: "fresh-milk-jelly-barley",
    en: "Fresh Milk with Jelly, Basil Seeds & Barley",
    th: "นมสดวุ้นแมงลักบาร์เล่ต์",
    desc: "Fresh milk with grass jelly, tender barley grains, and basil seeds.",
    descTh: "นมสดใส่เครื่องวุ้น เม็ดแมงลัก และลูกเดือยบาร์เล่ต์",
    price: 20,
    stock: 35,
    image: "/images/sesame_dumpling_milk_1792747451641.jpg",
    category: "freshmilk",
  },
  {
    id: "fresh-milk-sesame-dumplings",
    en: "Fresh Milk with Black Sesame Dumplings",
    th: "นมสดบัวลอยงาดำ",
    desc: "Molten black sesame stuffed dumplings swimming in hot fresh milk.",
    descTh: "นมสดร้อนใส่บัวลอยงาดำลาวา ไส้ทะลักหอมมัน",
    price: 30,
    stock: 35,
    image: "/images/sesame_dumpling_milk_1792747451641.jpg",
    category: "freshmilk",
    tag: "BESTSELLER",
    tagTh: "ขายดี",
  },
  {
    id: "fresh-milk-black-sesame",
    en: "Fresh Milk with Black Sesame",
    th: "นมสดใส่งาดำ",
    desc: "Fresh cow milk blended with aromatic roasted black sesame.",
    descTh: "นมสดผสมงาดำคั่วบดเข้มข้น หอมละมุน",
    price: 20,
    stock: 30,
    image: "/images/sesame-product.webp",
    category: "freshmilk",
  },
  {
    id: "fresh-milk-ovaltine",
    en: "Fresh Milk with Ovaltine",
    th: "นมสดโอวัลติน",
    desc: "Creamy fresh milk swirled with chocolate malt Ovaltine.",
    descTh: "นมสดผสมโอวัลติน ช็อกโกแลตมอลต์รสเข้มข้น",
    price: 20,
    stock: 30,
    image: "/images/sesame_dumpling_milk_1792747451641.jpg",
    category: "freshmilk",
  },
  {
    id: "fresh-milk-ginkgo",
    en: "Fresh Milk with Ginkgo Nuts",
    th: "นมสดแปะก๊วย",
    desc: "Sweet glazed ginkgo nuts in warm velvety fresh milk.",
    descTh: "นมสดร้อนใส่เม็ดแปะก๊วยเชื่อม หวานมันเคี้ยวเพลิน",
    price: 30,
    stock: 25,
    image: "/images/sesame_dumpling_milk_1792747451641.jpg",
    category: "freshmilk",
  },
  {
    id: "fresh-milk-tao-tung",
    en: "Fresh Milk Tao Tung",
    th: "นมสดเต้าทึง",
    desc: "Assorted sweet grains and fruits in hot creamy fresh milk.",
    descTh: "นมสดเต้าทึงรวมมิตร เครื่องแน่นหวานอร่อย",
    price: 30,
    stock: 25,
    image: "/images/sesame_dumpling_milk_1792747451641.jpg",
    category: "freshmilk",
  },
  {
    id: "fresh-milk-combo-deluxe",
    en: "Fresh Milk Royal Combo (Dumplings & Full Toppings)",
    th: "นมสดบัวลอยลูกชิดพุทราแปะก๊วยรากบัว",
    desc: "Deluxe bowl: black sesame dumplings, palm fruit, jujube, ginkgo and lotus root in fresh milk.",
    descTh: "นมสดเครื่องล้น บัวลอยงาดำ ลูกชิด พุทราจีน แปะก๊วย และรากบัว",
    price: 30,
    stock: 20,
    image: "/images/sesame_dumpling_milk_1792747451641.jpg",
    category: "freshmilk",
    tag: "SPECIAL",
    tagTh: "พิเศษ",
  },

  // --- GINGER WATER (น้ำขิง) ---
  {
    id: "ginger-hot",
    en: "Hot Ginger Water",
    th: "น้ำขิงร้อน",
    desc: "Fresh boiled spicy ginger broth, warming, soothing, and comforting.",
    descTh: "น้ำขิงสดแท้ต้มร้อน เผ็ดร้อนหวานละมุน ชุ่มคอ",
    price: 15,
    stock: 50,
    image: "/images/ginger_tofu_pudding_1792747451451.jpg",
    category: "ginger",
  },
  {
    id: "ginger-cold",
    en: "Cold Ginger Water",
    th: "น้ำขิงเย็น",
    desc: "Chilled ginger water with a crisp and invigorating spicy kick.",
    descTh: "น้ำขิงเย็นสดชื่น รสชาติเผ็ดซ่าคลายร้อน",
    price: 20,
    stock: 40,
    image: "/images/ginger_tofu_pudding_1792747451451.jpg",
    category: "ginger",
  },
  {
    id: "ginger-tofu-pudding",
    en: "Ginger Water with Tofu Pudding (Douhua)",
    th: "เต้าฮวยน้ำขิง",
    desc: "Authentic silky smooth douhua tofu pudding in hot spiced ginger water.",
    descTh: "เต้าฮวยน้ำขิงร้อนสูตรโบราณ เนื้อเต้าฮวยเนียนนุ่มกับน้ำขิงเข้มข้น",
    price: 15,
    stock: 45,
    image: "/images/ginger_tofu_pudding_1792747451451.jpg",
    category: "ginger",
    tag: "TRADITIONAL",
    tagTh: "สูตรโบราณ",
  },
  {
    id: "ginger-jelly-barley",
    en: "Ginger Water with Jelly, Basil Seeds & Barley",
    th: "น้ำขิงวุ้นแมงลักบาร์เล่ต์",
    desc: "Hot ginger tea with grass jelly, basil seeds, and tender pearl barley.",
    descTh: "น้ำขิงใส่เครื่อง วุ้น เม็ดแมงลัก และลูกเดือยบาร์เล่ต์",
    price: 15,
    stock: 35,
    image: "/images/ginger_tofu_pudding_1792747451451.jpg",
    category: "ginger",
  },
  {
    id: "ginger-sesame-dumplings",
    en: "Ginger Water with Black Sesame Dumplings",
    th: "บัวลอยน้ำขิง",
    desc: "Traditional molten black sesame stuffed dumplings in steaming ginger water.",
    descTh: "บัวลอยน้ำขิง ไส้งาดำลาวาหอมฟุ้ง เผ็ดร้อนกลมกล่อม",
    price: 30,
    stock: 40,
    image: "/images/ginger_tofu_pudding_1792747451451.jpg",
    category: "ginger",
    tag: "MUST TRY",
    tagTh: "ห้ามพลาด",
  },
  {
    id: "ginger-black-sesame",
    en: "Ginger Water with Roasted Black Sesame",
    th: "น้ำขิงใส่งาดำ",
    desc: "Hot ginger broth infused with roasted crushed black sesame.",
    descTh: "น้ำขิงผสมงาดำคั่วบด หอมอบอุ่นชุ่มคอ",
    price: 20,
    stock: 30,
    image: "/images/ginger_tofu_pudding_1792747451451.jpg",
    category: "ginger",
  },
  {
    id: "ginger-ovaltine",
    en: "Ginger Water with Ovaltine",
    th: "น้ำขิงโอวัลติน",
    desc: "A cozy fusion of malty cocoa Ovaltine and warming spicy ginger broth.",
    descTh: "น้ำขิงผสมโอวัลติน หอมมอลต์รสชาติแปลกใหม่ลงตัว",
    price: 20,
    stock: 30,
    image: "/images/ginger_tofu_pudding_1792747451451.jpg",
    category: "ginger",
  },
  {
    id: "ginger-ginkgo",
    en: "Ginger Water with Ginkgo Nuts",
    th: "น้ำขิงแปะก๊วย",
    desc: "Steaming ginger water with tender sweetened ginkgo nuts.",
    descTh: "น้ำขิงร้อนใส่เม็ดแปะก๊วยเชื่อมเหนียวนุ่ม บำรุงร่างกาย",
    price: 30,
    stock: 30,
    image: "/images/ginger_tofu_pudding_1792747451451.jpg",
    category: "ginger",
  },
  {
    id: "ginger-tao-tung",
    en: "Ginger Water Tao Tung (Assorted Sweet Grains)",
    th: "เต้าทึงน้ำขิง",
    desc: "Warm Chinese herbal dessert with assorted sweet grains and fruits in ginger soup.",
    descTh: "เต้าทึงน้ำขิงรวมมิตร สมุนไพรและธัญพืชบำรุงสุขภาพ",
    price: 30,
    stock: 30,
    image: "/images/ginger_tofu_pudding_1792747451451.jpg",
    category: "ginger",
  },
  {
    id: "ginger-combo-deluxe",
    en: "Ginger Water Royal Combo (Dumplings & Full Toppings)",
    th: "น้ำขิงบัวลอยลูกชิดพุทราแปะก๊วยรากบัว",
    desc: "Supreme ginger water bowl with sesame dumplings, palm fruit, jujube, ginkgo and lotus root.",
    descTh: "บัวลอยงาดำ ลูกชิด พุทราจีน แปะก๊วย รากบัว ในน้ำขิงร้อนเข้มข้น",
    price: 30,
    stock: 25,
    image: "/images/ginger_tofu_pudding_1792747451451.jpg",
    category: "ginger",
    tag: "SIGNATURE",
    tagTh: "เอกลักษณ์",
  },

  // --- SPECIALTY (เมนูพิเศษ) ---
  {
    id: "matcha-soy-latte",
    en: "Matcha Soy Latte",
    th: "มัทฉะลาเต้น้ำเต้าหู้",
    desc: "Earthy authentic Japanese Uji matcha meets silky smooth soy milk.",
    descTh: "มัทฉะอุจิแท้กับน้ำเต้าหู้เนื้อนุ่ม ไม่หวาน",
    price: 65,
    stock: 25,
    image: "/images/matcha.jpg",
    category: "milk",
    tag: "SPECIALTY",
    tagTh: "พรีเมียม",
  },
];
export const initialOrders: Order[] = [
  {
    id: "WC-89A4B1",
    items: [
      { name: "Original Soy Milk", nameTh: "น้ำเต้าหู้สูตรดั้งเดิม", qty: 2, price: 35 },
      { name: "Youtiao · 2 pieces", nameTh: "ปาท่องโก๋ · 2 ชิ้น", qty: 1, price: 25 },
    ],
    total: 95,
    date: "2026-10-21",
    window: "08:00 – 10:00",
    name: "Somchai K.",
    phone: "081-234-5678",
    status: "collected",
    created: "2026-10-21T07:15:00.000Z",
    plan: false,
  },
  {
    id: "WC-42F79C",
    items: [
      { name: "Black Sesame Soy", nameTh: "น้ำเต้าหู้งาดำ", qty: 2, price: 45 },
      { name: "Tofu Pudding", nameTh: "เต้าฮวยน้ำขิง", qty: 2, price: 30 },
    ],
    total: 150,
    date: "2026-10-22",
    window: "06:30 – 08:00",
    name: "Mayuree P.",
    phone: "089-876-5432",
    status: "collected",
    created: "2026-10-22T06:05:00.000Z",
    plan: false,
  },
  {
    id: "WC-19E502",
    items: [
      { name: "Matcha Soy Latte", nameTh: "มัทฉะลาเต้น้ำเต้าหู้", qty: 2, price: 65 },
      { name: "Original Soy Milk", nameTh: "น้ำเต้าหู้สูตรดั้งเดิม", qty: 1, price: 35 },
    ],
    total: 165,
    date: "2026-10-23",
    window: "10:00 – 12:00",
    name: "Apinya S.",
    phone: "086-555-0199",
    status: "ready",
    created: "2026-10-23T08:30:00.000Z",
    plan: true,
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
  noteTh: "ทำสดใหม่ เรียบง่ายและใส่ใจ น้ำเต้าหู้ต้มสดทีละน้อยคือความสุขประจำวัน ผลิตสดใหม่ที่เชียงใหม่",
  heroImage: "/images/hero.webp",
  subheading: "Small-batch organic soy milk & treats · Hai Ya, Chiang Mai",
  subheadingTh: "น้ำเต้าหู้และของว่างสดใหม่ทีละน้อย · หายยา เชียงใหม่",
  announcement: "Fresh daily batch · Pickups 06:30 – 15:00 · Stone-ground Chiang Mai soybeans",
  announcementTh: "ต้มสดใหม่ทุกวัน · รับสินค้า 06:30 – 15:00 · ถั่วเหลืองอินทรีย์เชียงใหม่บดโม่หิน",
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

export function triggerHaptic(
  type: "light" | "medium" | "heavy" | "success" = "light"
) {
  if (typeof window !== "undefined" && "navigator" in window && "vibrate" in navigator) {
    try {
      if (type === "light") {
        navigator.vibrate(14);
      } else if (type === "medium") {
        navigator.vibrate(30);
      } else if (type === "heavy") {
        navigator.vibrate(55);
      } else if (type === "success") {
        navigator.vibrate([20, 50, 30]);
      }
    } catch {
      /* Haptic feedback is optional and will fail silently if unsupported */
    }
  }
}


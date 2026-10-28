import React, { useState } from "react";
import {
  X,
  ShoppingBag,
  Store,
  Clock3,
  MapPin,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Heart,
} from "lucide-react";
import { Product, CartItem, triggerHaptic } from "../lib/store";
import { useLanguage } from "../context/LanguageContext";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  products: Product[];
  orderType: "walk-in" | "pickup";
  setOrderType: (type: "walk-in" | "pickup") => void;
  specialRequests: string;
  setSpecialRequests: (val: string) => void;
  onAdd: (id: string, qty?: number) => void;
  onChangeQty: (id: string, delta: number) => void;
  onCheckout: () => void;
  plan: boolean;
  money: (amount: number) => string;
  pickupFields?: React.ReactNode;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  products,
  orderType,
  setOrderType,
  specialRequests,
  setSpecialRequests,
  onChangeQty,
  onCheckout,
  plan,
  money,
  pickupFields,
}: CartDrawerProps) {
  const { tr } = useLanguage();
  const [activeTab, setActiveTab] = useState<"items" | "notes">("items");

  if (!isOpen) return null;

  const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.id);
    return sum + (prod ? prod.price * item.qty : 0);
  }, 0);
  const total = plan ? Math.round(subtotal * 0.9) : subtotal;

  return (
    <div className="cart-drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label={tr("Your Cart", "ตะกร้าสินค้า")}>
      <div
        className="cart-drawer-panel liquid-glass-ios27"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title-group">
            <div className="cart-drawer-icon-wrap">
              <ShoppingBag size={18} className="text-emerald-800" />
            </div>
            <div>
              <h3>{tr("Your Little Bag", "ตะกร้าของคุณ")}</h3>
              <small className="text-muted">
                {totalCount} {tr("items selected", "รายการที่เลือก")}
              </small>
            </div>
          </div>
          <button
            type="button"
            className="cart-drawer-close-btn"
            onClick={() => {
              triggerHaptic("light");
              onClose();
            }}
            aria-label={tr("Close cart drawer", "ปิดตะกร้า")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Customer Ordering Mode Switcher (Walk-in & Passersby VS Pre-Order Pickup) */}
        <div className="cart-drawer-mode-section">
          <span className="cart-drawer-mode-label">
            {tr("How would you like to receive your order?", "ต้องการรับสินค้าแบบใด?")}
          </span>
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
              <span>{tr("Walk-in & Passersby", "หน้าร้าน / คนเดินผ่าน")}</span>
              <span className="badge-tag">{tr("Fastest", "เร็วที่สุด")}</span>
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
              <span>{tr("Scheduled Pickup", "จองล่วงหน้า")}</span>
            </button>
          </div>

          <div className="cart-drawer-pickup-note">
            <MapPin size={13} className="text-emerald-700" />
            {orderType === "walk-in" ? (
              <span>
                <strong>{tr("Counter Grab & Go:", "รับทันทีที่เคาน์เตอร์:")}</strong>{" "}
                {tr(
                  "Freshly poured chilled bottles & warm treats ready in 1–2 minutes.",
                  "น้ำเต้าหู้ขวดเย็นและของว่างอุ่น ๆ จัดเตรียมพร้อมเสิร์ฟใน 1-2 นาที"
                )}
              </span>
            ) : (
              <span>
                <strong>{tr("Brewed For Your Slot:", "ต้มสดตามรอบจอง:")}</strong>{" "}
                {tr("Collect during your morning pickup window at 16 Hai Ya Road.", "มารับตามช่วงเวลาเช้าที่คุณเลือก ที่บ้านวันชัย")}
              </span>
            )}
          </div>
        </div>

        {/* Tab switcher: Cart Items VS Special Requests */}
        <div className="cart-drawer-tabs">
          <button
            type="button"
            className={`cart-tab-btn ${activeTab === "items" ? "active" : ""}`}
            onClick={() => setActiveTab("items")}
          >
            {tr("Cart Items", "รายการสินค้า")} ({totalCount})
          </button>
          <button
            type="button"
            className={`cart-tab-btn ${activeTab === "notes" ? "active" : ""}`}
            onClick={() => setActiveTab("notes")}
          >
            {tr("Special Requests & Allergy", "คำขอพิเศษ & การแพ้อาหาร")}
            {specialRequests.trim() && <span className="tab-dot-alert" />}
          </button>
        </div>

        {/* Drawer Body */}
        <div className="cart-drawer-body">
          {activeTab === "items" ? (
            cart.length > 0 ? (
              <div className="cart-items-scroll">
                {cart.map((item) => {
                  const prod = products.find((p) => p.id === item.id);
                  if (!prod) return null;
                  return (
                    <div className="cart-drawer-item-row" key={item.id}>
                      <img
                        src={prod.image}
                        alt={tr(prod.en, prod.th)}
                        className="cart-drawer-thumb"
                      />
                      <div className="cart-drawer-info">
                        <strong>{tr(prod.en, prod.th)}</strong>
                        <span className="cart-drawer-unit-price">
                          {money(prod.price)} {tr("each", "/ ชิ้น")}
                        </span>
                        <div className="cart-drawer-stepper">
                          <button
                            type="button"
                            onClick={() => onChangeQty(prod.id, -1)}
                            aria-label={tr(`Decrease ${prod.en}`, `ลดจำนวน ${prod.th}`)}
                          >
                            <Minus size={12} />
                          </button>
                          <span>{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => onChangeQty(prod.id, 1)}
                            aria-label={tr(`Increase ${prod.en}`, `เพิ่มจำนวน ${prod.th}`)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="cart-drawer-item-subtotal">
                        <b>{money(prod.price * item.qty)}</b>
                        <button
                          type="button"
                          className="cart-drawer-delete-btn"
                          onClick={() => {
                            triggerHaptic("heavy");
                            onChangeQty(prod.id, -item.qty);
                          }}
                          title={tr("Remove item", "ลบสินค้านี้")}
                          aria-label={tr(`Remove ${prod.en}`, `ลบ ${prod.th}`)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="cart-drawer-empty">
                <div className="empty-icon-wrap">
                  <ShoppingBag size={32} />
                  <span><Heart size={12} /></span>
                </div>
                <strong>{tr("Your bag is waiting for goodness.", "ตะกร้ายังว่างอยู่")}</strong>
                <p>
                  {tr(
                    "Add warm stone-ground soy milk, golden youtiao crullers, or fresh dips.",
                    "เลือกน้ำเต้าหู้โม่หิน ปาท่องโก๋ทอดใหม่ หรือสังขยาใบเตยได้เลย"
                  )}
                </p>
              </div>
            )
          ) : (
            /* Special Requests & Allergy Information Tab */
            <div className="cart-drawer-notes-section">
              <div className="notes-header-alert">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />
                <div>
                  <strong>{tr("Special Requests & Allergy Information", "คำขอพิเศษและข้อมูลการแพ้อาหาร")}</strong>
                  <p>
                    {tr(
                      "Please let our kitchen know about sweetness preferences, beverage temperature, or dietary allergies.",
                      "แจ้งความหวาน อุณหภูมิเครื่องดื่ม หรือส่วนผสมที่แพ้เพื่อให้ครัวจัดเตรียมได้ถูกต้อง"
                    )}
                  </p>
                </div>
              </div>

              {/* Text Input Area as specifically requested by user */}
              <label htmlFor="special-requests-input" className="special-requests-label">
                {tr("Special Requests / Allergy Details:", "ระบุคำขอพิเศษ / การแพ้อาหาร:")}
              </label>
              <textarea
                id="special-requests-input"
                className="special-requests-textarea"
                rows={4}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder={tr(
                  "e.g., Warm soy milk, less sweet (50% sugar), no ginger topping, allergy to sesame seeds or peanuts...",
                  "เช่น น้ำเต้าหู้อุ่น หวานน้อย 50%, ไม่ใส่ขิง, แพ้งาขาว หรือแพ้ถั่วลิสง..."
                )}
                maxLength={300}
              />
              <div className="special-requests-footer">
                <span className="char-count">{specialRequests.length} / 300</span>
                <div className="quick-tags">
                  {[
                    tr("Less sweet", "หวานน้อย"),
                    tr("No sugar", "ไม่หวาน"),
                    tr("Warm", "แบบอุ่น"),
                    tr("No sesame", "ไม่ใส่งา"),
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className="quick-tag-chip"
                      onClick={() => {
                        triggerHaptic("light");
                        setSpecialRequests(
                          specialRequests ? `${specialRequests}, ${tag}` : tag
                        );
                      }}
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* If Pickup Mode: Show Pickup Time Selection */}
          {orderType === "pickup" && pickupFields && (
            <div className="cart-drawer-scheduled-fields">
              <h4>{tr("Pickup Schedule", "กำหนดเวลามารับ")}</h4>
              {pickupFields}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="cart-drawer-footer">
          {specialRequests.trim() && (
            <div className="cart-drawer-notes-preview">
              <AlertTriangle size={12} className="text-amber-700" />
              <span>
                <strong>{tr("Note:", "คำขอ:")}</strong> {specialRequests}
              </span>
            </div>
          )}

          <div className="cart-drawer-totals-row">
            <div>
              <span className="cart-drawer-subtotal-label">{tr("Total to Pay", "ยอดรวมทั้งหมด")}</span>
              <strong className="cart-drawer-grand-total">{money(total)}</strong>
            </div>
            {plan && (
              <span className="cart-drawer-savings-badge">
                {tr("10% Plan Savings Applied", "ลด 10% สำหรับแพ็กเกจ")}
              </span>
            )}
          </div>

          <button
            type="button"
            className="primary full checkout-button"
            disabled={cart.length === 0}
            onClick={() => {
              triggerHaptic("success");
              onCheckout();
            }}
          >
            {orderType === "walk-in"
              ? tr("Confirm Walk-in Counter Order", "ยืนยันรับที่หน้าร้านทันที")
              : tr("Proceed to Scheduled Checkout", "ดำเนินการจองเวลารับ")}
            <ArrowRight size={16} />
          </button>

          <p className="pay-note" style={{ textAlign: "center", margin: "6px 0 0" }}>
            <ShieldCheck size={12} />
            {tr(
              "Pay at pickup · Cash or PromptPay QR · Freshly stone-ground",
              "ชำระเงินเมื่อรับสินค้า · เงินสดหรือพร้อมเพย์ · โม่หินสดใหม่"
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;

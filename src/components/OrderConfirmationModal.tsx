import { CheckCircle2, Clock3, MapPin, Receipt, ArrowRight, RotateCcw } from "lucide-react";
import Modal from "./Modal";
import OrderTrackingProgress from "./OrderTrackingProgress";
import QRCodeDisplay from "./QRCodeDisplay";
import { Order, triggerHaptic } from "../lib/store";
import { useLanguage } from "../context/LanguageContext";

interface OrderConfirmationModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onViewOrders: () => void;
  onReorder: (order: Order) => void;
  onStatusChange?: (newStatus: Order["status"]) => void;
  money: (amount: number) => string;
  formatDate: (dateStr: string, full?: boolean) => string;
}

export default function OrderConfirmationModal({
  isOpen,
  order,
  onClose,
  onViewOrders,
  onReorder,
  onStatusChange,
  money,
  formatDate,
}: OrderConfirmationModalProps) {
  const { tr, lang } = useLanguage();

  if (!isOpen || !order) return null;

  return (
    <Modal
      title={tr("Order Confirmed!", "ยืนยันคำสั่งซื้อสำเร็จ!")}
      close={onClose}
      closeLabel={tr("Close confirmation", "ปิดหน้าต่างยืนยัน")}
    >
      <div className="order-confirmation-content">
        {/* Success Banner */}
        <div className="order-confirmation-banner">
          <div className="confirmation-badge-circle">
            <CheckCircle2 size={36} className="text-emerald-500" />
          </div>
          <h3>{tr("Thank you for your order!", "ขอบคุณสำหรับคำสั่งซื้อของคุณ!")}</h3>
          <p className="confirmation-order-id">
            {tr("Order reference:", "หมายเลขอ้างอิง:")} <strong>#{order.id}</strong>
          </p>
          <span className="confirmation-status-pill">
            {order.orderType === "walk-in" || order.window?.includes("Walk-in")
              ? tr("Counter Walk-in Pickup", "รับที่เคาน์เตอร์หน้าร้าน")
              : tr("Pre-ordered Pickup", "จองรอบเวลารับล่วงหน้า")}
          </span>
        </div>

        {/* Real-time Visual Order Tracking Stepper */}
        <div className="order-confirmation-tracking-box">
          <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 700, color: "var(--foreground)" }}>
            {tr("Real-time Order Progress", "ติดตามสถานะออเดอร์แบบเรียลไทม์")}
          </h4>
          <OrderTrackingProgress
            order={order}
            onStatusChange={onStatusChange}
            interactive={true}
          />
        </div>

        {/* Pickup Details & QR Code */}
        <div className="order-confirmation-pickup-card">
          <div className="pickup-info-column">
            <div className="pickup-info-row">
              <Clock3 size={16} className="text-emerald-600" />
              <div>
                <strong>{tr("Pickup Window", "ช่วงเวลารับสินค้า")}</strong>
                <p>
                  {formatDate(order.date)} · {order.window}
                </p>
              </div>
            </div>

            <div className="pickup-info-row">
              <MapPin size={16} className="text-emerald-600" />
              <div>
                <strong>{tr("Pickup Location", "จุดรับสินค้า")}</strong>
                <p>16 Hai Ya Road, Chiang Mai (Wanchai Soy Milk House)</p>
              </div>
            </div>

            {order.specialRequests && (
              <div className="pickup-special-requests">
                <strong>{tr("Special Requests / Allergy Info:", "คำขอพิเศษ / ข้อมูลแพ้อาหาร:")}</strong>
                <p>{order.specialRequests}</p>
              </div>
            )}
          </div>

          <div className="pickup-qr-column">
            <QRCodeDisplay
              value={`https://wanchai.house/orders/${order.id}`}
              orderId={order.id}
              pickupWindow={order.window}
              size={130}
            />
          </div>
        </div>

        {/* Itemized summary */}
        <div className="order-confirmation-items">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: 600 }}>
            <span>{tr("Items Ordered", "รายการสินค้า")}</span>
            <span>{money(order.total)}</span>
          </div>
          <div className="confirmation-items-list">
            {order.items.map((item, idx) => (
              <div key={idx} className="confirmation-item-row">
                <span>
                  {item.qty} × {lang === "th" ? item.nameTh || item.name : item.name}
                </span>
                <b>{money(item.qty * item.price)}</b>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="order-confirmation-actions">
          <button
            type="button"
            className="secondary"
            onClick={() => {
              triggerHaptic("light");
              onViewOrders();
            }}
          >
            <Receipt size={16} />
            {tr("View in My Orders", "ดูในออเดอร์ของฉัน")}
          </button>

          <button
            type="button"
            className="secondary"
            onClick={() => {
              triggerHaptic("light");
              onReorder(order);
            }}
          >
            <RotateCcw size={16} />
            {tr("Reorder this meal", "สั่งซ้ำเมนูนี้")}
          </button>

          <button
            type="button"
            className="primary"
            onClick={() => {
              triggerHaptic("light");
              onClose();
            }}
          >
            {tr("Done", "เสร็จสิ้น")}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </Modal>
  );
}

import { RotateCcw, AlertCircle, Check, X } from "lucide-react";
import Modal from "./Modal";
import { Order, Product, triggerHaptic } from "../lib/store";
import { useLanguage } from "../context/LanguageContext";

interface ReorderConfirmModalProps {
  isOpen: boolean;
  order: Order | null;
  products: Product[];
  onConfirm: (order: Order) => void;
  onClose: () => void;
  money: (amount: number) => string;
}

export default function ReorderConfirmModal({
  isOpen,
  order,
  products,
  onConfirm,
  onClose,
  money,
}: ReorderConfirmModalProps) {
  const { tr } = useLanguage();

  if (!isOpen || !order) return null;

  // Check item availability in current products
  const itemsWithStatus = order.items.map((item) => {
    const prod = products.find(
      (p) => p.en.toLowerCase() === item.name.toLowerCase() || p.th === item.nameTh
    );
    const inStock = prod ? prod.stock >= item.qty : false;
    const currentStock = prod ? prod.stock : 0;
    const currentPrice = prod ? prod.price : item.price;
    return {
      ...item,
      product: prod,
      inStock,
      currentStock,
      currentPrice,
    };
  });

  const allAvailable = itemsWithStatus.every((i) => i.inStock);
  const anyAvailable = itemsWithStatus.some((i) => i.currentStock > 0);

  const handleConfirm = () => {
    triggerHaptic("success");
    onConfirm(order);
    onClose();
  };

  return (
    <Modal
      title={tr("Reorder Past Favorites", "ยืนยันการสั่งซื้อซ้ำ")}
      close={onClose}
      closeLabel={tr("Close reorder confirmation", "ปิดหน้าต่างยืนยัน")}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Order Header Summary */}
        <div
          style={{
            padding: "12px 14px",
            background: "var(--surface-warm)",
            borderRadius: "8px",
            border: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--green)" }}>
              #{order.id}
            </span>
            <strong style={{ display: "block", fontSize: "14px" }}>
              {order.name || tr("Previous Order", "ออเดอร์ก่อนหน้า")}
            </strong>
            <small style={{ color: "var(--muted)", fontSize: "11px" }}>
              {new Date(order.created || `${order.date}T12:00:00Z`).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}{" "}
              · {order.window}
            </small>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase" }}>
              {tr("Total", "ยอดรวม")}
            </span>
            <strong style={{ display: "block", fontSize: "16px", color: "var(--green)" }}>
              {money(order.total)}
            </strong>
          </div>
        </div>

        {/* Items Breakdown Checklist */}
        <div>
          <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "8px", color: "var(--text)" }}>
            {tr("Items in this reorder:", "รายการสินค้าที่จะเพิ่มลงในตะกร้า:")}
          </div>

          <div
            style={{
              maxHeight: "180px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            {itemsWithStatus.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: item.inStock ? "var(--surface)" : "#fee2e220",
                  border: `1px solid ${item.inStock ? "var(--line)" : "#ef444450"}`,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {item.product?.image && (
                    <img
                      src={item.product.image}
                      alt=""
                      style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover" }}
                    />
                  )}
                  <div>
                    <strong style={{ fontSize: "13px", display: "block" }}>
                      {item.qty} × {tr(item.name, item.nameTh)}
                    </strong>
                    <small style={{ color: "var(--muted)", fontSize: "11px" }}>
                      {money(item.currentPrice)} {tr("each", "/ ชิ้น")}
                    </small>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: "13px" }}>
                    {money(item.qty * item.currentPrice)}
                  </div>
                  {item.inStock ? (
                    <span style={{ fontSize: "10px", color: "#059669", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                      <Check size={10} /> {tr("In Stock", "มีสินค้า")}
                    </span>
                  ) : item.currentStock > 0 ? (
                    <span style={{ fontSize: "10px", color: "#d97706", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                      <AlertCircle size={10} /> {tr(`Only ${item.currentStock} left`, `เหลือ ${item.currentStock} ชิ้น`)}
                    </span>
                  ) : (
                    <span style={{ fontSize: "10px", color: "#dc2626", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                      <X size={10} /> {tr("Out of Stock", "สินค้าหมด")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stock warning if applicable */}
        {!allAvailable && (
          <div
            style={{
              padding: "8px 12px",
              background: "#fffbeb",
              borderRadius: "6px",
              border: "1px solid #fde68a",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              color: "#92400e",
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>
              {tr(
                "Some items have changed stock levels. Only currently available items will be added to your bag.",
                "สินค้าบางรายการสต็อกไม่เพียงพอ ระบบจะเพิ่มเฉพาะสินค้าที่มีสต็อกพร้อมจำหน่ายลงในตะกร้า"
              )}
            </span>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
          <button
            type="button"
            className="secondary full"
            onClick={onClose}
          >
            <X size={15} />
            {tr("Cancel", "ยกเลิก")}
          </button>
          <button
            type="button"
            className="primary full"
            disabled={!anyAvailable}
            onClick={handleConfirm}
            style={{ fontWeight: 700 }}
          >
            <RotateCcw size={15} />
            {tr("Confirm & Add to Bag", "ยืนยันและเพิ่มลงตะกร้า")}
          </button>
        </div>
      </div>
    </Modal>
  );
}

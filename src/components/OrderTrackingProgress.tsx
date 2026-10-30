import React from "react";
import { Check, Clock3, Utensils, ShoppingBag, CheckCheck, Sparkles, Store } from "lucide-react";
import { Order, triggerHaptic } from "../lib/store";
import { useLanguage } from "../context/LanguageContext";

interface OrderTrackingProgressProps {
  order: Order;
  onStatusChange?: (newStatus: Order["status"]) => void;
  interactive?: boolean;
}

export default function OrderTrackingProgress({
  order,
  onStatusChange,
  interactive = false,
}: OrderTrackingProgressProps) {
  const { tr } = useLanguage();

  const steps: Array<{
    id: Order["status"];
    label: string;
    description: string;
    icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  }> = [
    {
      id: "received",
      label: tr("Order Received", "รับออเดอร์แล้ว"),
      description: tr("Kitchen queued your order", "ครัวบันทึกรายการแล้ว"),
      icon: Clock3,
    },
    {
      id: "preparing",
      label: tr("Brewing & Preparing", "กำลังต้มและจัดเตรียม"),
      description: tr("Fresh soy milk steaming now", "ต้มสดใหม่ด้วยถั่วเหลืองออร์แกนิก"),
      icon: Utensils,
    },
    {
      id: "ready",
      label: tr("Ready for Pickup", "พร้อมรับสินค้า"),
      description: tr("Waiting at Hai Ya counter", "รอคุณมารับที่เคาน์เตอร์หายยา"),
      icon: ShoppingBag,
    },
    {
      id: "collected",
      label: tr("Picked Up & Enjoyed", "รับสินค้าเรียบร้อย"),
      description: tr("Thank you for choosing Wanchai", "ขอบคุณที่แวะมาบ้านน้ำเต้าหู้วันชัย"),
      icon: CheckCheck,
    },
  ];

  const statusOrder: Order["status"][] = ["received", "preparing", "ready", "collected"];
  const currentIndex = statusOrder.indexOf(order.status);

  return (
    <div className="order-tracking-container">
      {/* Real-time Status Header */}
      <div className="order-tracking-header">
        <div className="tracking-status-badge">
          <span className="tracking-pulse-dot" />
          <span className="tracking-status-text">
            {order.status === "received" && tr("Order in Queue", "รอคิวเข้าครัว")}
            {order.status === "preparing" && tr("Kitchen is Brewing Fresh", "ครัวกำลังต้มสดใหม่")}
            {order.status === "ready" && tr("Fresh & Ready at Counter!", "พร้อมรับที่เคาน์เตอร์แล้ว!")}
            {order.status === "collected" && tr("Completed & Picked Up", "รับสินค้าเรียบร้อยแล้ว")}
          </span>
        </div>
        <div className="tracking-meta-info">
          <span className="tracking-pickup-window">
            <Store size={13} style={{ marginRight: "4px", verticalAlign: "text-bottom" }} />
            {order.window || tr("Walk-in Counter", "เคาน์เตอร์หน้าร้าน")}
          </span>
        </div>
      </div>

      {/* Stepper Bar */}
      <div className="order-tracking-stepper">
        <div className="tracking-timeline-line">
          <div
            className="tracking-timeline-progress"
            style={{
              width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className="tracking-steps-grid">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const Icon = step.icon;

            return (
              <div
                key={step.id}
                className={`tracking-step-item ${
                  isCompleted ? "completed" : isCurrent ? "current" : "pending"
                }`}
              >
                <div className="tracking-node-wrapper">
                  <div className="tracking-step-node">
                    {isCompleted ? (
                      <Check size={14} strokeWidth={2.8} />
                    ) : (
                      <Icon size={14} strokeWidth={isCurrent ? 2.2 : 1.8} />
                    )}
                  </div>
                  {isCurrent && <div className="tracking-node-halo" />}
                </div>

                <div className="tracking-step-text">
                  <span className="tracking-step-label">{step.label}</span>
                  <small className="tracking-step-desc">{step.description}</small>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real-time status simulation / test controls if interactive */}
      {interactive && onStatusChange && (
        <div className="tracking-test-controls">
          <span className="test-controls-hint">
            <Sparkles size={13} /> {tr("Live kitchen simulation:", "จำลองสถานะครัวสด:")}
          </span>
          <div className="test-controls-buttons">
            {statusOrder.map((st) => (
              <button
                key={st}
                type="button"
                className={`test-step-btn ${order.status === st ? "active" : ""}`}
                onClick={() => {
                  triggerHaptic("light");
                  onStatusChange(st);
                }}
              >
                {st === "received" && tr("Received", "รับ")}
                {st === "preparing" && tr("Preparing", "กำลังทำ")}
                {st === "ready" && tr("Ready", "พร้อม")}
                {st === "collected" && tr("Collected", "รับแล้ว")}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

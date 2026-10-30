import {
  X,
  CreditCard,
  Utensils,
  Settings2,
  TrendingUp,
  PackageCheck,
  FileSpreadsheet,
  BellRing,
  Sparkles,
  Store,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Download,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { triggerHaptic } from "../lib/store";

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onSelectView: (view: "pos" | "kitchen" | "admin") => void;
  adminTab: string;
  onSelectAdminTab: (tab: "analytics" | "inventory" | "settings" | "content" | "accessibility" | "alerts") => void;
  onExportCSV: () => void;
  lowStockCount: number;
  kitchenPendingCount: number;
}

export default function AdminDrawer({
  isOpen,
  onClose,
  currentView,
  onSelectView,
  adminTab,
  onSelectAdminTab,
  onExportCSV,
  lowStockCount,
  kitchenPendingCount,
}: AdminDrawerProps) {
  const { tr } = useLanguage();

  if (!isOpen) return null;

  const navigateTo = (view: "pos" | "kitchen" | "admin", tab?: "analytics" | "inventory" | "settings" | "content" | "accessibility" | "alerts") => {
    triggerHaptic("light");
    onSelectView(view);
    if (tab) {
      onSelectAdminTab(tab);
    }
    onClose();
  };

  return (
    <div
      className="admin-drawer-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={tr("Staff & Operations Drawer", "เมนูผู้จัดการและงานหลังร้าน")}
    >
      <aside
        className="admin-drawer-panel liquid-glass-ios27"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="admin-drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div className="admin-drawer-badge">
              <Store size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>
                {tr("Staff Operations", "ระบบจัดการร้าน & พนักงาน")}
              </h3>
              <small style={{ color: "var(--muted)", fontSize: "11px" }}>
                {tr("Wanchai Soy Milk House · Hai Ya", "บ้านน้ำเต้าหู้วันชัย · หายยา")}
              </small>
            </div>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={() => {
              triggerHaptic("light");
              onClose();
            }}
            aria-label={tr("Close admin drawer", "ปิดเมนูพนักงาน")}
          >
            <X size={18} />
          </button>
        </div>

        {/* Status Pills */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", margin: "14px 16px" }}>
          <div
            onClick={() => navigateTo("kitchen")}
            style={{
              padding: "10px",
              background: kitchenPendingCount > 0 ? "#fef3c7" : "var(--surface-warm)",
              borderRadius: "8px",
              cursor: "pointer",
              border: `1px solid ${kitchenPendingCount > 0 ? "#f59e0b" : "var(--line)"}`,
            }}
          >
            <div style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase" }}>
              {tr("Kitchen Queue", "คิวในครัว")}
            </div>
            <strong style={{ fontSize: "16px", color: kitchenPendingCount > 0 ? "#b45309" : "var(--text)" }}>
              {kitchenPendingCount} {tr("orders", "ออเดอร์")}
            </strong>
          </div>

          <div
            onClick={() => navigateTo("admin", "inventory")}
            style={{
              padding: "10px",
              background: lowStockCount > 0 ? "#fee2e2" : "var(--surface-warm)",
              borderRadius: "8px",
              cursor: "pointer",
              border: `1px solid ${lowStockCount > 0 ? "#ef4444" : "var(--line)"}`,
            }}
          >
            <div style={{ fontSize: "10px", color: "var(--muted)", textTransform: "uppercase" }}>
              {tr("Low Stock Alert", "สินค้าใกล้หมด")}
            </div>
            <strong style={{ fontSize: "16px", color: lowStockCount > 0 ? "#dc2626" : "var(--text)" }}>
              {lowStockCount > 0 ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <AlertTriangle size={14} /> {lowStockCount} {tr("items", "รายการ")}
                </span>
              ) : (
                tr("Stock OK", "สต็อกพร้อม")
              )}
            </strong>
          </div>
        </div>

        {/* Operations Navigation Links */}
        <div style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "4px", flex: 1, overflowY: "auto" }}>
          <div className="drawer-section-title">
            {tr("FRONT DESK & COUNTER", "หน้าเคาน์เตอร์และจุดขาย")}
          </div>

          <button
            type="button"
            className={`admin-nav-item ${currentView === "pos" ? "active" : ""}`}
            onClick={() => navigateTo("pos")}
          >
            <div className="admin-nav-icon"><CreditCard size={18} /></div>
            <div className="admin-nav-label">
              <strong>{tr("Point of Sale (POS Dialpad)", "ระบบจุดขาย (POS คีย์แป้นด่วน)")}</strong>
              <small>{tr("Fast cash/scan register for walk-in passersby", "คิดเงินและสแกนไว สำหรับลูกค้าหน้าร้าน")}</small>
            </div>
            <ChevronRight size={14} className="chevron" />
          </button>

          <button
            type="button"
            className={`admin-nav-item ${currentView === "kitchen" ? "active" : ""}`}
            onClick={() => navigateTo("kitchen")}
          >
            <div className="admin-nav-icon"><Utensils size={18} /></div>
            <div className="admin-nav-label">
              <strong>{tr("Kitchen Order Display", "จอแสดงออเดอร์ในครัว")}</strong>
              <small>{tr("Realtime tickets, batch chimes & prep checklist", "ตั๋วออเดอร์สด เสียงเตือนรอบผลิต และรายการเตรียม")}</small>
            </div>
            <ChevronRight size={14} className="chevron" />
          </button>

          <div className="drawer-section-title" style={{ marginTop: "12px" }}>
            {tr("ADMIN & STORE CONTROLS", "การจัดการหลังร้านและสินค้า")}
          </div>

          <button
            type="button"
            className={`admin-nav-item ${currentView === "admin" && adminTab === "inventory" ? "active" : ""}`}
            onClick={() => navigateTo("admin", "inventory")}
          >
            <div className="admin-nav-icon"><PackageCheck size={18} /></div>
            <div className="admin-nav-label">
              <strong>{tr("Products & Inventory", "คลังสินค้า & สต็อก")}</strong>
              <small>{tr("Stock adjustments, bulk updates & CSV import", "ปรับสต็อก อัปเดตพร้อมกัน & นำเข้า CSV")}</small>
            </div>
            {lowStockCount > 0 && <span className="admin-badge-count">{lowStockCount}</span>}
            <ChevronRight size={14} className="chevron" />
          </button>

          <button
            type="button"
            className={`admin-nav-item ${currentView === "admin" && adminTab === "analytics" ? "active" : ""}`}
            onClick={() => navigateTo("admin", "analytics")}
          >
            <div className="admin-nav-icon"><TrendingUp size={18} /></div>
            <div className="admin-nav-label">
              <strong>{tr("Revenue Trends & Analytics", "รายได้และแนวโน้มการขาย")}</strong>
              <small>{tr("Weekly sales performance line & area charts", "กราฟแสดงผลยอดขายรายสัปดาห์")}</small>
            </div>
            <ChevronRight size={14} className="chevron" />
          </button>

          <button
            type="button"
            className={`admin-nav-item ${currentView === "admin" && adminTab === "alerts" ? "active" : ""}`}
            onClick={() => navigateTo("admin", "alerts")}
          >
            <div className="admin-nav-icon"><BellRing size={18} /></div>
            <div className="admin-nav-label">
              <strong>{tr("Automated Alerts Log", "บันทึกการส่งอีเมลแจ้งเตือน")}</strong>
              <small>{tr("Alerts dispatched to banheruka@gmail.com", "ประวัติส่งแจ้งเตือนสต็อกต่ำไปยังอีเมล")}</small>
            </div>
            <ChevronRight size={14} className="chevron" />
          </button>

          <button
            type="button"
            className={`admin-nav-item ${currentView === "admin" && adminTab === "content" ? "active" : ""}`}
            onClick={() => navigateTo("admin", "content")}
          >
            <div className="admin-nav-icon"><Sparkles size={18} /></div>
            <div className="admin-nav-label">
              <strong>{tr("Hero Wall & Story Studio", "ผนังฮีโร่และเรื่องราว")}</strong>
              <small>{tr("Customize storefront announcement & heading", "แก้ไขข้อความต้อนรับและแถบประกาศ")}</small>
            </div>
            <ChevronRight size={14} className="chevron" />
          </button>

          <button
            type="button"
            className={`admin-nav-item ${currentView === "admin" && adminTab === "settings" ? "active" : ""}`}
            onClick={() => navigateTo("admin", "settings")}
          >
            <div className="admin-nav-icon"><Settings2 size={18} /></div>
            <div className="admin-nav-label">
              <strong>{tr("Store & Sound Settings", "ตั้งค่าร้านและเสียงสั่น")}</strong>
              <small>{tr("Pickup capacity, chimes & haptics", "กำหนดรอบออเดอร์ เสียงกระดิ่ง & สั่น")}</small>
            </div>
            <ChevronRight size={14} className="chevron" />
          </button>

          <div className="drawer-section-title" style={{ marginTop: "12px" }}>
            {tr("DATA EXPORT", "ส่งออกข้อมูล")}
          </div>

          <button
            type="button"
            className="admin-nav-item"
            onClick={() => {
              triggerHaptic("medium");
              onExportCSV();
              onClose();
            }}
          >
            <div className="admin-nav-icon"><FileSpreadsheet size={18} /></div>
            <div className="admin-nav-label">
              <strong>{tr("Export Orders to CSV", "ส่งออกประวัติออเดอร์เป็น CSV")}</strong>
              <small>{tr("Download spreadsheet for sales analysis", "ดาวน์โหลดไฟล์สเปรดชีตวิเคราะห์ยอดขาย")}</small>
            </div>
            <Download size={14} className="chevron" />
          </button>
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 16px", borderTop: "1px solid var(--line)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "var(--muted)" }}>
            <ShieldCheck size={14} style={{ color: "var(--green)" }} />
            <span>{tr("Staff Operations Active", "โหมดจัดการร้านพร้อมใช้งาน")}</span>
          </div>
          <span style={{ fontSize: "10px", color: "var(--muted)", fontWeight: 600 }}>v2.0</span>
        </div>
      </aside>
    </div>
  );
}

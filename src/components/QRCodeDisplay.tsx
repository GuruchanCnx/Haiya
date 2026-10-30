import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode, Copy, Check, Download } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  orderId?: string;
  pickupWindow?: string;
}

export default function QRCodeDisplay({
  value,
  size = 180,
  orderId,
  pickupWindow,
}: QRCodeDisplayProps) {
  const { tr } = useLanguage();
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(
      value,
      {
        width: size * 2,
        margin: 1.5,
        color: {
          dark: "#1e3a29",
          light: "#ffffff",
        },
      },
      (err, url) => {
        if (!err && url) {
          setDataUrl(url);
        }
      }
    );
  }, [value, size]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="qr-card panel" style={{ textAlign: "center", padding: "16px", background: "var(--surface)" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--green)", fontWeight: 700, fontSize: "12px", marginBottom: "8px" }}>
        <QrCode size={16} />
        {tr("Pickup Identification QR", "คิวอาร์โค้ดสำหรับรับสินค้า")}
      </div>
      <p style={{ margin: "0 0 12px", fontSize: "11px", color: "var(--muted)" }}>
        {tr(
          "Show this QR code at the counter for instant order identification.",
          "แสดงคิวอาร์โค้ดนี้ที่หน้าเคาน์เตอร์เพื่อให้พนักงานสแกนรับสินค้าได้ทันที"
        )}
      </p>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
        {dataUrl ? (
          <div style={{ padding: "8px", background: "#fff", borderRadius: "10px", boxShadow: "0 4px 14px rgba(0,0,0,0.06)", border: "1px solid var(--border)" }}>
            <img
              src={dataUrl}
              alt={`QR Code for Order ${orderId || value}`}
              style={{ width: `${size}px`, height: `${size}px`, display: "block" }}
            />
          </div>
        ) : (
          <div style={{ width: `${size}px`, height: `${size}px`, display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f5ee", borderRadius: "8px" }}>
            <QrCode size={32} className="text-muted animate-pulse" />
          </div>
        )}
      </div>

      {orderId && (
        <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text)", marginBottom: "4px" }}>
          #{orderId} {pickupWindow ? `· ${pickupWindow}` : ""}
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "10px" }}>
        <button
          type="button"
          className="secondary"
          style={{ padding: "5px 12px", fontSize: "11px" }}
          onClick={handleCopy}
        >
          {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
          {copied ? tr("Copied Link", "คัดลอกลิงก์แล้ว") : tr("Copy Order Link", "คัดลอกลิงก์")}
        </button>

        {dataUrl && (
          <a
            href={dataUrl}
            download={`wanchai-order-${orderId || "pickup"}-qr.png`}
            className="secondary"
            style={{ padding: "5px 12px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "5px" }}
          >
            <Download size={13} />
            {tr("Save QR", "บันทึกคิวอาร์")}
          </a>
        )}
      </div>
    </div>
  );
}

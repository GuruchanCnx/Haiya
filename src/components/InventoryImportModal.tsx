import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, X, Table, Sparkles } from "lucide-react";
import Modal from "./Modal";
import { Product, triggerHaptic } from "../lib/store";
import { useLanguage } from "../context/LanguageContext";

interface InventoryImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onApplyUpdates: (updatedProducts: Product[]) => void;
  onNotify: (title: string, message: string) => void;
}

interface ParsedRow {
  identifier: string; // product ID or Name
  stock?: number;
  price?: number;
  matchedProduct?: Product;
  status: "match" | "not_found" | "invalid";
}

export default function InventoryImportModal({
  isOpen,
  onClose,
  products,
  onApplyUpdates,
  onNotify,
}: InventoryImportModalProps) {
  const { tr } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pastedText, setPastedText] = useState("");
  const [mode, setMode] = useState<"replace" | "add">("replace");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewActive, setPreviewActive] = useState(false);

  if (!isOpen) return null;

  const parseData = (raw: string) => {
    const lines = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setParsedRows([]);
      setPreviewActive(false);
      return;
    }

    const rows: ParsedRow[] = [];

    lines.forEach((line, index) => {
      // Skip header if line looks like "id,stock" or "name,stock,price"
      if (
        index === 0 &&
        (line.toLowerCase().includes("id") ||
          line.toLowerCase().includes("stock") ||
          line.toLowerCase().includes("product") ||
          line.toLowerCase().includes("name"))
      ) {
        return;
      }

      // Support comma, tab, or semicolon separated
      const parts = line.split(/[,\t;]/).map((p) => p.trim());
      if (parts.length < 2) return;

      const identifier = parts[0];
      const stockVal = parseInt(parts[1], 10);
      const priceVal = parts[2] ? parseInt(parts[2], 10) : undefined;

      // Find matched product by ID or Name (case-insensitive)
      const matched = products.find(
        (p) =>
          p.id.toLowerCase() === identifier.toLowerCase() ||
          p.en.toLowerCase() === identifier.toLowerCase() ||
          p.th.toLowerCase() === identifier.toLowerCase()
      );

      if (isNaN(stockVal)) {
        rows.push({
          identifier,
          status: "invalid",
        });
      } else if (!matched) {
        rows.push({
          identifier,
          stock: stockVal,
          price: isNaN(priceVal || NaN) ? undefined : priceVal,
          status: "not_found",
        });
      } else {
        rows.push({
          identifier,
          stock: stockVal,
          price: isNaN(priceVal || NaN) ? undefined : priceVal,
          matchedProduct: matched,
          status: "match",
        });
      }
    });

    setParsedRows(rows);
    setPreviewActive(true);
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPastedText(val);
    parseData(val);
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = String(e.target?.result || "");
      setPastedText(text);
      parseData(text);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const loadSample = () => {
    const sample = [
      "product_id,stock,price",
      "youtiao-single,180,1",
      "hot-original,65,15",
      "sesame-dumpling-milk,40,35",
      "pandan-sauce,80,10",
      "cold-unsweetened,50,20",
    ].join("\n");
    setPastedText(sample);
    parseData(sample);
    triggerHaptic("light");
  };

  const applyUpdates = () => {
    const validMatches = parsedRows.filter(
      (r) => r.status === "match" && r.matchedProduct && r.stock !== undefined
    );

    if (validMatches.length === 0) {
      alert(tr("No matched products to update.", "ไม่พบสินค้าที่ตรงกันสำหรับอัปเดต"));
      return;
    }

    const updated = products.map((prod) => {
      const match = validMatches.find((r) => r.matchedProduct?.id === prod.id);
      if (!match || match.stock === undefined) return prod;

      const newStock =
        mode === "replace"
          ? match.stock
          : Math.max(0, prod.stock + match.stock);

      const newPrice =
        match.price !== undefined && !isNaN(match.price) && match.price > 0
          ? match.price
          : prod.price;

      return {
        ...prod,
        stock: newStock,
        price: newPrice,
      };
    });

    onApplyUpdates(updated);
    triggerHaptic("success");
    onNotify(
      tr("Inventory imported successfully!", "นำเข้าและอัปเดตสต็อกเรียบร้อยแล้ว!"),
      tr(
        `Updated ${validMatches.length} product(s) with new stock counts.`,
        `อัปเดตจำนวนสินค้าสำเร็จ ${validMatches.length} รายการ`
      )
    );
    onClose();
  };

  const matchCount = parsedRows.filter((r) => r.status === "match").length;
  const invalidCount = parsedRows.filter((r) => r.status !== "match").length;

  return (
    <Modal
      title={tr("Import Inventory from Spreadsheet / CSV", "นำเข้าข้อมูลสต็อกจาก Spreadsheet / CSV")}
      close={onClose}
      closeLabel={tr("Close import modal", "ปิดหน้าต่างนำเข้าสต็อก")}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <p style={{ margin: 0, fontSize: "13px", color: "var(--muted)", lineHeight: 1.5 }}>
          {tr(
            "Batch update product inventory quantities or prices by uploading a CSV/TSV spreadsheet or pasting row data directly.",
            "อัปเดตสต็อกหรือราคาสินค้าพร้อมกันหลายรายการ ด้วยการอัปโหลดไฟล์ CSV หรือวางข้อความจากโปรแกรมสเปรดชีต"
          )}
        </p>

        {/* File Dropzone */}
        <div
          className={`dropzone-box ${isDragging ? "dragging" : ""}`}
          style={{
            border: `2px dashed ${isDragging ? "var(--green)" : "var(--line)"}`,
            borderRadius: "10px",
            padding: "20px",
            textAlign: "center",
            background: isDragging ? "var(--soft-green)" : "var(--surface-warm)",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".csv,.tsv,.txt"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
          <UploadCloud size={32} style={{ color: "var(--green)", margin: "0 auto 8px" }} />
          <strong style={{ display: "block", fontSize: "14px" }}>
            {tr("Click to choose file or drag & drop CSV here", "คลิกเพื่อเลือกไฟล์ หรือลากไฟล์ CSV มาวางที่นี่")}
          </strong>
          <span style={{ fontSize: "11px", color: "var(--muted)" }}>
            {tr("Supports .csv, .tsv, .txt (ID/Name, Stock, Price)", "รองรับ .csv, .tsv, .txt (รหัส/ชื่อสินค้า, สต็อก, ราคา)")}
          </span>
        </div>

        {/* Direct Text Area Input */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <label className="field-label" style={{ margin: 0 }}>
              <FileText size={13} style={{ display: "inline", marginRight: "4px" }} />
              {tr("Or Paste Spreadsheet / CSV Data Directly", "หรือวางข้อมูลข้อความ CSV / ตารางโดยตรง")}
            </label>
            <button
              type="button"
              className="secondary"
              style={{ padding: "2px 8px", fontSize: "10px" }}
              onClick={loadSample}
            >
              <Sparkles size={11} />
              {tr("Load Sample Format", "โหลดข้อมูลตัวอย่าง")}
            </button>
          </div>
          <textarea
            rows={5}
            value={pastedText}
            onChange={handleTextChange}
            placeholder={`product_id,stock,price\nyoutiao-single,150,1\nhot-original,60,15\nsesame-dumpling-milk,35,35`}
            style={{
              width: "100%",
              fontFamily: "monospace",
              fontSize: "12px",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid var(--line)",
              background: "var(--surface)",
              lineHeight: 1.4,
            }}
          />
        </div>

        {/* Update Mode Options */}
        <div style={{ display: "flex", gap: "16px", alignItems: "center", padding: "10px 14px", background: "var(--surface)", borderRadius: "8px", border: "1px solid var(--line)" }}>
          <span style={{ fontSize: "12px", fontWeight: 700 }}>{tr("Stock Update Mode:", "รูปแบบการอัปเดตสต็อก:")}</span>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
            <input
              type="radio"
              name="stockMode"
              checked={mode === "replace"}
              onChange={() => setMode("replace")}
            />
            {tr("Replace Current Stock (Exact count)", "แทนที่สต็อกปัจจุบัน (นับยอดจริง)")}
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", cursor: "pointer" }}>
            <input
              type="radio"
              name="stockMode"
              checked={mode === "add"}
              onChange={() => setMode("add")}
            />
            {tr("Add to Existing Stock (+Replenishment)", "เพิ่มจากสต็อกเดิม (+เติมของ)")}
          </label>
        </div>

        {/* Preview Section */}
        {previewActive && parsedRows.length > 0 && (
          <div style={{ marginTop: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Table size={14} className="text-muted" />
                <strong style={{ fontSize: "12px" }}>
                  {tr("Preview & Column Mapping", "ตรวจสอบข้อมูลที่จับคู่ได้")}
                </strong>
              </div>
              <div style={{ fontSize: "11px", display: "flex", gap: "10px" }}>
                <span style={{ color: "#059669", fontWeight: 700 }}>
                  ✓ {matchCount} {tr("matched", "ตรงกัน")}
                </span>
                {invalidCount > 0 && (
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>
                    ✕ {invalidCount} {tr("unmatched / error", "ไม่พบ / ไม่ถูกต้อง")}
                  </span>
                )}
              </div>
            </div>

            <div style={{ maxHeight: "160px", overflowY: "auto", border: "1px solid var(--line)", borderRadius: "6px" }}>
              <table style={{ width: "100%", fontSize: "11px", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--surface-warm)", textAlign: "left" }}>
                    <th style={{ padding: "6px 8px" }}>{tr("Input Item", "ข้อมูลนำเข้า")}</th>
                    <th style={{ padding: "6px 8px" }}>{tr("Matched Product", "สินค้าในระบบ")}</th>
                    <th style={{ padding: "6px 8px" }}>{tr("New Stock", "สต็อกใหม่")}</th>
                    <th style={{ padding: "6px 8px" }}>{tr("Status", "สถานะ")}</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, i) => (
                    <tr key={i} style={{ borderTop: "1px solid var(--line)", background: row.status === "match" ? "transparent" : "#fee2e220" }}>
                      <td style={{ padding: "6px 8px", fontFamily: "monospace" }}>{row.identifier}</td>
                      <td style={{ padding: "6px 8px" }}>
                        {row.matchedProduct ? (
                          <span>
                            <strong>{row.matchedProduct.en}</strong> ({row.matchedProduct.th})
                          </span>
                        ) : (
                          <span style={{ color: "var(--muted)", fontStyle: "italic" }}>
                            {tr("No matching product", "ไม่พบสินค้า")}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "6px 8px", fontWeight: 700 }}>
                        {row.stock !== undefined ? (
                          mode === "replace" ? (
                            `= ${row.stock}`
                          ) : (
                            `+ ${row.stock} (now: ${row.matchedProduct?.stock || 0})`
                          )
                        ) : (
                          "-"
                        )}
                      </td>
                      <td style={{ padding: "6px 8px" }}>
                        {row.status === "match" ? (
                          <span style={{ color: "#059669", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                            <CheckCircle2 size={12} /> {tr("Ready", "พร้อมอัปเดต")}
                          </span>
                        ) : (
                          <span style={{ color: "#dc2626", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                            <AlertCircle size={12} /> {tr("Skip", "ข้าม")}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
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
            disabled={matchCount === 0}
            onClick={applyUpdates}
            style={{ fontWeight: 700 }}
          >
            <RefreshCw size={15} />
            {tr(`Apply ${matchCount} Stock Updates`, `ยืนยันอัปเดตสต็อก ${matchCount} รายการ`)}
          </button>
        </div>
      </div>
    </Modal>
  );
}

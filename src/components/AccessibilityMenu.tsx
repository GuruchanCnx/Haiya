import React, { useState, useRef, useEffect } from "react";
import { Eye, Type, SunMoon, Sparkles, Check } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { triggerHaptic } from "../lib/store";

export interface AccessibilityMenuProps {
  contrast: boolean;
  setContrast: (val: boolean | ((old: boolean) => boolean)) => void;
  large: boolean;
  setLarge: (val: boolean | ((old: boolean) => boolean)) => void;
  motion?: boolean;
  setMotion?: (val: boolean | ((old: boolean) => boolean)) => void;
}

export function AccessibilityMenu({
  contrast,
  setContrast,
  large,
  setLarge,
  motion = false,
  setMotion,
}: AccessibilityMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { tr } = useLanguage();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Close on Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const toggleElderMode = () => {
    triggerHaptic("medium");
    setLarge(!large);
  };

  const toggleHighContrast = () => {
    triggerHaptic("medium");
    setContrast(!contrast);
  };

  const toggleReduceMotion = () => {
    if (setMotion) {
      triggerHaptic("medium");
      setMotion(!motion);
    }
  };

  const activeFeaturesCount = (large ? 1 : 0) + (contrast ? 1 : 0) + (motion ? 1 : 0);

  return (
    <div className="a11y-menu-container" ref={menuRef}>
      <button
        type="button"
        className={`a11y-trigger-btn liquid-glass-btn ${
          activeFeaturesCount > 0 ? "a11y-active" : ""
        }`}
        onClick={() => {
          triggerHaptic("light");
          setOpen((prev) => !prev);
        }}
        aria-expanded={open}
        aria-haspopup="true"
        title={tr("Accessibility & Legibility Settings", "การตั้งค่าการช่วยการเข้าถึงและการมองเห็น")}
        aria-label={tr("Accessibility Menu", "เมนูการช่วยการเข้าถึง")}
      >
        <Eye size={16} strokeWidth={2.2} />
        <span className="a11y-btn-label">{tr("Accessibility", "การเข้าถึง")}</span>
        {activeFeaturesCount > 0 && (
          <span className="a11y-badge-count">{activeFeaturesCount}</span>
        )}
      </button>

      {open && (
        <div
          className="a11y-dropdown-card liquid-glass-ios27"
          role="dialog"
          aria-label={tr("Accessibility Options", "ตัวเลือกการเข้าถึง")}
        >
          <div className="a11y-header">
            <div className="a11y-header-title">
              <Sparkles size={15} className="text-amber-600" />
              <strong>{tr("Accessibility & Display", "การมองเห็นและการอ่าน")}</strong>
            </div>
            <p className="a11y-header-desc">
              {tr(
                "Optimize readability, legibility, and contrast.",
                "ปรับแต่งการแสดงผลให้อ่านง่ายและสบายตายิ่งขึ้น"
              )}
            </p>
          </div>

          <div className="a11y-options-list">
            {/* Elder Mode / High-Legibility */}
            <button
              type="button"
              className={`a11y-option-item ${large ? "active" : ""}`}
              onClick={toggleElderMode}
              role="switch"
              aria-checked={large}
            >
              <div className="a11y-icon-box">
                <Type size={18} />
              </div>
              <div className="a11y-item-text">
                <div className="a11y-item-title-row">
                  <strong>{tr("Elder Mode (High Legibility)", "โหมดผู้สูงอายุ (ตัวหนังสือใหญ่)")}</strong>
                  {large && <Check size={16} className="text-emerald-700" />}
                </div>
                <small>
                  {tr(
                    "Increases text size, line heights, and tap target zones.",
                    "ขยายขนาดตัวอักษร เว้นระยะบรรทัด และปุ่มกดให้ชัดเจน"
                  )}
                </small>
              </div>
            </button>

            {/* High Contrast Mode */}
            <button
              type="button"
              className={`a11y-option-item ${contrast ? "active" : ""}`}
              onClick={toggleHighContrast}
              role="switch"
              aria-checked={contrast}
            >
              <div className="a11y-icon-box">
                <SunMoon size={18} />
              </div>
              <div className="a11y-item-text">
                <div className="a11y-item-title-row">
                  <strong>{tr("High Contrast Mode", "โหมดคอนทราสต์สูง")}</strong>
                  {contrast && <Check size={16} className="text-emerald-700" />}
                </div>
                <small>
                  {tr(
                    "Sharper text contrast, distinct border edges, and deep outlines.",
                    "เพิ่มความคมชัดของขอบ เส้น และสีตัวอักษรให้อ่านง่ายสูงสุด"
                  )}
                </small>
              </div>
            </button>

            {/* Reduced Motion */}
            {setMotion && (
              <button
                type="button"
                className={`a11y-option-item ${motion ? "active" : ""}`}
                onClick={toggleReduceMotion}
                role="switch"
                aria-checked={motion}
              >
                <div className="a11y-icon-box">
                  <span className="font-mono text-sm">⏱</span>
                </div>
                <div className="a11y-item-text">
                  <div className="a11y-item-title-row">
                    <strong>{tr("Reduce Motion", "ลดการเคลื่อนไหว")}</strong>
                    {motion && <Check size={16} className="text-emerald-700" />}
                  </div>
                  <small>
                    {tr(
                      "Minimizes decorative animations and slide effects.",
                      "ปิดเอฟเฟกต์ภาพเคลื่อนไหวเพื่อความสบายตา"
                    )}
                  </small>
                </div>
              </button>
            )}
          </div>

          <div className="a11y-footer">
            <span className="text-[11px] text-muted">
              {tr("Preferences saved automatically", "บันทึกการตั้งค่าลงในเครื่องอัตโนมัติ")}
            </span>
            {(large || contrast || motion) && (
              <button
                type="button"
                className="a11y-reset-btn"
                onClick={() => {
                  triggerHaptic("light");
                  setLarge(false);
                  setContrast(false);
                  if (setMotion) setMotion(false);
                }}
              >
                {tr("Reset to default", "คืนค่าเริ่มต้น")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AccessibilityMenu;

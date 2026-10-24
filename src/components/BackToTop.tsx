import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { triggerHaptic } from "../lib/store";
import { useLanguage } from "../context/LanguageContext";

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const { tr } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    triggerHaptic("light");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="back-to-top-btn liquid-glass-btn"
      aria-label={tr("Scroll back to top", "เลื่อนขึ้นด้านบน")}
      title={tr("Back to top", "กลับสู่ด้านบน")}
    >
      <ArrowUp size={18} strokeWidth={2.5} />
      <span className="back-to-top-text">{tr("Top", "บนสุด")}</span>
    </button>
  );
}

export default BackToTop;

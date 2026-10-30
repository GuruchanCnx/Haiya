import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { TrendingUp, Calendar, CreditCard, ShoppingBag } from "lucide-react";
import { Order } from "../lib/store";
import { useLanguage } from "../context/LanguageContext";

interface CustomerSpendingChartProps {
  orders: Order[];
}

interface MonthlyData {
  monthKey: string;
  monthLabel: string;
  spent: number;
  ordersCount: number;
}

export default function CustomerSpendingChart({ orders }: CustomerSpendingChartProps) {
  const { lang, tr } = useLanguage();

  const data: MonthlyData[] = useMemo(() => {
    const monthlyMap = new Map<string, { spent: number; ordersCount: number; dateObj: Date }>();

    // Generate past 6 months base to always show a nice trend timeline
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, { spent: 0, ordersCount: 0, dateObj: d });
    }

    orders.forEach((o) => {
      const orderDate = new Date(o.created || `${o.date}T12:00:00Z`);
      if (isNaN(orderDate.getTime())) return;
      const key = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, "0")}`;

      const existing = monthlyMap.get(key) || { spent: 0, ordersCount: 0, dateObj: orderDate };
      existing.spent += o.total;
      existing.ordersCount += 1;
      monthlyMap.set(key, existing);
    });

    const entries = Array.from(monthlyMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    return entries.map(([key, val]) => {
      const label = new Intl.DateTimeFormat(lang === "en" ? "en-US" : "th-TH", {
        month: "short",
        year: "2-digit",
      }).format(val.dateObj);

      return {
        monthKey: key,
        monthLabel: label,
        spent: Math.round(val.spent),
        ordersCount: val.ordersCount,
      };
    });
  }, [orders, lang]);

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const avgMonthly = data.length > 0 ? Math.round(totalSpent / data.length) : 0;
  const peakMonth = useMemo(() => {
    if (data.length === 0) return null;
    return [...data].sort((a, b) => b.spent - a.spent)[0];
  }, [data]);

  return (
    <div className="panel" style={{ padding: "18px 20px", marginBottom: "20px", background: "var(--surface)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--green)", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            <TrendingUp size={14} />
            {tr("Customer Insights", "ข้อมูลการใช้จ่ายของคุณ")}
          </div>
          <h3 style={{ margin: "4px 0 2px", fontSize: "17px", fontWeight: 700, color: "var(--text)" }}>
            {tr("Monthly Spending Trends", "แนวโน้มการใช้จ่ายรายเดือน")}
          </h3>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--muted)" }}>
            {tr(
              "Track your daily breakfast and fresh soy milk spending over recent months.",
              "ติดตามยอดสั่งซื้ออาหารเช้าและน้ำเต้าหู้สดของคุณในช่วงเดือนที่ผ่านมา"
            )}
          </p>
        </div>

        {/* Highlight Stats Chips */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <div style={{ padding: "6px 12px", background: "var(--surface-warm)", borderRadius: "8px", border: "1px solid var(--line)", textAlign: "center" }}>
            <span style={{ fontSize: "10px", color: "var(--muted)", display: "block" }}>
              <CreditCard size={11} style={{ display: "inline", marginRight: "3px" }} />
              {tr("Avg / Month", "เฉลี่ยต่อเดือน")}
            </span>
            <strong style={{ fontSize: "13px", color: "var(--green)" }}>฿{avgMonthly}</strong>
          </div>
          {peakMonth && peakMonth.spent > 0 && (
            <div style={{ padding: "6px 12px", background: "var(--soft-green)", borderRadius: "8px", border: "1px solid rgba(49,85,63,0.2)", textAlign: "center" }}>
              <span style={{ fontSize: "10px", color: "var(--green)", display: "block" }}>
                <Calendar size={11} style={{ display: "inline", marginRight: "3px" }} />
                {tr("Peak", "สูงสุด")} ({peakMonth.monthLabel})
              </span>
              <strong style={{ fontSize: "13px", color: "var(--green)" }}>฿{peakMonth.spent}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas */}
      <div style={{ width: "100%", height: 210 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" opacity={0.6} />
            <XAxis
              dataKey="monthLabel"
              tickLine={false}
              axisLine={{ stroke: "var(--line)" }}
              tick={{ fontSize: 11, fill: "var(--muted)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "var(--line)" }}
              tick={{ fontSize: 10, fill: "var(--muted)" }}
              tickFormatter={(v) => `฿${v}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload as MonthlyData;
                return (
                  <div
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--line)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      fontSize: "12px",
                    }}
                  >
                    <strong style={{ display: "block", color: "var(--text)", marginBottom: "4px" }}>
                      {d.monthLabel}
                    </strong>
                    <div style={{ color: "var(--green)", fontWeight: 700 }}>
                      ฿{d.spent.toLocaleString()}
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: "11px", marginTop: "2px" }}>
                      <ShoppingBag size={11} style={{ display: "inline", marginRight: "3px" }} />
                      {d.ordersCount} {tr("orders", "ออเดอร์")}
                    </div>
                  </div>
                );
              }}
            />
            <Bar dataKey="spent" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.spent === peakMonth?.spent && entry.spent > 0 ? "var(--green)" : "#4f7a5b"}
                  opacity={entry.spent > 0 ? 0.95 : 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

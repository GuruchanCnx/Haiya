import React, { useMemo, useState } from "react";
import {
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Legend,
} from "recharts";
import { Order } from "../lib/store";
import { useLanguage } from "../context/LanguageContext";
import { TrendingUp, ShoppingBag, Store, Banknote, Calendar } from "lucide-react";

interface AdminRevenueChartProps {
  orders: Order[];
}

export function AdminRevenueChart({ orders }: AdminRevenueChartProps) {
  const { tr } = useLanguage();
  const [chartMode, setChartMode] = useState<"both" | "line" | "revenue" | "volume">("line");

  // Aggregate orders by date
  const { chartData, metrics } = useMemo(() => {
    const dateMap = new Map<
      string,
      {
        date: string;
        formattedDate: string;
        revenue: number;
        volume: number;
        walkInCount: number;
        pickupCount: number;
      }
    >();

    let totalRevenue = 0;
    let totalWalkIn = 0;
    let totalPickup = 0;

    // Default 7 days sequence if data is sparse
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const iso = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dateMap.set(iso, {
        date: iso,
        formattedDate: label,
        revenue: 0,
        volume: 0,
        walkInCount: 0,
        pickupCount: 0,
      });
    }

    orders.forEach((ord) => {
      // Clean order date format
      const rawDate = ord.date || ord.created?.split("T")[0] || new Date().toISOString().split("T")[0];
      const iso = rawDate.length === 10 ? rawDate : rawDate.slice(0, 10);
      
      const rev = Number(ord.total) || 0;
      totalRevenue += rev;
      
      const isWalkIn = ord.orderType === "walk-in" || ord.window?.toLowerCase().includes("walk-in");
      if (isWalkIn) {
        totalWalkIn++;
      } else {
        totalPickup++;
      }

      if (!dateMap.has(iso)) {
        const d = new Date(iso);
        const label = isNaN(d.getTime())
          ? iso
          : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dateMap.set(iso, {
          date: iso,
          formattedDate: label,
          revenue: 0,
          volume: 0,
          walkInCount: 0,
          pickupCount: 0,
        });
      }

      const entry = dateMap.get(iso)!;
      entry.revenue += rev;
      entry.volume += 1;
      if (isWalkIn) {
        entry.walkInCount += 1;
      } else {
        entry.pickupCount += 1;
      }
    });

    const dataList = Array.from(dateMap.values()).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const aov = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

    return {
      chartData: dataList,
      metrics: {
        totalRevenue,
        totalOrders: orders.length,
        aov,
        totalWalkIn,
        totalPickup,
      },
    };
  }, [orders]);

  return (
    <div className="admin-revenue-analytics liquid-glass-card">
      <div className="analytics-header">
        <div className="analytics-title-group">
          <div className="analytics-icon-badge">
            <TrendingUp size={18} className="text-emerald-700" />
          </div>
          <div>
            <h3>{tr("Revenue & Order Volume Trends", "แนวโน้มรายได้และยอดสั่งซื้อประจำวัน")}</h3>
            <p className="text-xs text-muted">
              {tr(
                "Daily performance breakdown with walk-in vs pickup analytics",
                "สถิติยอดขายและจำนวนออเดอร์รายวัน แบ่งตามลูกค้ารับที่ร้านและสั่งล่วงหน้า"
              )}
            </p>
          </div>
        </div>

        <div className="chart-mode-toggles">
          <button
            type="button"
            className={`chart-pill ${chartMode === "line" ? "active" : ""}`}
            onClick={() => setChartMode("line")}
          >
            <Calendar size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
            {tr("Revenue Trends Line", "กราฟเส้นแนวโน้มรายได้")}
          </button>
          <button
            type="button"
            className={`chart-pill ${chartMode === "both" ? "active" : ""}`}
            onClick={() => setChartMode("both")}
          >
            {tr("Combined Area & Bar", "กราฟรวม")}
          </button>
          <button
            type="button"
            className={`chart-pill ${chartMode === "revenue" ? "active" : ""}`}
            onClick={() => setChartMode("revenue")}
          >
            {tr("Revenue (฿)", "รายได้ (฿)")}
          </button>
          <button
            type="button"
            className={`chart-pill ${chartMode === "volume" ? "active" : ""}`}
            onClick={() => setChartMode("volume")}
          >
            {tr("Orders (Count)", "จำนวนออเดอร์")}
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="revenue-kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-emerald-50 text-emerald-700">
            <Banknote size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">{tr("Total Revenue", "รายได้รวม")}</span>
            <strong className="kpi-value text-emerald-800">฿{metrics.totalRevenue.toLocaleString()}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-amber-50 text-amber-700">
            <ShoppingBag size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">{tr("Total Orders", "ยอดสั่งซื้อทั้งหมด")}</span>
            <strong className="kpi-value">{metrics.totalOrders}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-blue-50 text-blue-700">
            <TrendingUp size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">{tr("Avg Order Value", "เฉลี่ยต่อบิล")}</span>
            <strong className="kpi-value">฿{metrics.aov}</strong>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap bg-stone-100 text-stone-700">
            <Store size={18} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">{tr("Customer Type", "ประเภทลูกค้า")}</span>
            <span className="kpi-subtext">
              <span className="text-emerald-700 font-semibold">{metrics.totalWalkIn} {tr("Walk-in", "หน้าร้าน")}</span>
              {" · "}
              <span className="text-amber-700 font-semibold">{metrics.totalPickup} {tr("Pickup", "รับล่วงหน้า")}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Visualization */}
      <div className="revenue-chart-container" style={{ width: "100%", height: 290 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 16, right: 16, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#31553f" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#31553f" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 0, 0, 0.07)" />
            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              tick={{ fill: "#64748b", fontSize: 11 }}
            />
            <YAxis
              yAxisId="revenueAxis"
              orientation="left"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#31553f", fontSize: 11 }}
              tickFormatter={(val) => `฿${val}`}
              hide={chartMode === "volume"}
            />
            <YAxis
              yAxisId="volumeAxis"
              orientation="right"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#b38c49", fontSize: 11 }}
              allowDecimals={false}
              hide={chartMode === "revenue"}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="chart-tooltip-box liquid-glass-ios27">
                      <div className="tooltip-date font-semibold mb-1 text-xs">{label}</div>
                      <div className="tooltip-metric text-emerald-800 font-medium text-xs">
                        {tr("Revenue", "รายได้")}: ฿{data.revenue.toLocaleString()}
                      </div>
                      <div className="tooltip-metric text-amber-800 text-xs">
                        {tr("Total Orders", "จำนวนออเดอร์")}: {data.volume}
                      </div>
                      <div className="tooltip-sub text-[10px] text-muted mt-1 border-t border-slate-200/50 pt-1">
                        {tr("Walk-in", "หน้าร้าน")}: {data.walkInCount} | {tr("Pickup", "รับล่วงหน้า")}: {data.pickupCount}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 12, fontSize: 11 }}
            />
            {chartMode === "line" && (
              <Line
                yAxisId="revenueAxis"
                type="monotone"
                dataKey="revenue"
                name={tr("Weekly Revenue Trend (฿)", "แนวโน้มรายได้ประจำสัปดาห์ (฿)")}
                stroke="#1b4d3e"
                strokeWidth={3.5}
                dot={{ r: 5, fill: "#1b4d3e", stroke: "#ffffff", strokeWidth: 2 }}
                activeDot={{ r: 8, fill: "#b38c49", stroke: "#ffffff", strokeWidth: 2 }}
              />
            )}
            {(chartMode === "both" || chartMode === "revenue") && (
              <Area
                yAxisId="revenueAxis"
                type="monotone"
                dataKey="revenue"
                name={tr("Daily Revenue (฿)", "รายได้ประจำวัน (฿)")}
                stroke="#31553f"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            )}
            {(chartMode === "both" || chartMode === "volume") && (
              <Bar
                yAxisId="volumeAxis"
                dataKey="volume"
                name={tr("Order Volume", "จำนวนออเดอร์")}
                fill="#b38c49"
                radius={[4, 4, 0, 0]}
                barSize={18}
                opacity={0.85}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AdminRevenueChart;

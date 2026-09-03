"use client";
import React, { useMemo } from "react";
import "@/lib/chart";
import { Bar } from "react-chartjs-2";

const parseSafeNumber = (val) => {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val || typeof val !== "string") return 0;
  const num = parseFloat(val.replace(/,/g, ""));
  return isNaN(num) ? 0 : num;
};

const parseDateSafe = (str) => {
  if (!str) return null;
  if (str instanceof Date && !isNaN(str.getTime())) return str;
  const clean = String(str).split("T")[0].replace(/\//g, "-").trim();
  const parts = clean.split("-").map(Number);
  if (parts.length === 3 && parts.every(p => !isNaN(p))) {
    if (parts[0] > 1900) return new Date(parts[0], parts[1] - 1, parts[2]);
    if (parts[2] > 1900) return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

const DAY_ORDER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DAY_NAME_MAP = {
  "mon": "Mon", "monday": "Mon",
  "tue": "Tue", "tuesday": "Tue",
  "wed": "Wed", "wednesday": "Wed",
  "thu": "Thu", "thursday": "Thu",
  "fri": "Fri", "friday": "Fri",
  "sat": "Sat", "saturday": "Sat",
  "sun": "Sun", "sunday": "Sun",
};

const DAY_INDEX_MAP = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

export function DeliveryByWeekday({ weekData = [], tableData: propTableData = [] }) {
  const weekdayList = useMemo(() => {
    // 1. Try to use backend-computed weekData if available and has impressions
    if (Array.isArray(weekData) && weekData.length > 0) {
      const mapped = {};
      DAY_ORDER.forEach(d => { mapped[d] = 0; });
      let hasAnyWeekImp = false;

      weekData.forEach(item => {
        const rawName = String(item.name || item.day || "").toLowerCase().trim();
        const stdDay = DAY_NAME_MAP[rawName];
        if (stdDay) {
          const imp = parseSafeNumber(item.impressions || item.Impressions || 0);
          mapped[stdDay] = (mapped[stdDay] || 0) + imp;
          if (imp > 0) hasAnyWeekImp = true;
        }
      });

      if (hasAnyWeekImp) {
        return DAY_ORDER.map(day => ({
          day,
          impr: mapped[day] || 0,
        }));
      }
    }

    // 2. Aggregate from tableData / enrichedTableData
    if (Array.isArray(propTableData) && propTableData.length > 0) {
      const mapped = {};
      DAY_ORDER.forEach(d => { mapped[d] = 0; });

      propTableData.forEach(r => {
        const dateStr = r.period || r.Date || r.date || r.startDate;
        const d = parseDateSafe(dateStr);
        if (d) {
          const dayName = DAY_INDEX_MAP[d.getDay()];
          if (dayName) {
            const imp = parseSafeNumber(r.rawImp !== undefined ? r.rawImp : (r.Impressions || r.impressions || 0));
            mapped[dayName] = (mapped[dayName] || 0) + imp;
          }
        }
      });

      return DAY_ORDER.map(day => ({
        day,
        impr: mapped[day] || 0,
      }));
    }

    // 3. Fallback: all zeros (never show hardcoded fake numbers)
    return DAY_ORDER.map(day => ({ day, impr: 0 }));
  }, [weekData, propTableData]);

  const totalImpr = useMemo(() => {
    return weekdayList.reduce((acc, d) => acc + d.impr, 0);
  }, [weekdayList]);

  const peakDay = useMemo(() => {
    if (totalImpr === 0) return null;
    return weekdayList.reduce((max, d) => d.impr > max.impr ? d : max, weekdayList[0]);
  }, [weekdayList, totalImpr]);

  const chartData = {
    labels: weekdayList.map(d => d.day),
    datasets: [
      {
        label: "Impressions",
        data: weekdayList.map(d => d.impr),
        backgroundColor: weekdayList.map(d => (peakDay && d.day === peakDay.day) ? "#2563EB" : "#93C5FD"),
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 36
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.95)",
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
        callbacks: {
          label: (context) => ` ${Number(context.raw || 0).toLocaleString('en-IN')} impressions`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#475569",
          font: { size: 12, weight: "bold" }
        }
      },
      y: {
        grid: { color: "#F1F5F9" },
        beginAtZero: true,
        ticks: {
          color: "#64748B",
          font: { size: 11 },
          callback: (value) => value >= 1000 ? (value / 1000).toFixed(0) + "k" : value
        }
      }
    }
  };

  return (
    <div className="st-panel">
      <div className="st-panel-header">
        <div>
          <div className="st-panel-title">Delivery by Weekday</div>
          <div className="st-panel-sub">Impressions distribution across days of the week</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {peakDay && peakDay.impr > 0 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 999,
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              color: "#1D4ED8",
              fontSize: 12,
              fontWeight: 700
            }}>
              🔥 Peak: {peakDay.day} ({peakDay.impr.toLocaleString('en-IN')})
            </div>
          )}
        </div>
      </div>

      <div style={{ height: "240px", width: "100%", marginTop: 12 }}>
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}

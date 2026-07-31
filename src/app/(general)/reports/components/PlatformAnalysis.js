"use client";
import React, { useMemo } from "react";
import "@/lib/chart";
import { Doughnut } from "react-chartjs-2";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#0EA5E9", "#6366F1", "#F43F5E"];

const getDeviceIcon = (label) => {
  const name = String(label || "").toLowerCase();
  if (name.includes("smart") || name.includes("phone") || name.includes("mobile")) return "📱";
  if (name.includes("desktop") || name.includes("computer") || name.includes("pc") || name.includes("laptop")) return "💻";
  if (name.includes("tv") || name.includes("ctv") || name.includes("connected")) return "📺";
  if (name.includes("video") || name.includes("instream")) return "🎬";
  if (name.includes("tablet") || name.includes("ipad")) return "📱";
  return "🌐";
};

export function PlatformAnalysis({ deviceData = [], platformData = [] }) {
  const propData = (Array.isArray(deviceData) && deviceData.length > 0) ? deviceData : platformData;

  const dList = useMemo(() => {
    if (!Array.isArray(propData) || propData.length === 0) return [];

    const groups = {};
    propData.forEach((row) => {
      let rawTitle = String(
        row.device ||
        row.Device ||
        row.deviceType ||
        row.device_type ||
        row.adType ||
        row.Adtype ||
        row.ad_type ||
        row.Placement ||
        row.placement ||
        row.name ||
        row.title ||
        "Unknown"
      ).trim();

      let title = rawTitle;
      const lower = rawTitle.toLowerCase();
      if (lower.includes("smart") || lower.includes("phone") || lower.includes("mobile")) title = "Mobile";
      else if (lower.includes("desktop") || lower.includes("computer") || lower.includes("pc") || lower.includes("laptop")) title = "Desktop";
      else if (lower.includes("tv") || lower.includes("ctv") || lower.includes("connected")) title = "CTV";
      else if (lower.includes("tablet") || lower.includes("ipad")) title = "Tablet";
      else if (lower.includes("video") || lower.includes("instream")) title = "Video";

      const imp = Number(row.Impressions || row.impressions || 0);
      const clk = Number(row.Clicks || row.clicks || 0);

      if (!groups[title]) {
        groups[title] = { title, imp: 0, clk: 0 };
      }
      groups[title].imp += imp;
      groups[title].clk += clk;
    });

    const groupList = Object.values(groups).sort((a, b) => b.imp - a.imp);
    const totalImp = groupList.reduce((s, g) => s + g.imp, 0);

    return groupList.map((g, i) => {
      const pct = totalImp > 0 ? (g.imp / totalImp * 100) : 0;
      const formattedPct = pct > 0 && pct < 0.01 ? "0.01" : pct.toFixed(2);
      const ctr = g.clk > 0 && g.imp > 0 ? (g.clk / g.imp * 100).toFixed(2) + "%" : "0.00%";

      return {
        label: g.title,
        pctVal: pct,
        pctStr: formattedPct + "%",
        imprVal: g.imp,
        imprStr: g.imp.toLocaleString('en-IN'),
        ctr,
        color: COLORS[i % COLORS.length],
        icon: getDeviceIcon(g.title),
      };
    });
  }, [propData]);

  const totalImpr = useMemo(() => {
    return dList.reduce((acc, item) => acc + item.imprVal, 0);
  }, [dList]);

  const chartData = {
    labels: dList.map(d => d.label),
    datasets: [
      {
        data: dList.map(d => d.imprVal),
        backgroundColor: dList.map(d => d.color),
        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  };

  const chartOptions = {
    cutout: "72%",
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
          label: (context) => ` ${context.label}: ${Number(context.raw).toLocaleString('en-IN')} impressions`
        }
      }
    }
  };

  return (
    <div className="st-panel">
      <div className="st-panel-header">
        <div>
          <div className="st-panel-title">Device & Platform Distribution</div>
          <div className="st-panel-sub">Impression share across CTV, Mobile, Video, Desktop & Devices</div>
        </div>
      </div>

      {dList.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center", marginTop: 8 }}>
          {/* Left: Device Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {dList.map((item, idx) => (
              <div key={idx} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                border: "1px solid #E9EEF5",
                borderRadius: 12,
                background: "#FAFAFA"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: item.color + "15",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                      {item.imprStr} impr · CTR {item.ctr}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right", width: 90 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 3 }}>
                    {item.pctStr}
                  </div>
                  <div className="st-progress-track" style={{ height: 4, background: "#E2E8F0", marginTop: 0 }}>
                    <div className="st-progress-fill" style={{ width: `${Math.max(item.pctVal, 3)}%`, background: item.color, borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Donut Chart & Center Total */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, background: "#F8FAFC", borderRadius: 12, padding: "20px" }}>
            <div style={{ position: "relative", width: "160px", height: "160px", flexShrink: 0 }}>
              <Doughnut data={chartData} options={chartOptions} />
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none"
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Imps</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", marginTop: 2 }}>{totalImpr.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dList.map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#334155", minWidth: 90 }}>{item.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{item.pctStr}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "30px", color: "#64748B", fontSize: 13 }}>
          No platform distribution data available for this date range.
        </div>
      )}
    </div>
  );
}

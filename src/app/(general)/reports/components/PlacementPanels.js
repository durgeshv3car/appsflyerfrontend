"use client";
import React, { useMemo } from "react";
import "@/lib/chart";
import { Doughnut } from "react-chartjs-2";

const PALETTE = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#0EA5E9", "#6366F1", "#F43F5E"];

export function PlacementPositionPanel({ placementPosData = [] }) {
  const processedData = useMemo(() => {
    const list = Array.isArray(placementPosData) ? placementPosData : (placementPosData?.data || placementPosData?.report || []);
    if (!list || list.length === 0) return [];

    const grouped = {};
    list.forEach((item, idx) => {
      const imp = Number(item.Impressions || item.impressions || 0);
      const clk = Number(item.Clicks || item.clicks || 0);
      const rawLabel = String(
        item.adPosition ||
        item.AdPosition ||
        item.placementpos ||
        item.placementPos ||
        item.Placementpos ||
        item.position ||
        item.Position ||
        item.name ||
        item.Title ||
        item.title ||
        `Position ${idx + 1}`
      ).trim();

      if (!grouped[rawLabel]) {
        grouped[rawLabel] = { label: rawLabel, imp: 0, clk: 0 };
      }
      grouped[rawLabel].imp += imp;
      grouped[rawLabel].clk += clk;
    });

    const items = Object.values(grouped).sort((a, b) => b.imp - a.imp);
    const totalImpressions = items.reduce((acc, it) => acc + it.imp, 0);

    return items.map((item, idx) => {
      const ctr = item.imp > 0 && item.clk > 0 ? (item.clk / item.imp * 100).toFixed(2) + "%" : "0.00%";
      const percentage = totalImpressions > 0 ? ((item.imp / totalImpressions) * 100).toFixed(2) : 0;
      return {
        label: item.label,
        value: item.imp,
        ctr,
        percentage: parseFloat(percentage),
        pctStr: percentage + "%",
        color: PALETTE[idx % PALETTE.length]
      };
    });
  }, [placementPosData]);

  const totalImpr = useMemo(() => {
    return processedData.reduce((s, d) => s + d.value, 0);
  }, [processedData]);

  const chartData = {
    labels: processedData.map(d => d.label),
    datasets: [
      {
        data: processedData.map(d => d.value),
        backgroundColor: processedData.map(d => d.color),
        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  };

  const chartOptions = {
    cutout: "74%",
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
    <div className="st-panel" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="st-panel-header">
        <div>
          <div className="st-panel-title">Placement Positions</div>
          <div className="st-panel-sub">Ad position impression distribution</div>
        </div>
      </div>

      {processedData.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 8, flex: 1 }}>
          {/* Top: Donut Chart & Legend */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: 16, background: "#F8FAFC", borderRadius: 12, padding: "16px" }}>
            <div style={{ position: "relative", width: "140px", height: "140px", flexShrink: 0 }}>
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
                <div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginTop: 1 }}>{totalImpr.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {processedData.slice(0, 4).map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: "#334155", maxWidth: 110, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: "#0F172A", marginLeft: "auto" }}>{item.pctStr}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Item List Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {processedData.slice(0, 5).map((item, idx) => (
              <div key={idx} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                border: "1px solid #E9EEF5",
                borderRadius: 10,
                background: "#fff"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: item.color + "18",
                    color: item.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 11,
                    flexShrink: 0
                  }}>
                    #{idx + 1}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
                      {item.value.toLocaleString('en-IN')} impr · CTR {item.ctr}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right", width: 75, flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
                    {item.pctStr}
                  </div>
                  <div className="st-progress-track" style={{ height: 4, background: "#E2E8F0", marginTop: 0 }}>
                    <div className="st-progress-fill" style={{ width: `${Math.max(item.percentage, 3)}%`, background: item.color, borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "30px", color: "#64748B", fontSize: 13 }}>
          No position data available for this date range.
        </div>
      )}
    </div>
  );
}

export function PlacementTypePanel({ placementTypeData = [] }) {
  const processedData = useMemo(() => {
    const list = Array.isArray(placementTypeData) ? placementTypeData : (placementTypeData?.data || placementTypeData?.report || []);
    if (!list || list.length === 0) return [];

    const grouped = {};
    list.forEach((item, idx) => {
      const imp = Number(item.Impressions || item.impressions || 0);
      const clk = Number(item.Clicks || item.clicks || 0);
      const rawLabel = String(
        item.adType ||
        item.Adtype ||
        item.ad_type ||
        item["Ad Type"] ||
        item.Placementtype ||
        item.placementtype ||
        item.placementType ||
        item.name ||
        item.Title ||
        item.title ||
        item.AdType ||
        item.type ||
        `Type ${idx + 1}`
      ).trim();

      let label = rawLabel;
      const lower = rawLabel.toLowerCase();
      if (lower.includes("ctv") || lower.includes("connected tv") || lower.includes("connectedtv")) {
        label = "CTV";
      } else if (lower.includes("video") || lower.includes("instream") || lower.includes("in-stream")) {
        label = "Video";
      } else if (lower.includes("display") || lower.includes("banner")) {
        label = "Display";
      } else if (lower.includes("audio")) {
        label = "Audio";
      } else if (lower.includes("native")) {
        label = "Native";
      }

      if (!grouped[label]) {
        grouped[label] = { label, imp: 0, clk: 0 };
      }
      grouped[label].imp += imp;
      grouped[label].clk += clk;
    });

    const items = Object.values(grouped).sort((a, b) => b.imp - a.imp);
    const totalImpressions = items.reduce((acc, it) => acc + it.imp, 0);

    return items.map((item, idx) => {
      const ctr = item.imp > 0 && item.clk > 0 ? (item.clk / item.imp * 100).toFixed(2) + "%" : "0.00%";
      const percentage = totalImpressions > 0 ? ((item.imp / totalImpressions) * 100).toFixed(2) : 0;
      return {
        label: item.label,
        value: item.imp,
        ctr,
        percentage: parseFloat(percentage),
        pctStr: percentage + "%",
        color: PALETTE[(idx + 2) % PALETTE.length]
      };
    });
  }, [placementTypeData]);

  const totalImpr = useMemo(() => {
    return processedData.reduce((s, d) => s + d.value, 0);
  }, [processedData]);

  const chartData = {
    labels: processedData.map(d => d.label),
    datasets: [
      {
        data: processedData.map(d => d.value),
        backgroundColor: processedData.map(d => d.color),
        borderWidth: 0,
        hoverOffset: 6
      }
    ]
  };

  const chartOptions = {
    cutout: "74%",
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
    <div className="st-panel" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="st-panel-header">
        <div>
          <div className="st-panel-title">Placement Interstitial</div>
          <div className="st-panel-sub">Ad format & placement type breakdown</div>
        </div>
      </div>

      {processedData.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 8, flex: 1 }}>
          {/* Top: Donut Chart & Legend */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: 16, background: "#F8FAFC", borderRadius: 12, padding: "16px" }}>
            <div style={{ position: "relative", width: "140px", height: "140px", flexShrink: 0 }}>
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
                <div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Total</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#0F172A", marginTop: 1 }}>{totalImpr.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {processedData.slice(0, 4).map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 600, color: "#334155", maxWidth: 110, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: "#0F172A", marginLeft: "auto" }}>{item.pctStr}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: Item List Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {processedData.slice(0, 5).map((item, idx) => (
              <div key={idx} style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                border: "1px solid #E9EEF5",
                borderRadius: 10,
                background: "#fff"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: item.color + "18",
                    color: item.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 11,
                    flexShrink: 0
                  }}>
                    #{idx + 1}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
                      {item.value.toLocaleString('en-IN')} impr · CTR {item.ctr}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: "right", width: 75, flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 2 }}>
                    {item.pctStr}
                  </div>
                  <div className="st-progress-track" style={{ height: 4, background: "#E2E8F0", marginTop: 0 }}>
                    <div className="st-progress-fill" style={{ width: `${Math.max(item.percentage, 3)}%`, background: item.color, borderRadius: 4 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "30px", color: "#64748B", fontSize: 13 }}>
          No format data available for this date range.
        </div>
      )}
    </div>
  );
}

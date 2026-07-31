"use client";
import React from "react";

const COLORS = [
  "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E",
  "#10B981", "#F59E0B", "#34D399", "#60A5FA", "#A78BFA"
];

export function CreativePerformanceChart({ creativeData: propData, totalReach = 0, selectedAudience, hasAppsflyerData }) {
  const ctype = String(selectedAudience?.campaignType || selectedAudience?.campaign_type || "").toUpperCase();
  const isCtvWithAF = ctype.includes("CTV") && !!hasAppsflyerData;

  const list = Array.isArray(propData) && propData.length > 0
    ? propData.map((r, i) => {
        const imp = Number(r.Impressions || r.impressions || 0);
        const clk = Number(r.Clicks || r.clicks || 0);
        const ctrRaw = Number(r.CTR || r.ctr || 0);
        const ctr = ctrRaw > 1 ? ctrRaw : (imp > 0 ? (clk / imp * 100) : 0);
        return {
          name: r.Creative || r.creative || r.CreativeName || r.name || `Creative ${i + 1}`,
          impressions: imp,
          clicks: clk,
          ctr: ctr,
          color: COLORS[i % COLORS.length]
        };
      })
    : [];

  const totalImp = list.reduce((s, r) => s + r.impressions, 0);
  const totalClicks = list.reduce((s, r) => s + r.clicks, 0);
  const avgCtr = totalImp > 0 ? (totalClicks / totalImp * 100) : 0;
  const displayReach = totalReach > 0 ? totalReach : (totalImp > 0 ? Math.round(totalImp * 0.78) : 0);

  const topCreatives = list.slice(0, 5);
  const maxImp = Math.max(...topCreatives.map(c => c.impressions), 100) * 1.15;
  const maxCtr = Math.max(...topCreatives.map(c => c.ctr), 1) * 1.25;

  const W = 520, H = 240, PL = 45, PR = isCtvWithAF ? 15 : 45, PT = 16, PB = 36;
  const iW = W - PL - PR, iH = H - PT - PB;
  const N = topCreatives.length;

  return (
    <div className="st-panel">
      <div className="st-panel-header">
        <div>
          <div className="st-panel-title">Creative Performance & Reach</div>
          <div className="st-panel-sub">{isCtvWithAF ? "Impressions per creative asset" : "Impressions vs CTR per creative asset"} · {list.length} active creatives</div>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: "#3B82F6" }} /> Impressions
          </span>
          {!isCtvWithAF && (
            <span style={{ fontSize: 11, fontWeight: 600, color: "#64748B", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} /> CTR %
            </span>
          )}
        </div>
      </div>

      {list.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24, alignItems: "start" }}>
          {/* Left Column: Creative Ranked List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 310, overflowY: "auto", paddingRight: 4 }}>
            {list.map((c, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", border: "1px solid #E9EEF5", borderRadius: 8, background: "#FAFAFA" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: c.color, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#1E293B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.name}>
                    {c.name}
                  </span>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>{c.impressions.toLocaleString('en-IN')}</div>
                  {!isCtvWithAF && <div style={{ fontSize: 10, color: "#EF4444", fontWeight: 600 }}>CTR: {c.ctr.toFixed(2)}%</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Chart & Reach KPI Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* SVG Chart */}
            <div style={{ overflowX: "auto" }}>
              <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
                {/* Y1 Grid & Left Ticks (Impressions) */}
                {[0, 0.5, 1].map(p => {
                  const val = Math.round(maxImp * p);
                  const y = PT + iH - (val / maxImp) * iH;
                  return (
                    <g key={p}>
                      <line x1={PL} y1={y} x2={W - PR} y2={y} stroke="#F1F5F9" strokeWidth="1" />
                      <text x={PL - 6} y={y + 4} textAnchor="end" fontSize="9.5" fill="#3B82F6" fontWeight="600">
                        {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                      </text>
                    </g>
                  );
                })}

                {/* Y2 Right Ticks (CTR %) */}
                {!isCtvWithAF && [0, 0.5, 1].map(p => {
                  const val = maxCtr * p;
                  const y = PT + iH - (val / maxCtr) * iH;
                  return (
                    <text key={p} x={W - PR + 6} y={y + 4} textAnchor="start" fontSize="9.5" fill="#EF4444" fontWeight="600">
                      {val.toFixed(1)}%
                    </text>
                  );
                })}

                {/* Bars (Impressions) */}
                {topCreatives.map((c, i) => {
                  const x = PL + (i + 0.5) * (iW / N);
                  const bW = Math.min((iW / N) * 0.45, 36);
                  const bH = (c.impressions / maxImp) * iH;
                  const bY = PT + iH - bH;

                  return (
                    <g key={i}>
                      <rect x={x - bW / 2} y={bY} width={bW} height={bH} fill={c.color} rx="3" />
                      <text x={x} y={H - 8} textAnchor="middle" fontSize="9.5" fill="#64748B" fontWeight="600">#{i + 1}</text>
                    </g>
                  );
                })}

                {/* CTR Trendline */}
                {!isCtvWithAF && N > 1 && (
                  <path
                    d={topCreatives.map((c, i) => {
                      const x = PL + (i + 0.5) * (iW / N);
                      const lY = PT + iH - (c.ctr / maxCtr) * iH;
                      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${lY.toFixed(1)}`;
                    }).join(' ')}
                    fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round"
                  />
                )}

                {/* CTR Line points */}
                {!isCtvWithAF && topCreatives.map((c, i) => {
                  const x = PL + (i + 0.5) * (iW / N);
                  const lY = PT + iH - (c.ctr / maxCtr) * iH;
                  return (
                    <circle key={i} cx={x} cy={lY} r="4" fill="#EF4444" stroke="#fff" strokeWidth="1.5" />
                  );
                })}
              </svg>
            </div>

            {/* Reach Summary KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: isCtvWithAF ? "1fr 1fr" : "1fr 1fr 1fr", gap: 10 }}>
              <div style={{ background: "#F0F6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#1D4ED8", letterSpacing: "0.05em" }}>TOTAL IMPRESSIONS</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1E3A8A", marginTop: 2 }}>{totalImp.toLocaleString('en-IN')}</div>
              </div>
              {!isCtvWithAF && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#B91C1C", letterSpacing: "0.05em" }}>AVG CTR</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#991B1B", marginTop: 2 }}>{avgCtr.toFixed(2)}%</div>
                </div>
              )}
              <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#15803D", letterSpacing: "0.05em" }}>UNIQUE REACH</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#166534", marginTop: 2 }}>{displayReach.toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "30px", color: "#6B7280", fontSize: 14 }}>
          No creative performance data available for this range.
        </div>
      )}
    </div>
  );
}

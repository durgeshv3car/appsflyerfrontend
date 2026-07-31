"use client";
import React from "react";

export const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export function TablePagination({ currentPage, totalPages, onPrev, onNext }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <button
        onClick={onPrev}
        disabled={currentPage === 1}
        title="Previous Page"
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          border: "1px solid #E2E8F0",
          background: currentPage === 1 ? "#F8FAFC" : "#FFFFFF",
          color: currentPage === 1 ? "#CBD5E1" : "#475569",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1,
          transition: "all 0.15s ease"
        }}
      >
        ‹
      </button>

      <div style={{ fontSize: 12, fontWeight: 500, color: "#64748B", padding: "0 4px" }}>
        Page <b style={{ color: "#0F172A", fontWeight: 700 }}>{currentPage}</b> of {totalPages}
      </div>

      <button
        onClick={onNext}
        disabled={currentPage >= totalPages}
        title="Next Page"
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          border: "1px solid #E2E8F0",
          background: currentPage >= totalPages ? "#F8FAFC" : "#FFFFFF",
          color: currentPage >= totalPages ? "#CBD5E1" : "#475569",
          cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1,
          transition: "all 0.15s ease"
        }}
      >
        ›
      </button>
    </div>
  );
}

export const DonutChart = ({ size = 120, data = [], label, subLabel }) => {
  const cx = size / 2, cy = size / 2, sw = size * 0.12, r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  
  let currentOffset = 0;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={sw}/>
        {data.map((d, i) => {
          const dash = (d.value / total) * circ;
          const element = (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={sw}
              strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-currentOffset} />
          );
          currentOffset += dash;
          return element;
        })}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <div style={{ fontSize: size * 0.16, fontWeight: 700, color: "#111827", lineHeight: 1.1 }}>{label}</div>
        {subLabel && <div style={{ fontSize: size * 0.085, color: "#9CA3AF", marginTop: 2 }}>{subLabel}</div>}
      </div>
    </div>
  );
};

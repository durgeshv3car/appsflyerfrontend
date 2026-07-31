"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Chart } from "chart.js/auto";

export function TrendChart({ tableData: propTableData, hasAppsflyerData, selectedAudience }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [hidden, setHidden] = useState(new Set());

  const ctype = String(selectedAudience?.campaignType || selectedAudience?.campaign_type || "").toUpperCase();
  const isCtvWithAF = ctype.includes("CTV") && !!hasAppsflyerData;

  const hasData = Array.isArray(propTableData) && propTableData.length > 0;

  const sortedTableData = useMemo(() => {
    if (!hasData) return [];
    return [...propTableData].sort((a, b) => {
      const dateA = new Date(a.period || a.Date || a.date || 0).getTime();
      const dateB = new Date(b.period || b.Date || b.date || 0).getTime();
      if (Number.isNaN(dateA) && Number.isNaN(dateB)) return 0;
      if (Number.isNaN(dateA)) return 1;
      if (Number.isNaN(dateB)) return -1;
      return dateA - dateB;
    });
  }, [propTableData, hasData]);

  const seriesData = useMemo(() => {
    if (!sortedTableData.length) return {};
    const impressions = sortedTableData.map(row => Number(row.Impressions || row.impressions || 0));
    const clicks = sortedTableData.map(row => Number(row.Clicks || row.clicks || 0));
    const ctr = sortedTableData.map(row => {
      const imp = Number(row.Impressions || row.impressions || 0);
      const cks = Number(row.Clicks || row.clicks || 0);
      const rawCtr = row.computedCtr !== undefined ? row.computedCtr : (row.CTR || row.ctr || 0);
      return rawCtr > 1 ? rawCtr : (imp > 0 ? (cks / imp) * 100 : 0);
    });
    const cost = sortedTableData.map(row => Number(row.computedSpend !== undefined ? row.computedSpend : (row.Cost || row.cost || 0)));
    const installs = sortedTableData.map(row => Number(row.computedInstalls || row.Installs || row.installs || 0));
    const conversions = sortedTableData.map(row => Number(row.computedConversions || row.Conversions || row.conversions || 0));
    return { impressions, clicks, ctr, cost, installs, conversions };
  }, [sortedTableData]);

  const legendConfigs = useMemo(() => {
    if (isCtvWithAF) {
      return [
        { key: "impressions", label: "Impressions", color: "#2ECC71" },
        { key: "installs", label: "Installs", color: "#6A5ACD" },
        { key: "conversions", label: "Conversions", color: "#E74C3C" },
      ];
    }

    const configs = [
      { key: "impressions", label: "Impressions", color: "#2ECC71" },
      { key: "clicks", label: "Clicks", color: "#1F6FEB" },
      { key: "ctr", label: "CTR", color: "#9B59B6" },
      { key: "cost", label: "Cost", color: "#F1C40F" },
    ];
    if (hasAppsflyerData) {
      configs.push({ key: "installs", label: "Installs", color: "#E67E22" });
      configs.push({ key: "conversions", label: "Conversions", color: "#E74C3C" });
    }
    return configs;
  }, [hasAppsflyerData, isCtvWithAF]);

  useEffect(() => {
    if (!chartRef.current || !hasData || sortedTableData.length === 0) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext("2d");
    const labels = sortedTableData.map(row => row.period || row.Date || row.date || "");

    const activeLegendConfigs = legendConfigs.filter(lc => !hidden.has(lc.key));
    const isSingle = activeLegendConfigs.length === 1;
    const isDual = activeLegendConfigs.length === 2;
    const isMulti = activeLegendConfigs.length > 2;

    const datasets = activeLegendConfigs.map((lc, idx) => {
      let yAxisID = "y";
      if (isSingle) {
        yAxisID = "y";
      } else if (isDual) {
        yAxisID = idx === 0 ? "y" : "y_right";
      } else {
        yAxisID = `axis_${lc.key}`;
      }

      return {
        label: lc.label,
        data: seriesData[lc.key] || [],
        borderColor: lc.color,
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: sortedTableData.length <= 2 ? 6 : 4,
        pointHoverRadius: sortedTableData.length <= 2 ? 8 : 6,
        pointStyle: "rect",
        pointBackgroundColor: lc.color,
        borderWidth: sortedTableData.length <= 2 ? 3 : 2,
        yAxisID,
      };
    });

    const isCountKey = (key) => key !== "ctr" && key !== "cost";

    const formatValue = (val, key) => {
      if (key === "ctr") return val.toFixed(1) + "%";
      if (key === "cost") return "₹" + (val >= 1000 ? (val / 1000).toFixed(0) + "k" : val);
      if (val >= 1000000) return (val / 1000000).toFixed(1) + "M";
      if (val >= 100000) return (val / 100000).toFixed(1) + "L";
      if (val >= 1000) return (val / 1000).toFixed(0) + "k";
      return String(Math.round(val));
    };

    const m1 = activeLegendConfigs[0];
    const m2 = activeLegendConfigs[1];

    const scalesConfig = {
      x: {
        grid: {
          display: true,
          color: "rgba(0,0,0,0.03)",
          drawBorder: false,
        },
        ticks: { color: "#888", font: { size: 10 }, padding: 10 },
        offset: true,
      },
    };

    if (isMulti) {
      // >2 metrics active -> staggered grace padding per scale so trend lines never touch or overlap
      activeLegendConfigs.forEach((lc, idx) => {
        const gracePercent = 15 + idx * 25;
        scalesConfig[`axis_${lc.key}`] = {
          display: false,
          beginAtZero: true,
          grace: `${gracePercent}%`,
          grid: { drawOnChartArea: false },
          ticks: { display: false }
        };
      });
    } else {
      scalesConfig.y = {
        display: true,
        position: "left",
        beginAtZero: true,
        grace: "15%",
        grid: { color: "rgba(0,0,0,0.05)", drawBorder: false },
        ticks: {
          display: true,
          precision: isCountKey(m1?.key) ? 0 : undefined,
          color: isSingle || isDual ? (m1 ? m1.color : "#64748B") : "#64748B",
          font: { size: 10, weight: "700" },
          callback: (val) => {
            if (isCountKey(m1?.key) && !Number.isInteger(val)) return null;
            return formatValue(val, m1?.key);
          }
        }
      };

      if (isDual && m2) {
        scalesConfig.y_right = {
          display: true,
          position: "right",
          beginAtZero: true,
          grace: "15%",
          grid: { drawOnChartArea: false },
          ticks: {
            display: true,
            precision: isCountKey(m2.key) ? 0 : undefined,
            color: m2.color,
            font: { size: 10, weight: "700" },
            callback: (val) => {
              if (isCountKey(m2.key) && !Number.isInteger(val)) return null;
              return formatValue(val, m2.key);
            }
          }
        };
      }
    }

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 20, bottom: 5, left: 15, right: 15 },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(255, 255, 255, 0.98)",
            titleColor: "#111",
            bodyColor: "#444",
            borderColor: "#eee",
            borderWidth: 1,
            padding: 12,
            usePointStyle: true,
            boxWidth: 8,
            boxHeight: 8,
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || "";
                if (label) label += ": ";
                const val = context.raw;
                if (context.dataset.label === "CTR") {
                  label += val.toFixed(2) + "%";
                } else if (context.dataset.label === "Cost") {
                  label += "₹" + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 });
                } else {
                  label += Number(val).toLocaleString('en-IN');
                }
                return label;
              }
            }
          },
        },
        scales: scalesConfig,
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [sortedTableData, hasData, legendConfigs, hidden, seriesData]);

  const toggleMetric = (key) => {
    setHidden(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (legendConfigs.length - next.size > 1) {
          next.add(key);
        }
      }
      return next;
    });
  };

  return (
    <div className="st-panel">
      <div className="st-panel-header">
        <div className="st-panel-title">Trend Analysis</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          {legendConfigs.map(item => (
            <button
              key={item.key}
              onClick={() => toggleMetric(item.key)}
              className="st-legend-btn"
              style={{ opacity: hidden.has(item.key) ? 0.35 : 1, cursor: "pointer" }}
            >
              <span className="st-legend-dot" style={{ background: item.color }} />
              <span style={{ fontWeight: 600, fontSize: 12, color: "#374151" }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>



      {hasData ? (
        <div style={{ height: "350px", width: "100%", position: "relative" }}>
          <canvas ref={chartRef}></canvas>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "40px", color: "#6B7280", fontSize: 14 }}>
          No trend data available for this date range.
        </div>
      )}
    </div>
  );
}

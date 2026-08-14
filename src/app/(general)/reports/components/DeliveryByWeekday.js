"use client";
import React, { useMemo } from "react";
import "@/lib/chart";
import { Bar } from "react-chartjs-2";
import { DownloadIcon } from "./Shared";

const defaultWeekdayData = [
  { day: "Mon", impr: 18400 },
  { day: "Tue", impr: 19800 },
  { day: "Wed", impr: 21400 },
  { day: "Thu", impr: 20200 },
  { day: "Fri", impr: 23500 },
  { day: "Sat", impr: 28600 },
  { day: "Sun", impr: 26500 },
];

export function DeliveryByWeekday({ tableData: propTableData }) {
  const hasData = Array.isArray(propTableData) && propTableData.length > 0;

  const weekdayList = useMemo(() => {
    return hasData
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(dayName => {
        const matchingRows = propTableData.filter(r => {
          const dateStr = r.period || r.Date || r.date;
          if (!dateStr) return false;
          const d = new Date(dateStr);
          return !isNaN(d) && d.toLocaleDateString('en-US', { weekday: 'short' }) === dayName;
        });
        const imprSum = matchingRows.reduce((acc, curr) => acc + Number(curr.Impressions || curr.impressions || 0), 0);
        return {
          day: dayName,
          impr: imprSum
        };
      })
      : defaultWeekdayData;
  }, [propTableData, hasData]);

  const maxImpr = useMemo(() => {
    return Math.max(...weekdayList.map(d => d.impr), 1);
  }, [weekdayList]);

  const peakDay = useMemo(() => {
    return weekdayList.reduce((max, d) => d.impr > max.impr ? d : max, weekdayList[0] || { day: "Sat", impr: 0 });
  }, [weekdayList]);

  const chartData = {
    labels: weekdayList.map(d => d.day),
    datasets: [
      {
        label: "Impressions",
        data: weekdayList.map(d => d.impr),
        backgroundColor: weekdayList.map(d => d.day === peakDay.day ? "#2563EB" : "#93C5FD"),
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
          label: (context) => ` ${Number(context.raw).toLocaleString('en-IN')} impressions`
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
          {peakDay && (
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

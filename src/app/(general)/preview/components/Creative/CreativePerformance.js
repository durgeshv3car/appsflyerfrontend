"use client";
import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js";
import "@/lib/chart";

const CreativePerformance = ({ CreativeTableData = [] }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && CreativeTableData.length > 0) {
      const ctx = chartRef.current.getContext("2d");

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const labels = CreativeTableData.map(item => item.Title || item.title || item.creative_name || item.Creative || item.name || item.creative || item.line_item_name || "Unknown");
      const impressionsData = CreativeTableData.map(item => Number(item.Impressions || item.impressions || 0));
      const ctrData = CreativeTableData.map(item => {
        const ctrString = String(item.CTR || item.ctr || "0%");
        return parseFloat(ctrString.replace('%', ''));
      });

      const maxImpressions = Math.max(...impressionsData, 100);
      const impressionsMax = Math.ceil(maxImpressions / 25000) * 25000 + 25000;

      const maxCTR = Math.max(...ctrData, 1);
      const ctrMax = Math.ceil(maxCTR * 10) / 10 + 0.4;

      const colors = [
        "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E",
        "#10B981", "#F59E0B", "#34D399", "#60A5FA", "#A78BFA"
      ];

      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels.map((_, i) => i + 1),
          datasets: [
            {
              label: "IMPRESSIONS",
              data: impressionsData,
              backgroundColor: labels.map((_, i) => colors[i % colors.length]),
              borderColor: labels.map((_, i) => colors[i % colors.length]),
              borderWidth: 0,
              yAxisID: "y",
              barThickness: 50, 
              maxBarThickness: 60,
              barPercentage: 0.8,
              categoryPercentage: 0.9,
              borderRadius: 4
            },
            {
              label: "CTR",
              data: ctrData,
              backgroundColor: "#EF4444",
              borderColor: "#EF4444",
              borderWidth: 2,
              yAxisID: "y1",
              type: "line",
              pointRadius: 4,
              pointStyle: 'circle',
              pointBackgroundColor: "#EF4444",
              fill: false,
              tension: 0.3, 
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              titleColor: '#1f2937',
              bodyColor: '#4b5563',
              borderColor: '#e5e7eb',
              borderWidth: 1,
              padding: 12,
              usePointStyle: true,
              callbacks: {
                title: (items) => labels[items[0].dataIndex],
                label: (context) => {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  if (context.datasetIndex === 0) {
                    label += context.raw >= 1000 ? (context.raw / 1000).toFixed(1) + 'k' : context.raw;
                  } else {
                    label += context.raw.toFixed(2) + '%';
                  }
                  return label;
                }
              }
            }
          },
          layout: {
              padding: { top: 20, bottom: 10, left: 10, right: 10 }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { 
                font: { size: 10, weight: '600' },
                color: '#9ca3af'
              }
            },
            y: {
              type: "linear",
              position: "left",
              beginAtZero: true,
              max: impressionsMax,
              ticks: {
                callback: (v) => v >= 1000 ? (v / 1000) + 'k' : v,
                color: "#3B82F6",
                font: { size: 11, family: 'Inter' },
                stepSize: 25000,
              },
              grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false }
            },
            y1: {
              type: "linear",
              position: "right",
              beginAtZero: true,
              max: ctrMax,
              ticks: {
                callback: (v) => v.toFixed(1) + '%',
                color: "#EF4444",
                font: { size: 11, family: 'Inter' },
                stepSize: 0.4,
              },
              grid: { display: false, drawBorder: false },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [CreativeTableData]);

  const colors = [
    "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E",
    "#10B981", "#F59E0B", "#34D399", "#60A5FA", "#A78BFA"
  ];

  return (
    <div className="card border-0 shadow-sm mb-4 overflow-hidden">
      <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
        <div className="d-flex justify-content-between align-items-center w-100">
          <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>Creatives Performance</h5>
          <div className="d-flex gap-4">
            <div className="d-flex align-items-center gap-2">
              <span style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#3B82F6', display: 'inline-block' }}></span>
              <span className="text-secondary fw-bold" style={{ fontSize: '12px', letterSpacing: '0.4px' }}>IMPRESSIONS</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444', display: 'inline-block' }}></span>
              <span className="text-secondary fw-bold" style={{ fontSize: '12px', letterSpacing: '0.4px' }}>CTR</span>
            </div>
          </div>
        </div>
      </div>
      <div className="card-body p-4">
        <div className="row g-4" style={{ height: "450px" }}>
          {/* Left Side: Names Column */}
          <div className="col-md-4 h-100 border-end pr-3" style={{ overflowY: 'auto' }}>
            <div className="d-flex flex-column gap-3 py-2">
              {CreativeTableData.map((item, index) => {
                const title = item.Title || item.title || item.creative_name || item.Creative || item.name || "Unknown";
                return (
                  <div key={index} className="d-flex align-items-start gap-3 p-2 rounded-3 hover-bg-light transition-all" style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <div className="d-flex align-items-center justify-content-center fw-bold text-white rounded-circle" 
                         style={{ minWidth: '24px', height: '24px', fontSize: '11px', backgroundColor: colors[index % colors.length] }}>
                      {index + 1}
                    </div>
                    <div className="text-dark fw-medium" style={{ fontSize: '12px', lineHeight: '1.4', wordBreak: 'break-all' }}>
                      {title}
                    </div>
                  </div>
                );
              })}
              {CreativeTableData.length === 0 && (
                <div className="text-muted text-center mt-5">No creatives found</div>
              )}
            </div>
          </div>

          {/* Right Side: Graph */}
          <div className="col-md-8 h-100">
            {CreativeTableData.length > 0 ? (
                <canvas ref={chartRef}></canvas>
            ) : (
                <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted border rounded-3 bg-light">
                  <div className="text-center">
                    <i className="bi bi-graph-up d-block fs-2 mb-2 opacity-25"></i>
                    No data available
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativePerformance;
"use client";
import React, { useEffect, useRef } from "react";
import * as Chart from "chart.js";

const OsPerformance = ({ osData = [] }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && osData.length > 0) {
      const ctx = chartRef.current.getContext("2d");

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const labels = osData.map(item => item.name || item.oses || "");
      const impressionsData = osData.map(item => Number(item.Impressions || item.impressions || 0));
      const ctrData = osData.map(item => {
        const ctrVal = item.CTR || item.ctr || 0;
        return typeof ctrVal === 'string' ? parseFloat(ctrVal.replace('%', '')) : Number(ctrVal);
      });

      const maxImpressions = Math.max(...impressionsData, 100);
      const impressionsMax = Math.ceil(maxImpressions / 25000) * 25000 + 25000;

      const maxCTR = Math.max(...ctrData, 1);
      const ctrMax = Math.ceil(maxCTR * 10) / 10 + 0.4;

      chartInstance.current = new Chart.Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "IMPRESSIONS",
              data: impressionsData,
              backgroundColor: "#3B82F6",
              borderColor: "#3B82F6",
              borderWidth: 0,
              yAxisID: "y",
              barThickness: 40, 
              maxBarThickness: 60,
              borderRadius: 0
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
              pointStyle: 'rect',
              pointBackgroundColor: "#EF4444",
              fill: false,
              tension: 0.4, 
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
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              titleColor: '#333',
              bodyColor: '#666',
              borderColor: '#eee',
              borderWidth: 1,
              padding: 12,
              usePointStyle: true,
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { 
                font: { size: 10 }, 
                color: '#666', 
                padding: 10,
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
                font: { size: 11 },
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
                callback: (v) => v.toFixed(1),
                color: "#EF4444",
                font: { size: 11 },
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
  }, [osData]);

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-0 pt-4 px-4 pb-3">
        <div className="d-flex justify-content-between align-items-center w-100">
          <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>Operating systems</h5>
          <div className="d-flex gap-4">
            <div className="d-flex align-items-center gap-2">
              <span style={{ width: '12px', height: '12px', backgroundColor: '#3B82F6', display: 'inline-block' }}></span>
              <span className="text-secondary fw-bold" style={{ fontSize: '12px', letterSpacing: '0.4px' }}>IMPRESSIONS</span>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span style={{ width: '12px', height: '12px', backgroundColor: '#EF4444', display: 'inline-block' }}></span>
              <span className="text-secondary fw-bold" style={{ fontSize: '12px', letterSpacing: '0.4px' }}>CTR</span>
            </div>
          </div>
        </div>
      </div>
      <div className="card-body p-4 pt-4">
        <div style={{ height: "400px", width: "100%" }}>
           {osData.length > 0 ? (
               <canvas ref={chartRef}></canvas>
           ) : (
               <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">No data available</div>
           )}
        </div>
      </div>
    </div>
  );
};

export default OsPerformance;

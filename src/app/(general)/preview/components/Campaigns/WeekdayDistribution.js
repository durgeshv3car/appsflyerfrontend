"use client";
import React, { useEffect, useRef } from "react";
import * as Chart from "chart.js";

const WeekdayDistribution = ({ tableData = [], weekData = [] }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const hasWeekData = weekData && weekData.length > 0;
    const hasTableData = tableData && tableData.length > 0;

    if (chartRef.current && (hasWeekData || hasTableData)) {
      const ctx = chartRef.current.getContext("2d");

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Day Names for labeling
      const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      let impressionsData = [];
      let ctrData = [];

      if (hasWeekData) {
        // Map the weekData (Sunday to Saturday) to our labels
        // weekData might be unsorted or full names
        const dayMap = {
          'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 'thursday': 4, 'friday': 5, 'saturday': 6
        };
        
        const sortedWeek = new Array(7).fill(null).map((_, i) => ({ impressions: 0, ctr: 0 }));
        weekData.forEach(item => {
          const idx = dayMap[item.name.toLowerCase()];
          if (idx !== undefined) {
            sortedWeek[idx] = {
              impressions: Number(item.impressions || 0),
              ctr: parseFloat(item.ctr || 0)
            };
          }
        });

        impressionsData = sortedWeek.map(d => d.impressions);
        ctrData = sortedWeek.map(d => d.ctr);
      } else {
        // Fallback to aggregation logic
        const aggregated = dayLabels.map(day => ({ 
          day, 
          impressions: 0, 
          clicks: 0, 
          ctrSum: 0, 
          count: 0 
        }));

        tableData.forEach(item => {
          const dateStr = item.Date || item.date;
          if (dateStr) {
            const date = new Date(dateStr);
            const dayIndex = date.getDay();
            const imp = Number(item.Impressions || item.impressions || 0);
            const clicks = Number(item.Clicks || item.clicks || 0);
            const ctrStr = String(item.CTR || item.ctr || "0%");
            const ctr = parseFloat(ctrStr.replace('%', ''));

            aggregated[dayIndex].impressions += imp;
            aggregated[dayIndex].clicks += clicks;
            aggregated[dayIndex].ctrSum += ctr;
            aggregated[dayIndex].count += 1;
          }
        });

        impressionsData = aggregated.map(d => d.impressions);
        ctrData = aggregated.map(d => d.count > 0 ? d.ctrSum / d.count : 0);
      }

      const maxImpressions = Math.max(...impressionsData, 100);
      const impressionsMax = Math.ceil(maxImpressions / 10000) * 10000 + 10000;

      const maxCTR = Math.max(...ctrData, 1);
      const ctrMax = Math.ceil(maxCTR * 10) / 10 + 0.4;

      chartInstance.current = new Chart.Chart(ctx, {
        type: "bar",
        data: {
          labels: dayLabels,
          datasets: [
            {
              label: "IMPRESSIONS",
              data: impressionsData,
              backgroundColor: "#3B82F6",
              borderColor: "#3B82F6",
              borderWidth: 0,
              yAxisID: "y",
              barThickness: 50,
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
              callbacks: {
                label: (context) => {
                  if (context.dataset.label === "CTR") return ` ${context.dataset.label}: ${context.raw.toFixed(2)}%`;
                  return ` ${context.dataset.label}: ${context.raw.toLocaleString()}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 12 }, color: '#333', padding: 10 }
            },
            y: {
              type: "linear",
              position: "left",
              beginAtZero: true,
              max: impressionsMax,
              ticks: {
                callback: (v) => v >= 1000 ? (v / 1000) + 'k' : v,
                color: "#3B82F6",
                font: { size: 12 },
                stepSize: impressionsMax / 5
              },
              grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false }
            },
            y1: {
              type: "linear",
              position: "right",
              beginAtZero: true,
              max: ctrMax,
              ticks: {
                callback: (v) => v.toFixed(1),
                color: "#EF4444",
                font: { size: 12 },
                stepSize: ctrMax / 5
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
  }, [tableData, weekData]);

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-0 pt-4 px-4 pb-3">
        <div className="d-flex justify-content-between align-items-center w-100">
          <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>Delivery by Weekday</h5>
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
        <div style={{ height: "400px" }}>
          {(tableData.length > 0 || weekData.length > 0) ? (
            <canvas ref={chartRef}></canvas>
          ) : (
            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">No data available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeekdayDistribution;
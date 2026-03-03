"use client";
import React, { useEffect, useRef, useMemo } from "react";
import * as Chart from "chart.js";

const DeviceDistribution = ({ deviceData = [] }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const processedData = useMemo(() => {
    const totalImpressions = deviceData.reduce((acc, item) => acc + Number(item.Impressions || item.impressions || 0), 0);
    
    // Vibrant Palette
    const palette = ["#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E", "#10B981", "#F59E0B", "#34D399"];

    return deviceData.map((item, idx) => {
      const imp = Number(item.Impressions || item.impressions || 0);
      const percentage = totalImpressions > 0 ? ((imp / totalImpressions) * 100).toFixed(2) : 0;
      return {
        label: item.name || item.device || item.Device || "",
        value: imp,
        percentage: parseFloat(percentage),
        color: palette[idx % palette.length]
      };
    }).sort((a, b) => b.value - a.value);
  }, [deviceData]);

  useEffect(() => {
    if (chartRef.current && processedData.length > 0) {
      const ctx = chartRef.current.getContext("2d");

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart.Chart(ctx, {
        type: "doughnut",
        data: {
          labels: processedData.map(d => d.label),
          datasets: [
            {
              data: processedData.map(d => d.value),
              backgroundColor: processedData.map(d => d.color),
              borderWidth: 0,
              hoverOffset: 10,
              cutout: "70%"
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              titleColor: '#333',
              bodyColor: '#666',
              borderColor: '#eee',
              borderWidth: 1,
              padding: 12,
            }
          }
        },
      });
    }

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [processedData]);

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-0 pt-4 px-4 pb-3">
        <div className="d-flex justify-content-between align-items-center w-100">
            <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>Devices</h5>
        </div>
      </div>
      <div className="card-body p-4 pt-1">
        <div className="row align-items-center">
            {/* Left side: Vertical List of Metrics */}
            <div className="col-md-5">
                <div className="row g-4 py-3">
                    {processedData.slice(0, 8).map((item, idx) => (
                        <div key={idx} className="col-6 mb-2">
                            <div className="fw-bold text-dark small mb-1" style={{ wordBreak: 'break-word', minHeight: '1.2em' }}>{item.label}</div>
                            <div className="d-flex flex-column">
                                <span className="text-primary fw-bold" style={{ fontSize: '13px' }}>{item.percentage}%</span>
                                <span className="text-secondary" style={{ fontSize: '11px' }}>{item.value.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right side: Doughnut Chart */}
            <div className="col-md-7 d-flex justify-content-center">
                <div style={{ height: "400px", width: "100%", maxWidth: "400px" }}>
                    <canvas ref={chartRef}></canvas>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceDistribution;

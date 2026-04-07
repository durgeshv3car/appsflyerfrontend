"use client";
import React, { useEffect, useRef, useMemo } from "react";
import * as Chart from "chart.js";

const PlacementPosDistribution = ({ placementPosData = [] }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const processedData = useMemo(() => {
    const totalImpressions = placementPosData.reduce((acc, item) => acc + Number(item.Impressions || item.impressions || 0), 0);
    
    // Vibrant Palette
    const palette = ["#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E", "#10B981", "#F59E0B", "#34D399"];

    return placementPosData.map((item, idx) => {
      const imp = Number(item.Impressions || item.impressions || 0);
      const percentage = totalImpressions > 0 ? ((imp / totalImpressions) * 100).toFixed(2) : 0;
      return {
        label: item.name || item.placementpos || item.adPosition || item.Title || item.title || item.AdPosition || "Unknown",
        value: imp,
        percentage: parseFloat(percentage),
        color: palette[idx % palette.length]
      };
    }).sort((a, b) => b.value - a.value);
  }, [placementPosData]);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    if (!processedData || processedData.length === 0) return;

    const ctx = chartRef.current.getContext("2d");

    chartInstance.current = new Chart.Chart(ctx, {
      type: "doughnut",
      data: {
        labels: processedData.map(d => d.label),
        datasets: [
          {
            data: processedData.map(d => d.value),
            backgroundColor: processedData.map(d => d.color),
            borderWidth: 1,
            borderColor: '#ffffff',
            hoverOffset: 10,
            cutout: "60%"
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

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [processedData]);

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-white border-0 pt-4 px-4 pb-3">
        <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>Placement positions</h5>
      </div>
      <div className="card-body p-4 pt-1">
        <div className="row align-items-center h-100">
            {/* Left side: Vertical List of Metrics */}
            <div className="col-md-5">
                <div className="row g-4 py-3">
                    {processedData.slice(0, 8).map((item, idx) => (
                        <div key={idx} className="col-6 mb-3">
                            <div className="d-flex flex-column align-items-start">
                                <div className="fw-bold text-primary small mb-1" style={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.2' }}>
                                    {item.label}
                                </div>
                                <div className="text-primary fw-bold" style={{ fontSize: '14px' }}>
                                    {item.percentage}%
                                </div>
                                <div className="text-secondary opacity-75" style={{ fontSize: '12px' }}>
                                    {item.value.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right side: Doughnut Chart */}
            <div className="col-md-7 d-flex justify-content-center align-items-center">
                <div style={{ height: "300px", width: "100%", maxWidth: "300px" }}>
                    <canvas ref={chartRef}></canvas>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementPosDistribution;

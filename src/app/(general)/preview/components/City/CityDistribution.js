"use client";
import React, { useMemo } from "react";
import "@/lib/chart";
import { Bar } from "react-chartjs-2";

const CityDistribution = ({ cityData = [] }) => {
  const processedData = useMemo(() => {
    // Process and sort top 25 cities
    const sorted = [...cityData].sort((a, b) => {
      const aImp = Number(a.Impressions || a.impressions || 0);
      const bImp = Number(b.Impressions || b.impressions || 0);
      return bImp - aImp;
    });

    const top25 = sorted.slice(0, 25);
    
    // Vibrant palette
    const colors = [
      "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E",
      "#10B981", "#F59E0B", "#34D399", "#8B5CF6", "#EC4899",
      "#3B82F6", "#6366F1", "#10B981", "#F43F5E", "#F59E0B",
      "#9C27B0", "#00BCD4", "#4CAF50", "#FF9800", "#795548",
      "#607D8B", "#E91E63", "#3F51B5", "#009688", "#FF5722"
    ];

    return top25.map((item, idx) => {
      const imp = Number(item.Impressions || item.impressions || 0);
      let name = item.name || item.city || "Unknown";
      if (!name || name === "null") name = "Unknown";
      
      return {
        label: name,
        value: imp,
        color: colors[idx % colors.length]
      };
    });
  }, [cityData]);

  const data = {
    labels: processedData.map(d => d.label),
    datasets: [
      {
        label: "Impressions",
        data: processedData.map(d => d.value),
        backgroundColor: processedData.map(d => d.color),
        borderRadius: 4,
        barThickness: "flex",
        maxBarThickness: 20
      }
    ]
  };

  const options = {
    indexAxis: 'y',
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
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.x !== null) {
              label += context.parsed.x.toLocaleString();
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        border: { display: false },
        ticks: {
          callback: function(value) {
            if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
            if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
            return value;
          }
        }
      },
      y: {
        grid: {
          display: false,
        },
        border: { display: false },
        ticks: {
          autoSkip: false,
          font: {
            size: 11
          }
        }
      }
    }
  };

  return (
    <div className="card border-0 shadow-sm h-100 mb-4">
      <div className="card-header bg-white border-0 pt-4 px-4 pb-3">
        <div className="d-flex justify-content-between align-items-center w-100">
          <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>Top 10 Cities by Impressions</h5>
        </div>
      </div>
      <div className="card-body p-4 pt-1 flex-grow-1 d-flex flex-column justify-content-center">
        {processedData.length > 0 ? (
          <div style={{ height: "400px", width: "100%" }}>
            <Bar data={data} options={options} />
          </div>
        ) : (
          <div className="text-center text-muted py-5">
            No city data available
          </div>
        )}
      </div>
    </div>
  );
};

export default CityDistribution;

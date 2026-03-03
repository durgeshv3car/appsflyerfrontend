"use client";
import "@/lib/chart";
import { Bar } from "react-chartjs-2";
import { useMemo } from "react";

export default function AgeChart({ ageData = [] }) {
  const datasets = useMemo(() => {
    const ageMap = new Map();
    const defaultGroups = [
      { range: "18 - 24", color: "#1F6FEB" },
      { range: "25 - 29", color: "#2ECC71" },
      { range: "30 - 34", color: "#8E44AD" },
      { range: "35 - 39", color: "#F1C40F" },
      { range: "40 - 44", color: "#E74C3C" },
      { range: "45 - 54", color: "#2C2C2C" },
    ];
    
    defaultGroups.forEach(g => {
      const normalized = g.range.replace(/\s+/g, "");
      ageMap.set(normalized, { label: g.range, color: g.color, value: 0 });
    });

    ageData.forEach((item) => {
      let ageRange = String(item.Age || item.age || item.ageRange || "");
      const impressions = Number(item.Impressions || item.impressions || 0);
      if (!ageRange) return;
      const normalizedKey = ageRange.replace(/\s+/g, "");
      if (ageMap.has(normalizedKey)) {
        ageMap.get(normalizedKey).value += impressions;
      }
    });

    return Array.from(ageMap.values()).map(({ label, color, value }) => ({
      label,
      data: [value],
      backgroundColor: color,
      barThickness: 30,
    }));
  }, [ageData]);

  const data = {
    labels: ["Programmatic"],
    datasets,
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        stacked: true,
        display: false,
      },
      y: {
        stacked: true,
        display: true,
        grid: { display: false },
        ticks: {
            color: '#333',
            font: { size: 11, weight: 'bold' }
        }
      },
    },
  };

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-white border-0 pt-4 px-4 pb-3">
        <div className="d-flex justify-content-between align-items-center w-100">
            <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>Platform Age</h5>
        </div>
      </div>
      <div className="card-body p-4 pt-4 d-flex flex-column">
        <div style={{ height: "100px", width: "100%" }}>
          <Bar data={data} options={options} />
        </div>
        
        <div className="d-flex flex-wrap gap-3 mt-4 justify-content-center">
          {[
            { label: "18-24", color: "#1F6FEB" },
            { label: "25-29", color: "#2ECC71" },
            { label: "30-34", color: "#8E44AD" },
            { label: "35-39", color: "#F1C40F" },
            { label: "40-44", color: "#E74C3C" },
            { label: "45-54", color: "#2C2C2C" },
          ].map((item, idx) => (
            <div key={idx} className="d-flex align-items-center gap-2">
              <span style={{ width: '10px', height: '10px', backgroundColor: item.color, borderRadius: '1px' }}></span>
              <span className="text-secondary fw-bold" style={{ fontSize: '11px', letterSpacing: '0.4px' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

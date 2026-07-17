"use client";
import "@/lib/chart";
import { Bar } from "react-chartjs-2";
import { useMemo } from "react";

export default function AgeChart({ ageData = [] }) {
  const chartConfig = useMemo(() => {
    const colors = [
      "#1F6FEB", "#2ECC71", "#8E44AD", "#F1C40F", "#E74C3C", 
      "#2C2C2C", "#3498DB", "#D35400", "#16A085", "#7F8C8D"
    ];
    
    // Robust sorting: Low to High by age range
    const sortedData = [...ageData].sort((a, b) => {
      const getVal = (item) => String(item.Age || item.age || item.name || "");
      const getNumeric = (val) => {
        const match = val.match(/\d+/);
        return match ? parseInt(match[0], 10) : 999; // Put unknown at the end
      };
      return getNumeric(getVal(a)) - getNumeric(getVal(b));
    });

    const totalImpressions = sortedData.reduce((sum, item) => sum + Number(item.Impressions || item.impressions || 0), 0);

    const datasets = sortedData.map((item, index) => {
      const label = String(item.Age || item.age || item.name || "Unknown");
      const value = Number(item.Impressions || item.impressions || 0);
      const percentage = totalImpressions > 0 ? Math.round((value / totalImpressions) * 100) : 0;
      
      return {
        label,
        data: [percentage],
        backgroundColor: colors[index % colors.length],
        barThickness: 30,
      };
    });

    const legendItems = sortedData.map((item, index) => {
      const value = Number(item.Impressions || item.impressions || 0);
      const percentage = totalImpressions > 0 ? Math.round((value / totalImpressions) * 100) : 0;
      return {
        label: String(item.Age || item.age || item.name || "Unknown"),
        color: colors[index % colors.length],
        percentage: percentage
      };
    });

    return { datasets, legendItems };
  }, [ageData]);

  const data = {
    labels: ["Programmatic"],
    datasets: chartConfig.datasets,
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { 
        enabled: true,
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.raw}%`;
          }
        }
      },
    },
    scales: {
      x: {
        stacked: true,
        display: false,
        max: 100
      },
      y: {
        stacked: true,
        display: true,
        grid: { display: false },
        ticks: {
            color: '#111',
            font: { size: 12, weight: 700 }
        }
      },
    },
  };

  return (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
      <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
        <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>Platform Age</h5>
      </div>
      <div className="card-body p-4 pt-4 d-flex flex-column">
        <div style={{ height: "45px", width: "100%", marginBottom: '16px' }}>
          <Bar data={data} options={options} />
        </div>
        
        <div className="d-flex flex-column gap-3 mt-2">
          {chartConfig.legendItems.map((item, idx) => (
            <div key={idx} className="d-flex align-items-center justify-content-between w-100 py-1">
              <div className="d-flex align-items-center gap-2">
                <span style={{ width: '8px', height: '8px', backgroundColor: item.color, borderRadius: '1.5px' }}></span>
                <span className="text-secondary fw-bold" style={{ fontSize: '11px', whiteSpace: 'nowrap', letterSpacing: '0.2px' }}>{item.label}</span>
              </div>
              <span className="text-dark fw-bold" style={{ fontSize: '11px' }}>{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

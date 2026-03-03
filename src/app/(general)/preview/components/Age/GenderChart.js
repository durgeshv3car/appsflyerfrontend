"use client";
import "@/lib/chart";
import { Doughnut } from "react-chartjs-2";
import { useMemo } from "react";

export default function GenderChart({ genderData = [] }) {
  const chartData = useMemo(() => {
    let maleTotal = 0;
    let femaleTotal = 0;
    let unknownTotal = 0; // Initialize unknownTotal

    genderData.forEach((item) => {
      const gender = String(item.Gender || item.gender || item.name || "").toLowerCase().trim();
      const impressions = Number(item.Impressions || item.impressions || 0);

      if (gender === "male" || gender === "m") {
        maleTotal += impressions;
      } else if (gender === "female" || gender === "f") {
        femaleTotal += impressions;
      } else {
        unknownTotal += impressions; // Add to unknownTotal for other genders
      }
    });

    const total = maleTotal + femaleTotal + unknownTotal;
    
    return {
      male: total > 0 ? Math.round((maleTotal / total) * 100) : 0,
      female: total > 0 ? Math.round((femaleTotal / total) * 100) : 0,
      unknown: total > 0 ? Math.round((unknownTotal / total) * 100) : 0,
    };
  }, [genderData]);

  const data = {
    labels: ["Male", "Female", "Unknown"],
    datasets: [
      {
        data: [chartData.male, chartData.female, chartData.unknown],
        backgroundColor: ["#1F6FEB", "#D63384", "#7F8C8D"],
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };

  const options = {
    cutout: "80%",
    plugins: {
      legend: { display: false },
      tooltip: { 
        enabled: true,
        callbacks: {
          label: (context) => {
            return `${context.label}: ${context.raw}%`;
          }
        }
      },
    },
    maintainAspectRatio: false
  };

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-white border-0 pt-4 px-4 pb-3">
        <div className="d-flex justify-content-between align-items-center w-100">
          <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>Platform Genders</h5>
        </div>
      </div>
      <div className="card-body d-flex flex-column align-items-center justify-content-center p-4 pt-4">
        <div className="position-relative" style={{ width: "160px", height: "160px" }}>
          <Doughnut data={data} options={options} />
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{ fontWeight: 700, color: '#111', fontSize: '12px', textAlign: 'center' }}>Programmatic</div>
          </div>
        </div>

        <div className="d-flex justify-content-center gap-3 mt-4 w-100 flex-wrap">
          <div className="d-flex align-items-center gap-2">
            <span style={{ width: '10px', height: '10px', backgroundColor: '#1F6FEB', borderRadius: '1px' }}></span>
            <span className="text-secondary fw-bold" style={{ fontSize: '12px', letterSpacing: '0.4px' }}>MALE {chartData.male}%</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span style={{ width: '10px', height: '10px', backgroundColor: '#D63384', borderRadius: '1px' }}></span>
            <span className="text-secondary fw-bold" style={{ fontSize: '12px', letterSpacing: '0.4px' }}>FEMALE {chartData.female}%</span>
          </div>
          {chartData.unknown > 0 && (
            <div className="d-flex align-items-center gap-2">
              <span style={{ width: '10px', height: '10px', backgroundColor: '#7F8C8D', borderRadius: '1px' }}></span>
              <span className="text-secondary fw-bold" style={{ fontSize: '12px', letterSpacing: '0.4px' }}>UNKNOWN {chartData.unknown}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

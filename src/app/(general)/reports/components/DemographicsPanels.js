"use client";
import React, { useMemo } from "react";
import "@/lib/chart";
import { Doughnut, Bar } from "react-chartjs-2";

const GENDER_PALETTE = ["#1F6FEB", "#D63384", "#9CA3AF"];
const AGE_PALETTE = ["#1F6FEB", "#2ECC71", "#8E44AD", "#F1C40F", "#E74C3C", "#2C2C2C", "#0EA5E9", "#F97316"];

export function GenderChart({ genderData = [] }) {
  const chartData = useMemo(() => {
    let maleTotal = 0;
    let femaleTotal = 0;

    const list = Array.isArray(genderData) ? genderData : (genderData?.data || genderData?.report || []);

    list.forEach((item) => {
      const gender = String(item.name || item.Gender || item.gender || item.genderName || item.Demographic || "").toLowerCase().trim();
      const impressions = Number(item.impressions || item.Impressions || item.impressions_count || item.clicks || item.Clicks || 0);

      if (gender.includes("male") && !gender.includes("female") || gender === "m") {
        maleTotal += impressions;
      } else if (gender.includes("female") || gender === "f") {
        femaleTotal += impressions;
      }
    });

    const total = maleTotal + femaleTotal;

    return {
      male: total > 0 ? Math.round((maleTotal / total) * 100) : (list.length > 0 ? 50 : 0),
      female: total > 0 ? Math.round((femaleTotal / total) * 100) : (list.length > 0 ? 50 : 0),
      hasData: list.length > 0
    };
  }, [genderData]);

  const data = {
    labels: ["Male", "Female"],
    datasets: [
      {
        data: [chartData.male, chartData.female],
        backgroundColor: GENDER_PALETTE,
        borderWidth: 0,
        hoverOffset: 4
      },
    ],
  };

  const options = {
    cutout: "78%",
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}%`
        }
      },
    },
    maintainAspectRatio: false
  };

  return (
    <div className="st-panel">
      <div className="st-panel-header">
        <div>
          <div className="st-panel-title">Platform Genders</div>
          <div className="st-panel-sub">Gender impression share breakdown</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 0" }}>
        <div style={{ position: "relative", width: "160px", height: "160px" }}>
          <Doughnut data={data} options={options} />
          <div style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none"
          }}>
            <div style={{ fontWeight: 700, color: "#111827", fontSize: "12px", textAlign: "center" }}>Programmatic</div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20, width: "100%", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, backgroundColor: "#1F6FEB", borderRadius: 2 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", letterSpacing: "0.04em" }}>MALE {chartData.male}%</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, backgroundColor: "#D63384", borderRadius: 2 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#374151", letterSpacing: "0.04em" }}>FEMALE {chartData.female}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AgeChart({ ageData = [] }) {
  const { datasets, groups } = useMemo(() => {
    const list = Array.isArray(ageData) ? ageData : (ageData?.data || ageData?.report || []);

    if (list.length === 0) {
      return { datasets: [], groups: [] };
    }

    // Aggregate by group name
    const groupMap = new Map();

    list.forEach((item, idx) => {
      let rawName = String(item.name || item.Age || item.age || item.ageRange || item.AgeGroup || item.ageGroup || item.Demographic || `Group ${idx + 1}`).trim();
      const impressions = Number(item.impressions || item.Impressions || item.impressions_count || item.clicks || item.Clicks || 0);

      if (groupMap.has(rawName)) {
        groupMap.get(rawName).value += impressions;
      } else {
        groupMap.set(rawName, {
          label: rawName,
          value: impressions,
          color: AGE_PALETTE[groupMap.size % AGE_PALETTE.length]
        });
      }
    });

    const items = Array.from(groupMap.values());
    const ds = items.map(item => ({
      label: item.label,
      data: [item.value],
      backgroundColor: item.color,
      barThickness: 28,
    }));

    return { datasets: ds, groups: items };
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
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${Number(context.raw).toLocaleString('en-IN')} impressions`
        }
      },
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
          color: "#374151",
          font: { size: 11, weight: "bold" }
        }
      },
    },
  };

  return (
    <div className="st-panel">
      <div className="st-panel-header">
        <div>
          <div className="st-panel-title">Platform Age</div>
          <div className="st-panel-sub">Age group impression breakdown · {groups.length} groups</div>
        </div>
      </div>
      <div style={{ padding: "16px 0", display: "flex", flexDirection: "column" }}>
        {groups.length > 0 ? (
          <>
            <div style={{ height: "100px", width: "100%" }}>
              <Bar data={data} options={options} />
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 20, justifyContent: "center" }}>
              {groups.map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 10, height: 10, backgroundColor: item.color, borderRadius: 2 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#4B5563", letterSpacing: "0.04em" }}>{item.label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "30px", color: "#64748B", fontSize: 13 }}>
            No age data available for this date range.
          </div>
        )}
      </div>
    </div>
  );
}

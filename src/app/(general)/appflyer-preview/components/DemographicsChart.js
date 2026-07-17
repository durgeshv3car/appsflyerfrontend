"use client";
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const DemographicsChart = () => {
  const genderChartRef = useRef(null);
  const ageChartRef = useRef(null);
  const genderInstance = useRef(null);
  const ageInstance = useRef(null);

  useEffect(() => {
    // Gender Chart
    if (genderChartRef.current) {
      const ctx = genderChartRef.current.getContext("2d");

      if (genderInstance.current) {
        genderInstance.current.destroy();
      }

      genderInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Male", "Female", "Unknown"],
          datasets: [
            {
              data: [59.71, 39.93, 0.37],
              backgroundColor: [
                "rgb(59, 130, 246)",
                "rgb(236, 72, 153)",
                "rgb(156, 163, 175)",
              ],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
            title: {
              display: true,
              text: "Gender Distribution",
            },
          },
        },
      });
    }

    // Age Chart
    if (ageChartRef.current) {
      const ctx = ageChartRef.current.getContext("2d");

      if (ageInstance.current) {
        ageInstance.current.destroy();
      }

      ageInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["18-24", "25-29", "30-34", "35-39", "40-44", "45-54"],
          datasets: [
            {
              label: "Impressions",
              data: [36236, 26532, 19894, 41467, 20805, 55237],
              backgroundColor: "rgb(99, 102, 241)",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Age Groups",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }

    return () => {
      if (genderInstance.current) genderInstance.current.destroy();
      if (ageInstance.current) ageInstance.current.destroy();
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="h-80">
          <canvas ref={genderChartRef}></canvas>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="h-80">
          <canvas ref={ageChartRef}></canvas>
        </div>
      </div>
    </div>
  );
};
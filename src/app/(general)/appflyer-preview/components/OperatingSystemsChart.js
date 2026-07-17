"use client";
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const OperatingSystemsChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Android", "Windows", "iOS", "macOS", "Linux"],
          datasets: [
            {
              label: "Impressions",
              data: [112462, 71432, 7744, 4404, 4012],
              backgroundColor: "rgb(59, 130, 246)",
              yAxisID: "y",
            },
            {
              label: "CTR (%)",
              data: [3.07, 0.06, 0.61, 0.07, 0.57],
              backgroundColor: "rgb(239, 68, 68)",
              yAxisID: "y1",
              type: "line",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Operating Systems Performance",
            },
          },
          scales: {
            y: {
              type: "linear",
              display: true,
              position: "left",
              title: {
                display: true,
                text: "Impressions",
              },
            },
            y1: {
              type: "linear",
              display: true,
              position: "right",
              title: {
                display: true,
                text: "CTR (%)",
              },
              grid: {
                drawOnChartArea: false,
              },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="h-80">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};
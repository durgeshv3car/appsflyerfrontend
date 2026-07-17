"use client";
import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const HourlyDistribution = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const hours = Array.from({ length: 24 }, (_, i) => i);
      const impressions = [
        2500, 1800, 1200, 800, 600, 900, 2800, 5200, 8900, 10200, 11500, 12800,
        11200, 10500, 9800, 9200, 8500, 8800, 9500, 10200, 9800, 8500, 6200,
        4100,
      ];

      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: hours,
          datasets: [
            {
              label: "Impressions",
              data: impressions,
              borderColor: "rgb(139, 92, 246)",
              backgroundColor: "rgba(139, 92, 246, 0.1)",
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: "Delivery by Hour",
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Hour of Day",
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Impressions",
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

"use client";
import React, { useEffect, useRef, useState } from "react";
import * as Chart from "chart.js";

const DeviceDistribution = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const gradient1 = ctx.createLinearGradient(0, 0, 0, 400);
      gradient1.addColorStop(0, "rgb(59, 130, 246)");
      gradient1.addColorStop(1, "rgb(37, 99, 235)");

      const gradient2 = ctx.createLinearGradient(0, 0, 0, 400);
      gradient2.addColorStop(0, "rgb(236, 72, 153)");
      gradient2.addColorStop(1, "rgb(219, 39, 119)");

      const gradient3 = ctx.createLinearGradient(0, 0, 0, 400);
      gradient3.addColorStop(0, "rgb(168, 85, 247)");
      gradient3.addColorStop(1, "rgb(147, 51, 234)");

      chartInstance.current = new Chart.Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Smartphone", "Personal Computer", "Tablet"],
          datasets: [
            {
              data: [52, 47, 1],
              backgroundColor: [gradient1, gradient2, gradient3],
              borderWidth: 3,
              borderColor: "#ffffff",
              hoverBorderWidth: 4,
              hoverBorderColor: "#ffffff",
              hoverOffset: 15,
              spacing: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "72%",
          animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1500,
            easing: "easeInOutQuart",
          },
          plugins: {
            legend: {
              display: true,
              position: "right",
              labels: {
                usePointStyle: true,
                pointStyle: "circle",
                boxWidth: 12,
                boxHeight: 12,
                padding: 20,
                font: {
                  size: 14,
                  weight: "500",
                  family: "system-ui, -apple-system, sans-serif",
                },
                color: "#374151",
                generateLabels: function (chart) {
                  const data = chart.data;
                  if (data.labels.length && data.datasets.length) {
                    return data.labels.map((label, i) => {
                      const value = data.datasets[0].data[i];
                      return {
                        text: `${label}  ${value}%`,
                        fillStyle: [
                          "rgb(59, 130, 246)",
                          "rgb(236, 72, 153)",
                          "rgb(168, 85, 247)",
                        ][i],
                        hidden: false,
                        index: i,
                      };
                    });
                  }
                  return [];
                },
              },
            },

            title: {
              display: true,
              text: "Device Type Used",
              align: "start",
              font: {
                size: 16,
                weight: "700",
                family: "system-ui, -apple-system, sans-serif",
              },
              padding: {
                top: 15,
                bottom: 25,
                left: 15,
              },
              color: "#111827",
            },

            tooltip: {
              enabled: true,
              backgroundColor: "rgba(0, 0, 0, 0.85)",
              titleColor: "#ffffff",
              bodyColor: "#ffffff",
              padding: 12,
              borderColor: "rgba(255, 255, 255, 0.2)",
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true,
              bodyFont: {
                size: 14,
                weight: "500",
              },
              titleFont: {
                size: 15,
                weight: "600",
              },
              callbacks: {
                label: function (context) {
                  return " " + context.parsed + "%";
                },
                afterLabel: function (context) {
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const value = context.parsed;
                  const count = Math.round((value / 100) * 10000);
                  return `≈ ${count.toLocaleString()} devices`;
                },
              },
            },

            // ✅ ADDED THIS PLUGIN FOR UNDERLINE
            afterDraw: (chart) => {
              const { ctx, chartArea, options } = chart;
              const title = options.plugins.title;

              if (!title.display) return;

              // Title block height from Chart.js internal layout
              const titleHeight = chart.titleBlock.height;
              const underlineY =
                chart.chartArea.top - title.padding.bottom + titleHeight;

              ctx.save();
              ctx.beginPath();
              ctx.lineWidth = 2;
              ctx.moveTo(chartArea.left, underlineY);
              ctx.lineTo(chartArea.right, underlineY);
              ctx.strokeStyle = "#271711ff"; 
              ctx.stroke();
              ctx.restore();
            },
          },

          layout: {
            padding: {
              left: 10,
              right: 10,
              top: 5,
              bottom: 10,
            },
          },
          onHover: (event, activeElements) => {
            event.native.target.style.cursor =
              activeElements.length > 0 ? "pointer" : "default";
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
    <div
      className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl"
      style={{ borderRadius: "12px" }}
    >
      <div className="relative" style={{ height: "520px" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-pink-50/30 rounded-xl blur-3xl -z-10"></div>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default DeviceDistribution;

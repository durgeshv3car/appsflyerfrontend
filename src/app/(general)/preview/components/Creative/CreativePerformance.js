"use client";
import React, { useEffect, useRef } from "react";
import * as Chart from "chart.js";

const CreativePerformance = ({ CreativeTableData = [] }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current && CreativeTableData.length > 0) {
      const ctx = chartRef.current.getContext("2d");

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      // Extract data from CreativeTableData
      const labels = CreativeTableData.map(item => item.Title || "Unknown");
      const impressionsData = CreativeTableData.map(item => item.Impressions || 0);
      const ctrData = CreativeTableData.map(item => {
        // Convert CTR string like "1.61%" to number like 1.61
        const ctrString = item.CTR || "0%";
        return parseFloat(ctrString.replace('%', ''));
      });

      // Calculate max value for impressions scale
      const maxImpressions = Math.max(...impressionsData);
      const impressionsMax = Math.ceil(maxImpressions / 25000) * 25000;

      // Calculate max value for CTR scale
      const maxCTR = Math.max(...ctrData);
      const ctrMax = Math.ceil(maxCTR * 10) / 10 + 0.3;

      chartInstance.current = new Chart.Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "IMPRESSIONS",
              data: impressionsData,
              backgroundColor: "rgba(16, 103, 243, 0.85)",
              borderColor: "rgba(16, 103, 243, 0.85)",
              borderWidth: 0,
              yAxisID: "y",
              barThickness: 60,
            },
            {
              label: "CTR",
              data: ctrData,
              backgroundColor: "rgba(239, 68, 68, 1)",
              borderColor: "rgba(239, 68, 68, 1)",
              borderWidth: 2,
              yAxisID: "y1",
              type: "line",
              pointRadius: 4,
              pointBackgroundColor: "rgba(239, 68, 68, 1)",
              fill: false,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            title: {
              display: true,
              text: "Creatives",
              align: 'start',
              font: {
                size: 16,
                weight: '600',
              },
              padding: {
                bottom: 20
              }
            },
            legend: {
              display: true,
              position: 'top',
              align: 'end',
              labels: {
                usePointStyle: true,
                pointStyle: 'rect',
                boxWidth: 12,
                boxHeight: 12,
                padding: 15,
                font: {
                  size: 11,
                  weight: '500'
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    if (context.dataset.yAxisID === 'y') {
                      label += context.parsed.y.toLocaleString();
                    } else {
                      label += context.parsed.y.toFixed(2) + '%';
                    }
                  }
                  return label;
                }
              }
            }
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                font: {
                  size: 11,
                },
                maxRotation: 0,
                minRotation: 0,
              }
            },
            y: {
              type: "linear",
              display: true,
              position: "left",
              title: {
                display: false,
              },
              beginAtZero: true,
              max: impressionsMax,
              ticks: {
                callback: function(value) {
                  if (value === 0) return '0';
                  if (value >= 1000) {
                    const newValue = (value / 1000);
                    return `${newValue}k`;
                  }
                  return value;
                },
                color: "rgba(16, 103, 243, 0.85)",
                font: {
                  size: 11,
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)',
              }
            },
            y1: {
              type: "linear",
              display: true,
              position: "right",
              title: {
                display: false,
              },
              beginAtZero: true,
              max: ctrMax,
              ticks: {
                callback: function(value) {
                  return value.toFixed(1);
                },
                color: "rgba(239, 68, 68, 1)",
                font: {
                  size: 11,
                },
                stepSize: 0.3,
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
  }, [CreativeTableData]);

  return (
    <div className="w-full bg-white p-6 rounded-lg">
    
        <div style={{ height: "400px" }}>
          <canvas ref={chartRef}></canvas>
        </div>
      
        
    </div>
  );
};

export default CreativePerformance;
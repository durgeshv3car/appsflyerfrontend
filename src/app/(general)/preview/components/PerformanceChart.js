import { useEffect, useRef, useMemo } from "react";
import { Chart } from "chart.js/auto";
import { labels } from "@/components/tasks/TaskHeader";

// Donut Chart Component
const DonutChart = ({ percentage,value, total, label, color }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          datasets: [
            {
              data: [value,total ],
              backgroundColor: [color, "#E5E7EB"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          cutout: "75%",
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [value, total, color]);

  return (
    <div className="text-center">
      <div
        className="position-relative d-inline-block"
        style={{ width: "100px", height: "100px" }}
      >
        <canvas ref={chartRef}></canvas>
        <div className="position-absolute top-50 start-50 translate-middle text-center">
          <div className="fw-bold text-dark" style={{ fontSize: "16px" }}>
            {value >= 1000 ? (value / 1000).toFixed(1) + "k" : value}
          </div>
          <div className="text-muted small">
            {percentage}%
          </div>
        </div>
      </div>
      <p className="mt-2 mb-0 small fw-semibold text-secondary">{label}</p>
    </div>
  );
};



const PerformanceLineChart = ({ tableData }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!tableData || tableData.length === 0) return;

    const labels = tableData.map((row) => row.Date || ""); // x-axis labels

    const impressions = tableData.map((row) => row.Impressions || 0);
    const clicks = tableData.map((row) => row.Clicks || 0);
    const ctr = tableData.map((row) =>
  parseFloat(String(row.CTR).replace("%", "")) || 0
);

    const cost = tableData.map((row) => row.Spent || 0);
    const engagement = tableData.map((row) => row.Engagement || 0);

    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");

      // Destroy old chart instance to avoid duplication
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Impressions",
              data: impressions,
              borderColor: "rgb(34,197,94)",
              backgroundColor: "rgba(34,197,94,0.1)",
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              borderWidth: 3,
            },
            {
              label: "Clicks",
              data: clicks,
              borderColor: "rgb(37,99,235)",
              backgroundColor: "rgba(37,99,235,0.1)",
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              borderWidth: 3,
            },
            {
              label: "CTR",
              data: ctr,
              borderColor: "rgb(168,85,247)",
              backgroundColor: "rgba(168,85,247,0.1)",
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              borderWidth: 3,
            },
            {
              label: "Cost",
              data: cost,
              borderColor: "rgb(234,179,8)",
              backgroundColor: "rgba(234,179,8,0.1)",
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              borderWidth: 3,
            },
            {
              label: "Engagement",
              data: engagement,
              borderColor: "rgb(239,68,68)",
              backgroundColor: "rgba(239,68,68,0.1)",
              tension: 0.4,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              borderWidth: 3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: "index",
            intersect: false,
          },
          plugins: {
            legend: {
              position: "top",
              align: "end",
              labels: {
                usePointStyle: true,
                padding: 15,
                font: {
                  size: 12,
                  weight: "500",
                },
              },
            },
            tooltip: {
              backgroundColor: "rgba(0,0,0,0.8)",
              padding: 12,
              cornerRadius: 8,
            },
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
              },
            },
            y: {
              beginAtZero: true,
              grid: {
                color: "rgba(0,0,0,0.05)",
              },
              ticks: {
                font: {
                  size: 11,
                },
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
  }, [tableData]); // 🔁 re-render chart when data changes

  return (
    <div style={{ height: "400px" }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};



// Main Dashboard Component
const PerformanceDashboard = ({ tableData }) => {
  const aggregatedData = useMemo(() => {
    const total = {
      Impressions: 0,
      Clicks: 0,
      Reach: 0,
      Spent: 0,
      Engagement: 0,
      ViewableImpressions: 0,
      CTR: 0,
      CPM: 0,
      CPC: 0,
      CPE: 0,
      Viewablity: 0,
      ER:0,
      ReachPercentage:0
    };

    tableData.forEach((item) => {
      total.Impressions += Number(item.Impressions) || 0;
      total.Clicks += Number(item.Clicks) || 0;
      total.Reach += Number(item.Reach) || 0;
      total.Spent += Number(item.Spent) || 0;
      total.Engagement += Number(item.Engagement) || 0;
      total.CTR = total.Impressions ? ((total.Clicks / total.Impressions) * 100).toFixed(2) : 0;
      total.CPM = total.Impressions ? ((total.Spent / total.Impressions) * 1000).toFixed(2) : 0;
      total.CPC = total.Clicks ? (total.Spent / total.Clicks).toFixed(2) : 0;
      total.CPE = total.Engagement ? (total.Spent / total.Engagement).toFixed(2) : 0;
      total.ViewableImpressions += Number(item.ViewableImpressions) || 0;
      total.Viewablity = total.Impressions ? ((total.ViewableImpressions / total.Impressions) * 100).toFixed(2) : 0;
      total.ER= total.Engagement ? ((total.Engagement / total.Impressions) * 100).toFixed(2) : 0;
      total.ReachPercentage = total.Impressions ? ((total.Reach / total.Impressions) * 100).toFixed(2) : 0;


    });



    return [total];
  }, [tableData]);
  console.log("Aggregated Data:", aggregatedData);

   const total = aggregatedData[0] || {};



  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container-fluid">
        {/* Header */}
        <div className="mb-4">
          <h1 className="h3 fw-bold text-dark mb-1">Performance Dashboard</h1>
          <p className="text-muted small mb-0">
            Overview of campaign metrics and analytics
          </p>
        </div>

        {/* Top Section - Metrics Overview */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="row">
              {/* Left Side - Main Metrics & Donuts */}
              <div className="col-lg-8">
                {/* Big Numbers */}
                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-primary bg-opacity-10 rounded-3 p-3">
                        <svg
                          width="32"
                          height="32"
                          fill="currentColor"
                          className="bi bi-emoji-smile text-white"
                          viewBox="0 0 16 16"
                        >
                          <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                          <path d="M4.285 12.433a.5.5 0 0 0 .683-.183A3.498 3.498 0 0 1 8 10.5c1.295 0 2.426.703 3.032 1.75a.5.5 0 0 0 .866-.5A4.498 4.498 0 0 0 8 9.5a4.5 4.5 0 0 0-3.898 2.25.5.5 0 0 0 .183.683zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zm4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="h2 fw-bold text-dark mb-0">{total.Impressions}</h2>
                        <p className="text-muted mb-0 small">
                          Total Impressions
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-success bg-opacity-10 rounded-3 p-3">
                        <svg
                          width="32"
                          height="32"
                          fill="currentColor"
                          className="text-white"
                          viewBox="0 0 16 16"
                        >
                          <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                          <path
                            fillRule="evenodd"
                            d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"
                          />
                          <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="h2 fw-bold text-dark mb-0">{total.Reach}</h2>
                        <p className="text-muted mb-0 small">Total Reach</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Donut Charts */}
              <div className="row g-3">
                  <div className="col-6 col-md-4 col-lg">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <DonutChart
                        percentage={total.ER}
                        value={total.Engagement}
                        total={total.Impressions}
                        label="Engagement"
                        color="#3B82F6"
                      />
                    </div>
                  </div>

                  <div className="col-6 col-md-4 col-lg">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <DonutChart
                        percentage={total.ReachPercentage}
                        value={total.Reach}
                        total={total.Impressions}
                        label="Reach"
                        color="#16A34A"
                      />
                    </div>
                  </div>

                  <div className="col-6 col-md-4 col-lg">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <DonutChart
                        percentage={total.Viewablity}
                        value={total.ViewableImpressions}
                        total={total.Impressions}
                        label="Viewable impr."
                        color="#F59E0B"
                      />
                    </div>
                  </div>


                  <div className="col-6 col-md-4 col-lg">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <DonutChart
                        percentage={total.CTR}
                        value={total.Clicks}
                        total={total.Impressions}
                        label="Clicks"
                        color="#EF4444"
                      />
                    </div>
                  </div>
                </div>
              </div>


              {/* Right Side - Performance Stats */}
              <div className="col-lg-4 mt-4 mt-lg-0">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center mb-4">
                      <svg
                        width="24"
                        height="24"
                        fill="currentColor"
                        className="me-2 text-primary"
                        viewBox="0 0 16 16"
                      >
                        <path d="M2.5 8a5.5 5.5 0 0 1 8.25-4.764.5.5 0 0 0 .5-.866A6.5 6.5 0 1 0 14.5 8a.5.5 0 0 0-1 0 5.5 5.5 0 1 1-11 0z" />
                        <path d="M15.354 3.354a.5.5 0 0 0-.708-.708L8 9.293 5.354 6.646a.5.5 0 1 0-.708.708l3 3a.5.5 0 0 0 .708 0l7-7z" />
                      </svg>
                      <h3 className="h5 fw-bold mb-0 text-dark">
                        Performance Metrics
                      </h3>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 shadow-sm">
                        <span className="text-muted small fw-medium">CTR</span>
                        <span className="fw-bold text-dark">{total.CTR}%</span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 shadow-sm">
                        <span className="text-muted small fw-medium">CPC</span>
                        <span className="fw-bold text-success">${total.CPC}</span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 shadow-sm">
                        <span className="text-muted small fw-medium">CPE</span>
                        <span className="fw-bold text-info">${total.CPE}</span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3 shadow-sm">
                        <span className="text-muted small fw-medium">CPM</span>
                        <span className="fw-bold text-warning">${total.CPM}</span>
                      </div>

                      <div className="d-flex justify-content-between align-items-center p-3 bg-primary bg-opacity-10 rounded-3 border border-primary">
                        <span className="text-white fw-semibold small">
                          Total Spent
                        </span>
                        <span className="fw-bold text-white h5 mb-0">
                          ${total.Spent}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Chart Section */}
        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white border-bottom py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="h5 fw-bold text-dark mb-0">
                <svg
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="me-2"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M0 0h1v15h15v1H0V0zm10 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V4.9l-3.613 4.417a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61L13.445 4H10.5a.5.5 0 0 1-.5-.5z"
                  />
                </svg>
                Performance Trends
              </h3>
            </div>
          </div>
          <div className="card-body p-4">
            <PerformanceLineChart tableData={tableData} totals={total} />
          </div>
        </div>
      </div>

      <style>{`
        .card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default PerformanceDashboard;

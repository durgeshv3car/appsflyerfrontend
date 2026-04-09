import { useEffect, useRef, useMemo, useState } from "react";
import { Chart } from "chart.js/auto";
import { useSession } from "next-auth/react";

const getPriceForDate = (pricingObj, targetDate) => {
  if (!pricingObj || typeof pricingObj !== 'object') return undefined;
  const normalize = (d) => String(d).replace(/\//g, '-').split(' ')[0].substring(0, 10);
  
  // If targetDate is missing (common in dimensions), use a far future date to get the latest override rule
  const normalizedTarget = targetDate ? normalize(targetDate) : "9999-12-31";
  
  const normalizedPricing = {};
  Object.entries(pricingObj).forEach(([d, v]) => {
    normalizedPricing[normalize(d)] = v;
  });
  const sortedDates = Object.keys(normalizedPricing).sort();
  let latestValue = undefined;
  for (const date of sortedDates) {
    if (date <= normalizedTarget) {
      latestValue = normalizedPricing[date];
    } else {
      break;
    }
  }
  return latestValue;
};

const DonutLarge = ({ value, percentage, label, color, showBoth }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext("2d");
      if (chartInstance.current) chartInstance.current.destroy();

      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          datasets: [{
            data: [parseFloat(percentage), 100 - parseFloat(percentage)],
            backgroundColor: [color, "#F3F4F6"],
            borderWidth: 0,
          }],
        },
        options: {
          cutout: "85%",
          plugins: { 
            legend: { display: false }, 
            tooltip: { enabled: false } 
          },
          maintainAspectRatio: false,
          animation: { duration: 1000 }
        },
      });
    }
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [percentage, color]);

  return (
    <div className="text-center">
      <div className="position-relative d-inline-block" style={{ width: "150px", height: "150px" }}>
        <canvas ref={chartRef}></canvas>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          {showBoth ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.2 }}>
              <span style={{ fontWeight: 700, color: '#111', fontSize: '18px' }}>{value}</span>
              <span style={{ fontWeight: 700, color: '#111', fontSize: '16px' }}>{percentage}%</span>
            </div>
          ) : (
            <span style={{ fontWeight: 700, color: '#111', fontSize: '18px' }}>{percentage}%</span>
          )}
        </div>
      </div>
      <p className="mt-3 mb-0 text-dark fw-bold" style={{ fontSize: '14px', letterSpacing: '0.3px', opacity: 0.9 }}>{label}</p>
    </div>
  );
};

const TrendChart = ({ tableData, campaignPermissions = [], campaignPricing = { cpm: {}, cpc: {} }, campaignType = "" }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { data: session } = useSession();

  const userRole = session?.user?.role || "";
  const userPerms = session?.user?.permissions || [];

  const isCampaignSpentRestricted = campaignPermissions.some(p => p.toLowerCase() === "spent");
  const isUserSpentRestricted = userPerms.some(p => p.toLowerCase() === "spent");
  const hasSpent = userRole === "super_admin" || (!isCampaignSpentRestricted && !isUserSpentRestricted);

  const isVideoType = ["Video", "CTV", "Youtube"].includes(campaignType);

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();
    if (!tableData || tableData.length === 0) return;

    const ctx = chartRef.current.getContext("2d");

    const labels = tableData.map((row) => row.Date || row.date || "");
    const impressions = tableData.map((row) => Number(row.Impressions || row.impressions) || 0);
    const clicks = tableData.map((row) => Number(row.Clicks || row.clicks) || 0);
    const ctr = tableData.map((row) => {
        const imp = Number(row.Impressions || row.impressions || 0);
        const cks = Number(row.Clicks || row.clicks || 0);
        return imp > 0 ? (cks / imp) * 100 : 0;
    });
    const cost = tableData.map((row) => {
        const rowDate = row.Date || row.date || "";
        const rowImp = Number(row.Impressions || row.impressions || 0);
        const rowClicks = Number(row.Clicks || row.clicks || 0);
        
        const datePriceCPM = getPriceForDate(campaignPricing?.cpm, rowDate);
        const datePriceCPC = getPriceForDate(campaignPricing?.cpc, rowDate);

        if (datePriceCPM !== undefined) {
          return (rowImp / 1000) * datePriceCPM;
        } else if (datePriceCPC !== undefined) {
          return rowClicks * datePriceCPC;
        } else {
          const rowCPM = Number(row.CPM || row.cpm || 0);
          const rowCPC = Number(row.CPC || row.cpc || 0);
          return rowCPM > 0 ? (rowImp / 1000) * rowCPM : (rowClicks * rowCPC);
        }
    });

    const datasets = [
      {
        label: "Impressions",
        data: impressions,
        borderColor: "#2ECC71",
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointStyle: 'rect',
        pointBackgroundColor: "#2ECC71",
        borderWidth: 2,
        yAxisID: 'y',
      },
    ];

    if (campaignType !== "CTV") {
      datasets.push({
        label: "Clicks",
        data: clicks,
        borderColor: "#1F6FEB",
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointStyle: 'rect',
        pointBackgroundColor: "#1F6FEB",
        borderWidth: 2,
        yAxisID: 'y1',
      });
    }

    if (!isVideoType) {
      datasets.push({
        label: "CTR",
        data: ctr,
        borderColor: "#9B59B6",
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointStyle: 'rect',
        pointBackgroundColor: "#9B59B6",
        borderWidth: 2,
        yAxisID: 'y2',
      });
    }

    if (hasSpent) {
      datasets.push({
        label: "Cost",
        data: cost,
        borderColor: "#F1C40F",
        backgroundColor: "transparent",
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointStyle: 'rect',
        pointBackgroundColor: "#F1C40F",
        borderWidth: 2,
        yAxisID: 'y3',
      });
    }

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 20, bottom: 5, left: 25, right: 25 }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.98)',
            titleColor: '#111',
            bodyColor: '#444',
            borderColor: '#eee',
            borderWidth: 1,
            padding: 12,
            usePointStyle: true,
            boxWidth: 8,
            boxHeight: 8
          }
        },
        scales: {
          x: { 
            grid: { display: true, color: 'rgba(0,0,0,0.03)', drawBorder: false }, 
            ticks: { color: "#888", font: { size: 10 }, padding: 10 },
            offset: true
          },
          y: { 
            display: true,
            beginAtZero: true,
            grace: '15%',
            grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
            ticks: { display: false }
          },
          y1: { display: false, beginAtZero: true, grace: '15%' },
          y2: { display: false, beginAtZero: true, grace: '15%' },
          y3: { display: false, beginAtZero: true, grace: '15%' },
        },
      },
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [tableData, hasSpent, campaignPricing, isVideoType]);

  const legendItems = [
    { color: '#2ECC71', label: 'Impressions' },
    { color: '#1F6FEB', label: 'Clicks' },
  ];
  if (!isVideoType) legendItems.push({ color: '#9B59B6', label: 'CTR' });
  if (hasSpent) legendItems.push({ color: '#F1C40F', label: 'Cost' });

  return (
    <div className="bg-white p-0 pb-4 mt-3 rounded shadow-sm border-0 overflow-hidden">
      <div className="d-flex align-items-center mb-0 px-4 pt-4 pb-2">
        <div className="d-flex align-items-center gap-2 me-auto">
            <span className="fw-bold text-dark" style={{ fontSize: '15px' }}>Result</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-secondary opacity-50"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div className="d-flex gap-5">
             {legendItems.map((item, idx) => (
                <div key={idx} className="d-flex align-items-center gap-2">
                    <span style={{ width: '12px', height: '12px', backgroundColor: item.color, display: 'inline-block' }}></span>
                    <span className="text-dark fw-bold" style={{ fontSize: '13px', opacity: 0.7 }}>{item.label}</span>
                </div>
             ))}
        </div>
      </div>
      <div style={{ height: "350px", width: "100%" }} className="mt-3">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export const PerformanceDashboard = ({ tableData, currencySymbol = "$", campaignPermissions = [], campaignPricing = { cpm: {}, cpc: {} }, campaignType = "" }) => {
  const { data: session } = useSession();
  
  const userRole = session?.user?.role || "";
  const userPerms = session?.user?.permissions || [];

  const isCampaignSpentRestricted = campaignPermissions.some(p => p.toLowerCase() === "spent");
  const isUserSpentRestricted = userPerms.some(p => p.toLowerCase() === "spent");
  const hasSpent = userRole === "super_admin" || (!isCampaignSpentRestricted && !isUserSpentRestricted);

  const isCampaignCPMRestricted = campaignPermissions.some(p => p.toLowerCase() === "cpm");
  const isUserCPMRestricted = userPerms.some(p => p.toLowerCase() === "cpm");
  const hasCPMValue = userRole === "super_admin" || (!isCampaignCPMRestricted && !isUserCPMRestricted);

  const stats = useMemo(() => {
    const total = { Imp: 0, Clicks: 0, Reach: 0, Spent: 0, SumCPM: 0, SumCPC: 0 };
    tableData?.forEach((row) => {
      const rowImp = Number(row.Impressions || row.impressions || 0);
      const rowClicks = Number(row.Clicks || row.clicks || 0);
      const rowDate = row.Date || row.date || "";
      
      const datePriceCPM = getPriceForDate(campaignPricing?.cpm, rowDate);
      const datePriceCPC = getPriceForDate(campaignPricing?.cpc, rowDate);

      // FORCE: Calculate Spent, do not use from DB
      let rowCPM = datePriceCPM !== undefined ? datePriceCPM : Number(row.CPM || row.cpm || 0);
      let rowCPC = datePriceCPC !== undefined ? datePriceCPC : Number(row.CPC || row.cpc || 0);
      
      let rowSpent = 0;
      if (datePriceCPM !== undefined) {
        rowSpent = (rowImp / 1000) * rowCPM;
      } else if (datePriceCPC !== undefined) {
        rowSpent = rowClicks * rowCPC;
      } else {
        // Fallback to row metrics if no override exists, but still recalculate
        rowSpent = rowCPM > 0 ? (rowImp / 1000) * rowCPM : (rowClicks * rowCPC);
      }

      total.Imp += rowImp;
      total.Clicks += rowClicks;
      total.Reach += Number(row.Reach || row.reach || row.total_reach || row.uniqueReachImpressionReach || 0);
      total.Spent += rowSpent;
      total.SumCPM += (rowCPM * rowImp);
      total.SumCPC += (rowCPC * rowClicks);
    });

    const safeDiv = (a, b) => (b ? ((a / b) * 100).toFixed(2) : "0.00");
    return {
      total,
      CTR: safeDiv(total.Clicks, total.Imp),
      ReachPct: safeDiv(total.Reach, total.Imp),
      // Strictly derive weighted metrics from total spent
      CPC: total.Clicks ? (total.Spent / total.Clicks).toFixed(2) : "0.00",
      CPM: total.Imp ? ((total.Spent / total.Imp) * 1000).toFixed(2) : "0.00",
      Spent: total.Spent.toFixed(2)
    };
  }, [tableData, campaignPricing]);

  return (
    <div className="mb-4">
      {/* Tabs */}
      <div className="d-flex mb-0">
        <div className="px-5 py-3 fw-bold text-dark border-bottom border-primary border-4 bg-white" style={{ fontSize: '18px', cursor: 'pointer', zIndex: 2, letterSpacing: '0.5px' }}>
          Performance
        </div>
        <div className="flex-grow-1 bg-light border-bottom border-light opacity-50"></div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden bg-white" style={{ borderRadius: '0 0 4px 4px', zIndex: 1 }}>
        <div className="card-body p-0">
          <div className="row g-0">
            {/* Left Content */}
            <div className="col-lg-9 border-end border-light">
              <div className="row g-0 text-center">
                <div className="col-6 py-4" style={{ backgroundColor: '#D6E4FF' }}>
                  <h3 className="fw-bold text-dark mb-1" style={{ fontSize: '24px' }}>{stats.total.Imp.toLocaleString()}</h3>
                  <p className="text-dark small fw-bold mb-0 opacity-75">Impressions</p>
                </div>
                <div className="col-6 py-4" style={{ backgroundColor: '#EDF2FF' }}>
                  <h3 className="fw-bold text-dark mb-1" style={{ fontSize: '24px' }}>{stats.total.Reach.toLocaleString()}</h3>
                  <p className="text-dark small fw-bold mb-0 opacity-75">Reach</p>
                </div>
              </div>
              <div className="row py-5 align-items-center">
                <div className={`${campaignType === "CTV" ? "col-12" : "col-6"} d-flex flex-column align-items-center`}>
                  <DonutLarge percentage={stats.ReachPct} label="Reach" color="#3B82F6" />
                </div>
                {campaignType !== "CTV" && (
                  <div className="col-6 d-flex flex-column align-items-center border-start border-light" style={{ height: '220px', justifyContent: 'center' }}>
                    <DonutLarge 
                      value={stats.total.Clicks.toLocaleString()} 
                      percentage={stats.CTR} 
                      label="Clicks" 
                      color="#3B82F6" 
                      showBoth 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="col-lg-3 p-4 bg-white d-flex flex-column align-items-center">
              <div className="mb-5 w-100 text-end pe-4 mt-2">
                <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '18px' }}>Performance</h5>
              </div>
              <div className="d-flex flex-column gap-4 w-100 px-4">
                {!["Video", "CTV", "Youtube"].includes(campaignType) && (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary small fw-bold" style={{ fontSize: '13px' }}>CTR</span>
                    <span className="text-dark fw-bold" style={{ fontSize: '14px' }}>{stats.CTR}%</span>
                  </div>
                )}
                {hasCPMValue && !["Video", "CTV", "Youtube"].includes(campaignType) && (
                  <>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-secondary small fw-bold" style={{ fontSize: '13px' }}>eCPC</span>
                      <span className="text-dark fw-bold" style={{ fontSize: '14px' }}>{currencySymbol}{stats.CPC}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="text-secondary small fw-bold" style={{ fontSize: '13px' }}>eCPM</span>
                      <span className="text-dark fw-bold" style={{ fontSize: '14px' }}>{currencySymbol}{stats.CPM}</span>
                    </div>
                  </>
                )}
                {hasCPMValue && ["Video", "CTV", "Youtube"].includes(campaignType) && (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary small fw-bold" style={{ fontSize: '13px' }}>eCPM</span>
                    <span className="text-dark fw-bold" style={{ fontSize: '14px' }}>{currencySymbol}{stats.CPM}</span>
                  </div>
                )}
                {hasSpent && (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-secondary small fw-bold" style={{ fontSize: '13px' }}>Spent</span>
                    <span className="text-dark fw-bold" style={{ fontSize: '14px' }}>{currencySymbol}{stats.Spent}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="col-12 mt-4">
              <TrendChart 
                tableData={tableData} 
                campaignPermissions={campaignPermissions}
                campaignPricing={campaignPricing}
                campaignType={campaignType}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PerformanceDashboard;

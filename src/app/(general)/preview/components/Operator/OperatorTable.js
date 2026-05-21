"use client";
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiPlus } from "react-icons/fi";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const columnsList = [
  { name: "Title", defaultVisible: true },
  { name: "Impressions", defaultVisible: true },
  { name: "Clicks", defaultVisible: true },
  { name: "CTR", defaultVisible: true },
  { name: "eCPM", defaultVisible: true, permission: "cpm" },
  { name: "eCPC", defaultVisible: true, permission: "cpm" },
  { name: "Spent", defaultVisible: true, permission: "spent" },
  { name: "Installs", defaultVisible: true },
  { name: "Total Conversions", defaultVisible: true },
  // Video metrics — hidden by default, selectable via Columns modal
  { name: "Views", defaultVisible: true},
  { name: "Complete Views", defaultVisible: true },
  { name: "First Quartile Views", defaultVisible: true },
  { name: "Midpoint Views", defaultVisible: true },
  { name: "Third Quartile Views", defaultVisible: true },
  { name: "CPCV", defaultVisible: true },
  { name: "CPV", defaultVisible: true },
];

const getPriceForDate = (pricingObj, targetDate) => {
  if (!pricingObj || typeof pricingObj !== 'object') return undefined;
  const normalize = (d) => String(d).replace(/\//g, '-').split(' ')[0].substring(0, 10);
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

const OperatorTable = ({ 
  operatorData = [], 
  currencySymbol = "$", 
  campaignPermissions = [], 
  campaignPricing = { cpm: {}, cpc: {} },
  globalEffectiveMetrics = { eCPM: 0, eCPC: 0 },
  campaignType = "",
  appsflyerCampaignType = "",
  appsflyerDataLength = 0,
  appsflyerData = [],
  globalTotals = { TotalConversions: 0, Installs: 0 }
}) => {
  const { data: session } = useSession();

  const filteredColumnsByType = React.useMemo(() => {
    const isVideoType = ["Video", "CTV", "Youtube"].includes(campaignType);
    return columnsList.filter(col => {
      if (campaignType === "Banner") {
        if (["Views", "Complete Views", "First Quartile Views", "Midpoint Views", "Third Quartile Views", "CPCV", "CPV"].includes(col.name)) return false;
      }
      return true;
    });
  }, [campaignType]);

  const filteredColumnsByPermission = filteredColumnsByType.filter(col => {
    if (session?.user?.role === "super_admin") return true;
    if (!col.permission) return true;
    const perm = col.permission.toLowerCase();
    const isCampaignRestricted = campaignPermissions.some(p => p.toLowerCase() === perm);
    if (isCampaignRestricted) return false;
    const isUserRestricted = session?.user?.permissions?.some(p => p.toLowerCase() === perm);

    // HIDE INSTALLS IF NO APPSFLYER DATA
    if (appsflyerDataLength === 0 && col.name === "Installs") return false;

    return !isUserRestricted;
  });

  const [visibleColumns, setVisibleColumns] = useState([]);

  useEffect(() => {
    if (filteredColumnsByPermission.length > 0) {
      const defaults = filteredColumnsByPermission.filter(c => {
        if (!c.defaultVisible) return false;
        const isVideoType = ["Video", "CTV", "Youtube"].includes(campaignType);
        if (isVideoType && ["Clicks", "CTR", "eCPC"].includes(c.name)) return false;
        // HIDE INSTALLS IF NO APPSFLYER DATA
        if (appsflyerDataLength === 0 && c.name === "Installs") return false;
        return true;
      }).map(c => c.name);
      
      const stored = localStorage.getItem("visible_columns_operator");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const availableNames = filteredColumnsByPermission.map(c => c.name);
            const filteredStored = parsed.filter(name => availableNames.includes(name));
            if (filteredStored.length > 0) {
              setVisibleColumns(filteredStored);
              return;
            }
          }
        } catch (e) {
          console.error("Failed to parse stored columns for Operator table", e);
        }
      }
      setVisibleColumns(defaults);
    }
  }, [campaignType, filteredColumnsByPermission.length, appsflyerDataLength]);

  const [show, setShow] = useState(false);
  const [tempVisibleColumns, setTempVisibleColumns] = useState([]);

  useEffect(() => {
    if (show) {
      setTempVisibleColumns(visibleColumns);
    }
  }, [show, visibleColumns]);

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // GROUPING LOGIC: Correct Way (Weighted)
  const groupedData = React.useMemo(() => {
    const groups = {};
    
    operatorData.forEach(row => {
      const title = row.name || row.browser || row.oses || row.os || row.OS || row.operator || row.browser_name || row.os_name || "-";
      const imp = Number(row.Impressions || row.impressions || 0);
      const cks = Number(row.Clicks || row.clicks || 0);
      const rowDate = row.Date || row.date || "";

      const videoComplete = Number(row.completeViewsVideo || row.CompleteViewsVideo || row["Complete Views"] || 0);
      const videoFirstQ = Number(row.firstQuartileViewsVideo || row.FirstQuartileViewsVideo || row["First Quartile Views"] || 0);
      const videoMidpoint = Number(row.midpointViewsVideo || row.MidpointViewsVideo || row["Midpoint Views"] || 0);
      const videoThirdQ = Number(row.thirdQuartileViewsVideo || row.ThirdQuartileViewsVideo || row["Third Quartile Views"] || 0);
      const videoViews = Number(row.Views || row.views || row.VideoViews || 0); 
      const videoCPCV = row.CPCV || row.Cpcv || row.cpcv || 0;
      const videoCPV = row.CPV || row.Cpv || row.cpv || 0;

      const datePriceCPM = getPriceForDate(campaignPricing?.cpm, rowDate);
      const datePriceCPC = getPriceForDate(campaignPricing?.cpc, rowDate);

      let rowSpent = 0;
      if (datePriceCPM > 0) {
        rowSpent = (imp / 1000) * datePriceCPM;
      } else if (datePriceCPC > 0) {
        rowSpent = cks * datePriceCPC;
      } else if (globalEffectiveMetrics.eCPM > 0) {
        rowSpent = (imp / 1000) * globalEffectiveMetrics.eCPM;
      } else if (globalEffectiveMetrics.eCPC > 0) {
        rowSpent = cks * globalEffectiveMetrics.eCPC;
      } else {
        const rCPM = Number(row.CPM || row.cpm || 0);
        const rCPC = Number(row.CPC || row.cpc || 0);
        rowSpent = rCPM > 0 ? (imp / 1000) * rCPM : (cks * rCPC);
      }

      if (!groups[title]) {
        groups[title] = {
          Title: title,
          Impressions: 0,
          Clicks: 0,
          Spent: 0,
          TotalConversions: 0,
          Installs: 0,
          "Complete Views": 0,
          "First Quartile Views": 0,
          "Midpoint Views": 0,
          "Third Quartile Views": 0,
          "Views": 0,
          CPCV: 0,
          CPV: 0
        };
      }

      groups[title].Impressions += imp;
      groups[title].Clicks += cks;
      groups[title].Spent += rowSpent;
      
      let convFactor = 0.011194; // Always use for proportional distribution weight
      let instFactor = (appsflyerDataLength > 0) ? 0.0989 : 0;

      const rowBrowser = (row.browser || row.browser_name || "").toLowerCase();
      if ((campaignType?.toLowerCase() === "android" || appsflyerCampaignType?.toLowerCase() === "android") && rowBrowser.includes("safari")) {
        convFactor = 0;
        instFactor = 0;
      }

      groups[title].TotalConversions += (cks * convFactor);
      groups[title].Installs += (cks * instFactor);
      
      groups[title]["Complete Views"] += videoComplete;
      groups[title]["First Quartile Views"] += videoFirstQ;
      groups[title]["Midpoint Views"] += videoMidpoint;
      groups[title]["Third Quartile Views"] += videoThirdQ;
      groups[title]["Views"] += videoViews;
      groups[title].CPCV += videoCPCV;
      groups[title].CPV += videoCPV;
    });

    const result = Object.values(groups);
    const targetConversions = globalTotals?.TotalConversions || 0;
    const targetInstalls = globalTotals?.Installs || 0;

    const currentTotalConv = result.reduce((sum, g) => sum + g.TotalConversions, 0);
    const currentTotalInst = result.reduce((sum, g) => sum + g.Installs, 0);

    const convScale = currentTotalConv > 0 ? targetConversions / currentTotalConv : 0;
    const instScale = currentTotalInst > 0 ? targetInstalls / currentTotalInst : 0;

    let summedConv = 0;
    let summedInst = 0;

    result.forEach(g => {
      g.TotalConversions = Math.round(g.TotalConversions * convScale);
      g.Installs = Math.round(g.Installs * instScale);
      summedConv += g.TotalConversions;
      summedInst += g.Installs;
    });

    if (result.length > 0) {
      const diffConv = targetConversions - summedConv;
      const diffInst = targetInstalls - summedInst;
      
      if (diffConv !== 0 || diffInst !== 0) {
        const largest = result.reduce((prev, current) => (prev.Clicks > current.Clicks) ? prev : current);
        largest.TotalConversions += diffConv;
        largest.Installs += diffInst;
      }
    }

    // Distribute AppsFlyer clicks if appsflyerDataLength > 0
    if (appsflyerDataLength > 0 && appsflyerData && appsflyerData.length > 0) {
      const totalBaseClicks = result.reduce((sum, g) => sum + g.Clicks, 0);
      const totalAfClicks = appsflyerData.reduce((sum, item) => sum + Number(item.clicks || 0), 0);
      
      if (totalBaseClicks > 0 && totalAfClicks > 0) {
        let summedClicks = 0;
        result.forEach(g => {
          const clickPct = g.Clicks / totalBaseClicks;
          const clicksToAdd = totalAfClicks * clickPct;
          g.Clicks = Math.round(g.Clicks + clicksToAdd);
          summedClicks += g.Clicks;
        });

        if (result.length > 0) {
          const targetClicks = totalBaseClicks + totalAfClicks;
          const diffClicks = targetClicks - summedClicks;
          if (diffClicks !== 0) {
            const largest = result.reduce((prev, current) => (prev.Clicks > current.Clicks) ? prev : current);
            largest.Clicks += diffClicks;
          }
        }
      }
    }

    // Determine if this is a CPM or CPC campaign from raw pricing
    const anyCpmRate = getPriceForDate(campaignPricing?.cpm, null);
    const isCpmCampaign = anyCpmRate !== undefined && Number(anyCpmRate) > 0;

    return result.map(g => ({
      ...g,
      CTR: g.Impressions > 0 ? (g.Clicks / g.Impressions) * 100 : 0,
      eCPM: isCpmCampaign
        ? (g.Impressions > 0 ? (g.Spent / g.Impressions) * 1000 : 0)
        : 0,
      eCPC: g.Clicks > 0 ? (g.Spent / g.Clicks) : 0,
    })).sort((a,b) => b.Impressions - a.Impressions);
  }, [operatorData, campaignPricing, globalEffectiveMetrics, campaignType, appsflyerCampaignType, globalTotals, appsflyerDataLength, appsflyerData]);

  const filteredColumns = filteredColumnsByPermission.filter((col) =>
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleTempColumn = (colName) => {
    setTempVisibleColumns(prev =>
      prev.includes(colName) ? prev.filter(c => c !== colName) : [...prev, colName]
    );
  };

  const handleApplyColumns = () => {
    setVisibleColumns(tempVisibleColumns);
    localStorage.setItem("visible_columns_operator", JSON.stringify(tempVisibleColumns));
    setShow(false);
  };

  const totalPages = Math.ceil((groupedData?.length || 0) / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = groupedData?.slice(startIndex, startIndex + rowsPerPage) || [];

  const totals = groupedData?.reduce((acc, row) => ({
    Impressions: acc.Impressions + row.Impressions,
    Clicks: acc.Clicks + row.Clicks,
    Spent: acc.Spent + row.Spent,
    "Total Conversions": (acc["Total Conversions"] || 0) + row.TotalConversions,
    "Installs": (acc["Installs"] || 0) + row.Installs,
    "Complete Views": (acc["Complete Views"] || 0) + row["Complete Views"],
    "First Quartile Views": (acc["First Quartile Views"] || 0) + row["First Quartile Views"],
    "Midpoint Views": (acc["Midpoint Views"] || 0) + row["Midpoint Views"],
    "Third Quartile Views": (acc["Third Quartile Views"] || 0) + row["Third Quartile Views"],
    "Views": (acc["Views"] || 0) + row["Views"],
    SumCPM: (acc.SumCPM || 0) + (row.eCPM * row.Impressions), // For weighted total footer
    SumCPC: (acc.SumCPC || 0) + (row.eCPC * row.Clicks),
  }), { 
    Impressions: 0, 
    Clicks: 0, 
    Spent: 0, 
    "Total Conversions": 0, 
    "Installs": 0, 
    "Complete Views": 0,
    "First Quartile Views": 0,
    "Midpoint Views": 0,
    "Third Quartile Views": 0,
    "Views": 0,
    SumCPM: 0, 
    SumCPC: 0 
  });

  const formatValue = (col, value) => {
    if (value === undefined || value === null) return "0";
    if (
      col === "Impressions" ||
      col === "Clicks" ||
      col === "Total Conversions" ||
      col === "Installs" ||
      col === "Complete Views" ||
      col === "First Quartile Views" ||
      col === "Midpoint Views" ||
      col === "Third Quartile Views" ||
      col === "Views" ||
      col === "CPCV" ||
      col === "CPV"
    ) {
      return isNaN(Number(value)) ? (value || "0") : Math.round(Number(value)).toLocaleString();
    }
    if (col === "Spent" || col === "eCPM" || col === "eCPC") {
      const rawNum = Number(value || 0);
      return currencySymbol + rawNum.toFixed(2);
    }
    if (col === "CTR") {
      return Number(value || 0).toFixed(2) + "%";
    }
    return value;
  };

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-0 pt-4 px-4 pb-3">
        <div className="d-flex justify-content-between align-items-center w-100">
            <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>Operators</h5>
            <button data-html2canvas-ignore="true" data-print-hide className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShow(true)} style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '14px' }}>
                <FiPlus size={18} />
                <span>Columns</span>
            </button>
        </div>
      </div>
      <div className="card-body p-0 mt-2">
        <div className="table-responsive">
          <table className="table align-middle mb-0 mt-3">
            <thead className="table-light">
              <tr className="border-bottom">
                {visibleColumns.map(col => (
                  <th key={col} className="text-secondary fw-bold small py-3 px-4" style={{ borderBottom: '1px solid #eee' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr key={idx} className="border-bottom">
                  {visibleColumns.map(col => {
                    const imp = row.Impressions || 0;
                    const cks = row.Clicks || 0;
                    const cnv = row.TotalConversions || 0;

                    let val;
                    if (col === "Title") val = row.Title || "-";
                    else if (col === "Impressions") val = imp;
                    else if (col === "Clicks") val = cks;
                    else if (col === "Total Conversions") val = row.TotalConversions;
                    else if (col === "Installs") val = row.Installs;
                    else if (col === "Complete Views") val = row["Complete Views"] || 0;
                    else if (col === "First Quartile Views") val = row["First Quartile Views"] || 0;
                    else if (col === "Midpoint Views") val = row["Midpoint Views"] || 0;
                    else if (col === "Third Quartile Views") val = row["Third Quartile Views"] || 0;
                    else if (col === "CPCV") val = row.CPCV || 0;
                    else if (col === "CPV") val = row.CPV || 0;
                    else if (col === "CTR") val = row.CTR || 0;
                    else if (col === "Spent") val = row.Spent || 0;
                    else if (col === "eCPM") val = row.eCPM || 0;
                    else if (col === "eCPC") val = row.eCPC || 0;
                    else val = row[col] || 0;

                    return (
                      <td key={col} className="py-3 px-4">
                        <span className="text-dark small">{formatValue(col, val)}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {operatorData?.length > 0 && (
                <tr className="bg-white">
                  {visibleColumns.map(col => (
                    <td key={col} className="py-3 px-4 fw-bold">
                       <span className="small">
                        {col === "Title" ? "Total:" : 
                         col === "CTR" ? (totals.Impressions ? ((totals.Clicks / totals.Impressions) * 100).toFixed(2) + "%" : "0.00%") :
                         col === "eCPM" ? (() => {
                                    const cpmRate = getPriceForDate(campaignPricing?.cpm, null);
                                    const isCpmCampaign = cpmRate !== undefined && Number(cpmRate) > 0;
                                    return isCpmCampaign && totals.Impressions
                                      ? currencySymbol + ((totals.Spent / totals.Impressions) * 1000).toFixed(2)
                                      : currencySymbol + "0.00";
                                  })() :
                         col === "eCPC" ? (totals.Clicks ? currencySymbol + (totals.Spent / totals.Clicks).toFixed(2) : currencySymbol + "0.00") :
                         col === "CPCV" ? (totals["Complete Views"] ? currencySymbol + (totals.Spent / totals["Complete Views"]).toFixed(2) : currencySymbol + "0.00") :
                         col === "CPV" ? (totals["Views"] ? currencySymbol + (totals.Spent / totals["Views"]).toFixed(2) : currencySymbol + "0.00") :
                         formatValue(col, totals[col])}
                       </span>
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
          {(!operatorData || operatorData.length === 0) && (
            <div className="text-center py-5 text-muted">No Operator data available</div>
          )}
        </div>
        {operatorData?.length > 0 && (
          <div data-html2canvas-ignore="true" data-print-hide className="d-flex justify-content-end align-items-center gap-4 py-3 px-4 text-muted border-top bg-light-subtle" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
              <div className="d-flex align-items-center gap-3">
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>Rows per page:</span>
                  <div className="position-relative">
                    <select 
                      value={rowsPerPage} 
                      onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="form-select form-select-sm border shadow-sm" 
                      style={{ 
                        width: '80px', 
                        height: '36px', 
                        borderRadius: '8px', 
                        fontSize: '14px',
                        padding: '0 24px 0 12px',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundColor: '#fff',
                        lineHeight: '36px'
                      }}
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    {/* <FiChevronDown className="position-absolute text-muted" style={{ top: '50%', right: '10px', transform: 'translateY(-50%)', pointerEvents: 'none' }} size={14} /> */}
                  </div>
              </div>
              
              <div className="d-flex align-items-center gap-3">
                <span style={{ fontSize: '13px', fontWeight: '500', minWidth: '80px', textAlign: 'center' }}>
                  {startIndex + 1}-{Math.min(startIndex + rowsPerPage, operatorData.length)} of {operatorData.length}
                </span>
                
                <div className="d-flex gap-2">
                    <button 
                      className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-0 shadow-sm"
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '6px',
                        backgroundColor: '#fff',
                        cursor: currentPage > 1 ? 'pointer' : 'not-allowed', 
                        opacity: currentPage > 1 ? 1 : 0.4 
                      }}
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <FiChevronLeft size={18} />
                    </button>
                    
                    <button 
                      className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-0 shadow-sm"
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '6px',
                        backgroundColor: '#fff',
                        cursor: currentPage < totalPages ? 'pointer' : 'not-allowed', 
                        opacity: currentPage < totalPages ? 1 : 0.4 
                      }}
                      disabled={currentPage >= totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      <FiChevronRight size={18} />
                    </button>
                </div>
              </div>
          </div>
        )}
      </div>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">Manage Columns</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Search columns..."
            className="mb-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="border rounded p-3 bg-light" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {filteredColumns.map((col) => (
              <Form.Check
                key={col.name}
                type="checkbox"
                id={`operator-check-${col.name}`}
                label={col.name}
                checked={tempVisibleColumns.includes(col.name)}
                onChange={() => handleToggleTempColumn(col.name)}
                className="mb-2"
              />
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={() => setShow(false)} style={{ borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApplyColumns} style={{ borderRadius: '8px' }}>
            Apply
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .table thead th {
          border-top: none;
        }
        .table td {
          border: none;
        }
      `}</style>
    </div>
  );
};

export default OperatorTable;

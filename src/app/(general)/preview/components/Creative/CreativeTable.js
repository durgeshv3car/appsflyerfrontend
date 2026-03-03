"use client";
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiPlus } from "react-icons/fi";

const columnsList = [
  { name: "Title", defaultVisible: true },
  { name: "Impressions", defaultVisible: true },
  { name: "Clicks", defaultVisible: true },
  { name: "Reach", defaultVisible: true },
  { name: "CTR", defaultVisible: true },
  { name: "CPM", defaultVisible: true },
  { name: "CPC", defaultVisible: true },
  { name: "Spent", defaultVisible: true },
  { name: "Total Conversions", defaultVisible: true },
];

const CreativePerformanceTable = ({ CreativeTableData = [], currencySymbol = "$" }) => {
  const [visibleColumns, setVisibleColumns] = useState(
    columnsList.filter((col) => col.defaultVisible).map((col) => col.name)
  );
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredColumns = columnsList.filter((col) =>
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleColumn = (colName) => {
    setVisibleColumns(prev => 
      prev.includes(colName) ? prev.filter(c => c !== colName) : [...prev, colName]
    );
  };

  const totalPages = Math.ceil((CreativeTableData?.length || 0) / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = CreativeTableData?.slice(startIndex, startIndex + rowsPerPage) || [];

  const totals = CreativeTableData?.reduce((acc, row) => {
    const imp = Number(row.Impressions || row.impressions || 0);
    const clicks = Number(row.Clicks || row.clicks || 0);
    const reach = Number(row.Reach || row.reach || row.total_reach || row.uniqueReachImpressionReach || 0);
    const spent = Number(row.mediaCost || row.mediaCostAdvertiserCurrency || row.Spent || row.spent || row.cost || 0);
    const totalConversions = Number(row.TotalConversions || row.totalConversions || row.total_conversions || 0);
    
    // Prioritize provided CPM/CPC for weighted aggregate
    let cpm = Number(row.CPM || row.cpm || 0);
    if (!cpm && imp > 0) cpm = (spent / imp) * 1000;
    
    let cpc = Number(row.CPC || row.cpc || 0);
    if (!cpc && clicks > 0) cpc = (spent / clicks);

    return {
      Impressions: acc.Impressions + imp,
      Clicks: acc.Clicks + clicks,
      Reach: acc.Reach + reach,
      Spent: acc.Spent + spent,
      "Total Conversions": (acc["Total Conversions"] || 0) + totalConversions,
      SumCPM: (acc.SumCPM || 0) + (cpm * imp),
      SumCPC: (acc.SumCPC || 0) + (cpc * clicks),
    };
  }, { Impressions: 0, Clicks: 0, Reach: 0, Spent: 0, "Total Conversions": 0, SumCPM: 0, SumCPC: 0 });

  const formatValue = (col, value) => {
    if (col === "Title") return value || "-";
    if (value === undefined || value === null) return "0";
    if (col === "Impressions" || col === "Clicks" || col === "Reach" || col === "Total Conversions") {
      return isNaN(Number(value)) ? (value || "0") : Number(value).toLocaleString();
    }
    if (col === "Spent" || col === "CPM" || col === "CPC") {
      const rawNum = typeof value === "string"
        ? parseFloat(value.replace(/[^0-9.-]/g, "")) || 0
        : Number(value || 0);
      return currencySymbol + rawNum.toFixed(2);
    }
    if (col === "CTR") {
      return typeof value === "string" && value.includes("%") ? value : Number(value || 0).toFixed(2) + "%";
    }
    return value;
  };

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-0 pt-4 px-4 pb-3">
        <div className="d-flex justify-content-between align-items-center w-100">
            <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>Creative Performance</h5>
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShow(true)} style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '14px' }}>
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
                    // Base metrics normalization
                    const imp = Number(row.Impressions || row.impressions || 0);
                    const cks = Number(row.Clicks || row.clicks || 0);
                    const rch = Number(row.Reach || row.reach || row.total_reach || row.uniqueReachImpressionReach || 0);
                    const spt = Number(row.mediaCost || row.mediaCostAdvertiserCurrency || row.Spent || row.spent || row.cost || 0);
                    const cnv = Number(row.TotalConversions || row.totalConversions || row.total_conversions || 0);

                    const rawCPM = row.CPM || row.cpm;
                    const rawCPC = row.CPC || row.cpc;

                    let val = row[col] || row[col.toLowerCase()] || row[col.charAt(0).toLowerCase() + col.slice(1)];
                    
                    // Priority mappings
                    if (col === "Impressions") val = imp;
                    if (col === "Clicks") val = cks;
                    if (col === "Reach") val = rch;
                    if (col === "Spent") val = spt;
                    if (col === "Total Conversions") val = cnv;
                    
                    // Force consistent derived metrics
                    if (col === "CTR") val = imp > 0 ? (cks / imp) * 100 : 0;
                    if (col === "CPM") {
                      const definedCPM = Number(rawCPM || 0);
                      val = definedCPM > 0 ? definedCPM : (imp > 0 ? (spt / imp) * 1000 : 0);
                    }
                    if (col === "CPC") {
                      const definedCPC = Number(rawCPC || 0);
                      val = definedCPC > 0 ? definedCPC : (cks > 0 ? (spt / cks) : 0);
                    }
                    
                    // Fallback for Title
                    if (col === "Title" && !val) {
                      val = row.creative_name || row.Creative || row.name || row.creative || row.line_item_name || "-";
                    }

                    return (
                      <td key={col} className="py-3 px-4">
                        <span className="text-dark small">{formatValue(col, val)}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {CreativeTableData?.length > 0 && (
                <tr className="bg-white">
                  {visibleColumns.map(col => (
                    <td key={col} className="py-3 px-4 fw-bold">
                       <span className="small">
                        {col === "Title" ? "Total:" : 
                         col === "CTR" ? (totals.Impressions ? ((totals.Clicks / totals.Impressions) * 100).toFixed(2) + "%" : "0.00%") :
                         col === "CPM" ? (totals.Impressions ? currencySymbol + (totals.SumCPM / totals.Impressions).toFixed(2) : currencySymbol + "0.00") :
                         col === "CPC" ? (totals.Clicks ? currencySymbol + (totals.SumCPC / totals.Clicks).toFixed(2) : currencySymbol + "0.00") :
                         formatValue(col, totals[col])}
                       </span>
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
          {(!CreativeTableData || CreativeTableData.length === 0) && (
            <div className="text-center py-5 text-muted">No creative data available</div>
          )}
        </div>
        
        {CreativeTableData?.length > 0 && (
          <div className="d-flex justify-content-end align-items-center gap-4 py-3 px-4 text-muted border-top bg-light-subtle" style={{ borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
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
                    <FiChevronDown className="position-absolute text-muted" style={{ top: '50%', right: '10px', transform: 'translateY(-50%)', pointerEvents: 'none' }} size={14} />
                  </div>
              </div>
              
              <div className="d-flex align-items-center gap-3">
                <span style={{ fontSize: '13px', fontWeight: '500', minWidth: '80px', textAlign: 'center' }}>
                  {startIndex + 1}-{Math.min(startIndex + rowsPerPage, CreativeTableData.length)} of {CreativeTableData.length}
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
                id={`creative-check-${col.name}`}
                label={col.name}
                checked={visibleColumns.includes(col.name)}
                onChange={() => toggleColumn(col.name)}
                className="mb-2"
              />
            ))}
          </div>
        </Modal.Body>
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

export default CreativePerformanceTable;

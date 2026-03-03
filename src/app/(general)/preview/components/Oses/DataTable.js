"use client";
import React, { useState, useMemo } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FiPlus } from "react-icons/fi";

const columnsList = [
  { name: "Platform", defaultVisible: true },
  { name: "Impressions", defaultVisible: true },
  { name: "Reach", defaultVisible: true },
  { name: "Frequency", defaultVisible: true },
  { name: "Clicks", defaultVisible: true },
  { name: "CTR", defaultVisible: true },
  { name: "CPM", defaultVisible: true },
  { name: "CPC", defaultVisible: true },
  { name: "Spent", defaultVisible: true },
];

const PerformanceTable = ({ tableData = [] }) => {
  const [visibleColumns, setVisibleColumns] = useState(
    columnsList.filter((col) => col.defaultVisible).map((col) => col.name)
  );
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState("");

  const filteredColumns = columnsList.filter((col) =>
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleColumn = (colName) => {
    setVisibleColumns(prev => 
      prev.includes(colName) ? prev.filter(c => c !== colName) : [...prev, colName]
    );
  };

  const totals = useMemo(() => {
    return tableData?.reduce((acc, row) => {
      const imp = Number(row.Impressions || row.impressions || 0);
      const clicks = Number(row.Clicks || row.clicks || 0);
      const reach = Number(row.Reach || row.reach || row.total_reach || row.uniqueReachImpressionReach || 0);
      const spent = Number(row.Spent || row.spent || row.cost || 0);
      return {
        Impressions: acc.Impressions + imp,
        Clicks: acc.Clicks + clicks,
        Reach: acc.Reach + reach,
        Spent: acc.Spent + spent,
      };
    }, { Impressions: 0, Clicks: 0, Reach: 0, Spent: 0 });
  }, [tableData]);

  const formatValue = (col, value) => {
    if (col === "Frequency") {
        return totals.Reach ? (totals.Impressions / totals.Reach).toFixed(2) : "1.00";
    }
    if (col === "CTR") {
        return totals.Impressions ? ((totals.Clicks / totals.Impressions) * 100).toFixed(2) + "%" : "0.00%";
    }
    if (col === "CPM") {
        return totals.Impressions ? "$" + ((totals.Spent / totals.Impressions) * 1000).toFixed(2) : "$0.00";
    }
    if (col === "CPC") {
        return totals.Clicks ? "$" + (totals.Spent / totals.Clicks).toFixed(2) : "$0.00";
    }
    if (col === "Spent") {
        return "$" + totals.Spent.toFixed(2);
    }
    if (col === "Impressions" || col === "Clicks" || col === "Reach") {
      return Number(value || 0).toLocaleString();
    }
    return value;
  };

  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-header bg-white border-0 pt-4 px-4 pb-3">
        <div className="d-flex justify-content-between align-items-center w-100">
            <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>Platform Metrics</h5>
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShow(true)} style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '14px' }}>
                <FiPlus size={18} />
                <span>Columns</span>
            </button>
        </div>
      </div>
      <div className="card-body p-0 mt-2">
        <div className="w-100 overflow-hidden"> 
          <table className="table align-middle mb-0 mt-0 table-borderless">
            <thead className="table-light">
              <tr className="border-bottom">
                {visibleColumns.map(col => (
                  <th key={col} className="text-secondary fw-bold py-3 px-4 shadow-none small">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
                <tr className="text-nowrap">
                  {visibleColumns.map(col => (
                    <td key={col} className="py-3 px-2">
                      <span className="text-dark fw-medium">
                        {col === "Platform" ? "Programmatic" : 
                         col === "Reach" && !totals[col] ? formatValue(col, tableData[0]?.uniqueReachImpressionReach) : 
                         formatValue(col, totals[col])}
                      </span>
                    </td>
                  ))}
                </tr>
            </tbody>
          </table>
        </div>
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
                id={`age-check-v2-${col.name}`}
                label={col.name}
                checked={visibleColumns.includes(col.name)}
                onChange={() => toggleColumn(col.name)}
                className="mb-2"
              />
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PerformanceTable;

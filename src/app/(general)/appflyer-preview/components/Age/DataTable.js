"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

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
  const [visibleColumns, setVisibleColumns] = useState([]);

  useEffect(() => {
    const defaults = columnsList.filter((col) => col.defaultVisible).map((col) => col.name);
    const stored = localStorage.getItem("visible_columns_age");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const availableNames = columnsList.map(c => c.name);
          const filteredStored = parsed.filter(name => availableNames.includes(name));
          if (filteredStored.length > 0) {
            setVisibleColumns(filteredStored);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to parse stored columns for Age table", e);
      }
    }
    setVisibleColumns(defaults);
  }, []);
  const [show, setShow] = useState(false);
  const [tempVisibleColumns, setTempVisibleColumns] = useState([]);

  useEffect(() => {
    if (show) {
      setTempVisibleColumns(visibleColumns);
    }
  }, [show, visibleColumns]);

  const [search, setSearch] = useState("");

  const filteredColumns = columnsList.filter((col) =>
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleTempColumn = (colName) => {
    setTempVisibleColumns(prev =>
      prev.includes(colName) ? prev.filter(c => c !== colName) : [...prev, colName]
    );
  };

  const handleApplyColumns = () => {
    setVisibleColumns(tempVisibleColumns);
    localStorage.setItem("visible_columns_age", JSON.stringify(tempVisibleColumns));
    setShow(false);
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
            <button className="btn btn-link p-0 text-primary" onClick={() => setShow(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>
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
    </div>
  );
};

export default PerformanceTable;

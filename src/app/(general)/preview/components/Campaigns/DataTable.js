"use client";
import React, { useState, useMemo } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const columnsList = [
  { name: "Date", defaultVisible: true },
  { name: "Impressions", defaultVisible: true },
  { name: "Clicks", defaultVisible: true },
  { name: "Reach", defaultVisible: true },
  { name: "CTR", defaultVisible: true },
  { name: "CPM", defaultVisible: true },
  { name: "CPC", defaultVisible: false },
  { name: "Spent", defaultVisible: true },
  { name: "ViewableImpressions", defaultVisible: false },
  { name: "Viewability", defaultVisible: false },
  { name: "Engagement", defaultVisible: true },
  { name: "ER", defaultVisible: false },
  { name: "CPE", defaultVisible: false },
];

const TableWithDynamicColumns = ({ tableData }) => {
  // Initialize with only columns that have defaultVisible: true
  const [visibleColumns, setVisibleColumns] = useState(
    columnsList.filter((col) => col.defaultVisible).map((col) => col.name)
  );
  const [search, setSearch] = useState("");
  const [show, setShow] = useState(false);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleColumn = (colName) => {
    if (visibleColumns.includes(colName)) {
      setVisibleColumns(visibleColumns.filter((c) => c !== colName));
    } else {
      setVisibleColumns([...visibleColumns, colName]);
    }
  };

  const selectAll = () => {
    setVisibleColumns(columnsList.map((col) => col.name));
  };

  const deselectAll = () => {
    setVisibleColumns([]);
  };

  const filteredColumns = columnsList.filter((col) =>
    col.name.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate pagination
  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = tableData.slice(startIndex, endIndex);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleRowsChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="">
      <div className="container-fluid py-4">
        {/* Header Card */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="h4 mb-1 fw-bold text-dark">Performance Table</h2>
                <p className="text-muted small mb-0">
                  <svg
                    width="14"
                    height="14"
                    fill="currentColor"
                    className="me-1"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                    <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
                  </svg>
                  Showing {tableData.length} rows with {visibleColumns.length}{" "}
                  columns
                </p>
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="d-flex align-items-center gap-2"
                  onClick={() => setShow(true)}
                >
                  <svg
                    width="16"
                    height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                  </svg>
                  Manage Columns
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    {visibleColumns.map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-nowrap fw-semibold"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, idx) => (
                    <tr key={idx} className="border-bottom">
                      {visibleColumns.map((col) => (
                        <td key={col} className="px-4 py-3">
                          {col === "Date" && (
                            <span className="text-dark fw-medium">
                              {row[col]}
                            </span>
                          )}
                          {col === "Impressions" && (
                            <span className="badge bg-primary bg-opacity-10 fw-semibold px-3 py-2">
                              {row[col]?.toLocaleString()}
                            </span>
                          )}
                          {col === "Clicks" && (
                            <span className="badge bg-success bg-opacity-10 fw-semibold px-3 py-2">
                              {row[col]?.toLocaleString()}
                            </span>
                          )}
                          {col === "Reach" && (
                            <span className="badge bg-info bg-opacity-10 fw-semibold px-3 py-2">
                              {row[col]?.toLocaleString()}
                            </span>
                          )}
                          {col === "CTR" && (
                            <span className="badge bg-warning bg-opacity-10 fw-semibold px-3 py-2">
                              {row[col]}
                            </span>
                          )}
                          {col === "CPM" && (
                            <span className="text-dark fw-semibold">
                              {row[col]}
                            </span>
                          )}
                          {col === "CPC" && (
                            <span className="text-dark fw-semibold">
                              {row[col]}
                            </span>
                          )}
                          {col === "Spent" && (
                            <span className="text-primary fw-bold">
                              {row[col]}
                            </span>
                          )}
                          {col === "ViewableImpressions" && (
                            <span className="text-primary fw-bold">
                              {row[col]}
                            </span>
                          )}
                          {col === "Viewability" && (
                            <span className="text-primary fw-bold">
                              {row[col]}
                            </span>
                          )}
                          {col === "Engagement" && (
                            <span className="text-primary fw-bold">
                              {row[col]}
                            </span>
                          )}
                          {col === "ER" && (
                            <span className="text-primary fw-bold">
                              {row[col]}
                            </span>
                          )}
                          {col === "CPE" && (
                            <span className="text-primary fw-bold">
                              {row[col]}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footer */}
          <div className="card-footer bg-white border-top">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div className="d-flex align-items-center gap-3 bg-light bg-opacity-50 rounded px-3 py-2 shadow-sm">
                <span className="text-dark fw-semibold small d-flex align-items-center">
                  <svg
                    width="14"
                    height="14"
                    fill="currentColor"
                    className="me-1 text-primary"
                    viewBox="0 0 16 16"
                  >
                    <path d="M3 2.5A.5.5 0 0 1 3.5 2h9a.5.5 0 0 1 .5.5v.5H3v-.5zM2 4h12v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4zm3 2v7h1V6H5zm3 0v7h1V6H8zm3 0v7h1V6h-1z" />
                  </svg>
                  Rows per page:
                </span>
                <select
                  value={rowsPerPage}
                  onChange={handleRowsChange}
                  className="form-select form-select-sm border-0 shadow-sm fw-semibold text-dark"
                  style={{
                    width: "80px",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <span className="text-muted small">
                Showing {startIndex + 1}-{Math.min(endIndex, tableData.length)}{" "}
                of {tableData.length} entries
              </span>

              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button className="page-link" onClick={handlePrev}>
                      Previous
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <li
                      key={i}
                      className={`page-item ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </button>
                    </li>
                  ))}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button className="page-link" onClick={handleNext}>
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Modal */}
      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">
            <svg
              width="20"
              height="20"
              fill="currentColor"
              className="me-2 text-primary"
              viewBox="0 0 16 16"
            >
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zm8 0A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm-8 8A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm8 0A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3z" />
            </svg>
            Manage Columns
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Select which columns to display in your table
          </p>

          {/* Search Input */}
          <div className="mb-3">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <svg
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
              </span>
              <Form.Control
                type="text"
                placeholder="Search columns..."
                className="border-start-0 ps-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Select All / Deselect All Buttons */}
          <div className="d-flex gap-2 mb-3">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={selectAll}
              className="flex-fill"
            >
              <svg
                width="14"
                height="14"
                fill="currentColor"
                className="me-1"
                viewBox="0 0 16 16"
              >
                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z" />
              </svg>
              Select All
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={deselectAll}
              className="flex-fill"
            >
              <svg
                width="14"
                height="14"
                fill="currentColor"
                className="me-1"
                viewBox="0 0 16 16"
              >
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z" />
              </svg>
              Deselect All
            </Button>
          </div>

          {/* Column Checkboxes */}
          <div
            className="border rounded p-3 bg-light"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
            {filteredColumns.length > 0 ? (
              filteredColumns.map((col) => (
                <div key={col.name} className="mb-2">
                  <Form.Check
                    type="checkbox"
                    id={`check-${col.name}`}
                    className="user-select-none"
                    label={
                      <span className="d-flex align-items-center gap-2">
                        <span className="fw-medium">{col.name}</span>
                        {visibleColumns.includes(col.name) && (
                          <span
                            className="badge bg-success bg-opacity-10 text-white"
                            style={{ fontSize: "10px" }}
                          >
                            Visible
                          </span>
                        )}
                      </span>
                    }
                    checked={visibleColumns.includes(col.name)}
                    onChange={() => toggleColumn(col.name)}
                  />
                </div>
              ))
            ) : (
              <div className="text-center text-muted py-4">
                <svg
                  width="32"
                  height="32"
                  fill="currentColor"
                  className="mb-2"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                  <path d="M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
                </svg>
                <p className="mb-0">No columns found</p>
              </div>
            )}
          </div>

          {/* Column Count */}
          <div className="mt-3 p-3 bg-primary bg-opacity-10 rounded">
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-dark fw-semibold">Selected Columns</span>
              <span className="badge bg-primary">
                {visibleColumns.length} of {columnsList.length}
              </span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={() => setShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShow(false)}>
            Apply Changes
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        .table > :not(caption) > * > * {
          padding: 1rem;
        }
        
        .table tbody tr {
          transition: all 0.2s ease;
        }
        
        .table tbody tr:hover {
          background-color: rgba(13, 110, 253, 0.03);
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .badge {
          font-weight: 500;
          letter-spacing: 0.3px;
        }
        
        .form-check-input:checked {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        
        .form-check {
          padding: 0.5rem;
          border-radius: 0.375rem;
          transition: background-color 0.2s;
        }
        
        .form-check:hover {
          background-color: white;
        }
        
        .modal-content {
          border: none;
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
        }
        
        .input-group-text {
          background-color: #f8f9fa;
          border-right: 0;
        }
        
        .page-link {
          color: #0d6efd;
        }
        
        .page-item.active .page-link {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
      `}</style>
    </div>
  );
};



export default TableWithDynamicColumns;

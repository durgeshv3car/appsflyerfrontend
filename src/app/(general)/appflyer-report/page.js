"use client";

import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Database, Plus, Trash2, X, Loader2, Search, ArrowLeft, Filter, Calendar, Eye, EyeOff } from "lucide-react";
import {
  createAppsFlyerReport,
  getAllAppsFlyerReports,
  deleteAppsFlyerReport,
  getAppsFlyerReportData,
} from "@/services/appsflyer";

const emptyForm = {
  name: "",
  app_id: "",
  from: "",
  to: "",
  media_source: "",
  campaign_type: "",
  conversion_value: "",
  af_siteid: "",
  af_adset_id: "",
  Appflyer_api_token: "",
  event_name: "",
};

export default function AppsFlyerReportPage() {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Real data state
  const [reportData, setReportData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);
  
  // Dropdown filter state
  const [selectedEventName, setSelectedEventName] = useState("");
  const [eventNamesList, setEventNamesList] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // Debounce search query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch report configurations
  const fetchReports = async (searchVal = "") => {
    setLoading(true);
    try {
      const res = await getAllAppsFlyerReports(searchVal);
      setReports(res.data || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
      toast.error("Failed to load AppsFlyer reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(debouncedSearchQuery);
  }, [debouncedSearchQuery]);

  // Poll for syncing reports
  useEffect(() => {
    const hasActiveSync = reports.some(
      (r) => r.status === "Syncing" || r.status === "Pending" || !r.status
    );

    if (!hasActiveSync) return;

    const interval = setInterval(() => {
      getAllAppsFlyerReports(debouncedSearchQuery)
        .then((res) => {
          setReports(res.data || []);
        })
        .catch((err) => console.error("Polling error:", err));
    }, 5000);

    return () => clearInterval(interval);
  }, [reports, debouncedSearchQuery]);

  // Fetch report detailed metrics
  const fetchReportDetails = async (id, eventFilter = "", dateFilter = "") => {
    setDataLoading(true);
    try {
      const res = await getAppsFlyerReportData(id, eventFilter, dateFilter);
      setReportData(res.data || []);

      // If fetching all data (no filter), extract and cache the unique event names for the dropdown
      if (!eventFilter && !dateFilter) {
        const uniqueEvents = Array.from(
          new Set((res.data || []).map((row) => row.eventName).filter(Boolean))
        ).sort();
        setEventNamesList(uniqueEvents);
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
      toast.error("Failed to load detailed report data");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (selectedReport && selectedReport._id) {
      setSelectedEventName("");
      setSelectedDate("");
      setEventNamesList([]);
      fetchReportDetails(selectedReport._id, "", "");
    } else {
      setReportData([]);
      setEventNamesList([]);
      setSelectedDate("");
    }
  }, [selectedReport]);

  const handleDateFilterChange = (e) => {
    const val = e.target.value;
    setSelectedDate(val);
    fetchReportDetails(selectedReport._id, selectedEventName, val);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = () => {
    setFormData(emptyForm);
    setShowToken(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowToken(false);
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.app_id.trim() ||
      !formData.from ||
      !formData.to ||
      !formData.media_source.trim() ||
      !formData.campaign_type ||
      !formData.Appflyer_api_token.trim()
    ) {
      toast.warning("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      await createAppsFlyerReport({
        ...formData,
        from: formData.from.split("T")[0],
        to: formData.to.split("T")[0],
      });
      toast.success("AppsFlyer report config saved; sync started in background");
      handleCloseModal();
      fetchReports(debouncedSearchQuery);
    } catch (err) {
      console.error("Error saving report config:", err);
      toast.error("Failed to save report config");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this AppsFlyer configuration?")) {
      return;
    }

    try {
      await deleteAppsFlyerReport(id);
      toast.success("AppsFlyer configuration and synced data deleted");
      if (selectedReport && selectedReport._id === id) {
        setSelectedReport(null);
      }
      fetchReports(debouncedSearchQuery);
    } catch (err) {
      console.error("Error deleting configuration:", err);
      toast.error("Failed to delete configuration");
    }
  };

  const displayedReportData = reportData;

  return (
    <>
      <ToastContainer />
      <div className="container-fluid py-4">
        {/* Header Block */}
        <div className="card mb-4 shadow-sm">
          <div className="card-body p-3 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-2">
              <Database className="text-primary" size={24} />
              <h4 className="fw-bold mb-0">AppsFlyer Report</h4>
            </div>
            <button
              className="btn btn-primary btn-sm d-flex align-items-center gap-2 fw-semibold"
              onClick={handleOpenModal}
            >
              <Plus size={16} />
              Add AppsFlyer Data
            </button>
          </div>
        </div>

        {/* Detailed Data Table View */}
        {selectedReport ? (
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-white py-3 border-bottom-0 d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <h5 className="fw-bold text-primary mb-1 d-flex align-items-center gap-2">
                  <Database size={20} />
                  Report Data: {selectedReport.name}
                </h5>
                <p className="small text-muted mb-0">
                  App ID: <span className="font-monospace">{selectedReport.app_id}</span> | Media Source: <span className="badge bg-soft-info text-info">{selectedReport.media_source}</span>
                  {selectedReport.eventName && (
                    <>
                      {" "}
                      | Event Name:{" "}
                      <span className="badge bg-soft-secondary text-secondary border">
                        {selectedReport.eventName}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="d-flex align-items-center gap-3">
                {/* Event Name Filter Dropdown */}
                {eventNamesList.length > 0 && (
                  <div className="d-flex align-items-center gap-2">
                    <span className="small fw-semibold text-secondary text-nowrap">Event:</span>
                    <select
                      className="form-select form-select-sm border-2 rounded-3 shadow-sm bg-white"
                      style={{ minWidth: "160px", maxWidth: "220px", cursor: "pointer" }}
                      value={selectedEventName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedEventName(val);
                        fetchReportDetails(selectedReport._id, val, selectedDate);
                      }}
                    >
                      <option value="">All Events</option>
                      {eventNamesList.map((evt) => (
                        <option key={evt} value={evt}>
                          {evt}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {/* Date Filter Input */}
                <div className="d-flex align-items-center gap-2">
                  <span className="small fw-semibold text-secondary text-nowrap">Date:</span>
                  <div className="d-flex align-items-center gap-1">
                    <input
                      type="date"
                      className="form-control form-control-sm border-2 rounded-3 shadow-sm bg-white"
                      style={{ cursor: "pointer" }}
                      value={selectedDate}
                      onChange={handleDateFilterChange}
                    />
                    {selectedDate && (
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm px-2 rounded-3 d-flex align-items-center justify-content-center"
                        onClick={() => {
                          setSelectedDate("");
                          fetchReportDetails(selectedReport._id, selectedEventName, "");
                        }}
                        title="Clear Date Filter"
                        style={{ height: "31px" }}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
                <button
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 fw-semibold"
                  onClick={() => setSelectedReport(null)}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover table-striped align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 small fw-bold text-secondary">Date</th>
                      <th className="px-4 py-3 small fw-bold text-secondary">Media Source</th>
                      <th className="px-4 py-3 small fw-bold text-secondary">Event Name</th>
                      <th className="px-4 py-3 small fw-bold text-secondary">Count</th>
                      <th className="px-4 py-3 small fw-bold text-secondary">Install</th>
                      <th className="px-4 py-3 small fw-bold text-secondary">Conversion Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataLoading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <div className="d-flex justify-content-center align-items-center gap-2 text-muted">
                            <Loader2 className="spinner-border spinner-border-sm border-0" style={{ animation: "spin 1s linear infinite" }} />
                            <span>Loading report details...</span>
                          </div>
                        </td>
                      </tr>
                    ) : displayedReportData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-5 text-muted">
                          {selectedEventName 
                            ? `No records found for event "${selectedEventName}".`
                            : "No synced database records found."}
                        </td>
                      </tr>
                    ) : (
                      displayedReportData.map((row) => (
                        <tr key={row._id}>
                          <td className="px-4 py-3 text-muted">
                            {row.date ? row.date.split("T")[0] : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="badge bg-soft-info text-info border">
                              {row.mediaSource || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 fw-semibold">
                            <span className="badge bg-soft-info text-info border">
                              {row.eventName || "Default"}
                            </span>
                          </td>
                          <td className="px-4 py-3 fw-bold text-dark">
                            {row.eventCount ? row.eventCount.toLocaleString() : "0"}
                          </td>
                          <td className="px-4 py-3 fw-bold text-primary">
                            {row.install ? row.install.toLocaleString() : "0"}
                          </td>
                          <td className="px-4 py-3 fw-bold text-success">
                            {row.conversion ? row.conversion.toLocaleString() : "0"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Report Configurations List */
          <div className="card shadow-sm">
            <div className="card-header bg-white py-3 border-bottom-0 d-flex flex-wrap align-items-center justify-content-between gap-3">
              <h6 className="fw-bold text-primary mb-0">Report Configurations</h6>
              {/* Search Field */}
              <div className="position-relative" style={{ maxWidth: "300px", width: "100%" }}>
                <input
                  type="text"
                  className="form-control form-control-sm ps-5 border-2"
                  placeholder="Search by report name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search
                  className="position-absolute text-muted"
                  size={16}
                  style={{ left: "15px", top: "50%", transform: "translateY(-50%)" }}
                />
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover table-striped align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="px-4 py-3 small fw-bold text-secondary">Name</th>
                      <th className="px-4 py-3 small fw-bold text-secondary">App ID</th>
                      <th className="px-4 py-3 small fw-bold text-secondary">Date Range</th>
                      <th className="px-4 py-3 small fw-bold text-secondary">Media Source</th>
                      <th className="px-4 py-3 small fw-bold text-secondary">Campaign Type</th>
                      <th className="px-4 py-3 small fw-bold text-secondary">Status</th>
                      <th className="px-4 py-3 small fw-bold text-secondary text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <div className="d-flex justify-content-center align-items-center gap-2 text-muted">
                            <Loader2 className="spinner-border spinner-border-sm border-0" style={{ animation: "spin 1s linear infinite" }} />
                            <span>Loading configurations...</span>
                          </div>
                        </td>
                      </tr>
                    ) : reports.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-5 text-muted italic">
                          No configurations matching search criteria found.
                        </td>
                      </tr>
                    ) : (
                      reports.map((item) => (
                        <tr 
                          key={item._id} 
                          style={{ cursor: "pointer" }}
                          onClick={() => setSelectedReport(item)}
                          title="Click to view report data"
                        >
                          <td className="px-4 py-3 fw-semibold text-primary">{item.name}</td>
                          <td className="px-4 py-3 font-monospace small text-muted">{item.app_id}</td>
                          <td className="px-4 py-3">
                            {item.from ? item.from.split("T")[0] : "-"} to {item.to ? item.to.split("T")[0] : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="badge bg-soft-info text-info border">
                              {item.media_source}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`badge ${item.campaignType === "android" ? "bg-success" : "bg-primary"} text-white`}>
                              {item.campaignType}
                            </span>
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <div className="d-flex flex-column align-items-start">
                              <span className={`badge ${
                                item.status === "Completed" ? "bg-success" :
                                item.status === "Syncing" ? "bg-warning text-dark" :
                                item.status === "Limit Exceeded" ? "bg-danger" :
                                item.status === "Failed" ? "bg-secondary" : "bg-info"
                              } text-white`}>
                                {item.status || "Pending"}
                              </span>
                              {item.statusMessage && (
                                <div className="small text-muted text-truncate mt-1" style={{ maxWidth: "150px" }} title={item.statusMessage}>
                                  {item.statusMessage}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-end">
                            <button
                              className="btn btn-link btn-sm text-danger p-1"
                              onClick={(e) => {
                                e.stopPropagation(); // Avoid triggering row selection click
                                handleDelete(item._id);
                              }}
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop Modal */}
      {showModal && (
        <div
          className="modal-backdrop d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered shadow-lg">
              <div className="modal-content border-0">
                <div className="modal-header bg-primary text-white py-3">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    <Database size={20} />
                    Add AppsFlyer Report
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body p-4 bg-light">
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Report Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="e.g. Android Install Data"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">App ID</label>
                      <input
                        type="text"
                        name="app_id"
                        value={formData.app_id}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="com.example.app"
                        required
                      />
                    </div>
                    <div className="row mb-3">
                      <div className="col">
                        <label className="form-label small fw-semibold">From Date</label>
                        <input
                          type="date"
                          name="from"
                          value={formData.from}
                          onChange={handleInputChange}
                          className="form-control"
                          style={{ cursor: "pointer" }}
                          required
                        />
                      </div>
                      <div className="col">
                        <label className="form-label small fw-semibold">To Date</label>
                        <input
                          type="date"
                          name="to"
                          value={formData.to}
                          onChange={handleInputChange}
                          className="form-control"
                          style={{ cursor: "pointer" }}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Campaign Type</label>
                      <select
                        name="campaign_type"
                        value={formData.campaign_type}
                        onChange={handleInputChange}
                        className="form-select"
                        style={{ cursor: "pointer" }}
                        required
                      >
                        <option value="">Select Campaign Type</option>
                        <option value="android">Android</option>
                        <option value="ios">iOS</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Media Source</label>
                      <input
                        type="text"
                        name="media_source"
                        value={formData.media_source}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="dv360_int"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Conversion Value (Optional)</label>
                      <input
                        type="text"
                        name="conversion_value"
                        value={formData.conversion_value}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="e.g. sales, revenue, inr"
                      />
                    </div>
                    <div className="row mb-3">
                      <div className="col">
                        <label className="form-label small fw-semibold">af_siteid (Site ID) (Optional)</label>
                        <input
                          type="text"
                          name="af_siteid"
                          value={formData.af_siteid}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="e.g. 6a4b64941f8bf4a42c3402"
                        />
                      </div>
                      <div className="col">
                        <label className="form-label small fw-semibold">af_adset_id (Adset ID) (Optional)</label>
                        <input
                          type="text"
                          name="af_adset_id"
                          value={formData.af_adset_id}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="e.g. cVJiAW9kRGV..."
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Event Name (Optional)</label>
                      <input
                        type="text"
                        name="event_name"
                        value={formData.event_name}
                        onChange={handleInputChange}
                        className="form-control"
                        placeholder="e.g. af_purchase,first_purchase"
                      />
                    </div>
                     <div className="mb-3">
                      <label className="form-label small fw-semibold">AppsFlyer API Token</label>
                      <div className="input-group">
                        <input
                          type={showToken ? "text" : "password"}
                          name="Appflyer_api_token"
                          value={formData.Appflyer_api_token}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="Bearer token..."
                          required
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary d-flex align-items-center justify-content-center"
                          onClick={() => setShowToken(!showToken)}
                          style={{ borderLeft: "none" }}
                        >
                          {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-white border-top-0">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm fw-bold"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="spinner-border spinner-border-sm me-2 border-0" style={{ animation: "spin 1s linear infinite" }} />
                          Saving...
                        </>
                      ) : (
                        "Save Entry"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
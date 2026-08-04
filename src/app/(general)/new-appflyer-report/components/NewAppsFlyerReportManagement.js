"use client";

import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Database,
  Plus,
  Trash2,
  X,
  Loader2,
  Search,
  ArrowLeft,
  Calendar,
  Eye,
  EyeOff,
  Mail,
  Key,
  CheckCircle,
} from "lucide-react";
import {
  createNewAppsFlyerReport,
  getAllNewAppsFlyerReports,
  toggleNewAppsFlyerReportActive,
  deleteNewAppsFlyerReport,
  getNewAppsFlyerReportData,
  getNewAppsFlyerReportDataById,
} from "@/services/appsflyer";
import { getAllToken } from "@/services/token";

const emptyForm = {
  name: "",
  app_id: "",
  from: "",
  to: "",
  media_source: "",
  campaign_type: "",
  conversion_value: "",
  timezone: "Asia/Kolkata",
  af_siteid: "", // Optional Site ID
  // Note: af_adset_id (Adset ID) is explicitly excluded as per specification
  Appflyer_api_token: "",
  event_name: "",
};

export default function NewAppsFlyerReportManagement() {
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  // Tokens fetched from DB for Gmail selection dropdown
  const [availableTokens, setAvailableTokens] = useState([]);
  const [selectedGmailId, setSelectedGmailId] = useState("");
  const [loadingTokens, setLoadingTokens] = useState(false);

  // Real data state
  const [reportData, setReportData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Debounce search query input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch tokens from DB for Gmail select dropdown
  const fetchAvailableTokens = async () => {
    setLoadingTokens(true);
    try {
      const res = await getAllToken();
      const list = Array.isArray(res) ? res : res.data || res.tokens || [];
      setAvailableTokens(list);
    } catch (err) {
      console.error("Error loading tokens for Gmail select:", err);
    } finally {
      setLoadingTokens(false);
    }
  };

  // Fetch report configurations
  const fetchReports = async (searchVal = "") => {
    setLoading(true);
    try {
      const res = await getAllNewAppsFlyerReports(searchVal);
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
      getAllNewAppsFlyerReports(debouncedSearchQuery)
        .then((res) => {
          setReports(res.data || []);
        })
        .catch((err) => console.error("Polling error:", err));
    }, 5000);

    return () => clearInterval(interval);
  }, [reports, debouncedSearchQuery]);

  // Fetch report detailed metrics by report ID
  const fetchReportDetails = async (reportId) => {
    if (!reportId) return;
    setDataLoading(true);
    try {
      const res = await getNewAppsFlyerReportDataById(reportId);
      setReportData(res.data || []);
    } catch (err) {
      console.error("Error fetching report data:", err);
      toast.error("Failed to load detailed report data");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (selectedReport && selectedReport._id) {
      fetchReportDetails(selectedReport._id);
    } else {
      setReportData([]);
    }
  }, [selectedReport]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGmailSelectChange = (e) => {
    const idVal = e.target.value;
    setSelectedGmailId(idVal);

    if (!idVal) return;

    const chosen = availableTokens.find(
      (t) => (t._id || t.id) === idVal
    );

    if (chosen) {
      const tokenVal = chosen.token || chosen.campaign_name || chosen.reportName || "";
      const gmailVal = chosen.email || chosen.gmail || "";
      setFormData((prev) => ({
        ...prev,
        Appflyer_api_token: tokenVal,
        gmail: gmailVal,
      }));
      toast.info(`Token selected for ${gmailVal || "selected Gmail"}`);
    }
  };

  const handleOpenModal = () => {
    setFormData(emptyForm);
    setSelectedGmailId("");
    setShowToken(false);
    fetchAvailableTokens();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowToken(false);
    setSelectedGmailId("");
    setFormData(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.Appflyer_api_token.trim()) {
      toast.warning("Please select a Gmail address to attach token");
      return;
    }
    if (
      !formData.name.trim() ||
      !formData.app_id.trim() ||
      !formData.from ||
      !formData.to ||
      !formData.media_source.trim() ||
      !formData.campaign_type
    ) {
      toast.warning("Please fill all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await createNewAppsFlyerReport({
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
      await deleteNewAppsFlyerReport(id);
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
        <div className="card mb-4 shadow-sm rounded-4 border-0">
          <div className="card-body p-4 d-flex align-items-center justify-content-between bg-white rounded-4">
            <div className="d-flex align-items-center gap-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 p-3 text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #031035 0%, #1a2b5a 100%)" }}
              >
                <Database size={24} />
              </div>
              <div>
                <h4 className="fw-bold mb-1 text-dark">New AppsFlyer Data</h4>
                <p className="text-muted mb-0 small">
                  Configure AppsFlyer report data with Gmail token selection
                </p>
              </div>
            </div>
            <button
              className="btn text-white btn-sm px-3 py-2 rounded-3 d-flex align-items-center gap-2 fw-semibold"
              style={{ background: "#031035" }}
              onClick={handleOpenModal}
            >
              <Plus size={16} />
              Add AppsFlyer Data
            </button>
          </div>
        </div>

        {/* Detailed Data Table View */}
        {selectedReport ? (
          <div className="card shadow-sm rounded-4 border-0 mb-4 bg-white">
            <div className="card-header bg-white py-3 border-bottom-0 d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <h5 className="fw-bold text-primary mb-1 d-flex align-items-center gap-2">
                  <Database size={20} />
                  Report Data: {selectedReport.name}
                </h5>
                <p className="small text-muted mb-1">
                  <span className="fw-semibold text-dark">ID:</span>{" "}
                  <span className="font-monospace text-secondary" style={{ fontSize: "0.78rem" }}>{selectedReport._id}</span>
                </p>
                <p className="small text-muted mb-0">
                  App ID: <span className="font-monospace">{selectedReport.app_id}</span> | Media Source: <span className="badge bg-soft-info text-info">{selectedReport.media_source}</span> | Timezone: <span className="badge bg-soft-primary text-primary border">{selectedReport.timezone || "Asia/Kolkata"}</span>
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
                <button
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 fw-semibold rounded-3"
                  onClick={() => setSelectedReport(null)}
                >
                  <ArrowLeft size={16} />
                  Back
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light border-bottom">
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
                          No synced database records found.
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
                              {row.mediaSource || row.media_source || selectedReport?.media_source || "-"}
                            </span>
                          </td>
                          <td className="px-4 py-3 fw-semibold">
                            <span className="badge bg-soft-info text-info border">
                              {row.eventName || row.event_name || selectedReport?.eventName || selectedReport?.event_name || "Default"}
                            </span>
                          </td>
                          <td className="px-4 py-3 fw-bold text-dark">
                            {(row.eventCount ?? row.eventcount ?? 0).toLocaleString()}
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
          <div className="card shadow-sm rounded-4 border-0 overflow-hidden bg-white">
            <div className="card-header bg-white py-3 px-4 border-0 d-flex flex-wrap align-items-center justify-content-between gap-3">
              <h6 className="fw-bold text-dark mb-0">Stored AppsFlyer Configurations</h6>
              {/* Search Field */}
              <div className="position-relative" style={{ maxWidth: "300px", width: "100%" }}>
                <input
                  type="text"
                  className="form-control form-control-sm ps-5 rounded-3 bg-light"
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
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light border-bottom">
                    <tr>
                      <th className="px-4 py-3 small fw-bold text-secondary">Name</th>
                      <th className="px-4 py-3 small fw-bold text-secondary">App ID</th>
                      <th className="px-4 py-3 small fw-bold text-secondary">Date Range</th>
                      <th className="px-4 py-3 small fw-bold text-secondary">Media Source</th>
                      <th className="px-4 py-3 small fw-bold text-secondary">Campaign Type</th>
                      <th className="px-4 py-3 small fw-bold text-secondary text-center">Active</th>
                      <th className="px-4 py-3 small fw-bold text-secondary">Status</th>
                      <th className="px-4 py-3 small fw-bold text-secondary text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="8" className="text-center py-5">
                          <div className="d-flex justify-content-center align-items-center gap-2 text-muted">
                            <Loader2 className="spinner-border spinner-border-sm border-0" style={{ animation: "spin 1s linear infinite" }} />
                            <span>Loading configurations...</span>
                          </div>
                        </td>
                      </tr>
                    ) : reports.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-5 text-muted italic">
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
                            <span className={`badge ${item.campaignType === "android" || item.campaign_type === "android" ? "bg-success" : "bg-primary"} text-white`}>
                              {item.campaignType || item.campaign_type || "android"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="d-inline-flex align-items-center gap-2">
                              <div className="form-check form-switch m-0 p-0 d-flex align-items-center">
                                <input
                                  className="form-check-input ms-0"
                                  type="checkbox"
                                  role="switch"
                                  id={`switch-${item._id}`}
                                  checked={item.active !== false}
                                  onChange={async () => {
                                    const newActive = item.active === false;
                                    setReports((prev) =>
                                      prev.map((r) => (r._id === item._id ? { ...r, active: newActive } : r))
                                    );
                                    try {
                                      await toggleNewAppsFlyerReportActive(item._id, newActive);
                                      toast.info(`Report status updated to ${newActive ? "Active" : "Inactive"}`);
                                    } catch (e) {
                                      console.error("Error updating active status:", e);
                                      toast.error("Failed to update status on server");
                                    }
                                  }}
                                  style={{ width: "2.4em", height: "1.25em", cursor: "pointer" }}
                                  title="Toggle Active / Inactive status"
                                />
                              </div>
                              <span
                                className={`badge ${
                                  item.active !== false ? "bg-success" : "bg-secondary opacity-75"
                                } text-white fw-bold px-2 py-1 rounded-2`}
                                style={{ fontSize: "0.72rem" }}
                              >
                                {item.active !== false ? "Active" : "Inactive"}
                              </span>
                            </div>
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
                                e.stopPropagation();
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

      {/* Modal for Add AppsFlyer Data */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div
                className="modal-header border-0 text-white px-4 py-3"
                style={{
                  background: "linear-gradient(135deg, #031035 0%, #1a2b5a 100%)",
                }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3 p-2"
                    style={{ background: "rgba(255, 255, 255, 0.15)" }}
                  >
                    <Database className="text-white" size={20} />
                  </div>
                  <h5 className="modal-title fw-bold text-white mb-0">
                    Add AppsFlyer Data
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white opacity-100"
                  onClick={handleCloseModal}
                  disabled={submitting}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4 bg-light">
                  {/* Gmail Token Select Dropdown */}
                  <div className="mb-4 p-3 bg-white rounded-3 border shadow-sm">
                    <label className="form-label fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                      <Mail size={18} className="text-primary" />
                      Select Gmail <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select border-2"
                      value={selectedGmailId}
                      onChange={handleGmailSelectChange}
                      disabled={loadingTokens}
                      style={{ cursor: "pointer" }}
                      required
                    >
                      <option value="">-- Select Gmail address --</option>
                      {availableTokens.map((t) => {
                        const id = t._id || t.id;
                        const gmailStr = t.email || t.gmail || "No Gmail";
                        const tokenStr = t.token || t.campaign_name || "";
                        const tokenPreview = tokenStr
                          ? `${tokenStr.slice(0, 15)}...`
                          : "No Token";

                        return (
                          <option key={id} value={id}>
                            {gmailStr} ({tokenPreview})
                          </option>
                        );
                      })}
                    </select>
                    <small className="text-muted mt-1 d-block" style={{ fontSize: "12px" }}>
                      Selecting a Gmail will automatically attach its API token to this report.
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Report Name <span className="text-danger">*</span>
                    </label>
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
                    <label className="form-label small fw-semibold">
                      App ID <span className="text-danger">*</span>
                    </label>
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
                      <label className="form-label small fw-semibold">
                        From Date <span className="text-danger">*</span>
                      </label>
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
                      <label className="form-label small fw-semibold">
                        To Date <span className="text-danger">*</span>
                      </label>
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
                    <label className="form-label small fw-semibold">
                      Campaign Type <span className="text-danger">*</span>
                    </label>
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
                    <label className="form-label small fw-semibold">
                      Media Source <span className="text-danger">*</span>
                    </label>
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
                    <label className="form-label small fw-semibold">
                      Conversion Value (Optional)
                    </label>
                    <input
                      type="text"
                      name="conversion_value"
                      value={formData.conversion_value}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="e.g. sales, revenue, inr"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Timezone</label>
                    <select
                      name="timezone"
                      value={formData.timezone || "Asia/Kolkata"}
                      onChange={handleInputChange}
                      className="form-select"
                      style={{ cursor: "pointer" }}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>

                  {/* Optional Site ID (af_siteid) - Excludes af_adset_id per specification */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      af_siteid (Site ID) (Optional)
                    </label>
                    <input
                      type="text"
                      name="af_siteid"
                      value={formData.af_siteid}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="e.g. 6a4b64941f8bf4a42c3402"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">
                      Event Name (Optional)
                    </label>
                    <input
                      type="text"
                      name="event_name"
                      value={formData.event_name}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="e.g. af_purchase,first_purchase"
                    />
                  </div>
                </div>

                <div className="modal-footer bg-white border-top-0 px-4 pb-4 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm px-4 rounded-3"
                    onClick={handleCloseModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn text-white btn-sm px-4 rounded-3 d-flex align-items-center gap-2 fw-bold"
                    style={{ background: "#031035" }}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="spinner-border spinner-border-sm" size={16} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>Save Entry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

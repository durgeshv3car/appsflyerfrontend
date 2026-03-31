"use client";
import { createReportsDataCity } from "@/services/city";
// import { createReportsDataContext } from "@/services/context";
import { Shield } from "lucide-react";
import {
  addAudienceToUser,
  createAudience,
  deleteAudience,
  getAudience,
  updateAudience,
} from "@/services/createaudience";
import { createReportsDataAge } from "@/services/demographics";
import { createReportsDataDevice } from "@/services/device";
import { createReportsData } from "@/services/reports";
import { createReportsDataBrowser } from "@/services/browser";
import { createReportsDataOs } from "@/services/os";
import { createReportsDataOperator } from "@/services/operator";
import { createReportsDataAdPos } from "@/services/ad-pos";
import { createReportsDataAdType } from "@/services/ad-type";
import { createReportsDataCreative } from "@/services/creative";
import { createReportsDataCreativeSize } from "@/services/creative-size";
import { getSearchJobStatus } from "@/services/youtube";
import PermissionModal from "./PermissionModal";
import Image from "next/image";
import { Search, Loader2, CheckCircle2, Layout, Database, BarChart3, PieChart, MapPin } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import React, { useState, useEffect } from "react";

const emptyCampaign = {
  reportName: "",
  advertiserId: "",
  campaignId: "",
  insertionOrderId: "",
  cpm: {},
  cpc: {},
  currency: "",
  source: "DV360", // Default source
  active: true, // New field
};

const CampaignLoader = ({ progress, status }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100" style={{ background: "#f8f9fa" }}>
      <div style={{ width: "100%", maxWidth: "450px", padding: "40px", textAlign: "center" }}>
        {/* Animated Icon */}
        <div style={{ marginBottom: "30px", position: "relative" }}>
           <div className="ai-loader-pulse" style={{
             width: "80px",
             height: "80px",
             borderRadius: "20px",
             background: "linear-gradient(135deg, #031035 0%, #081947 100%)",
             display: "flex",
             alignItems: "center",
             justifyContent: "center",
             margin: "0 auto",
             boxShadow: "0 10px 25px rgba(3, 16, 53, 0.2)"
           }}>
             <Database color="white" size={32} />
           </div>
        </div>

        <h4 style={{ fontWeight: "700", color: "#031035", marginBottom: "10px" }}>
          Creating Campaign Reports
        </h4>
        <p style={{ color: "#64748b", fontSize: "0.95rem", marginBottom: "25px", height: "1.5rem" }}>
          {status}
        </p>

        {/* Progress Bar Container */}
        <div style={{
          width: "100%",
          height: "10px",
          backgroundColor: "#e9ecef",
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: "15px",
          position: "relative"
        }}>
          {/* Progress Bar Fill */}
          <div style={{
            width: `${progress}%`,
            height: "100%",
            background: "linear-gradient(90deg, #031035, #081947)",
            borderRadius: "10px",
            transition: "width 0.5s ease-in-out",
            position: "relative"
          }}>
            {/* Shimmer effect */}
            <div className="ai-loader-shimmer" style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)"
            }} />
          </div>
        </div>

        <div className="d-flex justify-content-between" style={{ fontSize: "0.85rem", fontWeight: "600", color: "#6c757d" }}>
          <span>{Math.round(progress)}% Complete</span>
          <span>Please wait...</span>
        </div>
      </div>
    </div>
  );
};


const Campaign = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [audienceId, setAudienceId] = useState(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [selectedPermissionCampaign, setSelectedPermissionCampaign] = useState(null);
  const [newCpmDate, setNewCpmDate] = useState("");
  const [newCpmValue, setNewCpmValue] = useState("");
  const [newCpcDate, setNewCpcDate] = useState("");
  const [newCpcValue, setNewCpcValue] = useState("");
  const today = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(today.getFullYear() - 2);
  const formatDate = (date) => date.toISOString().split('T')[0];
  const startDateStr = formatDate(twoYearsAgo);

  useEffect(() => {
    const fetchAudiences = async () => {
      setLoading(true);
      setProgress(10);
      setLoadingStatus("Fetching campaigns...");
      try {
        const res = await getAudience(search);
        setCampaigns(res.data);
        setProgress(100);
      } catch (error) {
        console.log("Error fetching audience:", error);
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchAudiences();
  }, [search]);

  const openAddModal = () => {
    setCampaignData({
      ...emptyCampaign,
      cpm: { [startDateStr]: 0 },
      cpc: { [startDateStr]: 0 }
    });
    setNewCpmDate(startDateStr);
    setNewCpcDate(startDateStr);
    setEditingIndex(null);
    setModalOpen(true);
  };

  const openEditModal = (index) => {
    const campaign = campaigns[index];
    setCampaignData({
      ...campaign,
      cpm: typeof campaign.cpm === 'object' ? campaign.cpm : {},
      cpc: typeof campaign.cpc === 'object' ? campaign.cpc : {}
    });
    setEditingIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCampaignData(emptyCampaign);
    setEditingIndex(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaignData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCpmEntry = () => {
    if (!newCpmValue) return;
    const dateToUse = newCpmDate || startDateStr; // Use Base Date if not defined
    setCampaignData(prev => ({
      ...prev,
      cpm: { ...prev.cpm, [dateToUse]: Number(newCpmValue) }
    }));
    setNewCpmValue("");
  };

  const handleRemoveCpmEntry = (date) => {
    setCampaignData(prev => {
      const newCpm = { ...prev.cpm };
      delete newCpm[date];
      return { ...prev, cpm: newCpm };
    });
  };

  const handleAddCpcEntry = () => {
    if (!newCpcValue) return;
    const dateToUse = newCpcDate || startDateStr; // Use Base Date if not defined
    setCampaignData(prev => ({
      ...prev,
      cpc: { ...prev.cpc, [newCpcDate]: Number(newCpcValue) }
    }));
    setNewCpcValue("");
  };

  const handleRemoveCpcEntry = (date) => {
    setCampaignData(prev => {
      const newCpc = { ...prev.cpc };
      delete newCpc[date];
      return { ...prev, cpc: newCpc };
    });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const pollJob = async (jobId, type) => {
    const POLLING_INTERVAL = 3000;
    const MAX_ATTEMPTS = 200; // Total ~10 minutes

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      try {
        const statusData = await getSearchJobStatus(jobId);
        const status = statusData.status || statusData.job?.status;

        if (status === "completed") {
          return statusData;
        }

        if (status === "failed") {
          throw new Error(
            `${type} job failed: ${statusData.error?.message || "Internal processing error"}`
          );
        }
      } catch (err) {
        console.warn(`Polling error for ${type}:`, err);
        // Only throw if it's a structural failure, otherwise continue polling
        if (err.message.includes("job failed")) throw err;
      }

      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
    }
    throw new Error(`${type} job timed out after 10 minutes`);
  };


  const handleSave = async (e) => {
    e.preventDefault();
    const isValid =
      campaignData?.reportName?.trim() &&
      campaignData?.advertiserId?.trim() &&
      Object.keys(campaignData?.cpm || {}).length > 0;

    if (!isValid) {
      toast.warning("Please fill all required fields and add at least one CPM entry");
      return;
    }
    setLoading(true);
    setProgress(5);
    setLoadingStatus("Initializing campaign...");
    try {
      let res;
      const today = new Date();
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(today.getFullYear() - 2);
      const formatDate = (date) => date.toISOString().split('T')[0];

      if (editingIndex !== null) {
        const id = campaignData._id || campaigns[editingIndex]?._id;
        setLoadingStatus("Updating campaign details...");
        res = await updateAudience(id, campaignData);
        setProgress(20);
      } else {
        setLoadingStatus("Creating active audience...");
        res = await createAudience(campaignData);
        setProgress(20);
      }

      if (res.audience?._id && campaignData.source === "DV360" && editingIndex === null) {
        const params = {
          audienceId: res.audience._id,
          dataRange: "ALL_TIME",
        };

        const reportTasks = [
          { name: "Overview", fn: createReportsData, params: params },
          { name: "Device", fn: createReportsDataDevice, params: params },
          { name: "Demographics", fn: createReportsDataAge, params: { ...params, dataRange: "LAST_365_DAYS" } },
          { name: "City", fn: createReportsDataCity, params: params },
          { name: "Browser", fn: createReportsDataBrowser, params: params },
          { name: "OS", fn: createReportsDataOs, params: params },
          { name: "Operator", fn: createReportsDataOperator, params: params },
          { name: "AdPos", fn: createReportsDataAdPos, params: params },
          { name: "AdType", fn: createReportsDataAdType, params: params },
          { name: "Creative", fn: createReportsDataCreative, params: params },
          { name: "CreativeSize", fn: createReportsDataCreativeSize, params: params },
        ];

        let completedCount = 0;
        const totalTasks = reportTasks.length;

        setLoadingStatus(`Initializing ${totalTasks} report streams...`);

        // Run all tasks in parallel
        await Promise.all(
          reportTasks.map(async (task) => {
            try {
              const taskParams = task.params || params;
              const taskRes = await task.fn(taskParams);
              if (taskRes.jobId) {
                await pollJob(taskRes.jobId, task.name);
              }
              completedCount++;
              // Scale progress from 20% to 95%
              const currentProgress = 20 + Math.floor((completedCount / totalTasks) * 75);
              setProgress(currentProgress);
              setLoadingStatus(`Verified ${task.name} data (${completedCount}/${totalTasks})`);
            } catch (err) {
              console.error(`Task ${task.name} failed:`, err);
              completedCount++; // Still count towards progress to avoid UI hang
            }
          })
        );
        
        setProgress(95);
      } else if (res.audience?._id) {
        setLoadingStatus("Campaign saved for live connection...");
        setProgress(90);
      }


      setLoadingStatus("Refreshing campaign list...");
      const all = await getAudience();
      setCampaigns(all?.data || []);
      setProgress(100);
      setTimeout(() => closeModal(), 500);
    } catch (err) {
      console.error("Error saving campaign:", err);
      closeModal();
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAudience(id);
      const all = await getAudience();
      setCampaigns(all?.data || []);
      toast.success("Campaign deleted successfully");
    } catch (err) {
      console.error("Error deleting audience:", err);
      toast.error("Failed to delete campaign");
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      setLoading(true);
      await updateAudience(id, { active: !currentStatus });
      const all = await getAudience();
      setCampaigns(all?.data || []);
      toast.success(`Campaign ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleShowPermissions = (campaign) => {
    setSelectedPermissionCampaign(campaign);
    setShowPermissionModal(true);
  };

  const handlePermissionSave = async (id, updatedData) => {
    const stringId = id?.$oid || id;
    
    // Combine existing campaign fields with the update to prevent backend from clearing them
    const { reportName, insertionOrderId, advertiserId, campaignId, cpm, cpc, currency } = selectedPermissionCampaign;
    const payload = {
      reportName,
      insertionOrderId,
      advertiserId,
      campaignId,
      cpm,
      cpc,
      currency,
      ...updatedData
    };

    try {
      setLoading(true);
      const res = await updateAudience(stringId, payload);
      if (res) {
        setCampaigns((prev) =>
          prev.map((c) => {
            const cId = c._id?.$oid || c._id;
            const targetId = stringId;
            return cId === targetId ? { ...c, ...updatedData } : c;
          })
        );
        setShowPermissionModal(false);
        toast.success("Permissions updated successfully");
      }
    } catch (error) {
      console.error("Failed to update permissions", error);
      toast.error("Failed to update permissions");
    } finally {
      setLoading(false);
    }
  };

  const openEmailModal = (id) => {
    setShowEmailModal(true);
    setError("");
    setAudienceId(id);
  };

  const handleAddUser = async () => {
    if (!email) return;

    try {
      setLoading(true);
      setError("");
      const res = await addAudienceToUser(email, audienceId);
      if (res.message) {
        closeModal();
        setShowEmailModal(false);
        setEmail("");
      }
    } catch (err) {
      setError("Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CampaignLoader progress={progress} status={loadingStatus} />;
  }

  return (
    <div className="card">
      <ToastContainer />
      <div className="card-body p-3 d-flex align-items-center justify-content-between">
        <h5 className="fw-bold mb-0">Campaigns</h5>
        <div className="d-flex gap-2 align-items-center">
          <button
            className="btn btn-sm btn-primary"
            onClick={openAddModal}
            title="Add Campaign"
          >
            <i className="feather-plus me-1"></i> Add
          </button>
        </div>
      </div>

      <div className="card-body p-3">
        <div className="table-responsive">
          <table className="table table-hover table-striped table-sm">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Source</th>
                <th>Advertiser ID</th>
                <th>Campaign ID</th>
                <th>Insertion Order ID</th>
                <th>CPM</th>
                <th>CPC</th>
                <th>Currency</th>
                <th>Cron Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    <div
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></div>
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && campaigns.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-muted">
                    No campaigns yet. Click "Add" to create one.
                  </td>
                </tr>
              )}

              {!loading &&
                campaigns.map((c, idx) => (
                  <tr key={c._id || idx}>
                    <td className="align-middle">{c.reportName}</td>
                    <td className="align-middle">
                      <span className={`badge ${c.source === 'Eskimi' ? 'bg-info' : 'bg-primary'}`}>
                        {c.source || 'DV360'}
                      </span>
                    </td>
                    <td className="align-middle">{c.advertiserId}</td>
                    <td className="align-middle">{c.campaignId || '-'}</td>
                    <td className="align-middle">{c.insertionOrderId || '-'}</td>
                    <td className="align-middle">
                      {typeof c.cpm === 'object' ? (
                        <span className="badge bg-light text-dark border">
                          {Object.keys(c.cpm).length} dates
                        </span>
                      ) : (c.cpm || '-')}
                    </td>
                    <td className="align-middle">
                      {typeof c.cpc === 'object' ? (
                        <span className="badge bg-light text-dark border">
                          {Object.keys(c.cpc).length} dates
                        </span>
                      ) : (c.cpc || '-')}
                    </td>
                    <td className="align-middle">{c.currency || '-'}</td>
                    <td className="align-middle">
                       <div className="form-check form-switch">
                         <input
                           className="form-check-input"
                           type="checkbox"
                           role="switch"
                           checked={c.active !== false}
                           onChange={() => handleToggleActive(c._id, c.active !== false)}
                           style={{ cursor: 'pointer' }}
                         />
                         <span className={`badge ${c.active !== false ? 'bg-success' : 'bg-secondary'} ms-2`} style={{ fontSize: '0.7rem' }}>
                           {c.active !== false ? 'Active' : 'Inactive'}
                         </span>
                       </div>
                     </td>
                    <td className="text-end align-middle">
                      {/* action buttons as a single row with gap and inline SVG icons */}
                        
                      <div
                        className="d-flex align-items-center justify-content-end"
                        style={{ gap: 8 }}
                      >
                                <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => handleShowPermissions(c)}
                    >
                      <Shield size={16} /> Permissions
                    </button>
                     <button
  className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
  onClick={() => openEditModal(idx)}
  title="Edit"
  aria-label="Edit"
  style={{ width: 36, height: 36, padding: 0 }}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
</button>
                        <button
                          className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                          onClick={() => {
                            openEmailModal(c._id);
                          }}
                          title="Add User"
                          aria-label="Add User"
                          style={{ width: 36, height: 36, padding: 0 }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 20a8 8 0 0116 0"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 8v6m3-3h-6"
                            />
                          </svg>
                        </button>

                      

                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                          onClick={() => handleDelete(c._id)}
                          title="Delete"
                          aria-label="Delete"
                          style={{ width: 36, height: 36, padding: 0 }}
                        >
                          {/* trash SVG */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="modal-backdrop d-block">
          <div
            className="modal d-block"
            tabIndex={-1}
            style={{ display: "block" }}
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <form onSubmit={handleSave}>
                  <div className="modal-header">
                    <h5 className="modal-title">
                      {editingIndex !== null ? "Edit Campaign" : "Add Campaign"}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={closeModal}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <div className="row mb-4">
                      <div className="col-4 d-flex align-items-center">
                        <label className="fw-semibold mb-0">Data Source</label>
                      </div>
                      <div className="col-8">
                        <div className="btn-group w-100" role="group">
                          <button
                            type="button"
                            className={`btn btn-sm ${campaignData?.source === "DV360" ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setCampaignData(prev => ({ ...prev, source: "DV360" }))}
                          >
                            DV360 (Pre-fetch to DB)
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm ${campaignData?.source === "Eskimi" ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => setCampaignData(prev => ({ ...prev, source: "Eskimi" }))}
                          >
                            Eskimi (Live Direct)
                          </button>
                        </div>
                        <small className="text-muted mt-1 d-block">
                          {campaignData?.source === "DV360" 
                            ? "Requires IDs to fetch and store data in our database." 
                            : "Connects directly to Eskimi APIs without storing report data."}
                        </small>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-4 d-flex align-items-center">
                        <label className="fw-semibold mb-0">Report Name</label>
                      </div>
                      <div className="col-8">
                        <input
                          name="reportName"
                          value={campaignData?.reportName || ""}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="e.g. Q1 Performance"
                          disabled={editingIndex !== null}
                          required
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-4 d-flex align-items-center">
                        <label className="fw-semibold mb-0">
                          Advertiser ID
                        </label>
                      </div>
                      <div className="col-8">
                        <input
                          name="advertiserId"
                          value={campaignData?.advertiserId || ""}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="Advertiser ID"
                          disabled={editingIndex !== null}
                          required
                        />
                      </div>
                    </div>

                    {campaignData?.source === "DV360" && (
                      <>
                        <div className="row mb-3">
                          <div className="col-4 d-flex align-items-center">
                            <label className="fw-semibold mb-0">Campaign ID</label>
                          </div>
                          <div className="col-8">
                            <input
                              name="campaignId"
                              value={campaignData?.campaignId || ""}
                              onChange={handleInputChange}
                              className="form-control"
                              placeholder="Required for DV360"
                              disabled={editingIndex !== null}
                              required
                            />
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-4 d-flex align-items-center">
                            <label className="fw-semibold mb-0">
                              Insertion Order ID
                            </label>
                          </div>
                          <div className="col-8">
                            <input
                              name="insertionOrderId"
                              value={campaignData?.insertionOrderId || ""}
                              onChange={handleInputChange}
                              className="form-control"
                              placeholder="Required for DV360"
                              disabled={editingIndex !== null}
                              required
                            />
                          </div>
                        </div>
                      </>
                    )}
                     <div className="row mb-3">
                      <div className="col-4">
                        <label className="fw-semibold mb-0">Date-wise CPM</label>
                      </div>
                      <div className="col-8">
                        <div className="d-flex gap-2 mb-2">
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={newCpmDate}
                            onChange={(e) => setNewCpmDate(e.target.value)}
                          />
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Value"
                            value={newCpmValue}
                            onChange={(e) => setNewCpmValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCpmEntry())}
                          />
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-primary"
                            onClick={handleAddCpmEntry}
                          >Add</button>
                        </div>
                        <div className="border rounded p-2 bg-light" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                          {Object.keys(campaignData?.cpm || {}).length === 0 ? (
                            <small className="text-muted">No CPM entries added.</small>
                          ) : (
                            Object.entries(campaignData.cpm).sort().map(([date, val]) => (
                              <div key={date} className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom">
                                <small className="fw-medium">
                                  {date === startDateStr ? `Base Rate: ${val}` : `${date}: ${val}`}
                                </small>
                                <button 
                                  type="button" 
                                  className="btn btn-link btn-sm p-0 text-danger"
                                  onClick={() => handleRemoveCpmEntry(date)}
                                >Remove</button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-4">
                        <label className="fw-semibold mb-0">Date-wise CPC</label>
                      </div>
                      <div className="col-8">
                        <div className="d-flex gap-2 mb-2">
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={newCpcDate}
                            onChange={(e) => setNewCpcDate(e.target.value)}
                          />
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Value"
                            value={newCpcValue}
                            onChange={(e) => setNewCpcValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCpcEntry())}
                          />
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-primary"
                            onClick={handleAddCpcEntry}
                          >Add</button>
                        </div>
                        <div className="border rounded p-2 bg-light" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                          {Object.keys(campaignData?.cpc || {}).length === 0 ? (
                            <small className="text-muted">No CPC entries added.</small>
                          ) : (
                            Object.entries(campaignData.cpc).sort().map(([date, val]) => (
                               <div key={date} className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom">
                                 <small className="fw-medium">
                                   {date === startDateStr ? `Base Rate: ${val}` : `${date}: ${val}`}
                                 </small>
                                 <button 
                                   type="button" 
                                   className="btn btn-link btn-sm p-0 text-danger"
                                   onClick={() => handleRemoveCpcEntry(date)}
                                 >Remove</button>
                               </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-4 d-flex align-items-center">
                        <label className="fw-semibold mb-0">Currency</label>
                      </div>
                      <div className="col-8">
                        <input
                          type="text"
                          name="currency"
                          value={campaignData?.currency || ""}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="e.g. USD, EUR, GBP"
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                       <div className="col-4 d-flex align-items-center">
                         <label className="fw-semibold mb-0">Campaign Status</label>
                       </div>
                       <div className="col-8">
                         <div className="form-check form-switch pt-1">
                           <input
                             className="form-check-input"
                             type="checkbox"
                             role="switch"
                             id="activeToggle"
                             checked={campaignData?.active !== false}
                             onChange={(e) => setCampaignData(prev => ({ ...prev, active: e.target.checked }))}
                             style={{ cursor: 'pointer' }}
                           />
                           <label className="form-check-label ms-2 text-muted small" htmlFor="activeToggle">
                             {campaignData?.active !== false ? 'Active (Reports will be visible)' : 'Inactive (Reports will be hidden)'}
                           </label>
                         </div>
                       </div>
                     </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={
                        !(
                          campaignData?.reportName?.trim() &&
                          campaignData?.advertiserId?.trim() &&
                          Object.keys(campaignData?.cpm || {}).length > 0 &&
                          (campaignData.source === "Eskimi" || (campaignData.campaignId?.trim() && campaignData.insertionOrderId?.trim()))
                        )
                      }
                    >
                      {editingIndex !== null ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

         <PermissionModal
        show={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        user={selectedPermissionCampaign}
        onSave={handlePermissionSave}
      />

      {showEmailModal && (
        <div className="modal fade show d-block" tabIndex="-1">
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content">
              {/* Header */}
              <div className="modal-header">
                <h5 className="modal-title">Add User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEmailModal(false)}
                ></button>
              </div>

              {/* Body */}
              <div className="modal-body">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter user email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowEmailModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleAddUser()}
                  disabled={!email}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaign;

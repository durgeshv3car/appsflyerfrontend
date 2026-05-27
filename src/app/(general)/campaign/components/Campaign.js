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
import { createReportsDataUrl } from "@/services/url";
import { getSearchJobStatus } from "@/services/youtube";
import {
  createAppsFlyerData,
  getAllAppsFlyerData,
  getSingleAppsFlyerData,
  deleteAppsFlyerData,
} from "@/services/appsflyer";
import PermissionModal from "./PermissionModal";
import Image from "next/image";
import {
  Search,
  Loader2,
  CheckCircle2,
  Layout,
  Database,
  BarChart3,
  PieChart,
  MapPin,
} from "lucide-react";
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
  impression: {},
  currency: "",
  campaignType: "CTV", // New field added
  source: "DV360", // Default source
  active: true, // New field
};

const CampaignLoader = ({ progress, status }) => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100"
      style={{ background: "#f8f9fa" }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
          padding: "40px",
          textAlign: "center",
        }}
      >
        {/* Animated Icon */}
        <div style={{ marginBottom: "30px", position: "relative" }}>
          <div
            className="ai-loader-pulse"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #031035 0%, #081947 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              boxShadow: "0 10px 25px rgba(3, 16, 53, 0.2)",
            }}
          >
            <Database color="white" size={32} />
          </div>
        </div>

        <h4
          style={{ fontWeight: "700", color: "#031035", marginBottom: "10px" }}
        >
          Fetching Campaign Reports
        </h4>
        <p
          style={{
            color: "#64748b",
            fontSize: "0.95rem",
            marginBottom: "25px",
            height: "1.5rem",
          }}
        >
          {status}
        </p>

        {/* Progress Bar Container */}
        <div
          style={{
            width: "100%",
            height: "10px",
            backgroundColor: "#e9ecef",
            borderRadius: "10px",
            overflow: "hidden",
            marginBottom: "15px",
            position: "relative",
          }}
        >
          {/* Progress Bar Fill */}
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "linear-gradient(90deg, #031035, #081947)",
              borderRadius: "10px",
              transition: "width 0.5s ease-in-out",
              position: "relative",
            }}
          >
            {/* Shimmer effect */}
            <div
              className="ai-loader-shimmer"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              }}
            />
          </div>
        </div>

        <div
          className="d-flex justify-content-between"
          style={{ fontSize: "0.85rem", fontWeight: "600", color: "#6c757d" }}
        >
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
  const [selectedPermissionCampaign, setSelectedPermissionCampaign] =
    useState(null);
  const [newCpmDate, setNewCpmDate] = useState("");
  const [newCpmValue, setNewCpmValue] = useState("");
  const [newCpcDate, setNewCpcDate] = useState("");
  const [newCpcValue, setNewCpcValue] = useState("");
  const [newImpressionDate, setNewImpressionDate] = useState("");
  const [newImpressionValue, setNewImpressionValue] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // AppsFlyer State
  const [showAppsFlyerModal, setShowAppsFlyerModal] = useState(false);
  const [selectedAudienceForAppsFlyer, setSelectedAudienceForAppsFlyer] =
    useState(null);
  const [appsFlyerList, setAppsFlyerList] = useState([]);
  const [appsFlyerFormData, setAppsFlyerFormData] = useState({
    name: "",
    app_id: "",
    from: "",
    to: "",
    media_source: "",
  });
  const [editingAppsFlyerId, setEditingAppsFlyerId] = useState(null);
  const [appsFlyerLoading, setAppsFlyerLoading] = useState(false);
  const today = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(today.getFullYear() - 2);
  const formatDate = (date) => date.toISOString().split("T")[0];
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
      cpc: { [startDateStr]: 0 },
      impression: { [startDateStr]: 0 },
    });
    setNewCpmDate(startDateStr);
    setNewCpcDate(startDateStr);
    setNewImpressionDate(startDateStr);
    setEditingIndex(null);
    setModalOpen(true);
  };

  const openEditModal = (index) => {
    const campaign = campaigns[index];
    setCampaignData({
      ...campaign,
      cpm: typeof campaign.cpm === "object" ? campaign.cpm : {},
      cpc: typeof campaign.cpc === "object" ? campaign.cpc : {},
      impression: typeof campaign.impression === "object" ? campaign.impression : {},
    });
    setNewImpressionDate(startDateStr);
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
    setCampaignData((prev) => ({
      ...prev,
      cpm: { ...prev.cpm, [dateToUse]: Number(newCpmValue) },
    }));
    setNewCpmValue("");
  };

  const handleRemoveCpmEntry = (date) => {
    setCampaignData((prev) => {
      const newCpm = { ...prev.cpm };
      delete newCpm[date];
      return { ...prev, cpm: newCpm };
    });
  };

  const handleAddCpcEntry = () => {
    if (!newCpcValue) return;
    const dateToUse = newCpcDate || startDateStr; // Use Base Date if not defined
    setCampaignData((prev) => ({
      ...prev,
      cpc: { ...prev.cpc, [newCpcDate]: Number(newCpcValue) },
    }));
    setNewCpcValue("");
  };

  const handleRemoveCpcEntry = (date) => {
    setCampaignData((prev) => {
      const newCpc = { ...prev.cpc };
      delete newCpc[date];
      return { ...prev, cpc: newCpc };
    });
  };

  const handleAddImpressionEntry = () => {
    if (!newImpressionValue) return;
    const dateToUse = newImpressionDate || startDateStr;
    setCampaignData((prev) => ({
      ...prev,
      impression: { ...prev.impression, [dateToUse]: Number(newImpressionValue) },
    }));
    setNewImpressionValue("");
  };

  const handleRemoveImpressionEntry = (date) => {
    setCampaignData((prev) => {
      const newImpression = { ...prev.impression };
      delete newImpression[date];
      return { ...prev, impression: newImpression };
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
            `${type} job failed: ${statusData.error?.message || "Internal processing error"}`,
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
      campaignData?.campaignType?.trim() &&
      (Object.keys(campaignData?.cpm || {}).length > 0 ||
        Object.keys(campaignData?.cpc || {}).length > 0 ||
        Object.keys(campaignData?.impression || {}).length > 0);

    if (!isValid) {
      toast.warning(
        "Please fill all required fields and add at least one CPM, CPC, or Impression entry",
      );
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
      const formatDate = (date) => date.toISOString().split("T")[0];

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

      if (
        res.audience?._id &&
        campaignData.source === "DV360" &&
        editingIndex === null
      ) {
        const params = {
          audienceId: res.audience._id,
          dataRange: "ALL_TIME",
          campaignType: campaignData.campaignType,
        };

        const reportTasks = [
          { name: "Overview", fn: createReportsData, params: params },
          { name: "Device", fn: createReportsDataDevice, params: params },
          {
            name: "Demographics",
            fn: createReportsDataAge,
            params: { ...params, dataRange: "LAST_365_DAYS" },
          },
          { name: "City", fn: createReportsDataCity, params: params },
          { name: "Browser", fn: createReportsDataBrowser, params: params },
          { name: "OS", fn: createReportsDataOs, params: params },
          { name: "Operator", fn: createReportsDataOperator, params: params },
          { name: "AdPos", fn: createReportsDataAdPos, params: params },
          { name: "AdType", fn: createReportsDataAdType, params: params },
          { name: "Creative", fn: createReportsDataCreative, params: params },
          {
            name: "CreativeSize",
            fn: createReportsDataCreativeSize,
            params: params,
          },
          { name: "URL", fn: createReportsDataUrl, params: params },
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
              const currentProgress =
                20 + Math.floor((completedCount / totalTasks) * 75);
              setProgress(currentProgress);
              setLoadingStatus(
                `Verifying ${task.name} data (${completedCount}/${totalTasks})`,
              );
            } catch (err) {
              console.error(`Task ${task.name} failed:`, err);
              completedCount++; // Still count towards progress to avoid UI hang
            }
          }),
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
      toast.success(
        `Campaign ${editingIndex !== null ? "updated" : "created"} successfully`,
      );
      setTimeout(() => closeModal(), 500);
    } catch (err) {
      console.error("Error saving campaign:", err);
      toast.error("Failed to save campaign");
      closeModal();
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  const handleDelete = async (id) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    try {
      await deleteAudience(id);
      const all = await getAudience();
      setCampaigns(all?.data || []);
      toast.success("Campaign deleted successfully");
      setConfirmDeleteId(null);
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
      toast.success(
        `Campaign ${!currentStatus ? "activated" : "deactivated"} successfully`,
      );
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
    const {
      reportName,
      insertionOrderId,
      advertiserId,
      campaignId,
      cpm,
      cpc,
      impression,
      currency,
      campaignType,
    } = selectedPermissionCampaign;
    const payload = {
      reportName,
      insertionOrderId,
      advertiserId,
      campaignId,
      cpm,
      cpc,
      impression,
      currency,
      campaignType,
      ...updatedData,
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
          }),
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

  // AppsFlyer Handlers
  const openAppsFlyerModal = async (audience) => {
    setSelectedAudienceForAppsFlyer(audience);
    setShowAppsFlyerModal(true);
    setAppsFlyerLoading(true);
    try {
      const res = await getAllAppsFlyerData();
      const filtered = (res.data || []).filter((item) => {
        const currentAudienceId = audience._id?.$oid || audience._id;
        const targetAudienceIds = Array.isArray(item.audienceId)
          ? item.audienceId.map((idObj) => idObj?.$oid || idObj?._id || idObj)
          : [item.audienceId?.$oid || item.audienceId?._id || item.audienceId];

        return targetAudienceIds.includes(currentAudienceId);
      });
      setAppsFlyerList(filtered);
    } catch (err) {
      console.error("Error fetching AppsFlyer data:", err);
      toast.error("Failed to fetch AppsFlyer data");
    } finally {
      setAppsFlyerLoading(false);
    }
  };

  const handleAppsFlyerInputChange = (e) => {
    const { name, value } = e.target;
    setAppsFlyerFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAppsFlyerSave = async (e) => {
    e.preventDefault();
    if (
      !appsFlyerFormData.name ||
      !appsFlyerFormData.app_id ||
      !appsFlyerFormData.from ||
      !appsFlyerFormData.to ||
      !appsFlyerFormData.media_source
    ) {
      toast.warning("Please fill all AppsFlyer fields");
      return;
    }

    try {
      setAppsFlyerLoading(true);
      if (editingAppsFlyerId) {
        // Since update route is not provided, we will delete and recreate
        // OR simply inform that edit is not available yet.
        // For now, I will keep it as "Not supported" or skip it.
        toast.info(
          "Edit is not supported by current backend API. Please delete and recreate.",
        );
      } else {
        // Explicitly format dates to YYYY-MM-DD before sending
        const formattedData = {
          ...appsFlyerFormData,
          from:
            typeof appsFlyerFormData.from === "string"
              ? appsFlyerFormData.from.split("T")[0]
              : appsFlyerFormData.from,
          to:
            typeof appsFlyerFormData.to === "string"
              ? appsFlyerFormData.to.split("T")[0]
              : appsFlyerFormData.to,
          audienceId: selectedAudienceForAppsFlyer._id,
        };
        await createAppsFlyerData(formattedData);
        toast.success("AppsFlyer data added");
      }

      // Refresh list
      const res = await getAllAppsFlyerData();
      const filtered = (res.data || []).filter((item) => {
        const currentAudienceId =
          selectedAudienceForAppsFlyer._id?.$oid ||
          selectedAudienceForAppsFlyer._id;
        const targetAudienceIds = Array.isArray(item.audienceId)
          ? item.audienceId.map((idObj) => idObj?.$oid || idObj?._id || idObj)
          : [item.audienceId?.$oid || item.audienceId?._id || item.audienceId];

        return targetAudienceIds.includes(currentAudienceId);
      });
      setAppsFlyerList(filtered);

      // Reset form
      setAppsFlyerFormData({
        name: "",
        app_id: "",
        from: "",
        to: "",
        media_source: "",
      });
      setEditingAppsFlyerId(null);
    } catch (err) {
      console.error("Error saving AppsFlyer data:", err);
      toast.error("Failed to save AppsFlyer data");
    } finally {
      setAppsFlyerLoading(false);
    }
  };

  const handleAppsFlyerEdit = (item) => {
    setAppsFlyerFormData({
      name: item.name,
      app_id: item.app_id,
      from: item.from ? item.from.split("T")[0] : "",
      to: item.to ? item.to.split("T")[0] : "",
      media_source: item.media_source,
    });
    setEditingAppsFlyerId(item._id);
  };

  const handleAppsFlyerDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this AppsFlyer data?"))
      return;
    try {
      setAppsFlyerLoading(true);
      await deleteAppsFlyerData(id);
      toast.success("AppsFlyer data deleted");
      const res = await getAllAppsFlyerData();
      const filtered = (res.data || []).filter((item) => {
        const currentAudienceId =
          selectedAudienceForAppsFlyer._id?.$oid ||
          selectedAudienceForAppsFlyer._id;
        const targetAudienceIds = Array.isArray(item.audienceId)
          ? item.audienceId.map((idObj) => idObj?.$oid || idObj?._id || idObj)
          : [item.audienceId?.$oid || item.audienceId?._id || item.audienceId];

        return targetAudienceIds.includes(currentAudienceId);
      });
      setAppsFlyerList(filtered);
    } catch (err) {
      console.error("Error deleting AppsFlyer data:", err);
      toast.error("Failed to delete AppsFlyer data");
    } finally {
      setAppsFlyerLoading(false);
    }
  };

  const closeAppsFlyerModal = () => {
    setShowAppsFlyerModal(false);
    setSelectedAudienceForAppsFlyer(null);
    setAppsFlyerList([]);
    setAppsFlyerFormData({
      name: "",
      app_id: "",
      from: "",
      to: "",
      media_source: "",
    });
    setEditingAppsFlyerId(null);
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
        toast.success("User added successfully");
        setShowEmailModal(false);
        setEmail("");
      }
    } catch (err) {
      setError("Failed to add user");
      toast.error("Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      {loading ? (
        <CampaignLoader progress={progress} status={loadingStatus} />
      ) : (
        <div className="card">
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
                    <th>Impression</th>
                    <th>Currency</th>
                    <th>Campaign Type</th>
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
                          <span
                            className={`badge ${c.source === "Eskimi" ? "bg-info" : "bg-primary"}`}
                          >
                            {c.source || "DV360"}
                          </span>
                        </td>
                        <td className="align-middle">{c.advertiserId}</td>
                        <td className="align-middle">{c.campaignId || "-"}</td>
                        <td className="align-middle">
                          {c.insertionOrderId || "-"}
                        </td>
                        <td className="align-middle">
                          {typeof c.cpm === "object" ? (
                            <span className="badge bg-light text-dark border">
                              {Object.keys(c.cpm).length} dates
                            </span>
                          ) : (
                            c.cpm || "-"
                          )}
                        </td>
                        <td className="align-middle">
                          {typeof c.cpc === "object" ? (
                            <span className="badge bg-light text-dark border">
                              {Object.keys(c.cpc).length} dates
                            </span>
                          ) : (
                            c.cpc || "-"
                          )}
                        </td>
                        <td className="align-middle">
                          {typeof c.impression === "object" ? (
                            <span className="badge bg-light text-dark border">
                              {Object.keys(c.impression).length} dates
                            </span>
                          ) : (
                            c.impression || "-"
                          )}
                        </td>
                        <td className="align-middle">{c.currency || "-"}</td>
                        <td className="align-middle">
                          <span className="badge bg-light text-dark border">
                            {c.campaignType || "-"}
                          </span>
                        </td>
                        <td className="align-middle">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              checked={c.active !== false}
                              onChange={() =>
                                handleToggleActive(c._id, c.active !== false)
                              }
                              style={{ cursor: "pointer" }}
                            />
                            <span
                              className={`badge ${c.active !== false ? "bg-success" : "bg-secondary"} ms-2`}
                              style={{ fontSize: "0.7rem" }}
                            >
                              {c.active !== false ? "Active" : "Inactive"}
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

                            {confirmDeleteId === c._id ? (
                              <div className="d-flex gap-1 align-items-center">
                                <button
                                  className="btn btn-sm btn-danger px-2"
                                  onClick={() => handleDelete(c._id)}
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                  }}
                                >
                                  CONFIRM
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-secondary px-2"
                                  onClick={() => setConfirmDeleteId(null)}
                                  style={{ fontSize: "11px" }}
                                >
                                  CANCEL
                                </button>
                              </div>
                            ) : (
                              <button
                                className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                                onClick={() => setConfirmDeleteId(c._id)}
                                title="Delete"
                                aria-label="Delete"
                                style={{ width: 36, height: 36, padding: 0 }}
                              >
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
                            )}
                             <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openAppsFlyerModal(c)}
                              title="AppsFlyer Data"
                            >
                              <Database size={16} /> AppsFlyer
                            </button>
                             <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => handleShowPermissions(c)}
                            >
                              <Shield size={16} /> Permissions
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
                          {editingIndex !== null
                            ? "Edit Campaign"
                            : "Add Campaign"}
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
                            <label className="fw-semibold mb-0">
                              Data Source
                            </label>
                          </div>
                          <div className="col-8">
                            <div className="btn-group w-100" role="group">
                              <button
                                type="button"
                                className={`btn btn-sm ${campaignData?.source === "DV360" ? "btn-primary" : "btn-outline-primary"}`}
                                onClick={() =>
                                  setCampaignData((prev) => ({
                                    ...prev,
                                    source: "DV360",
                                  }))
                                }
                              >
                                DV360 (Pre-fetch to DB)
                              </button>
                              <button
                                type="button"
                                className={`btn btn-sm ${campaignData?.source === "Eskimi" ? "btn-primary" : "btn-outline-primary"}`}
                                onClick={() =>
                                  setCampaignData((prev) => ({
                                    ...prev,
                                    source: "Eskimi",
                                  }))
                                }
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
                            <label className="fw-semibold mb-0">
                              Report Name
                            </label>
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
                                <label className="fw-semibold mb-0">
                                  Campaign ID
                                </label>
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
                            <label className="fw-semibold mb-0">
                              Date-wise CPM
                            </label>
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
                                onKeyDown={(e) =>
                                  e.key === "Enter" &&
                                  (e.preventDefault(), handleAddCpmEntry())
                                }
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={handleAddCpmEntry}
                              >
                                Add
                              </button>
                            </div>
                            <div
                              className="border rounded p-2 bg-light"
                              style={{ maxHeight: "150px", overflowY: "auto" }}
                            >
                              {Object.keys(campaignData?.cpm || {}).length ===
                              0 ? (
                                <small className="text-muted">
                                  No CPM entries added.
                                </small>
                              ) : (
                                Object.entries(campaignData.cpm)
                                  .sort()
                                  .map(([date, val]) => (
                                    <div
                                      key={date}
                                      className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom"
                                    >
                                      <small className="fw-medium">
                                        {date === startDateStr
                                          ? `Base Rate: ${val}`
                                          : `${date}: ${val}`}
                                      </small>
                                      <button
                                        type="button"
                                        className="btn btn-link btn-sm p-0 text-danger"
                                        onClick={() =>
                                          handleRemoveCpmEntry(date)
                                        }
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-4">
                            <label className="fw-semibold mb-0">
                              Date-wise CPC
                            </label>
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
                                onKeyDown={(e) =>
                                  e.key === "Enter" &&
                                  (e.preventDefault(), handleAddCpcEntry())
                                }
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={handleAddCpcEntry}
                              >
                                Add
                              </button>
                            </div>
                            <div
                              className="border rounded p-2 bg-light"
                              style={{ maxHeight: "150px", overflowY: "auto" }}
                            >
                              {Object.keys(campaignData?.cpc || {}).length ===
                              0 ? (
                                <small className="text-muted">
                                  No CPC entries added.
                                </small>
                              ) : (
                                Object.entries(campaignData.cpc)
                                  .sort()
                                  .map(([date, val]) => (
                                    <div
                                      key={date}
                                      className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom"
                                    >
                                      <small className="fw-medium">
                                        {date === startDateStr
                                          ? `Base Rate: ${val}`
                                          : `${date}: ${val}`}
                                      </small>
                                      <button
                                        type="button"
                                        className="btn btn-link btn-sm p-0 text-danger"
                                        onClick={() =>
                                          handleRemoveCpcEntry(date)
                                        }
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  ))
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-4">
                            <label className="fw-semibold mb-0">
                              Date-wise Impression
                            </label>
                          </div>
                          <div className="col-8">
                            <div className="d-flex gap-2 mb-2">
                              <input
                                type="date"
                                className="form-control form-control-sm"
                                value={newImpressionDate}
                                onChange={(e) => setNewImpressionDate(e.target.value)}
                              />
                              <input
                                type="number"
                                className="form-control form-control-sm"
                                placeholder="Value"
                                value={newImpressionValue}
                                onChange={(e) => setNewImpressionValue(e.target.value)}
                                onKeyDown={(e) =>
                                  e.key === "Enter" &&
                                  (e.preventDefault(), handleAddImpressionEntry())
                                }
                              />
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={handleAddImpressionEntry}
                              >
                                Add
                              </button>
                            </div>
                            <div
                              className="border rounded p-2 bg-light"
                              style={{ maxHeight: "150px", overflowY: "auto" }}
                            >
                              {Object.keys(campaignData?.impression || {}).length ===
                              0 ? (
                                <small className="text-muted">
                                  No Impression entries added.
                                </small>
                              ) : (
                                Object.entries(campaignData.impression)
                                  .sort()
                                  .map(([date, val]) => (
                                    <div
                                      key={date}
                                      className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom"
                                    >
                                      <small className="fw-medium">
                                        {date === startDateStr
                                          ? `Base Rate: ${val}`
                                          : `${date}: ${val}`}
                                      </small>
                                      <button
                                        type="button"
                                        className="btn btn-link btn-sm p-0 text-danger"
                                        onClick={() =>
                                          handleRemoveImpressionEntry(date)
                                        }
                                      >
                                        Remove
                                      </button>
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
                            <label className="fw-semibold mb-0">
                              Campaign Type
                            </label>
                          </div>
                          <div className="col-8">
                            <select
                              name="campaignType"
                              value={campaignData?.campaignType || "CTV"}
                              onChange={handleInputChange}
                              className="form-select"
                            >
                              <option value="CTV">CTV</option>
                              <option value="Banner">Banner</option>
                              <option value="Video">Video</option>
                              <option value="Youtube">Youtube</option>
                            </select>
                          </div>
                        </div>

                        <div className="row mb-3">
                          <div className="col-4 d-flex align-items-center">
                            <label className="fw-semibold mb-0">
                              Campaign Status
                            </label>
                          </div>
                          <div className="col-8">
                            <div className="form-check form-switch pt-1">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                id="activeToggle"
                                checked={campaignData?.active !== false}
                                onChange={(e) =>
                                  setCampaignData((prev) => ({
                                    ...prev,
                                    active: e.target.checked,
                                  }))
                                }
                                style={{ cursor: "pointer" }}
                              />
                              <label
                                className="form-check-label ms-2 text-muted small"
                                htmlFor="activeToggle"
                              >
                                {campaignData?.active !== false
                                  ? "Active (Reports will be visible)"
                                  : "Inactive (Reports will be hidden)"}
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
                              campaignData?.campaignType?.trim() &&
                              (Object.keys(campaignData?.cpm || {}).length > 0 ||
                                Object.keys(campaignData?.cpc || {}).length > 0 ||
                                Object.keys(campaignData?.impression || {}).length > 0) &&
                              (campaignData.source === "Eskimi" ||
                                (campaignData.campaignId?.trim() &&
                                  campaignData.insertionOrderId?.trim()))
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
      )}

      {showAppsFlyerModal && (
        <div
          className="modal-backdrop d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-xl modal-dialog-centered shadow-lg">
              <div className="modal-content border-0">
                <div className="modal-header bg-primary text-white py-3">
                  <h5 className="modal-title d-flex align-items-center">
                    <Database size={20} className="me-2" />
                    Manage AppsFlyer Data -{" "}
                    <span className="ms-1 fw-light">
                      {selectedAudienceForAppsFlyer?.reportName}
                    </span>
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closeAppsFlyerModal}
                  ></button>
                </div>
                <div className="modal-body p-4 bg-light">
                  <div className="row">
                    {/* Form Section */}
                    <div className="col-md-4">
                      <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-bottom-0 pt-3 pb-0">
                          <h6 className="fw-bold mb-0 text-primary">
                            {editingAppsFlyerId
                              ? "Edit Entry"
                              : "Add New Entry"}
                          </h6>
                        </div>
                        <div className="card-body p-3" style={{ maxHeight: '65vh', overflowY: 'auto', overflowX: 'hidden' }}>
                          <form onSubmit={handleAppsFlyerSave}>
                            <div className="mb-3">
                              <label className="form-label small fw-semibold">
                                Report Name
                              </label>
                              <input
                                name="name"
                                value={appsFlyerFormData.name}
                                onChange={handleAppsFlyerInputChange}
                                className="form-control form-control-sm border-2"
                                placeholder="e.g. Android Install Data"
                                required
                              />
                            </div>
                            <div className="mb-3">
                              <label className="form-label small fw-semibold">
                                App ID
                              </label>
                              <input
                                name="app_id"
                                value={appsFlyerFormData.app_id}
                                onChange={handleAppsFlyerInputChange}
                                className="form-control form-control-sm border-2"
                                placeholder="com.example.app"
                                required
                              />
                            </div>
                            <div className="row mb-3">
                              <div className="col">
                                <label className="form-label small fw-semibold">
                                  From Date
                                </label>
                                <input
                                  type="date"
                                  name="from"
                                  value={appsFlyerFormData.from}
                                  onChange={handleAppsFlyerInputChange}
                                  className="form-control form-control-sm border-2"
                                  required
                                />
                              </div>
                              <div className="col">
                                <label className="form-label small fw-semibold">
                                  To Date
                                </label>
                                <input
                                  type="date"
                                  name="to"
                                  value={appsFlyerFormData.to}
                                  onChange={handleAppsFlyerInputChange}
                                  className="form-control form-control-sm border-2"
                                  required
                                />
                              </div>
                            </div>
                            <div className="mb-4">
                              <label className="form-label small fw-semibold">
                                Campaign Type
                              </label>
                              <select
                                name="campaign_type"
                                value={appsFlyerFormData.campaign_type}
                                onChange={handleAppsFlyerInputChange}
                                className="form-control form-control-sm border-2"
                                required
                              >
                                <option value="">Select Campaign Type</option>
                                <option value="android">Android</option>
                                <option value="ios">iOS</option>
                              </select>
                            </div>
                            <div className="mb-4">
                              <label className="form-label small fw-semibold">
                                Media Source
                              </label>
                              <input
                                name="media_source"
                                value={appsFlyerFormData.media_source}
                                onChange={handleAppsFlyerInputChange}
                                className="form-control form-control-sm border-2"
                                placeholder="dv360_int"
                                required
                              />
                            </div>
                            <div className="mb-4">
                              <label className="form-label small fw-semibold">
                                Conversion Event
                              </label>
                              <input
                                name="conversion_event"
                                value={appsFlyerFormData.conversion_event}
                                onChange={handleAppsFlyerInputChange}
                                className="form-control form-control-sm border-2"
                                placeholder="af_purchase"
                                required
                              />
                            </div>
                            <div className="d-grid gap-2">
                              <button
                                type="submit"
                                className="btn btn-primary btn-sm fw-bold"
                                disabled={appsFlyerLoading}
                              >
                                {appsFlyerLoading ? (
                                  <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Processing...
                                  </>
                                ) : editingAppsFlyerId ? (
                                  "Update Entry"
                                ) : (
                                  "Save Entry"
                                )}
                              </button>
                              {editingAppsFlyerId && (
                                <button
                                  type="button"
                                  className="btn btn-light btn-sm border"
                                  onClick={() => {
                                    setEditingAppsFlyerId(null);
                                    setAppsFlyerFormData({
                                      name: "",
                                      app_id: "",
                                      from: "",
                                      to: "",
                                      media_source: "",
                                      conversion_event: "",
                                      campaign_type: "",
                                    });
                                  }}
                                >
                                  Cancel Edit
                                </button>
                              )}
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>

                    {/* List Section */}
                    <div className="col-md-8">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-bottom-0 pt-3 d-flex justify-content-between align-items-center">
                          <h6 className="fw-bold mb-0 text-primary">
                            AppsFlyer Entries
                          </h6>
                          <span className="badge bg-soft-primary text-primary border">
                            {appsFlyerList.length} total
                          </span>
                        </div>
                        <div
                          className="card-body p-0 overflow-auto"
                          style={{ maxHeight: "65vh" }}
                        >
                          <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                              <thead className="bg-light sticky-top">
                                <tr>
                                  <th className="small fw-bold px-3 py-2">
                                    Name
                                  </th>
                                  <th className="small fw-bold px-3 py-2">
                                    App ID
                                  </th>
                                  <th className="small fw-bold px-3 py-2">
                                    Date Range
                                  </th>
                                  <th className="small fw-bold px-3 py-2">
                                    Media Source
                                  </th>
                                  <th className="small fw-bold px-3 py-2 text-end">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {appsFlyerLoading &&
                                appsFlyerList.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="5"
                                      className="text-center py-5"
                                    >
                                      <div
                                        className="spinner-border spinner-border-sm text-primary"
                                        role="status"
                                      ></div>
                                      <div className="mt-2 small text-muted">
                                        Loading data...
                                      </div>
                                    </td>
                                  </tr>
                                ) : appsFlyerList.length === 0 ? (
                                  <tr>
                                    <td
                                      colSpan="5"
                                      className="text-center py-5 text-muted small italic"
                                    >
                                      No data found. Add your first entry to get
                                      started.
                                    </td>
                                  </tr>
                                ) : (
                                  appsFlyerList.map((item) => (
                                    <tr key={item._id}>
                                      <td className="px-3">
                                        <div className="fw-semibold small">
                                          {item.name}
                                        </div>
                                      </td>
                                      <td className="px-3 small text-muted font-monospace">
                                        {item.app_id}
                                      </td>
                                      <td className="px-3">
                                        <div className="small">
                                          {item.from
                                            ? typeof item.from === "string"
                                              ? item.from.split("T")[0]
                                              : item.from.$date
                                                ? item.from.$date.split("T")[0]
                                                : "-"
                                            : "-"}
                                          {" to "}
                                          {item.to
                                            ? typeof item.to === "string"
                                              ? item.to.split("T")[0]
                                              : item.to.$date
                                                ? item.to.$date.split("T")[0]
                                                : "-"
                                            : "-"}
                                        </div>
                                      </td>
                                      <td className="px-3">
                                        <span className="badge bg-soft-info text-info border small">
                                          {item.media_source}
                                        </span>
                                      </td>
                                      <td className="px-3 text-end">
                                        <div className="btn-group">
                                          {/* <button 
                                            className="btn btn-sm btn-outline-secondary border-0 p-1" 
                                            onClick={() => handleAppsFlyerEdit(item)}
                                            title="Edit"
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                          </button> */}
                                          <button
                                            className="btn btn-sm btn-outline-danger border-0 p-1"
                                            onClick={() =>
                                              handleAppsFlyerDelete(item._id)
                                            }
                                            title="Delete"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              width="14"
                                              height="14"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            >
                                              <polyline points="3 6 5 6 21 6"></polyline>
                                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                              <line
                                                x1="10"
                                                y1="11"
                                                x2="10"
                                                y2="17"
                                              ></line>
                                              <line
                                                x1="14"
                                                y1="11"
                                                x2="14"
                                                y2="17"
                                              ></line>
                                            </svg>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light border-top-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm px-4"
                    onClick={closeAppsFlyerModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Campaign;

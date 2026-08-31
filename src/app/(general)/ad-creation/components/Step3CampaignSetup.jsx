"use client";
import React, { useState } from "react";
import {
  FiSliders,
  FiDollarSign,
  FiCalendar,
  FiTarget,
  FiArrowRight,
  FiArrowLeft,
  FiInfo,
  FiMonitor,
  FiSmartphone,
  FiTv,
  FiTablet,
} from "react-icons/fi";
import topTost from "@/utils/topTost";

const Step3CampaignSetup = ({
  onNext,
  onPrev,
  onCampaignDataChange,
  campaignData,
  selectedAudience,
  selectedCreative,
}) => {
  const [formData, setFormData] = useState({
    campaignName: campaignData?.campaignName || "DV360 Summer 2026 Campaign",
    objective: campaignData?.objective || "CONVERSIONS",
    bidStrategy: campaignData?.bidStrategy || "CPM",
    bidAmount: campaignData?.bidAmount || "2.50",
    dailyBudget: campaignData?.dailyBudget || "500",
    totalBudget: campaignData?.totalBudget || "10000",
    startDate: campaignData?.startDate || new Date().toISOString().split("T")[0],
    endDate:
      campaignData?.endDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    devices: campaignData?.devices || ["DESKTOP", "MOBILE", "TABLET", "CTV"],
  });

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    if (onCampaignDataChange) {
      onCampaignDataChange(updated);
    }
  };

  const toggleDevice = (dev) => {
    let updatedDevs = [...formData.devices];
    if (updatedDevs.includes(dev)) {
      if (updatedDevs.length > 1) {
        updatedDevs = updatedDevs.filter((d) => d !== dev);
      }
    } else {
      updatedDevs.push(dev);
    }
    handleChange("devices", updatedDevs);
  };

  const handleProceed = (e) => {
    e.preventDefault();
    if (!formData.campaignName.trim()) {
      topTost("Please enter a Campaign Name", "warning");
      return;
    }
    onNext();
  };

  return (
    <div className="campaign-setup-step animate-fadeIn">
      {/* Top Banner */}
      <div
        className="card border-0 rounded-4 mb-4 p-4 text-white shadow-sm position-relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #14b8a6 100%)",
        }}
      >
        <div className="row align-items-center position-relative z-1">
          <div className="col-lg-8">
            <span className="badge bg-white/20 text-white rounded-pill px-3 py-1 fw-semibold mb-2" style={{ backdropFilter: "blur(4px)" }}>
              Step 3 • Campaign & Line Item Setup
            </span>
            <h4 className="fw-bold text-white mb-2">
              Campaign Targeting, Bidding & Budget
            </h4>
            <p className="text-white/90 mb-0 fs-14" style={{ maxWidth: "680px" }}>
              Configure line item pacing, CPM/CPC bidding strategies, flight dates, and distribution budgets. (Placeholder ready for your custom specifications).
            </p>
          </div>
          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <span className="badge bg-white/20 text-white rounded-pill px-3 py-1.5 fs-12">
              <FiInfo className="me-1" /> Customizable Step 3
            </span>
          </div>
        </div>
      </div>

      {/* Linked Assets Status */}
      <div className="card border-0 rounded-4 mb-4 p-3 bg-white shadow-xs">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 fs-11 fw-semibold">
                Target Audience
              </span>
              <span className="fw-bold text-dark fs-13">
                {selectedAudience ? (selectedAudience.displayName || selectedAudience.reportName) : "None selected"}
              </span>
            </div>
            <div className="vr d-none d-md-block" style={{ height: "20px" }} />
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-purple-subtle text-purple rounded-pill px-2.5 py-1 fs-11 fw-semibold" style={{ backgroundColor: "#f3e8ff", color: "#7e22ce" }}>
                Linked Creative
              </span>
              <span className="fw-bold text-dark fs-13">
                {selectedCreative ? (selectedCreative.name || selectedCreative.creativeName) : "None selected"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onPrev}
            className="btn btn-outline-secondary btn-sm rounded-pill px-3 fs-12 d-flex align-items-center gap-1"
          >
            <FiArrowLeft size={13} /> Back to Creatives
          </button>
        </div>
      </div>

      <form onSubmit={handleProceed}>
        <div className="row g-4">
          {/* Left: Campaign Basics & Objective */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4" style={{ background: "#ffffff" }}>
              <h6 className="fw-bold mb-3 pb-2 border-bottom text-dark d-flex align-items-center gap-2">
                <FiTarget className="text-success" /> Campaign Goals & General Info
              </h6>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark fs-13">
                  Campaign Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control rounded-3 py-2"
                  value={formData.campaignName}
                  onChange={(e) => handleChange("campaignName", e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-dark fs-13">
                  Optimization Goal / Objective
                </label>
                <select
                  className="form-select rounded-3 py-2"
                  value={formData.objective}
                  onChange={(e) => handleChange("objective", e.target.value)}
                >
                  <option value="CONVERSIONS">Drive Online Conversions / Purchases</option>
                  <option value="APP_INSTALLS">Drive Mobile App Installs (Appsflyer)</option>
                  <option value="BRAND_AWARENESS">Brand Awareness & Video Completion</option>
                  <option value="TRAFFIC">Maximize High-Intent Website Clicks</option>
                </select>
              </div>

              {/* Device Targeting */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark fs-13">
                  Target Device Platforms
                </label>
                <div className="row g-2">
                  {[
                    { id: "DESKTOP", label: "Desktop", icon: FiMonitor },
                    { id: "MOBILE", label: "Mobile", icon: FiSmartphone },
                    { id: "TABLET", label: "Tablet", icon: FiTablet },
                    { id: "CTV", label: "Connected TV", icon: FiTv },
                  ].map((d) => {
                    const Icon = d.icon;
                    const isSelected = formData.devices.includes(d.id);
                    return (
                      <div className="col-6 col-sm-3" key={d.id}>
                        <div
                          onClick={() => toggleDevice(d.id)}
                          className={`p-2.5 rounded-3 border text-center cursor-pointer transition-all ${
                            isSelected
                              ? "border-success bg-success-subtle/15 text-success fw-bold shadow-xs"
                              : "border-light-subtle bg-light text-muted"
                          }`}
                          style={{ cursor: "pointer" }}
                        >
                          <Icon size={20} className="mb-1 d-block mx-auto" />
                          <div className="fs-11">{d.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Linked Step 1 & 2 Summary Box */}
              <div className="p-3 rounded-3 bg-light border border-light-subtle mt-3">
                <div className="text-muted fs-11 fw-bold text-uppercase mb-1">Context Summary</div>
                <div className="fs-12 mb-1">
                  <strong>Audience:</strong> {selectedAudience?.displayName || "DV360 Match Segment"}
                </div>
                <div className="fs-12">
                  <strong>Creative:</strong> {selectedCreative?.creativeName || "Selected Media Asset"}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Bidding, Budget & Flight Dates */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4" style={{ background: "#ffffff" }}>
              <h6 className="fw-bold mb-3 pb-2 border-bottom text-dark d-flex align-items-center gap-2">
                <FiDollarSign className="text-success" /> Bidding, Budget & Flight Schedule
              </h6>

              {/* Bidding Strategy */}
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label fw-semibold text-dark fs-13">Bidding Metric</label>
                  <select
                    className="form-select rounded-3 py-2"
                    value={formData.bidStrategy}
                    onChange={(e) => handleChange("bidStrategy", e.target.value)}
                  >
                    <option value="CPM">Target CPM ($ / 1,000 Impressions)</option>
                    <option value="CPC">Target CPC ($ / Click)</option>
                    <option value="MAX_CLICKS">Maximize Clicks Automated</option>
                  </select>
                </div>
                <div className="col-sm-6">
                  <label className="form-label fw-semibold text-dark fs-13">Bid Amount ($)</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      step="0.01"
                      className="form-control rounded-end-3 py-2"
                      value={formData.bidAmount}
                      onChange={(e) => handleChange("bidAmount", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Budget */}
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label fw-semibold text-dark fs-13">Daily Budget ($)</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className="form-control rounded-end-3 py-2"
                      value={formData.dailyBudget}
                      onChange={(e) => handleChange("dailyBudget", e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-sm-6">
                  <label className="form-label fw-semibold text-dark fs-13">Total Flight Budget ($)</label>
                  <div className="input-group">
                    <span className="input-group-text">$</span>
                    <input
                      type="number"
                      className="form-control rounded-end-3 py-2"
                      value={formData.totalBudget}
                      onChange={(e) => handleChange("totalBudget", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Flight Dates */}
              <div className="row g-3 mb-4">
                <div className="col-sm-6">
                  <label className="form-label fw-semibold text-dark fs-13">Start Date</label>
                  <input
                    type="date"
                    className="form-control rounded-3 py-2"
                    value={formData.startDate}
                    onChange={(e) => handleChange("startDate", e.target.value)}
                    required
                  />
                </div>
                <div className="col-sm-6">
                  <label className="form-label fw-semibold text-dark fs-13">End Date</label>
                  <input
                    type="date"
                    className="form-control rounded-3 py-2"
                    value={formData.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                <button
                  type="button"
                  onClick={onPrev}
                  className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1"
                >
                  <FiArrowLeft /> Back to Creative
                </button>

                <button
                  type="submit"
                  className="btn btn-success rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
                >
                  Proceed to Review & Launch <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Step3CampaignSetup;

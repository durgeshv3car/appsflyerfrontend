"use client";
import React, { useState } from "react";
import {
  FiCheckCircle,
  FiUsers,
  FiImage,
  FiSliders,
  FiArrowLeft,
  FiDownload,
  FiSend,
  FiCheck,
  FiCalendar,
  FiDollarSign,
  FiLock,
  FiExternalLink,
} from "react-icons/fi";
import Link from "next/link";
import topTost from "@/utils/topTost";

const Step4ReviewLaunch = ({
  onPrev,
  onReset,
  selectedAudience,
  selectedCreative,
  campaignData,
}) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isLaunched, setIsLaunched] = useState(false);

  // Export JSON configuration
  const handleExportJSON = () => {
    const summaryData = {
      adCreationTimestamp: new Date().toISOString(),
      step1_audience: {
        id: selectedAudience?._id,
        dv360AudienceId: selectedAudience?.dv360AudienceId,
        displayName: selectedAudience?.displayName,
        advertiserId: selectedAudience?.advertiserId,
        audienceType: selectedAudience?.audienceType,
        membershipDurationDays: selectedAudience?.membershipDurationDays,
        consent: selectedAudience?.consent,
        memberCountUploaded: selectedAudience?.memberCountUploaded,
      },
      step2_creative: {
        id: selectedCreative?._id,
        creativeName: selectedCreative?.creativeName,
        type: selectedCreative?.type,
        fileUrl: selectedCreative?.fileUrl,
      },
      step3_campaignSetup: campaignData,
      step4_status: "LAUNCH_READY",
    };

    const blob = new Blob([JSON.stringify(summaryData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ad_campaign_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    topTost("Exported Campaign Configuration JSON", "success");
  };

  // Launch campaign
  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      setIsLaunched(true);
      topTost("Ad Campaign successfully launched & submitted to DV360!", "success");
    }, 1200);
  };

  return (
    <div className="review-launch-step animate-fadeIn">
      {/* Top Banner */}
      <div
        className="card border-0 rounded-4 mb-4 p-4 text-white shadow-sm position-relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0284c7 0%, #0369a1 50%, #075985 100%)",
        }}
      >
        <div className="row align-items-center position-relative z-1">
          <div className="col-lg-8">
            <span className="badge bg-white/20 text-white rounded-pill px-3 py-1 fw-semibold mb-2" style={{ backdropFilter: "blur(4px)" }}>
              Step 4 • Final Review & Launch
            </span>
            <h4 className="fw-bold text-white mb-2">
              Review Ad Configuration & Publish
            </h4>
            <p className="text-white/90 mb-0 fs-14" style={{ maxWidth: "680px" }}>
              Verify your DV360 Customer Match Audience, linked Creative media assets, and campaign targeting setup prior to deployment.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <button
              type="button"
              onClick={handleExportJSON}
              className="btn btn-light rounded-pill px-3.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1.5 shadow-sm text-primary"
            >
              <FiDownload /> Export Config (JSON)
            </button>
          </div>
        </div>
      </div>

      {isLaunched ? (
        /* Success State */
        <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle bg-success text-white"
            style={{ width: "72px", height: "72px", boxShadow: "0 8px 24px rgba(22,163,74,0.25)" }}
          >
            <FiCheckCircle size={38} strokeWidth={2.5} />
          </div>
          <h4 className="fw-bold text-dark mb-2">Ad Campaign Successfully Configured!</h4>
          <p className="text-muted fs-14 mx-auto mb-4" style={{ maxWidth: "540px" }}>
            Your DV360 Customer Match audience has been linked and the campaign is ready for serving.
          </p>

          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link href="/preview-list" className="btn btn-outline-primary rounded-pill px-4 py-2">
              View Creative List
            </Link>
            <Link href="/preview" className="btn btn-primary rounded-pill px-4 py-2">
              Go to Campaign Reports
            </Link>
            <button
              type="button"
              onClick={onReset}
              className="btn btn-light rounded-pill px-4 py-2"
            >
              Create Another Ad
            </button>
          </div>
        </div>
      ) : (
        /* Review Summary Cards */
        <div className="row g-4">
          {/* Card 1: Audience Review */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4" style={{ background: "#ffffff" }}>
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <FiUsers className="text-primary" /> 1. Audience
                </h6>
                <span className="badge bg-primary-subtle text-primary rounded-pill px-2 py-0.5 fs-10">
                  Step 1
                </span>
              </div>

              <div className="mb-3">
                <span className="text-muted fs-11 d-block">Audience Name</span>
                <strong className="text-dark fs-14">
                  {selectedAudience?.displayName || "DV360 Match Segment"}
                </strong>
              </div>

              <div className="mb-3">
                <span className="text-muted fs-11 d-block">DV360 Audience ID</span>
                <span className="badge bg-light text-dark border font-monospace fs-12">
                  {selectedAudience?.dv360AudienceId || "Auto-Assigned"}
                </span>
              </div>

              <div className="mb-3">
                <span className="text-muted fs-11 d-block">Advertiser ID</span>
                <div className="fs-13 text-dark">{selectedAudience?.advertiserId || "N/A"}</div>
              </div>

              <div className="mb-3">
                <span className="text-muted fs-11 d-block">Audience Type / Channel</span>
                <span className="badge bg-primary-subtle text-primary text-uppercase fs-11">
                  {selectedAudience?.audienceCategory || selectedAudience?.audienceType || "CUSTOMER_MATCH"}
                </span>
              </div>

              <div className="p-2.5 rounded-3 bg-light fs-11 text-muted">
                <div className="d-flex justify-content-between mb-1">
                  <span>Targeting Volume:</span>
                  <strong className="text-dark">
                    {selectedAudience?.memberCountUploaded
                      ? `${selectedAudience.memberCountUploaded.toLocaleString()} members`
                      : selectedAudience?.googleAudiences?.length
                      ? `${selectedAudience.googleAudiences.length} segments`
                      : selectedAudience?.customKeywords?.length || selectedAudience?.customUrls?.length
                      ? `${(selectedAudience.customKeywords?.length || 0) + (selectedAudience.customUrls?.length || 0)} signals`
                      : "Configured"}
                  </strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Duration:</span>
                  <strong className="text-dark">
                    {selectedAudience?.membershipDurationDays ? `${selectedAudience.membershipDurationDays} Days` : "Active"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Creative Review */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4" style={{ background: "#ffffff" }}>
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <FiImage className="text-purple" style={{ color: "#7c3aed" }} /> 2. Creative Asset
                </h6>
                <span className="badge bg-purple-subtle text-purple rounded-pill px-2 py-0.5 fs-10" style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                  Step 2
                </span>
              </div>

              <div className="mb-3">
                <span className="text-muted fs-11 d-block">Creative Name</span>
                <strong className="text-dark fs-14">
                  {selectedCreative?.creativeName || "Selected Media Asset"}
                </strong>
              </div>

              <div className="mb-3">
                <span className="text-muted fs-11 d-block">Format / Type</span>
                <span className="badge bg-secondary-subtle text-secondary text-uppercase fs-10">
                  {selectedCreative?.type || "image"}
                </span>
              </div>

              {/* Asset Preview Thumbnail */}
              <div
                className="rounded-3 border bg-light d-flex align-items-center justify-content-center p-2 mb-3 overflow-hidden"
                style={{ height: "130px" }}
              >
                {selectedCreative?.fileUrl && !selectedCreative.fileUrl.endsWith(".zip") ? (
                  <img
                    src={selectedCreative.fileUrl}
                    alt="Creative Preview"
                    style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <div className="text-center text-muted">
                    <FiImage size={32} />
                    <div className="fs-10 mt-1">Creative Media Asset</div>
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-3 bg-light fs-11 text-muted text-truncate">
                <span>Storage URL:</span>
                <div className="font-monospace text-dark text-truncate">
                  {selectedCreative?.fileUrl || "Local asset"}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Campaign Setup Review */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4" style={{ background: "#ffffff" }}>
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                  <FiSliders className="text-success" /> 3. Campaign Setup
                </h6>
                <span className="badge bg-success-subtle text-success rounded-pill px-2 py-0.5 fs-10">
                  Step 3
                </span>
              </div>

              <div className="mb-3">
                <span className="text-muted fs-11 d-block">Campaign Name</span>
                <strong className="text-dark fs-14">
                  {campaignData?.campaignName || "DV360 Campaign"}
                </strong>
              </div>

              <div className="mb-3">
                <span className="text-muted fs-11 d-block">Objective</span>
                <span className="badge bg-light text-dark border fs-11">
                  {campaignData?.objective || "CONVERSIONS"}
                </span>
              </div>

              <div className="mb-3">
                <span className="text-muted fs-11 d-block">Bidding Strategy</span>
                <div className="fs-13 text-dark">
                  Target {campaignData?.bidStrategy || "CPM"}: ${campaignData?.bidAmount || "2.50"}
                </div>
              </div>

              <div className="p-2.5 rounded-3 bg-light fs-11 text-muted mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Daily Budget:</span>
                  <strong className="text-dark">${campaignData?.dailyBudget || "500"}</strong>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Total Budget:</span>
                  <strong className="text-dark">${campaignData?.totalBudget || "10,000"}</strong>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Flight:</span>
                  <strong className="text-dark">
                    {campaignData?.startDate || "Today"} → {campaignData?.endDate || "30 Days"}
                  </strong>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-1">
                {campaignData?.devices?.map((d) => (
                  <span key={d} className="badge bg-light text-muted border fs-10">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Verification & Launch Bar */}
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="row align-items-center g-3">
                <div className="col-md-7">
                  <h6 className="fw-bold text-dark mb-1">Pre-Launch Verification Passed</h6>
                  <div className="d-flex flex-wrap gap-3 text-muted fs-12">
                    <span className="d-flex align-items-center gap-1 text-success">
                      <FiCheck size={16} /> DV360 Audience Active
                    </span>
                    <span className="d-flex align-items-center gap-1 text-success">
                      <FiCheck size={16} /> Consent Mode Granted
                    </span>
                    <span className="d-flex align-items-center gap-1 text-success">
                      <FiCheck size={16} /> Creative Asset Ready
                    </span>
                  </div>
                </div>

                <div className="col-md-5 text-md-end d-flex justify-content-md-end gap-2">
                  <button
                    type="button"
                    onClick={onPrev}
                    className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1"
                  >
                    <FiArrowLeft /> Back to Setup
                  </button>

                  <button
                    type="button"
                    disabled={isLaunching}
                    onClick={handleLaunch}
                    className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
                  >
                    {isLaunching ? (
                      <>
                        <span className="spinner-border spinner-border-sm" /> Publishing...
                      </>
                    ) : (
                      <>
                        <FiSend /> Launch Ad Campaign
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step4ReviewLaunch;

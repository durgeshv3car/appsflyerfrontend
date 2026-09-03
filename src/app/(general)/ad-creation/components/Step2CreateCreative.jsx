"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  FiImage,
  FiVideo,
  FiUploadCloud,
  FiCheckCircle,
  FiEye,
  FiArrowRight,
  FiArrowLeft,
  FiPlus,
  FiGrid,
  FiList,
  FiTrash2,
  FiFile,
  FiCheck,
  FiRefreshCw,
  FiLayers,
} from "react-icons/fi";
import topTost from "@/utils/topTost";
import { getAdvertisers } from "@/services/advertiser";
import {
  uploadDV360CreativeDirect,
  getDV360CreativesList,
} from "@/services/adCreative";

const CREATIVE_TYPES = [
  { id: "image", label: "Display Image", icon: FiImage, ext: "JPG, PNG, WEBP, GIF" },
  { id: "video", label: "Video Ad", icon: FiVideo, ext: "MP4, MOV, WEBM (Max 100MB)" },
  { id: "banner", label: "HTML5 Banner", icon: FiImage, ext: "ZIP, HTML, JPG, PNG" },
  { id: "ctv", label: "CTV / OTT Video", icon: FiVideo, ext: "16:9 MP4 Full HD / 4K" },
  { id: "rich-media", label: "Rich Media / Interactive", icon: FiGrid, ext: "ZIP Bundle / HTML5" },
  { id: "audio", label: "Audio Ad", icon: FiFile, ext: "MP3, WAV" },
];

const STANDARD_BANNER_SIZES = [
  { label: "300 × 250 (Medium Rectangle)", width: 300, height: 250 },
  { label: "728 × 90 (Leaderboard)", width: 728, height: 90 },
  { label: "320 × 50 (Mobile Leaderboard)", width: 320, height: 50 },
  { label: "300 × 600 (Half Page)", width: 300, height: 600 },
  { label: "160 × 600 (Wide Skyscraper)", width: 160, height: 600 },
  { label: "970 × 250 (Billboard)", width: 970, height: 250 },
  { label: "336 × 280 (Large Rectangle)", width: 336, height: 280 },
];

const Step2CreateCreative = ({
  onNext,
  onPrev,
  onCreativeSelected,
  selectedAudience,
  initialCreative,
}) => {
  const [activeTab, setActiveTab] = useState("upload"); // "upload" or "library"
  const [creativeName, setCreativeName] = useState("");
  const [creativeType, setCreativeType] = useState("image");
  const [clickUrl, setClickUrl] = useState("");
  const [imageDimensions, setImageDimensions] = useState({ width: null, height: null });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [useExternalUrl, setUseExternalUrl] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Advertiser — independent of Step 1, pre-filled if audience is linked
  const [advertisers, setAdvertisers] = useState([]);
  const [selectedAdvertiserId, setSelectedAdvertiserId] = useState(
    selectedAudience?.advertiserId || ""
  );
  const [manualAdvertiserId, setManualAdvertiserId] = useState("");
  const [isManualAdvertiser, setIsManualAdvertiser] = useState(false);

  // Live DV360 Creatives Library
  const [existingCreatives, setExistingCreatives] = useState([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [librarySearch, setLibrarySearch] = useState("");
  const [selectedCreative, setSelectedCreative] = useState(initialCreative || null);

  // Active advertiser calculation
  const getActiveAdvertiserId = useCallback(() => {
    return isManualAdvertiser
      ? manualAdvertiserId.trim()
      : selectedAdvertiserId || selectedAudience?.advertiserId || "";
  }, [isManualAdvertiser, manualAdvertiserId, selectedAdvertiserId, selectedAudience?.advertiserId]);

  // Fetch advertiser list on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAdvertisers();
        let list = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;
        else if (Array.isArray(res?.data?.advertises)) list = res.data.advertises;
        else if (Array.isArray(res?.advertises)) list = res.advertises;
        setAdvertisers(list);
        // Only auto-select first if nothing pre-filled from Step 1
        if (list.length > 0 && !selectedAdvertiserId && !selectedAudience?.advertiserId) {
          setSelectedAdvertiserId(list[0].advertise_id || "");
        }
      } catch (err) {
        console.warn("Could not load advertisers:", err);
      }
    };
    load();
  }, []);

  // Sync advertiser if audience changes from parent
  useEffect(() => {
    if (selectedAudience?.advertiserId && !manualAdvertiserId) {
      setSelectedAdvertiserId(selectedAudience.advertiserId);
    }
  }, [selectedAudience?.advertiserId]);

  // Fetch creatives directly from DV360 API (No DB)
  const fetchCreativesLibrary = useCallback(async () => {
    const advId = getActiveAdvertiserId();
    if (!advId) {
      setExistingCreatives([]);
      return;
    }

    setIsLoadingLibrary(true);
    try {
      const res = await getDV360CreativesList({
        advertiserId: advId,
        search: librarySearch,
        pageSize: 50,
      });

      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;
      setExistingCreatives(list);
    } catch (err) {
      console.warn("Error fetching DV360 live creatives library:", err);
      setExistingCreatives([]);
    } finally {
      setIsLoadingLibrary(false);
    }
  }, [getActiveAdvertiserId, librarySearch]);

  useEffect(() => {
    fetchCreativesLibrary();
  }, [fetchCreativesLibrary]);

  // Handle file selection — auto-detect dimensions for images
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImageDimensions({ width: null, height: null }); // reset

    if (!creativeName) {
      setCreativeName(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }

    if (selectedFile.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(previewUrl);

      // Auto-read actual pixel dimensions
      const img = new window.Image();
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(previewUrl);
      };
      img.src = previewUrl;
    } else if (selectedFile.type.startsWith("video/")) {
      const previewUrl = URL.createObjectURL(selectedFile);
      setFilePreview(previewUrl);

      // Auto-read video dimensions
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setImageDimensions({ width: video.videoWidth, height: video.videoHeight });
        URL.revokeObjectURL(previewUrl);
      };
      video.src = previewUrl;
    } else {
      setFilePreview("");
    }
  };

  // Upload creative directly to DV360 (No DB storage)
  const handleUploadCreative = async (e) => {
    e.preventDefault();

    if (!creativeName.trim()) {
      topTost("Please provide a Creative Name", "warning");
      return;
    }

    if (!file && !externalUrl.trim()) {
      topTost("Please select a file or provide a media URL", "warning");
      return;
    }

    const activeAdvertiserId = getActiveAdvertiserId();
    if (!activeAdvertiserId) {
      topTost("Please select or enter a DV360 Advertiser ID", "warning");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", creativeName.trim());
      formData.append("creativeType", creativeType);
      formData.append("advertiserId", activeAdvertiserId);
      formData.append("clickUrl", clickUrl.trim() || "https://example.com");

      // Auto-detected / customized dimensions
      if (imageDimensions.width && imageDimensions.height) {
        formData.append("width", imageDimensions.width);
        formData.append("height", imageDimensions.height);
      }

      if (file) {
        formData.append("file", file);
      } else if (externalUrl) {
        formData.append("fileUrl", externalUrl.trim());
      }

      const result = await uploadDV360CreativeDirect(formData);

      if (result && (result.data || result.status === "success")) {
        const creativeData = result.data || result;
        topTost("Creative uploaded & created directly in DV360!", "success");
        setSelectedCreative(creativeData);
        if (onCreativeSelected) {
          onCreativeSelected(creativeData);
        }
        fetchCreativesLibrary();
      } else {
        topTost(result?.message || result?.error || "Failed to create creative in DV360", "error");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      console.error("DV360 creative upload error:", errorMsg);
      topTost("DV360 Upload Error: " + errorMsg, "error");
    } finally {
      setIsUploading(false);
    }
  };

  // Select creative from library
  const handleSelectCreative = (item) => {
    setSelectedCreative(item);
    if (onCreativeSelected) {
      onCreativeSelected(item);
    }
    // Support both old (creativeName) and new (name) field
    topTost(`Selected creative: ${item.name || item.creativeName}`, "success");
  };

  // Proceed to Step 3
  const handleProceed = () => {
    if (!selectedCreative) {
      topTost("Please upload or select a creative before proceeding", "warning");
      return;
    }
    onNext();
  };

  return (
    <div className="creative-creation-step animate-fadeIn">
      {/* Top Banner */}
      <div
        className="card border-0 rounded-4 mb-4 p-4 text-white shadow-sm position-relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)",
        }}
      >
        <div className="row align-items-center position-relative z-1">
          <div className="col-lg-8">
            <span className="badge bg-white/20 text-white rounded-pill px-3 py-1 fw-semibold mb-2" style={{ backdropFilter: "blur(4px)" }}>
              Step 2 • Creative Media Studio
            </span>
            <h4 className="fw-bold text-white mb-2">
              Create & Manage Creative Assets
            </h4>
            <p className="text-white/90 mb-0 fs-14" style={{ maxWidth: "680px" }}>
              Upload high-impact display banners, video creatives, rich-media assets, or CTV formats. Link your creative directly to the audience segment configured in Step 1.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
            <div className="btn-group bg-white/10 p-1 rounded-pill" style={{ backdropFilter: "blur(6px)" }}>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                  activeTab === "upload" ? "btn-light text-primary shadow-sm" : "text-white border-0"
                }`}
                onClick={() => setActiveTab("upload")}
              >
                <FiPlus className="me-1" /> New Creative
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                  activeTab === "library" ? "btn-light text-primary shadow-sm" : "text-white border-0"
                }`}
                onClick={() => setActiveTab("library")}
              >
                <FiGrid className="me-1" /> Asset Library ({existingCreatives.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Linked Step 1 Audience Banner */}
      <div className="card border-0 rounded-4 mb-3 p-3 bg-white shadow-xs">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 fs-11 fw-semibold">
              Linked Step 1 Audience
            </span>
            {selectedAudience ? (
              <span className="fw-bold text-dark fs-13">
                {selectedAudience.displayName || selectedAudience.reportName}
                <span className="text-muted fw-normal ms-1 fs-12">
                  ({selectedAudience.audienceCategory || selectedAudience.audienceType} • ID: {selectedAudience.dv360AudienceId || "Saved"})
                </span>
              </span>
            ) : (
              <span className="text-warning fw-semibold fs-12">
                ⚠️ No audience selected yet in Step 1.
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onPrev}
            className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1 fs-12 fw-semibold d-flex align-items-center gap-1"
          >
            <FiArrowLeft size={13} /> {selectedAudience ? "Change Audience" : "Select Audience in Step 1"}
          </button>
        </div>
      </div>

      {/* Selected Creative Notice */}
      {selectedCreative && (
        <div
          className="alert alert-success border-success-subtle rounded-4 p-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3 shadow-xs"
          style={{ background: "#f0fdf4" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-success text-white"
              style={{ width: "40px", height: "40px" }}
            >
              <FiCheckCircle size={22} />
            </div>
            <div>
              <div className="fw-bold text-success-emphasis fs-15">
                Active Creative Selected: {selectedCreative.name || selectedCreative.creativeName}
              </div>
              <div className="text-muted small">
                Format: <span className="badge bg-secondary-subtle text-secondary text-uppercase">{selectedCreative.creativeType || selectedCreative.type}</span> |
                {selectedCreative.dv360CreativeId ? (
                  <span className="text-success fw-semibold ms-1">✓ In DV360 (ID: {selectedCreative.dv360CreativeId})</span>
                ) : (
                  <span className="text-muted ms-1">Local only — not yet in DV360</span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleProceed}
            className="btn btn-success rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
          >
            Proceed to Campaign Setup <FiArrowRight />
          </button>
        </div>
      )}

      {/* TAB 1: UPLOAD NEW CREATIVE */}
      {activeTab === "upload" && (
        <form onSubmit={handleUploadCreative}>
          <div className="row g-4">
            {/* Left Column: Creative Form Settings */}
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm rounded-4 h-100 p-4" style={{ background: "#ffffff" }}>
                <h6 className="fw-bold mb-3 pb-2 border-bottom text-dark d-flex align-items-center gap-2">
                  <FiImage className="text-primary" /> Creative Specifications
                </h6>

                {/* DV360 Advertiser — independent picker */}
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <label className="form-label fw-semibold text-dark mb-0 fs-13">
                      DV360 Advertiser <span className="text-danger">*</span>
                    </label>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none small text-primary"
                      onClick={() => setIsManualAdvertiser(!isManualAdvertiser)}
                    >
                      {isManualAdvertiser ? "Select from list" : "+ Enter custom ID"}
                    </button>
                  </div>
                  {isManualAdvertiser ? (
                    <input
                      type="text"
                      className="form-control rounded-3 py-2"
                      placeholder="e.g. 12345678"
                      value={manualAdvertiserId}
                      onChange={(e) => setManualAdvertiserId(e.target.value)}
                    />
                  ) : (
                    <select
                      className="form-select rounded-3 py-2"
                      value={selectedAdvertiserId}
                      onChange={(e) => setSelectedAdvertiserId(e.target.value)}
                    >
                      <option value="">-- Choose Advertiser --</option>
                      {Array.isArray(advertisers) && advertisers.map((adv) => (
                        <option key={adv._id || adv.advertise_id} value={adv.advertise_id}>
                          {adv.advertiser_name} ({adv.advertise_id})
                        </option>
                      ))}
                    </select>
                  )}
                  {selectedAudience?.advertiserId && (
                    <div className="form-text text-success fs-11">
                      ✓ Pre-filled from Step 1 audience (Advertiser: {selectedAudience.advertiserId})
                    </div>
                  )}
                </div>

                {/* Creative Name */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark fs-13">
                    Creative Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-3 py-2"
                    placeholder="e.g. Summer Sale 2026 300x250 Banner"
                    value={creativeName}
                    onChange={(e) => setCreativeName(e.target.value)}
                    required
                  />
                </div>

                {/* Creative Format Type Selector */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark fs-13">
                    Creative Format / Type <span className="text-danger">*</span>
                  </label>
                  <div className="row g-2">
                    {CREATIVE_TYPES.map((t) => {
                      const Icon = t.icon;
                      const isSelected = creativeType === t.id;
                      return (
                        <div className="col-6 col-sm-4" key={t.id}>
                          <div
                            onClick={() => {
                              setCreativeType(t.id);
                              if ((t.id === "banner" || t.id === "rich-media") && !imageDimensions.width) {
                                setImageDimensions({ width: 300, height: 250 });
                              }
                            }}
                            className={`p-2.5 rounded-3 border text-center cursor-pointer transition-all ${
                              isSelected
                                ? "border-primary bg-primary-subtle/10 text-primary shadow-xs fw-bold"
                                : "border-light-subtle bg-light text-muted"
                            }`}
                            style={{ cursor: "pointer" }}
                          >
                            <Icon size={20} className="mb-1 d-block mx-auto" />
                            <div className="fs-12">{t.label}</div>
                            <div className="fs-10 text-muted">{t.ext.split(" ")[0]}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dimensions selector for HTML5 Banner / Rich Media ZIPs */}
                {(creativeType === "banner" || creativeType === "rich-media" || file?.name?.endsWith(".zip")) && (
                  <div className="mb-3 p-3 bg-light rounded-3 border border-light-subtle">
                    <label className="form-label fw-semibold text-dark fs-13 mb-1">
                      Creative Dimensions (Required for HTML5 / Rich Media)
                    </label>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {STANDARD_BANNER_SIZES.map((size) => {
                        const isMatch = imageDimensions.width === size.width && imageDimensions.height === size.height;
                        return (
                          <button
                            key={size.label}
                            type="button"
                            onClick={() => setImageDimensions({ width: size.width, height: size.height })}
                            className={`btn btn-xs rounded-pill px-2.5 py-1 fs-11 ${
                              isMatch ? "btn-primary shadow-xs" : "btn-outline-secondary bg-white"
                            }`}
                          >
                            {size.width}×{size.height}
                          </button>
                        );
                      })}
                    </div>
                    <div className="row g-2 align-items-center">
                      <div className="col-5">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-white">W</span>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="300"
                            value={imageDimensions.width || ""}
                            onChange={(e) =>
                              setImageDimensions((prev) => ({
                                ...prev,
                                width: e.target.value ? Number(e.target.value) : null,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="col-1 text-center text-muted">×</div>
                      <div className="col-5">
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-white">H</span>
                          <input
                            type="number"
                            className="form-control"
                            placeholder="250"
                            value={imageDimensions.height || ""}
                            onChange={(e) =>
                              setImageDimensions((prev) => ({
                                ...prev,
                                height: e.target.value ? Number(e.target.value) : null,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="col-1 text-muted fs-11">px</div>
                    </div>
                  </div>
                )}

                {/* Media Input Toggle (File vs URL) */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="form-label fw-semibold text-dark mb-0 fs-13">
                      Media Asset Source
                    </label>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none small text-primary"
                      onClick={() => setUseExternalUrl(!useExternalUrl)}
                    >
                      {useExternalUrl ? "← Upload File Instead" : "+ Use Hosted Asset URL"}
                    </button>
                  </div>

                  {useExternalUrl ? (
                    <input
                      type="url"
                      className="form-control rounded-3 py-2"
                      placeholder="https://cdn.example.com/creatives/banner.mp4"
                      value={externalUrl}
                      onChange={(e) => setExternalUrl(e.target.value)}
                      required
                    />
                  ) : (
                    <div
                      className="border border-2 border-dashed rounded-4 p-4 text-center bg-light/40 hover-shadow transition-all"
                      style={{ borderColor: "#cbd5e1" }}
                    >
                      <FiUploadCloud size={38} className="text-primary mb-2" />
                      <div className="fw-semibold text-dark fs-13">
                        Drag & Drop or Browse Media File
                      </div>
                      <div className="text-muted fs-11 mb-3">
                        Supported: Images, Videos, HTML5 Zip bundles (up to 100MB)
                      </div>
                      <input
                        type="file"
                        id="creativeFileInput"
                        className="form-control d-none"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="creativeFileInput" className="btn btn-sm btn-primary rounded-pill px-4">
                        Choose Media File
                      </label>
                      {file && (
                        <div className="mt-2 text-success fw-semibold fs-12">
                          <FiCheckCircle className="me-1" /> Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Click-Through URL — required by DV360 as exit event */}
                <div className="mb-3">
                  <label className="form-label fw-semibold text-dark fs-13">
                    Click-Through URL <span className="text-danger">*</span>
                  </label>
                  <input
                    type="url"
                    className="form-control rounded-3 py-2"
                    placeholder="https://www.yoursite.com/landing-page"
                    value={clickUrl}
                    onChange={(e) => setClickUrl(e.target.value)}
                    required
                  />
                  <div className="form-text text-muted fs-11">
                    Required by DV360 — the destination URL when someone clicks the ad.
                  </div>
                </div>

                {/* Target Audience Reference (Auto-linked from Step 1) */}
                <div className="p-3 rounded-3 bg-light border border-light-subtle">
                  <span className="text-muted fs-11 d-block">Target Audience (Step 1)</span>
                  <div className="fw-bold text-dark fs-13">
                    {selectedAudience?.displayName || "Default General Audience"}
                  </div>
                  {selectedAudience?.dv360AudienceId && (
                    <span className="text-muted fs-11 font-monospace">
                      DV360 Match ID: {selectedAudience.dv360AudienceId}
                    </span>
                  )}
                </div>

                {/* Submit button */}
                <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                  <button
                    type="button"
                    onClick={onPrev}
                    className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1"
                  >
                    <FiArrowLeft /> Back to Audience
                  </button>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
                  >
                    {isUploading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" /> Uploading...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle /> Save & Select Creative
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Media Asset Preview */}
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm rounded-4 h-100 p-4 d-flex flex-column" style={{ background: "#ffffff" }}>
                <h6 className="fw-bold mb-3 pb-2 border-bottom text-dark d-flex align-items-center gap-2">
                  <FiEye className="text-primary" /> Live Preview
                </h6>

                <div
                  className="rounded-4 border d-flex align-items-center justify-content-center bg-dark/5 flex-grow-1 overflow-hidden p-3 position-relative"
                  style={{ minHeight: "260px" }}
                >
                  {filePreview ? (
                    file?.type.startsWith("video/") ? (
                      <video
                        src={filePreview}
                        controls
                        className="rounded-3 shadow-xs"
                        style={{ maxWidth: "100%", maxHeight: "280px" }}
                      />
                    ) : (
                      <img
                        src={filePreview}
                        alt="Creative Preview"
                        className="rounded-3 shadow-xs"
                        style={{ maxWidth: "100%", maxHeight: "280px", objectFit: "contain" }}
                      />
                    )
                  ) : externalUrl ? (
                    <div className="text-center p-3">
                      <FiImage size={40} className="text-primary mb-2" />
                      <div className="text-truncate fs-12 font-monospace" style={{ maxWidth: "260px" }}>
                        {externalUrl}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted p-4">
                      <FiImage size={48} className="text-muted/50 mb-2" />
                      <div className="fs-13 fw-semibold">No asset selected yet</div>
                      <div className="fs-11">Choose a media file or URL to preview the rendering</div>
                    </div>
                  )}
                </div>

                <div className="mt-3 p-2.5 rounded-3 bg-light fs-12 text-muted">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Selected Type:</span>
                    <strong className="text-dark text-capitalize">{creativeType}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Asset Name:</span>
                    <strong className="text-dark text-truncate" style={{ maxWidth: "160px" }}>
                      {creativeName || "Untitled Creative"}
                    </strong>
                  </div>
                  {imageDimensions.width && imageDimensions.height && (
                    <div className="d-flex justify-content-between text-success">
                      <span>Detected Dimensions:</span>
                      <strong className="text-success font-monospace">
                        {imageDimensions.width} × {imageDimensions.height} px
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: LIVE DV360 ASSET LIBRARY */}
      {activeTab === "library" && (
        <div className="card border-0 shadow-sm rounded-4 p-4" style={{ background: "#ffffff" }}>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-bold mb-0 text-dark">Live DV360 Creative Assets</h5>
                <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 fs-11">
                  Advertiser: {getActiveAdvertiserId() || "None"}
                </span>
              </div>
              <p className="text-muted fs-13 mb-0 mt-1">
                Directly fetched from Google DV360 API for advertiser {getActiveAdvertiserId() || "(Select an advertiser)"}.
              </p>
            </div>

            <div className="d-flex align-items-center gap-2">
              <input
                type="text"
                className="form-control form-control-sm rounded-pill px-3"
                placeholder="Search DV360 creatives..."
                style={{ width: "220px" }}
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
              />
              <button
                type="button"
                onClick={fetchCreativesLibrary}
                className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                title="Refresh DV360 library"
              >
                <FiRefreshCw size={13} className={isLoadingLibrary ? "spin" : ""} /> Refresh
              </button>
            </div>
          </div>

          {!getActiveAdvertiserId() ? (
            <div className="text-center py-5 bg-light rounded-4 border border-dashed p-4">
              <FiLayers size={40} className="text-muted mb-2" />
              <h6 className="fw-bold text-dark mb-1">No DV360 Advertiser Selected</h6>
              <p className="text-muted fs-13 mb-3">
                Please select or enter a DV360 Advertiser ID to load its creative library from Google DV360.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-pill px-4"
                onClick={() => setActiveTab("upload")}
              >
                Go to Specifications
              </button>
            </div>
          ) : isLoadingLibrary ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-2" role="status" />
              <div className="text-muted fs-13">Loading DV360 Creatives directly from Google API...</div>
            </div>
          ) : existingCreatives.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-4 border border-dashed">
              <FiImage size={40} className="text-muted mb-2" />
              <h6 className="fw-bold text-dark mb-1">No Creatives Found in DV360</h6>
              <p className="text-muted fs-13 mb-3">
                No active creatives found for advertiser {getActiveAdvertiserId()}. Upload a new creative directly to DV360.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-pill px-4"
                onClick={() => setActiveTab("upload")}
              >
                <FiPlus className="me-1" /> Upload DV360 Creative
              </button>
            </div>
          ) : (
            <div className="row g-3">
              {Array.isArray(existingCreatives) &&
                existingCreatives.map((item) => {
                  const isSelected =
                    (selectedCreative?.dv360CreativeId && selectedCreative.dv360CreativeId === item.dv360CreativeId) ||
                    (selectedCreative?._id && selectedCreative._id === item._id) ||
                    (selectedCreative?.id && selectedCreative.id === item.id);
                  const displayName = item.displayName || item.name || item.creativeName || "Untitled";
                  const displayType = item.creativeType || item.type || "CREATIVE_TYPE_STANDARD";
                  const width = item.width || item.dimensions?.widthPixels;
                  const height = item.height || item.dimensions?.heightPixels;

                  return (
                    <div className="col-12 col-sm-6 col-lg-4" key={item.dv360CreativeId || item.id || item._id}>
                      <div
                        className={`card h-100 rounded-4 border transition-all ${
                          isSelected
                            ? "border-primary shadow-sm bg-primary-subtle/5"
                            : "border-light-subtle bg-white hover-shadow"
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSelectCreative(item)}
                      >
                        <div
                          className="card-img-top bg-light d-flex align-items-center justify-content-center p-3 rounded-top-4 overflow-hidden"
                          style={{ height: "140px" }}
                        >
                          <div className="text-center text-primary">
                            {String(displayType).includes("VIDEO") ? (
                              <FiVideo size={36} />
                            ) : (
                              <FiImage size={36} />
                            )}
                            <div className="fs-11 text-muted mt-1">
                              {width && height ? `${width} × ${height} px` : displayType}
                            </div>
                          </div>
                        </div>

                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="badge bg-secondary-subtle text-secondary rounded-pill fs-10">
                              {displayType}
                            </span>
                            <span className="badge bg-success-subtle text-success rounded-pill fs-10">
                              ✓ DV360 Live
                            </span>
                            {isSelected && (
                              <span className="badge bg-success text-white rounded-pill fs-10">
                                <FiCheck /> Selected
                              </span>
                            )}
                          </div>
                          <h6 className="fw-bold text-dark text-truncate mb-1 fs-13" title={displayName}>
                            {displayName}
                          </h6>
                          <div className="text-muted fs-11 font-monospace">
                            DV360 ID: {item.dv360CreativeId || item.id}
                          </div>
                          {item.status && (
                            <div className="text-muted fs-11 mt-1">
                              Status: <span className="text-capitalize">{String(item.status).replace("ENTITY_STATUS_", "").toLowerCase()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Bottom navigation */}
          <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
            <button
              type="button"
              onClick={onPrev}
              className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1"
            >
              <FiArrowLeft /> Back to Audience
            </button>

            <button
              type="button"
              disabled={!selectedCreative}
              onClick={handleProceed}
              className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2"
            >
              Proceed to Campaign Setup <FiArrowRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step2CreateCreative;

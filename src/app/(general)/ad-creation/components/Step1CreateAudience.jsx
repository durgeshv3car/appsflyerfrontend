"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  FiUsers,
  FiUploadCloud,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiLock,
  FiInfo,
  FiArrowRight,
  FiRefreshCw,
  FiDatabase,
  FiPlus,
  FiDownload,
  FiEye,
  FiGlobe,
  FiZap,
  FiSearch,
  FiTag,
  FiCheck,
  FiX,
  FiTrash2,
  FiFilter,
  FiAlertTriangle,
  FiTarget,
} from "react-icons/fi";
import { getAdvertisers } from "@/services/advertiser";
import {
  createDV360CustomerMatchAudience,
  getDV360CustomerMatchAudiences,
  uploadDV360CustomerMatchMembers,
  previewHashedMembers,
  getGoogleAudiences,
  createGoogleInterestAudience,
  deleteDV360CustomerMatchAudience,
} from "@/services/dv360CustomerMatch";
import { getAudience, deleteAudience } from "@/services/createaudience";
import topTost from "@/utils/topTost";

// Pre-defined fallback Google Audience categories to ensure instant snappy browsing
const POPULAR_GOOGLE_AUDIENCES = [
  // ── 1. AFFINITY (LIFESTYLES & INTERESTS) ───────────────────────────
  { googleAudienceId: "80001", displayName: "Auto Enthusiasts", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_AFFINITY", category: "Vehicles & Transportation" },
  { googleAudienceId: "80002", displayName: "Technophiles & Tech Enthusiasts", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_AFFINITY", category: "Technology" },
  { googleAudienceId: "80003", displayName: "Luxury Travelers", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_AFFINITY", category: "Travel" },
  { googleAudienceId: "80004", displayName: "Avid Investors & Finance Buffs", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_AFFINITY", category: "Finance" },
  { googleAudienceId: "80005", displayName: "Sports & Fitness Enthusiasts", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_AFFINITY", category: "Sports & Fitness" },
  { googleAudienceId: "80006", displayName: "Fashionistas & Trendsetters", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_AFFINITY", category: "Apparel & Beauty" },
  { googleAudienceId: "80007", displayName: "Foodies & Cooking Enthusiasts", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_AFFINITY", category: "Food & Dining" },
  { googleAudienceId: "80008", displayName: "Green Living Enthusiasts", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_AFFINITY", category: "Lifestyles" },
  { googleAudienceId: "80009", displayName: "Movie & TV Lovers", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_AFFINITY", category: "Media & Entertainment" },
  { googleAudienceId: "80010", displayName: "Hardcore Gamers", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_AFFINITY", category: "Gaming" },
  { googleAudienceId: "80011", displayName: "Health & Wellness Buffs", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_AFFINITY", category: "Health & Wellness" },
  { googleAudienceId: "80012", displayName: "Outdoor & Adventure Seekers", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_AFFINITY", category: "Sports & Outdoors" },
  { googleAudienceId: "80013", displayName: "Pet Lovers & Pet Owners", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_AFFINITY", category: "Pets" },
  { googleAudienceId: "80014", displayName: "Home Decor & DIY Enthusiasts", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_AFFINITY", category: "Home & Garden" },
  { googleAudienceId: "80015", displayName: "Business Professionals & Decision Makers", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_AFFINITY", category: "Business" },

  // ── 2. IN-MARKET (HIGH PURCHASE INTENT) ───────────────────────────
  { googleAudienceId: "90001", displayName: "In-Market: Motor Vehicles (New & Used)", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_IN_MARKET", category: "Autos & Vehicles" },
  { googleAudienceId: "90002", displayName: "In-Market: SUVs & Luxury Vehicles", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_IN_MARKET", category: "Autos & Vehicles" },
  { googleAudienceId: "90003", displayName: "In-Market: Real Estate & Properties", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_IN_MARKET", category: "Real Estate" },
  { googleAudienceId: "90004", displayName: "In-Market: Financial Services & Loans", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_IN_MARKET", category: "Financial Services" },
  { googleAudienceId: "90005", displayName: "In-Market: Consumer Electronics & Smartphones", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_IN_MARKET", category: "Consumer Electronics" },
  { googleAudienceId: "90006", displayName: "In-Market: Travel & Vacation Packages", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_IN_MARKET", category: "Travel" },
  { googleAudienceId: "90007", displayName: "In-Market: Home Improvement & Decor", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_IN_MARKET", category: "Home & Garden" },
  { googleAudienceId: "90008", displayName: "In-Market: Enterprise & Business Software", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_IN_MARKET", category: "Software & Technology" },
  { googleAudienceId: "90009", displayName: "In-Market: Apparel & Accessories", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_IN_MARKET", category: "Apparel" },
  { googleAudienceId: "90010", displayName: "In-Market: Higher Education & Courses", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_IN_MARKET", category: "Education" },
  { googleAudienceId: "90011", displayName: "In-Market: Employment & Career Opportunities", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_IN_MARKET", category: "Employment" },
  { googleAudienceId: "90012", displayName: "In-Market: Health Insurance & Wellness", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_IN_MARKET", category: "Healthcare" },

  // ── 3. DETAILED DEMOGRAPHICS ──────────────────────────────────────
  { googleAudienceId: "30002", displayName: "High School Graduate", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_EXTENDED_DEMOGRAPHIC", category: "Education" },
  { googleAudienceId: "30004", displayName: "Bachelor's Degree", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_EXTENDED_DEMOGRAPHIC", category: "Education" },
  { googleAudienceId: "30005", displayName: "Advanced Degree (Masters / PhD)", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_EXTENDED_DEMOGRAPHIC", category: "Education" },
  { googleAudienceId: "30006", displayName: "Homeowners", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_EXTENDED_DEMOGRAPHIC", category: "Homeownership Status" },
  { googleAudienceId: "30007", displayName: "Renters", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_EXTENDED_DEMOGRAPHIC", category: "Homeownership Status" },
  { googleAudienceId: "30008", displayName: "Parents of Toddlers (1-3 yrs)", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_EXTENDED_DEMOGRAPHIC", category: "Parental Status" },
  { googleAudienceId: "30009", displayName: "Parents of Teens (13-17 yrs)", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_EXTENDED_DEMOGRAPHIC", category: "Parental Status" },
  { googleAudienceId: "30010", displayName: "Marital Status: Married", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_EXTENDED_DEMOGRAPHIC", category: "Marital Status" },
  { googleAudienceId: "30011", displayName: "Marital Status: Single", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_EXTENDED_DEMOGRAPHIC", category: "Marital Status" },
  { googleAudienceId: "30012", displayName: "Employment: Enterprise Corporation", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_EXTENDED_DEMOGRAPHIC", category: "Employment" },

  // ── 4. LIFE EVENTS ────────────────────────────────────────────────
  { googleAudienceId: "40001", displayName: "Life Event: Purchasing a Home", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_LIFE_EVENT", category: "Life Events" },
  { googleAudienceId: "40002", displayName: "Life Event: Starting a Business", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_LIFE_EVENT", category: "Life Events" },
  { googleAudienceId: "40003", displayName: "Life Event: College Graduation", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_LIFE_EVENT", category: "Life Events" },
  { googleAudienceId: "40004", displayName: "Life Event: Job Change / New Career", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_LIFE_EVENT", category: "Life Events" },
  { googleAudienceId: "40005", displayName: "Life Event: Getting Married / Wedding Planning", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_LIFE_EVENT", category: "Life Events" },
  { googleAudienceId: "40006", displayName: "Life Event: Moving / Relocating", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_LIFE_EVENT", category: "Life Events" },
  { googleAudienceId: "40007", displayName: "Life Event: Retirement", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_LIFE_EVENT", category: "Life Events" },
  { googleAudienceId: "40008", displayName: "Life Event: Newly Engaged", googleAudienceType: "GOOGLE_AUDIENCE_TYPE_LIFE_EVENT", category: "Life Events" },
];

const GOOGLE_CATEGORY_FILTERS = [
  { id: "all", label: "All Categories", icon: "🌐" },
  { id: "GOOGLE_AUDIENCE_TYPE_IN_MARKET", label: "In-Market (High Intent)", icon: "🎯" },
  { id: "GOOGLE_AUDIENCE_TYPE_AFFINITY", label: "Affinity (Lifestyles)", icon: "💡" },
  { id: "GOOGLE_AUDIENCE_TYPE_EXTENDED_DEMOGRAPHIC", label: "Demographics", icon: "🎓" },
  { id: "GOOGLE_AUDIENCE_TYPE_LIFE_EVENT", label: "Life Events", icon: "🌟" },
];

const SAVED_AUDIENCE_CATEGORY_FILTERS = [
  { id: "all", label: "All Types" },
  { id: "CUSTOMER_MATCH", label: "Customer Match (1st Party)" },
  { id: "GOOGLE_INTEREST", label: "Google Interest / Affinity" },
  { id: "CUSTOM_INTENT", label: "Custom Intent" },
  { id: "CAMPAIGN_AUDIENCE", label: "Campaign Audiences" },
];

const Step1CreateAudience = ({ onNext, onAudienceSelected, initialAudience }) => {
  // Mode: "create" or "select"
  const [mode, setMode] = useState("create");

  // Audience Source Category: "customer-match" | "google-interest" | "custom-intent"
  const [audienceSource, setAudienceSource] = useState("customer-match");

  // Advertisers list
  const [advertisers, setAdvertisers] = useState([]);
  const [selectedAdvertiserId, setSelectedAdvertiserId] = useState("");
  const [manualAdvertiserId, setManualAdvertiserId] = useState("");
  const [isManualAdvertiser, setIsManualAdvertiser] = useState(false);

  // Common Form fields
  const [displayName, setDisplayName] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [description, setDescription] = useState("");
  const [audienceType, setAudienceType] = useState("CUSTOMER_MATCH_CONTACT_INFO");
  const [membershipDurationDays, setMembershipDurationDays] = useState(540);

  // Consent
  const [adUserDataConsent, setAdUserDataConsent] = useState("CONSENT_STATUS_GRANTED");
  const [adPersonalizationConsent, setAdPersonalizationConsent] = useState("CONSENT_STATUS_GRANTED");

  // 1. Customer Match Data
  const [uploadTab, setUploadTab] = useState("paste"); // "paste" or "file"
  const [rawTextData, setRawTextData] = useState("");
  const [parsedMembers, setParsedMembers] = useState([]);
  const [fileName, setFileName] = useState("");
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  // 2. Google Interest & In-Market Audiences Data
  const [masterGoogleAudiences, setMasterGoogleAudiences] = useState(POPULAR_GOOGLE_AUDIENCES);
  const [selectedGoogleAudiences, setSelectedGoogleAudiences] = useState([]);
  const [googleAudienceSearch, setGoogleAudienceSearch] = useState("");
  const [googleAudienceTypeFilter, setGoogleAudienceTypeFilter] = useState("all");
  const [isLoadingGoogleAudiences, setIsLoadingGoogleAudiences] = useState(false);

  // 3. Custom Intent Data (Keywords & URLs)
  const [keywordInput, setKeywordInput] = useState("");
  const [customKeywords, setCustomKeywords] = useState([]);
  const [urlInput, setUrlInput] = useState("");
  const [customUrls, setCustomUrls] = useState([]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);

  // Existing audiences list state
  const [existingAudiences, setExistingAudiences] = useState([]);
  const [isLoadingAudiences, setIsLoadingAudiences] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [listAdvertiserFilter, setListAdvertiserFilter] = useState("all");
  const [listCategoryFilter, setListCategoryFilter] = useState("all");
  const [selectedAudience, setSelectedAudience] = useState(initialAudience || null);

  // Delete modal / state
  const [confirmDeleteAud, setConfirmDeleteAud] = useState(null);
  const [isDeletingId, setIsDeletingId] = useState(null);

  // Active advertiser helper for creation
  const activeAdvertiser = isManualAdvertiser ? manualAdvertiserId.trim() : selectedAdvertiserId;

  // Initialize selected audience from props or localStorage
  useEffect(() => {
    if (initialAudience) {
      setSelectedAudience(initialAudience);
    } else {
      try {
        const saved = localStorage.getItem("selectedAudience");
        if (saved) {
          const parsed = JSON.parse(saved);
          setSelectedAudience(parsed);
          if (onAudienceSelected) onAudienceSelected(parsed);
        }
      } catch (e) {}
    }
  }, [initialAudience]);


  // Compute category segment counts for Google audiences catalog
  const categoryCounts = useMemo(() => {
    const counts = {
      all: masterGoogleAudiences.length,
      GOOGLE_AUDIENCE_TYPE_IN_MARKET: 0,
      GOOGLE_AUDIENCE_TYPE_AFFINITY: 0,
      GOOGLE_AUDIENCE_TYPE_EXTENDED_DEMOGRAPHIC: 0,
      GOOGLE_AUDIENCE_TYPE_LIFE_EVENT: 0,
    };
    masterGoogleAudiences.forEach((item) => {
      if (counts[item.googleAudienceType] !== undefined) {
        counts[item.googleAudienceType]++;
      }
    });
    return counts;
  }, [masterGoogleAudiences]);

  // Reactive Instant Filtering for Google Audiences
  const filteredGoogleAudiences = useMemo(() => {
    const query = googleAudienceSearch.trim().toLowerCase();
    return masterGoogleAudiences.filter((item) => {
      const matchType =
        googleAudienceTypeFilter === "all" ||
        item.googleAudienceType === googleAudienceTypeFilter;
      if (!matchType) return false;

      if (!query) return true;
      const nameMatch = item.displayName?.toLowerCase().includes(query);
      const idMatch = String(item.googleAudienceId || "").toLowerCase().includes(query);
      const categoryMatch = item.category?.toLowerCase().includes(query);
      const typeMatch = item.googleAudienceType?.toLowerCase().includes(query);
      return nameMatch || idMatch || categoryMatch || typeMatch;
    });
  }, [masterGoogleAudiences, googleAudienceSearch, googleAudienceTypeFilter]);

  // Filtered Existing Audiences for Mode 2 (Existing List)
  const filteredExistingAudiences = useMemo(() => {
    const query = searchFilter.trim().toLowerCase();
    return existingAudiences.filter((aud) => {
      // Advertiser filter
      if (listAdvertiserFilter !== "all" && String(aud.advertiserId) !== String(listAdvertiserFilter)) {
        return false;
      }
      // Category filter
      if (listCategoryFilter !== "all") {
        const audCat = aud.audienceCategory || (aud.audienceType?.includes("CUSTOMER_MATCH") ? "CUSTOMER_MATCH" : "");
        if (audCat !== listCategoryFilter && aud.audienceType !== listCategoryFilter) {
          return false;
        }
      }
      // Search filter (name, id, advertiser, description, type, campaign name)
      if (!query) return true;
      const nameMatch = aud.displayName?.toLowerCase().includes(query) || aud.reportName?.toLowerCase().includes(query);
      const idMatch = String(aud.dv360AudienceId || aud._id || "").toLowerCase().includes(query);
      const advMatch = String(aud.advertiserId || "").toLowerCase().includes(query);
      const descMatch = aud.description?.toLowerCase().includes(query);
      const typeMatch = (aud.audienceCategory || aud.audienceType || "").toLowerCase().includes(query);
      const campaignMatch = aud.campaignName?.toLowerCase().includes(query);
      return nameMatch || idMatch || advMatch || descMatch || typeMatch || campaignMatch;
    });
  }, [existingAudiences, searchFilter, listAdvertiserFilter, listCategoryFilter]);

  // Fetch advertisers on load
  useEffect(() => {
    const fetchAdvertisersList = async () => {
      try {
        const res = await getAdvertisers();
        let list = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;
        else if (Array.isArray(res?.data?.advertises)) list = res.data.advertises;
        else if (Array.isArray(res?.advertises)) list = res.advertises;
        setAdvertisers(list);
        if (list.length > 0 && !selectedAdvertiserId) {
          setSelectedAdvertiserId(list[0].advertise_id || "");
        }
      } catch (err) {
        console.warn("Could not load advertisers list:", err);
        setAdvertisers([]);
      }
    };
    fetchAdvertisersList();
  }, []);

  // ─── Fetch audience list from API (primary source of truth) ───────────────
  // Fetches DV360 Customer Match audiences + Campaign/Standard audiences from API.
  const fetchExistingAudiences = useCallback(async () => {
    setIsLoadingAudiences(true);

    try {
      // Fetch DV360 Customer Match & Interest audiences from API
      let dv360List = [];
      try {
        const res = await getDV360CustomerMatchAudiences();
        if (Array.isArray(res)) dv360List = res;
        else if (Array.isArray(res?.data)) dv360List = res.data;
        else if (Array.isArray(res?.data?.data)) dv360List = res.data.data;
        else if (Array.isArray(res?.audiences)) dv360List = res.audiences;
        // Normalize fields
        dv360List = dv360List.map((a) => ({
          ...a,
          _id: a._id || a.id || String(a.dv360AudienceId || ""),
          displayName: a.displayName || a.name || `DV360 Audience ${a.dv360AudienceId || ""}`,
          audienceCategory: a.audienceCategory || "CUSTOMER_MATCH",
          createdAt: a.createdAt || new Date().toISOString(),
        }));
      } catch (e) {
        console.warn("DV360 API fetch error:", e.message);
      }

      // Fetch campaign/standard audiences from API
      let standardList = [];
      try {
        const stdRes = await getAudience("");
        if (Array.isArray(stdRes?.data)) {
          standardList = stdRes.data.map((a) => ({
            _id: String(a._id),
            dv360AudienceId: a.campaignId || a.insertionOrderId || String(a._id).slice(-8),
            displayName: a.reportName || a.name || `Campaign Audience — ${a.advertiserId || ""}`,
            description: a.campaignType ? `Campaign Type: ${a.campaignType}` : "",
            advertiserId: a.advertiserId,
            audienceCategory: "CAMPAIGN_AUDIENCE",
            audienceType: a.campaignType || "STANDARD",
            memberCountUploaded: 0,
            createdAt: a.createdAt || new Date().toISOString(),
          }));
        }
      } catch (e) {
        console.warn("Standard audience API fetch error:", e.message);
      }

      // Merge both API lists + any created audiences in current state
      setExistingAudiences((prev) => {
        const mergedMap = new Map();
        // Keep locally created audiences in session
        prev.forEach((a) => {
          const key = String(a._id || a.dv360AudienceId || a.displayName || "");
          if (key) mergedMap.set(key, a);
        });
        standardList.forEach((a) => {
          const key = String(a._id || a.dv360AudienceId || a.displayName || "");
          if (key) mergedMap.set(key, { ...mergedMap.get(key), ...a });
        });
        dv360List.forEach((a) => {
          const key = String(a._id || a.dv360AudienceId || a.displayName || "");
          if (key) mergedMap.set(key, { ...mergedMap.get(key), ...a });
        });

        const combined = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );

        try {
          localStorage.setItem("dv360_saved_audiences", JSON.stringify(combined));
        } catch (e) {}

        return combined;
      });
    } catch (err) {
      console.warn("fetchExistingAudiences error:", err);
    } finally {
      setIsLoadingAudiences(false);
    }
  }, []);

  // Clear stale localStorage cache immediately on mount, then fetch fresh data from API
  useEffect(() => {
    try { localStorage.removeItem("dv360_saved_audiences"); } catch (e) {}
    fetchExistingAudiences();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch when user switches to the existing list tab
  useEffect(() => {
    if (mode === "select") {
      fetchExistingAudiences();
    }
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps


  // Fetch live Google Audiences for active advertiser and merge with catalog
  const fetchLiveGoogleAudiences = async () => {
    if (!activeAdvertiser) return;
    setIsLoadingGoogleAudiences(true);
    try {
      const res = await getGoogleAudiences({
        advertiserId: activeAdvertiser,
        pageSize: 100,
      });

      const liveList = res?.data?.googleAudiences || (Array.isArray(res?.data) ? res.data : []);
      if (Array.isArray(liveList) && liveList.length > 0) {
        const existingIds = new Set(liveList.map((a) => String(a.googleAudienceId || a.id)));
        const nonDuplicatePredefined = POPULAR_GOOGLE_AUDIENCES.filter(
          (item) => !existingIds.has(String(item.googleAudienceId))
        );
        setMasterGoogleAudiences([...liveList, ...nonDuplicatePredefined]);
      }
    } catch (err) {
      console.warn("Google Audiences live fetch notice:", err.message);
      setMasterGoogleAudiences(POPULAR_GOOGLE_AUDIENCES);
    } finally {
      setIsLoadingGoogleAudiences(false);
    }
  };

  useEffect(() => {
    if (audienceSource === "google-interest" && activeAdvertiser) {
      fetchLiveGoogleAudiences();
    }
  }, [activeAdvertiser, audienceSource]);

  // Quick Select All Visible
  const handleSelectAllVisible = () => {
    const existingIds = new Set(selectedGoogleAudiences.map((a) => a.googleAudienceId));
    const newItems = filteredGoogleAudiences.filter((item) => !existingIds.has(item.googleAudienceId));
    setSelectedGoogleAudiences([...selectedGoogleAudiences, ...newItems]);
    topTost(`Selected ${newItems.length} audience segments`, "success");
  };

  // Clear Selection
  const handleClearSelectedAudiences = () => {
    setSelectedGoogleAudiences([]);
  };

  // Toggle selection of a Google Audience
  const handleToggleGoogleAudience = (aud) => {
    const exists = selectedGoogleAudiences.find((a) => a.googleAudienceId === aud.googleAudienceId);
    if (exists) {
      setSelectedGoogleAudiences(selectedGoogleAudiences.filter((a) => a.googleAudienceId !== aud.googleAudienceId));
    } else {
      setSelectedGoogleAudiences([...selectedGoogleAudiences, aud]);
    }
  };

  // Add custom keyword
  const handleAddKeyword = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const kw = keywordInput.trim();
      if (kw && !customKeywords.includes(kw)) {
        setCustomKeywords([...customKeywords, kw]);
        setKeywordInput("");
      }
    }
  };

  const handleRemoveKeyword = (kw) => {
    setCustomKeywords(customKeywords.filter((k) => k !== kw));
  };

  // Add custom URL
  const handleAddUrl = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      let u = urlInput.trim();
      if (u) {
        if (!u.startsWith("http://") && !u.startsWith("https://")) {
          u = "https://" + u;
        }
        if (!customUrls.includes(u)) {
          setCustomUrls([...customUrls, u]);
          setUrlInput("");
        }
      }
    }
  };

  const handleRemoveUrl = (u) => {
    setCustomUrls(customUrls.filter((x) => x !== u));
  };

  // Parse raw text into member items (Customer Match)
  useEffect(() => {
    if (!rawTextData.trim()) {
      setParsedMembers([]);
      setPreviewData(null);
      return;
    }

    const lines = rawTextData
      .split(/[\r\n,;]+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const items = lines.map((val) => {
      if (audienceType === "CUSTOMER_MATCH_DEVICE_ID") {
        return val;
      }
      if (val.includes("@")) {
        return { email: val };
      } else {
        return { phone: val };
      }
    });

    setParsedMembers(items);
  }, [rawTextData, audienceType]);

  // Handle CSV file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
        if (lines.length === 0) return;

        const firstLine = lines[0].toLowerCase();
        const hasHeader =
          firstLine.includes("email") ||
          firstLine.includes("phone") ||
          firstLine.includes("device") ||
          firstLine.includes("idfa") ||
          firstLine.includes("gaid");

        const dataRows = hasHeader ? lines.slice(1) : lines;
        const membersList = [];

        dataRows.forEach((row) => {
          const cols = row.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
          if (cols.length === 0 || !cols[0]) return;

          if (audienceType === "CUSTOMER_MATCH_DEVICE_ID") {
            membersList.push(cols[0]);
          } else {
            const item = {};
            if (cols[0].includes("@")) {
              item.email = cols[0];
              if (cols[1]) item.phone = cols[1];
            } else {
              item.phone = cols[0];
            }
            if (cols[2]) item.firstName = cols[2];
            if (cols[3]) item.lastName = cols[3];
            if (cols[4]) item.countryCode = cols[4];
            if (cols[5]) item.zipCode = cols[5];

            membersList.push(item);
          }
        });

        setParsedMembers(membersList);
        topTost(`Loaded ${membersList.length} records from ${file.name}`, "success");
      } catch (err) {
        console.error("Error reading file:", err);
        topTost("Failed to parse file. Please verify CSV format.", "error");
      }
    };

    reader.readAsText(file);
  };

  // Preview SHA-256 Hashing
  const handlePreviewHash = async () => {
    if (parsedMembers.length === 0) {
      topTost("Please enter or upload members first", "warning");
      return;
    }

    setIsPreviewing(true);
    try {
      const res = await previewHashedMembers({
        entries: parsedMembers.slice(0, 50),
        audienceType,
      });
      if (res && (res.status === "success" || res.success)) {
        setPreviewData(res);
        topTost(`Successfully previewed hash for ${res.validCount} valid entries`, "success");
      }
    } catch (err) {
      topTost("Preview hash failed: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setIsPreviewing(false);
    }
  };

  // Download sample CSV template
  const downloadSampleTemplate = () => {
    let content = "";
    if (audienceType === "CUSTOMER_MATCH_DEVICE_ID") {
      content = "device_id\n2361d7da-784e-4e32-a6d0-e662d11d32fe\n38400000-8cf0-11bd-b23e-10b96e40000d\n";
    } else {
      content = "email,phone,firstName,lastName,countryCode,zipCode\njohn.doe@example.com,+14155552671,John,Doe,US,94043\nsarah.smith@example.com,+919876543210,Sarah,Smith,IN,110001\n";
    }

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `dv360_sample_${audienceType.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit and Create Audience
  const handleCreateAudience = async (e) => {
    e.preventDefault();

    if (!activeAdvertiser) {
      topTost("Please select or enter a DV360 Advertiser ID", "warning");
      return;
    }

    if (!displayName.trim()) {
      topTost("Please enter an Audience Name", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      let result = null;

      // ── SOURCE 1: CUSTOMER MATCH ──────────────────────────────────────────
      if (audienceSource === "customer-match") {
        const payload = {
          advertiserId: activeAdvertiser,
          displayName: displayName.trim(),
          campaignName: campaignName.trim(),
          description: description.trim(),
          audienceType,
          membershipDurationDays: Number(membershipDurationDays),
          members: parsedMembers,
          consent: {
            adUserData: adUserDataConsent,
            adPersonalization: adPersonalizationConsent,
          },
        };

        result = await createDV360CustomerMatchAudience(payload);
      } 
      // ── SOURCE 2: GOOGLE INTEREST & IN-MARKET ──────────────────────────────
      else if (audienceSource === "google-interest") {
        if (selectedGoogleAudiences.length === 0) {
          topTost("Please select at least 1 Google Audience segment", "warning");
          setIsSubmitting(false);
          return;
        }

        const payload = {
          advertiserId: activeAdvertiser,
          displayName: displayName.trim(),
          campaignName: campaignName.trim(),
          description: description.trim(),
          audienceCategory: "GOOGLE_INTEREST",
          audienceType: "GOOGLE_INTEREST_GROUP",
          googleAudiences: selectedGoogleAudiences,
        };

        result = await createGoogleInterestAudience(payload);
      }
      // ── SOURCE 3: CUSTOM INTENT ────────────────────────────────────────────
      else if (audienceSource === "custom-intent") {
        if (customKeywords.length === 0 && customUrls.length === 0) {
          topTost("Please add at least 1 keyword or URL for custom intent", "warning");
          setIsSubmitting(false);
          return;
        }

        const payload = {
          advertiserId: activeAdvertiser,
          displayName: displayName.trim(),
          campaignName: campaignName.trim(),
          description: description.trim(),
          audienceCategory: "CUSTOM_INTENT",
          audienceType: "GOOGLE_CUSTOM_INTENT",
          customKeywords,
          customUrls,
        };

        result = await createGoogleInterestAudience(payload);
      }

      const resData = result?.data || {};
      const newAudience = {
        _id: resData._id || resData.id || `aud_${Date.now()}`,
        dv360AudienceId: resData.dv360AudienceId || resData.googleAudienceId || resData.audienceId || String(Date.now()).slice(-8),
        displayName: displayName.trim(),
        campaignName: campaignName.trim() || undefined,
        description: description.trim(),
        advertiserId: activeAdvertiser,
        audienceCategory:
          audienceSource === "google-interest"
            ? "GOOGLE_INTEREST"
            : audienceSource === "custom-intent"
            ? "CUSTOM_INTENT"
            : "CUSTOMER_MATCH",
        audienceType: audienceType,
        membershipDurationDays: Number(membershipDurationDays),
        memberCountUploaded: parsedMembers.length,
        googleAudiences: selectedGoogleAudiences,
        customKeywords: customKeywords,
        customUrls: customUrls,
        createdAt: new Date().toISOString(),
        ...resData,
      };

      setCreatedResult(newAudience);
      setSelectedAudience(newAudience);
      try {
        localStorage.setItem("selectedAudience", JSON.stringify(newAudience));
      } catch (e) {}

      if (onAudienceSelected) {
        onAudienceSelected(newAudience);
      }

      // Optimistically add to existingAudiences list and persist
      setExistingAudiences((prev) => {
        const filtered = prev.filter(
          (a) =>
            (a._id || a.dv360AudienceId) !==
            (newAudience._id || newAudience.dv360AudienceId)
        );
        const updated = [newAudience, ...filtered];
        try {
          localStorage.setItem("dv360_saved_audiences", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      topTost(
        result?.message || `Audience "${newAudience.displayName}" created! View it in the Existing List.`,
        "success"
      );

      // Switch to "select" mode so the user sees the newly created audience in the table
      setMode("select");

      // Background sync with backend (non-blocking)
      fetchExistingAudiences();
    } catch (err) {
      console.error("Audience creation error:", err);
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message;
      topTost(`Audience Error: ${errMsg}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Select an existing audience from the list
  const handleSelectAudience = (aud) => {
    const isCurrent =
      selectedAudience &&
      ((selectedAudience._id && selectedAudience._id === aud._id) ||
        (selectedAudience.dv360AudienceId &&
          selectedAudience.dv360AudienceId === aud.dv360AudienceId));

    if (isCurrent) {
      setSelectedAudience(null);
      try {
        localStorage.removeItem("selectedAudience");
      } catch (e) {}
      if (onAudienceSelected) {
        onAudienceSelected(null);
      }
      topTost(`Deselected audience: ${aud.displayName || aud.reportName}`, "info");
    } else {
      setSelectedAudience(aud);
      try {
        localStorage.setItem("selectedAudience", JSON.stringify(aud));
      } catch (e) {}
      if (onAudienceSelected) {
        onAudienceSelected(aud);
      }
      topTost(`Selected audience: ${aud.displayName || aud.reportName}`, "success");
    }
  };

  // Delete audience from both backend and frontend
  const handleDeleteAudience = async (aud) => {
    const targetId = aud._id || aud.dv360AudienceId || aud.id;
    setIsDeletingId(targetId);
    try {
      // 1. Delete from Backend (DV360 and standard audience route)
      try {
        await deleteDV360CustomerMatchAudience(targetId, aud.advertiserId);
      } catch (beErr) {
        console.warn("DV360 route delete note, trying fallback delete:", beErr.message);
        await deleteAudience(targetId);
      }

      // 2. Remove from frontend list
      setExistingAudiences((prev) => {
        const updated = prev.filter(
          (a) => (a._id || a.dv360AudienceId || a.id) !== targetId
        );
        try {
          localStorage.setItem("dv360_saved_audiences", JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // 3. Clear selected audience if it was this audience
      if (
        selectedAudience &&
        (selectedAudience._id === targetId ||
          selectedAudience.dv360AudienceId === targetId)
      ) {
        setSelectedAudience(null);
        try {
          localStorage.removeItem("selectedAudience");
        } catch (e) {}
        if (onAudienceSelected) {
          onAudienceSelected(null);
        }
      }

      topTost(
        `Audience "${aud.displayName || aud.reportName || targetId}" deleted successfully`,
        "success"
      );
      setConfirmDeleteAud(null);
    } catch (err) {
      console.error("Delete audience error:", err);
      topTost(`Failed to delete audience: ${err.message}`, "error");
    } finally {
      setIsDeletingId(null);
    }
  };

  // Proceed to Step 2
  const handleProceed = () => {
    if (!selectedAudience) {
      topTost("Please create or select an audience before proceeding", "warning");
      return;
    }
    onNext();
  };

  return (
    <div className="audience-creation-step animate-fadeIn">
      {/* Top Banner with Google DV360 Customer Match & Google Audiences info */}
      <div
        className="card border-0 rounded-4 mb-4 p-4 text-white shadow-sm position-relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)",
        }}
      >
        <div className="row align-items-center position-relative z-1">
          <div className="col-lg-8">
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-white/20 text-white rounded-pill px-3 py-1 fw-semibold" style={{ backdropFilter: "blur(4px)" }}>
                Google Display & Video 360 API
              </span>
              <span className="badge bg-success text-white rounded-pill px-2.5 py-1">
                Customer Match & Google Audiences
              </span>
            </div>
            <h4 className="fw-bold text-white mb-2">
              Audience Studio & Targeting Hub
            </h4>
            <p className="text-white/90 mb-0 fs-14" style={{ maxWidth: "680px" }}>
              Target users with 1st-party Customer Match (hashed emails/phones/mobile IDs), Google Interest & Affinity audiences, In-Market high-intent buyers, or Custom Intent keywords.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end mt-3 mt-lg-0 position-relative" style={{ zIndex: 10 }}>
            <div className="btn-group bg-white/10 p-1 rounded-pill" style={{ backdropFilter: "blur(6px)", position: "relative", zIndex: 10 }}>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                  mode === "create" ? "btn-light text-primary shadow-sm" : "text-white border-0"
                }`}
                onClick={() => setMode("create")}
                style={{ cursor: "pointer", position: "relative", zIndex: 11 }}
              >
                <FiPlus className="me-1" /> Create New
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                  mode === "select" ? "btn-light text-primary shadow-sm" : "text-white border-0"
                }`}
                onClick={() => {
                  setMode("select");
                }}
                style={{ cursor: "pointer", position: "relative", zIndex: 11 }}
              >
                <FiDatabase className="me-1" />
                {isLoadingAudiences ? (
                  <span>Existing List <span className="opacity-75">(...)</span></span>
                ) : (
                  <span>Existing List ({existingAudiences.length})</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Subtle decorative circles */}
        <div
          className="position-absolute rounded-circle"
          style={{
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
            top: "-100px",
            right: "-50px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
      </div>

      {/* Selected Audience Alert / Status */}
      {selectedAudience && (
        <div
          className="alert alert-success border-success-subtle rounded-4 p-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3 shadow-xs animate-fadeIn"
          style={{ background: "#f0fdf4" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle bg-success text-white flex-shrink-0"
              style={{ width: "42px", height: "42px" }}
            >
              <FiCheckCircle size={24} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <div className="fw-bold text-success-emphasis fs-15">
                  Active Audience Selected: {selectedAudience.displayName || selectedAudience.reportName}
                </div>
                <span className="badge bg-success text-white rounded-pill fs-10 px-2 py-0.5">
                  Step 1 Ready
                </span>
              </div>
              <div className="text-muted small">
                Type: <strong className="text-dark">{selectedAudience.audienceCategory || selectedAudience.audienceType}</strong> | 
                DV360 ID: <strong className="text-dark">{selectedAudience.dv360AudienceId || "Saved"}</strong> | 
                Advertiser: <span className="text-dark">{selectedAudience.advertiserId}</span> | 
                Size: <span className="text-dark">{selectedAudience.memberCountUploaded ? `${selectedAudience.memberCountUploaded.toLocaleString()} members` : selectedAudience.googleAudiences?.length ? `${selectedAudience.googleAudiences.length} segments` : "Configured"}</span>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("select")}
              className="btn btn-outline-success btn-sm rounded-pill px-3 fw-semibold"
            >
              View in List
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedAudience(null);
                try { localStorage.removeItem("selectedAudience"); } catch (e) {}
                if (onAudienceSelected) onAudienceSelected(null);
                topTost("Audience selection cleared", "info");
              }}
              className="btn btn-outline-secondary btn-sm rounded-pill px-2.5 text-muted"
              title="Clear active audience"
            >
              <FiX size={15} /> Clear
            </button>
            <button
              type="button"
              onClick={handleProceed}
              className="btn btn-success rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
            >
              Proceed to Creative Studio <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* MODE 1: CREATE AUDIENCE (CUSTOMER MATCH / GOOGLE INTEREST / CUSTOM INTENT) */}
      {mode === "create" && (
        <div>
          {/* Audience Type Selection Cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <div
                onClick={() => {
                  setAudienceSource("customer-match");
                  if (!displayName.includes("Google") && !displayName.includes("Custom")) {
                    // keep
                  }
                }}
                className={`p-3 rounded-4 border h-100 cursor-pointer transition-all ${
                  audienceSource === "customer-match"
                    ? "border-primary bg-primary-subtle/10 shadow-sm"
                    : "border-light-subtle bg-white hover-shadow"
                }`}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="p-2 rounded-3 bg-primary text-white">
                    <FiUsers size={20} />
                  </div>
                  {audienceSource === "customer-match" && (
                    <span className="badge bg-primary text-white rounded-pill fs-10">Active</span>
                  )}
                </div>
                <h6 className="fw-bold text-dark mb-1 fs-14">Customer Match (1st Party)</h6>
                <p className="text-muted fs-12 mb-0">
                  Upload customer emails, phone numbers, or mobile device IDs (GAID/IDFA) with SHA-256 compliance.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div
                onClick={() => setAudienceSource("google-interest")}
                className={`p-3 rounded-4 border h-100 cursor-pointer transition-all ${
                  audienceSource === "google-interest"
                    ? "border-primary bg-primary-subtle/10 shadow-sm"
                    : "border-light-subtle bg-white hover-shadow"
                }`}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="p-2 rounded-3 bg-success text-white">
                    <FiGlobe size={20} />
                  </div>
                  {audienceSource === "google-interest" && (
                    <span className="badge bg-success text-white rounded-pill fs-10">Active</span>
                  )}
                </div>
                <h6 className="fw-bold text-dark mb-1 fs-14">Google Interest & In-Market</h6>
                <p className="text-muted fs-12 mb-0">
                  Target pre-built Google Affinity audiences (hobbies/habits) and In-Market high-intent buyer segments.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div
                onClick={() => setAudienceSource("custom-intent")}
                className={`p-3 rounded-4 border h-100 cursor-pointer transition-all ${
                  audienceSource === "custom-intent"
                    ? "border-primary bg-primary-subtle/10 shadow-sm"
                    : "border-light-subtle bg-white hover-shadow"
                }`}
                style={{ cursor: "pointer" }}
              >
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <div className="p-2 rounded-3 bg-warning text-dark">
                    <FiZap size={20} />
                  </div>
                  {audienceSource === "custom-intent" && (
                    <span className="badge bg-warning text-dark rounded-pill fs-10">Active</span>
                  )}
                </div>
                <h6 className="fw-bold text-dark mb-1 fs-14">Custom Intent (Keywords & URLs)</h6>
                <p className="text-muted fs-12 mb-0">
                  Target audiences actively searching specific keywords or browsing related industry/competitor websites.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleCreateAudience}>
            <div className="row g-4">
              {/* Left Column: Basic Details & Advertiser Selection */}
              <div className="col-lg-5">
                <div className="card border-0 shadow-sm rounded-4 h-100 p-4" style={{ background: "#ffffff" }}>
                  <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                      <FiUsers className="text-primary" /> 1. Audience Information
                    </h6>
                    <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 small">
                      {audienceSource === "customer-match"
                        ? "1st-Party CRM"
                        : audienceSource === "google-interest"
                        ? "Google Catalog"
                        : "Custom Intent"}
                    </span>
                  </div>

                  {/* Advertiser Selection */}
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
                        placeholder="e.g. 7827939113"
                        value={manualAdvertiserId}
                        onChange={(e) => setManualAdvertiserId(e.target.value)}
                        required
                      />
                    ) : (
                      <select
                        className="form-select rounded-3 py-2"
                        value={selectedAdvertiserId}
                        onChange={(e) => setSelectedAdvertiserId(e.target.value)}
                        required
                      >
                        <option value="">-- Choose Advertiser --</option>
                        {Array.isArray(advertisers) &&
                          advertisers.map((adv) => (
                            <option key={adv._id || adv.advertise_id} value={adv.advertise_id}>
                              {adv.advertiser_name} ({adv.advertise_id})
                            </option>
                          ))}
                      </select>
                    )}
                  </div>

                  {/* Audience Display Name */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark fs-13">
                      Audience Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control rounded-3 py-2"
                      placeholder={
                        audienceSource === "customer-match"
                          ? "e.g. High Value Customers Q3"
                          : audienceSource === "google-interest"
                          ? "e.g. Luxury Auto & Tech Buyers Group"
                          : "e.g. SUV & EV High Intent Searches"
                      }
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Campaign Name — tags this audience to a campaign for reuse */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark fs-13">
                      Campaign Name
                      <span className="text-muted fw-normal fs-11 ms-1">(optional — helps reuse audiences per campaign)</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FiTarget size={14} className="text-primary" />
                      </span>
                      <input
                        type="text"
                        className="form-control rounded-end-3 py-2 border-start-0"
                        placeholder="e.g. Summer 2026 Launch, Black Friday, Q4 Retention"
                        value={campaignName}
                        onChange={(e) => setCampaignName(e.target.value)}
                      />
                    </div>
                    {campaignName.trim() && (
                      <div className="mt-1">
                        <span className="badge bg-primary-subtle text-primary rounded-pill fs-10 px-2.5 py-1">
                          📁 Campaign: {campaignName.trim()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Audience Description */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark fs-13">
                      Description (Optional)
                    </label>
                    <textarea
                      rows={2}
                      className="form-control rounded-3 py-2"
                      placeholder="Add strategic notes or segment details..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  {/* Source Specific Settings */}
                  {audienceSource === "customer-match" && (
                    <>
                      {/* Audience Type Selection */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark fs-13">
                          Match Type <span className="text-danger">*</span>
                        </label>
                        <div className="row g-2">
                          <div className="col-6">
                            <div
                              onClick={() => setAudienceType("CUSTOMER_MATCH_CONTACT_INFO")}
                              className={`p-2.5 rounded-3 border text-center cursor-pointer transition-all ${
                                audienceType === "CUSTOMER_MATCH_CONTACT_INFO"
                                  ? "border-primary bg-primary-subtle/10 text-primary shadow-xs fw-bold"
                                  : "border-light-subtle bg-light text-muted"
                              }`}
                              style={{ cursor: "pointer" }}
                            >
                              <FiFileText size={18} className="mb-1" />
                              <div className="fs-12">Contact Info</div>
                              <div className="fs-10 text-muted">Email, Phone, Name</div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div
                              onClick={() => setAudienceType("CUSTOMER_MATCH_DEVICE_ID")}
                              className={`p-2.5 rounded-3 border text-center cursor-pointer transition-all ${
                                audienceType === "CUSTOMER_MATCH_DEVICE_ID"
                                  ? "border-primary bg-primary-subtle/10 text-primary shadow-xs fw-bold"
                                  : "border-light-subtle bg-light text-muted"
                              }`}
                              style={{ cursor: "pointer" }}
                            >
                              <FiUsers size={18} className="mb-1" />
                              <div className="fs-12">Device IDs</div>
                              <div className="fs-10 text-muted">IDFA, GAID / AAID</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Membership Duration Days */}
                      <div className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <label className="form-label fw-semibold text-dark mb-0 fs-13">
                            Duration
                          </label>
                          <span className="badge bg-secondary-subtle text-secondary fw-bold">
                            {membershipDurationDays} Days
                          </span>
                        </div>
                        <input
                          type="range"
                          className="form-range"
                          min="1"
                          max="540"
                          step="1"
                          value={membershipDurationDays}
                          onChange={(e) => setMembershipDurationDays(e.target.value)}
                        />
                      </div>

                      {/* Google Consent Controls */}
                      <div className="p-3 rounded-3 bg-light border border-light-subtle">
                        <div className="d-flex align-items-center gap-2 mb-2 text-dark fw-bold fs-12">
                          <FiLock className="text-primary" /> Google Consent Mode Signals
                        </div>
                        <div className="form-check form-switch mb-1">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="adUserDataSwitch"
                            checked={adUserDataConsent === "CONSENT_STATUS_GRANTED"}
                            onChange={(e) =>
                              setAdUserDataConsent(
                                e.target.checked ? "CONSENT_STATUS_GRANTED" : "CONSENT_STATUS_DENIED"
                              )
                            }
                          />
                          <label className="form-check-label fs-11 text-dark" htmlFor="adUserDataSwitch">
                            User Data Consent (ad_user_data: Granted)
                          </label>
                        </div>
                        <div className="form-check form-switch mb-0">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id="adPersonalizationSwitch"
                            checked={adPersonalizationConsent === "CONSENT_STATUS_GRANTED"}
                            onChange={(e) =>
                              setAdPersonalizationConsent(
                                e.target.checked ? "CONSENT_STATUS_GRANTED" : "CONSENT_STATUS_DENIED"
                              )
                            }
                          />
                          <label className="form-check-label fs-11 text-dark" htmlFor="adPersonalizationSwitch">
                            Ad Personalization (ad_personalization: Granted)
                          </label>
                        </div>
                      </div>
                    </>
                  )}

                  {audienceSource === "google-interest" && (
                    <div className="p-3 rounded-3 bg-light border border-light-subtle">
                      <div className="fw-bold text-dark fs-12 mb-1">
                        🎯 Selected Google Segments: {selectedGoogleAudiences.length}
                      </div>
                      {selectedGoogleAudiences.length === 0 ? (
                        <div className="text-muted fs-11">
                          Select one or more Affinity / In-Market segments from the right panel.
                        </div>
                      ) : (
                        <div className="d-flex flex-wrap gap-1.5 mt-2" style={{ maxHeight: "140px", overflowY: "auto" }}>
                          {selectedGoogleAudiences.map((aud) => (
                            <span
                              key={aud.googleAudienceId}
                              className="badge bg-primary text-white d-flex align-items-center gap-1 fs-11 py-1 px-2 rounded-pill"
                            >
                              {aud.displayName}
                              <FiX
                                className="cursor-pointer"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleToggleGoogleAudience(aud)}
                              />
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {audienceSource === "custom-intent" && (
                    <div className="p-3 rounded-3 bg-light border border-light-subtle">
                      <div className="fw-bold text-dark fs-12 mb-1">
                        ⚡ Custom Intent Signals Summary
                      </div>
                      <div className="text-muted fs-11 mb-2">
                        {customKeywords.length} Keywords • {customUrls.length} Reference URLs
                      </div>
                      <div className="d-flex flex-wrap gap-1" style={{ maxHeight: "120px", overflowY: "auto" }}>
                        {customKeywords.map((kw) => (
                          <span key={kw} className="badge bg-warning text-dark fs-11 rounded-pill">
                            {kw}
                          </span>
                        ))}
                        {customUrls.map((u) => (
                          <span key={u} className="badge bg-info text-white fs-11 rounded-pill text-truncate" style={{ maxWidth: "180px" }}>
                            {u.replace(/^https?:\/\//, "")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Source Interactive Workspace */}
              <div className="col-lg-7">
                {/* 1. CUSTOMER MATCH INGESTION */}
                {audienceSource === "customer-match" && (
                  <div className="card border-0 shadow-sm rounded-4 h-100 p-4" style={{ background: "#ffffff" }}>
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                      <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                        <FiUploadCloud className="text-primary" /> 2. Customer Match Ingestion
                      </h6>
                      <button
                        type="button"
                        onClick={downloadSampleTemplate}
                        className="btn btn-sm btn-outline-secondary rounded-pill px-2.5 py-0.5 fs-11 d-flex align-items-center gap-1"
                      >
                        <FiDownload /> Template
                      </button>
                    </div>

                    {/* Upload Tabs */}
                    <ul className="nav nav-pills nav-fill mb-3 bg-light p-1 rounded-pill">
                      <li className="nav-item">
                        <button
                          type="button"
                          className={`nav-link rounded-pill py-1.5 fs-12 fw-semibold ${
                            uploadTab === "paste" ? "active bg-white text-primary shadow-xs" : "text-muted"
                          }`}
                          onClick={() => setUploadTab("paste")}
                        >
                          <FiFileText className="me-1" /> Paste List / Text
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          type="button"
                          className={`nav-link rounded-pill py-1.5 fs-12 fw-semibold ${
                            uploadTab === "file" ? "active bg-white text-primary shadow-xs" : "text-muted"
                          }`}
                          onClick={() => setUploadTab("file")}
                        >
                          <FiUploadCloud className="me-1" /> Upload CSV / TXT
                        </button>
                      </li>
                    </ul>

                    {uploadTab === "paste" ? (
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark fs-13">
                          Paste {audienceType === "CUSTOMER_MATCH_DEVICE_ID" ? "Device IDs" : "Emails or Phones"} (one per line)
                        </label>
                        <textarea
                          rows={6}
                          className="form-control rounded-3 font-monospace fs-12"
                          placeholder={
                            audienceType === "CUSTOMER_MATCH_DEVICE_ID"
                              ? "2361d7da-784e-4e32-a6d0-e662d11d32fe\n38400000-8cf0-11bd-b23e-10b96e40000d"
                              : "user1@example.com\n+14155552671\nuser2@example.com"
                          }
                          value={rawTextData}
                          onChange={(e) => setRawTextData(e.target.value)}
                        />
                      </div>
                    ) : (
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark fs-13">
                          Upload CSV / TXT Data File
                        </label>
                        <div
                          className="border border-2 border-dashed rounded-4 p-4 text-center bg-light/40 hover-shadow transition-all"
                          style={{ borderColor: "#cbd5e1" }}
                        >
                          <FiUploadCloud size={36} className="text-primary mb-2" />
                          <div className="fw-semibold text-dark fs-13">
                            Drag & Drop or Click to Upload
                          </div>
                          <div className="text-muted fs-11 mb-3">
                            Accepts .csv or .txt (Max 50MB). Raw entries hashed with SHA-256 automatically.
                          </div>
                          <input
                            type="file"
                            accept=".csv,.txt"
                            className="form-control d-none"
                            id="csvFileInput"
                            onChange={handleFileUpload}
                          />
                          <label htmlFor="csvFileInput" className="btn btn-sm btn-primary rounded-pill px-4">
                            Choose File
                          </label>
                          {fileName && (
                            <div className="mt-2 text-success fw-semibold fs-12">
                              <FiCheckCircle className="me-1" /> Loaded: {fileName}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Summary & SHA-256 Preview */}
                    <div className="p-3 rounded-3 bg-light border d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                      <div>
                        <span className="text-muted fs-11 d-block">Parsed Entries</span>
                        <strong className="text-dark fs-16">{parsedMembers.length}</strong>{" "}
                        <span className="text-muted fs-11">members ready</span>
                      </div>

                      <button
                        type="button"
                        disabled={parsedMembers.length === 0 || isPreviewing}
                        onClick={handlePreviewHash}
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 d-flex align-items-center gap-1.5"
                      >
                        {isPreviewing ? (
                          <span className="spinner-border spinner-border-sm" />
                        ) : (
                          <FiEye />
                        )}
                        Verify SHA-256 Hash
                      </button>
                    </div>

                    {/* Submit */}
                    <div className="mt-auto pt-3 border-top d-flex justify-content-end">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm" /> Creating in DV360...
                          </>
                        ) : (
                          <>
                            <FiCheckCircle /> Create Audience in DV360
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. GOOGLE INTEREST & IN-MARKET AUDIENCES EXPLORER */}
                {audienceSource === "google-interest" && (
                  <div className="card border-0 shadow-sm rounded-4 h-100 p-4" style={{ background: "#ffffff" }}>
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                      <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                        <FiGlobe className="text-success" /> 2. Browse Google Interest & In-Market Catalog
                      </h6>
                      <span className="badge bg-success-subtle text-success rounded-pill px-3 py-1.5 fs-12 fw-semibold">
                        {filteredGoogleAudiences.length} of {masterGoogleAudiences.length} Segments
                      </span>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-3">
                      <div className="input-group input-group-sm mb-2">
                        <span className="input-group-text bg-white border-end-0 text-muted">
                          <FiSearch size={15} />
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 border-end-0 shadow-none ps-0"
                          placeholder="Search Google audiences (e.g. Auto, Tech, Real Estate, Gamers)..."
                          value={googleAudienceSearch}
                          onChange={(e) => setGoogleAudienceSearch(e.target.value)}
                        />
                        {googleAudienceSearch && (
                          <button
                            type="button"
                            className="input-group-text bg-white border-start-0 text-muted cursor-pointer"
                            onClick={() => setGoogleAudienceSearch("")}
                            title="Clear search"
                          >
                            <FiX size={15} />
                          </button>
                        )}
                      </div>

                      {/* Filter pills */}
                      <div className="d-flex flex-wrap gap-1.5 pt-1">
                        {GOOGLE_CATEGORY_FILTERS.map((cat) => {
                          const isActive = googleAudienceTypeFilter === cat.id;
                          const count = categoryCounts[cat.id] ?? 0;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setGoogleAudienceTypeFilter(cat.id)}
                              className={`btn btn-xs rounded-pill px-2.5 py-1.5 fs-11 fw-semibold d-flex align-items-center gap-1.5 transition-all ${
                                isActive
                                  ? "btn-success text-white shadow-xs"
                                  : "btn-outline-secondary bg-white text-secondary hover-bg-light"
                              }`}
                              style={{
                                border: isActive ? "1.5px solid #16a34a" : "1.5px solid #e2e8f0",
                              }}
                            >
                              <span>{cat.icon}</span>
                              <span className="text-uppercase tracking-wider">{cat.label}</span>
                              <span
                                className={`badge rounded-pill ms-1 px-1.5 py-0.5 fs-10 ${
                                  isActive
                                    ? "bg-white text-success fw-bold"
                                    : "bg-light text-muted border"
                                }`}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick selection bar */}
                    <div className="d-flex align-items-center justify-content-between px-1 mb-2">
                      <span className="text-muted fs-11">
                        Showing <strong className="text-dark">{filteredGoogleAudiences.length}</strong> matching segments
                      </span>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none fs-11 text-primary fw-semibold"
                          onClick={handleSelectAllVisible}
                          disabled={filteredGoogleAudiences.length === 0}
                        >
                          + Select all visible
                        </button>
                        {selectedGoogleAudiences.length > 0 && (
                          <>
                            <span className="text-muted fs-11">•</span>
                            <button
                              type="button"
                              className="btn btn-link p-0 text-decoration-none fs-11 text-danger fw-semibold"
                              onClick={handleClearSelectedAudiences}
                            >
                              Clear selection ({selectedGoogleAudiences.length})
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Google Audiences List Grid */}
                    <div
                      className="border rounded-3 p-2.5 bg-light/30 overflow-auto mb-3"
                      style={{ maxHeight: "320px", minHeight: "220px" }}
                    >
                      {isLoadingGoogleAudiences ? (
                        <div className="text-center py-5">
                          <div className="spinner-border spinner-border-sm text-success mb-2" />
                          <div className="text-muted fs-12">Refreshing Google Audiences catalog...</div>
                        </div>
                      ) : filteredGoogleAudiences.length === 0 ? (
                        <div className="text-center py-5 text-muted fs-12">
                          <FiGlobe size={28} className="text-muted mb-2 opacity-50" />
                          <div>No Google Audiences matched your filter.</div>
                          <button
                            type="button"
                            className="btn btn-link btn-sm text-primary p-0 mt-1"
                            onClick={() => {
                              setGoogleAudienceSearch("");
                              setGoogleAudienceTypeFilter("all");
                            }}
                          >
                            Reset filters
                          </button>
                        </div>
                      ) : (
                        <div className="row g-2">
                          {filteredGoogleAudiences.map((aud) => {
                            const isSelected = !!selectedGoogleAudiences.find(
                              (a) => a.googleAudienceId === aud.googleAudienceId
                            );
                            const isAffinity = aud.googleAudienceType === "GOOGLE_AUDIENCE_TYPE_AFFINITY";
                            const isInMarket = aud.googleAudienceType === "GOOGLE_AUDIENCE_TYPE_IN_MARKET";
                            const isDemographic = aud.googleAudienceType === "GOOGLE_AUDIENCE_TYPE_EXTENDED_DEMOGRAPHIC";
                            const isLifeEvent = aud.googleAudienceType === "GOOGLE_AUDIENCE_TYPE_LIFE_EVENT";

                            return (
                              <div className="col-12 col-md-6" key={aud.googleAudienceId}>
                                <div
                                  onClick={() => handleToggleGoogleAudience(aud)}
                                  className={`p-2.5 rounded-3 border d-flex align-items-start gap-2.5 cursor-pointer transition-all ${
                                    isSelected
                                      ? "border-success bg-success-subtle/20 shadow-xs"
                                      : "border-light-subtle bg-white hover-shadow"
                                  }`}
                                  style={{ cursor: "pointer" }}
                                >
                                  <div className="pt-0.5">
                                    <input
                                      type="checkbox"
                                      className="form-check-input cursor-pointer"
                                      checked={isSelected}
                                      onChange={() => {}} // handled by parent div
                                      style={{ cursor: "pointer" }}
                                    />
                                  </div>
                                  <div className="flex-grow-1 overflow-hidden">
                                    <div className="fw-semibold text-dark fs-12 text-truncate" title={aud.displayName}>
                                      {aud.displayName}
                                    </div>
                                    <div className="d-flex align-items-center gap-1.5 mt-1">
                                      <span
                                        className="badge rounded-pill fs-10 px-2 py-0.5 fw-medium"
                                        style={{
                                          backgroundColor: isInMarket
                                            ? "#fef3c7"
                                            : isAffinity
                                            ? "#dbeafe"
                                            : isDemographic
                                            ? "#f3e8ff"
                                            : "#ffe4e6",
                                          color: isInMarket
                                            ? "#92400e"
                                            : isAffinity
                                            ? "#1e40af"
                                            : isDemographic
                                            ? "#6b21a8"
                                            : "#9f1239",
                                          border: `1px solid ${
                                            isInMarket
                                              ? "#fde68a"
                                              : isAffinity
                                              ? "#bfdbfe"
                                              : isDemographic
                                              ? "#e9d5ff"
                                              : "#fecdd3"
                                          }`,
                                        }}
                                      >
                                        {isInMarket
                                          ? "🎯 In-Market"
                                          : isAffinity
                                          ? "💡 Affinity"
                                          : isDemographic
                                          ? "🎓 Demographic"
                                          : "🌟 Life Event"}
                                      </span>
                                      <span className="text-muted fs-10 font-monospace">
                                        ID: {aud.googleAudienceId}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                      <div className="text-muted fs-12">
                        <strong className="text-dark">{selectedGoogleAudiences.length}</strong> segments selected
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting || selectedGoogleAudiences.length === 0}
                        className="btn btn-success rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm" /> Saving...
                          </>
                        ) : (
                          <>
                            <FiCheckCircle /> Save Google Audience Group
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. CUSTOM INTENT (KEYWORDS & URLS) */}
                {audienceSource === "custom-intent" && (
                  <div className="card border-0 shadow-sm rounded-4 h-100 p-4" style={{ background: "#ffffff" }}>
                    <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                      <h6 className="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                        <FiZap className="text-warning" /> 2. Custom Intent Keyword & URL Signals
                      </h6>
                      <span className="badge bg-warning-subtle text-dark rounded-pill px-2.5 py-1 small">
                        Intent Targeting
                      </span>
                    </div>

                    {/* Keyword input */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark fs-13 mb-1">
                        Search Keywords & Phrases
                      </label>
                      <div className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control rounded-start-3"
                          placeholder="e.g. best luxury suv 2026, ev charging price..."
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={handleAddKeyword}
                        />
                        <button
                          type="button"
                          onClick={handleAddKeyword}
                          className="btn btn-outline-primary px-3 rounded-end-3"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="d-flex flex-wrap gap-1.5" style={{ minHeight: "40px" }}>
                        {customKeywords.map((kw) => (
                          <span
                            key={kw}
                            className="badge bg-primary text-white d-flex align-items-center gap-1 fs-11 py-1 px-2.5 rounded-pill"
                          >
                            {kw}
                            <FiX
                              className="cursor-pointer"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleRemoveKeyword(kw)}
                            />
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* URL input */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold text-dark fs-13 mb-1">
                        Reference URLs / Competitor Websites
                      </label>
                      <div className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control rounded-start-3"
                          placeholder="e.g. competitor.com/suv-models, caranddriver.com..."
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          onKeyDown={handleAddUrl}
                        />
                        <button
                          type="button"
                          onClick={handleAddUrl}
                          className="btn btn-outline-primary px-3 rounded-end-3"
                        >
                          + Add URL
                        </button>
                      </div>
                      <div className="d-flex flex-wrap gap-1.5" style={{ minHeight: "40px" }}>
                        {customUrls.map((u) => (
                          <span
                            key={u}
                            className="badge bg-secondary text-white d-flex align-items-center gap-1 fs-11 py-1 px-2.5 rounded-pill text-truncate"
                            style={{ maxWidth: "260px" }}
                          >
                            {u.replace(/^https?:\/\//, "")}
                            <FiX
                              className="cursor-pointer"
                              style={{ cursor: "pointer" }}
                              onClick={() => handleRemoveUrl(u)}
                            />
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-auto pt-3 border-top d-flex justify-content-end">
                      <button
                        type="submit"
                        disabled={isSubmitting || (customKeywords.length === 0 && customUrls.length === 0)}
                        className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
                      >
                        {isSubmitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm" /> Saving Intent Profile...
                          </>
                        ) : (
                          <>
                            <FiCheckCircle /> Create Custom Intent Audience
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* MODE 2: SELECT EXISTING DV360 CUSTOMER MATCH AUDIENCES */}
      {mode === "select" && (
        <div className="card border-0 shadow-sm rounded-4 p-4" style={{ background: "#ffffff" }}>
          {/* Header & Controls Toolbar */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-3 border-bottom">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h5 className="fw-bold mb-0 text-dark">Saved Audiences & Targeting Profiles</h5>
                <span className="badge bg-primary text-white rounded-pill px-2.5 py-0.5 fs-11">
                  {filteredExistingAudiences.length} of {existingAudiences.length}
                </span>
              </div>
              <p className="text-muted fs-13 mb-0">
                Browse, select, or delete audiences created across all advertisers and targeting channels.
              </p>
            </div>

            <div className="d-flex flex-wrap align-items-center gap-2">
              {/* Advertiser filter dropdown */}
              <div className="d-flex align-items-center gap-1.5 bg-light p-1 rounded-pill border">
                <FiFilter className="text-muted ms-2" size={14} />
                <select
                  className="form-select form-select-sm border-0 bg-transparent py-1 pe-4 fs-12 fw-medium shadow-none cursor-pointer"
                  style={{ width: "170px" }}
                  value={listAdvertiserFilter}
                  onChange={(e) => setListAdvertiserFilter(e.target.value)}
                >
                  <option value="all">All Advertisers</option>
                  {Array.isArray(advertisers) &&
                    advertisers.map((adv) => (
                      <option key={adv._id || adv.advertise_id} value={adv.advertise_id}>
                        {adv.advertiser_name || adv.advertise_id}
                      </option>
                    ))}
                </select>
              </div>

              {/* Search input */}
              <div className="input-group input-group-sm" style={{ width: "220px" }}>
                <span className="input-group-text bg-light border-end-0 text-muted rounded-start-pill ps-3">
                  <FiSearch size={14} />
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 border-end-0 shadow-none ps-0 fs-12"
                  placeholder="Search audience name, ID..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                />
                {searchFilter && (
                  <button
                    type="button"
                    className="input-group-text bg-light border-start-0 text-muted cursor-pointer"
                    onClick={() => setSearchFilter("")}
                    title="Clear search"
                  >
                    <FiX size={14} />
                  </button>
                )}
                <span className="input-group-text bg-light border-start-0 rounded-end-pill"></span>
              </div>

              {/* Refresh button */}
              <button
                type="button"
                onClick={fetchExistingAudiences}
                disabled={isLoadingAudiences}
                className="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "34px", height: "34px" }}
                title="Refresh audiences list"
              >
                <FiRefreshCw className={isLoadingAudiences ? "spin" : ""} size={14} />
              </button>

              {/* Create New CTA */}
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-pill px-3 fw-semibold d-flex align-items-center gap-1 shadow-xs"
                onClick={() => setMode("create")}
              >
                <FiPlus size={15} /> Create New
              </button>
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="d-flex flex-wrap gap-1.5 mb-3">
            {SAVED_AUDIENCE_CATEGORY_FILTERS.map((cat) => {
              const isActive = listCategoryFilter === cat.id;
              let count = 0;
              if (cat.id === "all") {
                count = existingAudiences.length;
              } else {
                count = existingAudiences.filter((a) => {
                  const c = a.audienceCategory || (a.audienceType?.includes("CUSTOMER_MATCH") ? "CUSTOMER_MATCH" : "");
                  return c === cat.id || a.audienceType === cat.id;
                }).length;
              }

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setListCategoryFilter(cat.id)}
                  className={`btn btn-xs rounded-pill px-3 py-1.5 fs-11 fw-semibold transition-all ${
                    isActive
                      ? "btn-primary text-white shadow-xs"
                      : "btn-outline-secondary bg-white text-secondary hover-bg-light"
                  }`}
                  style={{
                    border: isActive ? "1.5px solid #2563eb" : "1.5px solid #e2e8f0",
                  }}
                >
                  {cat.label}
                  <span
                    className={`badge rounded-pill ms-1 px-1.5 py-0.5 fs-10 ${
                      isActive ? "bg-white text-primary fw-bold" : "bg-light text-muted border"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Inline loading indicator — table stays visible during background sync */}
          {/* Full loading state while API fetches */}
          {isLoadingAudiences ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-3" style={{ width: "2.5rem", height: "2.5rem", borderWidth: "3px" }} role="status" />
              <div className="fw-semibold text-dark mb-1 fs-14">Fetching Audiences from API...</div>
              <div className="text-muted fs-12">Loading your DV360 and campaign audiences</div>
            </div>
          ) : filteredExistingAudiences.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-4 border border-dashed p-4">
              <FiUsers size={44} className="text-muted mb-2 opacity-50" />
              <h6 className="fw-bold text-dark mb-1">
                {existingAudiences.length === 0
                  ? "No Audiences Found"
                  : "No Audiences Matched Your Filters"}
              </h6>
              <p className="text-muted fs-13 mb-3" style={{ maxWidth: "460px", margin: "0 auto" }}>
                {existingAudiences.length === 0
                  ? "You haven't created any audiences yet. Build your first Customer Match, Google Interest, or Custom Intent audience now."
                  : "Try resetting your search query, advertiser filter, or category tabs to see all saved audiences."}
              </p>
              <div className="d-flex justify-content-center gap-2">
                {existingAudiences.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                    onClick={() => {
                      setSearchFilter("");
                      setListAdvertiserFilter("all");
                      setListCategoryFilter("all");
                    }}
                  >
                    Reset Filters
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-sm rounded-pill px-4"
                  onClick={() => setMode("create")}
                >
                  <FiPlus className="me-1" /> Create New Audience
                </button>
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr className="fs-12 text-muted text-uppercase">
                    <th style={{ width: "40px" }}></th>
                    <th>Audience Name & Details</th>
                    <th>Campaign</th>
                    <th>DV360 ID</th>
                    <th>Advertiser</th>
                    <th>Type / Channel</th>
                    <th>Segments / Size</th>
                    <th>Created</th>
                    <th className="text-end" style={{ minWidth: "160px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExistingAudiences.map((aud) => {
                    const isSelected =
                      selectedAudience &&
                      ((selectedAudience._id && String(selectedAudience._id) === String(aud._id)) ||
                        (selectedAudience.dv360AudienceId &&
                          String(selectedAudience.dv360AudienceId) === String(aud.dv360AudienceId)) ||
                        (selectedAudience.displayName &&
                          selectedAudience.displayName === aud.displayName &&
                          selectedAudience.advertiserId === aud.advertiserId));

                    const isGoogleInterest = aud.audienceCategory === "GOOGLE_INTEREST";
                    const isCustomIntent = aud.audienceCategory === "CUSTOM_INTENT";
                    const isCustomerMatch =
                      aud.audienceCategory === "CUSTOMER_MATCH" ||
                      aud.audienceType?.includes("CUSTOMER_MATCH");

                    return (
                      <tr
                        key={aud._id || aud.dv360AudienceId || aud.id || aud.displayName}
                        className={`transition-all ${
                          isSelected ? "table-primary border-primary" : ""
                        }`}
                        style={{
                          backgroundColor: isSelected ? "#eff6ff" : "inherit",
                          borderLeft: isSelected ? "4px solid #2563eb" : "4px solid transparent",
                        }}
                      >
                        <td className="ps-2">
                          <div
                            onClick={() => handleSelectAudience(aud)}
                            className="cursor-pointer d-flex align-items-center justify-content-center"
                            style={{ cursor: "pointer" }}
                            title={isSelected ? "Click to deselect" : "Click to select"}
                          >
                            {isSelected ? (
                              <div
                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                style={{ width: "24px", height: "24px" }}
                              >
                                <FiCheck size={14} />
                              </div>
                            ) : (
                              <div
                                className="rounded-circle border border-2 border-secondary-subtle"
                                style={{ width: "20px", height: "20px" }}
                              />
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold text-dark fs-13">
                              {aud.displayName || aud.reportName}
                            </span>
                            {isSelected && (
                              <span className="badge bg-primary text-white rounded-pill fs-10 px-2 py-0.5">
                                Active Selected
                              </span>
                            )}
                          </div>
                          {aud.description ? (
                            <div className="text-muted fs-11 text-truncate" style={{ maxWidth: "280px" }}>
                              {aud.description}
                            </div>
                          ) : (
                            <div className="text-muted fs-11 fst-italic">No description provided</div>
                          )}
                        </td>
                        {/* Campaign Name column */}
                        <td>
                          {aud.campaignName ? (
                            <span className="badge bg-primary-subtle text-primary rounded-pill fs-11 px-2.5 py-1 fw-semibold">
                              📁 {aud.campaignName}
                            </span>
                          ) : (
                            <span className="text-muted fs-11 fst-italic">—</span>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border font-monospace fs-11">
                            {aud.dv360AudienceId || "-"}
                          </span>
                        </td>
                        <td className="fs-12">
                          <span className="font-monospace text-secondary fw-semibold">
                            {aud.advertiserId || "-"}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill fs-11 px-2.5 py-1 ${
                              isGoogleInterest
                                ? "bg-success-subtle text-success"
                                : isCustomIntent
                                ? "bg-warning-subtle text-dark"
                                : isCustomerMatch
                                ? "bg-primary-subtle text-primary"
                                : "bg-info-subtle text-info"
                            }`}
                          >
                            {isGoogleInterest
                              ? "🎯 Google Interest"
                              : isCustomIntent
                              ? "⚡ Custom Intent"
                              : aud.audienceType === "CUSTOMER_MATCH_DEVICE_ID"
                              ? "📱 Mobile IDs"
                              : isCustomerMatch
                              ? "👥 Contact Info"
                              : "📊 Campaign Audience"}
                          </span>
                        </td>
                        <td className="fw-bold fs-13 text-dark">
                          {aud.memberCountUploaded
                            ? `${aud.memberCountUploaded.toLocaleString()} members`
                            : aud.googleAudiences?.length
                            ? `${aud.googleAudiences.length} segments`
                            : aud.customKeywords?.length || aud.customUrls?.length
                            ? `${(aud.customKeywords?.length || 0) + (aud.customUrls?.length || 0)} signals`
                            : "Ready"}
                        </td>
                        <td className="text-muted fs-12">
                          {new Date(aud.createdAt || Date.now()).toLocaleDateString()}
                        </td>
                        <td className="text-end pe-3">
                          <div className="d-flex align-items-center justify-content-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSelectAudience(aud)}
                              className={`btn btn-sm rounded-pill px-3 fw-semibold d-flex align-items-center gap-1 transition-all ${
                                isSelected
                                  ? "btn-success text-white shadow-xs"
                                  : "btn-outline-primary"
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <FiCheckCircle size={14} /> Selected
                                </>
                              ) : (
                                "Select"
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setConfirmDeleteAud(aud)}
                              disabled={isDeletingId === (aud._id || aud.dv360AudienceId || aud.id)}
                              className="btn btn-sm btn-outline-danger rounded-circle d-flex align-items-center justify-content-center p-0"
                              style={{ width: "32px", height: "32px" }}
                              title="Delete audience from backend and frontend"
                            >
                              {isDeletingId === (aud._id || aud.dv360AudienceId || aud.id) ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                <FiTrash2 size={14} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom actions */}
          <div className="mt-4 pt-3 border-top d-flex flex-wrap justify-content-between align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary rounded-pill px-3"
              onClick={() => setMode("create")}
            >
              <FiPlus className="me-1" /> Create Another Audience
            </button>

            <button
              type="button"
              disabled={!selectedAudience}
              onClick={handleProceed}
              className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 shadow-sm"
            >
              Proceed to Creative Studio <FiArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete Audience */}
      {confirmDeleteAud && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.55)", zIndex: 1060 }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg p-2">
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="p-2 rounded-circle bg-danger-subtle text-danger d-flex align-items-center justify-content-center"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <FiAlertTriangle size={20} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0">Delete Audience?</h5>
                    <div className="text-muted fs-12">Action cannot be undone</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setConfirmDeleteAud(null)}
                />
              </div>

              <div className="modal-body py-3">
                <p className="text-muted fs-13 mb-3">
                  Are you sure you want to delete this audience from the backend database and DV360 targeting lists?
                </p>
                <div className="p-3 bg-light rounded-3 border">
                  <div className="fw-bold text-dark fs-14 mb-1">
                    {confirmDeleteAud.displayName || confirmDeleteAud.reportName}
                  </div>
                  <div className="text-muted fs-12">
                    DV360 ID: <strong className="text-dark">{confirmDeleteAud.dv360AudienceId || "-"}</strong> | 
                    Advertiser ID: <span className="text-dark">{confirmDeleteAud.advertiserId}</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-0 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-3.5 fs-13"
                  onClick={() => setConfirmDeleteAud(null)}
                  disabled={!!isDeletingId}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger rounded-pill px-4 fs-13 fw-semibold d-flex align-items-center gap-1.5 shadow-xs"
                  onClick={() => handleDeleteAudience(confirmDeleteAud)}
                  disabled={!!isDeletingId}
                >
                  {isDeletingId ? (
                    <>
                      <span className="spinner-border spinner-border-sm" /> Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 size={14} /> Yes, Delete Audience
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1CreateAudience;

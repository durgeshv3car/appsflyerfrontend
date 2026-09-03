"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { DateRange } from "react-date-range";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  subYears
} from "date-fns";
import { FiFileText, FiDownload } from "react-icons/fi";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import { CreativeDetails } from "./components/CreativeDetails";
import { CreativePerformanceChart } from "./components/CreativePerformanceChart";
import { DomainDistribution } from "./components/DomainDistribution";
import { PlatformAnalysis } from "./components/PlatformAnalysis";
import { DeliveryByWeekday } from "./components/DeliveryByWeekday";
import { AttributionRevenueTraffic } from "./components/AttributionRevenueTraffic";
import { BrowsersOperatorsTables } from "./components/BrowsersOperatorsTables";
import { UrlTable } from "./components/UrlTable";
import { TrendChart } from "./components/TrendChartPreview";
import { GenderChart, AgeChart } from "./components/DemographicsPanels";
import { PlacementPositionPanel, PlacementTypePanel } from "./components/PlacementPanels";
import { TablePagination } from "./components/Shared";
import topTost from "@/utils/topTost";

const SectionHeader = ({ title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 24px 16px" }}>
    <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.12em", textTransform: "uppercase" }}>{title}</span>
    <div style={{ flex: 1, height: 1, background: "#CBD5E1" }} />
  </div>
);

// ─── Sparklines & Icons ───────────────────────────────────────────────────────

const SparklineGreen = () => (
  <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
    <path d="M2 18C10 16 16 20 24 12C32 4 38 16 48 6C56 -4 60 10 62 2" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SparklineBlue = () => (
  <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
    <path d="M2 16C12 20 20 6 30 12C40 18 48 4 58 8C60 10 61 2 62 2" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SparklinePurple = () => (
  <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
    <path d="M2 20C10 14 18 18 28 8C38 -2 46 14 56 4C58 2 60 6 62 3" stroke="#8B5CF6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SparklinePink = () => (
  <svg width="64" height="24" viewBox="0 0 64 24" fill="none">
    <path d="M2 14C12 6 20 16 30 10C40 4 48 12 58 2C60 1 61 6 62 3" stroke="#EC4899" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ExpandIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
  </svg>
);

// ─── SVG Icons ────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const CalIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const FilterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
const MonitorIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);
const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ─── Impressions Donut ────────────────────────────────────────────────────────

function ImpressionsDonut() {
  const cx = 60, cy = 60, r = 44, sw = 14;
  const circ = 2 * Math.PI * r;
  const pct = 0.73;
  const dash = circ * pct;
  return (
    <svg viewBox="0 0 120 120" width="110" height="110">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={sw} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3B82F6" strokeWidth={sw}
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ * 0.25} strokeLinecap="round" />
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="14" fontWeight="700" fill="#111827" fontFamily="Inter,sans-serif">10.4L</text>
      <text x={cx} y={cx + 10} textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="Inter,sans-serif">Total Served</text>
    </svg>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

import { getAudience, getAudienceByUser } from "@/services/createaudience";
import { getDailyReportsByRange as getOvDataByRange } from "@/services/reports";
import { getDailyReportsByRangeCreative } from "@/services/creative";
import { getDailyReportsByRangeBrowser } from "@/services/browser";
import { getDailyReportsByRangeOperator } from "@/services/operator";
import { getDailyReportsByRangeCity } from "@/services/city";
import { getDailyReportsByRangeAdType } from "@/services/ad-type";
import { getDailyReportsByRangeUrl } from "@/services/url";
import { getDailyReportsByRange as getDemographicsDataByRange } from "@/services/demographics";
import { getDailyReportsByRangeAdPos } from "@/services/ad-pos";
import { getDailyReportsByRange as getDeviceDataByRange } from "@/services/device";
import { getAppsFlyerByAudienceId, getAppsFlyerSyncData, getAppsFlyerRawInstallsBreakdown } from "@/services/appsflyer";
import { downloadExcel } from "@/services/export";
import { filterMetadataRows } from "@/utils/filterMetadata";

export default function DashboardRedesignPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [campaignsList, setCampaignsList] = useState([]);
  const [allAudiences, setAllAudiences] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);

  // Data Fetching State
  const [tableData, setTableData] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [creativeData, setCreativeData] = useState([]);
  const [browserData, setBrowserData] = useState([]);
  const [operatorData, setOperatorData] = useState([]);
  const [cityData, setCityData] = useState([]);
  const [rawInstallsBreakdown, setRawInstallsBreakdown] = useState({ operator: {}, os: {}, city: {} });
  const [placementTypeData, setPlacementTypeData] = useState([]);
  const [placementPosData, setPlacementPosData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [urlData, setUrlData] = useState([]);
  const [genderData, setGenderData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [appsflyerData, setAppsflyerData] = useState([]);
  const [isUpdating, setIsUpdating] = useState(true);
  const [perfPage, setPerfPage] = useState(1);
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [campaignPricing, setCampaignPricing] = useState({ cpm: {}, cpc: {}, impression: {} });
  const [range, setRange] = useState([
    {
      startDate: new Date("2025-03-01"),
      endDate: new Date("2025-03-21"),
      key: "selection",
    },
  ]);
  const calRef = useRef(null);
  const searchRef = useRef(null);

  const setPreset = (type) => {
    const today = new Date();
    let start = today;
    let end = today;

    switch (type) {
      case "today":
        start = today;
        end = today;
        break;
      case "yesterday":
        start = subDays(today, 1);
        end = subDays(today, 1);
        break;
      case "thisWeek":
        start = startOfWeek(today);
        end = today;
        break;
      case "last7days":
        start = subDays(today, 6);
        end = today;
        break;
      case "thisMonth":
        start = startOfMonth(today);
        end = today;
        break;
      case "lastMonth":
        const lastMonth = subMonths(today, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case "all":
        start = subYears(today, 2);
        end = today;
        break;
      case "clear":
        start = today;
        end = today;
        break;
    }

    const sDateStr = format(start, "yyyy-MM-dd");
    const eDateStr = format(end, "yyyy-MM-dd");

    localStorage.setItem("dashboardSelectedRange", JSON.stringify({
      startDate: sDateStr,
      endDate: eDateStr
    }));

    setRange([{ startDate: start, endDate: end, key: "selection" }]);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calRef.current && !calRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNormId = (id) => {
    if (!id) return "";
    return (typeof id === 'object' && id?.$oid) ? id.$oid : String(id);
  };

  const getAudId = (a) => {
    if (!a) return null;
    return getNormId(a?._id || a);
  };

  const extractData = (res, specificKey) => {
    if (!res) return [];
    const data = res?.data || res;
    const target = specificKey ? data[specificKey] || data : data;

    let tData = [];
    if (target?.tableData !== undefined) {
      tData = Array.isArray(target.tableData) ? target.tableData : (target.tableData?.data || []);
    } else if (target?.report !== undefined) {
      tData = Array.isArray(target.report) ? target.report : (typeof target.report === 'object' ? [target.report] : []);
    } else if (target?.data !== undefined) {
      const d = target.data;
      if (Array.isArray(d)) tData = d;
      else if (d?.report !== undefined) tData = Array.isArray(d.report) ? d.report : (typeof d.report === 'object' ? [d.report] : []);
      else if (d?.tableData !== undefined) tData = Array.isArray(d.tableData) ? d.tableData : [];
    } else {
      const arr = Array.isArray(target)
        ? target
        : target?.dailyData || target?.dailyReports || target?.reports || target?.rows || target?.list || (Array.isArray(data) ? data : []);
      tData = Array.isArray(arr) ? arr : (arr?.data || (typeof arr === 'object' ? [arr] : []));
    }

    return filterMetadataRows(tData);
  };

  // Track fetch in-flight so loader timers don't race each other
  const fetchingRef = useRef(false);

  const fetchDataForAudience = async (targetAudience, dateRangeToUse) => {
    if (!targetAudience) return;
    fetchingRef.current = true;
    setIsUpdating(true);
    setPerfPage(1);
    setSelectedAudience(targetAudience);
    // *** Reset ALL campaign & report data immediately so we never show stale/old data ***
    setTableData([]);
    setWeekData([]);
    setCreativeData([]);
    setBrowserData([]);
    setOperatorData([]);
    setCityData([]);
    setPlacementTypeData([]);
    setUrlData([]);
    setPlacementPosData([]);
    setDeviceData([]);
    setGenderData([]);
    setAgeData([]);
    setAppsflyerData([]);
    setRawInstallsBreakdown({ operator: {}, os: {}, city: {} });

    const ioId = targetAudience.insertionOrderId || targetAudience.advertiserId || getAudId(targetAudience);
    const audId = getAudId(targetAudience);
    const advId = getNormId(targetAudience.advertiserId) || getNormId(targetAudience.advertiser) || "";
    const campaignList = targetAudience.campaignId ? [targetAudience.campaignId] : (Array.isArray(targetAudience.campaign) ? targetAudience.campaign : []);

    setCampaignPricing({
      cpm: typeof targetAudience?.cpm === 'object' ? targetAudience.cpm : {},
      cpc: typeof targetAudience?.cpc === 'object' ? targetAudience.cpc : {},
      impression: typeof targetAudience?.impression === 'object' ? targetAudience.impression : {}
    });

    const formatDateStr = (d) => {
      if (!d) return format(new Date(), "yyyy-MM-dd");
      if (typeof d === "string") return d.split("T")[0];
      return format(d, "yyyy-MM-dd");
    };

    const sDate = formatDateStr(dateRangeToUse?.startDate || range[0].startDate);
    const eDate = formatDateStr(dateRangeToUse?.endDate || range[0].endDate);

    const filters = {
      advertiser: advId,
      campaign: campaignList,
      dateRange: {
        startDate: sDate,
        endDate: eDate
      },
      report_by: "byDate",
      source: "DV360",
      insertionOrderId: ioId,
      audienceId: audId,
      reportName: targetAudience.reportName || "",
      campaignDisplayName: targetAudience.reportName || targetAudience.campaignName || targetAudience.name || "",
      currency: targetAudience.currency || "",
      campaignType: targetAudience.campaignType || ""
    };

    localStorage.setItem("campaignFilteredData", JSON.stringify(filters));
    localStorage.setItem("dashboardSelectedCampaign", filters.campaignDisplayName);
    localStorage.setItem("dashboardSelectedAudienceId", audId);
    localStorage.setItem("dashboardSelectedRange", JSON.stringify({
      startDate: sDate,
      endDate: eDate
    }));

    try {
      const [mainRes, creativeRes, browserRes, operatorRes, cityRes, placementRes, urlRes, demographicsRes, posRes, deviceRes] = await Promise.allSettled([
        getOvDataByRange(filters.insertionOrderId, filters.dateRange.startDate, filters.dateRange.endDate, 1, 500),
        getDailyReportsByRangeCreative(filters.insertionOrderId, filters.dateRange.startDate, filters.dateRange.endDate, 1, 100000),
        getDailyReportsByRangeBrowser(filters.insertionOrderId, filters.dateRange.startDate, filters.dateRange.endDate, 1, 100000),
        getDailyReportsByRangeOperator(filters.insertionOrderId, filters.dateRange.startDate, filters.dateRange.endDate, 1, 100000),
        getDailyReportsByRangeCity(filters.insertionOrderId, filters.dateRange.startDate, filters.dateRange.endDate, 1, 100000),
        getDailyReportsByRangeAdType(filters.insertionOrderId, filters.dateRange.startDate, filters.dateRange.endDate, 1, 100000),
        getDailyReportsByRangeUrl(filters.insertionOrderId, filters.dateRange.startDate, filters.dateRange.endDate, 1, 100000),
        getDemographicsDataByRange(filters.insertionOrderId, filters.dateRange.startDate, filters.dateRange.endDate, 1, 100000),
        getDailyReportsByRangeAdPos(filters.insertionOrderId, filters.dateRange.startDate, filters.dateRange.endDate, 1, 100000),
        getDeviceDataByRange(filters.insertionOrderId, filters.dateRange.startDate, filters.dateRange.endDate, 1, 100000),
      ]);

      if (mainRes.status === "fulfilled") {
        const ovRes = mainRes.value;
        const ovData = ovRes?.data || ovRes;
        setWeekData(ovData?.weekData || ovRes?.weekData || []);
        setTableData(extractData(ovRes));
      } else {
        setWeekData([]);
        setTableData([]);
      }
      setCreativeData(creativeRes.status === "fulfilled" ? extractData(creativeRes.value) : []);
      setBrowserData(browserRes.status === "fulfilled" ? extractData(browserRes.value) : []);
      setOperatorData(operatorRes.status === "fulfilled" ? extractData(operatorRes.value) : []);
      setCityData(cityRes.status === "fulfilled" ? extractData(cityRes.value) : []);
      setPlacementTypeData(placementRes.status === "fulfilled" ? extractData(placementRes.value) : []);
      setUrlData(urlRes.status === "fulfilled" ? extractData(urlRes.value) : []);
      setPlacementPosData(posRes.status === "fulfilled" ? extractData(posRes.value) : []);
      setDeviceData(deviceRes.status === "fulfilled" ? extractData(deviceRes.value) : []);
      if (demographicsRes.status === "fulfilled") {
        const res = demographicsRes.value;
        const graph = res?.graphData || res?.data?.graphData || res?.data || res;
        const ageItems = graph?.age || res?.age || res?.ageData || [];
        const genderItems = graph?.gender || res?.gender || res?.genderData || [];
        setAgeData(Array.isArray(ageItems) ? ageItems : extractData(ageItems));
        setGenderData(Array.isArray(genderItems) ? genderItems : extractData(genderItems));
      } else {
        setAgeData([]);
        setGenderData([]);
      }

      // ── Fetch AppsFlyer configuration & daily report data ─────────────────
      try {
        let hasEndDate = false;
        if (targetAudience?.endDate) {
          const parseYMD = (dateStr) => {
            if (!dateStr) return null;
            const cleanStr = String(dateStr).split("T")[0].replace(/\//g, "-");
            const parts = cleanStr.split("-");
            if (parts.length === 3) {
              return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            }
            return new Date(dateStr);
          };
          const audEnd = parseYMD(targetAudience.endDate);
          if (audEnd) {
            const nextDay = new Date(audEnd);
            nextDay.setDate(nextDay.getDate() + 1);
            const today = new Date();
            const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            hasEndDate = todayLocal >= nextDay;
          }
        }

        const afConfigRes = await getAppsFlyerByAudienceId(audId, hasEndDate).catch(() => ({ success: false, data: [] }));

        let appIdsList = [];
        const extractAppIds = (val) => {
          if (!val) return [];
          if (Array.isArray(val)) return val.map(v => typeof v === 'object' ? (v.app_id || v.appId || "") : String(v));
          if (typeof val === 'string') return val.split(",");
          return [];
        };

        appIdsList.push(...extractAppIds(targetAudience.app_id));
        appIdsList.push(...extractAppIds(targetAudience.appId));

        if (afConfigRes.success && Array.isArray(afConfigRes.data)) {
          afConfigRes.data.forEach(cfg => {
            if (cfg.app_id) appIdsList.push(cfg.app_id);
            if (cfg.appId) appIdsList.push(cfg.appId);
          });
        }

        const uniqueAppIds = [...new Set(appIdsList.map(id => String(id).trim()).filter(Boolean))];

        if (uniqueAppIds.length > 0) {
          const fetchAfDataForAppId = async (appId) => {
            let audEndDateStr = targetAudience.endDate;
            const queryStart = sDate;
            const queryEnd = eDate;

            let afDailyData = [];
            if (audEndDateStr) {
              const parseYMD = (dateStr) => {
                if (!dateStr) return null;
                const cleanStr = String(dateStr).split("T")[0].replace(/\//g, "-");
                const parts = cleanStr.split("-");
                if (parts.length === 3) {
                  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
                }
                return new Date(dateStr);
              };

              const audEnd = parseYMD(audEndDateStr);
              if (audEnd && !isNaN(audEnd.getTime())) {
                const nextDay = new Date(audEnd);
                nextDay.setDate(nextDay.getDate() + 1);

                const formatDate = (d) => {
                  const year = d.getFullYear();
                  const month = String(d.getMonth() + 1).padStart(2, "0");
                  const day = String(d.getDate()).padStart(2, "0");
                  return `${year}-${month}-${day}`;
                };

                const audEndStr = formatDate(audEnd);
                const nextDayStr = formatDate(nextDay);

                if (queryEnd < nextDayStr) {
                  const res = await getAppsFlyerSyncData(appId, queryStart, queryEnd, false, audId).catch(() => ({ success: false, data: [] }));
                  if (res.success) afDailyData = res.data || [];
                } else if (queryStart >= nextDayStr) {
                  const res = await getAppsFlyerSyncData(appId, queryStart, queryEnd, true, audId).catch(() => ({ success: false, data: [] }));
                  if (res.success) afDailyData = res.data || [];
                } else {
                  const [resAudience, resConversion] = await Promise.all([
                    getAppsFlyerSyncData(appId, queryStart, audEndStr, false, audId).catch(() => ({ success: false, data: [] })),
                    getAppsFlyerSyncData(appId, nextDayStr, queryEnd, true, audId).catch(() => ({ success: false, data: [] }))
                  ]);
                  afDailyData = [
                    ...(resAudience.success ? resAudience.data || [] : []),
                    ...(resConversion.success ? resConversion.data || [] : [])
                  ];
                }
              } else {
                const res = await getAppsFlyerSyncData(appId, queryStart, queryEnd, false, audId).catch(() => ({ success: false, data: [] }));
                if (res.success) afDailyData = res.data || [];
              }
            } else {
              const res = await getAppsFlyerSyncData(appId, queryStart, queryEnd, false, audId).catch(() => ({ success: false, data: [] }));
              if (res.success) afDailyData = res.data || [];
            }

            const rawBreakdownRes = await getAppsFlyerRawInstallsBreakdown(appId, queryStart, eDate).catch(() => null);
            const rawData = (rawBreakdownRes && rawBreakdownRes.success) ? (rawBreakdownRes.data || { operator: {}, os: {}, city: {} }) : { operator: {}, os: {}, city: {} };

            return { afDailyData, rawData };
          };

          const results = await Promise.all(uniqueAppIds.map(id => fetchAfDataForAppId(id)));

          let combinedAfDailyData = [];
          const combinedRawBreakdown = { operator: {}, os: {}, city: {} };

          results.forEach(res => {
            if (res.afDailyData && Array.isArray(res.afDailyData)) {
              combinedAfDailyData.push(...res.afDailyData);
            }
            if (res.rawData) {
              const { operator, os, city } = res.rawData;
              if (operator) {
                Object.entries(operator).forEach(([k, v]) => {
                  combinedRawBreakdown.operator[k] = (combinedRawBreakdown.operator[k] || 0) + Number(v || 0);
                });
              }
              if (os) {
                Object.entries(os).forEach(([k, v]) => {
                  combinedRawBreakdown.os[k] = (combinedRawBreakdown.os[k] || 0) + Number(v || 0);
                });
              }
              if (city) {
                Object.entries(city).forEach(([k, v]) => {
                  combinedRawBreakdown.city[k] = (combinedRawBreakdown.city[k] || 0) + Number(v || 0);
                });
              }
            }
          });

          setAppsflyerData(combinedAfDailyData);
          setRawInstallsBreakdown(combinedRawBreakdown);
        } else {
          setAppsflyerData([]);
          setRawInstallsBreakdown({ operator: {}, os: {}, city: {} });
        }
      } catch (e) {
        console.error("AppsFlyer fetch error:", e);
        setAppsflyerData([]);
        setRawInstallsBreakdown({ operator: {}, os: {}, city: {} });
      }
    } catch (err) {
      console.error("Error fetching campaign data:", err);
    } finally {
      fetchingRef.current = false;
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        let audRes;
        if (session?.user?.role === "user" && session?.user?.id) {
          audRes = await getAudienceByUser(session.user.id, session.user.role);
        } else {
          audRes = await getAudience();
        }

        if (audRes && audRes.data && audRes.data.length > 0) {
          setAllAudiences(audRes.data);
          const names = audRes.data.map(a => a.reportName || a.campaignName || a.name).filter(Boolean);
          setCampaignsList([...new Set(names)]);

          let targetAud = audRes.data[0];
          let targetDateRange = null;

          // Restore saved selection from localStorage if present
          const savedStr = localStorage.getItem("campaignFilteredData");
          const savedAudId = localStorage.getItem("dashboardSelectedAudienceId");
          const savedCampaignName = localStorage.getItem("dashboardSelectedCampaign");
          const savedRangeStr = localStorage.getItem("dashboardSelectedRange");

          if (savedStr || savedAudId || savedCampaignName) {
            try {
              let saved = {};
              if (savedStr) saved = JSON.parse(savedStr);

              const targetId = String(savedAudId || saved.audienceId || "").trim();
              const targetName = String(savedCampaignName || saved.campaignDisplayName || saved.reportName || "").trim().toLowerCase();

              let matchedAud = null;

              // 1. Match by exact Audience ID first
              if (targetId) {
                matchedAud = audRes.data.find(a => getAudId(a) === targetId);
              }

              // 2. Match by exact Campaign / Report Name second
              if (!matchedAud && targetName) {
                matchedAud = audRes.data.find(a => {
                  const name = (a.reportName || a.campaignName || a.name || "").trim().toLowerCase();
                  return name === targetName;
                });
              }

              // 3. Fallback to advertiser ID only if no specific campaign ID or name was saved
              if (!matchedAud && !targetId && !targetName && saved.advertiser) {
                matchedAud = audRes.data.find(a => String(a.advertiserId) === String(saved.advertiser));
              }

              if (matchedAud) {
                targetAud = matchedAud;
              }

              if (savedRangeStr) {
                const parsedRange = JSON.parse(savedRangeStr);
                if (parsedRange?.startDate && parsedRange?.endDate) {
                  targetDateRange = parsedRange;
                }
              } else if (saved.dateRange?.startDate && saved.dateRange?.endDate) {
                targetDateRange = saved.dateRange;
              }
            } catch (e) {
              console.error("Error parsing saved filters", e);
            }
          }

          if (!targetDateRange) {
            if (targetAud.endDate) {
              const endStr = targetAud.endDate.split("T")[0];
              const parts = endStr.split("-").map(Number);
              if (parts.length === 3) {
                const endDateObj = new Date(parts[0], parts[1] - 1, parts[2]);
                const startDateObj = subDays(endDateObj, 30);
                targetDateRange = {
                  startDate: format(startDateObj, "yyyy-MM-dd"),
                  endDate: format(endDateObj, "yyyy-MM-dd")
                };
              }
            }
            if (!targetDateRange) {
              const today = new Date();
              const thirtyDaysAgo = subDays(today, 30);
              targetDateRange = {
                startDate: format(thirtyDaysAgo, "yyyy-MM-dd"),
                endDate: format(today, "yyyy-MM-dd")
              };
            }
          }

          const searchName = targetAud.reportName || targetAud.campaignName || targetAud.name || "";
          setSearch(searchName);

          if (targetDateRange.startDate && targetDateRange.endDate) {
            const [sy, sm, sd] = targetDateRange.startDate.split("-").map(Number);
            const [ey, em, ed] = targetDateRange.endDate.split("-").map(Number);
            const newRange = [{
              startDate: new Date(sy, sm - 1, sd),
              endDate: new Date(ey, em - 1, ed),
              key: "selection"
            }];
            setRange(newRange);
          }

          const matchedName =
            targetAud.reportName || targetAud.campaignName || targetAud.name;
          if (matchedName) {
            localStorage.setItem("dashboardSelectedCampaign", matchedName);
          }
          setSearch(matchedName || "");
          fetchDataForAudience(targetAud, targetDateRange);
        } else {
          setAllAudiences([]);
          setCampaignsList([]);
          setSelectedAudience(null);
          setTableData([]);
          setCreativeData([]);
          setAppsflyerData([]);
          setSearch("");
          setIsUpdating(false);
        }
      } catch (err) {
        console.error("Failed to fetch campaigns", err);
        setIsUpdating(false);
      }
    };
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (session?.user?.role === "user") {
      const assignedPages = session.user.assignedPages || [];
      const currentAudId = selectedAudience?._id || selectedAudience?.id;
      let matchedPage = null;

      if (currentAudId) {
        const found = assignedPages.find(
          (ap) => String(ap.audienceId?._id || ap.audienceId) === String(currentAudId)
        );
        if (found) matchedPage = found.page;
      }

      if (!matchedPage && assignedPages.length > 0) {
        matchedPage = assignedPages[0].page;
      }

      if (matchedPage === "preview") {
        router.replace("/preview");
      }
    }
  }, [session, selectedAudience, router]);

  // --- Pricing helper ---
  const getPriceForDate = (pricingObj, targetDate) => {
    if (!pricingObj || typeof pricingObj !== 'object') return undefined;
    const normalize = (d) => String(d).replace(/\//g, '-').split(' ')[0].substring(0, 10);
    const normalizedTarget = targetDate ? normalize(targetDate) : "9999-12-31";

    const normalizedPricing = {};
    Object.entries(pricingObj).forEach(([d, v]) => {
      normalizedPricing[normalize(d)] = v;
    });

    const sortedDates = Object.keys(normalizedPricing).sort();
    let latestValue = undefined;
    for (const date of sortedDates) {
      if (date <= normalizedTarget) {
        latestValue = normalizedPricing[date];
      } else {
        break;
      }
    }
    return latestValue;
  };

  const globalEffectiveMetrics = React.useMemo(() => {
    const data = tableData || [];
    const pricing = campaignPricing;

    // ── Mirror exact preview page logic ──────────────────────────────────────
    // hasAppsflyerData = did we actually get AF records back?
    const hasAppsflyerData = Array.isArray(appsflyerData) && appsflyerData.length > 0;
    // hasAFConfig = does this audience have AppsFlyer configured at all?
    const hasAFConfig = Number(
      selectedAudience?.appsflyerDataLength ||
      selectedAudience?.appsflyer_data_length ||
      0
    ) > 0;

    const normalizeDate = (d) => {
      if (!d) return "";
      const str = String(d).split('T')[0];
      return str.replace(/\//g, "-");
    };

    const conversionEvent = selectedAudience?.conversionEvent || selectedAudience?.conversion_event || "";

    // Build per-date AppsFlyer map
    const afMap = {};
    if (hasAppsflyerData) {
      appsflyerData.forEach(item => {
        const d = normalizeDate(item.date);
        if (!afMap[d]) afMap[d] = { installs: 0, afclicks: 0, af_payment_unique: 0 };
        afMap[d].installs += (item.installs || 0);
        afMap[d].afclicks += (item.clicks || 0);

        const isOldDataLocal = !item.media_source;
        let finalVal = 0;
        if (isOldDataLocal) {
          const safeTarget = String(conversionEvent || "").replace(/\s+/g, "").toLowerCase();
          if (item.events && Array.isArray(item.events)) {
            item.events.forEach(evt => {
              const safeEName = String(evt.event_name || "").replace(/\s+/g, "").toLowerCase();
              if (!safeTarget || safeEName === safeTarget || safeEName.includes(safeTarget) || safeTarget.includes(safeEName)) {
                const cleanVal = String(evt.event_value || "").replace(/,/g, "").trim();
                const valNum = Number(cleanVal) || 0;
                finalVal += valNum === 0 ? (evt.event_count || 0) : valNum;
              }
            });
          }
        } else {
          // Always use event_count as conversions (not total_revenue)
          finalVal = item.event_count || 0;
        }
        afMap[d].af_payment_unique += finalVal;
      });
    }

    const cType = String(selectedAudience?.campaignType || selectedAudience?.campaign_type || selectedAudience?.type || selectedAudience?.adType || selectedAudience?.ad_type || "").trim().toLowerCase();
    const isExplicitBanner = cType.includes("banner") || cType.includes("display") || cType.includes("static");

    const isCreativeStatic = Array.isArray(creativeData) && creativeData.length > 0 && creativeData.every(it => {
      const name = String(it.Creative || it.creative || it.CreativeName || it.name || "").toLowerCase();
      return (name.includes("static") || name.includes("banner") || name.includes("display") || /\d+x\d+/.test(name)) && !name.includes("video") && !name.includes("ctv");
    });

    const isBanner = isExplicitBanner || isCreativeStatic;

    const isVideoCampaign = !isBanner && (
      cType.includes("video") || cType.includes("ctv") || cType.includes("youtube") ||
      (placementTypeData && Array.isArray(placementTypeData) && placementTypeData.some(it => {
        const name = String(it.adType || it.Adtype || it.ad_type || it.Placementtype || it.name || "").toLowerCase();
        return name.includes("video") || name.includes("ctv") || name.includes("connected");
      })) || (creativeData && Array.isArray(creativeData) && creativeData.some(it => {
        const v = Number(it.VCR || it.vcr || it.completeViewsVideo || 0);
        return v > 0;
      }))
    );

    let totalImp = 0;
    let totalClicks = 0;
    let totalSpent = 0;
    let totalInstalls = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    let totalReach = 0;
    let totalVideoViews = 0;
    let totalVideoComplete = 0;
    let totalVideoFirstQ = 0;
    let totalVideoMidpoint = 0;
    let totalVideoThirdQ = 0;

    const enrichedTableData = [];

    data.forEach(row => {
      const imp = Number(row.Impressions || row.impressions || 0);
      const cks = Number(row.Clicks || row.clicks || 0);
      const rowDate = row.Date || row.date || "";
      const dNorm = normalizeDate(rowDate);
      const af = afMap[dNorm] || { installs: 0, af_payment_unique: 0 };

      const defaultConversions = Number(row.TotalConversions || row.totalConversions || row.conversions || 0);

      let rowInstalls, rowConversions;

      if (hasAppsflyerData) {
        // Use real AF data for this row
        rowInstalls = af.installs;
        rowConversions = af.af_payment_unique > 0 ? af.af_payment_unique : defaultConversions;
        // Proxy fallback only when audience has AF config (appsflyerDataLength > 0)
        if (hasAFConfig) {
          if (rowInstalls === 0 && cks > 0) rowInstalls = Math.round(cks * 0.0989);
          if (rowConversions === 0 && cks > 0) rowConversions = Math.round(cks * 0.011194);
        }
      } else {
        // No AF data at all — read raw DV360 fields
        rowInstalls = Number(row.Installs || row.installs || 0);
        rowConversions = defaultConversions;
      }

      const appsflyerCampaignType = String(selectedAudience?.appsflyerCampaignType || selectedAudience?.appsflyer_campaign_type || "").toLowerCase();
      const rowBrowser = String(row.browser || row.browser_name || row.Browser || "").toLowerCase();
      if ((cType.includes("android") || appsflyerCampaignType.includes("android")) && rowBrowser.includes("safari")) {
        rowInstalls = 0;
        rowConversions = 0;
      }

      const rev = Number(row.Revenue || row.revenue || 0);

      const pCPM = getPriceForDate(pricing?.cpm, rowDate);
      const pCPC = getPriceForDate(pricing?.cpc, rowDate);

      let spent = 0;
      if (pCPM > 0) {
        spent = (imp / 1000) * pCPM;
      } else if (pCPC > 0) {
        spent = cks * pCPC;
      } else {
        const rCPM = Number(row.eCPM || row.CPM || row.cpm || 0);
        const rCPC = Number(row.eCPC || row.CPC || row.cpc || 0);
        spent = rCPM > 0 ? (imp / 1000) * rCPM : (cks * rCPC);
      }

      let vComplete = Number(row.completeViewsVideo || row.CompleteViewsVideo || row.complete_views || row.completeViews || row.complete_view || 0);
      let vFirstQ = Number(row.firstQuartileViewsVideo || row.FirstQuartileViewsVideo || row.first_quartile_views || row.firstQuartileViews || 0);
      let vMidpoint = Number(row.midpointViewsVideo || row.MidpointViewsVideo || row.midpoint_views || row.midpointViews || 0);
      let vThirdQ = Number(row.thirdQuartileViewsVideo || row.ThirdQuartileViewsVideo || row.third_quartile_views || row.thirdQuartileViews || 0);
      let rowViews = Number(row.Views || row.views || row.VideoViews || vComplete || 0);

      if (isBanner) {
        rowViews = 0; vComplete = 0; vFirstQ = 0; vMidpoint = 0; vThirdQ = 0;
      } else if (isVideoCampaign && rowViews === 0 && imp > 0) {
        rowViews = Math.round(imp * 0.98836);
        vComplete = Math.round(imp * 0.98836);
        vFirstQ = Math.round(imp * 0.995);
        vMidpoint = Math.round(imp * 0.992);
        vThirdQ = Math.round(imp * 0.990);
      }

      const rowReach = Number(row.Reach || row.reach || row.total_reach || row.uniqueReachImpressionReach || 0);
      const rowFreq = rowReach > 0 ? (imp / rowReach) : 0;
      const rowVcr = imp > 0 ? (vComplete / imp * 100) : 0;
      const rowCpc = cks > 0 ? (spent / cks) : Number(row.CPC || row.cpc || 0);
      const rowCpv = Number(row.CPV || row.Cpv || row.cpv || (rowViews > 0 ? spent / rowViews : 0));
      const rowCpcv = Number(row.CPCV || row.Cpcv || row.cpcv || (vComplete > 0 ? spent / vComplete : 0));

      enrichedTableData.push({
        ...row,
        period: rowDate,
        computedInstalls: rowInstalls,
        computedConversions: rowConversions,
        computedSpend: spent,
        computedRoas: spent > 0 ? (rev / spent) : 0,
        computedCpm: imp > 0 ? (spent / imp) * 1000 : 0,
        computedCtr: imp > 0 ? (cks / imp) * 100 : 0,
        computedCpc: rowCpc,
        computedReach: rowReach,
        computedFreq: rowFreq,
        computedViews: rowViews,
        computedCpv: rowCpv,
        computedCpcv: rowCpcv,
        computedVcr: rowVcr,
        computedVideoComplete: vComplete,
        computedVideoFirstQ: vFirstQ,
        computedVideoMidpoint: vMidpoint,
        computedVideoThirdQ: vThirdQ,
      });

      totalImp += imp;
      totalClicks += cks;
      totalSpent += spent;
      totalInstalls += rowInstalls;
      totalConversions += rowConversions;
      totalRevenue += rev;
      totalReach += rowReach;
      totalVideoViews += rowViews;
      totalVideoComplete += vComplete;
      totalVideoFirstQ += vFirstQ;
      totalVideoMidpoint += vMidpoint;
      totalVideoThirdQ += vThirdQ;
    });

    const showAfMetrics = hasAppsflyerData || (hasAFConfig && totalInstalls > 0);
    const hasVideoData = !isBanner && (isVideoCampaign || totalVideoComplete > 0 || totalVideoViews > 0);
    const overallVcr = totalImp > 0 ? (totalVideoComplete / totalImp * 100) : 0;

    if (!hasAppsflyerData && showAfMetrics && enrichedTableData.length > 0) {
      enrichedTableData.forEach(r => {
        const cks = Number(r.Clicks || r.clicks || 0);
        const imp = Number(r.Impressions || r.impressions || 0);
        let share = 0;
        if (totalClicks > 0) {
          share = cks / totalClicks;
        } else if (totalImp > 0) {
          share = imp / totalImp;
        }
        if (share > 0) {
          r.computedInstalls = Math.round(totalInstalls * share);
          r.computedConversions = Math.round(totalConversions * share);
        }
      });
    }

    return {
      enrichedTableData,
      hasAppsflyerData: showAfMetrics,
      impressions: totalImp,
      clicks: totalClicks,
      installs: totalInstalls,
      conversions: totalConversions,
      revenue: totalRevenue,
      spend: totalSpent,
      reach: totalReach,
      frequency: totalReach > 0 ? (totalImp / totalReach) : 0,
      eCPM: totalImp > 0 ? (totalSpent / totalImp) * 1000 : 0,
      eCPC: totalClicks > 0 ? (totalSpent / totalClicks) : 0,
      cvr: totalInstalls > 0 ? (totalInstalls / totalImp) * 100 : 0,
      cpi: totalInstalls > 0 ? (totalSpent / totalInstalls) : 0,
      roas: totalSpent > 0 ? (totalRevenue / totalSpent) : 0,
      ctr: totalImp > 0 ? (totalClicks / totalImp) * 100 : 0,
      hasVideoData,
      totalViews: totalVideoViews,
      totalVideoViews,
      totalVideoComplete,
      totalVideoFirstQ,
      totalVideoMidpoint,
      totalVideoThirdQ,
      cpv: totalVideoViews > 0 ? (totalSpent / totalVideoViews) : 0,
      cpcv: totalVideoComplete > 0 ? (totalSpent / totalVideoComplete) : 0,
      overallVcr,
    };
  }, [tableData, appsflyerData, campaignPricing, selectedAudience, placementTypeData, creativeData]);

  // --- Data Fetching ---
  const handleApplyFilters = async () => {
    if (!search) {
      topTost("Please select a campaign/audience first.", "warning");
      return;
    }

    const searchClean = search.trim().toLowerCase();
    const selectedAud = allAudiences.find(a => {
      const name = a.reportName || a.campaignName || a.name || "";
      return name.trim().toLowerCase() === searchClean;
    });

    if (!selectedAud) {
      topTost("Campaign not found in database.", "warning");
      return;
    }

    setShowCalendar(false);
    const sDateStr = format(range[0].startDate, "yyyy-MM-dd");
    const eDateStr = format(range[0].endDate, "yyyy-MM-dd");

    localStorage.setItem("dashboardSelectedRange", JSON.stringify({
      startDate: sDateStr,
      endDate: eDateStr
    }));

    fetchDataForAudience(selectedAud, {
      startDate: range[0].startDate,
      endDate: range[0].endDate
    });
  };

  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isCsvLoading, setIsCsvLoading] = useState(false);
  const [pdfExportTime, setPdfExportTime] = useState("");

  const handleExportPDF = async () => {
    if (isPdfLoading) return;
    try {
      const nowStr = new Date().toLocaleString("en-IN", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
      setPdfExportTime(nowStr);
      setIsPdfLoading(true);

      // Allow UI to update DOM so export buttons are replaced by timestamp
      await new Promise(resolve => setTimeout(resolve, 400));

      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");
      const input = document.getElementById('dashboard-content');
      if (!input) {
        topTost("Dashboard content not found", "error");
        setIsPdfLoading(false);
        return;
      }

      const audienceName = selectedAudience?.reportName || selectedAudience?.campaignName || selectedAudience?.name || "Dashboard_Report";
      const sDate = range[0]?.startDate ? format(range[0].startDate, "dd MMM, yyyy") : "";
      const eDate = range[0]?.endDate ? format(range[0].endDate, "dd MMM, yyyy") : "";
      const dateLabel = sDate && eDate ? `${sDate} – ${eDate}` : "";

      const prevStyle = input.getAttribute('style') || '';
      input.style.cssText += `; width: ${input.scrollWidth}px !important; overflow: visible !important; max-width: none !important;`;

      const canvas = await html2canvas(input, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 0,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      input.setAttribute('style', prevStyle);

      const PAGE_W_MM = 210;
      const HDR_MM = 14;
      const PAD_MM = 4;

      const mmPerPx = PAGE_W_MM / canvas.width;
      const IMG_H_MM = canvas.height * mmPerPx;
      const PAGE_H_MM = HDR_MM + IMG_H_MM + PAD_MM;

      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [PAGE_W_MM, PAGE_H_MM],
        compress: true
      });

      // PDF Header Bar
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, PAGE_W_MM, HDR_MM, 'F');

      try {
        pdf.addImage('/images/logo360.png', 'PNG', 3, 3, 22, 9);
      } catch (_) { }

      pdf.setFontSize(11);
      pdf.setTextColor(3, 16, 53);
      pdf.setFont("helvetica", "bold");
      pdf.text(audienceName, PAGE_W_MM / 2, 9, { align: "center" });

      if (dateLabel) {
        pdf.setFontSize(7.5);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont("helvetica", "normal");
        pdf.text(dateLabel, PAGE_W_MM - 3, 9, { align: "right" });
      }

      pdf.setDrawColor(180, 188, 200);
      pdf.setLineWidth(0.5);
      pdf.line(0, HDR_MM - 1, PAGE_W_MM, HDR_MM - 1);

      const imgData = canvas.toDataURL('image/jpeg', 0.88);
      pdf.addImage(imgData, 'JPEG', 0, HDR_MM, PAGE_W_MM, IMG_H_MM);

      const cleanFileName = String(audienceName).trim().replace(/[^a-zA-Z0-9_-]/g, "_");
      pdf.save(`${cleanFileName}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
      topTost("PDF generation failed: " + (err?.message || "Unknown error"), "error");
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setIsCsvLoading(true);
    try {
      const ioId = selectedAudience?.insertionOrderId || selectedAudience?.advertiserId || getAudId(selectedAudience);
      const audId = getAudId(selectedAudience);
      const formatDateStr = (d) => {
        if (!d) return format(new Date(), "yyyy-MM-dd");
        if (typeof d === "string") return d.split("T")[0];
        return format(d, "yyyy-MM-dd");
      };
      const sDate = formatDateStr(range[0].startDate);
      const eDate = formatDateStr(range[0].endDate);

      const ctype = String(selectedAudience?.campaignType || selectedAudience?.campaign_type || "").toUpperCase();
      const isCtvWithAF = ctype.includes("CTV") && !!globalEffectiveMetrics?.hasAppsflyerData;

      const filters = {
        insertionOrderId: ioId,
        audienceId: audId,
        advertiser: getNormId(selectedAudience?.advertiserId) || getNormId(selectedAudience?.advertiser) || "",
        dateRange: {
          startDate: sDate,
          endDate: eDate
        },
        reportName: search || selectedAudience?.reportName || selectedAudience?.name || "Campaign_Report",
        campaignType: selectedAudience?.campaignType || selectedAudience?.campaign_type || "",
        isCtvWithAF,
        uiData: {
          enrichedTableData: globalEffectiveMetrics?.enrichedTableData || [],
          creativeData: creativeData || [],
          urlData: urlData || [],
          cityData: cityData || [],
          rawInstallsBreakdown: rawInstallsBreakdown || {},
          totalInstalls: globalEffectiveMetrics?.installs || 0,
          totalConversions: globalEffectiveMetrics?.conversions || 0,
          totalImpressions: globalEffectiveMetrics?.impressions || 0,
        }
      };

      await downloadExcel(filters);
    } catch (err) {
      console.error("Excel download error:", err);
      topTost("Failed to download Excel report: " + (err?.message || "Unknown error"), "error");
    } finally {
      setIsCsvLoading(false);
    }
  };

  const filteredCampaigns = campaignsList.filter(c => String(c || "").toLowerCase().includes((search || "").toLowerCase()));
  const ctype = String(selectedAudience?.campaignType || selectedAudience?.campaign_type || "").toUpperCase();
  const isCtvWithAF = ctype.includes("CTV") && !!globalEffectiveMetrics?.hasAppsflyerData;

  return (
    <div className="st-page" id="dashboard-content">
      {/* ── 3-Second Loading Overlay ── */}
      {isUpdating && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(4px)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            width: 48,
            height: 48,
            border: "4px solid #E5E7EB",
            borderTop: "4px solid #2563EB",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite"
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{ marginTop: 16, fontSize: 15, fontWeight: 700, color: "#1E293B", fontFamily: "Inter, sans-serif" }}>
            Updating Dashboard Reports...
          </div>
          <div style={{ marginTop: 6, fontSize: 12, color: "#64748B", fontFamily: "Inter, sans-serif" }}>
            Fetching latest campaign performance & analytics
          </div>
        </div>
      )}

      {/* ── Empty State for User Role with No Assigned Campaigns ── */}
      {!isUpdating && session?.user?.role === "user" && allAudiences.length === 0 ? (
        <div className="card shadow-sm border-0 rounded-4 my-5 p-5 text-center">
          <div className="card-body py-5">
            <div className="mb-3 text-muted" style={{ fontSize: "48px" }}>📋</div>
            <h4 className="fw-bold text-dark mb-2">No Campaigns Assigned</h4>
            <p className="text-muted small mb-0">
              There are currently no campaigns or audiences assigned to your account.
              <br />
              Please contact your administrator to request access.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ── Filter Bar ── */}
          <div className="st-filter-bar">
            {!isPdfLoading ? (
              <>
                <div className="st-search-wrap" ref={searchRef}>
                  <span className="st-search-icon"><SearchIcon /></span>
                  <input className="st-search" placeholder="Search campaigns, creatives, domains..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    onFocus={() => setIsFocused(true)} />
                  {search && (
                    <span
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSearch("");
                      }}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#9CA3AF",
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: "2px 6px",
                        borderRadius: "50%",
                        zIndex: 5
                      }}
                      title="Clear search"
                    >
                      ✕
                    </span>
                  )}
                  {isFocused && (
                    <div className="st-dropdown">
                      {!search && <div style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "#9CA3AF" }}>SELECT A CAMPAIGN</div>}
                      {(search ? filteredCampaigns : campaignsList.slice(0, 20)).map(c => (
                        <div
                          key={c}
                          className="st-dropdown-item"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearch(c);
                            setIsFocused(false);
                            const selectedAud = allAudiences.find(a => {
                              const name = a.reportName || a.campaignName || a.name || "";
                              return name.trim().toLowerCase() === c.trim().toLowerCase();
                            });
                            if (selectedAud) {
                              fetchDataForAudience(selectedAud, {
                                startDate: range[0].startDate,
                                endDate: range[0].endDate
                              });
                            }
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          {c}
                        </div>
                      ))}
                      {search && filteredCampaigns.length === 0 && (
                        <div style={{ padding: "12px 16px", fontSize: 13, color: "#64748B", display: "flex", alignItems: "center", gap: 8 }}>
                          <span>🔍</span>
                          <span>No campaigns found matching "<b>{search}</b>"</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ position: "relative" }} ref={calRef}>
                  <div className="st-chip" onClick={() => setShowCalendar(!showCalendar)} style={{ cursor: "pointer" }}>
                    <CalIcon />
                    <span>
                      {format(range[0].startDate, "d MMM yyyy")} – {format(range[0].endDate, "d MMM yyyy")}
                    </span>
                  </div>
                  {showCalendar && (
                    <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 8, zIndex: 100, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)", borderRadius: 12, overflow: "hidden", border: "1px solid #E5E7EB", backgroundColor: "#fff", display: "flex", flexDirection: "column", minWidth: "820px" }}>
                      <style>{`
                    .rdrMonth { width: 330px !important; padding: 0 15px !important; }
                    .rdrCalendarWrapper { font-size: 12px !important; color: #334155 !important; border-radius: 12px !important; width: 100% !important; }
                    .rdrDateDisplayWrapper { display: none !important; }
                    .rdrDay { height: 2.8em !important; line-height: 2.8em !important; }
                    .rdrMonthAndYearWrapper { padding: 10px 0 !important; height: 45px !important; }
                    .rdrMonths { 
                      gap: 20px !important; 
                      padding: 10px !important; 
                      flex-direction: row !important;
                    }
                    .rdrMonthName { font-weight: 700 !important; color: #0f172a !important; padding-bottom: 10px !important; }
                    .rdrDayNumber span { color: #334155 !important; font-weight: 500 !important; }
                    .rdrDayToday .rdrDayNumber span:after { background: #4c84ff !important; bottom: 4px !important; }
                  `}</style>
                      <div style={{ display: "flex", flexDirection: "row-reverse", backgroundColor: "#fff" }}>
                        <div style={{ borderLeft: "1px solid #E5E7EB", padding: "16px", backgroundColor: "#F8FAFC", display: "flex", flexDirection: "column", gap: "4px", width: "170px" }}>
                          <label style={{ fontWeight: 700, color: "#64748B", marginBottom: "12px", padding: "4px 8px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>Quick Select</label>
                          {[
                            { label: 'Today', key: 'today' },
                            { label: 'Yesterday', key: 'yesterday' },
                            { label: 'Last 7 days', key: 'last7days' },
                            { label: 'This Month', key: 'thisMonth' },
                            { label: 'Last Month', key: 'lastMonth' },
                            { label: 'All Time', key: 'all' }
                          ].map((btn) => (
                            <button
                              key={btn.key}
                              style={{ textAlign: "left", padding: "8px 12px", borderRadius: "8px", border: "none", fontSize: "11px", background: "transparent", fontWeight: "600", color: "#475569", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}
                              onClick={() => setPreset(btn.key)}
                              onMouseOver={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0061ff' }}
                              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569' }}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>

                        <div style={{ padding: "8px", overflow: "auto", maxWidth: "100%" }}>
                          <DateRange
                            editableDateInputs={false}
                            onChange={item => {
                              const newSel = item.selection;
                              setRange([newSel]);
                              if (newSel.startDate && newSel.endDate) {
                                const sDateStr = format(newSel.startDate, "yyyy-MM-dd");
                                const eDateStr = format(newSel.endDate, "yyyy-MM-dd");
                                localStorage.setItem("dashboardSelectedRange", JSON.stringify({
                                  startDate: sDateStr,
                                  endDate: eDateStr
                                }));
                              }
                            }}
                            moveRangeOnFirstSelection={false}
                            ranges={range}
                            months={2}
                            direction="horizontal"
                            showDateDisplay={false}
                            rangeColors={['#4c84ff']}
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", padding: "12px 24px", borderTop: "1px solid #E5E7EB", alignItems: "center", backgroundColor: "#F8FAFC" }}>
                        <button
                          style={{ background: "none", border: "none", color: "#64748B", fontWeight: "bold", padding: "6px 12px", fontSize: "11px", textTransform: "uppercase", cursor: "pointer" }}
                          onClick={() => setShowCalendar(false)}
                        >
                          Cancel
                        </button>
                        <button
                          style={{ background: "#0061ff", color: "#fff", border: "none", borderRadius: "9999px", fontWeight: "bold", padding: "6px 20px", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", cursor: "pointer" }}
                          onClick={() => setShowCalendar(false)}
                        >
                          Apply Range
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto", flexShrink: 0 }}>
                  <button
                    className="st-apply-btn"
                    onClick={handleApplyFilters}
                    disabled={isUpdating}
                    style={{ opacity: isUpdating ? 0.7 : 1, cursor: isUpdating ? "not-allowed" : "pointer" }}
                  >
                    {isUpdating ? 'Applying...' : 'Apply Filters'}
                  </button>

                  {/* Export Buttons */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#FEE2E2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                      onClick={handleExportPDF}
                    >
                      <FiFileText size={14} />
                      Export PDF
                    </button>
                    <button
                      style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#DCFCE7", color: "#16A34A", border: "1px solid #BBF7D0", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
                      onClick={handleExportCSV} disabled={isCsvLoading}
                    >
                      <FiDownload size={14} />
                      {isCsvLoading ? 'Exporting...' : 'Export EXCEL'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#F8FAFC", color: "#334155", border: "1px solid #CBD5E1", borderRadius: "8px", padding: "6px 12px", fontSize: "11px", fontWeight: 600, whiteSpace: "nowrap" }}>
                  <span style={{ color: "#2563EB" }}>🕒</span>
                  <span>Report Generated: <b>{pdfExportTime}</b></span>
                </div>
              </div>
            )}
          </div>

          {search.trim() !== "" && campaignsList.length > 0 && filteredCampaigns.length === 0 ? (
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              padding: "60px 24px",
              margin: "24px 16px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
              border: "1px solid #E2E8F0"
            }}>
              <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔍</div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#0F172A", marginBottom: "8px" }}>
                No Results Found
              </h3>
              <p style={{ fontSize: "14px", color: "#64748B", maxWidth: "420px", margin: "0 auto 24px auto", lineHeight: 1.5 }}>
                No campaigns match <b>"{search}"</b>. Please check your spelling or search for another campaign.
              </p>
              <button
                onClick={() => setSearch("")}
                style={{
                  backgroundColor: "#2563EB",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "999px",
                  padding: "10px 28px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)"
                }}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <>
              {/* ── Campaign Info Banner ── */}
              {search && !isPdfLoading && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 24px", background: "linear-gradient(90deg, #1E3A8A 0%, #2563EB 100%)",
                  color: "#fff", margin: "-16px 0 0 0", gap: 16, flexWrap: "wrap"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 6px #4ADE80" }} />
                    <span style={{ fontSize: 14, fontWeight: 700 }}>{search}</span>
                    <span style={{ fontSize: 11, background: "rgba(255,255,255,0.15)", padding: "2px 10px", borderRadius: 999, fontWeight: 600 }}>
                      {format(range[0].startDate, "d MMM yyyy")} – {format(range[0].endDate, "d MMM yyyy")}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, opacity: 0.85 }}>
                    <span>Impressions: <b style={{ color: "#86EFAC" }}>{(globalEffectiveMetrics.impressions || 0).toLocaleString('en-IN')}</b></span>
                    {!isCtvWithAF && (<><span>Clicks: <b style={{ color: "#93C5FD" }}>{(globalEffectiveMetrics.clicks || 0).toLocaleString('en-IN')}</b></span>
                      <span>CTR: <b style={{ color: "#FCD34D" }}>{(globalEffectiveMetrics.ctr || 0).toFixed(2)}%</b></span></>)}

                    {globalEffectiveMetrics.reach > 0 && (
                      <span>Reach: <b style={{ color: "#FCA5A5" }}>{(globalEffectiveMetrics.reach || 0).toLocaleString('en-IN')}</b></span>
                    )}
                  </div>
                </div>
              )}

              {/* ── Quantico-Style KPI Cards Grid ── */}
              <div className="st-kpi-grid">

                {/* IMPRESSIONS */}
                <div className="st-kpi-card-q">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: "#E0F2FE", color: "#0284C7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                      📊
                    </div>
                    <ExpandIcon />
                  </div>
                  <div className="st-kpi-tag">IMPRESSIONS</div>
                  <div className="st-kpi-num">{(globalEffectiveMetrics.impressions || 0).toLocaleString('en-IN')}</div>
                </div>

                {/* CLICKS & CTR */}
                {!isCtvWithAF && (
                  <div className="st-kpi-card-q">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                        ⚡
                      </div>
                      <ExpandIcon />
                    </div>
                    <div className="st-kpi-tag">CLICKS & CTR</div>
                    <div className="st-kpi-num">{(globalEffectiveMetrics.clicks || 0).toLocaleString('en-IN')}</div>
                    <div className="st-kpi-meta" style={{ marginBottom: 4 }}>CTR: <b>{(globalEffectiveMetrics.ctr || 0).toFixed(2)}%</b> · eCPC: <b>₹{(globalEffectiveMetrics.eCPC || 0).toFixed(2)}</b></div>
                  </div>
                )}

                {/* REACH & FREQUENCY */}
                {globalEffectiveMetrics.reach > 0 && (
                  <div className="st-kpi-card-q">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FCE7F3", color: "#BE185D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                        🎯
                      </div>
                      <ExpandIcon />
                    </div>
                    <div className="st-kpi-tag">REACH & FREQUENCY</div>
                    <div className="st-kpi-num">{(globalEffectiveMetrics.reach || 0).toLocaleString('en-IN')}</div>
                    <div className="st-kpi-meta" style={{ marginBottom: 4 }}>Freq: <b>{(globalEffectiveMetrics.frequency || 0).toFixed(2)}×</b></div>
                  </div>
                )}

                {/* INSTALLS */}
                {globalEffectiveMetrics.hasAppsflyerData && (
                  <div className="st-kpi-card-q">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#D1FAE5", color: "#059669", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                        📲
                      </div>
                      <ExpandIcon />
                    </div>
                    <div className="st-kpi-tag">INSTALLS</div>
                    <div className="st-kpi-num">{(globalEffectiveMetrics.installs || 0).toLocaleString('en-IN')}</div>
                  </div>
                )}

                {/* CONVERSIONS */}
                {globalEffectiveMetrics.hasAppsflyerData && (
                  <div className="st-kpi-card-q">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FEF3C7", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                        🏆
                      </div>
                      <ExpandIcon />
                    </div>
                    <div className="st-kpi-tag">TOTAL CONVERSIONS</div>
                    <div className="st-kpi-num">{(globalEffectiveMetrics.conversions || 0).toLocaleString('en-IN')}</div>
                  </div>
                )}

                {/* VIDEO COMPLETIONS & VCR */}
                {!isCtvWithAF && globalEffectiveMetrics.hasVideoData && (
                  <div className="st-kpi-card-q">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F0FDF4", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                        🎬
                      </div>
                      <ExpandIcon />
                    </div>
                    <div className="st-kpi-tag">VIDEO COMPLETIONS & VCR</div>
                    <div className="st-kpi-num">{(globalEffectiveMetrics.totalVideoComplete || 0).toLocaleString('en-IN')}</div>
                    <div className="st-kpi-meta" style={{ marginBottom: 4 }}>VCR: <b>{(globalEffectiveMetrics.overallVcr || 0).toFixed(2)}%</b></div>
                  </div>
                )}

                {/* SPEND & eCPM */}
                {!isCtvWithAF && (
                  <div className="st-kpi-card-q">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F3E8FF", color: "#8B5CF6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                        💎
                      </div>
                      <ExpandIcon />
                    </div>
                    <div className="st-kpi-tag">TOTAL SPEND & eCPM</div>
                    <div className="st-kpi-num">₹{(globalEffectiveMetrics.spend || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    <div className="st-kpi-meta" style={{ marginBottom: 4 }}>eCPM: <b>₹{(globalEffectiveMetrics.eCPM || 0).toFixed(2)}</b> · ROAS: <b>{(globalEffectiveMetrics.roas || 0).toFixed(2)}×</b></div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                      <div className="st-badge-up" style={{ background: "#F3E8FF", color: "#7C3AED" }}>↑ 1.15×</div>
                      <SparklinePurple />
                    </div>
                  </div>
                )}

              </div>

              {/* ── Trend Analysis ── */}
              <TrendChart tableData={globalEffectiveMetrics.enrichedTableData} hasAppsflyerData={globalEffectiveMetrics.hasAppsflyerData} selectedAudience={selectedAudience} />

              {/* ── Performance Table ── */}
              {(() => {
                const PERF_PAGE_SIZE = 10;
                const perfData = globalEffectiveMetrics.enrichedTableData;
                const perfTotalPages = Math.ceil(perfData.length / PERF_PAGE_SIZE) || 1;
                const perfFrom = perfData.length === 0 ? 0 : (perfPage - 1) * PERF_PAGE_SIZE + 1;
                const perfTo = Math.min(perfPage * PERF_PAGE_SIZE, perfData.length);
                const perfRows = perfData.slice((perfPage - 1) * PERF_PAGE_SIZE, perfPage * PERF_PAGE_SIZE);
                const ctype = String(selectedAudience?.campaignType || selectedAudience?.campaign_type || "").toUpperCase();
                const isCtvWithAF = ctype.includes("CTV") && !!globalEffectiveMetrics?.hasAppsflyerData;
                const colSpan = (6 + (globalEffectiveMetrics.hasVideoData ? 7 : 0) + (globalEffectiveMetrics.reach > 0 ? 2 : 0) + (globalEffectiveMetrics.hasAppsflyerData ? 2 : 0)) - (isCtvWithAF ? (globalEffectiveMetrics.hasVideoData ? 7 : 5) : 0);
                return (
                  <div className="st-panel" style={{ paddingBottom: 0, overflow: "hidden" }}>
                    <div className="st-panel-header">
                      <div>
                        <div className="st-panel-title">Performance</div>
                        <div className="st-panel-sub">Showing <b>{perfFrom}</b> to <b>{perfTo}</b> of <b>{perfData.length}</b> entries</div>
                      </div>
                      <TablePagination
                        currentPage={perfPage}
                        totalPages={perfTotalPages}
                        onPrev={() => setPerfPage(p => Math.max(1, p - 1))}
                        onNext={() => setPerfPage(p => Math.min(perfTotalPages, p + 1))}
                      />
                    </div>
                    <div style={{ overflowX: "auto", width: "calc(100% + 44px)", margin: "0 -22px" }}>
                      <table className="st-table" style={{ width: "100%", minWidth: "100%", tableLayout: "auto" }}>
                        <thead>
                          <tr>
                            <th style={{ paddingLeft: "22px" }}>PERIOD</th>
                            <th>IMPRESSIONS</th>
                            {globalEffectiveMetrics.reach > 0 && <th>REACH</th>}
                            {globalEffectiveMetrics.reach > 0 && <th>FREQUENCY</th>}
                            {!isCtvWithAF && <th>CPM</th>}
                            {globalEffectiveMetrics.hasVideoData && <th>VIEWS</th>}
                            {globalEffectiveMetrics.hasVideoData && !isCtvWithAF && <th>CPV</th>}
                            {!isCtvWithAF && <th>CLICKS</th>}
                            {!isCtvWithAF && <th>CPC</th>}
                            {globalEffectiveMetrics.hasVideoData && <th>1ST QUARTILE VIEWS</th>}
                            {globalEffectiveMetrics.hasVideoData && <th>MIDPOINT VIEWS</th>}
                            {globalEffectiveMetrics.hasVideoData && <th>3RD QUARTILE VIEWS</th>}
                            {globalEffectiveMetrics.hasVideoData && <th>COMPLETE VIEW</th>}
                            {globalEffectiveMetrics.hasVideoData && !isCtvWithAF && <th>CPCV</th>}
                            {globalEffectiveMetrics.hasAppsflyerData && <th>INSTALLS</th>}
                            {globalEffectiveMetrics.hasAppsflyerData && <th style={{ paddingRight: isCtvWithAF ? "22px" : "auto" }}>TOTAL CONVERSIONS</th>}
                            {!isCtvWithAF && <th>CTR</th>}
                            {!isCtvWithAF && <th style={{ paddingRight: "22px" }}>SPEND</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {perfRows.length > 0 ? (
                            perfRows.map((r, i) => (
                              <tr key={i} className="st-tr">
                                <td style={{ paddingLeft: "22px", whiteSpace: "nowrap" }}>{r.period || "-"}</td>
                                <td>{Number(r.Impressions || r.impressions || 0).toLocaleString('en-IN')}</td>
                                {globalEffectiveMetrics.reach > 0 && <td>{Number(r.computedReach || 0).toLocaleString('en-IN')}</td>}
                                {globalEffectiveMetrics.reach > 0 && <td>{r.computedFreq ? r.computedFreq.toFixed(2) : "0.00"}</td>}
                                {!isCtvWithAF && <td>₹{r.computedCpm.toFixed(2)}</td>}
                                {globalEffectiveMetrics.hasVideoData && <td>{Number(r.computedViews || 0).toLocaleString('en-IN')}</td>}
                                {globalEffectiveMetrics.hasVideoData && !isCtvWithAF && <td>₹{r.computedCpv ? r.computedCpv.toFixed(2) : "0.00"}</td>}
                                {!isCtvWithAF && <td>{Number(r.Clicks || r.clicks || 0).toLocaleString('en-IN')}</td>}
                                {!isCtvWithAF && <td>₹{r.computedCpc ? r.computedCpc.toFixed(2) : "0.00"}</td>}
                                {globalEffectiveMetrics.hasVideoData && <td>{Number(r.computedVideoFirstQ || 0).toLocaleString('en-IN')}</td>}
                                {globalEffectiveMetrics.hasVideoData && <td>{Number(r.computedVideoMidpoint || 0).toLocaleString('en-IN')}</td>}
                                {globalEffectiveMetrics.hasVideoData && <td>{Number(r.computedVideoThirdQ || 0).toLocaleString('en-IN')}</td>}
                                {globalEffectiveMetrics.hasVideoData && <td>{Number(r.computedVideoComplete || 0).toLocaleString('en-IN')}</td>}
                                {globalEffectiveMetrics.hasVideoData && !isCtvWithAF && <td>₹{r.computedCpcv ? r.computedCpcv.toFixed(2) : "0.00"}</td>}
                                {globalEffectiveMetrics.hasAppsflyerData && <td>{Number(r.computedInstalls || 0).toLocaleString('en-IN')}</td>}
                                {globalEffectiveMetrics.hasAppsflyerData && <td style={{ paddingRight: isCtvWithAF ? "22px" : "auto" }}>{Number(r.computedConversions || 0).toLocaleString('en-IN')}</td>}
                                {!isCtvWithAF && <td>{r.computedCtr.toFixed(2)}%</td>}
                                {!isCtvWithAF && <td style={{ paddingRight: "22px" }}>₹{r.computedSpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={colSpan} style={{ textAlign: "center", padding: "24px", color: "#6B7280" }}>
                                No data available. Please select a campaign and date range, then click Apply Filters.
                              </td>
                            </tr>
                          )}
                          {perfData.length > 0 && (
                            <tr className="st-tr-total">
                              <td style={{ paddingLeft: "22px" }}>Total</td>
                              <td>{(globalEffectiveMetrics.impressions || 0).toLocaleString('en-IN')}</td>
                              {globalEffectiveMetrics.reach > 0 && <td>{(globalEffectiveMetrics.reach || 0).toLocaleString('en-IN')}</td>}
                              {globalEffectiveMetrics.reach > 0 && <td>{(globalEffectiveMetrics.frequency || 0).toFixed(2)}</td>}
                              {!isCtvWithAF && <td>₹{(globalEffectiveMetrics.eCPM || 0).toFixed(2)}</td>}
                              {globalEffectiveMetrics.hasVideoData && <td>{(globalEffectiveMetrics.totalViews || globalEffectiveMetrics.totalVideoViews || 0).toLocaleString('en-IN')}</td>}
                              {globalEffectiveMetrics.hasVideoData && !isCtvWithAF && <td>₹{globalEffectiveMetrics.cpv ? globalEffectiveMetrics.cpv.toFixed(2) : "0.00"}</td>}
                              {!isCtvWithAF && <td>{(globalEffectiveMetrics.clicks || 0).toLocaleString('en-IN')}</td>}
                              {!isCtvWithAF && <td>₹{(globalEffectiveMetrics.eCPC || 0).toFixed(2)}</td>}
                              {globalEffectiveMetrics.hasVideoData && <td>{(globalEffectiveMetrics.totalVideoFirstQ || 0).toLocaleString('en-IN')}</td>}
                              {globalEffectiveMetrics.hasVideoData && <td>{(globalEffectiveMetrics.totalVideoMidpoint || 0).toLocaleString('en-IN')}</td>}
                              {globalEffectiveMetrics.hasVideoData && <td>{(globalEffectiveMetrics.totalVideoThirdQ || 0).toLocaleString('en-IN')}</td>}
                              {globalEffectiveMetrics.hasVideoData && <td>{(globalEffectiveMetrics.totalVideoComplete || 0).toLocaleString('en-IN')}</td>}
                              {globalEffectiveMetrics.hasVideoData && !isCtvWithAF && <td>₹{globalEffectiveMetrics.cpcv ? globalEffectiveMetrics.cpcv.toFixed(2) : "0.00"}</td>}
                              {globalEffectiveMetrics.hasAppsflyerData && <td>{(globalEffectiveMetrics.installs || 0).toLocaleString('en-IN')}</td>}
                              {globalEffectiveMetrics.hasAppsflyerData && <td style={{ paddingRight: isCtvWithAF ? "22px" : "auto" }}>{(globalEffectiveMetrics.conversions || 0).toLocaleString('en-IN')}</td>}
                              {!isCtvWithAF && <td>{(globalEffectiveMetrics.ctr || 0).toFixed(2)}%</td>}
                              {!isCtvWithAF && <td style={{ paddingRight: "22px" }}>₹{(globalEffectiveMetrics.spend || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>}
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}


              {!isCtvWithAF && (<CreativePerformanceChart creativeData={creativeData} totalReach={globalEffectiveMetrics.reach} selectedAudience={selectedAudience} hasAppsflyerData={globalEffectiveMetrics.hasAppsflyerData} />)}
              <CreativeDetails creativeData={creativeData} campaignPricing={campaignPricing} globalEffectiveMetrics={globalEffectiveMetrics} selectedAudience={selectedAudience} />
              <UrlTable urlData={urlData} campaignPricing={campaignPricing} globalEffectiveMetrics={globalEffectiveMetrics} selectedAudience={selectedAudience} />
              <DomainDistribution domainData={cityData} campaignPricing={campaignPricing} globalEffectiveMetrics={globalEffectiveMetrics} rawInstallsBreakdown={rawInstallsBreakdown} selectedAudience={selectedAudience} />
              {
                !isCtvWithAF && (<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
                  <PlacementPositionPanel placementPosData={placementPosData} />
                  <PlacementTypePanel placementTypeData={placementTypeData} />
                </div>)
              }
              {
                !isCtvWithAF && (<PlatformAnalysis deviceData={deviceData} platformData={placementTypeData} />)
              }

              <DeliveryByWeekday weekData={weekData} tableData={globalEffectiveMetrics.enrichedTableData} />
              <AttributionRevenueTraffic
                operatorData={operatorData}
                browserData={browserData}
                cityData={cityData}
                globalEffectiveMetrics={globalEffectiveMetrics}
                selectedAudience={selectedAudience}
                rawInstallsBreakdown={rawInstallsBreakdown}
              />
              {
                !isCtvWithAF && (<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 12, margin: "0 16px" }}>
                  <GenderChart genderData={genderData} />
                  <AgeChart ageData={ageData} />
                </div>)
              }


              <BrowsersOperatorsTables browserData={browserData} operatorData={operatorData} campaignPricing={campaignPricing} globalEffectiveMetrics={globalEffectiveMetrics} selectedAudience={selectedAudience} rawInstallsBreakdown={rawInstallsBreakdown} />
            </>
          )}
        </>
      )}

      {/* ── Styles ── */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .st-page {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #F4F6FB;
          min-height: 100%;
          padding: 0 0 32px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          color: #0F172A;
          font-size: 13px;
        }

        /* Quantico KPI Grid & Cards */
        .st-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin: 0 16px;
        }
        .st-kpi-card-q {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 12px 14px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .st-kpi-card-q:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
        }
        .st-kpi-tag {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #64748B; margin-bottom: 2px;
        }
        .st-kpi-num {
          font-size: 22px; font-weight: 800; color: #0F172A;
          letter-spacing: -0.5px; margin: 2px 0 4px; line-height: 1.1;
          font-variant-numeric: tabular-nums;
        }
        .st-badge-up {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 10px; font-weight: 700;
          padding: 2px 6px; border-radius: 4px;
          background: #DCFCE7; color: #15803D;
          width: fit-content;
        }
        .st-filter-bar {
          background: #fff;
          border-bottom: 1px solid #E5E7EB;
          padding: 8px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: nowrap;
          position: sticky;
          top: 0;
          z-index: 20;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .st-search-wrap { position: relative; flex: 1; min-width: 180px; max-width: 320px; }
        .st-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; display: flex; }
        .st-search {
          width: 100%; height: 32px; padding: 0 12px 0 30px;
          border: 1.5px solid #E5E7EB; border-radius: 6px;
          font-size: 12px; color: #374151; background: #F9FAFB;
          outline: none; font-family: inherit; transition: border-color 0.2s;
        }
        .st-search:focus { border-color: #2563EB; background: #fff; }
        .st-dropdown {
          position: absolute; top: calc(100% + 4px); left: 0; width: 100%;
          background: #fff; border: 1px solid #E5E7EB; border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 4px 0; z-index: 50;
          max-height: 220px; overflow-y: auto;
        }
        .st-dropdown-item {
          padding: 6px 10px; font-size: 12px; color: #374151; cursor: pointer;
          transition: background 0.15s;
        }
        .st-dropdown-item:hover { background: #F9FAFB; }
        .st-chip {
          display: flex; align-items: center; gap: 6px;
          height: 32px; padding: 0 10px;
          border: 1.5px solid #E5E7EB; border-radius: 6px;
          font-size: 12px; color: #374151; background: #F9FAFB;
          cursor: pointer; white-space: nowrap; font-family: inherit;
          transition: border-color 0.2s, background 0.2s;
        }
        .st-chip:hover { border-color: #2563EB; background: #fff; }
        .st-apply-btn {
          margin-left: auto; height: 32px; padding: 0 14px;
          border-radius: 6px; border: none; background: #2563EB;
          color: #fff; font-size: 12px; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: background 0.2s; white-space: nowrap;
        }
        .st-apply-btn:hover { background: #1D4ED8; }

        /* KPI Row */
        .st-kpi-row {
          display: grid;
          grid-template-columns: 200px 1fr 1fr 1fr;
          margin: 0 16px;
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .st-kpi-card {
          padding: 12px 14px;
          border-right: 1px solid #E9EEF5;
          display: flex;
          flex-direction: column;
        }
        .st-kpi-card:last-child { border-right: none; }
        .st-kpi-tag {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #9CA3AF; margin-bottom: 2px;
        }
        .st-kpi-num {
          font-size: 24px; font-weight: 700; color: #111827;
          letter-spacing: -0.5px; margin: 2px 0 4px; line-height: 1.1;
        }
        .st-badge-up {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 11px; font-weight: 600;
          padding: 2px 7px; border-radius: 999px;
          background: #DCFCE7; color: #16A34A;
          width: fit-content; margin-bottom: 2px;
        }
        .st-kpi-meta { font-size: 11px; color: #6B7280; }
        .st-kpi-meta b { color: #374151; font-weight: 600; }
        .st-kpi-sub { font-size: 11px; color: #9CA3AF; }
        .st-kpi-sub b { color: #374151; font-weight: 600; }
        .st-progress-track {
          height: 4px; border-radius: 999px;
          background: #F3F4F6; overflow: hidden; margin-top: 6px;
        }
        .st-progress-fill { height: 100%; border-radius: inherit; transition: width 0.6s ease; }

        /* Panels */
        .st-panel {
          margin: 0 16px;
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          padding: 14px 16px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .st-panel-header {
          display: flex; align-items: flex-start;
          justify-content: space-between; margin-bottom: 10px;
          gap: 8px; flex-wrap: wrap;
        }
        .st-panel-title { font-size: 14px; font-weight: 600; color: #111827; margin-bottom: 2px; }
        .st-panel-sub { font-size: 11px; color: #9CA3AF; }

        /* Legend button */
        .st-legend-btn {
          display: flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 500; color: #374151;
          border: none; background: transparent; cursor: pointer;
          padding: 2px 0; font-family: inherit; transition: opacity 0.15s;
        }
        .st-legend-dot { width: 8px; height: 8px; border-radius: 2px; display: inline-block; flex-shrink: 0; }

        /* Table */
        .st-table { width: 100%; min-width: 100%; border-collapse: separate; border-spacing: 0; table-layout: auto; font-variant-numeric: tabular-nums; }
        .st-table thead tr { background: #F8FAFC; }
        .st-table th {
          padding: 8px 12px; text-align: left; font-size: 11px;
          font-weight: 700; color: #475569; text-transform: uppercase;
          letter-spacing: 0.06em; white-space: nowrap; background: #F8FAFC;
          border-bottom: 1.5px solid #E2E8F0;
        }
        .st-tr { border-bottom: 1px solid #F1F5F9; transition: background-color 0.15s ease; }
        .st-tr:hover { background: #F8FAFC !important; }
        .st-table td { padding: 9px 12px; font-size: 12.5px; color: #1E293B; border-bottom: 1px solid #F1F5F9; vertical-align: middle; white-space: nowrap; }
        .st-tr-total { background: #EFF6FF !important; }
        .st-tr-total td { background: #EFF6FF !important; color: #1E40AF !important; font-weight: 800 !important; font-size: 13.5px !important; border-top: 2px solid #3B82F6 !important; border-bottom: none !important; padding: 14px 16px !important; }
        .st-badge-ctr { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 6px; background: #DCFCE7; color: #15803D; font-weight: 700; font-size: 12px; }
        .st-badge-cpm { display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 6px; background: #F1F5F9; color: #334155; font-weight: 600; font-size: 12px; }

        /* Download button */
        .st-dl-btn {
          display: flex; align-items: center; gap: 5px;
          height: 30px; padding: 0 12px;
          border-radius: 7px; border: 1.5px solid #E5E7EB;
          background: #fff; font-size: 12px; font-weight: 600;
          color: #374151; cursor: pointer; font-family: inherit;
          transition: all 0.15s; white-space: nowrap;
        }
        .st-dl-btn:hover { border-color: #2563EB; color: #2563EB; background: #EFF6FF; }

        /* 6-metric row */
        .st-metric-row {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          margin: 0 24px;
          background: #fff;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .st-metric-card {
          padding: 14px 16px;
          border-right: 1px solid #E9EEF5;
        }
        .st-metric-card:last-child { border-right: none; }
        .st-metric-val { font-size: 22px; font-weight: 700; color: #111827; margin: 5px 0 3px; line-height: 1.1; }

        /* Video badge */
        .st-video-tag {
          font-size: 11px; font-weight: 700; color: #2563EB;
          border: 1.5px solid #2563EB; border-radius: 5px;
          padding: 2px 8px; letter-spacing: 0.08em;
        }

        /* Creative cards */
        .st-creative-card {
          border: 1px solid #E9EEF5; border-radius: 10px; padding: 14px;
          transition: box-shadow 0.15s;
        }
        .st-creative-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .st-creative-name { font-size: 13px; font-weight: 600; color: #111827; }
        .st-creative-sub  { font-size: 11px; color: #6B7280; margin-top: 2px; }
        .st-creative-badge {
          font-size: 10px; font-weight: 700;
          padding: 3px 8px; border-radius: 999px; white-space: nowrap;
        }

        /* Legend items */
        .st-leg-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: #374151; font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .st-kpi-row { grid-template-columns: 1fr 1fr; }
          .st-metric-row { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 900px) {
          .st-kpi-row { grid-template-columns: 1fr; }
          .st-metric-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 700px) {
          .st-page { gap: 12px; padding-bottom: 32px; }
          .st-filter-bar { padding: 10px 14px; }
          .st-panel, .st-kpi-row, .st-metric-row { margin: 0 12px; }
          .st-metric-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

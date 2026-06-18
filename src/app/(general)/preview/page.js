"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";
import { getCurrencySymbol } from "@/utils/currencySymbol";
import PerformanceDashboard from "./components/PerformanceChart";
import TableWithDynamicColumns from "./components/Campaigns/DataTable";
import DashboardHeader from "./components/Campaigns/DashboardHeader";
import ReportsFilter from "./components/Campaigns/FilterSection";
import CreativePerformance from "./components/Creative/CreativePerformance";
import DeviceDistribution from "./components/Device/DeviceDistribution";
import CityDistribution from "./components/City/CityDistribution";
import {
  getCampaignData,
  getCampaignDataByAge,
  getCampaignDataByGender,
} from "@/services/campaignData";
import WeekdayDistribution from "./components/Campaigns/WeekdayDistribution";
import CreativeTable from "./components/Creative/CreativeTable";
import { getCreativeData } from "@/services/creativeData";
import GenderChart from "./components/Age/GenderChart";
import AgeChart from "./components/Age/AgeChart";
import OsPerformance from "./components/OS/OsPerformance";
import OsDistribution from "./components/OS/OsDistribution";
import OsTable from "./components/OS/OsTable";
import BrowserPerformance from "./components/Browser/BrowserPerformance";
import BrowserDistribution from "./components/Browser/BrowserDistribution";
import BrowserTable from "./components/Browser/BrowserTable";
import OperatorPerformance from "./components/Operator/OperatorPerformance";
import OperatorDistribution from "./components/Operator/OperatorDistribution";
import OperatorTable from "./components/Operator/OperatorTable";
import UrlPerformance from "./components/Url/UrlPerformance";
import UrlDistribution from "./components/Url/UrlDistribution";
import UrlTable from "./components/Url/UrlTable";
import PlacementPosDistribution from "./components/Placement/PlacementPosDistribution";
import PlacementTypeDistribution from "./components/Placement/PlacementTypeDistribution";
import {
  getCampaignDataByOses,
  getCampaignDataByBrowser,
  getCampaignDataByOperator,
  getCampaignDataByPlacementPos,
  getCampaignDataByPlacementType,
  getCampaignDataByDevice,
  getCampaignDataByCity,
} from "@/services/campaignData";
import { getDailyReportsByRange as getOvDataByRange } from "@/services/reports";
import { getDailyReportsByRange as getDeviceDataByRange } from "@/services/device";
import { getDailyReportsByRange as getAgeDataByRange } from "@/services/demographics";
import { getDailyReportsByRangeCity } from "@/services/city";
import { getDailyReportsByRangeOs } from "@/services/os";
import { getDailyReportsByRangeBrowser } from "@/services/browser";
import { getDailyReportsByRangeOperator } from "@/services/operator";
import { getDailyReportsByRangeAdPos } from "@/services/ad-pos";
import { getDailyReportsByRangeAdType } from "@/services/ad-type";
import { getDailyReportsByRangeUrl } from "@/services/url";
import { createReportsDataCreative, getDailyReportsByRangeCreative } from "@/services/creative";
import {
  createReportsData,
  createReportsDataDevice,
  createReportsDataOs,
  createReportsDataBrowser,
  createReportsDataOperator,
  createReportsDataAdPos,
  createReportsDataAdType,
} from "@/services/reports"; // Assuming consolidated or imported from respective files
import { createReportsDataAge as createAgeSync } from "@/services/demographics";
import { createReportsDataDevice as createDeviceSync } from "@/services/device";
import { createReportsDataCity as createCitySync } from "@/services/city";
import { createReportsDataOs as createOsSync } from "@/services/os";
import { createReportsDataBrowser as createBrowserSync } from "@/services/browser";
import { createReportsDataOperator as createOperatorSync } from "@/services/operator";
import { createReportsDataAdPos as createAdPosSync } from "@/services/ad-pos";
import { createReportsDataAdType as createAdTypeSync } from "@/services/ad-type";
import { getAudience } from "@/services/createaudience";
import { filterMetadataRows } from "@/utils/filterMetadata";
import { createReportsDataCreativeSize } from "@/services/creative-size";
import { getAppsFlyerSyncData, getAppsFlyerByAudienceId } from "@/services/appsflyer";

// Main Dashboard Component
const CampaignDashboard = () => {
  const [tableData, setTableData] = useState({ tableData: [], graphData: [] });
  const [ageData, setAgeData] = useState({ tableData: [], graphData: [] });
  const [genderData, setGenderData] = useState({
    tableData: [],
    graphData: [],
  });
  const [osData, setOsData] = useState({ tableData: [], graphData: [] });
  const [browserData, setBrowserData] = useState({
    tableData: [],
    graphData: [],
  });
  const [operatorData, setOperatorData] = useState({
    tableData: [],
    graphData: [],
  });
  const [placementPosData, setPlacementPosData] = useState({
    tableData: [],
    graphData: [],
  });
  const [placementTypeData, setPlacementTypeData] = useState({
    tableData: [],
    graphData: [],
  });
  const [deviceData, setDeviceData] = useState({
    tableData: [],
    graphData: [],
  });
   const [cityData, setCityData] = useState({
    tableData: [],
    graphData: [],
  });
  const [urlData, setUrlData] = useState({
    tableData: [],
    graphData: [],
  });
  const [totalData, setTotalData] = useState({ tableData: [], graphData: [] });
  const [CreativeTableData, setCreativeTableData] = useState({
    tableData: [],
    graphData: [],
  });
  const [appsflyerData, setAppsflyerData] = useState([]);
  const [weekData, setWeekData] = useState([]);
  const [filters, setFilters] = useState({
    advertiser: "",
    campaign: [],
    dateRange: {
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
    },
    report_by: "byDate",
    source: "Eskimi",
    insertionOrderId: "",
    audienceId: "",
    currency: "",
    campaignType: "",
    appsflyerCampaignType: "", // Added appsflyerCampaignType
    appsflyerDataLength: 0, 
    app_id: "", // Added app_id
  });
  const [isUpdating, setIsUpdating] = useState(true);

  // Force show loader for 3 seconds on initial page load / refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsUpdating(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleUpdate = () => {
    const filtersToSave = { ...filters };
    delete filtersToSave.appsflyerDataLength;
    delete filtersToSave.app_id;
    delete filtersToSave.conversionEvent;
    delete filtersToSave.appsflyerCampaignType;
    localStorage.setItem("campaignFilteredData", JSON.stringify(filtersToSave));
    setIsUpdating(true);
    
    // Explicitly fetch data when the update button is clicked
    fetchAllData(filters);
    
    // Force show loader for 3 seconds as requested
    setTimeout(() => {
      setIsUpdating(false);
    }, 3000);
  };

  const { data: session } = useSession();
  const [userPermissions, setUserPermissions] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [campaignPermissions, setCampaignPermissions] = useState([]);
  const [allAudiences, setAllAudiences] = useState([]);
  const [campaignPricing, setCampaignPricing] = useState({ cpm: {}, cpc: {}, impression: {} });

  useEffect(() => {
    const fetchAudiences = async () => {
      try {
        const res = await getAudience();
        if (res?.data) {
          setAllAudiences(res.data);
        }
      } catch (error) {
        console.error("Failed to fetch audiences for permissions", error);
      }
    };
    fetchAudiences();
  }, []);

  const getNormalizedId = (id) => {
    if (!id) return null;
    return (typeof id === 'object' && id?.$oid) ? id.$oid : String(id);
  };

  useEffect(() => {
    if (filters.audienceId && allAudiences.length > 0) {
      const targetId = getNormalizedId(filters.audienceId);
      const selectedAud = allAudiences.find(a => getNormalizedId(a._id) === targetId);
      setCampaignPermissions(selectedAud?.permissions || []);
      setCampaignPricing({
        cpm: typeof selectedAud?.cpm === 'object' ? selectedAud.cpm : {},
        cpc: typeof selectedAud?.cpc === 'object' ? selectedAud.cpc : {},
        impression: typeof selectedAud?.impression === 'object' ? selectedAud.impression : {}
      });

      // Sync reportName and fetch conversionEvent
      if (selectedAud) {
        setFilters(prev => {
          let updated = { ...prev };
          let changed = false;
          if (prev.reportName !== selectedAud.reportName) {
            updated.reportName = selectedAud.reportName;
            changed = true;
          }
          if (prev.audienceEndDate !== selectedAud.endDate) {
            updated.audienceEndDate = selectedAud.endDate;
            changed = true;
          }
          return changed ? updated : prev;
        });
      }
    } else {
      setCampaignPermissions([]);
      setCampaignPricing({ cpm: {}, cpc: {}, impression: {} });
      setFilters(prev => {
        if (prev.audienceEndDate) {
          const { audienceEndDate, ...rest } = prev;
          return rest;
        }
        return prev;
      });
    }
  }, [filters.audienceId, allAudiences]);

  useEffect(() => {
    if (session?.user?.permissions) {
      setUserPermissions(session.user.permissions);
      setUserRole(session.user.role || "");
    } else if (session?.user?.token) {
      try {
        const decoded = jwtDecode(session.user.token);
        setUserPermissions(decoded.permissions || []);
        setUserRole(decoded.role || "");
      } catch (e) {
        console.error("Token decode error", e);
      }
    }
  }, [session]);

  const hasPermission = (key) => {
    if (userRole === "super_admin") return true;
    const lowerKey = key.toLowerCase();
    
    // Campaign-level restrictions apply to all non-admin users
    const isCampaignRestricted = campaignPermissions.some(p => p.toLowerCase() === lowerKey);
    if (isCampaignRestricted) return false;
    
    // User-level restrictions
    const isUserRestricted = userPermissions.some(p => p.toLowerCase() === lowerKey);
    return !isUserRestricted;
  };

  console.log("Filters in Dashboard:", filters);

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

  const extractData = (res, specificKey) => {
    let tData = [],
      gData = [];

    // Check if response itself is the specific key or contains it
    const data = res?.data || res;
    const target = specificKey ? data[specificKey] || data : data;

    if (target?.tableData !== undefined || target?.graphData !== undefined) {
      tData = Array.isArray(target.tableData)
        ? target.tableData
        : target.tableData?.data || [];
      gData = Array.isArray(target.graphData)
        ? target.graphData
        : target.graphData?.data || tData;
    } else if (
      target?.data?.tableData !== undefined ||
      target?.data?.graphData !== undefined
    ) {
      tData = Array.isArray(target.data.tableData)
        ? target.data.tableData
        : target.data.tableData?.data || [];
      gData = Array.isArray(target.data.graphData)
        ? target.data.graphData
        : target.data.graphData?.data || tData;
    } else {
      const arr = Array.isArray(target)
        ? target
        : target?.dailyData || target?.dailyReports || target?.reports || target?.data || target?.rows || target?.list || (Array.isArray(data) ? data : []);
      tData = Array.isArray(arr) ? arr : (arr?.data || []);
      gData = Array.isArray(arr) ? arr : (arr?.data || tData);
    }
    
    // Filter out metadata rows (DV360 Labels)
    tData = filterMetadataRows(tData);
    gData = filterMetadataRows(gData);

    return { tData, gData };
  };

  // Reactively compute globalEffectiveMetrics from tableData + pricing (no async timing issues)
  const globalEffectiveMetrics = React.useMemo(() => {
    const data = tableData.tableData || [];
    const pricing = campaignPricing;
    let totalImp = 0;
    let totalClicks = 0;
    let totalSpent = 0;

    data.forEach(row => {
      const imp = Number(row.Impressions || row.impressions || 0);
      const cks = Number(row.Clicks || row.clicks || 0);
      const rowDate = row.Date || row.date || "";

      const pCPM = getPriceForDate(pricing?.cpm, rowDate);
      const pCPC = getPriceForDate(pricing?.cpc, rowDate);

      let spent = 0;
      if (pCPM > 0) {
        spent = (imp / 1000) * pCPM;
      } else if (pCPC > 0) {
        spent = cks * pCPC;
      } else {
        // Match DataTable: check row.eCPM / row.CPM / row.cpm from the API
        const rCPM = Number(row.eCPM || row.CPM || row.cpm || 0);
        const rCPC = Number(row.eCPC || row.CPC || row.cpc || 0);
        spent = rCPM > 0 ? (imp / 1000) * rCPM : (cks * rCPC);
      }

      totalImp += imp;
      totalClicks += cks;
      totalSpent += spent;
    });

    return {
      eCPM: totalImp > 0 ? (totalSpent / totalImp) * 1000 : 0,
      eCPC: totalClicks > 0 ? (totalSpent / totalClicks) : 0,
    };
  }, [tableData.tableData, campaignPricing]);

  const fetchCampaignData = React.useCallback(
    async (currentFilters = filters) => {
      try {
        let tData = [],
          gData = [];
        if (currentFilters.source === "DV360") {
          const res = await getOvDataByRange(
            currentFilters.insertionOrderId,
            currentFilters.dateRange.startDate,
            currentFilters.dateRange.endDate,
            1,
            500,
          );
          ({ tData, gData } = extractData(res));
          const data = res?.data || res;
          setWeekData(data.weekData || []);
        } else {
          const res = await getCampaignData(currentFilters, "campaigns");
          tData = Array.isArray(res.report)
            ? res.report
            : res.report
              ? [res.report]
              : [];
          tData = filterMetadataRows(tData); // Apply filter
          gData = tData;
        }
        
        
        setTableData({ tableData: tData, graphData: gData });
      } catch (error) {
        console.log(error);
      }
    },
    [filters, campaignPricing], // Important: depend on pricing too
  );


  const fetchCreativeTableData = React.useCallback(
    async (currentFilters = filters) => {
      try {
        let tData = [],
          gData = [];
        if (currentFilters.source === "DV360") {
          const res = await getDailyReportsByRangeCreative(
            currentFilters.insertionOrderId,
            currentFilters.dateRange.startDate,
            currentFilters.dateRange.endDate,
            1,
            100000,
          );
          ({ tData, gData } = extractData(res));
        } else {
          const res = await getCreativeData(currentFilters, "creatives");
          tData = (
            Array.isArray(res.report)
              ? res.report
              : res.report
                ? [res.report]
                : []
          ).sort((a, b) => b.Impressions - a.Impressions);
          tData = filterMetadataRows(tData); // Apply filter
          gData = tData.slice(0, 10);
        }
        setCreativeTableData({ tableData: tData, graphData: gData });
      } catch (error) {
        console.log(error);
      }
    },
    [filters],
  );

  const fetchAgeData = React.useCallback(
    async (currentFilters = filters) => {
      try {
        let tData = [],
          gData = [];
        if (currentFilters.source === "DV360") {
          const res = await getAgeDataByRange(
            currentFilters.insertionOrderId,
            currentFilters.dateRange.startDate,
            currentFilters.dateRange.endDate,
            1,
            500,
          );
          // Auto-detect key: 'age' or 'ageData' or 'graphData.age'
          let specificRes = res;
          let specificKey = res?.age ? "age" : (res?.ageData ? "ageData" : "");
          
          if (!specificKey && res?.graphData?.age) {
            specificRes = res.graphData;
            specificKey = "age";
          }
          
          ({ tData, gData } = extractData(specificRes, specificKey));
        } else {
          const res = await getCampaignDataByAge(currentFilters, "ageGroups");
          tData = Array.isArray(res.report)
            ? res.report
            : res.report
              ? [res.report]
              : [];
          tData = filterMetadataRows(tData); // Apply filter
          gData = tData;
        }
        setAgeData({ tableData: tData, graphData: gData });
      } catch (error) {
        console.log(error);
      }
    },
    [filters],
  );

  const fetchGenderData = React.useCallback(
    async (currentFilters = filters) => {
      try {
        let tData = [],
          gData = [];
        if (currentFilters.source === "DV360") {
          const res = await getAgeDataByRange(
            currentFilters.insertionOrderId,
            currentFilters.dateRange.startDate,
            currentFilters.dateRange.endDate,
            1,
            500,
          );
          // Auto-detect key: 'gender' or 'genderData' or 'graphData.gender'
          let specificRes = res;
          let specificKey = res?.gender ? "gender" : (res?.genderData ? "genderData" : "");

          if (!specificKey && res?.graphData?.gender) {
            specificRes = res.graphData;
            specificKey = "gender";
          }

          ({ tData, gData } = extractData(specificRes, specificKey));
        } else {
          const res = await getCampaignDataByGender(currentFilters, "genders");
          tData = Array.isArray(res.report)
            ? res.report
            : res.report
              ? [res.report]
              : [];
          tData = filterMetadataRows(tData); // Apply filter
          gData = tData;
        }
        setGenderData({ tableData: tData, graphData: gData });
      } catch (error) {
        console.log(error);
      }
    },
    [filters],
  );

  const fetchTotalData = React.useCallback(
    async (currentFilters = filters) => {
      try {
        let tData = [],
          gData = [];
        if (currentFilters.source === "DV360") {
          const res = await getOvDataByRange(
            currentFilters.insertionOrderId,
            currentFilters.dateRange.startDate,
            currentFilters.dateRange.endDate,
            1,
            500,
          );
          ({ tData, gData } = extractData(res));
        } else {
          const res = await getCampaignData(currentFilters, "total");
          tData = Array.isArray(res.report)
            ? res.report
            : res.report
              ? [res.report]
              : [];
          tData = filterMetadataRows(tData); // Apply filter
          gData = tData;
        }
        setTotalData({ tableData: tData, graphData: gData });
      } catch (error) {
        console.log(error);
      }
    },
    [filters],
  );

  const fetchOsData = React.useCallback(
    async (currentFilters = filters) => {
      try {
        let tData = [],
          gData = [];
        if (currentFilters.source === "DV360") {
          const res = await getDailyReportsByRangeOs(
            currentFilters.insertionOrderId,
            currentFilters.dateRange.startDate,
            currentFilters.dateRange.endDate,
            1,
            100000,
          );
          ({ tData, gData } = extractData(res));
        } else {
          const res = await getCampaignDataByOses(currentFilters, "oses");
          tData = (
            Array.isArray(res.report)
              ? res.report
              : res.report
                ? [res.report]
                : []
          ).sort(
            (a, b) =>
              Number(b.Impressions || b.impressions || 0) -
              Number(a.Impressions || a.impressions || 0),
          );
          tData = filterMetadataRows(tData); // Apply filter
          gData = tData.slice(0, 10);
        }
        setOsData({ tableData: tData, graphData: gData });
      } catch (error) {
        console.log(error);
      }
    },
    [filters],
  );

  const fetchBrowserData = React.useCallback(
    async (currentFilters = filters) => {
      try {
        let tData = [],
          gData = [];
        if (currentFilters.source === "DV360") {
          const res = await getDailyReportsByRangeBrowser(
            currentFilters.insertionOrderId,
            currentFilters.dateRange.startDate,
            currentFilters.dateRange.endDate,
            1,
            100000,
          );
          ({ tData, gData } = extractData(res));
        } else {
          const res = await getCampaignDataByBrowser(
            currentFilters,
            "browsers",
          );
          tData = (
            Array.isArray(res.report)
              ? res.report
              : res.report
                ? [res.report]
                : []
          )
            .filter(
              (item) =>
                Number(item.Impressions || item.impressions || 0) > 1000,
            )
            .sort(
              (a, b) =>
                Number(b.Impressions || b.impressions || 0) -
                Number(a.Impressions || a.impressions || 0),
            );
          tData = filterMetadataRows(tData); // Apply filter
          gData = tData.slice(0, 10);
        }
        setBrowserData({ tableData: tData, graphData: gData });
      } catch (error) {
        console.log(error);
      }
    },
    [filters],
  );

  const fetchOperatorData = React.useCallback(
    async (currentFilters = filters) => {
      try {
        let tData = [],
          gData = [];
        if (currentFilters.source === "DV360") {
          const res = await getDailyReportsByRangeOperator(
            currentFilters.insertionOrderId,
            currentFilters.dateRange.startDate,
            currentFilters.dateRange.endDate,
            1,
            100000,
          );
          ({ tData, gData } = extractData(res));
        } else {
          const res = await getCampaignDataByOperator(
            currentFilters,
            "operators",
          );
          tData = (
            Array.isArray(res.report)
              ? res.report
              : res.report
                ? [res.report]
                : []
          )
            .filter(
              (item) =>
                Number(item.Impressions || item.impressions || 0) > 1000,
            )
            .sort(
              (a, b) =>
                Number(b.Impressions || b.impressions || 0) -
                Number(a.Impressions || a.impressions || 0),
            );
          tData = filterMetadataRows(tData); // Apply filter
          gData = tData.slice(0, 10);
        }
        setOperatorData({ tableData: tData, graphData: gData });
      } catch (error) {
        console.log(error);
      }
    },
    [filters],
  );

  const fetchPlacementPosData = React.useCallback(
    async (currentFilters = filters) => {
      try {
        let tData = [],
          gData = [];
        if (currentFilters.source === "DV360") {
          const res = await getDailyReportsByRangeAdPos(
            currentFilters.insertionOrderId,
            currentFilters.dateRange.startDate,
            currentFilters.dateRange.endDate,
            1,
            100000,
          );
          ({ tData, gData } = extractData(res));
        } else {
          const res = await getCampaignDataByPlacementPos(
            currentFilters,
            "adPlacementPositions",
          );
          tData = (
            Array.isArray(res.report)
              ? res.report
              : res.report
                ? [res.report]
                : []
          ).sort(
            (a, b) =>
              Number(b.Impressions || b.impressions || 0) -
              Number(a.Impressions || a.impressions || 0),
          );
          tData = filterMetadataRows(tData); // Apply filter
          gData = tData.slice(0, 10);
        }
        setPlacementPosData({ tableData: tData, graphData: gData });
      } catch (error) {
        console.log(error);
      }
    },
    [filters],
  );

  const fetchPlacementTypeData = React.useCallback(
    async (currentFilters = filters) => {
      try {
        let tData = [],
          gData = [];
        if (currentFilters.source === "DV360") {
          const res = await getDailyReportsByRangeAdType(
            currentFilters.insertionOrderId,
            currentFilters.dateRange.startDate,
            currentFilters.dateRange.endDate,
            1,
            100000,
          );
          ({ tData, gData } = extractData(res));
        } else {
          const res = await getCampaignDataByPlacementType(
            currentFilters,
            "adPlacementTypes",
          );
          tData = (
            Array.isArray(res.report)
              ? res.report
              : res.report
                ? [res.report]
                : []
          ).sort(
            (a, b) =>
              Number(b.Impressions || b.impressions || 0) -
              Number(a.Impressions || a.impressions || 0),
          );
          tData = filterMetadataRows(tData); // Apply filter
          gData = tData.slice(0, 10);
        }
        setPlacementTypeData({ tableData: tData, graphData: gData });
      } catch (error) {
        console.log(error);
      }
    },
    [filters],
  );
  const fetchDeviceData = React.useCallback(
    async (currentFilters = filters) => {
      try {
        let tData = [],
          gData = [];
        if (currentFilters.source === "DV360") {
          const res = await getDeviceDataByRange(
            currentFilters.insertionOrderId,
            currentFilters.dateRange.startDate,
            currentFilters.dateRange.endDate,
            1,
            100000,
          );
          ({ tData, gData } = extractData(res));
        } else {
          const res = await getCampaignDataByDevice(currentFilters, "devices");
          tData = (
            Array.isArray(res.report)
              ? res.report
              : res.report
                ? [res.report]
                : []
          ).sort(
            (a, b) =>
              Number(b.Impressions || b.impressions || 0) -
              Number(a.Impressions || a.impressions || 0),
          );
          tData = filterMetadataRows(tData); // Apply filter
          gData = tData.slice(0, 10);
        }
        setDeviceData({ tableData: tData, graphData: gData });
      } catch (error) {
        console.log(error);
      }
    },
    [filters],
  );

  const fetchCityData = React.useCallback(
    async (currentFilters = filters) => {
      try {
        let tData = [],
          gData = [];
        if (currentFilters.source === "DV360") {
           const res = await getDailyReportsByRangeCity(
            currentFilters.insertionOrderId,
            currentFilters.dateRange.startDate,
            currentFilters.dateRange.endDate,
            1,
            100000,
          );
          ({ tData, gData } = extractData(res));
        } else {
           const res = await getCampaignDataByCity(currentFilters, "cities");
           tData = (
            Array.isArray(res.report)
              ? res.report
              : res.report
                ? [res.report]
                : []
          ).sort(
            (a, b) =>
              Number(b.Impressions || b.impressions || 0) -
              Number(a.Impressions || a.impressions || 0),
          );
          tData = filterMetadataRows(tData); // Apply filter
           gData = tData.slice(0, 25);
        }
        setCityData({ tableData: tData, graphData: gData });
      } catch (error) {
        console.log(error);
      }
    },
    [filters],
  );

  const fetchUrlData = React.useCallback(
    async (currentFilters = filters) => {
      try {
        let tData = [],
          gData = [];
        if (currentFilters.source === "DV360") {
          const res = await getDailyReportsByRangeUrl(
            currentFilters.insertionOrderId,
            currentFilters.dateRange.startDate,
            currentFilters.dateRange.endDate,
            1,
            100000,
          );
          ({ tData, gData } = extractData(res));
        } else {
          // Add default fallback or service for non-DV360 if available
          tData = [];
          gData = [];
        }
        setUrlData({ tableData: tData, graphData: gData });
      } catch (error) {
        console.log(error);
      }
    },
    [filters],
  );

  const fetchAppsflyerData = React.useCallback(
    async (currentFilters = filters) => {
      if (!currentFilters.app_id) {
        setAppsflyerData([]);
        return;
      }
      try {
        const queryStart = currentFilters.dateRange.startDate;
        const queryEnd = currentFilters.dateRange.endDate;
        let audEndDateStr = currentFilters.audienceEndDate;

        if (!audEndDateStr && currentFilters.audienceId && allAudiences.length > 0) {
          const targetId = getNormalizedId(currentFilters.audienceId);
          const selectedAud = allAudiences.find(a => getNormalizedId(a._id) === targetId);
          if (selectedAud) {
            audEndDateStr = selectedAud.endDate;
          }
        }

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
              // Whole query range is on or before audience end date -> call audience endpoint
              const res = await getAppsFlyerSyncData(
                currentFilters.app_id,
                queryStart,
                queryEnd,
                false
              );
              if (res.success) {
                setAppsflyerData(res.data || []);
              }
            } else if (queryStart >= nextDayStr) {
              // Whole query range is from the next day after end date -> call conversion endpoint
              const res = await getAppsFlyerSyncData(
                currentFilters.app_id,
                queryStart,
                queryEnd,
                true
              );
              if (res.success) {
                setAppsflyerData(res.data || []);
              }
            } else {
              // Query range spans across the boundary -> split and query both, then merge
              const [resAudience, resConversion] = await Promise.all([
                getAppsFlyerSyncData(currentFilters.app_id, queryStart, audEndStr, false).catch(() => ({ success: false, data: [] })),
                getAppsFlyerSyncData(currentFilters.app_id, nextDayStr, queryEnd, true).catch(() => ({ success: false, data: [] }))
              ]);

              const combinedData = [
                ...(resAudience.success ? resAudience.data || [] : []),
                ...(resConversion.success ? resConversion.data || [] : [])
              ];
              setAppsflyerData(combinedData);
            }
          } else {
            // Fallback if audEnd parsing failed
            const res = await getAppsFlyerSyncData(currentFilters.app_id, queryStart, queryEnd, false);
            if (res.success) {
              setAppsflyerData(res.data || []);
            }
          }
        } else {
          // No end date defined -> call audience endpoint
          const res = await getAppsFlyerSyncData(
            currentFilters.app_id,
            queryStart,
            queryEnd,
            false
          );
          if (res.success) {
            setAppsflyerData(res.data || []);
          }
        }
      } catch (error) {
        console.error("Error fetching AppsFlyer data:", error);
      }
    },
    [filters, allAudiences],
  );



  const clearAllData = React.useCallback(() => {
    const emptyState = { tableData: [], graphData: [] };
    setTableData(emptyState);
    setAgeData(emptyState);
    setGenderData(emptyState);
    setOsData(emptyState);
    setBrowserData(emptyState);
    setOperatorData(emptyState);
    setPlacementPosData(emptyState);
    setPlacementTypeData(emptyState);
    setDeviceData(emptyState);
    setCityData(emptyState);
    setTotalData(emptyState);
     setCreativeTableData(emptyState);
    setWeekData([]);
    setUrlData(emptyState);
  }, []);

  const fetchAllData = React.useCallback(async (targetFilters = filters) => {
    console.log("Fetching all data with filters:", targetFilters);
    
    // Clear all existing data before fetching new reports
    clearAllData();
    
    // Trigger all fetch functions
    fetchCampaignData(targetFilters);
    fetchCreativeTableData(targetFilters);
    fetchAgeData(targetFilters);
    fetchGenderData(targetFilters);
    fetchTotalData(targetFilters);
    fetchOsData(targetFilters);
    fetchBrowserData(targetFilters);
    fetchOperatorData(targetFilters);
    fetchPlacementPosData(targetFilters);
    fetchPlacementTypeData(targetFilters);
     fetchDeviceData(targetFilters);
    fetchCityData(targetFilters);
    fetchUrlData(targetFilters);
    fetchAppsflyerData(targetFilters);
  }, [
    filters,
    clearAllData,
    fetchCampaignData,
    fetchCreativeTableData,
    fetchAgeData,
    fetchGenderData,
    fetchTotalData,
    fetchOsData,
    fetchBrowserData,
    fetchOperatorData,
    fetchPlacementPosData,
    fetchPlacementTypeData,
    fetchDeviceData,
    fetchCityData,
    fetchUrlData,
    fetchAppsflyerData,
  ]);


  const globalTotals = React.useMemo(() => {
    if (!tableData.tableData || tableData.tableData.length === 0) {
      return { TotalConversions: 0, Installs: 0 };
    }

    if (!appsflyerData || appsflyerData.length === 0) {
      let totalConversions = 0;
      let totalInstalls = 0;
      tableData.tableData.forEach(row => {
        totalConversions += Number(row.TotalConversions || row.totalConversions || row.total_conversions || 0);
        totalInstalls += Number(row.Installs || row.installs || 0);
      });
      return { TotalConversions: totalConversions, Installs: totalInstalls };
    }

    const normalizeDate = (d) => {
      if (!d) return "";
      const str = String(d).split('T')[0];
      return str.replace(/\//g, "-");
    };

    const afMap = {};
    appsflyerData.forEach(item => {
      const d = normalizeDate(item.date);
      if (!afMap[d]) afMap[d] = { installs: 0, af_payment_unique: 0 };
      afMap[d].installs += (item.installs || 0);
      
      if (item.total_revenue > 0) {
        afMap[d].af_payment_unique += item.total_revenue;
      } else {
        const safeTarget = String(filters.conversionEvent || "").replace(/\s+/g, "").toLowerCase();
        if (item.events && Array.isArray(item.events)) {
          item.events.forEach(evt => {
            const safeEName = String(evt.event_name || "").replace(/\s+/g, "").toLowerCase();
            const cleanVal = String(evt.event_value || "").replace(/,/g, "").trim();
            if (safeTarget && (safeEName === safeTarget || safeEName.includes(safeTarget) || safeTarget.includes(safeEName))) {
              afMap[d].af_payment_unique += Number(cleanVal) || 0;
            }
          });
        }
      }
    });

    let totalConversions = 0;
    let totalInstalls = 0;

    tableData.tableData.forEach(row => {
      const d = normalizeDate(row.Date || row.date);
      const af = afMap[d] || { installs: 0, af_payment_unique: 0 };
      const defaultConversions = Number(row.TotalConversions || row.totalConversions || row.total_conversions || 0);
      const clicks = Number(row.Clicks || row.clicks || 0);
      
      let finalConversions = af.af_payment_unique > 0 ? af.af_payment_unique : defaultConversions;
      let finalInstalls = af.installs;

      // Fallback to proxy if both are 0, BUT ONLY if we have AppsFlyer config (datalength > 0)
      // If datalength is 0, we use advertiser data (defaultConversions) directly.
      const hasAFConfig = (filters.appsflyerDataLength > 0);
      
      if (hasAFConfig) {
        if (finalConversions === 0 && clicks > 0) finalConversions = clicks * 0.011194;
        if (finalInstalls === 0 && clicks > 0) finalInstalls = clicks * 0.0989;
      }

      totalConversions += finalConversions;
      totalInstalls += finalInstalls;
    });

    return { TotalConversions: Math.round(totalConversions), Installs: Math.round(totalInstalls) };
  }, [tableData.tableData, appsflyerData, filters.conversionEvent, filters.appsflyerDataLength]);

  return (
    <div className="bg-light min-vh-100 ">
      <Suspense fallback={<div className="p-4 text-center">Loading filters...</div>}>
        <ReportsFilter
          tableData={tableData.tableData}
          filters={filters}
          setFilters={setFilters}
          fetchCampaignData={fetchCampaignData}
          fetchCreativeTableData={fetchCreativeTableData}
          fetchAgeData={fetchAgeData}
          fetchGenderData={fetchGenderData}
          fetchTotalData={fetchTotalData}
          fetchOsData={fetchOsData}
          fetchBrowserData={fetchBrowserData}
          fetchOperatorData={fetchOperatorData}
          fetchPlacementPosData={fetchPlacementPosData}
          fetchPlacementTypeData={fetchPlacementTypeData}
           fetchDeviceData={fetchDeviceData}
          fetchCityData={fetchCityData}
          fetchUrlData={fetchUrlData}
          fetchAppsflyerData={fetchAppsflyerData}
          handleUpdate={handleUpdate}
          isUpdating={isUpdating}
        />
      </Suspense>

      <div className="container-fluid py-4 position-relative" id="dashboard-content" style={{ minHeight: isUpdating ? '400px' : 'auto' }}>
        {isUpdating && (
          <div 
            className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
            style={{ 
              backgroundColor: "rgba(255, 255, 255, 0.7)", 
              backdropFilter: "blur(4px)",
              zIndex: 1000,
              borderRadius: '12px'
            }}
          >
            <div className="text-center p-5 shadow-lg bg-white rounded-4 border d-flex flex-column align-items-center" style={{ position: 'sticky', top: '50%', transform: 'translateY(-50%)' }}>
              <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h5 className="fw-bold text-dark mb-1">Updating Preview</h5>
              <p className="text-muted small mb-0">Refreshing data reports...</p>
            </div>
          </div>
        )}
        <div className="row g-4">
          {hasPermission("performance_graph") && (
            <div className="col-12">
              <PerformanceDashboard
                tableData={tableData.graphData}
                appsflyerData={appsflyerData}
                appsflyerDataLength={filters.appsflyerDataLength}
                conversionEvent={filters.conversionEvent}
                currencySymbol={getCurrencySymbol(filters.currency)}
                campaignPermissions={campaignPermissions}
                campaignPricing={campaignPricing}
                campaignType={filters.campaignType}
                audienceEndDate={filters.audienceEndDate}
              />
            </div>
          )}

          {hasPermission("performance_table") && (
            <div className="col-12">
              <TableWithDynamicColumns
                tableData={tableData.tableData}
                appsflyerData={appsflyerData}
                currencySymbol={getCurrencySymbol(filters.currency)}
                campaignPermissions={campaignPermissions}
                campaignPricing={campaignPricing}
                campaignType={filters.campaignType}
                appsflyerCampaignType={filters.appsflyerCampaignType}
                appsflyerDataLength={filters.appsflyerDataLength}
                conversionEvent={filters.conversionEvent}
                globalTotals={globalTotals}
                audienceEndDate={filters.audienceEndDate}
              />
            </div>
          )}

          {hasPermission("delivery_by_weekday") && (
            <div className="col-12">
              <WeekdayDistribution tableData={tableData.graphData} weekData={weekData} />
            </div>
          )}

          {hasPermission("creative_performance_graph") && (
            <div className="col-12">
              <CreativePerformance
                CreativeTableData={CreativeTableData.graphData}
              />
            </div>
          )}
              {hasPermission("creative_performance_graph_table") && (
            <div className="col-12">
              <CreativeTable
                CreativeTableData={CreativeTableData.tableData}
                currencySymbol={getCurrencySymbol(filters.currency)}
                campaignPermissions={campaignPermissions}
                campaignPricing={campaignPricing}
                globalEffectiveMetrics={globalEffectiveMetrics}
                campaignType={filters.campaignType}
                appsflyerCampaignType={filters.appsflyerCampaignType}
                appsflyerDataLength={filters.appsflyerDataLength}
                appsflyerData={appsflyerData}
                globalTotals={globalTotals}
                audienceId={filters.audienceId}
                audienceEndDate={filters.audienceEndDate}
              />
            </div>
          )}

          <div className="col-lg-12">
            <div className="row g-4 mt-2">
              {hasPermission("platform_gender") && (
                <div className="col-md-6">
                  <GenderChart genderData={genderData.graphData} />
                </div>
              )}
              {hasPermission("platform_age") && (
                <div className="col-md-6">
                  <AgeChart ageData={ageData.graphData} />
                </div>
              )}
            </div>
          </div>

          <div className="col-12 mt-5">
            <div className="row g-4">
              {hasPermission("browser_distribution") && (
                <div className="col-md-6">
                  <BrowserDistribution browserData={browserData.graphData} />
                </div>
              )}
              {hasPermission("operator_distribution") && (
                <div className="col-md-6">
                  <OperatorDistribution operatorData={operatorData.graphData} />
                </div>
              )}
              {hasPermission("device_distribution") && (
                <div className="col-md-6">
                  <DeviceDistribution deviceData={deviceData.graphData} />
                </div>
              )}
              {hasPermission("city_distribution") && (
                <div className="col-md-6">
                  <CityDistribution cityData={cityData.graphData} />
                </div>
              )}
            </div>
          </div>

          {/* {hasPermission("browser_graph") && (
            <div className="col-12 mt-4">
              <BrowserPerformance browserData={browserData.graphData} />
            </div>
          )} */}
          {hasPermission("browser_table") && (
            <div className="col-12">
              <BrowserTable
                browserData={browserData.tableData}
                currencySymbol={getCurrencySymbol(filters.currency)}
                campaignPermissions={campaignPermissions}
                campaignPricing={campaignPricing}
                globalEffectiveMetrics={globalEffectiveMetrics}
                campaignType={filters.campaignType}
                appsflyerCampaignType={filters.appsflyerCampaignType}
                appsflyerDataLength={filters.appsflyerDataLength}
                appsflyerData={appsflyerData}
                globalTotals={globalTotals}
                audienceEndDate={filters.audienceEndDate}
              />
            </div>
          )}

          {/* {hasPermission("operator_graph") && (
            <div className="col-12 mt-4">
              <OperatorPerformance operatorData={operatorData.graphData} />
            </div>
          )} */}
          {hasPermission("operator_table") && (
            <div className="col-12">
              <OperatorTable
                operatorData={operatorData.tableData}
                currencySymbol={getCurrencySymbol(filters.currency)}
                campaignPermissions={campaignPermissions}
                campaignPricing={campaignPricing}
                globalEffectiveMetrics={globalEffectiveMetrics}
                campaignType={filters.campaignType}
                appsflyerCampaignType={filters.appsflyerCampaignType}
                appsflyerDataLength={filters.appsflyerDataLength}
                appsflyerData={appsflyerData}
                globalTotals={globalTotals}
                audienceEndDate={filters.audienceEndDate}
              />
            </div>
          )}

          {/* {hasPermission("os_graph") && (
            <div className="col-12 mt-5">
              <OsPerformance osData={osData.graphData} />
            </div>
          )} */}
          {hasPermission("os_distribution") && (
            <div className="col-12">
              <OsDistribution osData={osData.graphData} />
            </div>
          )}
          {hasPermission("os_table") && (
            <div className="col-12">
              <OsTable
                osData={osData.tableData}
                currencySymbol={getCurrencySymbol(filters.currency)}
                campaignPermissions={campaignPermissions}
                campaignPricing={campaignPricing}
                globalEffectiveMetrics={globalEffectiveMetrics}
                campaignType={filters.campaignType}
                appsflyerCampaignType={filters.appsflyerCampaignType}
                appsflyerDataLength={filters.appsflyerDataLength}
                appsflyerData={appsflyerData}
                globalTotals={globalTotals}
                audienceEndDate={filters.audienceEndDate}
              />
            </div>
          )}

          <div className="col-12 mt-5">
            <div className="row g-4">
              {hasPermission("placement_pos_distribution") && (
                <div className="col-md-6">
                  <PlacementPosDistribution
                    placementPosData={placementPosData.graphData}
                  />
                </div>
              )}
              {hasPermission("placement_interstitial_distribution") && (
                <div className="col-md-6">
                  <PlacementTypeDistribution
                    placementTypeData={placementTypeData.graphData}
                  />
                </div>
              )}
            </div>
          </div>

       

          {hasPermission("url_distribution") && (
            <div className="col-12 mt-4">
              <UrlDistribution urlData={urlData.graphData} />
            </div>
          )}

          {/* {hasPermission("url_graph") && (
            <div className="col-12 mt-4">
              <UrlPerformance urlData={urlData.graphData} />
            </div>
          )} */}

          {hasPermission("url_table") && (
            <div className="col-12">
              <UrlTable
                urlData={urlData.tableData}
                currencySymbol={getCurrencySymbol(filters.currency)}
                campaignPermissions={campaignPermissions}
                campaignPricing={campaignPricing}
                globalEffectiveMetrics={globalEffectiveMetrics}
                campaignType={filters.campaignType}
                appsflyerCampaignType={filters.appsflyerCampaignType}
                appsflyerDataLength={filters.appsflyerDataLength}
                appsflyerData={appsflyerData}
                globalTotals={globalTotals}
                audienceEndDate={filters.audienceEndDate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDashboard;

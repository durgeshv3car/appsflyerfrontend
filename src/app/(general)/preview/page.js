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
import { getDailyReportsByRangeCreative } from "@/services/creative";
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
  const [totalData, setTotalData] = useState({ tableData: [], graphData: [] });
  const [CreativeTableData, setCreativeTableData] = useState({
    tableData: [],
    graphData: [],
  });
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
  });
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const handleUpdate = () => {
    localStorage.setItem("campaignFilteredData", JSON.stringify(filters));
    setUpdateTrigger(prev => prev + 1);
  };

  const { data: session } = useSession();
  const [userPermissions, setUserPermissions] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [campaignPermissions, setCampaignPermissions] = useState([]);
  const [allAudiences, setAllAudiences] = useState([]);
  const [campaignPricing, setCampaignPricing] = useState({ cpm: {}, cpc: {} });

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
        cpc: typeof selectedAud?.cpc === 'object' ? selectedAud.cpc : {}
      });
    } else {
      setCampaignPermissions([]);
      setCampaignPricing({ cpm: {}, cpc: {} });
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
      if (pCPM !== undefined) {
        spent = (imp / 1000) * pCPM;
      } else if (pCPC !== undefined) {
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
            500,
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
            500,
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
            500,
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
            500,
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
            500,
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
            500,
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
            500,
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
            500,
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


  const fetchSyncData = React.useCallback(
    async (currentFilters = filters) => {
      if (currentFilters.source !== "DV360" || !currentFilters.audienceId)
        return;
      try {
        const commonParams = {
          audienceId: currentFilters.audienceId,
          dataRange: "ALL_TIME",
        };

        const ageParams = {
          audienceId: currentFilters.audienceId,
          dataRange: "LAST_365_DAYS",
        };

        await Promise.all([
          createReportsData(commonParams),
          createDeviceSync(commonParams),
          createCitySync(commonParams),
          createAgeSync(ageParams),
          createOsSync(commonParams),
          createBrowserSync(commonParams),
          createOperatorSync(commonParams),
          createAdPosSync(commonParams),
          createAdTypeSync(commonParams),
        ]);

        // Refresh all after sync
        fetchCampaignData(currentFilters);
        fetchCreativeTableData(currentFilters);
        fetchAgeData(currentFilters);
        fetchGenderData(currentFilters);
        fetchTotalData(currentFilters);
        fetchOsData(currentFilters);
        fetchBrowserData(currentFilters);
        fetchOperatorData(currentFilters);
        fetchPlacementPosData(currentFilters);
        fetchPlacementTypeData(currentFilters);
        fetchDeviceData(currentFilters);
        fetchCityData(currentFilters);
      } catch (error) {
        console.log("Sync Error:", error);
      }
    },
    [
      filters,
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
    ],
  );

  const fetchAllData = React.useCallback(async (targetFilters = filters) => {
    console.log("Fetching all data with filters:", targetFilters);
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
    fetchSyncData(targetFilters);
  }, [
    filters,
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
    fetchSyncData
  ]);

  useEffect(() => {
    if (updateTrigger > 0) {
      fetchAllData(filters);
    }
  }, [updateTrigger, fetchAllData]);


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
          fetchSyncData={fetchSyncData}
          handleUpdate={handleUpdate}
        />
      </Suspense>

      <div className="container-fluid py-4" id="dashboard-content">
        <div className="row g-4">
          {hasPermission("performance_graph") && (
            <div className="col-12">
              <PerformanceDashboard
                tableData={tableData.graphData}
                currencySymbol={getCurrencySymbol(filters.currency)}
                campaignPermissions={campaignPermissions}
                campaignPricing={campaignPricing}
              />
            </div>
          )}

          {hasPermission("performance_table") && (
            <div className="col-12">
              <TableWithDynamicColumns
                tableData={tableData.tableData}
                currencySymbol={getCurrencySymbol(filters.currency)}
                campaignPermissions={campaignPermissions}
                campaignPricing={campaignPricing}
                // TableWithDynamicColumns handles its internal column permissions (cpm/spent) separately
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

          {hasPermission("browser_graph") && (
            <div className="col-12 mt-4">
              <BrowserPerformance browserData={browserData.graphData} />
            </div>
          )}
          {hasPermission("browser_table") && (
            <div className="col-12">
              <BrowserTable
                browserData={browserData.tableData}
                currencySymbol={getCurrencySymbol(filters.currency)}
                campaignPermissions={campaignPermissions}
                campaignPricing={campaignPricing}
                globalEffectiveMetrics={globalEffectiveMetrics}
              />
            </div>
          )}

          {hasPermission("operator_graph") && (
            <div className="col-12 mt-4">
              <OperatorPerformance operatorData={operatorData.graphData} />
            </div>
          )}
          {hasPermission("operator_table") && (
            <div className="col-12">
              <OperatorTable
                operatorData={operatorData.tableData}
                currencySymbol={getCurrencySymbol(filters.currency)}
                campaignPermissions={campaignPermissions}
                campaignPricing={campaignPricing}
                globalEffectiveMetrics={globalEffectiveMetrics}
              />
            </div>
          )}

          {hasPermission("os_graph") && (
            <div className="col-12 mt-5">
              <OsPerformance osData={osData.graphData} />
            </div>
          )}
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

          {hasPermission("creative_performance_graph_table") && (
            <div className="col-12">
              <CreativeTable
                CreativeTableData={CreativeTableData.tableData}
                currencySymbol={getCurrencySymbol(filters.currency)}
                campaignPermissions={campaignPermissions}
                campaignPricing={campaignPricing}
                globalEffectiveMetrics={globalEffectiveMetrics}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignDashboard;

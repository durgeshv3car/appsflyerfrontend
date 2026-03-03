"use client";
import React, { useState, useEffect, useRef } from "react";
import { getCurrencySymbol } from "@/utils/currencySymbol";
import PerformanceDashboard from "./components/PerformanceChart";
import TableWithDynamicColumns from "./components/Campaigns/DataTable";
import DashboardHeader from "./components/Campaigns/DashboardHeader";
import ReportsFilter from "./components/Campaigns/FilterSection";
import CreativePerformance from "./components/Creative/CreativePerformance";
import DeviceDistribution from "./components/Device/DeviceDistribution";
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
} from "@/services/campaignData";
import { getDailyReportsByRange as getOvDataByRange } from "@/services/reports";
import { getDailyReportsByRange as getDeviceDataByRange } from "@/services/device";
import { getDailyReportsByRange as getAgeDataByRange } from "@/services/demographics";
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
import { createReportsDataOs as createOsSync } from "@/services/os";
import { createReportsDataBrowser as createBrowserSync } from "@/services/browser";
import { createReportsDataOperator as createOperatorSync } from "@/services/operator";
import { createReportsDataAdPos as createAdPosSync } from "@/services/ad-pos";
import { createReportsDataAdType as createAdTypeSync } from "@/services/ad-type";

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
  console.log("Filters in Dashboard:", filters);

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
    return { tData, gData };
  };

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
          gData = tData;
        }
        setTableData({ tableData: tData, graphData: gData });
      } catch (error) {
        console.log(error);
      }
    },
    [filters],
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
          gData = tData.slice(0, 10);
        }
        setDeviceData({ tableData: tData, graphData: gData });
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
    ],
  );

  return (
    <div className="bg-light min-vh-100 ">
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
        fetchSyncData={fetchSyncData}
      />

      <div className="container-fluid py-4" id="dashboard-content">
        <div className="row g-4">
          <div className="col-12">
            <PerformanceDashboard
              tableData={tableData.graphData}
              currencySymbol={getCurrencySymbol(filters.currency)}
            />
          </div>

          <div className="col-12">
            <TableWithDynamicColumns
              tableData={tableData.tableData}
              currencySymbol={getCurrencySymbol(filters.currency)}
            />
          </div>

          <div className="col-12">
            <WeekdayDistribution tableData={tableData.graphData} weekData={weekData} />
          </div>

          <div className="col-12">
            <CreativePerformance
              CreativeTableData={CreativeTableData.graphData}
            />
          </div>

          <div className="col-lg-12">
            <div className="row g-4 mt-2">
              <div className="col-md-6">
                <GenderChart genderData={genderData.graphData} />
              </div>
              <div className="col-md-6">
                <AgeChart ageData={ageData.graphData} />
              </div>
            </div>
          </div>

          <div className="col-12 mt-5">
            <div className="row g-4">
              <div className="col-md-6">
                <BrowserDistribution browserData={browserData.graphData} />
              </div>
              <div className="col-md-6">
                <OperatorDistribution operatorData={operatorData.graphData} />
              </div>
              <div className="col-md-6">
                <DeviceDistribution deviceData={deviceData.graphData} />
              </div>
            </div>
          </div>

          <div className="col-12 mt-4">
            <BrowserPerformance browserData={browserData.graphData} />
          </div>
          <div className="col-12">
            <BrowserTable
              browserData={browserData.tableData}
              currencySymbol={getCurrencySymbol(filters.currency)}
            />
          </div>

          <div className="col-12 mt-4">
            <OperatorPerformance operatorData={operatorData.graphData} />
          </div>
          <div className="col-12">
            <OperatorTable
              operatorData={operatorData.tableData}
              currencySymbol={getCurrencySymbol(filters.currency)}
            />
          </div>

          <div className="col-12 mt-5">
            <OsPerformance osData={osData.graphData} />
          </div>
          <div className="col-12">
            <OsDistribution osData={osData.graphData} />
          </div>
          <div className="col-12">
            <OsTable
              osData={osData.tableData}
              currencySymbol={getCurrencySymbol(filters.currency)}
            />
          </div>

          <div className="col-12 mt-5">
            <div className="row g-4">
              <div className="col-md-6">
                <PlacementPosDistribution
                  placementPosData={placementPosData.graphData}
                />
              </div>
              <div className="col-md-6">
                <PlacementTypeDistribution
                  placementTypeData={placementTypeData.graphData}
                />
              </div>
            </div>
          </div>

          <div className="col-12">
            <CreativeTable
              CreativeTableData={CreativeTableData.tableData}
              currencySymbol={getCurrencySymbol(filters.currency)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDashboard;

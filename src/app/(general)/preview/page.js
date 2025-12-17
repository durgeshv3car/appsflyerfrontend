"use client";
import React, { useState, useEffect, useRef } from "react";
import PerformanceDashboard from "./components/PerformanceChart";
import TableWithDynamicColumns from "./components/Campaigns/DataTable";
import DashboardHeader from "./components/Campaigns/DashboardHeader";
import ReportsFilter from "./components/Campaigns/FilterSection";
import CreativePerformance from "./components/Creative/CreativePerformance";
import DeviceDistribution from "./components/Device/DeviceDistribution";
import { getCampaignData } from "@/services/campaignData";
import WeekdayDistribution from "./components/Campaigns/WeekdayDistribution";
import CreativeTable from "./components/Creative/CreativeTable";
import { getCreativeData } from "@/services/creativeData";

// Main Dashboard Component
const CampaignDashboard = () => {
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState({
    advertiser: "Intellectads- Fly Dubai (USD)",
    campaign: "All campaigns",
    country: "All countries",
    sort: "View by date",
    dateRange: "24 Sep, 2025 - 30 Sep, 2025",
  });
  const [CreativeTableData, setCreativeTableData] = useState([]);
  const fetchCampaignData = async () => {
    try {
      const res = await getCampaignData("campaigns");
      setTableData(res.report);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCreativeTableData = async () => {
    try {
      const res = await getCreativeData("creatives");

      // Sort the report array by impressions DESC
      const sorted = res.report.sort((a, b) => b.Impressions - a.Impressions);

      setCreativeTableData(sorted);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCampaignData();
    fetchCreativeTableData();
  }, []);
  return (
    <div className="bg-light min-vh-100 ">
      <ReportsFilter
        tableData={tableData}
        filters={filters}
        setFilters={setFilters}
      />

      <div className="container-fluid py-4">
        <div className="row g-4">
          <PerformanceDashboard tableData={tableData} />
          <TableWithDynamicColumns tableData={tableData} />
          <CreativePerformance CreativeTableData={CreativeTableData} />
          <div className="row g-4">
            <div className="col-md-6">
              <DeviceDistribution />
            </div>
            <div className="col-md-6">
              <WeekdayDistribution tableData={tableData} />
            </div>
          </div>
          <CreativeTable CreativeTableData={CreativeTableData} />
        </div>
      </div>
    </div>
  );
};

export default CampaignDashboard;

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
    advertiser: "",
    campaign: [],
    dateRange: "",
    report_by: "byDate",
  });
  console.log("Filters in Dashboard:", filters);
  const [CreativeTableData, setCreativeTableData] = useState([]);
  const fetchCampaignData = async () => {
    try {
      const res = await getCampaignData(filters,"campaigns");
      setTableData(res.report);
    } catch (error) {
      console.log(error);
    }
  };


  const fetchCreativeTableData = async () => {
    try {
      const res = await getCreativeData(filters,"creatives");
      const sorted = res.report.sort((a, b) => b.Impressions - a.Impressions);
      setCreativeTableData(sorted);
    } catch (error) {
      console.log(error);
    }
  };

 

  return (
    <div className="bg-light min-vh-100 ">
      <ReportsFilter
        tableData={tableData}
        filters={filters}
        setFilters={setFilters}
        fetchCampaignData={fetchCampaignData}
        fetchCreativeTableData={fetchCreativeTableData}
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

import { getAllToken } from "@/services/token";
import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { Calendar } from "react-date-range";
import { format } from "date-fns";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { getCampaignIdData } from "@/services/creativeData";

/** ✅ SAFE DATE FORMATTER (NO UTC BUG) */
const formatDateToYMD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ReportsFilter = ({
  tableData,
  filters,
  setFilters,
  fetchCampaignData,
  fetchCreativeTableData,
}) => {
  const [advertisers, setAdvertisers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);

  const [showStart, setShowStart] = useState(false);
  const [showEnd, setShowEnd] = useState(false);

  const wrapperRef = useRef(null);

  // UI Dates (Date objects)
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const reportByOptions = [
  { label: "By Date", value: "byDate" },
  { label: "By Campaign", value: "byCampaign" },
];


  useEffect(() => {
    fetchAdvertisers();
    if (filters.advertiser) fetchAdvertisersCampaign();
  }, [filters.advertiser]);

  // Close calendar on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowStart(false);
        setShowEnd(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchAdvertisersCampaign = async () => {
    const res = await getCampaignIdData(filters.advertiser);
    if (res?.message) setCampaigns(res.report.data);
  };

  const fetchAdvertisers = async () => {
    const res = await getAllToken();
    if (res?.results) setAdvertisers(res.data);
  };

  const UpdateData = () => {
    fetchCampaignData();
    fetchCreativeTableData();
  };

  const campaignOptions = campaigns.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const advertiserOptions = advertisers?.map((a) => ({
    value: a.advertiseId,
    label: a.campaign_name,
  }));

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-bottom">
        <div className="container-fluid py-3 px-4">
          <h1 className="h4 mb-0">Reports</h1>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border-bottom shadow-sm">
        <div className="container-fluid py-4 px-4">
          <h2 className="h5 mb-4">Filter</h2>

          <div className="row g-3" ref={wrapperRef}>
            {/* Advertiser */}
            <div className="col-md-3">
              <label className="form-label small text-muted">Advertiser</label>
              <Select
                options={advertiserOptions}
                placeholder="Select advertiser..."
                value={advertiserOptions.find(
                  (opt) => opt.value === filters.advertiser
                )}
                onChange={(selected) =>
                  setFilters({
                    ...filters,
                    advertiser: selected ? selected.value : "",
                    campaign: [],
                  })
                }
              />
            </div>

            {/* Campaign */}
            <div className="col-md-3">
              <label className="form-label small text-muted">Campaign</label>
              <Select
                isMulti
                options={campaignOptions}
                placeholder="Select campaigns..."
                closeMenuOnSelect={false}
                value={campaignOptions.filter((opt) =>
                  Array.isArray(filters.campaign)
                    ? filters.campaign.includes(opt.value)
                    : false
                )}
                onChange={(selected) =>
                  setFilters({
                    ...filters,
                    campaign: selected ? selected.map((opt) => opt.value) : [],
                  })
                }
              />
            </div>

            {/* Start Date */}
            <div className="col-md-3 position-relative">
              <label className="form-label small text-muted">Start Date</label>
              <input
                readOnly
                className="form-control"
                value={format(startDate, "dd/MM/yyyy")}
                onClick={() => {
                  setShowStart(!showStart);
                  setShowEnd(false);
                }}
              />

              {showStart && (
                <div style={{ position: "absolute", zIndex: 1000 }}>
                  <Calendar
                    date={startDate}
                    onChange={(date) => {
                      setStartDate(date);
                      setFilters({
                        ...filters,
                        dateRange: {
                          startDate: formatDateToYMD(date), // ✅ STRING
                          endDate: formatDateToYMD(endDate),
                        },
                      });
                      setShowStart(false);
                    }}
                  />
                </div>
              )}
            </div>

            {/* End Date */}
            <div className="col-md-3 position-relative">
              <label className="form-label small text-muted">End Date</label>
              <input
                readOnly
                className="form-control"
                value={format(endDate, "dd/MM/yyyy")}
                onClick={() => {
                  setShowEnd(!showEnd);
                  setShowStart(false);
                }}
              />

              {showEnd && (
                <div style={{ position: "absolute", zIndex: 1000 }}>
                  <Calendar
                    date={endDate}
                    minDate={startDate}
                    onChange={(date) => {
                      setEndDate(date);
                      setFilters({
                        ...filters,
                        dateRange: {
                          startDate: formatDateToYMD(startDate),
                          endDate: formatDateToYMD(date), // ✅ STRING
                        },
                      });
                      setShowEnd(false);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
      <div className="col-md-3">
  <label className="form-label small text-muted">View By</label>
  <Select
    options={reportByOptions}
    placeholder="Select View By..."
    value={reportByOptions.find(
      (opt) => opt.value === filters.report_by
    )}
    onChange={(selected) =>
      setFilters({
        ...filters,
        report_by: selected ? selected.value : "byDate",
      })
    }
  />
</div>


          {/* Button */}
          <div className="row mt-4">
            <div className="col-12 text-end">
              <button className="btn btn-primary px-4" onClick={UpdateData}>
                Update report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsFilter;

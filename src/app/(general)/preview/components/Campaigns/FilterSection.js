"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Select from "react-select";
import { DateRange } from "react-date-range";
import { FiCalendar, FiChevronDown, FiFileText, FiDownload } from "react-icons/fi";
import { 
  format, 
  subDays, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subMonths,
  startOfYear
} from "date-fns";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { getCampaignIdData, getSiteIdData } from "@/services/creativeData";
import { getAudience } from "@/services/createaudience";
import { downloadCSV, downloadExcel } from "@/services/export";

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
  fetchAgeData,
  fetchGenderData,
  fetchTotalData,
  fetchOsData,
  fetchBrowserData,
  fetchOperatorData,
  fetchPlacementPosData,
  fetchPlacementTypeData,
  fetchDeviceData,
  fetchSyncData,
}) => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const queryAdvertiser = searchParams.get("advertiser");
  const [advertisers, setAdvertisers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isCsvLoading, setIsCsvLoading] = useState(false);
  const [isExcelLoading, setIsExcelLoading] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);

  const wrapperRef = useRef(null);
  
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  // Helper to find audience by ID or advertiserId
  const findAudience = (list, id) => {
    return list?.find(a => a.advertiserId === id || a._id === id);
  }

  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage/URL/Session on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem("campaignFilteredData");
    let initialFilters = null;

    if (savedFilters) {
      initialFilters = JSON.parse(savedFilters);
      if (!initialFilters.currency) initialFilters.currency = "";
    }

    const applyFilters = (targetFilters) => {
       setFilters(targetFilters);
       // Restore local date objects for calendars (avoiding UTC shift)
       if (targetFilters.dateRange?.startDate && targetFilters.dateRange?.endDate) {
         const [sy, sm, sd] = targetFilters.dateRange.startDate.split("-").map(Number);
         const [ey, em, ed] = targetFilters.dateRange.endDate.split("-").map(Number);
         setRange([{
           startDate: new Date(sy, sm - 1, sd),
           endDate: new Date(ey, em - 1, ed),
           key: "selection"
         }]);
       }
       
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
    };

    const handleInitialState = async () => {
      let finalAudiences = session?.user?.audienceId || [];
      
      // If we only have IDs, fetch the details so we can find advertiserId etc.
      if (finalAudiences.length > 0 && typeof finalAudiences[0] === 'string') {
        const res = await getAudience();
        if (res?.data) {
          finalAudiences = res.data.filter(a => finalAudiences.includes(a._id));
        }
      }

      // 1. Check Query Params first
      if (queryAdvertiser && finalAudiences.length > 0) {
        const aud = findAudience(finalAudiences, queryAdvertiser);
        if (aud) {
           const isDV360 = aud.source === "DV360" || aud.reportName?.endsWith("_d");
           applyFilters({
             ...filters,
             advertiser: aud.advertiserId,
             source: isDV360 ? "DV360" : "Eskimi",
             insertionOrderId: aud.insertionOrderId || "",
             audienceId: aud._id || "",
             currency: aud.currency || "",
           });
           setIsLoaded(true);
           return;
        }
      }

      // 2. Fallback to LocalStorage
      if (initialFilters) {
        applyFilters(initialFilters);
      } 
      // 3. Fallback to first permitted audience for users
      else if (session?.user?.role !== "super_admin" && finalAudiences.length > 0) {
        const firstAudience = finalAudiences[0];
        const isDV360 = firstAudience.source === "DV360" || firstAudience.reportName?.endsWith("_d");
        applyFilters({
          ...filters,
          advertiser: firstAudience.advertiserId,
          source: isDV360 ? "DV360" : "Eskimi",
          insertionOrderId: firstAudience.insertionOrderId || "",
          audienceId: firstAudience._id || "",
          currency: firstAudience.currency || "",
        });
      }
      setIsLoaded(true);
    };

    if (session) {
      handleInitialState();
      fetchAdvertisers();
    }
  }, [session, queryAdvertiser]); 


  // Save to localStorage when filters change (DISABLED AUTOMATIC SAVE)
  /*
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("campaignFilteredData", JSON.stringify(filters));
    }
  }, [filters, isLoaded]);
  */

  useEffect(() => {
    fetchAdvertisers();
    if (filters.advertiser) fetchAdvertisersCampaign();
  }, [filters.advertiser, filters.source, session]); // Added filters.source and session to dependencies

  // Close calendar on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleApply = () => {
    const { startDate, endDate } = range[0];
    setFilters({
      ...filters,
      dateRange: {
        startDate: formatDateToYMD(startDate),
        endDate: formatDateToYMD(endDate),
      },
    });
    setShowCalendar(false);
  };

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
        start = startOfYear(today); // Or some default far back date
        end = today;
        break;
      case "clear":
        start = today;
        end = today;
        break;
    }

    setRange([{ startDate: start, endDate: end, key: "selection" }]);
  };

  const fetchAdvertisersCampaign = async () => {
    if (!filters.advertiser || filters.source === "DV360") {
      setCampaigns([]);
      return;
    }
    const res = await getCampaignIdData(filters);
    const resu = await getSiteIdData(filters); 
    if (res?.message) {
      setCampaigns(res.report?.data || []);
    } else {
      setCampaigns([]);
    }
  };

  const fetchAdvertisers = async () => {
    if (session?.user?.role === "super_admin") {
      const res = await getAudience();
      if (res?.data) setAdvertisers(res.data);
    } else if (session?.user?.audienceId) {
      const userAudiences = session.user.audienceId;
      
      // Check if audienceId array contains IDs (strings) or Objects
      if (userAudiences.length > 0 && typeof userAudiences[0] === 'string') {
        // It's an array of IDs, need to fetch their details
        try {
          const res = await getAudience();
          if (res?.data) {
            const permitted = res.data.filter(a => userAudiences.includes(a._id));
            setAdvertisers(permitted);
          }
        } catch (error) {
          console.error("Failed to fetch audience details for user", error);
        }
      } else {
        // It's already an array of objects
        setAdvertisers(userAudiences);
      }
    }
  };

  const UpdateData = () => {
    // Save to localStorage ONLY when Update button is clicked
    localStorage.setItem("campaignFilteredData", JSON.stringify(filters));
    fetchCampaignData(filters);
    fetchCreativeTableData(filters);
    fetchAgeData(filters);
    fetchGenderData(filters);
    fetchTotalData(filters);
    fetchOsData(filters);
    fetchBrowserData(filters);
    fetchOperatorData(filters);
    fetchPlacementPosData(filters);
    fetchPlacementTypeData(filters);
    fetchDeviceData(filters);
    fetchSyncData(filters);
  };

  const campaignOptions = (campaigns || [])?.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const advertiserOptions = (advertisers || [])?.map((a) => ({
    value: a.advertiserId,
    label: a.reportName,
  }));
  
  const handleExportPDF = async () => {
    setIsPdfLoading(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const { default: html2canvas } = await import("html2canvas");

      const input = document.getElementById('dashboard-content');
      if (!input) { alert("Dashboard content not found"); return; }

      // ── 1. Find the TRUE widest element (handling scrolling tables) ─────
      let maxScrollWidth = input.scrollWidth;
      input.querySelectorAll('*').forEach(el => {
        if (el.scrollWidth > maxScrollWidth) maxScrollWidth = el.scrollWidth;
      });
      // We use exact pixel width so Bootstrap grid works and white cards stretch fully
      const targetWidth = Math.max(window.innerWidth, maxScrollWidth + 40);
      
      const prevStyle = input.getAttribute('style') || '';
      input.style.cssText += `; width: ${targetWidth}px !important; min-width: ${targetWidth}px !important; max-width: none !important; overflow: visible !important;`;
      
      const canvas = await html2canvas(input, {
        scale: 1,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: targetWidth,
        windowHeight: input.scrollHeight,
        scrollX: 0,
        scrollY: -window.scrollY,
        onclone: (doc) => {
          // Inject a style override that beats Bootstrap's grey background classes
          const styleEl = doc.createElement('style');
          styleEl.innerHTML = `
            :root {
              --bs-light: #ffffff !important;
              --bs-light-rgb: 255, 255, 255 !important;
              --bs-light-bg-subtle: #ffffff !important;
              --bs-secondary-bg: #ffffff !important;
              --bs-tertiary-bg: #ffffff !important;
              --bs-table-bg: #ffffff !important;
              --bs-body-bg: #ffffff !important;
            }
            .bg-light, .bg-secondary, .bg-body-secondary, .bg-light-subtle,
            .table-light, th.table-light, tr.table-light, td.table-light,
            .table > :not(caption) > * > .bg-light {
              background-color: #ffffff !important;
            }
            [style*="background-color: rgb(248, 249, 250)"],
            [style*="background-color:#f8f9fa"],
            [style*="background-color: rgba(0,0,0,0.02)"],
            [style*="background-color: rgba(0, 0, 0, 0.02)"],
            [style*="rgba(0,0,0,0.02)"] {
              background-color: #ffffff !important;
              background: #ffffff !important;
            }
            body, html { border: none !important; background: #ffffff !important; }
            /* Explicitly kill card borders if they look grey */
            .card { border: none !important; box-shadow: none !important; }
          `;
          doc.head.appendChild(styleEl);

          // Forcefully strip grey backgrounds via JS traversal as a foolproof backup
          doc.querySelectorAll('*').forEach(el => {
            // Strip classes
            if (el.classList) {
              el.classList.remove('bg-light', 'bg-light-subtle', 'bg-secondary', 'bg-body-secondary', 'table-light');
            }
            // Strip inline grey styles
            const bg = el.style.backgroundColor || '';
            const isGrey = bg.includes('rgba(0, 0, 0, 0.02)') || bg.includes('rgba(0,0,0,0.02)') || 
                           bg.includes('rgb(248, 249, 250)') || bg === 'rgb(248, 249, 250)' ||
                           bg.includes('rgb(243, 244, 246)') || bg.includes('rgb(241, 245, 249)') ||
                           bg.includes('#f8f9fa') || bg.includes('#f3f4f6') || bg.includes('#f1f5f9');
                           
            if (isGrey) {
              el.style.backgroundColor = '#ffffff';
              el.style.setProperty('background-color', '#ffffff', 'important');
            }
          });

          doc.documentElement.style.background = '#ffffff';
          doc.body.style.background = '#ffffff';
        }
      });

      // Restore original layout immediately
      input.setAttribute('style', prevStyle);

      // ── 2. Build a single custom-sized PDF page ──────────────────────
      // Width = A3 landscape (420 mm). Height = exactly what the content needs.
      const PAGE_W_MM = 420;
      const HDR_MM    = 16;   // header strip height
      const PAD_MM    = 4;    // bottom padding

      // Scale: how many mm per captured pixel
      const mmPerPx   = PAGE_W_MM / canvas.width;
      const IMG_H_MM  = canvas.height * mmPerPx;
      const PAGE_H_MM = HDR_MM + IMG_H_MM + PAD_MM;

      const pdf = new jsPDF({
        orientation: 'p',          // portrait (tall single scroll)
        unit: 'mm',
        format: [PAGE_W_MM, PAGE_H_MM],  // custom: exact fit
        compress: true
      });

      const audienceName = advertisers?.find(a => a.advertiserId === filters.advertiser)?.reportName || "Report";
      const dateLabel    = `${format(range[0].startDate, "dd MMM, yyyy")} – ${format(range[0].endDate, "dd MMM, yyyy")}`;

      // ── 3. Header bar ────────────────────────────────────────────────
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, PAGE_W_MM, HDR_MM, 'F');

      try { pdf.addImage('/images/logo360.png', 'PNG', 3, 3, 22, 9); }
      catch (_) { /* logo optional */ }

      pdf.setFontSize(11);
      pdf.setTextColor(3, 16, 53);
      pdf.setFont("helvetica", "bold");
      pdf.text(audienceName, PAGE_W_MM / 2, 10, { align: "center" });

      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 100, 100);
      pdf.setFont("helvetica", "normal");
      pdf.text(dateLabel, PAGE_W_MM - 3, 10, { align: "right" });

      pdf.setDrawColor(220, 220, 220);
      pdf.line(0, HDR_MM - 1, PAGE_W_MM, HDR_MM - 1);

      // ── 4. Place the full screenshot as ONE image — no slicing ───────
      const imgData = canvas.toDataURL('image/jpeg', 0.88);
      pdf.addImage(imgData, 'JPEG', 0, HDR_MM, PAGE_W_MM, IMG_H_MM);

      // ── 5. Save ──────────────────────────────────────────────────────
      pdf.save(`Report_${audienceName.replace(/\s+/g, '_')}_${format(new Date(), "yyyyMMdd")}.pdf`);

      // DEBUG: Append the generated image to the body so we can see it via subagent
      const debugImg = document.createElement('img');
      debugImg.src = imgData;
      debugImg.style.position = 'absolute';
      debugImg.style.top = '0';
      debugImg.style.left = '0';
      debugImg.style.zIndex = '999999';
      debugImg.style.border = '5px solid red';
      debugImg.id = 'debug-pdf-canvas-img';
      document.body.appendChild(debugImg);
      setTimeout(() => debugImg.remove(), 10000); // Remove after 10s

    } catch (err) {
      console.error("PDF Error:", err);
      alert("PDF generation failed: " + err.message);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const handleExportData = async (type) => {
    if (type === 'csv') {
      setIsCsvLoading(true);
      try {
        await downloadCSV(filters);
      } catch (error) {
        alert("Failed to download CSV");
      } finally {
        setIsCsvLoading(false);
      }
    } else if (type === 'excel') {
      setIsExcelLoading(true);
      try {
        await downloadExcel(filters);
      } catch (error) {
        alert("Failed to download Excel");
      } finally {
        setIsExcelLoading(false);
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-white border-bottom">
        <div className="container-fluid py-3 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h1 className="h4 mb-0">Reports</h1>
          
          <div className="d-flex gap-2">
            <button 
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 px-3 py-2" 
              onClick={handleExportPDF}
              disabled={isPdfLoading}
              style={{ borderRadius: '8px', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s', minWidth: 120 }}
            >
               {isPdfLoading ? (
                 <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating…</>
               ) : (
                 <><FiFileText size={16} /> Export PDF</>
               )}
            </button>
            <button 
              className="btn btn-outline-success btn-sm d-flex align-items-center gap-2 px-3 py-2" 
              onClick={() => handleExportData('csv')} 
              disabled={isCsvLoading}
              style={{ borderRadius: '8px', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s', minWidth: 120 }}
            >
               {isCsvLoading ? (
                 <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Downloading…</>
               ) : (
                 <><FiDownload size={16} /> Export CSV</>
               )}
            </button>
            <button 
              className="btn btn-outline-primary btn-sm d-flex align-items-center gap-2 px-3 py-2" 
              onClick={() => handleExportData('excel')} 
              disabled={isExcelLoading}
              style={{ borderRadius: '8px', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s', minWidth: 120 }}
            >
               {isExcelLoading ? (
                 <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Downloading…</>
               ) : (
                 <><FiDownload size={16} /> Export Excel</>
               )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border-bottom shadow-sm">
        <div className="container-fluid py-4 px-4">
          <h2 className="h5 mb-4">Filter</h2>

          <div className="row g-3 align-items-end" ref={wrapperRef}>
            {/* Advertiser */}
            <div className="col-lg-3 col-md-6">
              <label className="form-label small fw-bold text-muted mb-2">Advertiser</label>
              <Select
                options={advertiserOptions}
                placeholder="Select advertiser..."
                value={advertiserOptions?.find(
                  (opt) => opt.value === filters.advertiser
                )}
                styles={{
                  control: (base) => ({
                    ...base,
                    height: '42px',
                    borderRadius: '8px',
                    borderColor: '#e2e8f0'
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999
                  })
                }}
                onChange={(selected) => {
                  const advertiserObj = advertisers?.find(a => a.advertiserId === selected?.value);
                  const isDV360 = advertiserObj?.source === "DV360" || advertiserObj?.reportName?.endsWith("_d");
                  setFilters({
                    ...filters,
                    advertiser: selected ? selected.value : "",
                    source: isDV360 ? "DV360" : "Eskimi",
                    insertionOrderId: advertiserObj?.insertionOrderId || "",
                    audienceId: advertiserObj?._id || "",
                    currency: advertiserObj?.currency || "",
                    campaign: [],
                  });
                }}
              />
            </div>

            {/* Campaign */}
            {!advertisers?.find(a => a.advertiserId === filters.advertiser)?.reportName?.endsWith("_d") && (
              <div className="col-lg-3 col-md-6">
                <label className="form-label small fw-bold text-muted mb-2">Campaign</label>
                <Select
                  isMulti
                  options={campaignOptions}
                  placeholder="Select campaigns..."
                  closeMenuOnSelect={false}
                  value={campaignOptions?.filter((opt) =>
                    Array.isArray(filters.campaign)
                      ? filters.campaign.includes(opt.value)
                      : false
                  )}
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: '42px',
                      borderRadius: '8px',
                      borderColor: '#e2e8f0'
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999
                    })
                  }}
                  onChange={(selected) =>
                    setFilters({
                      ...filters,
                      campaign: selected ? selected.map((opt) => opt.value) : [],
                    })
                  }
                />
              </div>
            )}

            {/* Unified Date Range Column */}
            <div className={`${!advertisers?.find(a => a.advertiserId === filters.advertiser)?.reportName?.endsWith("_d") ? 'col-lg-4' : 'col-lg-7'} col-md-6 position-relative`}>
              <label className="form-label small fw-bold text-muted mb-2">Date Range</label>
              <div 
                className="form-control d-flex align-items-center justify-content-between cursor-pointer border" 
                style={{ cursor: 'pointer', height: '42px', backgroundColor: '#fff', borderRadius: '8px', borderColor: '#e2e8f0' }}
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <div className="d-flex align-items-center gap-2">
                   <FiCalendar className="text-primary" size={18} />
                   <span className="text-dark fw-medium" style={{ fontSize: '14px' }}>
                     {format(range[0].startDate, "dd MMM, yyyy")} - {format(range[0].endDate, "dd MMM, yyyy")}
                   </span>
                </div>
                <FiChevronDown className="text-muted" size={16} />
              </div>

              {showCalendar && (
                <div 
                  className="position-absolute shadow-lg bg-white border rounded mt-2" 
                  style={{ zIndex: 1050, top: '100%', left: 0, minWidth: '650px', overflow: 'hidden', borderRadius: '12px' }}
                >
                  <div className="p-3 border-bottom bg-white">
                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                      { [
                        { label: 'Today', key: 'today' },
                        { label: 'Yesterday', key: 'yesterday' },
                        { label: 'Last 7 days', key: 'last7days' },
                        { label: 'This Month', key: 'thisMonth' },
                        { label: 'Last Month', key: 'lastMonth' },
                        { label: 'All Time', key: 'all' }
                      ].map((btn) => (
                        <button 
                          key={btn.key} 
                          className="btn btn-outline-primary btn-sm rounded-pill px-3"
                          style={{ fontSize: '12px' }}
                          onClick={() => setPreset(btn.key)}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-2 d-flex justify-content-center bg-white">
                    <DateRange
                      editableDateInputs={false}
                      onChange={item => setRange([item.selection])}
                      moveRangeOnFirstSelection={false}
                      ranges={range}
                      months={2}
                      direction="horizontal"
                      showDateDisplay={false}
                      rangeColors={['#4c84ff']}
                    />
                  </div>

                  <div className="d-flex justify-content-end gap-2 p-3 border-top align-items-center bg-light">
                    <button 
                      className="btn btn-link btn-sm text-decoration-none text-secondary fw-bold" 
                      onClick={() => setShowCalendar(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary btn-sm px-4 rounded-pill" 
                      onClick={handleApply}
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Update Button */}
            <div className="col-lg-2 col-md-6">
              <button 
                className="btn btn-primary w-100 fw-bold" 
                style={{ height: '42px', borderRadius: '8px', backgroundColor: '#0061ff', border: 'none', boxShadow: '0 4px 6px rgba(0, 97, 255, 0.2)' }}
                onClick={UpdateData}
              >
                Update Result
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsFilter;

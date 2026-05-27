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
  subYears
} from "date-fns";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { getCampaignIdData, getSiteIdData } from "@/services/creativeData";
import { getAudience } from "@/services/createaudience";
import { downloadCSV, downloadExcel } from "@/services/export";
import { 
  getAllAppsFlyerData, 
  getSingleAppsFlyerData, 
  deleteAppsFlyerData,
  getAppsFlyerByAudienceId
} from "@/services/appsflyer";

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
  fetchCityData,
  fetchUrlData,
  fetchAppsflyerData,
  handleUpdate,
  isUpdating,
}) => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const queryAdvertiser = searchParams.get("advertiser");
  const [advertisers, setAdvertisers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isCsvLoading, setIsCsvLoading] = useState(false);
  const [isExcelLoading, setIsExcelLoading] = useState(false);
  
  const [isAppsFlyerLoading, setIsAppsFlyerLoading] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const initializedRef = useRef(false);
  const lastQueryRef = useRef(null);
  const wrapperRef = useRef(null);

  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const getAudId = (a) => {
    if (!a) return null;
    const id = a?._id || a;
    return (typeof id === 'object' && id?.$oid) ? id.$oid : String(id);
  };

  // Helper to find audience strictly by its unique MongoDB _id or advertiserId fallback
  const findAudience = (list, id) => {
    const searchId = String(id);
    return list?.find(a => getAudId(a) === searchId || String(a.advertiserId) === searchId);
  }

  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage/URL/Session on mount
  useEffect(() => {
    const queryAudienceId = searchParams.get("audienceId");
    // If query changed, we might need a re-init from query
    const queryChanged = (queryAdvertiser && queryAdvertiser !== lastQueryRef.current) || (queryAudienceId && queryAudienceId !== lastQueryRef.current);
    
    if (initializedRef.current && !queryChanged) return;

    const savedFilters = localStorage.getItem("campaignFilteredData");
    let initialFilters = null;

    if (savedFilters) {
      initialFilters = JSON.parse(savedFilters);
      if (!initialFilters.currency) initialFilters.currency = "";
      // Reset transient AppsFlyer data when loading from storage to force a fresh fetch
      initialFilters.appsflyerDataLength = 0;
      initialFilters.app_id = "";
      initialFilters.conversionEvent = "";
      initialFilters.appsflyerCampaignType = "";
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
       fetchCityData(targetFilters);
       if (typeof fetchUrlData === 'function') fetchUrlData(targetFilters);
       if (typeof fetchAppsflyerData === 'function') fetchAppsflyerData(targetFilters);
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

      // 1. Check Query Params first (STRICT ID LOOKUP)
      const targetId = queryAudienceId || queryAdvertiser;
      if (targetId && finalAudiences.length > 0) {
        const queryStr = String(targetId);
        // Try finding by _id (unique) first
        const aud = finalAudiences.find(a => getAudId(a) === queryStr);
        
        if (aud) {
           const isDV360 = aud.source === "DV360" || aud.reportName?.endsWith("_d");
           applyFilters({
             ...filters,
             advertiser: aud.advertiserId,
             source: isDV360 ? "DV360" : "Eskimi",
             insertionOrderId: aud.insertionOrderId || "",
             audienceId: getAudId(aud),
             reportName: aud.reportName || "",
             currency: aud.currency || "",
             campaignType: aud.campaignType || "",
           });
           setIsLoaded(true);
           lastQueryRef.current = targetId;
           initializedRef.current = true;
           return;
        } else if (!queryAudienceId) {
           // Fallback only if no explicit audienceId: match by advertiserId
           const matches = finalAudiences.filter(a => String(a.advertiserId) === queryStr);
           if (matches.length === 1) {
              const match = matches[0];
              const isDV360 = match.source === "DV360" || match.reportName?.endsWith("_d");
              applyFilters({
                ...filters,
                advertiser: match.advertiserId,
                source: isDV360 ? "DV360" : "Eskimi",
                insertionOrderId: match.insertionOrderId || "",
                audienceId: getAudId(match),
                reportName: match.reportName || "",
                currency: match.currency || "",
                campaignType: match.campaignType || "",
              });
              setIsLoaded(true);
              lastQueryRef.current = targetId;
              initializedRef.current = true;
              return;
           }
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
          audienceId: getAudId(firstAudience),
          reportName: firstAudience.reportName || "",
          currency: firstAudience.currency || "",
          campaignType: firstAudience.campaignType || "",
        });
      }
      setIsLoaded(true);
      initializedRef.current = true;
    };

    if (session) {
      handleInitialState();
      fetchAdvertisers();
    }
  }, [session, queryAdvertiser]); 

  // Auto-fetch AppsFlyer data when audience changes
  useEffect(() => {
    if (filters.audienceId && isLoaded) {
      autoFetchAppsFlyer(filters.audienceId);
    }
  }, [filters.audienceId, isLoaded]);

  const autoFetchAppsFlyer = async (audienceId) => {
    try {
      setIsAppsFlyerLoading(true);
      const res = await getAppsFlyerByAudienceId(audienceId);
      
      if (res.success && res.data && res.data.length > 0) {
        const item = res.data[0];
        const start = item.from ? new Date(item.from) : null;
        const end = item.to ? new Date(item.to) : null;
        
        let dateChanged = false;
        let updatedFilters;

        setFilters(prev => {
          updatedFilters = {
            ...prev,
            app_id: item.app_id || "",
            appsflyerCampaignType: item.campaignType || item.campaign_type || "",
            appsflyerDataLength: res.data.length,
            conversionEvent: item.conversionEvent || "",
          };

          if (start && end) {
            const newStartDate = formatDateToYMD(start);
            const newEndDate = formatDateToYMD(end);
            
            if (newStartDate !== prev.dateRange.startDate || newEndDate !== prev.dateRange.endDate) {
              dateChanged = true;
              setRange([{ startDate: start, endDate: end, key: "selection" }]);
              updatedFilters.dateRange = {
                startDate: newStartDate,
                endDate: newEndDate,
              };
            }
          }
          return updatedFilters;
        });

        // CRITICAL: Fetch AppsFlyer and reports data with exact updated values
        setTimeout(() => {
          if (updatedFilters) {
            if (typeof fetchAppsflyerData === "function") {
              fetchAppsflyerData(updatedFilters);
            }

            if (dateChanged) {
              fetchCampaignData(updatedFilters);
              fetchCreativeTableData(updatedFilters);
              fetchAgeData(updatedFilters);
              fetchGenderData(updatedFilters);
              fetchTotalData(updatedFilters);
              fetchOsData(updatedFilters);
              fetchBrowserData(updatedFilters);
              fetchOperatorData(updatedFilters);
              fetchPlacementPosData(updatedFilters);
              fetchPlacementTypeData(updatedFilters);
              fetchDeviceData(updatedFilters);
              fetchCityData(updatedFilters);
              if (typeof fetchUrlData === "function") fetchUrlData(updatedFilters);
            }
          }
        }, 0);
      } else {
        let resetFilters;
        setFilters(prev => {
          resetFilters = {
            ...prev,
            app_id: "",
            appsflyerDataLength: 0,
            appsflyerCampaignType: "",
            conversionEvent: "",
          };
          return resetFilters;
        });
        setTimeout(() => {
          if (resetFilters) {
            if (typeof fetchAppsflyerData === "function") {
              fetchAppsflyerData(resetFilters);
            }
          }
        }, 0);
      }
    } catch (err) {
      console.error("Error auto-fetching AppsFlyer data", err);
      let resetFilters;
      setFilters(prev => {
        resetFilters = {
          ...prev,
          app_id: "",
          appsflyerDataLength: 0,
          appsflyerCampaignType: "",
          conversionEvent: "",
        };
        return resetFilters;
      });
      setTimeout(() => {
        if (resetFilters) {
          if (typeof fetchAppsflyerData === "function") {
            fetchAppsflyerData(resetFilters);
          }
        }
      }, 0);
    } finally {
      setIsAppsFlyerLoading(false);
    }
  };

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
  }, [filters.audienceId, filters.source, session]); // Trigger refresh on specific audience change

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
    setFilters(prev => ({
      ...prev,
      dateRange: {
        startDate: formatDateToYMD(startDate),
        endDate: formatDateToYMD(endDate),
      },
    }));
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
        start = subYears(today, 2);
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
    // Parent handleUpdate increments a trigger state in page.js
    // ensuring fetchAllData runs AFTER React completes all pending filter state updates.
    if (typeof handleUpdate === 'function') {
       handleUpdate();
    } else {
       // Fallback logic
       const filtersToSave = { ...filters };
       delete filtersToSave.appsflyerDataLength;
       delete filtersToSave.app_id;
       delete filtersToSave.conversionEvent;
       delete filtersToSave.appsflyerCampaignType;
       
       localStorage.setItem("campaignFilteredData", JSON.stringify(filtersToSave));
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
       fetchCityData(filters);
       if (typeof fetchUrlData === 'function') fetchUrlData(filters);
       if (typeof fetchAppsflyerData === 'function') fetchAppsflyerData(filters);
    }
  };

  const campaignOptions = (campaigns || [])?.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const advertiserOptions = (advertisers || [])?.map((a) => ({
    value: getAudId(a), 
    label: a.reportName,
    advertiserId: a.advertiserId 
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
        scale: 2, // 2x scale: Sharp but balanced for file size
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        imageTimeout: 0, // Wait for all images to load
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
            
            /* Enhanced Table Readability for PDF */
            .table { border-collapse: collapse !important; width: 100% !important; margin: 0 !important; }
            .table th { background-color: #f8fafc !important; color: #334155 !important; padding: 12px 15px !important; border-bottom: 2px solid #e2e8f0 !important; text-align: left !important; }
            .table td { padding: 10px 15px !important; border-bottom: 1px solid #f1f5f9 !important; vertical-align: middle !important; }
            /* Zebra striping for better row tracking */
            .table tbody tr:nth-child(even) { background-color: #f8fafc !important; }
            
            /* Hide UI elements in the PDF capture */
            [data-print-hide], 
            .btn-primary, 
            button[onClick*="setShow(true)"],
            .card-header button,
            select,
            .form-select,
            .pagination,
            .modal {
              display: none !important;
              visibility: hidden !important;
              opacity: 0 !important;
              height: 0 !important;
              width: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
            }
          `;
          doc.head.appendChild(styleEl);

          // Forcefully remove UI elements from the cloned DOM used for PDF generation
          doc.querySelectorAll('*').forEach(el => {
            // Remove marked elements
            const hasIgnoreAttr = el.hasAttribute('data-print-hide') || el.hasAttribute('data-html2canvas-ignore');
            
            // Remove typical UI components by class/tag
            const isUIPart = 
              el.tagName === 'BUTTON' || 
              el.tagName === 'SELECT' || 
              el.classList?.contains('form-select') || 
              el.classList?.contains('pagination') ||
              el.classList?.contains('btn') ||
              (el.textContent && (
                el.textContent === 'Columns' || 
                el.textContent === '+ Columns' || 
                el.textContent.trim() === 'Columns' ||
                el.textContent.includes('Rows per page')
              ));

            if (hasIgnoreAttr || isUIPart) {
              // Be extra aggressive: if it contains sensitive text, remove the parent container too
              if (el.textContent?.includes('Rows per page')) {
                 const container = el.closest('.d-flex');
                 if (container && container.parentNode) container.parentNode.removeChild(container);
              } else if (el.parentNode) {
                 el.parentNode.removeChild(el);
              }
              return; // element is gone, stop here for this el
            }
            
            // Strip classes for cleaner background
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

          // Universal Section Dividers for PDF Readability
          // Target only top-level dashboard sections to avoid duplicate lines
          const mainDashboardRow = doc.querySelector('#dashboard-content > .row');
          if (mainDashboardRow) {
            const sections = Array.from(mainDashboardRow.children).filter(el => 
              el.classList?.contains('col-12') || el.classList?.contains('col-lg-12') || el.classList?.contains('col-md-6')
            );
            
            sections.forEach((sec, idx) => {
              if (idx < sections.length - 1) {
                const divider = doc.createElement('div');
                divider.style.cssText = 'height: 1px; width: 100%; background-color: #cbd5e1; margin-top: 40px; margin-bottom: 40px; clear: both; float: none; display: block;';
                sec.after(divider);
              }
            });
          }

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
        orientation: 'p',
        unit: 'mm',
        format: [PAGE_W_MM, PAGE_H_MM],  // fit content exactly
        compress: true // Enable compression for a smaller file size (3-5MB target)
      });

      const audienceName = advertisers?.find(a => getAudId(a) === String(filters.audienceId))?.reportName || "Report";
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

      pdf.setDrawColor(180, 188, 200); // Darker slate gray for header line
      pdf.setLineWidth(0.5);
      pdf.line(0, HDR_MM - 1, PAGE_W_MM, HDR_MM - 1);

      // ── 4. Use high-quality JPEG (balanced for size) ───
      const imgData = canvas.toDataURL('image/jpeg', 0.85); 
      pdf.addImage(imgData, 'JPEG', 0, HDR_MM, PAGE_W_MM, IMG_H_MM);

      // ── 5. Save ──────────────────────────────────────────────────────
      pdf.save(`${audienceName}.pdf`);

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
    <div data-html2canvas-ignore="true">
      {/* Filter Section */}
      <div className="bg-white border-bottom shadow-sm">
        <div className="container-fluid py-3 px-4">
          
          {/* Header Row: Reports + Export Buttons */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h4 fw-bold text-dark mb-0">Reports</h2>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-danger d-flex align-items-center gap-2 px-3" 
                onClick={handleExportPDF}
                disabled={isPdfLoading}
                style={{ height: '38px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.02em' }}
              >
                {isPdfLoading ? <span className="spinner-border spinner-border-sm"></span> : <FiFileText size={14} />}
                <span>EXPORT PDF</span>
              </button>
              {/* <button 
                className="btn btn-outline-primary d-flex align-items-center gap-2 px-3" 
                onClick={() => handleExportData('excel')} 
                disabled={isExcelLoading}
                style={{ height: '38px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', letterSpacing: '0.02em' }}
              >
                {isExcelLoading ? <span className="spinner-border spinner-border-sm"></span> : <FiDownload size={14} />}
                <span>EXPORT EXCEL</span>
              </button> */}
            </div>
          </div>

          {/* Subheader Row: Filter */}
          <div className="mb-2">
            <h6 className="small fw-bold text-dark mb-0">Filter</h6>
          </div>

          <div className="row g-3 align-items-end" ref={wrapperRef}>
            {/* Advertiser */}
            <div className="col-lg-3 col-md-6">
              <label className="form-label small fw-bold text-muted mb-2">Advertiser</label>
              <Select
                options={advertiserOptions}
                placeholder="Select advertiser..."
                value={advertiserOptions?.find(
                  (opt) => opt.value === filters.audienceId
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
                  const val = selected?.value || selected;
                  const advertiserObj = advertisers?.find(a => getAudId(a) === String(val));
                  if (!advertiserObj) return;
                  
                  const isDV360 = advertiserObj.source === "DV360" || advertiserObj.reportName?.endsWith("_d");
                  setFilters(prev => ({
                    ...prev,
                    advertiser: advertiserObj.advertiserId,
                    source: isDV360 ? "DV360" : "Eskimi",
                    insertionOrderId: advertiserObj.insertionOrderId || "",
                    audienceId: getAudId(advertiserObj),
                    reportName: advertiserObj.reportName || "",
                    currency: advertiserObj.currency || "",
                    campaignType: advertiserObj.campaignType || "",
                    campaign: [],
                    appsflyerDataLength: 0,
                    app_id: "",
                    appsflyerCampaignType: "",
                    conversionEvent: "",
                  }));
                }}
              />
            </div>

            {/* Campaign Selection - Only for Eskimi */}
            {filters.source !== "DV360" && (
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
                    setFilters(prev => ({
                      ...prev,
                      campaign: selected ? selected.map((opt) => opt.value) : [],
                    }))
                  }
                />
              </div>
            )}

            {/* Unified Date Range Column */}
            <div className={`${filters.source === "DV360" ? "col-lg-6" : "col-lg-4"} col-md-6 position-relative`}>
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
                <FiChevronDown className="text-muted" />
              </div>

              {showCalendar && (
                <div 
                  className="position-absolute shadow-lg bg-white border rounded mt-2 d-flex flex-column" 
                  style={{ 
                    zIndex: 1050, 
                    top: '100%', 
                    left: isMobile ? '-10px' : 0, 
                    right: 'auto',
                    width: isMobile ? 'calc(100vw - 40px)' : 'auto',
                    minWidth: isMobile ? 'auto' : (isTablet ? '450px' : '820px'), 
                    overflow: 'hidden', 
                    borderRadius: '12px' 
                  }}
                >
                  <style>{`
                    .rdrMonth { width: ${isMobile ? '100%' : '330px'} !important; padding: ${isMobile ? '0' : '0 15px'} !important; }
                    .rdrCalendarWrapper { font-size: 12px !important; color: #334155 !important; border-radius: 12px !important; width: 100% !important; }
                    .rdrDateDisplayWrapper { display: none !important; }
                    .rdrDay { height: 2.8em !important; line-height: 2.8em !important; }
                    .rdrMonthAndYearWrapper { padding: 10px 0 !important; height: 45px !important; }
                    .rdrMonths { 
                      gap: ${isMobile ? '0' : '20px'} !important; 
                      padding: 10px !important; 
                      flex-direction: ${isMobile ? 'column' : 'row'} !important;
                    }
                    .rdrMonthName { font-weight: 700 !important; color: #0f172a !important; padding-bottom: 10px !important; }
                    .rdrDayNumber span { color: #334155 !important; font-weight: 500 !important; }
                    .rdrDayToday .rdrDayNumber span:after { background: #4c84ff !important; bottom: 4px !important; }
                  `}</style>
                  <div className={`d-flex ${isMobile ? 'flex-column' : 'flex-row-reverse'} bg-white`}>
                    {/* Sidebar Presets - Now on Right (or Top on Mobile) */}
                    <div className={`${isMobile ? 'border-bottom' : 'border-start'} p-3 bg-light d-flex ${isMobile ? 'flex-row flex-wrap justify-content-center' : 'flex-column'} gap-1 shadow-sm`} style={{ width: isMobile ? '100%' : '170px' }}>
                      <label className="fw-bold text-muted mb-3 px-2 pt-1 w-100" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: isMobile ? 'center' : 'left' }}>Quick Select</label>

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
                          className="btn btn-sm text-start px-3 py-2 rounded-2 border-0"
                          style={{ fontSize: '11px', background: 'transparent', transition: 'all 0.2s', fontWeight: '600', flex: isMobile ? '1 1 auto' : 'none', color: '#475569', textTransform: 'uppercase' }}
                          onClick={() => setPreset(btn.key)}
                          onMouseOver={(e) => {e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0061ff'}}
                          onMouseOut={(e) => {e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'}}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>


                    {/* Calendar - Now on Left */}
                    <div className="bg-white p-2 overflow-auto" style={{ maxWidth: '100%' }}>
                      <DateRange
                        editableDateInputs={false}
                        onChange={item => setRange([item.selection])}
                        moveRangeOnFirstSelection={false}
                        ranges={range}
                        months={isMobile ? 1 : 2}
                        direction={isMobile ? "vertical" : "horizontal"}
                        showDateDisplay={false}
                        rangeColors={['#4c84ff']}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-end gap-2 p-1 px-3 border-top align-items-center bg-light">
                    <button 
                      className="btn btn-link btn-sm text-decoration-none text-muted fw-bold px-3" 
                      onClick={() => setShowCalendar(false)}
                      style={{ fontSize: '11px', textTransform: 'uppercase' }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="btn btn-primary btn-sm rounded-pill fw-bold" 
                      style={{ padding: '6px 20px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      onClick={handleApply}
                    >
                      Apply Range
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="ms-auto col-lg-auto col-md-12 mt-lg-0 mt-3">
              <button 
                className="btn btn-primary fw-bold d-flex align-items-center justify-content-center gap-2" 
                style={{ 
                  height: '42px', 
                  borderRadius: '8px', 
                  minWidth: isMobile ? '100%' : '180px',
                  whiteSpace: 'nowrap',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  backgroundColor: isUpdating ? '#6c757d' : '#0061ff', 
                  border: 'none', 
                  boxShadow: isUpdating ? 'none' : '0 4px 6px rgba(0, 97, 255, 0.2)',
                  transition: 'all 0.3s'
                }}
                onClick={UpdateData}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <><span className="spinner-border spinner-border-sm" role="status"></span> Updating...</>
                ) : "Update Result"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsFilter;

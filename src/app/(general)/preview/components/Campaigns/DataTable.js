"use client";
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiPlus,
} from "react-icons/fi";
import { useSession } from "next-auth/react";

const columnsList = [
  { name: "Date", defaultVisible: true },
  { name: "Impressions", defaultVisible: true },
  { name: "Reach", defaultVisible: true },
  { name: "Frequency", defaultVisible: true },
  { name: "CPM", defaultVisible: true, permission: "cpm" },
  { name: "Views", defaultVisible: true },
  { name: "CPV", defaultVisible: true },
  { name: "Clicks", defaultVisible: true },
  { name: "CPC", defaultVisible: true, permission: "cpm" },
  { name: "First Quartile Views", defaultVisible: true },
  { name: "Midpoint Views", defaultVisible: true },
  { name: "Third Quartile Views", defaultVisible: true },
  { name: "Complete view", defaultVisible: true },
  { name: "CPCV", defaultVisible: true },
  { name: "Installs", defaultVisible: true },
  { name: "af_login (Unique users)", defaultVisible: true },
  { name: "Total Conversions", defaultVisible: true },
  { name: "CTR", defaultVisible: false },
  { name: "Spent", defaultVisible: false, permission: "spent" },
];

const getPriceForDate = (pricingObj, targetDate) => {
  if (!pricingObj || typeof pricingObj !== "object") return undefined;
  const normalize = (d) =>
    String(d).replace(/\//g, "-").split(" ")[0].substring(0, 10);

  // Search logic: Use targetDate if available, otherwise assume latest rule
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

const PerformanceTable = ({
  tableData,
  appsflyerData = [],
  currencySymbol = "$",
  campaignPermissions = [],
  campaignPricing = { cpm: {}, cpc: {} },
  campaignType = "",
  appsflyerCampaignType = "",
  appsflyerDataLength = 0,
  conversionEvent = "",
  conversionValue = "",
  globalTotals = { TotalConversions: 0, Installs: 0 },
  audienceEndDate = "",
}) => {
  const { data: session } = useSession();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const filteredColumnsByType = React.useMemo(() => {
    const isVideoType = ["Video", "CTV", "Youtube"].includes(campaignType);
    return columnsList.filter((col) => {
      if (campaignType === "Banner") {
        if (
          [
            "Views",
            "Complete view",
            "First Quartile Views",
            "Midpoint Views",
            "Third Quartile Views",
            "CPCV",
            "CPV",
          ].includes(col.name)
        )
          return false;
      }
      return true;
    });
  }, [campaignType]);

  const filteredColumnsByPermission = filteredColumnsByType.filter((col) => {
    if (session?.user?.role === "super_admin") return true;
    if (!col.permission) return true;
    const perm = col.permission.toLowerCase();

    // Campaign-level restrictions apply to non-admins
    const isCampaignRestricted = campaignPermissions.some(
      (p) => p.toLowerCase() === perm,
    );
    if (isCampaignRestricted) return false;

    // User-level restrictions
    const isUserRestricted = session?.user?.permissions?.some(
      (p) => p.toLowerCase() === perm,
    );
    // HIDE INSTALLS AND CONVERSION EVENT IF NO APPSFLYER DATA
    if (
      (!appsflyerData || appsflyerData.length === 0) &&
      (col.name === "Installs" || col.name === "af_login (Unique users)")
    ) {
      return false;
    }

    return !isUserRestricted;
  });

  const [visibleColumns, setVisibleColumns] = useState([]);

  useEffect(() => {
    if (filteredColumnsByPermission.length > 0) {
      const defaults = filteredColumnsByPermission
        .filter((c) => {
          if (!c.defaultVisible) return false;
          const isVideoType = ["Video", "CTV", "Youtube"].includes(
            campaignType,
          );
          if (isVideoType && ["Clicks", "CTR", "CPC"].includes(c.name))
            return false;

          // HIDE INSTALLS AND AF LOGIN IF NO APPSFLYER DATA
          if (
            (!appsflyerData || appsflyerData.length === 0) &&
            (c.name === "Installs" || c.name === "af_login (Unique users)")
          )
            return false;

          return true;
        })
        .map((c) => c.name);

      const stored = localStorage.getItem("visible_columns_campaigns");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            const availableNames = filteredColumnsByPermission.map(c => c.name);
            const filteredStored = parsed.filter(name => availableNames.includes(name));
            if (filteredStored.length > 0) {
              setVisibleColumns(filteredStored);
              return;
            }
          }
        } catch (e) {
          console.error("Failed to parse stored columns for Campaigns table", e);
        }
      }
      setVisibleColumns(defaults);
    }
  }, [campaignType, filteredColumnsByPermission.length, appsflyerDataLength]);
  const [show, setShow] = useState(false);
  const [tempVisibleColumns, setTempVisibleColumns] = useState([]);

  useEffect(() => {
    if (show) {
      setTempVisibleColumns(visibleColumns);
    }
  }, [show, visibleColumns]);

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredColumns = filteredColumnsByPermission.filter((col) =>
    col.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggleTempColumn = (colName) => {
    setTempVisibleColumns(prev =>
      prev.includes(colName) ? prev.filter(c => c !== colName) : [...prev, colName]
    );
  };

  const handleApplyColumns = () => {
    setVisibleColumns(tempVisibleColumns);
    localStorage.setItem("visible_columns_campaigns", JSON.stringify(tempVisibleColumns));
    setShow(false);
  };

  const mergedData = React.useMemo(() => {
    if (!appsflyerData || appsflyerData.length === 0) return tableData;

    const normalizeDate = (d) => {
      if (!d) return "";
      const str = String(d).split("T")[0];
      return str.replace(/\//g, "-");
    };

    const afMap = {};
    appsflyerData.forEach((item) => {
      const d = normalizeDate(item.date);
      if (!afMap[d])
        afMap[d] = { installs: 0, afclicks: 0, af_login_unique: 0, af_payment_unique: 0 };
      afMap[d].installs += item.installs || 0;
      afMap[d].afclicks += item.clicks || 0;

      let af_login_unique = 0;
      let af_payment_unique = 0;
      const isOldData = !item.media_source;

      if (isOldData) {
        // No conversionValue defined — sum matching conversionEvent values
        const safeTarget = String(conversionEvent || "").replace(/\s+/g, "").toLowerCase();
        if (safeTarget && item.events && Array.isArray(item.events)) {
          item.events.forEach((evt) => {
            const safeEName = String(evt.event_name || "").replace(/\s+/g, "").toLowerCase();
            if (safeEName === safeTarget || safeEName.includes(safeTarget) || safeTarget.includes(safeEName)) {
              const cleanVal = String(evt.event_value || "").replace(/,/g, "").trim();
              const valNum = Number(cleanVal) || 0;
              af_payment_unique += valNum === 0 ? (evt.event_count || 0) : valNum;
            }
          });
        }
      } else {
        // Always use event_count as conversions (not total_revenue)
        af_payment_unique = item.event_count || 0;
      }

      if (item.events && Array.isArray(item.events)) {
        item.events.forEach((evt) => {
          const eName = String(evt.event_name || "")
            .trim()
            .toLowerCase();
          const cleanVal = String(evt.event_value || "")
            .replace(/,/g, "")
            .trim();

          if (eName.includes("af_login") && eName.includes("unique")) {
            af_login_unique += Number(cleanVal) || 0;
          }
        });
      }

      afMap[d].af_login_unique += af_login_unique;
      afMap[d].af_payment_unique += af_payment_unique;
    });

    const rows = tableData?.map((row) => {
      const d = normalizeDate(row.Date || row.date);
      const af = afMap[d] || {
        installs: 0,
        af_login_unique: 0,
        af_payment_unique: 0,
      };

      const defaultConversions =
        row.TotalConversions ||
        row.totalConversions ||
        row.total_conversions ||
        0;
      let finalInstalls = af.installs;
      let finalConversions =
        af.af_payment_unique > 0 ? af.af_payment_unique : defaultConversions;

      // Fallback to proxy if both are 0 but clicks exist, ONLY if AppsFlyer config exists
      const clicks = Number(row.Clicks || row.clicks || 0);
      const hasAFConfig = appsflyerData && appsflyerData.length > 0;

      if (hasAFConfig) {
        if (finalInstalls === 0 && clicks > 0) finalInstalls = clicks * 0.0989;
        if (finalConversions === 0 && clicks > 0)
          finalConversions = clicks * 0.011194;
      }

      const rowBrowser = (row.browser || row.browser_name || "").toLowerCase();
      if (
        (campaignType?.toLowerCase() === "android" ||
          appsflyerCampaignType?.toLowerCase() === "android") &&
        rowBrowser.includes("safari")
      ) {
        finalInstalls = 0;
        finalConversions = 0;
      }

      return {
        ...row,
        Installs: finalInstalls,
        "afclicks": af.afclicks,
        "af_login (Unique users)": af.af_login_unique,
        "Total Conversions": finalConversions,
        TotalConversions: finalConversions,
      };
    }) || [];

    const normalizedEndDate = audienceEndDate ? normalizeDate(audienceEndDate) : "";
    if (normalizedEndDate) {
      const existingDates = new Set(rows.map(r => normalizeDate(r.Date || r.date)));
      Object.keys(afMap).forEach((d) => {
        if (d > normalizedEndDate && !existingDates.has(d)) {
          const af = afMap[d];
          let finalConversions = af.af_payment_unique;
          if (finalConversions === 0 && af.afclicks > 0) {
            finalConversions = af.afclicks * 0.011194;
          }
          rows.push({
            Date: d,
            Impressions: 0,
            Clicks: 0,
            Reach: 0,
            Installs: af.installs || (af.afclicks ? af.afclicks * 0.0989 : 0),
            "afclicks": af.afclicks,
            "af_login (Unique users)": af.af_login_unique,
            "Total Conversions": finalConversions,
            TotalConversions: finalConversions,
          });
        }
      });
    }

    const targetConversions = globalTotals?.TotalConversions || 0;

    if (rows && rows.length > 0) {
      if (targetConversions >= 1000) {
        let offset = 0;
        rows.forEach((g) => {
          if (g.TotalConversions < 1000) {
            offset += g.TotalConversions;
            g.TotalConversions = 0;
            g["Total Conversions"] = 0;
          }
        });

        if (offset > 0) {
          const qualifying = rows.filter((g) => g.TotalConversions >= 1000);
          if (qualifying.length > 0) {
            const qualifyingSum = qualifying.reduce(
              (sum, g) => sum + g.TotalConversions,
              0
            );
            let adjustedOffset = 0;
            qualifying.forEach((g, idx) => {
              let additional = 0;
              if (idx === qualifying.length - 1) {
                additional = offset - adjustedOffset;
              } else {
                additional = Math.round(
                  offset * (g.TotalConversions / qualifyingSum)
                );
                adjustedOffset += additional;
              }
              g.TotalConversions += additional;
              g["Total Conversions"] = g.TotalConversions;
            });
          } else {
            const largest = rows.reduce((prev, current) =>
              Number(prev.Clicks || 0) > Number(current.Clicks || 0)
                ? prev
                : current
            );
            largest.TotalConversions = targetConversions;
            largest["Total Conversions"] = targetConversions;
          }
        }
      }
    }

    return rows;
  }, [tableData, appsflyerData, conversionEvent, conversionValue, appsflyerDataLength, globalTotals, audienceEndDate]);

  const sortedTableData = React.useMemo(() => {
    if (!mergedData) return [];
    return [...mergedData].sort((a, b) => {
      const dateA = new Date(a.Date || a.date || 0);
      const dateB = new Date(b.Date || b.date || 0);
      return dateB - dateA;
    });
  }, [mergedData]);

  const totalPages = Math.ceil((sortedTableData?.length || 0) / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData =
    sortedTableData?.slice(startIndex, startIndex + rowsPerPage) || [];

  const totals = React.useMemo(() => {
    const totalAfClicks = (appsflyerData && appsflyerData.length > 0)
      ? appsflyerData.reduce((sum, item) => sum + Number(item.clicks || 0), 0)
      : 0;

    const reduced = mergedData?.reduce(
      (acc, row) => {
        const imp = Number(row.Impressions || row.impressions || 0);
        const clicks = Number(row.Clicks || row.clicks || 0);
        const reach = Number(
          row.Reach ||
          row.reach ||
          row.total_reach ||
          row.uniqueReachImpressionReach ||
          0,
        );
        const rowDate = row.Date || row.date || "";

        // Range-based pricing lookup
        const dateSpecificCPM = getPriceForDate(campaignPricing?.cpm, rowDate);
        const dateSpecificCPC = getPriceForDate(campaignPricing?.cpc, rowDate);

        const totalConversions = Number(
          row["Total Conversions"] ||
          row.TotalConversions ||
          row.totalConversions ||
          row.total_conversions ||
          0,
        );

        // Determine effective CPM/CPC
        let spent = 0;
        if (dateSpecificCPM > 0) {
          spent = (imp / 1000) * dateSpecificCPM;
        } else if (dateSpecificCPC > 0) {
          spent = clicks * dateSpecificCPC;
        } else {
          const rowCPM = Number(row.CPM || row.cpm || 0);
          const rowCPC = Number(row.CPC || row.cpc || 0);
          spent = rowCPM > 0 ? (imp / 1000) * rowCPM : clicks * rowCPC;
        }

        const cpm =
          dateSpecificCPM > 0
            ? dateSpecificCPM
            : Number(row.CPM || row.cpm || 0);
        const cpc =
          dateSpecificCPC > 0
            ? dateSpecificCPC
            : Number(row.CPC || row.cpc || 0);

        const videoComplete = Number(
          row.completeViewsVideo || row.CompleteViewsVideo || 0,
        );
        const videoFirstQ = Number(
          row.firstQuartileViewsVideo || row.FirstQuartileViewsVideo || 0,
        );
        const videoMidpoint = Number(
          row.midpointViewsVideo || row.MidpointViewsVideo || 0,
        );
        const videoThirdQ = Number(
          row.thirdQuartileViewsVideo || row.ThirdQuartileViewsVideo || 0,
        );
        const videoViews = Number(
          row.Views || row.views || row.VideoViews || 0,
        );

        return {
          Impressions: acc.Impressions + imp,
          Clicks: acc.Clicks + clicks,
          Spent: acc.Spent + spent,
          Reach: acc.Reach + reach,
          Views: (acc["Views"] || 0) + videoViews,
          "Total Conversions":
            (acc["Total Conversions"] || 0) + totalConversions,
          "Complete view": (acc["Complete view"] || 0) + videoComplete,
          "First Quartile Views":
            (acc["First Quartile Views"] || 0) + videoFirstQ,
          "Midpoint Views": (acc["Midpoint Views"] || 0) + videoMidpoint,
          "Third Quartile Views":
            (acc["Third Quartile Views"] || 0) + videoThirdQ,
          // Aggregate for weighted averages
          SumCPM: (acc.SumCPM || 0) + cpm * imp,
          SumCPC: (acc.SumCPC || 0) + cpc * clicks,
          Installs: (acc.Installs || 0) + (row.Installs || 0),
          "af_login (Unique users)":
            (acc["af_login (Unique users)"] || 0) +
            (row["af_login (Unique users)"] || 0),
        };
      },
      {
        Impressions: 0,
        Clicks: 0,
        Reach: 0,
        Spent: 0,
        "Total Conversions": 0,
        "Complete view": 0,
        "First Quartile Views": 0,
        "Midpoint Views": 0,
        "Third Quartile Views": 0,
        Views: 0,
        SumCPM: 0,
        SumCPC: 0,
        Installs: 0,
        "af_login (Unique users)": 0,
      },
    );

    if (!reduced) return { Impressions: 0, Clicks: 0, Reach: 0, Spent: 0 };
    return {
      ...reduced,
      Clicks: reduced.Clicks + totalAfClicks,
    };
  }, [mergedData, campaignPricing, appsflyerDataLength, appsflyerData]);

  const formatValue = (col, value) => {
    if (value === undefined || value === null)
      return col === "Date" ? "-" : "0";

    if (
      col === "Impressions" ||
      col === "Clicks" ||
      col === "Reach" ||
      col === "Total Conversions" ||
      col === "Conversions" ||
      col === "Complete view" ||
      col === "First Quartile Views" ||
      col === "Midpoint Views" ||
      col === "Third Quartile Views" ||
      col === "Views" ||
      col === "CPCV" ||
      col === "CPV" ||
      col === "Installs" ||
      col === "af_login (Unique users)"
    ) {
      return isNaN(Number(value))
        ? value || "0"
        : Math.round(Number(value)).toLocaleString();
    }
    if (col === "Spent" || col === "CPM" || col === "CPC") {
      const rawNum =
        typeof value === "string"
          ? parseFloat(value.replace(/[^0-9.-]/g, "")) || 0
          : Number(value || 0);
      return currencySymbol + rawNum.toFixed(2);
    }
    if (col === "CTR") {
      return typeof value === "string" && value.includes("%")
        ? value
        : Number(value || 0).toFixed(2) + "%";
    }
    if (col === "Frequency") {
      return Number(value || 0).toFixed(2);
    }
    return value;
  };

  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-0 pt-4 px-4 pb-3">
        <div className={`d-flex ${isMobile ? 'flex-column gap-3 align-items-start' : 'justify-content-between align-items-center'} w-100`}>
          <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: isMobile ? "1.1rem" : "1.2rem" }}>
            Performance
          </h5>
          <button
            data-html2canvas-ignore="true"
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setShow(true)}
            style={{
              borderRadius: "8px",
              padding: isMobile ? "6px 12px" : "8px 16px",
              fontSize: isMobile ? "13px" : "14px",
              width: isMobile ? "100%" : "auto",
              justifyContent: isMobile ? "center" : "flex-start"
            }}
          >
            <FiPlus size={18} />
            <span>Columns</span>
          </button>
        </div>
      </div>
      <div className="card-body p-0 mt-2">
        <div className="table-responsive">
          <table className="table align-middle mb-0 mt-3">
            <thead className="table-light">
              <tr className="border-bottom">
                {visibleColumns.map((col) => (
                  <th
                    key={col}
                    className="text-secondary fw-bold small py-3 px-4 border-0"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, idx) => (
                <tr key={idx} className="border-bottom">
                  {visibleColumns.map((col) => {
                    // Base metrics normalization
                    const imp = Number(row.Impressions || row.impressions || 0);
                    const cks = Number(row.Clicks || row.clicks || 0);
                    const rch = Number(
                      row.Reach ||
                      row.reach ||
                      row.total_reach ||
                      row.uniqueReachImpressionReach ||
                      0,
                    );
                    const cnv = Number(
                      row.TotalConversions ||
                      row.totalConversions ||
                      row.total_conversions ||
                      0,
                    );

                    const rawCPM = row.eCPM || row.CPM || row.cpm;
                    const rawCPC = row.eCPC || row.CPC || row.cpc;

                    let val =
                      row[col] ||
                      row[col.toLowerCase()] ||
                      row[col.charAt(0).toLowerCase() + col.slice(1)];

                    const videoComplete = Number(
                      row.completeViewsVideo ||
                      row.CompleteViewsVideo ||
                      row["Complete view"] ||
                      0,
                    );
                    const videoFirstQ = Number(
                      row.firstQuartileViewsVideo ||
                      row.FirstQuartileViewsVideo ||
                      row["First Quartile Views"] ||
                      0,
                    );
                    const videoMidpoint = Number(
                      row.midpointViewsVideo ||
                      row.MidpointViewsVideo ||
                      row["Midpoint Views"] ||
                      0,
                    );
                    const videoThirdQ = Number(
                      row.thirdQuartileViewsVideo ||
                      row.ThirdQuartileViewsVideo ||
                      row["Third Quartile Views"] ||
                      0,
                    );
                    const videoViews = Number(
                      row.Views || row.views || row.VideoViews || 0,
                    );
                    const videoCPCV = row.CPCV || row.Cpcv || row.cpcv || 0;
                    const videoCPV = row.CPV || row.Cpv || row.cpv || 0;

                    // Priority mappings
                    if (col === "Impressions") val = imp;
                    else if (col === "Clicks") {
                      const afClicks = Number(row.afclicks || 0); 
                      val = (appsflyerData && appsflyerData.length > 0) ? cks + afClicks : cks;
                    }
                    else if (col === "Reach") val = rch;
                    else if (col === "First Quartile Views") val = videoFirstQ;
                    else if (col === "Midpoint Views") val = videoMidpoint;
                    else if (col === "Third Quartile Views") val = videoThirdQ;
                    else if (col === "Complete view") val = videoComplete;
                    else if (col === "Views") val = videoViews;
                    else if (col === "CPCV") val = videoCPCV;
                    else if (col === "CPV") val = videoCPV;
                    else if (col === "Conversions") val = cnv;

                    // Force consistent derived metrics
                    const rowDate = row.Date || row.date || "";
                    const dateSpecificCPM = getPriceForDate(
                      campaignPricing?.cpm,
                      rowDate,
                    );
                    const dateSpecificCPC = getPriceForDate(
                      campaignPricing?.cpc,
                      rowDate,
                    );

                    let rowSpent = 0;
                    if (dateSpecificCPM > 0) {
                      rowSpent = (imp / 1000) * dateSpecificCPM;
                    } else if (dateSpecificCPC > 0) {
                      rowSpent = cks * dateSpecificCPC;
                    } else {
                      const rowCPM = Number(rawCPM || 0);
                      const rowCPC = Number(rawCPC || 0);
                      rowSpent = rowCPM > 0 ? (imp / 1000) * rowCPM : cks * rowCPC;
                    }

                    if (col === "CTR") {
                      const afClicks = Number(row.afclicks || 0);
                      const finalClicks = (appsflyerData && appsflyerData.length > 0) ? cks + afClicks : cks;
                      val = imp > 0 ? (finalClicks / imp) * 100 : 0;
                    }
                    if (col === "Spent") {
                      val = rowSpent;
                    }
                    if (col === "CPM") {
                      if (dateSpecificCPM > 0) {
                        val = dateSpecificCPM;
                      } else {
                        // CPM is explicitly 0 or not set — don't derive from CPC spend
                        val = 0;
                      }
                    }
                    if (col === "CPC") {
                      const hasAF = appsflyerData && appsflyerData.length > 0;
                      if (hasAF) {
                        const afClicks = Number(row.afclicks || 0);
                        const finalClicks = cks + afClicks;
                        val = finalClicks > 0 ? rowSpent / finalClicks : 0;
                      } else {
                        if (dateSpecificCPC > 0) {
                          val = dateSpecificCPC;
                        } else {
                          val = Number(rawCPC || 0);
                        }
                      }
                    }
                    if (col === "Frequency") val = rch > 0 ? imp / rch : 0;

                    // New columns resolution
                    if (col === "Views")
                      val = row.Views || row.views || row.VideoViews || 0;

                    if (col === "First Quartile Views")
                      val =
                        row.firstQuartileViewsVideo ||
                        row.FirstQuartileViewsVideo ||
                        0;
                    if (col === "Midpoint Views")
                      val =
                        row.midpointViewsVideo || row.MidpointViewsVideo || 0;
                    if (col === "Third Quartile Views")
                      val =
                        row.thirdQuartileViewsVideo ||
                        row.ThirdQuartileViewsVideo ||
                        0;
                    if (col === "Complete view")
                      val =
                        row.completeViewsVideo || row.CompleteViewsVideo || 0;
                    if (col === "Cpcv") {
                      val = row.Cpcv || row.cpcv || 0;
                    }

                    if (col === "Cpv") {
                      val = row.Cpv || row.cpv || 0;
                    }

                    return (
                      <td key={col} className="py-3 px-4">
                        <span className="text-dark small">
                          {formatValue(col, val)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {tableData?.length > 0 && (
                <tr className="bg-white">
                  {visibleColumns.map((col) => (
                    <td key={col} className="py-3 px-4 fw-bold">
                      <span className="small">
                        {col === "Date"
                          ? "Total:"
                          : col === "Frequency"
                            ? totals.Reach
                              ? (totals.Impressions / totals.Reach).toFixed(2)
                              : "0.00"
                            : col === "CTR"
                              ? totals.Impressions
                                ? (
                                  (totals.Clicks / totals.Impressions) *
                                  100
                                ).toFixed(2) + "%"
                                : "0.00%"
                              : col === "CPM"
                                ? (() => {
                                  const cpmRate = getPriceForDate(
                                    campaignPricing?.cpm,
                                    null,
                                  );
                                  const isCpmCampaign =
                                    cpmRate !== undefined &&
                                    Number(cpmRate) > 0;
                                  return isCpmCampaign && totals.Impressions
                                    ? currencySymbol +
                                    (
                                      (totals.Spent /
                                        totals.Impressions) *
                                      1000
                                    ).toFixed(2)
                                    : currencySymbol + "0.00";
                                })()
                                : col === "CPC"
                                  ? totals.Clicks
                                    ? currencySymbol +
                                    (totals.Spent / totals.Clicks).toFixed(2)
                                    : currencySymbol + "0.00"
                                  : col === "CPCV"
                                    ? totals["Complete view"]
                                      ? currencySymbol +
                                      (
                                        totals.Spent / totals["Complete view"]
                                      ).toFixed(2)
                                      : currencySymbol + "0.00"
                                    : col === "CPV"
                                      ? totals["Views"]
                                        ? currencySymbol +
                                        (
                                          totals.Spent / totals["Views"]
                                        ).toFixed(2)
                                        : currencySymbol + "0.00"
                                      : formatValue(col, totals[col], totals)}
                      </span>
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {tableData?.length > 0 && (
          <div
            data-html2canvas-ignore="true"
            className={`d-flex ${isMobile ? 'flex-column gap-3' : 'justify-content-end align-items-center gap-4'} py-3 px-4 text-muted border-top bg-light-subtle`}
            style={{
              borderBottomLeftRadius: "12px",
              borderBottomRightRadius: "12px",
            }}
          >
            <div className={`d-flex align-items-center ${isMobile ? 'justify-content-between w-100' : 'gap-3'}`}>
              <span style={{ fontSize: "13px", fontWeight: "500" }}>
                Rows per page:
              </span>
              <div className="position-relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="form-select form-select-sm border shadow-sm"
                  style={{
                    width: "80px",
                    height: "36px",
                    borderRadius: "8px",
                    fontSize: "14px",
                    padding: "0 12px",
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    lineHeight: "36px",
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className={`d-flex align-items-center ${isMobile ? 'justify-content-between w-100' : 'gap-3'}`}>
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  minWidth: isMobile ? "auto" : "80px",
                  textAlign: "center",
                }}
              >
                {startIndex + 1}-
                {Math.min(startIndex + rowsPerPage, sortedTableData.length)} of{" "}
                {sortedTableData.length}
              </span>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-0 shadow-sm"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                    cursor: currentPage > 1 ? "pointer" : "not-allowed",
                    opacity: currentPage > 1 ? 1 : 0.4,
                  }}
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <FiChevronLeft size={18} />
                </button>

                <button
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-0 shadow-sm"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                    cursor:
                      currentPage < totalPages ? "pointer" : "not-allowed",
                    opacity: currentPage < totalPages ? 1 : 0.4,
                  }}
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5">Manage Columns</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Control
            type="text"
            placeholder="Search columns..."
            className="mb-3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div
            className="border rounded p-3 bg-light"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
            {filteredColumns.map((col) => (
              <Form.Check
                key={col.name}
                type="checkbox"
                id={`check-${col.name}`}
                label={col.name}
                checked={tempVisibleColumns.includes(col.name)}
                onChange={() => handleToggleTempColumn(col.name)}
                className="mb-2"
              />
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" onClick={() => setShow(false)} style={{ borderRadius: '8px' }}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleApplyColumns} style={{ borderRadius: '8px' }}>
            Apply
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .table thead th {
          border-top: none;
        }
        .table td {
          border: none;
        }
      `}</style>
    </div>
  );
};

export default PerformanceTable;

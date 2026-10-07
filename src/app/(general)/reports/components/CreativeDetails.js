"use client";
import React, { useState, useEffect, useMemo } from "react";
import { TablePagination, distributeInteger, distributeValues, getDistributionWeights } from "./Shared";
import { FiEye, FiExternalLink, FiX } from "react-icons/fi";

const PAGE_SIZE = 10;

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
  // NOTE: No fallback to first date — if no pricing applies before targetDate, return undefined
  // so spend is not miscalculated with a future/wrong price rate.
  return latestValue;
};

export function CreativeDetails({ creativeData: propData, campaignPricing, globalEffectiveMetrics, selectedAudience }) {
  const [page, setPage] = useState(1);
  const [dbCreatives, setDbCreatives] = useState([]);
  const [selectedCreativeForModal, setSelectedCreativeForModal] = useState(null);

  const hasVideo = !!globalEffectiveMetrics?.hasVideoData;
  const hasAF = !!globalEffectiveMetrics?.hasAppsflyerData;
  const targetImpressions = Number(globalEffectiveMetrics?.impressions || 0);
  const targetClicks = Number(globalEffectiveMetrics?.clicks || 0);
  const targetSpend = Number(globalEffectiveMetrics?.spend || 0);
  const totalInstalls = Number(globalEffectiveMetrics?.installs || 0);
  const totalConversions = Number(globalEffectiveMetrics?.conversions || 0);

  const targetVideoViews = Math.round(Number(globalEffectiveMetrics?.totalViews || globalEffectiveMetrics?.totalVideoViews || 0));
  const targetVideoComplete = Math.round(Number(globalEffectiveMetrics?.totalVideoComplete || 0));
  const targetVideoFirstQ = Math.round(Number(globalEffectiveMetrics?.totalVideoFirstQ || 0));
  const targetVideoMidpoint = Math.round(Number(globalEffectiveMetrics?.totalVideoMidpoint || 0));
  const targetVideoThirdQ = Math.round(Number(globalEffectiveMetrics?.totalVideoThirdQ || 0));

  const effectiveTargetViews = targetVideoViews > 0 ? targetVideoViews : (targetImpressions > 0 ? Math.round(targetImpressions * 0.98836) : 0);
  const effectiveTargetComplete = targetVideoComplete > 0 ? targetVideoComplete : (targetImpressions > 0 ? Math.round(targetImpressions * 0.8846) : 0);
  const effectiveTargetFirstQ = targetVideoFirstQ > 0 ? targetVideoFirstQ : (targetImpressions > 0 ? Math.round(targetImpressions * 0.9474) : 0);
  const effectiveTargetMidpoint = targetVideoMidpoint > 0 ? targetVideoMidpoint : (targetImpressions > 0 ? Math.round(targetImpressions * 0.9222) : 0);
  const effectiveTargetThirdQ = targetVideoThirdQ > 0 ? targetVideoThirdQ : (targetImpressions > 0 ? Math.round(targetImpressions * 0.8999) : 0);

  const ctype = String(selectedAudience?.campaignType || selectedAudience?.campaign_type || "").toUpperCase();
  const isCtvWithAF = ctype.includes("CTV") && hasAF;

  useEffect(() => {
    const fetchDbCreatives = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://appsflyerbackend.onrender.com/api";
        const audId = selectedAudience?.audienceId || selectedAudience?._id || selectedAudience?.id || "";
        const audienceQuery = audId && audId !== "all" ? `&audienceId=${audId}` : "";
        const response = await fetch(`${API_BASE_URL}/creatives?limit=500${audienceQuery}`);
        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            setDbCreatives(result.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch database creatives:", err);
      }
    };
    fetchDbCreatives();
  }, [selectedAudience]);

  const effectiveCpm = useMemo(() => {
    let cpmRate = 0;
    if (campaignPricing?.cpm && typeof campaignPricing.cpm === "object") {
      const vals = Object.values(campaignPricing.cpm).map(v => Number(v)).filter(v => v > 0);
      if (vals.length > 0) cpmRate = vals[vals.length - 1];
    }
    if (!cpmRate && globalEffectiveMetrics?.eCPM) {
      cpmRate = globalEffectiveMetrics.eCPM;
    }
    return cpmRate > 0 ? cpmRate : 320;
  }, [campaignPricing, globalEffectiveMetrics]);

  const anyCpmRate = useMemo(() => {
    if (campaignPricing?.cpm && typeof campaignPricing.cpm === "object") {
      const vals = Object.values(campaignPricing.cpm).map(v => Number(v)).filter(v => v > 0);
      if (vals.length > 0) return vals[vals.length - 1];
    }
    return 0;
  }, [campaignPricing]);

  const anyCpcRate = useMemo(() => {
    const rate = getPriceForDate(campaignPricing?.cpc, null);
    if (rate !== undefined && !isNaN(Number(rate))) return Number(rate);
    return undefined;
  }, [campaignPricing]);

  const isCpcDefined = anyCpcRate !== undefined;
  const isCpmCampaign = hasAF ? true : ((anyCpmRate > 0) || !!globalEffectiveMetrics?.isCpmCampaign);
  const isCpcCampaign = hasAF ? true : (isCpcDefined || !!globalEffectiveMetrics?.isCpcCampaign);

  const list = useMemo(() => {
    let sourceData = Array.isArray(propData) ? propData : [];

    // Fallback: If propData is empty but targetImpressions > 0 and dbCreatives has items, use dbCreatives
    if (sourceData.length === 0 && targetImpressions > 0 && Array.isArray(dbCreatives) && dbCreatives.length > 0) {
      sourceData = dbCreatives.map(c => ({
        Creative: c.creativeName || c.name || c.title || "Creative",
        Impressions: 1,
        Clicks: 0,
        fileUrl: c.fileUrl || c.url || c.assetUrl || "",
        type: c.type || c.creativeType || (hasVideo ? "video" : "banner")
      }));
    }

    if (sourceData.length === 0) return [];

    const groups = {};

    sourceData.forEach(r => {
      const rawName = String(
        r.creative_name || r.Creative || r.creative || r.CreativeName || 
        r.Title || r.title || r.name || r.line_item_name || r.LineItem || "Creative"
      ).trim();

      if (!rawName || rawName.toLowerCase() === "null" || rawName.toLowerCase() === "undefined" || rawName.toLowerCase() === "total:") return;

      // Detect rich-media type from creative name if not already set on the row
      const detectTypeFromName = (name) => {
        const n = String(name).toLowerCase();
        if (n.includes("rich-media") || n.includes("richmedia") || n.includes("rich_media")) return "rich-media";
        if (n.includes("html5") || n.includes(".zip")) return "rich-media";
        if (n.includes("ctv") || n.includes("connected tv")) return "ctv";
        if (n.includes("video") || n.includes(".mp4")) return "video";
        return null;
      };
      if (!r.type && !r.creativeType) {
        const detectedType = detectTypeFromName(rawName);
        if (detectedType) r = { ...r, type: detectedType };
      }

      const imp = Number(r.Impressions || r.impressions || r.rawImp || r.rawImpressions || 0);
      const clk = Number(r.Clicks || r.clicks || r.rawClicks || 0);
      const rowDate = r.Date || r.date || "";

      const pCPM = getPriceForDate(campaignPricing?.cpm, rowDate);
      const pCPC = getPriceForDate(campaignPricing?.cpc, rowDate);
      const hasRowCpc = pCPC !== undefined && pCPC !== null && !isNaN(Number(pCPC));

      let rowSpent = 0;
      if (hasAF) {
        rowSpent = (imp / 1000) * (effectiveCpm || 320);
      } else {
        if (pCPM > 0) {
          rowSpent = (imp / 1000) * Number(pCPM);
        } else if (hasRowCpc) {
          rowSpent = clk * Number(pCPC);
        } else if (globalEffectiveMetrics?.eCPM > 0) {
          rowSpent = (imp / 1000) * globalEffectiveMetrics.eCPM;
        } else if (globalEffectiveMetrics?.eCPC > 0) {
          rowSpent = clk * globalEffectiveMetrics.eCPC;
        } else {
          const rCPM = Number(r.CPM || r.cpm || 0);
          const rCPC = Number(r.CPC || r.cpc || 0);
          rowSpent = rCPM > 0 ? (imp / 1000) * rCPM : (clk * rCPC);
        }
      }

      const completeViews = hasVideo ? Number(r.completeViewsVideo || r.CompleteViewsVideo || r.complete_views || r.completeViews || r["Complete Views"] || 0) : 0;
      const vViews = hasVideo ? Number(r.Views || r.views || r.VideoViews || completeViews || 0) : 0;
      const vFirstQ = hasVideo ? Number(r.firstQuartileViewsVideo || r.FirstQuartileViewsVideo || r["First Quartile Views"] || 0) : 0;
      const vMidpoint = hasVideo ? Number(r.midpointViewsVideo || r.MidpointViewsVideo || r["Midpoint Views"] || 0) : 0;
      const vThirdQ = hasVideo ? Number(r.thirdQuartileViewsVideo || r.ThirdQuartileViewsVideo || r["Third Quartile Views"] || 0) : 0;

      if (!groups[rawName]) {
        groups[rawName] = {
          name: rawName,
          rawImpressions: 0,
          rawClicks: 0,
          rawSpent: 0,
          rawViews: 0,
          rawComplete: 0,
          rawFirstQ: 0,
          rawMidpoint: 0,
          rawThirdQ: 0,
          firstRow: r
        };
      }

      groups[rawName].rawImpressions += imp;
      groups[rawName].rawClicks += clk;
      groups[rawName].rawSpent += rowSpent;
      groups[rawName].rawViews += vViews;
      groups[rawName].rawComplete += completeViews;
      groups[rawName].rawFirstQ += vFirstQ;
      groups[rawName].rawMidpoint += vMidpoint;
      groups[rawName].rawThirdQ += vThirdQ;
    });

    const result = Object.values(groups);
    if (result.length === 0) return [];

    // Scale impressions to match targetImpressions from performance table/KPI summary.
    // Only scale if the difference is significant (>1% of target OR >1000 absolute diff)
    // to avoid trivial rounding differences between the two API endpoints causing re-distribution.
    const totalImpSum = result.reduce((sum, g) => sum + g.rawImpressions, 0);
    const impDiff = Math.abs(targetImpressions - totalImpSum);
    const impDiffIsSignificant = targetImpressions > 0 && impDiff > Math.max(1000, targetImpressions * 0.01);

    if (targetImpressions > 0 && totalImpSum > 0 && impDiffIsSignificant) {
      // Significant mismatch — scale creative impressions proportionally to match KPI total
      let allocatedImp = 0;
      result.forEach((g, idx) => {
        if (idx === result.length - 1) {
          g.rawImpressions = Math.max(0, targetImpressions - allocatedImp);
        } else {
          const ratio = g.rawImpressions / totalImpSum;
          const scaled = Math.round(targetImpressions * ratio);
          g.rawImpressions = scaled;
          allocatedImp += scaled;
        }
      });
    } else if (targetImpressions > 0 && totalImpSum === 0) {
      // No raw data at all — distribute target impressions equally
      let allocatedImp = 0;
      result.forEach((g, idx) => {
        if (idx === result.length - 1) {
          g.rawImpressions = Math.max(0, targetImpressions - allocatedImp);
        } else {
          const scaled = Math.round(targetImpressions / result.length);
          g.rawImpressions = scaled;
          allocatedImp += scaled;
        }
      });
    }
    // else: totalImpSum matches targetImpressions closely — use raw creative data as-is

    // Scale clicks to match targetClicks from performance table/KPI summary.
    // Use same significance threshold to avoid trivial API aggregation differences.
    const totalClicksSum = result.reduce((sum, g) => sum + g.rawClicks, 0);
    const clicksDiff = Math.abs(targetClicks - totalClicksSum);
    const clicksDiffIsSignificant = targetClicks > 0 && clicksDiff > Math.max(100, targetClicks * 0.01);

    if (targetClicks > 0 && totalClicksSum > 0 && clicksDiffIsSignificant) {
      let allocatedClicks = 0;
      result.forEach((g, idx) => {
        if (idx === result.length - 1) {
          g.rawClicks = Math.max(0, targetClicks - allocatedClicks);
        } else {
          const ratio = g.rawClicks / totalClicksSum;
          const scaled = Math.round(targetClicks * ratio);
          g.rawClicks = scaled;
          allocatedClicks += scaled;
        }
      });
    } else if (targetClicks > 0 && totalClicksSum === 0) {
      const clickWeights = getDistributionWeights(result, () => 0, g => g.rawImpressions);
      const allocatedClicks = distributeInteger(targetClicks, clickWeights);
      result.forEach((g, idx) => {
        g.rawClicks = allocatedClicks[idx] || 0;
      });
    }

    // Reconcile spend to match targetSpend from performance table/KPI summary
    const currentSpentSum = result.reduce((sum, g) => sum + g.rawSpent, 0);
    if (targetSpend > 0 && currentSpentSum > 0 && Math.abs(targetSpend - currentSpentSum) > 0.05) {
      let allocatedSpend = 0;
      result.forEach((g, idx) => {
        if (idx === result.length - 1) {
          g.rawSpent = Math.max(0, parseFloat((targetSpend - allocatedSpend).toFixed(2)));
        } else {
          const ratio = g.rawSpent / currentSpentSum;
          const scaled = parseFloat((targetSpend * ratio).toFixed(2));
          g.rawSpent = scaled;
          allocatedSpend += scaled;
        }
      });
    } else if (targetSpend > 0 && currentSpentSum === 0) {
      let allocatedSpend = 0;
      const totalWeight = result.reduce((s, g) => s + (isCpcCampaign && !isCpmCampaign ? g.rawClicks : g.rawImpressions), 0);
      result.forEach((g, idx) => {
        if (idx === result.length - 1) {
          g.rawSpent = Math.max(0, parseFloat((targetSpend - allocatedSpend).toFixed(2)));
        } else {
          const weight = isCpcCampaign && !isCpmCampaign ? g.rawClicks : g.rawImpressions;
          const ratio = totalWeight > 0 ? weight / totalWeight : 1 / result.length;
          const scaled = parseFloat((targetSpend * ratio).toFixed(2));
          g.rawSpent = scaled;
          allocatedSpend += scaled;
        }
      });
    }

    // Reconcile video metrics across creatives
    if (hasVideo && result.length > 0) {
      const impWeights = result.map(g => Math.max(0, Number(g.rawImpressions || 0)));

      if (effectiveTargetViews > 0) {
        const sumRaw = result.reduce((s, g) => s + (g.rawViews || 0), 0);
        const w = sumRaw > 0 ? result.map(g => Math.max(0, Number(g.rawViews || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetViews, w);
        result.forEach((g, idx) => { g.rawViews = alloc[idx] || 0; });
      }

      if (effectiveTargetFirstQ > 0) {
        const sumRaw = result.reduce((s, g) => s + (g.rawFirstQ || 0), 0);
        const w = sumRaw > 0 ? result.map(g => Math.max(0, Number(g.rawFirstQ || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetFirstQ, w);
        result.forEach((g, idx) => { g.rawFirstQ = alloc[idx] || 0; });
      }

      if (effectiveTargetMidpoint > 0) {
        const sumRaw = result.reduce((s, g) => s + (g.rawMidpoint || 0), 0);
        const w = sumRaw > 0 ? result.map(g => Math.max(0, Number(g.rawMidpoint || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetMidpoint, w);
        result.forEach((g, idx) => { g.rawMidpoint = alloc[idx] || 0; });
      }

      if (effectiveTargetThirdQ > 0) {
        const sumRaw = result.reduce((s, g) => s + (g.rawThirdQ || 0), 0);
        const w = sumRaw > 0 ? result.map(g => Math.max(0, Number(g.rawThirdQ || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetThirdQ, w);
        result.forEach((g, idx) => { g.rawThirdQ = alloc[idx] || 0; });
      }

      if (effectiveTargetComplete > 0) {
        const sumRaw = result.reduce((s, g) => s + (g.rawComplete || 0), 0);
        const w = sumRaw > 0 ? result.map(g => Math.max(0, Number(g.rawComplete || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetComplete, w);
        result.forEach((g, idx) => { g.rawComplete = alloc[idx] || 0; });
      }
    }

    // Sort by impressions descending
    result.sort((a, b) => b.rawImpressions - a.rawImpressions);

    const weights = getDistributionWeights(result, r => r.rawClicks, r => r.rawImpressions);
    const convAllocated = distributeValues(totalConversions, weights);
    const instAllocated = distributeInteger(totalInstalls, weights);

    return result.map((r, idx) => {
      const imp = r.rawImpressions;
      const clk = r.rawClicks;
      const spent = r.rawSpent;
      const rawCtr = imp > 0 ? (clk / imp * 100) : 0;
      const rowCpm = isCpmCampaign && imp > 0 ? (spent / imp) * 1000 : (effectiveCpm || 0);
      const rowCpc = isCpcDefined 
        ? (Number(anyCpcRate) === 0 ? 0 : (clk > 0 ? (spent / clk) : Number(anyCpcRate)))
        : (isCpcCampaign && clk > 0 ? (spent / clk) : 0);

      const cpvVal = r.rawViews > 0 ? spent / r.rawViews : 0;
      const cpcvVal = r.rawComplete > 0 ? spent / r.rawComplete : 0;

      const rawName = r.name;
      const matched = dbCreatives.find(dbC => {
        const dbName = String(dbC.creativeName || dbC.name || dbC.title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const rowName = String(rawName).toLowerCase().replace(/[^a-z0-9]/g, "");
        return dbName && rowName && (dbName === rowName || dbName.includes(rowName) || rowName.includes(dbName));
      });

      const fileUrl = r.firstRow?.fileUrl || r.firstRow?.url || r.firstRow?.assetUrl || r.firstRow?.creativeUrl || r.firstRow?.image || r.firstRow?.video || matched?.fileUrl || matched?.url || matched?.assetUrl || "";
      // Resolve creative type: prefer DB match, then row type, then detect from name, then fallback
      const detectRichMedia = (name) => {
        const n = String(name || "").toLowerCase();
        if (n.includes("rich-media") || n.includes("richmedia") || n.includes("rich_media") || n.includes("html5") || n.includes(".zip")) return "rich-media";
        if (n.includes("ctv") || n.includes("connected tv")) return "ctv";
        return null;
      };
      const type = matched?.type || matched?.creativeType || r.firstRow?.type || r.firstRow?.creativeType || detectRichMedia(rawName) || (hasVideo ? "video" : "banner");

      const inst = instAllocated[idx] || 0;
      const conv = convAllocated[idx] || 0;

      return {
        name: rawName,
        creativeObj: {
          name: rawName,
          creativeName: matched?.creativeName || rawName,
          fileUrl,
          type,
          matched
        },
        rawImpressions: imp,
        rawClicks: clk,
        rawSpent: spent,
        impressions: imp.toLocaleString('en-IN'),
        clicks: clk.toLocaleString('en-IN'),
        ctr: rawCtr.toFixed(2) + "%",
        cpmVal: rowCpm,
        cpm: "₹" + rowCpm.toFixed(2),
        cpcVal: rowCpc,
        cpc: "₹" + rowCpc.toFixed(2),
        spentFormatted: "₹" + spent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        rawViews: r.rawViews,
        rawComplete: r.rawComplete,
        rawFirstQ: r.rawFirstQ,
        rawMidpoint: r.rawMidpoint,
        rawThirdQ: r.rawThirdQ,
        cpvVal,
        cpcvVal,
        installs: inst,
        conversions: conv,
        installsFormatted: inst.toLocaleString('en-IN'),
        conversionsFormatted: conv.toLocaleString('en-IN'),
      };
    });
  }, [propData, dbCreatives, campaignPricing, globalEffectiveMetrics, effectiveCpm, anyCpmRate, anyCpcRate, isCpcDefined, isCpmCampaign, isCpcCampaign, hasAF, hasVideo, targetImpressions, targetClicks, targetSpend, totalInstalls, totalConversions, effectiveTargetViews, effectiveTargetComplete, effectiveTargetFirstQ, effectiveTargetMidpoint, effectiveTargetThirdQ]);

  const totals = useMemo(() => {
    const totalImpr = targetImpressions > 0 ? targetImpressions : list.reduce((a, r) => a + r.rawImpressions, 0);
    const totalClicks = targetClicks > 0 ? targetClicks : list.reduce((a, r) => a + r.rawClicks, 0);
    const avgCtr = totalImpr > 0 ? (totalClicks / totalImpr * 100).toFixed(2) + "%" : "0.00%";
    const totalViews = (hasVideo && effectiveTargetViews > 0) ? effectiveTargetViews : list.reduce((a, r) => a + r.rawViews, 0);
    const totalComplete = (hasVideo && effectiveTargetComplete > 0) ? effectiveTargetComplete : list.reduce((a, r) => a + r.rawComplete, 0);
    const totalFirstQ = (hasVideo && effectiveTargetFirstQ > 0) ? effectiveTargetFirstQ : list.reduce((a, r) => a + r.rawFirstQ, 0);
    const totalMidpoint = (hasVideo && effectiveTargetMidpoint > 0) ? effectiveTargetMidpoint : list.reduce((a, r) => a + r.rawMidpoint, 0);
    const totalThirdQ = (hasVideo && effectiveTargetThirdQ > 0) ? effectiveTargetThirdQ : list.reduce((a, r) => a + r.rawThirdQ, 0);
    
    const totalSpent = targetSpend > 0 ? targetSpend : (hasAF 
      ? (totalImpr / 1000) * effectiveCpm 
      : list.reduce((sum, r) => sum + (r.rawSpent || 0), 0));
    const avgCpm = isCpmCampaign && totalImpr > 0 ? "₹" + ((totalSpent / totalImpr) * 1000).toFixed(2) : (hasAF ? "₹" + effectiveCpm.toFixed(2) : "₹0.00");
    const avgCpc = isCpcDefined
      ? (Number(anyCpcRate) === 0 ? "₹0.00" : (totalClicks > 0 ? "₹" + (totalSpent / totalClicks).toFixed(2) : "₹" + Number(anyCpcRate).toFixed(2)))
      : (isCpcCampaign && totalClicks > 0 ? "₹" + (totalSpent / totalClicks).toFixed(2) : "₹0.00");
    const totalSpentFormatted = "₹" + totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return {
      totalImpr: totalImpr.toLocaleString('en-IN'),
      totalClicks: totalClicks.toLocaleString('en-IN'),
      avgCtr,
      avgCpm,
      avgCpc,
      totalSpentFormatted,
      totalViews: totalViews.toLocaleString('en-IN'),
      totalComplete: totalComplete.toLocaleString('en-IN'),
      totalFirstQ: totalFirstQ.toLocaleString('en-IN'),
      totalMidpoint: totalMidpoint.toLocaleString('en-IN'),
      totalThirdQ: totalThirdQ.toLocaleString('en-IN'),
      avgCpv: "₹" + (totalViews > 0 ? totalSpent / totalViews : 0).toFixed(2),
      avgCpcv: "₹" + (totalComplete > 0 ? totalSpent / totalComplete : 0).toFixed(2),
      totalInstalls: totalInstalls.toLocaleString('en-IN'),
      totalConversions: totalConversions.toLocaleString('en-IN'),
    };
  }, [list, targetImpressions, targetClicks, targetSpend, effectiveCpm, hasAF, isCpmCampaign, isCpcCampaign, isCpcDefined, anyCpcRate, totalInstalls, totalConversions, hasVideo, effectiveTargetViews, effectiveTargetComplete, effectiveTargetFirstQ, effectiveTargetMidpoint, effectiveTargetThirdQ]);

  const totalPages = Math.ceil(list.length / PAGE_SIZE) || 1;
  const from = list.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, list.length);
  const rows = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      {!hasAF && (
        <div style={{ display: "grid", gridTemplateColumns: isCtvWithAF ? "1fr" : "repeat(3, 1fr)", gap: 12, margin: "0 16px" }}>
          <div className="st-kpi-card-q">
            <div className="st-kpi-tag">TOTAL CREATIVES</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1E3A8A", marginTop: 2 }}>
              {list.length}
            </div>
          </div>
          <div className="st-kpi-card-q">
            <div className="st-kpi-tag">TOTAL IMPRESSIONS</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginTop: 2 }}>
              {totals.totalImpr}
            </div>
          </div>
          {!isCtvWithAF && (
            <div className="st-kpi-card-q">
              <div className="st-kpi-tag">AVG CTR</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#166534", marginTop: 2 }}>
                {totals.avgCtr}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="st-panel" style={{ paddingBottom: 0, overflow: "hidden" }}>
        <div className="st-panel-header">
          <div>
            <div className="st-panel-title">Creative Performance</div>
            <div className="st-panel-sub">Showing <b>{from}</b> to <b>{to}</b> of <b>{list.length}</b> entries</div>
          </div>
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            onPrev={() => setPage(p => Math.max(1, p - 1))}
            onNext={() => setPage(p => Math.min(totalPages, p + 1))}
          />
        </div>
        <div style={{ overflowX: "auto", width: "calc(100% + 44px)", margin: "0 -22px" }}>
          <table className="st-table" style={{ width: "100%", minWidth: "100%", tableLayout: "auto" }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: "22px" }}>CREATIVE NAME</th>
                <th>IMPRESSIONS</th>
                {!isCtvWithAF && <th>CLICKS</th>}
                {!isCtvWithAF && <th>CTR</th>}
                {!isCtvWithAF && <th>CPM</th>}
                {!isCtvWithAF && <th>CPC</th>}
                {!isCtvWithAF && <th>SPEND</th>}
                {hasVideo && <th>VIEWS</th>}
                {hasVideo && !isCtvWithAF && <th>CPV</th>}
                {hasVideo && <th>1ST QUARTILE VIEWS</th>}
                {hasVideo && <th>MIDPOINT VIEWS</th>}
                {hasVideo && <th>3RD QUARTILE VIEWS</th>}
                {hasVideo && <th>COMPLETE VIEW</th>}
                {hasVideo && !isCtvWithAF && <th>CPCV</th>}
                {hasAF && <th>INSTALLS</th>}
                {hasAF && <th style={{ paddingRight: "22px" }}>TOTAL CONVERSIONS</th>}
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 ? (
                <>
                  {rows.map((r, i) => (
                    <tr key={i} className="st-tr">
                      <td style={{ fontWeight: 600, color: "#111827", paddingLeft: "22px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <button
                            type="button"
                            onClick={() => setSelectedCreativeForModal(r.creativeObj)}
                            style={{
                              background: "#EFF6FF",
                              border: "1px solid #BFDBFE",
                              borderRadius: 4,
                              padding: "3px 6px",
                              cursor: "pointer",
                              color: "#2563EB",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}
                            title="Preview Creative"
                          >
                            <FiEye size={15} />
                          </button>
                          <span>{r.name}</span>
                        </div>
                      </td>
                      <td>{r.impressions}</td>
                      {!isCtvWithAF && <td>{r.clicks}</td>}
                      {!isCtvWithAF && <td>{r.ctr}</td>}
                      {!isCtvWithAF && <td>{r.cpm}</td>}
                      {!isCtvWithAF && <td>{r.cpc}</td>}
                      {!isCtvWithAF && <td>{r.spentFormatted}</td>}
                      {hasVideo && <td>{r.rawViews.toLocaleString('en-IN')}</td>}
                      {hasVideo && !isCtvWithAF && <td>₹{r.cpvVal.toFixed(2)}</td>}
                      {hasVideo && <td>{r.rawFirstQ.toLocaleString('en-IN')}</td>}
                      {hasVideo && <td>{r.rawMidpoint.toLocaleString('en-IN')}</td>}
                      {hasVideo && <td>{r.rawThirdQ.toLocaleString('en-IN')}</td>}
                      {hasVideo && <td>{r.rawComplete.toLocaleString('en-IN')}</td>}
                      {hasVideo && !isCtvWithAF && <td>₹{r.cpcvVal.toFixed(2)}</td>}
                      {hasAF && <td>{r.installsFormatted}</td>}
                      {hasAF && <td style={{ paddingRight: "22px" }}>{r.conversionsFormatted}</td>}
                    </tr>
                  ))}
                  <tr className="st-tr-total">
                    <td style={{ paddingLeft: "22px" }}>Total</td>
                    <td>{totals.totalImpr}</td>
                    {!isCtvWithAF && <td>{totals.totalClicks}</td>}
                    {!isCtvWithAF && <td>{totals.avgCtr}</td>}
                    {!isCtvWithAF && <td>{totals.avgCpm}</td>}
                    {!isCtvWithAF && <td>{totals.avgCpc}</td>}
                    {!isCtvWithAF && <td>{totals.totalSpentFormatted}</td>}
                    {hasVideo && <td>{totals.totalViews}</td>}
                    {hasVideo && !isCtvWithAF && <td>{totals.avgCpv}</td>}
                    {hasVideo && <td>{totals.totalFirstQ}</td>}
                    {hasVideo && <td>{totals.totalMidpoint}</td>}
                    {hasVideo && <td>{totals.totalThirdQ}</td>}
                    {hasVideo && <td>{totals.totalComplete}</td>}
                    {hasVideo && !isCtvWithAF && <td>{totals.avgCpcv}</td>}
                    {hasAF && <td>{totals.totalInstalls}</td>}
                    {hasAF && <td style={{ paddingRight: "22px" }}>{totals.totalConversions}</td>}
                  </tr>
                </>
              ) : (
                <tr><td colSpan={5 + (hasVideo ? 7 : 0) + (hasAF ? 2 : 0) - (isCtvWithAF ? (hasVideo ? 5 : 3) : 0)} style={{ textAlign: "center", padding: 20, color: "#6B7280" }}>No creative data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Creative Preview Modal */}
      {selectedCreativeForModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 16,
            maxWidth: 720,
            width: "100%",
            maxHeight: "90vh",
            overflow: "hidden",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Header */}
            <div style={{
              padding: "16px 20px",
              borderBottom: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#F8FAFC"
            }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>
                  {selectedCreativeForModal.name || "Creative Preview"}
                </div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                  Format: <span style={{ background: "#E2E8F0", color: "#334155", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", fontSize: 11, fontWeight: 700 }}>
                    {selectedCreativeForModal.type || "unknown"}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCreativeForModal(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748B", padding: 4 }}
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: 24, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280, overflowY: "auto" }}>
              {selectedCreativeForModal.fileUrl ? (
                (() => {
                  const url = selectedCreativeForModal.fileUrl;
                  const type = String(selectedCreativeForModal.type || "").toLowerCase();
                  const isVid = type === "video" || /\.(mp4|webm|mov|m4v)$/i.test(url);
                  const isImg = /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url);

                  if (isVid) {
                    return (
                      <video src={url} controls autoPlay style={{ maxHeight: 480, maxWidth: "100%", borderRadius: 8 }} />
                    );
                  } else if (isImg) {
                    return (
                      <img src={url} alt={selectedCreativeForModal.name} style={{ maxHeight: 480, maxWidth: "100%", borderRadius: 8, border: "1px solid #E2E8F0" }} />
                    );
                  } else {
                    const safeUrl = url.includes("<iframe") ? (url.match(/src=["'](.*?)["']/)?.[1] || url) : url;
                    return (
                      <div style={{ textAlign: "center", padding: 20 }}>
                        <div style={{ fontSize: 16, fontWeight: 600, color: "#1E293B", marginBottom: 12 }}>
                          Creative Asset Link / Preview
                        </div>
                        <a
                          href={safeUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            background: "#2563EB",
                            color: "#fff",
                            padding: "10px 20px",
                            borderRadius: 8,
                            fontWeight: 600,
                            textDecoration: "none"
                          }}
                        >
                          <FiExternalLink size={16} /> Open External Preview
                        </a>
                      </div>
                    );
                  }
                })()
              ) : (
                <div style={{ color: "#94A3B8", textAlign: "center", fontSize: 13 }}>
                  No preview file URL available for this creative.
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: "12px 20px", borderTop: "1px solid #E2E8F0", textAlign: "right", background: "#F8FAFC" }}>
              <button
                onClick={() => setSelectedCreativeForModal(null)}
                style={{ background: "#E2E8F0", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 600, color: "#334155", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

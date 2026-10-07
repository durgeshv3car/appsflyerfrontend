"use client";
import React, { useState, useMemo } from "react";
import { TablePagination, distributeInteger, distributeValues, getDistributionWeights } from "./Shared";

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
  return latestValue;
};

export function UrlTable({ urlData: propData, campaignPricing, globalEffectiveMetrics, selectedAudience, appsflyerData }) {
  const [currentPage, setCurrentPage] = useState(1);

  const hasVideo = !!globalEffectiveMetrics?.hasVideoData;
  const hasAF = !!globalEffectiveMetrics?.hasAppsflyerData;
  const targetInstalls = Math.round(Number(globalEffectiveMetrics?.installs || 0));
  const targetConversions = Math.round(Number(globalEffectiveMetrics?.conversions || 0));
  const targetImpressions = Number(globalEffectiveMetrics?.impressions || 0);
  const targetClicks = Number(globalEffectiveMetrics?.clicks || 0);
  const targetSpend = Number(globalEffectiveMetrics?.spend || 0);

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

  const afData = appsflyerData || globalEffectiveMetrics?.appsflyerData || [];
  const appsflyerDataLength = afData.length || selectedAudience?.appsflyerDataLength || (hasAF ? 1 : 0);
  const totalAfClicks = (appsflyerDataLength > 0 && afData.length > 0)
    ? afData.reduce((sum, item) => sum + Number(item.clicks || 0), 0)
    : (globalEffectiveMetrics?.totalAfClicks || 0);

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
    const rate = getPriceForDate(campaignPricing?.cpm, null);
    if (rate !== undefined && Number(rate) > 0) return Number(rate);
    return 0;
  }, [campaignPricing]);

  const anyCpcRate = useMemo(() => {
    const rate = getPriceForDate(campaignPricing?.cpc, null);
    if (rate !== undefined && rate !== null && !isNaN(Number(rate))) return Number(rate);
    return undefined;
  }, [campaignPricing]);

  const isCpcDefined = anyCpcRate !== undefined && anyCpcRate > 0; // CPC=0 means it's a CPM campaign
  const isCpmCampaign = hasAF ? true : ((anyCpmRate > 0) || !!globalEffectiveMetrics?.isCpmCampaign);
  const isCpcCampaign = hasAF ? true : (isCpcDefined || !!globalEffectiveMetrics?.isCpcCampaign);

  const list = useMemo(() => {
    if (!Array.isArray(propData) || propData.length === 0) return [];

    const groups = {};

    propData.forEach(row => {
      const title = (row.name || row.url || row.Url || row.domain || row.Domain || row.site || "-").trim();
      if (!title || title.toLowerCase() === "null" || title.toLowerCase() === "undefined") return;

      const imp = Number(row.Impressions || row.impressions || row.rawImp || 0);
      const cks = Number(row.Clicks || row.clicks || row.rawClicks || 0);
      const rowDate = row.Date || row.date || "";

      const datePriceCPM = getPriceForDate(campaignPricing?.cpm, rowDate);
      const datePriceCPC = getPriceForDate(campaignPricing?.cpc, rowDate);
      const hasRowCpc = datePriceCPC !== undefined && datePriceCPC !== null && !isNaN(Number(datePriceCPC));

      let rowSpent = 0;
      if (datePriceCPM > 0) {
        rowSpent = (imp / 1000) * datePriceCPM;
      } else if (hasRowCpc) {
        rowSpent = cks * Number(datePriceCPC);
      } else if (globalEffectiveMetrics?.eCPM > 0) {
        rowSpent = (imp / 1000) * globalEffectiveMetrics.eCPM;
      } else if (globalEffectiveMetrics?.eCPC !== undefined && !isNaN(Number(globalEffectiveMetrics?.eCPC))) {
        rowSpent = cks * Number(globalEffectiveMetrics.eCPC);
      } else {
        const rCPM = Number(row.CPM || row.cpm || 0);
        const rCPC = Number(row.CPC || row.cpc || 0);
        rowSpent = rCPM > 0 ? (imp / 1000) * rCPM : (cks * rCPC);
      }

      const vComplete = hasVideo ? Number(row.completeViewsVideo || row.CompleteViewsVideo || row.complete_views || row.completeViews || 0) : 0;
      const vFirstQ = hasVideo ? Number(row.firstQuartileViewsVideo || row.FirstQuartileViewsVideo || 0) : 0;
      const vMidpoint = hasVideo ? Number(row.midpointViewsVideo || row.MidpointViewsVideo || 0) : 0;
      const vThirdQ = hasVideo ? Number(row.thirdQuartileViewsVideo || row.ThirdQuartileViewsVideo || 0) : 0;
      const vViews = hasVideo ? Number(row.Views || row.views || row.VideoViews || vComplete || 0) : 0;

      if (!groups[title]) {
        groups[title] = {
          Title: title,
          url: title,
          Impressions: 0,
          Clicks: 0,
          Spent: 0,
          TotalConversions: 0,
          Installs: 0,
          rawViews: 0,
          rawComplete: 0,
          rawFirstQ: 0,
          rawMidpoint: 0,
          rawThirdQ: 0,
        };
      }

      groups[title].Impressions += imp;
      groups[title].Clicks += cks;
      groups[title].Spent += rowSpent;
      if (hasVideo) {
        groups[title].rawViews += vViews;
        groups[title].rawComplete += vComplete;
        groups[title].rawFirstQ += vFirstQ;
        groups[title].rawMidpoint += vMidpoint;
        groups[title].rawThirdQ += vThirdQ;
      }
    });

    const result = Object.values(groups);

    if (result.length === 0 && (totalAfClicks > 0 || targetConversions > 0 || targetInstalls > 0)) {
      result.push({
        Title: "Other",
        url: "Other",
        Impressions: 0,
        Clicks: totalAfClicks,
        Spent: 0,
        TotalConversions: targetConversions,
        Installs: targetInstalls,
        rawViews: 0,
        rawComplete: 0,
        rawFirstQ: 0,
        rawMidpoint: 0,
        rawThirdQ: 0,
      });
    }

    // Scale impressions if targetImpressions is defined and differs
    const totalImpressions = result.reduce((sum, g) => sum + g.Impressions, 0);
    if (targetImpressions > 0 && totalImpressions > 0 && targetImpressions !== totalImpressions) {
      let allocatedImp = 0;
      result.forEach((g, idx) => {
        if (idx === result.length - 1) {
          g.Impressions = Math.max(0, targetImpressions - allocatedImp);
        } else {
          const ratio = g.Impressions / totalImpressions;
          const scaled = Math.round(targetImpressions * ratio);
          g.Impressions = scaled;
          allocatedImp += scaled;
        }
      });
    }

    // Distribute AppsFlyer clicks if appsflyerDataLength > 0
    if (appsflyerDataLength > 0 && totalAfClicks > 0) {
      const totalBaseClicks = result.reduce((sum, g) => sum + g.Clicks, 0);

      if (totalBaseClicks > 0) {
        let summedClicks = 0;
        result.forEach(g => {
          const clickPct = g.Clicks / totalBaseClicks;
          const clicksToAdd = totalAfClicks * clickPct;
          g.Clicks = Math.round(g.Clicks + clicksToAdd);
          summedClicks += g.Clicks;
        });

        if (result.length > 0) {
          const targetClicksCount = totalBaseClicks + totalAfClicks;
          const diffClicks = targetClicksCount - summedClicks;
          if (diffClicks !== 0) {
            const largest = result.reduce((prev, current) => (prev.Clicks > current.Clicks) ? prev : current);
            largest.Clicks += diffClicks;
          }
        }
      } else if (totalBaseClicks === 0) {
        if (result.length > 0) {
          const totalImpForClicks = result.reduce((s, g) => s + g.Impressions, 0);
          const clickWeights = totalImpForClicks > 0 ? result.map(g => g.Impressions) : result.map(() => 1);
          const afClicksAlloc = distributeInteger(totalAfClicks, clickWeights);
          result.forEach((g, idx) => {
            g.Clicks = afClicksAlloc[idx] || 0;
          });
        }
      }
    }

    // Reconcile clicks to targetClicks if available
    const totalClicksSum = result.reduce((sum, g) => sum + g.Clicks, 0);
    if (targetClicks > 0 && totalClicksSum > 0 && Math.abs(targetClicks - totalClicksSum) > 0) {
      let allocatedClicks = 0;
      result.forEach((g, idx) => {
        if (idx === result.length - 1) {
          g.Clicks = Math.max(0, targetClicks - allocatedClicks);
        } else {
          const ratio = g.Clicks / totalClicksSum;
          const scaled = Math.round(targetClicks * ratio);
          g.Clicks = scaled;
          allocatedClicks += scaled;
        }
      });
    } else if (targetClicks > 0 && totalClicksSum === 0) {
      const clickWeights = getDistributionWeights(result, () => 0, g => g.Impressions);
      const allocatedClicks = distributeInteger(targetClicks, clickWeights);
      result.forEach((g, idx) => {
        g.Clicks = allocatedClicks[idx] || 0;
      });
    }

    // Reconcile spend to targetSpend if available
    const currentSpentSum = result.reduce((sum, g) => sum + g.Spent, 0);
    if (targetSpend > 0 && currentSpentSum > 0 && Math.abs(targetSpend - currentSpentSum) > 0.05) {
      let allocatedSpend = 0;
      result.forEach((g, idx) => {
        if (idx === result.length - 1) {
          g.Spent = Math.max(0, parseFloat((targetSpend - allocatedSpend).toFixed(2)));
        } else {
          const ratio = g.Spent / currentSpentSum;
          const scaled = parseFloat((targetSpend * ratio).toFixed(2));
          g.Spent = scaled;
          allocatedSpend += scaled;
        }
      });
    } else if (targetSpend > 0 && currentSpentSum === 0) {
      let allocatedSpend = 0;
      const totalWeight = result.reduce((s, g) => s + (isCpcCampaign && !isCpmCampaign ? g.Clicks : g.Impressions), 0);
      result.forEach((g, idx) => {
        if (idx === result.length - 1) {
          g.Spent = Math.max(0, parseFloat((targetSpend - allocatedSpend).toFixed(2)));
        } else {
          const weight = isCpcCampaign && !isCpmCampaign ? g.Clicks : g.Impressions;
          const ratio = totalWeight > 0 ? weight / totalWeight : 1 / result.length;
          const scaled = parseFloat((targetSpend * ratio).toFixed(2));
          g.Spent = scaled;
          allocatedSpend += scaled;
        }
      });
    }

    result.sort((a, b) => b.Impressions - a.Impressions);

    // Distribute Installs and Conversions: clicks if present (and not CTV), otherwise impressions
    const isCtv = isCtvWithAF || ctype.includes("CTV");
    const useClicks = !isCtv && result.some(g => Number(g.Clicks || 0) > 0);
    const weights = useClicks
      ? getDistributionWeights(result, g => g.Clicks, g => g.Impressions)
      : getDistributionWeights(result, () => 0, g => g.Impressions);
    const instAllocated = distributeInteger(targetInstalls, weights);
    const convAllocated = distributeValues(targetConversions, weights);

    result.forEach((g, idx) => {
      g.Installs = instAllocated[idx] || 0;
      g.TotalConversions = convAllocated[idx] || 0;
    });

    // Reconcile video metrics across URLs if hasVideo is true
    if (hasVideo && result.length > 0) {
      const impWeights = result.map(g => Math.max(0, Number(g.Impressions || 0)));

      if (effectiveTargetViews > 0) {
        const sumRawViews = result.reduce((s, g) => s + (g.rawViews || 0), 0);
        const weights = sumRawViews > 0 ? result.map(g => Math.max(0, Number(g.rawViews || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetViews, weights);
        result.forEach((g, idx) => { g.rawViews = alloc[idx] || 0; });
      }

      if (effectiveTargetFirstQ > 0) {
        const sumRawFirstQ = result.reduce((s, g) => s + (g.rawFirstQ || 0), 0);
        const weights = sumRawFirstQ > 0 ? result.map(g => Math.max(0, Number(g.rawFirstQ || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetFirstQ, weights);
        result.forEach((g, idx) => { g.rawFirstQ = alloc[idx] || 0; });
      }

      if (effectiveTargetMidpoint > 0) {
        const sumRawMidpoint = result.reduce((s, g) => s + (g.rawMidpoint || 0), 0);
        const weights = sumRawMidpoint > 0 ? result.map(g => Math.max(0, Number(g.rawMidpoint || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetMidpoint, weights);
        result.forEach((g, idx) => { g.rawMidpoint = alloc[idx] || 0; });
      }

      if (effectiveTargetThirdQ > 0) {
        const sumRawThirdQ = result.reduce((s, g) => s + (g.rawThirdQ || 0), 0);
        const weights = sumRawThirdQ > 0 ? result.map(g => Math.max(0, Number(g.rawThirdQ || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetThirdQ, weights);
        result.forEach((g, idx) => { g.rawThirdQ = alloc[idx] || 0; });
      }

      if (effectiveTargetComplete > 0) {
        const sumRawComplete = result.reduce((s, g) => s + (g.rawComplete || 0), 0);
        const weights = sumRawComplete > 0 ? result.map(g => Math.max(0, Number(g.rawComplete || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetComplete, weights);
        result.forEach((g, idx) => { g.rawComplete = alloc[idx] || 0; });
      }
    }

    return result.map(g => {
      const imp = g.Impressions;
      const clk = g.Clicks;
      const spent = g.Spent;
      const ctrVal = imp > 0 ? (clk / imp) * 100 : 0;
      const cpmVal = isCpmCampaign && imp > 0 ? (spent / imp) * 1000 : (effectiveCpm || 0);
      const cpcVal = (isCpcCampaign && !isCpmCampaign && clk > 0) ? (spent / clk) : 0;

      const vViews = hasVideo ? (g.rawViews || 0) : 0;
      const vComplete = hasVideo ? (g.rawComplete || 0) : 0;
      const vFirstQ = hasVideo ? (g.rawFirstQ || 0) : 0;
      const vMidpoint = hasVideo ? (g.rawMidpoint || 0) : 0;
      const vThirdQ = hasVideo ? (g.rawThirdQ || 0) : 0;

      const cpvVal = vViews > 0 ? spent / vViews : 0;
      const cpcvVal = vComplete > 0 ? spent / vComplete : 0;

      return {
        url: g.url,
        rawImp: imp,
        rawClicks: clk,
        rawSpent: spent,
        impressions: imp.toLocaleString('en-IN'),
        clicks: clk.toLocaleString('en-IN'),
        ctr: ctrVal.toFixed(2) + "%",
        cpmVal,
        cpm: "₹" + cpmVal.toFixed(2),
        cpcVal,
        cpc: "₹" + cpcVal.toFixed(2),
        spentFormatted: "₹" + spent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        rawViews: vViews,
        rawComplete: vComplete,
        rawFirstQ: vFirstQ,
        rawMidpoint: vMidpoint,
        rawThirdQ: vThirdQ,
        cpvVal,
        cpcvVal,
        installs: g.Installs,
        conversions: g.TotalConversions,
        installsFormatted: Math.round(g.Installs).toLocaleString('en-IN'),
        conversionsFormatted: Math.round(g.TotalConversions).toLocaleString('en-IN'),
      };
    });
  }, [propData, campaignPricing, globalEffectiveMetrics, selectedAudience, appsflyerData, effectiveCpm, hasAF, hasVideo, totalAfClicks, targetInstalls, targetConversions, targetImpressions, targetClicks, targetSpend, appsflyerDataLength, isCpmCampaign, isCpcCampaign, isCpcDefined, effectiveTargetViews, effectiveTargetComplete, effectiveTargetFirstQ, effectiveTargetMidpoint, effectiveTargetThirdQ]);

  const totals = useMemo(() => {
    const totalImpr = targetImpressions > 0 ? targetImpressions : list.reduce((a, r) => a + r.rawImp, 0);
    const totalClicks = targetClicks > 0 ? targetClicks : list.reduce((a, r) => a + r.rawClicks, 0);
    const totalSpent = targetSpend > 0 ? targetSpend : list.reduce((a, r) => a + r.rawSpent, 0);
    const avgCtr = totalImpr > 0 ? (totalClicks / totalImpr * 100).toFixed(2) + "%" : "0.00%";
    const avgCpm = isCpmCampaign && totalImpr > 0 ? "₹" + ((totalSpent / totalImpr) * 1000).toFixed(2) : (hasAF ? "₹" + effectiveCpm.toFixed(2) : "₹0.00");
    const avgCpc = (isCpcCampaign && !isCpmCampaign && totalClicks > 0) ? "₹" + (totalSpent / totalClicks).toFixed(2) : "₹0.00";

    const totalViews = (hasVideo && effectiveTargetViews > 0) ? effectiveTargetViews : list.reduce((a, r) => a + r.rawViews, 0);
    const totalComplete = (hasVideo && effectiveTargetComplete > 0) ? effectiveTargetComplete : list.reduce((a, r) => a + r.rawComplete, 0);
    const totalFirstQ = (hasVideo && effectiveTargetFirstQ > 0) ? effectiveTargetFirstQ : list.reduce((a, r) => a + r.rawFirstQ, 0);
    const totalMidpoint = (hasVideo && effectiveTargetMidpoint > 0) ? effectiveTargetMidpoint : list.reduce((a, r) => a + r.rawMidpoint, 0);
    const totalThirdQ = (hasVideo && effectiveTargetThirdQ > 0) ? effectiveTargetThirdQ : list.reduce((a, r) => a + r.rawThirdQ, 0);

    return {
      totalImpr: totalImpr.toLocaleString('en-IN'),
      totalClicks: totalClicks.toLocaleString('en-IN'),
      avgCtr,
      avgCpm,
      avgCpc,
      totalSpentFormatted: "₹" + totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalViews: totalViews.toLocaleString('en-IN'),
      totalComplete: totalComplete.toLocaleString('en-IN'),
      totalFirstQ: totalFirstQ.toLocaleString('en-IN'),
      totalMidpoint: totalMidpoint.toLocaleString('en-IN'),
      totalThirdQ: totalThirdQ.toLocaleString('en-IN'),
      avgCpv: "₹" + (totalViews > 0 ? totalSpent / totalViews : 0).toFixed(2),
      avgCpcv: "₹" + (totalComplete > 0 ? totalSpent / totalComplete : 0).toFixed(2),
      totalInstalls: targetInstalls.toLocaleString('en-IN'),
      totalConversions: targetConversions.toLocaleString('en-IN'),
    };
  }, [list, isCpmCampaign, isCpcCampaign, targetImpressions, targetClicks, targetSpend, targetInstalls, targetConversions, effectiveCpm, hasAF, hasVideo, effectiveTargetViews, effectiveTargetComplete, effectiveTargetFirstQ, effectiveTargetMidpoint, effectiveTargetThirdQ]);

  const totalPages = Math.ceil(list.length / PAGE_SIZE) || 1;
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const currentRows = list.slice(startIndex, startIndex + PAGE_SIZE);

  const from = list.length === 0 ? 0 : startIndex + 1;
  const to = Math.min(startIndex + PAGE_SIZE, list.length);

  return (
    <div className="st-panel" style={{ paddingBottom: 0, overflow: "hidden" }}>
      <div className="st-panel-header">
        <div>
          <div className="st-panel-title">URL / App Domain Performance</div>
          <div className="st-panel-sub">Showing <b>{from}</b> to <b>{to}</b> of <b>{list.length}</b> entries</div>
        </div>
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={() => setCurrentPage(p => Math.max(1, p - 1))}
          onNext={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        />
      </div>
      <div style={{ overflowX: "auto", width: "calc(100% + 44px)", margin: "0 -22px" }}>
        <table className="st-table" style={{ width: "100%", minWidth: "100%", tableLayout: "auto" }}>
          <thead>
            <tr>
              <th style={{ paddingLeft: "22px" }}>URL / APP DOMAIN</th>
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
              <th style={{ paddingRight: "22px" }}>TOTAL CONVERSIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              <>
                {currentRows.map((r, i) => (
                  <tr key={i} className="st-tr">
                    <td style={{ fontWeight: 600, color: "#2563EB", paddingLeft: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {r.url}
                    </td>
                    <td>{r.impressions}</td>
                    {!isCtvWithAF && <td>{r.clicks}</td>}
                    {!isCtvWithAF && <td>{r.ctr}</td>}
                    {!isCtvWithAF && <td>{r.cpm}</td>}
                    {!isCtvWithAF && <td>{r.cpc}</td>}
                    {!isCtvWithAF && <td>{r.spentFormatted}</td>}
                    {hasVideo && <td>{r.rawViews.toLocaleString()}</td>}
                    {hasVideo && !isCtvWithAF && <td>₹{r.cpvVal.toFixed(2)}</td>}
                    {hasVideo && <td>{r.rawFirstQ.toLocaleString()}</td>}
                    {hasVideo && <td>{r.rawMidpoint.toLocaleString()}</td>}
                    {hasVideo && <td>{r.rawThirdQ.toLocaleString()}</td>}
                    {hasVideo && <td>{r.rawComplete.toLocaleString()}</td>}
                    {hasVideo && !isCtvWithAF && <td>₹{r.cpcvVal.toFixed(2)}</td>}
                    {hasAF && <td>{r.installsFormatted}</td>}
                    <td style={{ paddingRight: "22px" }}>{r.conversionsFormatted}</td>
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
                  <td style={{ paddingRight: "22px" }}>{totals.totalConversions}</td>
                </tr>
              </>
            ) : (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", padding: "24px", color: "#6B7280" }}>
                  No URL / Domain data available for this range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

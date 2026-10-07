"use client";
import React, { useState, useMemo } from "react";
import { TablePagination, distributeInteger, distributeValues, getDistributionWeights } from "./Shared";

const PAGE_SIZE = 10;

const operatorNameMap = {
  "airtel": "Airtel",
  "jio": "Jio",
  "reliance jio": "Jio",
  "vodafone": "Vi / Vodafone",
  "vi": "Vi / Vodafone",
  "vodafone idea": "Vi / Vodafone",
  "bsnl": "BSNL",
  "cellone": "BSNL",
  "wifi": "Wi-Fi / Broadband",
  "wi-fi": "Wi-Fi / Broadband"
};

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

function BrowserTable({ 
  data, 
  titleLabel, 
  subLabel, 
  entityKey, 
  defaultData, 
  hasVideo, 
  effectiveCpm = 320, 
  campaignPricing,
  globalEffectiveMetrics, 
  selectedAudience, 
  rawInstallsBreakdown,
  campaignPermissions = []
}) {
  const [page, setPage] = useState(1);
  const rawList = Array.isArray(data) && data.length > 0 ? data : (defaultData || []);

  const hasAF = !!globalEffectiveMetrics?.hasAppsflyerData;
  const totalInstalls = Number(globalEffectiveMetrics?.installs || 0);
  const totalConversions = Number(globalEffectiveMetrics?.conversions || 0);
  const targetImpressions = Number(globalEffectiveMetrics?.impressions || 0);
  const targetClicks = Number(globalEffectiveMetrics?.clicks || 0);
  const targetSpend = Number(globalEffectiveMetrics?.spend || 0);

  const targetVideoViews = Math.round(Number(globalEffectiveMetrics?.totalViews || globalEffectiveMetrics?.totalVideoViews || 0));
  const targetVideoComplete = Math.round(Number(globalEffectiveMetrics?.totalVideoComplete || 0));
  const effectiveTargetViews = targetVideoViews > 0 ? targetVideoViews : (targetImpressions > 0 ? Math.round(targetImpressions * 0.98836) : 0);
  const effectiveTargetComplete = targetVideoComplete > 0 ? targetVideoComplete : (targetImpressions > 0 ? Math.round(targetImpressions * 0.8846) : 0);

  const ctype = String(selectedAudience?.campaignType || selectedAudience?.campaign_type || "").toUpperCase();
  const isCtvWithAF = ctype.includes("CTV") && hasAF;

  const list = useMemo(() => {
    let resultItems = [];
    const groups = {};

    if (Array.isArray(rawList) && rawList.length > 0) {
      rawList.forEach(row => {
        const title = (entityKey === "browser"
          ? (row.browser || row.Browser || row.browser_name || row.name || "-")
          : (row.operator || row.Operator || row.name || row.browser || row.oses || row.os || row.OS || row.browser_name || row.os_name || "-")
        ).trim();

        const titleLower = title.toLowerCase();
        if (!title || titleLower === "unknown" || titleLower === "other" || titleLower === "none" || titleLower === "null" || titleLower === "undefined" || title === "-") return;

        const imp = Number(row.rawImp !== undefined ? row.rawImp : (row.Impressions !== undefined ? row.Impressions : (row.impressions !== undefined ? row.impressions : 0)));
        const cks = Number(row.rawClicks !== undefined ? row.rawClicks : (row.Clicks !== undefined ? row.Clicks : (row.clicks !== undefined ? row.clicks : 0)));
        const rowDate = row.Date || row.date || "";

        const videoComplete = Number(row.completeViewsVideo || row.CompleteViewsVideo || row["Complete Views"] || 0);
        const videoFirstQ = Number(row.firstQuartileViewsVideo || row.FirstQuartileViewsVideo || row["First Quartile Views"] || 0);
        const videoMidpoint = Number(row.midpointViewsVideo || row.MidpointViewsVideo || row["Midpoint Views"] || 0);
        const videoThirdQ = Number(row.thirdQuartileViewsVideo || row.ThirdQuartileViewsVideo || row["Third Quartile Views"] || 0);
        const videoViews = Number(row.Views || row.views || row.VideoViews || 0);

        const datePriceCPM = getPriceForDate(campaignPricing?.cpm, rowDate);
        const datePriceCPC = getPriceForDate(campaignPricing?.cpc, rowDate);

        const hasRowCpm = datePriceCPM !== undefined && datePriceCPM !== null && !isNaN(Number(datePriceCPM));
        const hasRowCpc = datePriceCPC !== undefined && datePriceCPC !== null && !isNaN(Number(datePriceCPC));

        let rowSpent = 0;
        if (hasRowCpm && Number(datePriceCPM) > 0) {
          rowSpent = (imp / 1000) * Number(datePriceCPM);
        } else if (hasRowCpc) {
          rowSpent = cks * Number(datePriceCPC);
        } else if (hasRowCpm) {
          rowSpent = 0;
        } else if (globalEffectiveMetrics?.eCPM > 0) {
          rowSpent = (imp / 1000) * globalEffectiveMetrics.eCPM;
        } else if (globalEffectiveMetrics?.eCPC > 0) {
          rowSpent = cks * globalEffectiveMetrics.eCPC;
        } else {
          const rCPM = Number(row.CPM || row.cpm || 0);
          const rCPC = Number(row.CPC || row.cpc || 0);
          rowSpent = rCPM > 0 ? (imp / 1000) * rCPM : (cks * rCPC);
        }

        if (!groups[title]) {
          groups[title] = {
            name: title,
            [entityKey]: title,
            rawImp: 0,
            rawClicks: 0,
            rawSpent: 0,
            videoComplete: 0,
            videoFirstQ: 0,
            videoMidpoint: 0,
            videoThirdQ: 0,
            videoViews: 0,
            installs: 0,
            conversions: 0,
          };
        }

        groups[title].rawImp += imp;
        groups[title].rawClicks += cks;
        groups[title].rawSpent += rowSpent;
        groups[title].videoComplete += videoComplete;
        groups[title].videoFirstQ += videoFirstQ;
        groups[title].videoMidpoint += videoMidpoint;
        groups[title].videoThirdQ += videoThirdQ;
        groups[title].videoViews += videoViews;
      });

      resultItems = Object.values(groups);
    }

    // Fallback: if rawList was empty and entityKey is operator, use rawInstallsBreakdown.operator if present
    if (resultItems.length === 0 && entityKey === "operator" && rawInstallsBreakdown?.operator && Object.keys(rawInstallsBreakdown.operator).length > 0) {
      Object.entries(rawInstallsBreakdown.operator).forEach(([opKey, count]) => {
        const keyLower = opKey.toLowerCase().trim();
        if (keyLower === "unknown" || keyLower === "other" || keyLower === "none" || keyLower === "" || keyLower === "null" || keyLower === "undefined") return;
        const name = operatorNameMap[keyLower] || (opKey.charAt(0).toUpperCase() + opKey.slice(1));
        const instVal = Number(count || 0);
        if (!groups[name]) {
          groups[name] = {
            name,
            operator: name,
            rawImp: 0,
            rawClicks: 0,
            rawSpent: 0,
            videoComplete: 0,
            videoFirstQ: 0,
            videoMidpoint: 0,
            videoThirdQ: 0,
            videoViews: 0,
            installs: instVal,
            conversions: 0,
          };
        } else {
          groups[name].installs += instVal;
        }
      });
      resultItems = Object.values(groups);
    }

    if (resultItems.length === 0) return [];

    // Reconcile Impressions to targetImpressions
    const sumImp = resultItems.reduce((a, r) => a + r.rawImp, 0);
    if (targetImpressions > 0 && sumImp > 0 && Math.abs(targetImpressions - sumImp) > 0) {
      let allocatedImp = 0;
      resultItems.forEach((g, idx) => {
        if (idx === resultItems.length - 1) {
          g.rawImp = Math.max(0, targetImpressions - allocatedImp);
        } else {
          const ratio = g.rawImp / sumImp;
          const scaled = Math.round(targetImpressions * ratio);
          g.rawImp = scaled;
          allocatedImp += scaled;
        }
      });
    } else if (targetImpressions > 0 && sumImp === 0) {
      const share = Math.round(targetImpressions / resultItems.length);
      resultItems.forEach((g, idx) => {
        g.rawImp = idx === resultItems.length - 1 ? (targetImpressions - share * (resultItems.length - 1)) : share;
      });
    }

    // Reconcile Clicks to targetClicks
    const sumClicks = resultItems.reduce((a, r) => a + r.rawClicks, 0);
    if (targetClicks > 0 && sumClicks > 0 && Math.abs(targetClicks - sumClicks) > 0) {
      let allocatedClicks = 0;
      resultItems.forEach((g, idx) => {
        if (idx === resultItems.length - 1) {
          g.rawClicks = Math.max(0, targetClicks - allocatedClicks);
        } else {
          const ratio = g.rawClicks / sumClicks;
          const scaled = Math.round(targetClicks * ratio);
          g.rawClicks = scaled;
          allocatedClicks += scaled;
        }
      });
    } else if (targetClicks > 0 && sumClicks === 0) {
      const weights = getDistributionWeights(resultItems, () => 0, g => g.rawImp);
      const allocatedClicks = distributeInteger(targetClicks, weights);
      resultItems.forEach((g, idx) => {
        g.rawClicks = allocatedClicks[idx] || 0;
      });
    }

    // Reconcile Spend to targetSpend
    const sumSpent = resultItems.reduce((a, r) => a + (r.rawSpent || 0), 0);
    if (targetSpend > 0 && sumSpent > 0 && Math.abs(targetSpend - sumSpent) > 0.05) {
      let allocatedSpend = 0;
      resultItems.forEach((g, idx) => {
        if (idx === resultItems.length - 1) {
          g.rawSpent = Math.max(0, parseFloat((targetSpend - allocatedSpend).toFixed(2)));
        } else {
          const ratio = (g.rawSpent || 0) / sumSpent;
          const scaled = parseFloat((targetSpend * ratio).toFixed(2));
          g.rawSpent = scaled;
          allocatedSpend += scaled;
        }
      });
    } else if (targetSpend > 0 && sumSpent === 0) {
      let allocatedSpend = 0;
      const totalWeight = resultItems.reduce((s, g) => s + g.rawImp, 0);
      resultItems.forEach((g, idx) => {
        if (idx === resultItems.length - 1) {
          g.rawSpent = Math.max(0, parseFloat((targetSpend - allocatedSpend).toFixed(2)));
        } else {
          const ratio = totalWeight > 0 ? g.rawImp / totalWeight : 1 / resultItems.length;
          const scaled = parseFloat((targetSpend * ratio).toFixed(2));
          g.rawSpent = scaled;
          allocatedSpend += scaled;
        }
      });
    }

    resultItems.sort((a, b) => b.rawImp - a.rawImp);

    // Reconcile video metrics across items
    if (hasVideo && resultItems.length > 0) {
      const impWeights = resultItems.map(g => Math.max(0, Number(g.rawImp || 0)));

      if (effectiveTargetViews > 0) {
        const sumRaw = resultItems.reduce((s, g) => s + (g.videoViews || 0), 0);
        const w = sumRaw > 0 ? resultItems.map(g => Math.max(0, Number(g.videoViews || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetViews, w);
        resultItems.forEach((g, idx) => { g.videoViews = alloc[idx] || 0; });
      }

      if (effectiveTargetComplete > 0) {
        const sumRaw = resultItems.reduce((s, g) => s + (g.videoComplete || 0), 0);
        const w = sumRaw > 0 ? resultItems.map(g => Math.max(0, Number(g.videoComplete || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetComplete, w);
        resultItems.forEach((g, idx) => { g.videoComplete = alloc[idx] || 0; });
      }
    }

    // Distribute Installs & Conversions across operators/browsers
    if (hasAF || totalInstalls > 0 || totalConversions > 0) {
      const isCtv = isCtvWithAF || ctype.includes("CTV");
      const totalClicksCount = resultItems.reduce((s, r) => s + Math.max(0, Number(r.rawClicks || 0)), 0);
      const totalImpsCount = resultItems.reduce((s, r) => s + Math.max(0, Number(r.rawImp || 0)), 0);
      const itemsWithClicks = resultItems.filter(r => Number(r.rawClicks || 0) > 0).length;
      const itemsWithImps = resultItems.filter(r => Number(r.rawImp || 0) > 0).length;

      const clickWeightIsVeryLess = isCtv
        || totalClicksCount < 10
        || (resultItems.length > 1 && itemsWithClicks <= 1 && itemsWithImps > 1)
        || (totalImpsCount > 0 && (totalClicksCount / totalImpsCount) < 0.0005)
        || (itemsWithImps > 3 && itemsWithClicks / itemsWithImps < 0.2);

      const useClicks = !clickWeightIsVeryLess && totalClicksCount > 0;
      const weights = useClicks
        ? resultItems.map(r => Math.max(0, Number(r.rawClicks || 0)))
        : (totalImpsCount > 0 ? resultItems.map(r => Math.max(0, Number(r.rawImp || 0))) : resultItems.map(() => 1));

      const instAllocated = distributeInteger(totalInstalls, weights);
      const convAllocated = distributeValues(totalConversions, weights);

      resultItems.forEach((g, idx) => {
        g.installs = instAllocated[idx] || 0;
        g.conversions = convAllocated[idx] || 0;
      });
    }

    const anyCpmRate = getPriceForDate(campaignPricing?.cpm, null);
    const anyCpcRate = getPriceForDate(campaignPricing?.cpc, null);
    const isCpcDefined = anyCpcRate !== undefined && anyCpcRate !== null && !isNaN(Number(anyCpcRate));
    const isCpmCampaign = (anyCpmRate !== undefined && Number(anyCpmRate) > 0) || !!globalEffectiveMetrics?.isCpmCampaign;
    const isCpcCampaign = isCpcDefined || !!globalEffectiveMetrics?.isCpcCampaign;

    return resultItems.map(g => {
      const imp = g.rawImp;
      const clk = g.rawClicks;
      const spent = (targetSpend > 0 && g.rawSpent > 0) ? g.rawSpent : (hasAF ? (imp / 1000) * effectiveCpm : (g.rawSpent || 0));
      const ctrVal = imp > 0 ? (clk / imp * 100).toFixed(2) + "%" : "0.00%";
      const cpmVal = isCpmCampaign ? (imp > 0 ? (spent / imp) * 1000 : 0) : (hasAF ? effectiveCpm : 0);
      const cpcVal = isCpcDefined
        ? (Number(anyCpcRate) === 0 ? 0 : (clk > 0 ? spent / clk : Number(anyCpcRate)))
        : (isCpcCampaign && clk > 0 ? spent / clk : 0);

      const vViews = hasVideo ? (g.videoViews || 0) : 0;
      const vComplete = hasVideo ? (g.videoComplete || 0) : 0;
      const cpvVal = vViews > 0 ? spent / vViews : 0;
      const cpcvVal = vComplete > 0 ? spent / vComplete : 0;

      return {
        ...g,
        impressions: imp.toLocaleString('en-IN'),
        clicks: clk.toLocaleString('en-IN'),
        ctr: ctrVal,
        cpmVal,
        cpm: "₹" + cpmVal.toFixed(2),
        cpcVal,
        cpc: "₹" + cpcVal.toFixed(2),
        spentFormatted: "₹" + spent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        viewsFormatted: vViews.toLocaleString('en-IN'),
        completeFormatted: vComplete.toLocaleString('en-IN'),
        cpvFormatted: "₹" + cpvVal.toFixed(2),
        cpcvFormatted: "₹" + cpcvVal.toFixed(2),
        installsFormatted: (g.installs || 0).toLocaleString('en-IN'),
        conversionsFormatted: (g.conversions || 0).toLocaleString('en-IN'),
      };
    });
  }, [rawList, totalInstalls, totalConversions, targetImpressions, targetClicks, targetSpend, entityKey, hasAF, rawInstallsBreakdown, campaignPricing, globalEffectiveMetrics, effectiveCpm, hasVideo, effectiveTargetViews, effectiveTargetComplete, isCtvWithAF, ctype]);

  const totalPages = Math.ceil(list.length / PAGE_SIZE) || 1;
  const from = list.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, list.length);
  const rows = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = useMemo(() => {
    const totalImpr = targetImpressions > 0 ? targetImpressions : list.reduce((a, r) => a + r.rawImp, 0);
    const totalClicks = targetClicks > 0 ? targetClicks : list.reduce((a, r) => a + r.rawClicks, 0);
    const avgCtr = totalImpr > 0 ? (totalClicks / totalImpr * 100).toFixed(2) + "%" : "0.00%";
    const totalViews = (hasVideo && effectiveTargetViews > 0) ? effectiveTargetViews : list.reduce((a, r) => a + (r.videoViews || 0), 0);
    const totalComplete = (hasVideo && effectiveTargetComplete > 0) ? effectiveTargetComplete : list.reduce((a, r) => a + (r.videoComplete || 0), 0);

    const anyCpmRate = getPriceForDate(campaignPricing?.cpm, null);
    const anyCpcRate = getPriceForDate(campaignPricing?.cpc, null);
    const isCpcDefined = anyCpcRate !== undefined && anyCpcRate !== null && !isNaN(Number(anyCpcRate));
    const isCpmCampaign = (anyCpmRate !== undefined && Number(anyCpmRate) > 0) || !!globalEffectiveMetrics?.isCpmCampaign;
    const isCpcCampaign = isCpcDefined || !!globalEffectiveMetrics?.isCpcCampaign;

    const totalSpent = targetSpend > 0 ? targetSpend : (hasAF 
      ? (totalImpr / 1000) * effectiveCpm 
      : list.reduce((sum, r) => sum + (r.rawSpent || 0), 0));
    const avgCpm = isCpmCampaign && totalImpr > 0 ? "₹" + ((totalSpent / totalImpr) * 1000).toFixed(2) : (hasAF ? "₹" + effectiveCpm.toFixed(2) : "₹0.00");
    const avgCpc = isCpcDefined
      ? (Number(anyCpcRate) === 0 ? "₹0.00" : (totalClicks > 0 ? "₹" + (totalSpent / totalClicks).toFixed(2) : "₹" + Number(anyCpcRate).toFixed(2)))
      : (isCpcCampaign && totalClicks > 0 ? "₹" + (totalSpent / totalClicks).toFixed(2) : "₹0.00");

    return {
      totalImpr: totalImpr.toLocaleString('en-IN'),
      totalClicks: totalClicks.toLocaleString('en-IN'),
      avgCtr,
      avgCpm,
      avgCpc,
      totalSpentFormatted: "₹" + totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalViews: totalViews.toLocaleString('en-IN'),
      totalComplete: totalComplete.toLocaleString('en-IN'),
      avgCpv: "₹" + (totalViews > 0 ? totalSpent / totalViews : 0).toFixed(2),
      avgCpcv: "₹" + (totalComplete > 0 ? totalSpent / totalComplete : 0).toFixed(2),
      totalInstalls: totalInstalls.toLocaleString('en-IN'),
      totalConversions: totalConversions.toLocaleString('en-IN'),
    };
  }, [list, targetImpressions, targetClicks, targetSpend, effectiveCpm, totalInstalls, totalConversions, hasAF, campaignPricing, globalEffectiveMetrics, hasVideo, effectiveTargetViews, effectiveTargetComplete]);

  return (
    <div className="st-panel" style={{ paddingBottom: 0, overflow: "hidden" }}>
      <div className="st-panel-header">
        <div>
          <div className="st-panel-title">{titleLabel}</div>
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
              <th style={{ paddingLeft: "22px" }}>{entityKey.toUpperCase()}</th>
              {(!isCtvWithAF || entityKey === "browser") && <th>IMPRESSIONS</th>}
              {!isCtvWithAF && <th>CLICKS</th>}
              {!isCtvWithAF && <th>CTR</th>}
              {!hasAF && !isCtvWithAF && <th>CPM</th>}
              {!hasAF && !isCtvWithAF && <th>CPC</th>}
              {!hasAF && !isCtvWithAF && <th>SPEND</th>}
              {hasVideo && !isCtvWithAF && <th>VIEWS</th>}
              {hasVideo && !isCtvWithAF && <th>CPV</th>}
              {hasVideo && !isCtvWithAF && <th>COMPLETE VIEW</th>}
              {hasVideo && !isCtvWithAF && <th>CPCV</th>}
              {hasAF && <th>INSTALLS</th>}
              <th style={{ paddingRight: "22px" }}>TOTAL CONVERSIONS</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              <>
                {rows.map((r, i) => {
                  const imp = r.rawImp || 0;
                  const vViews = Math.round(imp * 0.98836);
                  const vComplete = Math.round(imp * 0.8846);
                  const spent = hasAF ? (imp / 1000) * effectiveCpm : (r.rawSpent || 0);
                  const cpvVal = vViews > 0 ? spent / vViews : 0;
                  const cpcvVal = vComplete > 0 ? spent / vComplete : 0;

                  return (
                    <tr key={i} className="st-tr">
                      <td style={{ fontWeight: 600, color: "#111827", paddingLeft: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r[entityKey] || r.name || "–"}
                      </td>
                      {(!isCtvWithAF || entityKey === "browser") && <td>{r.impressions}</td>}
                      {!isCtvWithAF && <td>{r.clicks}</td>}
                      {!isCtvWithAF && <td>{r.ctr}</td>}
                      {!hasAF && !isCtvWithAF && <td>{r.cpm}</td>}
                      {!hasAF && !isCtvWithAF && <td>{r.cpc}</td>}
                      {!hasAF && !isCtvWithAF && <td>{r.spentFormatted}</td>}
                      {hasVideo && !isCtvWithAF && <td>{r.viewsFormatted || vViews.toLocaleString('en-IN')}</td>}
                      {hasVideo && !isCtvWithAF && <td>{r.cpvFormatted || ("₹" + cpvVal.toFixed(2))}</td>}
                      {hasVideo && !isCtvWithAF && <td>{r.completeFormatted || vComplete.toLocaleString('en-IN')}</td>}
                      {hasVideo && !isCtvWithAF && <td>{r.cpcvFormatted || ("₹" + cpcvVal.toFixed(2))}</td>}
                      {hasAF && <td>{r.installsFormatted}</td>}
                      <td style={{ paddingRight: "22px" }}>{r.conversionsFormatted}</td>
                    </tr>
                  );
                })}
                <tr className="st-tr-total">
                  <td style={{ paddingLeft: "22px" }}>Total</td>
                  {(!isCtvWithAF || entityKey === "browser") && <td>{totals.totalImpr}</td>}
                  {!isCtvWithAF && <td>{totals.totalClicks}</td>}
                  {!isCtvWithAF && <td>{totals.avgCtr}</td>}
                  {!hasAF && !isCtvWithAF && <td>{totals.avgCpm}</td>}
                  {!hasAF && !isCtvWithAF && <td>{totals.avgCpc}</td>}
                  {!hasAF && !isCtvWithAF && <td>{totals.totalSpentFormatted}</td>}
                  {hasVideo && !isCtvWithAF && <td>{totals.totalViews}</td>}
                  {hasVideo && !isCtvWithAF && <td>{totals.avgCpv}</td>}
                  {hasVideo && !isCtvWithAF && <td>{totals.totalComplete}</td>}
                  {hasVideo && !isCtvWithAF && <td>{totals.avgCpcv}</td>}
                  {hasAF && <td>{totals.totalInstalls}</td>}
                  <td style={{ paddingRight: "22px" }}>{totals.totalConversions}</td>
                </tr>
              </>
            ) : (
              <tr><td colSpan={10} style={{ textAlign: "center", padding: 20, color: "#6B7280" }}>No data available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BrowsersOperatorsTables({ browserData: propBrowserData, operatorData: propOperatorData, campaignPricing, globalEffectiveMetrics, selectedAudience, rawInstallsBreakdown, campaignPermissions = [] }) {
  const hasAF = !!globalEffectiveMetrics?.hasAppsflyerData;
  const ctype = String(selectedAudience?.campaignType || selectedAudience?.campaign_type || "").toUpperCase();
  const isCtvWithAF = ctype.includes("CTV") && hasAF;

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

  const hasVideo = !!globalEffectiveMetrics?.hasVideoData;

  const perms = (campaignPermissions || []).map(p => String(p).toLowerCase().trim());
  const showBrowser = !isCtvWithAF && !perms.includes("browser_table");
  const showOperator = !perms.includes("operator_table");

  const bList = useMemo(() => {
    return Array.isArray(propBrowserData) && propBrowserData.length > 0
      ? propBrowserData.map(r => {
        const imp = Number(r.Impressions || r.impressions || 0);
        const clk = Number(r.Clicks || r.clicks || 0);
        const ctrRaw = Number(r.CTR || r.ctr || 0);
        const ctr = ctrRaw > 1 ? ctrRaw.toFixed(2) + "%" : (imp > 0 ? (clk / imp * 100).toFixed(2) + "%" : "0.00%");
        const browserName = r.Browser || r.browser || r.name || "Unknown";
        return {
          ...r,
          browser: browserName,
          name: browserName,
          rawImp: imp,
          rawClicks: clk,
          impressions: imp.toLocaleString('en-IN'),
          clicks: clk.toLocaleString('en-IN'),
          ctr,
        };
      })
      : [];
  }, [propBrowserData]);

  const oList = useMemo(() => {
    return Array.isArray(propOperatorData) && propOperatorData.length > 0
      ? propOperatorData.map(r => {
        const imp = Number(r.Impressions || r.impressions || 0);
        const clk = Number(r.Clicks || r.clicks || 0);
        const ctrRaw = Number(r.CTR || r.ctr || 0);
        const ctr = ctrRaw > 1 ? ctrRaw.toFixed(2) + "%" : (imp > 0 ? (clk / imp * 100).toFixed(2) + "%" : "0.00%");
        const operatorName = r.Operator || r.operator || r.name || "Unknown";
        return {
          ...r,
          operator: operatorName,
          name: operatorName,
          rawImp: imp,
          rawClicks: clk,
          impressions: imp.toLocaleString('en-IN'),
          clicks: clk.toLocaleString('en-IN'),
          ctr,
        };
      })
      : [];
  }, [propOperatorData]);

  if (!showBrowser && !showOperator) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {showBrowser && (
        <BrowserTable
          data={propBrowserData && propBrowserData.length > 0 ? propBrowserData : bList}
          titleLabel="Browser Share"
          subLabel="Top performing browsers"
          entityKey="browser"
          hasVideo={hasVideo}
          effectiveCpm={effectiveCpm}
          campaignPricing={campaignPricing}
          globalEffectiveMetrics={globalEffectiveMetrics}
          selectedAudience={selectedAudience}
          rawInstallsBreakdown={rawInstallsBreakdown}
          campaignPermissions={campaignPermissions}
        />
      )}
      {showOperator && (
        <BrowserTable
          data={propOperatorData && propOperatorData.length > 0 ? propOperatorData : oList}
          titleLabel="Operator Share"
          subLabel="Top performing mobile operators"
          entityKey="operator"
          hasVideo={hasVideo}
          effectiveCpm={effectiveCpm}
          campaignPricing={campaignPricing}
          globalEffectiveMetrics={globalEffectiveMetrics}
          selectedAudience={selectedAudience}
          rawInstallsBreakdown={rawInstallsBreakdown}
          campaignPermissions={campaignPermissions}
        />
      )}
    </div>
  );
}

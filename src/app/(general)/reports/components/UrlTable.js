"use client";
import React, { useState, useMemo } from "react";
import { TablePagination } from "./Shared";

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

    // Distribute Installs and Conversions: clicks if present, otherwise impressions
    let summedConv = 0;
    let summedInst = 0;
    const hasClicks = result.some(g => Number(g.Clicks || 0) > 0);
    const currentTotalBase = result.reduce((sum, g) => sum + (hasClicks ? Number(g.Clicks || 0) : Number(g.Impressions || 0)), 0);

    const isConvInteger = Number.isInteger(targetConversions);
    result.forEach((g, idx) => {
      const metricVal = hasClicks ? Number(g.Clicks || 0) : Number(g.Impressions || 0);
      const share = currentTotalBase > 0 ? metricVal / currentTotalBase : (result.length > 0 ? 1 / result.length : 0);
      if (idx === result.length - 1) {
        g.TotalConversions = isConvInteger ? Math.round(targetConversions - summedConv) : parseFloat((targetConversions - summedConv).toFixed(2));
        g.Installs = Math.round(targetInstalls - summedInst);
      } else {
        const cVal = isConvInteger ? Math.round(targetConversions * share) : parseFloat((targetConversions * share).toFixed(2));
        g.TotalConversions = cVal;
        g.Installs = Math.round(targetInstalls * share);
        summedConv += g.TotalConversions;
        summedInst += g.Installs;
      }
    });

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
          const targetClicks = totalBaseClicks + totalAfClicks;
          const diffClicks = targetClicks - summedClicks;
          if (diffClicks !== 0) {
            const largest = result.reduce((prev, current) => (prev.Clicks > current.Clicks) ? prev : current);
            largest.Clicks += diffClicks;
          }
        }
      } else if (totalBaseClicks === 0) {
        if (result.length > 0) {
          let summedClicks = 0;
          result.forEach((g, idx) => {
            let clicksToAdd = 0;
            if (idx === result.length - 1) {
              clicksToAdd = totalAfClicks - summedClicks;
            } else {
              clicksToAdd = Math.round(totalAfClicks / result.length);
              summedClicks += clicksToAdd;
            }
            g.Clicks = clicksToAdd;
          });
        }
      }
    }

    result.sort((a, b) => b.Impressions - a.Impressions);

    return result.map(g => {
      const imp = g.Impressions;
      const clk = g.Clicks;
      const spent = g.Spent;
      const ctrVal = imp > 0 ? (clk / imp) * 100 : 0;
      const cpmVal = isCpmCampaign ? (imp > 0 ? (spent / imp) * 1000 : 0) : 0;
      // Only compute a meaningful CPC when the campaign is actually CPC-priced (rate > 0).
      // For CPM campaigns where CPC rate is 0, show 0 to avoid spend/clicks nonsense.
      const cpcVal = (isCpcCampaign && !isCpmCampaign && clk > 0) ? (spent / clk) : 0;

      const vViews = hasVideo ? (g.rawViews > 0 ? g.rawViews : Math.round(imp * 0.98836)) : 0;
      const vComplete = hasVideo ? (g.rawComplete > 0 ? g.rawComplete : Math.round(imp * 0.8846)) : 0;
      const vFirstQ = hasVideo ? (g.rawFirstQ > 0 ? g.rawFirstQ : Math.round(imp * 0.9474)) : 0;
      const vMidpoint = hasVideo ? (g.rawMidpoint > 0 ? g.rawMidpoint : Math.round(imp * 0.9222)) : 0;
      const vThirdQ = hasVideo ? (g.rawThirdQ > 0 ? g.rawThirdQ : Math.round(imp * 0.8999)) : 0;

      const cpvVal = vViews > 0 ? spent / vViews : 0;
      const cpcvVal = vComplete > 0 ? spent / vComplete : 0;

      return {
        url: g.url,
        rawImp: imp,
        rawClicks: clk,
        rawSpent: spent,
        impressions: imp.toLocaleString(),
        clicks: clk.toLocaleString(),
        ctr: ctrVal.toFixed(2) + "%",
        cpmVal,
        cpm: "₹" + cpmVal.toFixed(2),
        cpcVal,
        cpc: "₹" + cpcVal.toFixed(2),
        spentFormatted: "₹" + spent.toFixed(2),
        rawViews: vViews,
        rawComplete: vComplete,
        rawFirstQ: vFirstQ,
        rawMidpoint: vMidpoint,
        rawThirdQ: vThirdQ,
        cpvVal,
        cpcvVal,
        installs: g.Installs,
        conversions: g.TotalConversions,
        installsFormatted: Math.round(g.Installs).toLocaleString(),
        conversionsFormatted: Math.round(g.TotalConversions).toLocaleString(),
      };
    });
  }, [propData, campaignPricing, globalEffectiveMetrics, selectedAudience, appsflyerData, effectiveCpm, hasAF, hasVideo, totalAfClicks, targetInstalls, targetConversions, targetImpressions, appsflyerDataLength, isCpmCampaign]);

  const totals = useMemo(() => {
    const totalImpr = list.reduce((a, r) => a + r.rawImp, 0);
    const totalClicks = list.reduce((a, r) => a + r.rawClicks, 0);
    const totalSpent = list.reduce((a, r) => a + r.rawSpent, 0);
    const avgCtr = totalImpr > 0 ? (totalClicks / totalImpr * 100).toFixed(2) + "%" : "0.00%";
    const avgCpm = isCpmCampaign && totalImpr > 0 ? "₹" + ((totalSpent / totalImpr) * 1000).toFixed(2) : "₹0.00";
    const avgCpc = (isCpcCampaign && !isCpmCampaign && totalClicks > 0) ? "₹" + (totalSpent / totalClicks).toFixed(2) : "₹0.00";

    const totalViews = list.reduce((a, r) => a + r.rawViews, 0);
    const totalComplete = list.reduce((a, r) => a + r.rawComplete, 0);
    const totalFirstQ = list.reduce((a, r) => a + r.rawFirstQ, 0);
    const totalMidpoint = list.reduce((a, r) => a + r.rawMidpoint, 0);
    const totalThirdQ = list.reduce((a, r) => a + r.rawThirdQ, 0);

    return {
      totalImpr: totalImpr.toLocaleString(),
      totalClicks: totalClicks.toLocaleString(),
      avgCtr,
      avgCpm,
      avgCpc,
      totalSpentFormatted: "₹" + totalSpent.toFixed(2),
      totalViews: totalViews.toLocaleString(),
      totalComplete: totalComplete.toLocaleString(),
      totalFirstQ: totalFirstQ.toLocaleString(),
      totalMidpoint: totalMidpoint.toLocaleString(),
      totalThirdQ: totalThirdQ.toLocaleString(),
      avgCpv: "₹" + (totalViews > 0 ? totalSpent / totalViews : 0).toFixed(2),
      avgCpcv: "₹" + (totalComplete > 0 ? totalSpent / totalComplete : 0).toFixed(2),
      totalInstalls: targetInstalls.toLocaleString(),
      totalConversions: targetConversions.toLocaleString(),
    };
  }, [list, isCpmCampaign, targetInstalls, targetConversions]);

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

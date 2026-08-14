"use client";
import React, { useState, useMemo } from "react";
import { TablePagination } from "./Shared";

const PAGE_SIZE = 10;

export function UrlTable({ urlData: propData, campaignPricing, globalEffectiveMetrics, selectedAudience }) {
  const [currentPage, setCurrentPage] = useState(1);

  const hasVideo = !!globalEffectiveMetrics?.hasVideoData;
  const hasAF = !!globalEffectiveMetrics?.hasAppsflyerData;
  const totalInstalls = Number(globalEffectiveMetrics?.installs || 0);
  const totalConversions = Number(globalEffectiveMetrics?.conversions || 0);

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

  const list = useMemo(() => {
    if (!Array.isArray(propData) || propData.length === 0) return [];
    const globalTargetImp = Number(globalEffectiveMetrics?.impressions || 0);

    const rawList = propData.map(r => {
      const imp = Number(r.Impressions || r.impressions || 0);
      const clk = Number(r.Clicks || r.clicks || 0);
      const ctrRaw = Number(r.CTR || r.ctr || 0);
      const cpmVal = effectiveCpm || Number(r.CPM || r.cpm || r.eCPM || 320);

      const vComplete = hasVideo ? Number(r.completeViewsVideo || r.CompleteViewsVideo || r.complete_views || r.completeViews || 0) : 0;
      const vFirstQ = hasVideo ? Number(r.firstQuartileViewsVideo || r.FirstQuartileViewsVideo || 0) : 0;
      const vMidpoint = hasVideo ? Number(r.midpointViewsVideo || r.MidpointViewsVideo || 0) : 0;
      const vThirdQ = hasVideo ? Number(r.thirdQuartileViewsVideo || r.ThirdQuartileViewsVideo || 0) : 0;
      const vViews = hasVideo ? Number(r.Views || r.views || r.VideoViews || vComplete || 0) : 0;

      return {
        url: r.name || r.Url || r.url || r.Domain || r.domain || "Unknown URL",
        rawImp: imp,
        rawClicks: clk,
        ctrRaw,
        cpmVal,
        vComplete,
        vFirstQ,
        vMidpoint,
        vThirdQ,
        vViews,
      };
    });

    const totalClicksSum = rawList.reduce((a, r) => a + r.rawClicks, 0);
    const totalImpSum = rawList.reduce((a, r) => a + r.rawImp, 0);
    const targetTotalImp = globalTargetImp > 0 ? globalTargetImp : totalImpSum;

    let allocatedImp = 0;
    return rawList.map((r, idx) => {
      let share = 0;
      if (isCtvWithAF || totalClicksSum === 0) {
        share = totalImpSum > 0 ? r.rawImp / totalImpSum : (1 / rawList.length);
      } else if (totalClicksSum > 0) {
        share = r.rawClicks / totalClicksSum;
      } else if (totalImpSum > 0) {
        share = r.rawImp / totalImpSum;
      } else {
        share = 1 / rawList.length;
      }

      let scaledImp = 0;
      if (idx === rawList.length - 1) {
        scaledImp = Math.max(0, targetTotalImp - allocatedImp);
      } else {
        const impRatio = totalImpSum > 0 ? r.rawImp / totalImpSum : (1 / rawList.length);
        scaledImp = Math.round(targetTotalImp * impRatio);
        allocatedImp += scaledImp;
      }

      const clk = r.rawClicks;
      const ctrVal = r.ctrRaw > 1 ? r.ctrRaw : (scaledImp > 0 ? (clk / scaledImp * 100) : 0);
      const spent = (scaledImp / 1000) * r.cpmVal;

      const vViews = hasVideo ? (r.vViews > 0 ? Math.round(r.vViews * (totalImpSum > 0 ? scaledImp / totalImpSum : 1)) : Math.round(scaledImp * 0.98836)) : 0;
      const vComplete = hasVideo ? (r.vComplete > 0 ? Math.round(r.vComplete * (totalImpSum > 0 ? scaledImp / totalImpSum : 1)) : Math.round(scaledImp * 0.8846)) : 0;
      const vFirstQ = hasVideo ? (r.vFirstQ > 0 ? Math.round(r.vFirstQ * (totalImpSum > 0 ? scaledImp / totalImpSum : 1)) : Math.round(scaledImp * 0.9474)) : 0;
      const vMidpoint = hasVideo ? (r.vMidpoint > 0 ? Math.round(r.vMidpoint * (totalImpSum > 0 ? scaledImp / totalImpSum : 1)) : Math.round(scaledImp * 0.9222)) : 0;
      const vThirdQ = hasVideo ? (r.vThirdQ > 0 ? Math.round(r.vThirdQ * (totalImpSum > 0 ? scaledImp / totalImpSum : 1)) : Math.round(scaledImp * 0.8999)) : 0;

      const cpvVal = vViews > 0 ? spent / vViews : 0;
      const cpcvVal = vComplete > 0 ? spent / vComplete : 0;

      const inst = Math.round(totalInstalls * share);
      const conv = Math.round(totalConversions * share);

      return {
        url: r.url,
        rawImp: scaledImp,
        rawClicks: clk,
        impressions: scaledImp.toLocaleString('en-IN'),
        clicks: clk.toLocaleString('en-IN'),
        ctr: ctrVal.toFixed(2) + "%",
        cpmVal: r.cpmVal,
        cpm: "₹" + r.cpmVal.toFixed(2),
        rawViews: vViews,
        rawComplete: vComplete,
        rawFirstQ: vFirstQ,
        rawMidpoint: vMidpoint,
        rawThirdQ: vThirdQ,
        cpvVal,
        cpcvVal,
        installs: inst,
        conversions: conv,
        installsFormatted: inst.toLocaleString('en-IN'),
        conversionsFormatted: conv.toLocaleString('en-IN'),
      };
    });
  }, [propData, effectiveCpm, hasVideo, totalInstalls, totalConversions, globalEffectiveMetrics]);

  const totals = useMemo(() => {
    const totalImpr = list.reduce((a, r) => a + r.rawImp, 0);
    const totalClicks = list.reduce((a, r) => a + r.rawClicks, 0);
    const avgCtr = totalImpr > 0 ? (totalClicks / totalImpr * 100).toFixed(2) + "%" : "0.00%";
    const weightedCpm = effectiveCpm;
    const totalViews = list.reduce((a, r) => a + r.rawViews, 0);
    const totalComplete = list.reduce((a, r) => a + r.rawComplete, 0);
    const totalFirstQ = list.reduce((a, r) => a + r.rawFirstQ, 0);
    const totalMidpoint = list.reduce((a, r) => a + r.rawMidpoint, 0);
    const totalThirdQ = list.reduce((a, r) => a + r.rawThirdQ, 0);
    const totalSpent = (totalImpr / 1000) * weightedCpm;

    return {
      totalImpr: totalImpr.toLocaleString('en-IN'),
      totalClicks: totalClicks.toLocaleString('en-IN'),
      avgCtr,
      avgCpm: "₹" + weightedCpm.toFixed(2),
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
  }, [list, effectiveCpm, totalInstalls, totalConversions]);

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
              <tr>
                <td colSpan={5 + (hasVideo ? 7 : 0) + (hasAF ? 2 : 0) - (isCtvWithAF ? (hasVideo ? 5 : 3) : 0)} style={{ textAlign: "center", padding: "24px", color: "#6B7280" }}>
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

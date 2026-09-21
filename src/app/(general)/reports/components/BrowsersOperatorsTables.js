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

  const ctype = String(selectedAudience?.campaignType || selectedAudience?.campaign_type || "").toUpperCase();
  const isCtvWithAF = ctype.includes("CTV") && hasAF;

  const list = useMemo(() => {
    // AppsFlyer Raw Installs Breakdown for Operators
    if (entityKey === "operator" && hasAF && rawInstallsBreakdown?.operator && Object.keys(rawInstallsBreakdown.operator).length > 0) {
      const groups = {};
      Object.entries(rawInstallsBreakdown.operator).forEach(([opKey, count]) => {
        const keyLower = opKey.toLowerCase().trim();
        if (keyLower === "unknown" || keyLower === "other" || keyLower === "none" || keyLower === "" || keyLower === "null" || keyLower === "undefined") return;
        const name = operatorNameMap[keyLower] || (opKey.charAt(0).toUpperCase() + opKey.slice(1));
        const nameLower = name.toLowerCase().trim();
        if (nameLower === "unknown" || nameLower === "other" || nameLower === "none") return;
        const instVal = Number(count || 0);
        if (instVal > 0) {
          groups[name] = (groups[name] || 0) + instVal;
        }
      });

      const entries = Object.entries(groups);
      if (entries.length > 0) {
        const currentSumInst = entries.reduce((s, e) => s + e[1], 0);
        const targetInst = totalInstalls > 0 ? totalInstalls : currentSumInst;
        const scale = currentSumInst > 0 ? targetInst / currentSumInst : 1;

        const totalImpSum = rawList.reduce((a, r) => a + Number(r.rawImp !== undefined ? r.rawImp : Number(String(r.impressions || 0).replace(/,/g, ''))), 0);
        const totalClicksSum = rawList.reduce((a, r) => a + Number(r.rawClicks !== undefined ? r.rawClicks : Number(String(r.clicks || 0).replace(/,/g, ''))), 0);

        const opWeights = entries.map(e => Number(e[1] || 0));
        const instAllocated = distributeInteger(targetInst, opWeights);
        const convAllocated = distributeValues(totalConversions, opWeights);

        return entries.map(([name, rawInst], idx) => {
          const inst = instAllocated[idx] || 0;
          const conv = convAllocated[idx] || 0;
          const share = targetInst > 0 ? inst / targetInst : (1 / entries.length);
          const imp = Math.round(totalImpSum * share);
          const clk = Math.round(totalClicksSum * share);
          const ctrVal = imp > 0 ? (clk / imp * 100).toFixed(2) + "%" : "0.00%";

          return {
            operator: name,
            name,
            rawImp: imp,
            rawClicks: clk,
            impressions: imp.toLocaleString('en-IN'),
            clicks: clk.toLocaleString('en-IN'),
            ctr: ctrVal,
            installs: inst,
            conversions: conv,
            installsFormatted: inst.toLocaleString('en-IN'),
            conversionsFormatted: conv.toLocaleString('en-IN'),
          };
        }).sort((a, b) => b.installs - a.installs);
      }
    }

    if (!Array.isArray(rawList) || rawList.length === 0) return [];

    if (hasAF) {
      const filteredRawList = rawList.filter(r => {
        const n = (r[entityKey] || r.name || r.operator || r.browser || r.Operator || "").toString().toLowerCase().trim();
        return n && n !== "unknown" && n !== "other" && n !== "none" && n !== "null" && n !== "undefined";
      });

      const weights = getDistributionWeights(
        filteredRawList,
        r => (r.rawClicks !== undefined ? r.rawClicks : Number(String(r.clicks || 0).replace(/,/g, ''))),
        r => (r.rawImp !== undefined ? r.rawImp : Number(String(r.impressions || 0).replace(/,/g, '')))
      );
      const instAllocated = distributeInteger(totalInstalls, weights);
      const convAllocated = distributeValues(totalConversions, weights);

      return filteredRawList.map((r, idx) => {
        const imp = r.rawImp !== undefined ? r.rawImp : Number(String(r.impressions || 0).replace(/,/g, ''));
        const clk = r.rawClicks !== undefined ? r.rawClicks : Number(String(r.clicks || 0).replace(/,/g, ''));
        const inst = instAllocated[idx] || 0;
        const conv = convAllocated[idx] || 0;

        return {
          ...r,
          rawImp: imp,
          rawClicks: clk,
          installs: inst,
          conversions: conv,
          installsFormatted: inst.toLocaleString('en-IN'),
          conversionsFormatted: conv.toLocaleString('en-IN'),
        };
      });
    }

    // NON-APPSFLYER: Match Preview BrowserTable & OperatorTable exactly
    const anyCpmRate = getPriceForDate(campaignPricing?.cpm, null);
    const anyCpcRate = getPriceForDate(campaignPricing?.cpc, null);
    const isCpcDefined = anyCpcRate !== undefined && anyCpcRate !== null && !isNaN(Number(anyCpcRate));
    const isCpmCampaign = (anyCpmRate !== undefined && Number(anyCpmRate) > 0) || !!globalEffectiveMetrics?.isCpmCampaign;
    const isCpcCampaign = isCpcDefined || !!globalEffectiveMetrics?.isCpcCampaign;

    const groups = {};
    rawList.forEach(row => {
      const title = (entityKey === "browser"
        ? (row.browser || row.browser_name || row.name || "-")
        : (row.name || row.browser || row.oses || row.os || row.OS || row.operator || row.browser_name || row.os_name || "-")
      ).trim();
      if (!title || title.toLowerCase() === "null" || title.toLowerCase() === "undefined") return;

      const imp = Number(row.rawImp !== undefined ? row.rawImp : (row.Impressions || row.impressions || 0));
      const cks = Number(row.rawClicks !== undefined ? row.rawClicks : (row.Clicks || row.clicks || 0));
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

    const result = Object.values(groups);
    result.sort((a, b) => b.rawImp - a.rawImp);

    return result.map(g => {
      const imp = g.rawImp;
      const clk = g.rawClicks;
      const spent = g.rawSpent;
      const ctrVal = imp > 0 ? (clk / imp * 100).toFixed(2) + "%" : "0.00%";
      const cpmVal = isCpmCampaign ? (imp > 0 ? (spent / imp) * 1000 : 0) : 0;
      const cpcVal = isCpcDefined
        ? (Number(anyCpcRate) === 0 ? 0 : (clk > 0 ? spent / clk : Number(anyCpcRate)))
        : (isCpcCampaign && clk > 0 ? spent / clk : 0);

      const vViews = hasVideo ? (g.videoViews > 0 ? g.videoViews : Math.round(imp * 0.98836)) : 0;
      const vComplete = hasVideo ? (g.videoComplete > 0 ? g.videoComplete : Math.round(imp * 0.8846)) : 0;
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
  }, [rawList, totalInstalls, totalConversions, entityKey, hasAF, rawInstallsBreakdown, campaignPricing, globalEffectiveMetrics, hasVideo]);

  const totalPages = Math.ceil(list.length / PAGE_SIZE) || 1;
  const from = list.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, list.length);
  const rows = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totals = useMemo(() => {
    const totalImpr = list.reduce((a, r) => a + r.rawImp, 0);
    const totalClicks = list.reduce((a, r) => a + r.rawClicks, 0);
    const avgCtr = totalImpr > 0 ? (totalClicks / totalImpr * 100).toFixed(2) + "%" : "0.00%";
    const totalViews = Math.round(totalImpr * 0.98836);
    const totalComplete = Math.round(totalImpr * 0.8846);

    const anyCpmRate = getPriceForDate(campaignPricing?.cpm, null);
    const anyCpcRate = getPriceForDate(campaignPricing?.cpc, null);
    const isCpcDefined = anyCpcRate !== undefined && anyCpcRate !== null && !isNaN(Number(anyCpcRate));
    const isCpmCampaign = (anyCpmRate !== undefined && Number(anyCpmRate) > 0) || !!globalEffectiveMetrics?.isCpmCampaign;
    const isCpcCampaign = isCpcDefined || !!globalEffectiveMetrics?.isCpcCampaign;

    const totalSpent = hasAF 
      ? (totalImpr / 1000) * effectiveCpm 
      : list.reduce((sum, r) => sum + (r.rawSpent || 0), 0);
    const avgCpm = hasAF 
      ? "₹" + effectiveCpm.toFixed(2) 
      : (isCpmCampaign && totalImpr > 0 ? "₹" + ((totalSpent / totalImpr) * 1000).toFixed(2) : "₹0.00");
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
  }, [list, effectiveCpm, totalInstalls, totalConversions, hasAF, campaignPricing, globalEffectiveMetrics]);

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

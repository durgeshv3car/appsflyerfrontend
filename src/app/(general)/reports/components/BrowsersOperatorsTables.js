"use client";
import React, { useState, useMemo } from "react";
import { TablePagination } from "./Shared";

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

function BrowserTable({ data, titleLabel, subLabel, entityKey, defaultData, hasVideo, effectiveCpm = 320, globalEffectiveMetrics, selectedAudience, rawInstallsBreakdown }) {
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

        return entries.map(([name, rawInst]) => {
          const share = targetInst > 0 ? (rawInst * scale) / targetInst : (1 / entries.length);
          const inst = Math.round(rawInst * scale);
          const conv = Math.round(totalConversions * share);
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

    const filteredRawList = rawList.filter(r => {
      const n = (r.operator || r.name || r.Operator || "").toString().toLowerCase().trim();
      return n && n !== "unknown" && n !== "other" && n !== "none" && n !== "null" && n !== "undefined";
    });

    const totalClicksSum = filteredRawList.reduce((a, r) => a + (r.rawClicks !== undefined ? r.rawClicks : Number(String(r.clicks || 0).replace(/,/g, ''))), 0);
    const totalImpSum = filteredRawList.reduce((a, r) => a + (r.rawImp !== undefined ? r.rawImp : Number(String(r.impressions || 0).replace(/,/g, ''))), 0);

    return filteredRawList.map((r) => {
      const imp = r.rawImp !== undefined ? r.rawImp : Number(String(r.impressions || 0).replace(/,/g, ''));
      const clk = r.rawClicks !== undefined ? r.rawClicks : Number(String(r.clicks || 0).replace(/,/g, ''));

      let share = 0;
      if (totalClicksSum > 0) {
        share = clk / totalClicksSum;
      } else if (totalImpSum > 0) {
        share = imp / totalImpSum;
      }

      const inst = Math.round(totalInstalls * share);
      const conv = Math.round(totalConversions * share);

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
  }, [rawList, totalInstalls, totalConversions, entityKey, hasAF, rawInstallsBreakdown]);

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
    const totalSpent = (totalImpr / 1000) * effectiveCpm;

    return {
      totalImpr: totalImpr.toLocaleString('en-IN'),
      totalClicks: totalClicks.toLocaleString('en-IN'),
      avgCtr,
      totalViews: totalViews.toLocaleString('en-IN'),
      totalComplete: totalComplete.toLocaleString('en-IN'),
      avgCpv: "₹" + (totalViews > 0 ? totalSpent / totalViews : 0).toFixed(2),
      avgCpcv: "₹" + (totalComplete > 0 ? totalSpent / totalComplete : 0).toFixed(2),
      totalInstalls: totalInstalls.toLocaleString('en-IN'),
      totalConversions: totalConversions.toLocaleString('en-IN'),
    };
  }, [list, effectiveCpm, totalInstalls, totalConversions]);

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
              <th>IMPRESSIONS</th>
              {!isCtvWithAF && <th>CLICKS</th>}
              {!isCtvWithAF && <th>CTR</th>}
              {hasVideo && <th>VIEWS</th>}
              {hasVideo && !isCtvWithAF && <th>CPV</th>}
              {hasVideo && <th>COMPLETE VIEW</th>}
              {hasVideo && !isCtvWithAF && <th>CPCV</th>}
              {hasAF && <th>INSTALLS</th>}
              {hasAF && <th style={{ paddingRight: "22px" }}>TOTAL CONVERSIONS</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              <>
                {rows.map((r, i) => {
                  const imp = r.rawImp || 0;
                  const vViews = Math.round(imp * 0.98836);
                  const vComplete = Math.round(imp * 0.8846);
                  const spent = (imp / 1000) * effectiveCpm;
                  const cpvVal = vViews > 0 ? spent / vViews : 0;
                  const cpcvVal = vComplete > 0 ? spent / vComplete : 0;

                  return (
                    <tr key={i} className="st-tr">
                      <td style={{ fontWeight: 600, color: "#111827", paddingLeft: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {r[entityKey] || r.name || "–"}
                      </td>
                      <td>{r.impressions}</td>
                      {!isCtvWithAF && <td>{r.clicks}</td>}
                      {!isCtvWithAF && <td>{r.ctr}</td>}
                      {hasVideo && <td>{vViews.toLocaleString('en-IN')}</td>}
                      {hasVideo && !isCtvWithAF && <td>₹{cpvVal.toFixed(2)}</td>}
                      {hasVideo && <td>{vComplete.toLocaleString('en-IN')}</td>}
                      {hasVideo && !isCtvWithAF && <td>₹{cpcvVal.toFixed(2)}</td>}
                      {hasAF && <td>{r.installsFormatted}</td>}
                      {hasAF && <td style={{ paddingRight: "22px" }}>{r.conversionsFormatted}</td>}
                    </tr>
                  );
                })}
                <tr className="st-tr-total">
                  <td style={{ paddingLeft: "22px" }}>Total</td>
                  <td>{totals.totalImpr}</td>
                  {!isCtvWithAF && <td>{totals.totalClicks}</td>}
                  {!isCtvWithAF && <td>{totals.avgCtr}</td>}
                  {hasVideo && <td>{totals.totalViews}</td>}
                  {hasVideo && !isCtvWithAF && <td>{totals.avgCpv}</td>}
                  {hasVideo && <td>{totals.totalComplete}</td>}
                  {hasVideo && !isCtvWithAF && <td>{totals.avgCpcv}</td>}
                  {hasAF && <td>{totals.totalInstalls}</td>}
                  {hasAF && <td style={{ paddingRight: "22px" }}>{totals.totalConversions}</td>}
                </tr>
              </>
            ) : (
              <tr><td colSpan={4 + (hasVideo ? 4 : 0) + (hasAF ? 2 : 0) - (isCtvWithAF ? (hasVideo ? 4 : 2) : 0)} style={{ textAlign: "center", padding: 20, color: "#6B7280" }}>No data available.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function BrowsersOperatorsTables({ browserData: propBrowserData, operatorData: propOperatorData, campaignPricing, globalEffectiveMetrics, selectedAudience, rawInstallsBreakdown }) {
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

  const bList = useMemo(() => {
    return Array.isArray(propBrowserData) && propBrowserData.length > 0
      ? propBrowserData.map(r => {
        const imp = Number(r.Impressions || r.impressions || 0);
        const clk = Number(r.Clicks || r.clicks || 0);
        const ctrRaw = Number(r.CTR || r.ctr || 0);
        const ctr = ctrRaw > 1 ? ctrRaw.toFixed(2) + "%" : (imp > 0 ? (clk / imp * 100).toFixed(2) + "%" : "0.00%");
        return {
          browser: r.Browser || r.browser || r.name || "Unknown",
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
        return {
          operator: r.Operator || r.operator || r.name || "Unknown",
          rawImp: imp,
          rawClicks: clk,
          impressions: imp.toLocaleString('en-IN'),
          clicks: clk.toLocaleString('en-IN'),
          ctr,
        };
      })
      : [];
  }, [propOperatorData]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {!isCtvWithAF && (
        <BrowserTable
          data={bList}
          titleLabel="Browser Share"
          subLabel="Top performing browsers"
          entityKey="browser"
          hasVideo={hasVideo}
          effectiveCpm={effectiveCpm}
          globalEffectiveMetrics={globalEffectiveMetrics}
          selectedAudience={selectedAudience}
          rawInstallsBreakdown={rawInstallsBreakdown}
        />
      )}
      <BrowserTable
        data={oList}
        titleLabel="Operator Share"
        subLabel="Top performing mobile operators"
        entityKey="operator"
        hasVideo={hasVideo}
        effectiveCpm={effectiveCpm}
        globalEffectiveMetrics={globalEffectiveMetrics}
        selectedAudience={selectedAudience}
        rawInstallsBreakdown={rawInstallsBreakdown}
      />
    </div>
  );
}

"use client";
import React, { useState, useMemo } from "react";
import { TablePagination } from "./Shared";

const PAGE_SIZE = 10;

const cityToStateCode = {
  "agra": "up",
  "mumbai": "mh",
  "delhi": "dl",
  "new delhi": "dl",
  "bengaluru": "ka",
  "bangalore": "ka",
  "hyderabad": "ts",
  "chennai": "tn",
  "kolkata": "wb",
  "pune": "mh",
  "ahmedabad": "gj",
  "jaipur": "rj",
  "surat": "gj",
  "lucknow": "up",
  "kanpur": "up",
  "nagpur": "mh",
  "indore": "mp",
  "thane": "mh",
  "bhopal": "mp",
  "visakhapatnam": "ap",
  "patna": "br",
  "vadodara": "gj",
  "ghaziabad": "up",
  "ludhiana": "pb",
  "coimbatore": "tn",
  "noida": "up",
  "gurgaon": "hr",
  "faridabad": "hr",
  "aurangabad": "mh",
  "amritsar": "pb",
  "dehradun": "ut",
  "chandigarh": "ch",
  "kochi": "kl",
  "trivandrum": "kl",
  "nasik": "mh",
  "nashik": "mh",
  "guwahati": "as",
  "bhubaneswar": "od",
  "ranchi": "jh",
  "jamshedpur": "jh",
  "raipur": "cg",
  "udaipur": "rj",
  "jodhpur": "rj",
  "kota": "rj",
  "bikaner": "rj",
  "gwalior": "mp",
  "jabalpur": "mp",
  "rajkot": "gj",
  "karanti": "rj"
};

const stateCodeToName = {
  "rj": "Rajasthan",
  "mh": "Maharashtra",
  "ka": "Karnataka",
  "dl": "Delhi",
  "ts": "Telangana",
  "tn": "Tamil Nadu",
  "wb": "West Bengal",
  "gj": "Gujarat",
  "up": "Uttar Pradesh",
  "mp": "Madhya Pradesh",
  "ap": "Andhra Pradesh",
  "br": "Bihar",
  "pb": "Punjab",
  "hr": "Haryana",
  "ut": "Uttarakhand",
  "kl": "Kerala",
  "as": "Assam",
  "od": "Odisha",
  "jh": "Jharkhand",
  "cg": "Chhattisgarh",
  "hp": "Himachal Pradesh",
  "jk": "Jammu and Kashmir",
  "ga": "Goa",
  "tr": "Tripura",
  "ml": "Meghalaya",
  "mn": "Manipur",
  "nl": "Nagaland",
  "ar": "Arunachal Pradesh",
  "sk": "Sikkim",
  "mz": "Mizoram",
  "ch": "Chandigarh",
  "py": "Puducherry",
  "an": "Andaman and Nicobar Islands",
  "ld": "Lakshadweep",
  "dn": "Dadra and Nagar Haveli and Daman and Diu",
  "la": "Ladakh"
};

export function DomainDistribution({ domainData: propData, campaignPricing, globalEffectiveMetrics, rawInstallsBreakdown, selectedAudience }) {
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
    const hasRawInstalls = rawInstallsBreakdown?.city && Object.keys(rawInstallsBreakdown.city).length > 0;
    const globalTargetImp = Number(globalEffectiveMetrics?.impressions || 0);

    // CASE 1: AppsFlyer Data Found -> State Data from rawinstall API (matching appflyer-preview)
    if (hasAF) {
      const groups = {};

      if (hasRawInstalls) {
        Object.entries(rawInstallsBreakdown.city).forEach(([cityKey, count]) => {
          const stateCode = cityKey.toLowerCase();
          const stateName = stateCodeToName[stateCode] || cityKey.toUpperCase();
          const instVal = Number(count || 0);
          if (instVal > 0) {
            groups[stateName] = {
              domain: stateName,
              rawInstalls: instVal,
            };
          }
        });
      }

      if (Object.keys(groups).length === 0 && Array.isArray(propData)) {
        propData.forEach(r => {
          const rawName = String(r.name || r.City || r.city || r.Domain || r.domain || "Unknown").trim();
          const stateCode = cityToStateCode[rawName.toLowerCase()] || rawName.toLowerCase();
          const stateName = stateCodeToName[stateCode] || rawName;
          const clk = Number(r.Clicks || r.clicks || 0);
          const imp = Number(r.Impressions || r.impressions || 0);
          if (!groups[stateName]) {
            groups[stateName] = { domain: stateName, rawInstalls: clk > 0 ? clk : imp };
          } else {
            groups[stateName].rawInstalls += clk > 0 ? clk : imp;
          }
        });
      }

      let stateList = Object.values(groups);
      if (stateList.length === 0) return [];

      const currentSumInst = stateList.reduce((sum, g) => sum + g.rawInstalls, 0);
      const targetInst = totalInstalls > 0 ? totalInstalls : currentSumInst;
      const scale = currentSumInst > 0 ? targetInst / currentSumInst : 0;

      let allocatedInstalls = 0;
      stateList = stateList.map((g, idx) => {
        let inst = 0;
        if (idx === stateList.length - 1) {
          inst = Math.max(0, targetInst - allocatedInstalls);
        } else {
          inst = Math.round(g.rawInstalls * scale);
          allocatedInstalls += inst;
        }
        return { ...g, rawInstalls: inst };
      }).sort((a, b) => b.rawInstalls - a.rawInstalls);

      const propDataArr = Array.isArray(propData) ? propData : [];
      const totalImpSum = globalTargetImp > 0 ? globalTargetImp : propDataArr.reduce((a, r) => a + Number(r.Impressions || r.impressions || 0), 0);
      const totalClicksSum = propDataArr.reduce((a, r) => a + Number(r.Clicks || r.clicks || 0), 0);
      const totalViewsSum = propDataArr.reduce((a, r) => a + Number(r.Views || r.views || r.VideoViews || 0), 0);
      const totalCompleteSum = propDataArr.reduce((a, r) => a + Number(r.completeViewsVideo || r.CompleteViewsVideo || r.complete_views || r.completeViews || 0), 0);
      const totalFirstQSum = propDataArr.reduce((a, r) => a + Number(r.firstQuartileViewsVideo || r.FirstQuartileViewsVideo || 0), 0);
      const totalMidpointSum = propDataArr.reduce((a, r) => a + Number(r.midpointViewsVideo || r.MidpointViewsVideo || 0), 0);
      const totalThirdQSum = propDataArr.reduce((a, r) => a + Number(r.thirdQuartileViewsVideo || r.ThirdQuartileViewsVideo || 0), 0);

      let allocatedImp = 0;
      return stateList.map((g, idx) => {
        const share = targetInst > 0 ? g.rawInstalls / targetInst : (1 / stateList.length);
        let imp = 0;
        if (idx === stateList.length - 1) {
          imp = Math.max(0, totalImpSum - allocatedImp);
        } else {
          imp = Math.round(totalImpSum * share);
          allocatedImp += imp;
        }
        const clk = Math.round(totalClicksSum * share);
        const ctrVal = imp > 0 ? (clk / imp * 100) : 0;
        const cpmVal = effectiveCpm;
        const spent = (imp / 1000) * cpmVal;

        const vViews = hasVideo ? (totalViewsSum > 0 ? Math.round(totalViewsSum * share) : Math.round(imp * 0.98836)) : 0;
        const vComplete = hasVideo ? (totalCompleteSum > 0 ? Math.round(totalCompleteSum * share) : Math.round(imp * 0.8846)) : 0;
        const vFirstQ = hasVideo ? (totalFirstQSum > 0 ? Math.round(totalFirstQSum * share) : Math.round(imp * 0.9474)) : 0;
        const vMidpoint = hasVideo ? (totalMidpointSum > 0 ? Math.round(totalMidpointSum * share) : Math.round(imp * 0.9222)) : 0;
        const vThirdQ = hasVideo ? (totalThirdQSum > 0 ? Math.round(totalThirdQSum * share) : Math.round(imp * 0.8999)) : 0;

        const cpvVal = vViews > 0 ? spent / vViews : 0;
        const cpcvVal = vComplete > 0 ? spent / vComplete : 0;
        const conv = Math.round(totalConversions * share);

        return {
          domain: g.domain,
          rawImp: imp,
          rawClicks: clk,
          impressions: imp.toLocaleString('en-IN'),
          clicks: clk.toLocaleString('en-IN'),
          ctr: ctrVal.toFixed(2) + "%",
          cpmVal,
          cpm: "₹" + cpmVal.toFixed(2),
          rawViews: vViews,
          rawComplete: vComplete,
          rawFirstQ: vFirstQ,
          rawMidpoint: vMidpoint,
          rawThirdQ: vThirdQ,
          cpvVal,
          cpcvVal,
          installs: g.rawInstalls,
          conversions: conv,
          installsFormatted: g.rawInstalls.toLocaleString('en-IN'),
          conversionsFormatted: conv.toLocaleString('en-IN'),
        };
      });
    }

    // CASE 2: No AppsFlyer Data -> Old City Method Data
    if (!Array.isArray(propData) || propData.length === 0) return [];

    const rawCityImpSum = propData.reduce((a, r) => a + Number(r.Impressions || r.impressions || 0), 0);
    const targetTotalImp = globalTargetImp > 0 ? globalTargetImp : rawCityImpSum;

    let allocatedImp = 0;
    return propData.map((r, idx) => {
      const rawImp = Number(r.Impressions || r.impressions || 0);
      const share = rawCityImpSum > 0 ? (rawImp / rawCityImpSum) : (1 / propData.length);
      let imp = 0;
      if (idx === propData.length - 1) {
        imp = Math.max(0, targetTotalImp - allocatedImp);
      } else {
        imp = Math.round(targetTotalImp * share);
        allocatedImp += imp;
      }
      const clk = Number(r.Clicks || r.clicks || 0);
      const ctrRaw = Number(r.CTR || r.ctr || 0);
      const ctrVal = ctrRaw > 1 ? ctrRaw : (imp > 0 ? (clk / imp * 100) : 0);
      const cpmVal = effectiveCpm || Number(r.CPM || r.cpm || r.eCPM || 320);
      const spent = (imp / 1000) * cpmVal;

      const vComplete = hasVideo ? Number(r.completeViewsVideo || r.CompleteViewsVideo || r.complete_views || r.completeViews || Math.round(imp * 0.8846)) : 0;
      const vFirstQ = hasVideo ? Number(r.firstQuartileViewsVideo || r.FirstQuartileViewsVideo || Math.round(imp * 0.9474)) : 0;
      const vMidpoint = hasVideo ? Number(r.midpointViewsVideo || r.MidpointViewsVideo || Math.round(imp * 0.9222)) : 0;
      const vThirdQ = hasVideo ? Number(r.thirdQuartileViewsVideo || r.ThirdQuartileViewsVideo || Math.round(imp * 0.8999)) : 0;
      const vViews = hasVideo ? Number(r.Views || r.views || r.VideoViews || vComplete || Math.round(imp * 0.98836)) : 0;
      const cpvVal = vViews > 0 ? spent / vViews : 0;
      const cpcvVal = vComplete > 0 ? spent / vComplete : 0;

      return {
        domain: r.name || r.City || r.city || r.Domain || r.domain || "Unknown City",
        rawImp: imp,
        rawClicks: clk,
        impressions: imp.toLocaleString('en-IN'),
        clicks: clk.toLocaleString('en-IN'),
        ctr: ctrVal.toFixed(2) + "%",
        cpmVal,
        cpm: "₹" + cpmVal.toFixed(2),
        rawViews: vViews,
        rawComplete: vComplete,
        rawFirstQ: vFirstQ,
        rawMidpoint: vMidpoint,
        rawThirdQ: vThirdQ,
        cpvVal,
        cpcvVal,
        installs: 0,
        conversions: 0,
        installsFormatted: "0",
        conversionsFormatted: "0",
      };
    });
  }, [propData, effectiveCpm, hasVideo, hasAF, rawInstallsBreakdown, totalInstalls, totalConversions, globalEffectiveMetrics]);

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
          <div className="st-panel-title">{hasAF ? "State Distribution" : "City & Domain Distribution"}</div>
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
              <th style={{ paddingLeft: "22px" }}>{hasAF ? "STATE" : "CITY / DOMAIN"}</th>
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
                    <td style={{ fontWeight: 600, color: "#2563EB", paddingLeft: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.domain}</td>
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
                  No {hasAF ? "State" : "City / Domain"} data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

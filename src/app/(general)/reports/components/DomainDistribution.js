"use client";
import React, { useState, useMemo } from "react";
import { TablePagination, distributeInteger, distributeValues, getDistributionWeights } from "./Shared";

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
  if (latestValue === undefined && sortedDates.length > 0) {
    latestValue = normalizedPricing[sortedDates[0]];
  }
  return latestValue;
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
    const pCpm = getPriceForDate(campaignPricing?.cpm, null);
    if (pCpm !== undefined && Number(pCpm) > 0) cpmRate = Number(pCpm);
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

  const isCpcDefined = anyCpcRate !== undefined;
  const isCpmCampaign = hasAF ? true : ((anyCpmRate > 0) || !!globalEffectiveMetrics?.isCpmCampaign);
  const isCpcCampaign = hasAF ? true : (isCpcDefined || !!globalEffectiveMetrics?.isCpcCampaign);

  const list = useMemo(() => {
    const hasRawInstalls = rawInstallsBreakdown?.city && Object.keys(rawInstallsBreakdown.city).length > 0;
    const globalTargetImp = Number(globalEffectiveMetrics?.impressions || 0);

    // CASE 1: AppsFlyer Data Found -> State Data
    if (hasAF) {
      const groups = {};

      if (Array.isArray(propData) && propData.length > 0) {
        propData.forEach(r => {
          const rawName = String(r.name || r.City || r.city || r.Domain || r.domain || "Unknown").trim();
          if (!rawName || rawName.toLowerCase() === "unknown" || rawName.toLowerCase() === "total") return;
          const stateCode = cityToStateCode[rawName.toLowerCase()] || rawName.toLowerCase();
          const stateName = stateCodeToName[stateCode] || rawName;
          const clk = Number(r.Clicks || r.clicks || r.rawClicks || 0);
          const imp = Number(r.Impressions || r.impressions || r.rawImp || 0);
          const views = Number(r.Views || r.views || r.VideoViews || 0);
          const comp = Number(r.completeViewsVideo || r.CompleteViewsVideo || r.complete_views || r.completeViews || 0);
          const fq = Number(r.firstQuartileViewsVideo || r.FirstQuartileViewsVideo || 0);
          const mid = Number(r.midpointViewsVideo || r.MidpointViewsVideo || 0);
          const tq = Number(r.thirdQuartileViewsVideo || r.ThirdQuartileViewsVideo || 0);

          if (!groups[stateName]) {
            groups[stateName] = {
              domain: stateName,
              rawImp: 0,
              rawClicks: 0,
              rawViews: 0,
              rawComplete: 0,
              rawFirstQ: 0,
              rawMidpoint: 0,
              rawThirdQ: 0,
            };
          }
          groups[stateName].rawImp += imp;
          groups[stateName].rawClicks += clk;
          groups[stateName].rawViews += views;
          groups[stateName].rawComplete += comp;
          groups[stateName].rawFirstQ += fq;
          groups[stateName].rawMidpoint += mid;
          groups[stateName].rawThirdQ += tq;
        });
      }

      if (Object.keys(groups).length === 0 && hasRawInstalls) {
        Object.entries(rawInstallsBreakdown.city).forEach(([cityKey, count]) => {
          const stateCode = cityKey.toLowerCase().trim();
          const stateName = stateCodeToName[stateCode] || cityKey.toUpperCase();
          const instVal = Number(count || 0);
          if (instVal > 0) {
            groups[stateName] = {
              domain: stateName,
              rawImp: 0,
              rawClicks: 0,
              rawViews: 0,
              rawComplete: 0,
              rawFirstQ: 0,
              rawMidpoint: 0,
              rawThirdQ: 0,
            };
          }
        });
      }

      let stateList = Object.values(groups);
      if (stateList.length === 0) return [];

      // Scale impressions if globalTargetImp > 0
      const totalImpSum = stateList.reduce((a, r) => a + r.rawImp, 0);
      if (globalTargetImp > 0 && totalImpSum > 0 && globalTargetImp !== totalImpSum) {
        let allocatedImp = 0;
        stateList.forEach((g, idx) => {
          if (idx === stateList.length - 1) {
            g.rawImp = Math.max(0, globalTargetImp - allocatedImp);
          } else {
            const scaled = Math.round(globalTargetImp * (g.rawImp / totalImpSum));
            g.rawImp = scaled;
            allocatedImp += scaled;
          }
        });
      }

      // Sort by impressions descending
      stateList.sort((a, b) => b.rawImp - a.rawImp);

      // Distribute installs & conversions: by clicks if clicks present (and not CTV), otherwise impressions
      const isCtv = isCtvWithAF || ctype.includes("CTV");
      const useClicks = !isCtv && stateList.some(g => Number(g.rawClicks || 0) > 0);
      const weights = useClicks
        ? getDistributionWeights(stateList, g => g.rawClicks, g => g.rawImp)
        : getDistributionWeights(stateList, () => 0, g => g.rawImp);
      const instAllocated = distributeInteger(totalInstalls, weights);
      const convAllocated = distributeValues(totalConversions, weights);

      return stateList.map((g, idx) => {
        const imp = g.rawImp;
        const clk = g.rawClicks;
        const ctrVal = imp > 0 ? (clk / imp * 100) : 0;
        const cpmVal = effectiveCpm;
        const spent = (imp / 1000) * cpmVal;

        const vViews = hasVideo ? (g.rawViews > 0 ? g.rawViews : Math.round(imp * 0.98836)) : 0;
        const vComplete = hasVideo ? (g.rawComplete > 0 ? g.rawComplete : Math.round(imp * 0.8846)) : 0;
        const vFirstQ = hasVideo ? (g.rawFirstQ > 0 ? g.rawFirstQ : Math.round(imp * 0.9474)) : 0;
        const vMidpoint = hasVideo ? (g.rawMidpoint > 0 ? g.rawMidpoint : Math.round(imp * 0.9222)) : 0;
        const vThirdQ = hasVideo ? (g.rawThirdQ > 0 ? g.rawThirdQ : Math.round(imp * 0.8999)) : 0;

        const cpvVal = vViews > 0 ? spent / vViews : 0;
        const cpcvVal = vComplete > 0 ? spent / vComplete : 0;
        const inst = instAllocated[idx] || 0;
        const conv = convAllocated[idx] || 0;

        return {
          domain: g.domain,
          rawImp: imp,
          rawClicks: clk,
          rawSpent: spent,
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
          installs: inst,
          conversions: conv,
          installsFormatted: inst.toLocaleString('en-IN'),
          conversionsFormatted: conv.toLocaleString('en-IN'),
        };
      });
    }

    // CASE 2: No AppsFlyer Data -> Old City Method Data
    if (!Array.isArray(propData) || propData.length === 0) return [];

    const rawCityImpSum = propData.reduce((a, r) => a + Number(r.Impressions || r.impressions || 0), 0);
    const targetTotalImp = globalTargetImp > 0 ? globalTargetImp : rawCityImpSum;

    let allocatedImp = 0;
    const convWeights = getDistributionWeights(propData);
    const convAllocated = distributeValues(totalConversions, convWeights);
    const instAllocated = distributeInteger(totalInstalls, convWeights);

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

      let spent = 0;
      if (anyCpmRate > 0) {
        spent = (imp / 1000) * anyCpmRate;
      } else if (isCpcDefined) {
        spent = clk * Number(anyCpcRate);
      } else if (globalEffectiveMetrics?.eCPM > 0) {
        spent = (imp / 1000) * globalEffectiveMetrics.eCPM;
      } else if (globalEffectiveMetrics?.eCPC !== undefined && !isNaN(Number(globalEffectiveMetrics?.eCPC))) {
        spent = clk * Number(globalEffectiveMetrics.eCPC);
      } else {
        const rCPM = Number(r.CPM || r.cpm || 0);
        const rCPC = Number(r.CPC || r.cpc || 0);
        spent = rCPM > 0 ? (imp / 1000) * rCPM : (clk * rCPC);
      }

      const cpmVal = isCpmCampaign && imp > 0 ? (spent / imp) * 1000 : 0;
      const cpcVal = isCpcCampaign
        ? (isCpcDefined ? (Number(anyCpcRate) === 0 ? 0 : (clk > 0 ? (spent / clk) : Number(anyCpcRate))) : (clk > 0 ? spent / clk : 0))
        : (clk > 0 ? spent / clk : 0);
      const spentFormatted = "₹" + spent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const vComplete = hasVideo ? Number(r.completeViewsVideo || r.CompleteViewsVideo || r.complete_views || r.completeViews || Math.round(imp * 0.8846)) : 0;
      const vFirstQ = hasVideo ? Number(r.firstQuartileViewsVideo || r.FirstQuartileViewsVideo || Math.round(imp * 0.9474)) : 0;
      const vMidpoint = hasVideo ? Number(r.midpointViewsVideo || r.MidpointViewsVideo || Math.round(imp * 0.9222)) : 0;
      const vThirdQ = hasVideo ? Number(r.thirdQuartileViewsVideo || r.ThirdQuartileViewsVideo || Math.round(imp * 0.8999)) : 0;
      const vViews = hasVideo ? Number(r.Views || r.views || r.VideoViews || vComplete || Math.round(imp * 0.98836)) : 0;
      const cpvVal = vViews > 0 ? spent / vViews : 0;
      const cpcvVal = vComplete > 0 ? spent / vComplete : 0;

      const inst = instAllocated[idx] || 0;
      const conv = convAllocated[idx] || 0;

      return {
        domain: r.name || r.City || r.city || r.Domain || r.domain || "Unknown City",
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
        spentFormatted,
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
  }, [propData, effectiveCpm, anyCpmRate, anyCpcRate, isCpcDefined, isCpmCampaign, isCpcCampaign, hasVideo, hasAF, rawInstallsBreakdown, totalInstalls, totalConversions, globalEffectiveMetrics]);

  const totals = useMemo(() => {
    const totalImpr = list.reduce((a, r) => a + r.rawImp, 0);
    const totalClicks = list.reduce((a, r) => a + r.rawClicks, 0);
    const avgCtr = totalImpr > 0 ? (totalClicks / totalImpr * 100).toFixed(2) + "%" : "0.00%";
    const totalViews = list.reduce((a, r) => a + r.rawViews, 0);
    const totalComplete = list.reduce((a, r) => a + r.rawComplete, 0);
    const totalFirstQ = list.reduce((a, r) => a + r.rawFirstQ, 0);
    const totalMidpoint = list.reduce((a, r) => a + r.rawMidpoint, 0);
    const totalThirdQ = list.reduce((a, r) => a + r.rawThirdQ, 0);
    
    const totalSpent = hasAF 
      ? (totalImpr / 1000) * effectiveCpm 
      : list.reduce((sum, r) => sum + (r.rawSpent || 0), 0);
    const avgCpm = hasAF 
      ? "₹" + effectiveCpm.toFixed(2) 
      : (isCpmCampaign && totalImpr > 0 ? "₹" + ((totalSpent / totalImpr) * 1000).toFixed(2) : "₹0.00");
    const avgCpc = isCpcCampaign
      ? (isCpcDefined && Number(anyCpcRate) === 0 ? "₹0.00" : (totalClicks > 0 ? "₹" + (totalSpent / totalClicks).toFixed(2) : (isCpcDefined ? "₹" + Number(anyCpcRate).toFixed(2) : "₹0.00")))
      : (totalClicks > 0 ? "₹" + (totalSpent / totalClicks).toFixed(2) : "₹0.00");
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
  }, [list, effectiveCpm, hasAF, isCpmCampaign, isCpcCampaign, anyCpcRate, totalInstalls, totalConversions]);

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
              {!hasAF && !isCtvWithAF && <th>CPC</th>}
              {!hasAF && !isCtvWithAF && <th>SPEND</th>}
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
                    <td style={{ fontWeight: 600, color: "#2563EB", paddingLeft: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.domain}</td>
                    <td>{r.impressions}</td>
                    {!isCtvWithAF && <td>{r.clicks}</td>}
                    {!isCtvWithAF && <td>{r.ctr}</td>}
                    {!isCtvWithAF && <td>{r.cpm}</td>}
                    {!hasAF && !isCtvWithAF && <td>{r.cpc}</td>}
                    {!hasAF && !isCtvWithAF && <td>{r.spentFormatted}</td>}
                    {hasVideo && <td>{r.rawViews.toLocaleString('en-IN')}</td>}
                    {hasVideo && !isCtvWithAF && <td>₹{r.cpvVal.toFixed(2)}</td>}
                    {hasVideo && <td>{r.rawFirstQ.toLocaleString('en-IN')}</td>}
                    {hasVideo && <td>{r.rawMidpoint.toLocaleString('en-IN')}</td>}
                    {hasVideo && <td>{r.rawThirdQ.toLocaleString('en-IN')}</td>}
                    {hasVideo && <td>{r.rawComplete.toLocaleString('en-IN')}</td>}
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
                  {!hasAF && !isCtvWithAF && <td>{totals.avgCpc}</td>}
                  {!hasAF && !isCtvWithAF && <td>{totals.totalSpentFormatted}</td>}
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

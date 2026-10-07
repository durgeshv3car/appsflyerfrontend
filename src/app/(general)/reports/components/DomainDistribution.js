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
  const targetClicks = Number(globalEffectiveMetrics?.clicks || 0);
  const targetSpend = Number(globalEffectiveMetrics?.spend || 0);

  const targetVideoViews = Math.round(Number(globalEffectiveMetrics?.totalViews || globalEffectiveMetrics?.totalVideoViews || 0));
  const targetVideoComplete = Math.round(Number(globalEffectiveMetrics?.totalVideoComplete || 0));
  const targetVideoFirstQ = Math.round(Number(globalEffectiveMetrics?.totalVideoFirstQ || 0));
  const targetVideoMidpoint = Math.round(Number(globalEffectiveMetrics?.totalVideoMidpoint || 0));
  const targetVideoThirdQ = Math.round(Number(globalEffectiveMetrics?.totalVideoThirdQ || 0));

  const targetImpressions = Number(globalEffectiveMetrics?.impressions || 0);
  const effectiveTargetViews = targetVideoViews > 0 ? targetVideoViews : (targetImpressions > 0 ? Math.round(targetImpressions * 0.98836) : 0);
  const effectiveTargetComplete = targetVideoComplete > 0 ? targetVideoComplete : (targetImpressions > 0 ? Math.round(targetImpressions * 0.8846) : 0);
  const effectiveTargetFirstQ = targetVideoFirstQ > 0 ? targetVideoFirstQ : (targetImpressions > 0 ? Math.round(targetImpressions * 0.9474) : 0);
  const effectiveTargetMidpoint = targetVideoMidpoint > 0 ? targetVideoMidpoint : (targetImpressions > 0 ? Math.round(targetImpressions * 0.9222) : 0);
  const effectiveTargetThirdQ = targetVideoThirdQ > 0 ? targetVideoThirdQ : (targetImpressions > 0 ? Math.round(targetImpressions * 0.8999) : 0);

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

      // Reconcile clicks to targetClicks if available
      const totalClicksSum = stateList.reduce((a, r) => a + r.rawClicks, 0);
      if (targetClicks > 0 && totalClicksSum > 0 && Math.abs(targetClicks - totalClicksSum) > 0) {
        let allocatedClicks = 0;
        stateList.forEach((g, idx) => {
          if (idx === stateList.length - 1) {
            g.rawClicks = Math.max(0, targetClicks - allocatedClicks);
          } else {
            const ratio = g.rawClicks / totalClicksSum;
            const scaled = Math.round(targetClicks * ratio);
            g.rawClicks = scaled;
            allocatedClicks += scaled;
          }
        });
      } else if (targetClicks > 0 && totalClicksSum === 0) {
        const clickWeights = getDistributionWeights(stateList, () => 0, g => g.rawImp);
        const allocatedClicks = distributeInteger(targetClicks, clickWeights);
        stateList.forEach((g, idx) => {
          g.rawClicks = allocatedClicks[idx] || 0;
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

      // Reconcile video metrics across states if hasVideo is true
      if (hasVideo && stateList.length > 0) {
        const impWeights = stateList.map(g => Math.max(0, Number(g.rawImp || 0)));

        if (effectiveTargetViews > 0) {
          const sumRawViews = stateList.reduce((s, g) => s + (g.rawViews || 0), 0);
          const w = sumRawViews > 0 ? stateList.map(g => Math.max(0, Number(g.rawViews || 0))) : impWeights;
          const alloc = distributeInteger(effectiveTargetViews, w);
          stateList.forEach((g, idx) => { g.rawViews = alloc[idx] || 0; });
        }

        if (effectiveTargetFirstQ > 0) {
          const sumRawFirstQ = stateList.reduce((s, g) => s + (g.rawFirstQ || 0), 0);
          const w = sumRawFirstQ > 0 ? stateList.map(g => Math.max(0, Number(g.rawFirstQ || 0))) : impWeights;
          const alloc = distributeInteger(effectiveTargetFirstQ, w);
          stateList.forEach((g, idx) => { g.rawFirstQ = alloc[idx] || 0; });
        }

        if (effectiveTargetMidpoint > 0) {
          const sumRawMidpoint = stateList.reduce((s, g) => s + (g.rawMidpoint || 0), 0);
          const w = sumRawMidpoint > 0 ? stateList.map(g => Math.max(0, Number(g.rawMidpoint || 0))) : impWeights;
          const alloc = distributeInteger(effectiveTargetMidpoint, w);
          stateList.forEach((g, idx) => { g.rawMidpoint = alloc[idx] || 0; });
        }

        if (effectiveTargetThirdQ > 0) {
          const sumRawThirdQ = stateList.reduce((s, g) => s + (g.rawThirdQ || 0), 0);
          const w = sumRawThirdQ > 0 ? stateList.map(g => Math.max(0, Number(g.rawThirdQ || 0))) : impWeights;
          const alloc = distributeInteger(effectiveTargetThirdQ, w);
          stateList.forEach((g, idx) => { g.rawThirdQ = alloc[idx] || 0; });
        }

        if (effectiveTargetComplete > 0) {
          const sumRawComplete = stateList.reduce((s, g) => s + (g.rawComplete || 0), 0);
          const w = sumRawComplete > 0 ? stateList.map(g => Math.max(0, Number(g.rawComplete || 0))) : impWeights;
          const alloc = distributeInteger(effectiveTargetComplete, w);
          stateList.forEach((g, idx) => { g.rawComplete = alloc[idx] || 0; });
        }
      }

      // Allocate spend across states
      const totalBaseImp = stateList.reduce((a, r) => a + r.rawImp, 0);
      let allocatedSpend = 0;

      return stateList.map((g, idx) => {
        const imp = g.rawImp;
        const clk = g.rawClicks;
        const ctrVal = imp > 0 ? (clk / imp * 100) : 0;
        const cpmVal = effectiveCpm;
        
        let spent = 0;
        if (targetSpend > 0 && totalBaseImp > 0) {
          if (idx === stateList.length - 1) {
            spent = Math.max(0, parseFloat((targetSpend - allocatedSpend).toFixed(2)));
          } else {
            const ratio = imp / totalBaseImp;
            spent = parseFloat((targetSpend * ratio).toFixed(2));
            allocatedSpend += spent;
          }
        } else {
          spent = (imp / 1000) * cpmVal;
        }

        const vViews = hasVideo ? (g.rawViews || 0) : 0;
        const vComplete = hasVideo ? (g.rawComplete || 0) : 0;
        const vFirstQ = hasVideo ? (g.rawFirstQ || 0) : 0;
        const vMidpoint = hasVideo ? (g.rawMidpoint || 0) : 0;
        const vThirdQ = hasVideo ? (g.rawThirdQ || 0) : 0;

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
          spentFormatted: "₹" + spent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
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

    // Reconcile clicks
    const totalRawClicks = propData.reduce((a, r) => a + Number(r.Clicks || r.clicks || 0), 0);
    const effectiveTargetClicks = targetClicks > 0 ? targetClicks : totalRawClicks;
    let allocatedClicks = 0;

    // First pass to calculate scaled imp, clk, raw spent
    const preliminary = propData.map((r, idx) => {
      const rawImp = Number(r.Impressions || r.impressions || 0);
      const share = rawCityImpSum > 0 ? (rawImp / rawCityImpSum) : (1 / propData.length);
      let imp = 0;
      if (idx === propData.length - 1) {
        imp = Math.max(0, targetTotalImp - allocatedImp);
      } else {
        imp = Math.round(targetTotalImp * share);
        allocatedImp += imp;
      }

      const rawClk = Number(r.Clicks || r.clicks || 0);
      let clk = rawClk;
      if (effectiveTargetClicks > 0 && totalRawClicks > 0 && Math.abs(effectiveTargetClicks - totalRawClicks) > 0) {
        if (idx === propData.length - 1) {
          clk = Math.max(0, effectiveTargetClicks - allocatedClicks);
        } else {
          const cShare = rawClk / totalRawClicks;
          clk = Math.round(effectiveTargetClicks * cShare);
          allocatedClicks += clk;
        }
      } else if (effectiveTargetClicks > 0 && totalRawClicks === 0) {
        clk = Math.round(effectiveTargetClicks * share);
      }

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

      return {
        r,
        idx,
        imp,
        clk,
        spent,
      };
    });

    // Reconcile spend to targetSpend
    const prelimSpentSum = preliminary.reduce((s, p) => s + p.spent, 0);
    if (targetSpend > 0 && prelimSpentSum > 0 && Math.abs(targetSpend - prelimSpentSum) > 0.05) {
      let allocatedSpend = 0;
      preliminary.forEach((p, idx) => {
        if (idx === preliminary.length - 1) {
          p.spent = Math.max(0, parseFloat((targetSpend - allocatedSpend).toFixed(2)));
        } else {
          const ratio = p.spent / prelimSpentSum;
          const scaled = parseFloat((targetSpend * ratio).toFixed(2));
          p.spent = scaled;
          allocatedSpend += scaled;
        }
      });
    } else if (targetSpend > 0 && prelimSpentSum === 0) {
      let allocatedSpend = 0;
      preliminary.forEach((p, idx) => {
        if (idx === preliminary.length - 1) {
          p.spent = Math.max(0, parseFloat((targetSpend - allocatedSpend).toFixed(2)));
        } else {
          const ratio = targetTotalImp > 0 ? p.imp / targetTotalImp : 1 / preliminary.length;
          const scaled = parseFloat((targetSpend * ratio).toFixed(2));
          p.spent = scaled;
          allocatedSpend += scaled;
        }
      });
    }

    if (hasVideo && preliminary.length > 0) {
      const impWeights = preliminary.map(p => Math.max(0, Number(p.imp || 0)));

      if (effectiveTargetViews > 0) {
        const sumRaw = preliminary.reduce((s, p) => s + Number(p.r.Views || p.r.views || p.r.VideoViews || p.r.completeViewsVideo || 0), 0);
        const w = sumRaw > 0 ? preliminary.map(p => Math.max(0, Number(p.r.Views || p.r.views || p.r.VideoViews || p.r.completeViewsVideo || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetViews, w);
        preliminary.forEach((p, idx) => { p.vViews = alloc[idx] || 0; });
      }

      if (effectiveTargetFirstQ > 0) {
        const sumRaw = preliminary.reduce((s, p) => s + Number(p.r.firstQuartileViewsVideo || p.r.FirstQuartileViewsVideo || 0), 0);
        const w = sumRaw > 0 ? preliminary.map(p => Math.max(0, Number(p.r.firstQuartileViewsVideo || p.r.FirstQuartileViewsVideo || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetFirstQ, w);
        preliminary.forEach((p, idx) => { p.vFirstQ = alloc[idx] || 0; });
      }

      if (effectiveTargetMidpoint > 0) {
        const sumRaw = preliminary.reduce((s, p) => s + Number(p.r.midpointViewsVideo || p.r.MidpointViewsVideo || 0), 0);
        const w = sumRaw > 0 ? preliminary.map(p => Math.max(0, Number(p.r.midpointViewsVideo || p.r.MidpointViewsVideo || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetMidpoint, w);
        preliminary.forEach((p, idx) => { p.vMidpoint = alloc[idx] || 0; });
      }

      if (effectiveTargetThirdQ > 0) {
        const sumRaw = preliminary.reduce((s, p) => s + Number(p.r.thirdQuartileViewsVideo || p.r.ThirdQuartileViewsVideo || 0), 0);
        const w = sumRaw > 0 ? preliminary.map(p => Math.max(0, Number(p.r.thirdQuartileViewsVideo || p.r.ThirdQuartileViewsVideo || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetThirdQ, w);
        preliminary.forEach((p, idx) => { p.vThirdQ = alloc[idx] || 0; });
      }

      if (effectiveTargetComplete > 0) {
        const sumRaw = preliminary.reduce((s, p) => s + Number(p.r.completeViewsVideo || p.r.CompleteViewsVideo || p.r.complete_views || p.r.completeViews || 0), 0);
        const w = sumRaw > 0 ? preliminary.map(p => Math.max(0, Number(p.r.completeViewsVideo || p.r.CompleteViewsVideo || p.r.complete_views || p.r.completeViews || 0))) : impWeights;
        const alloc = distributeInteger(effectiveTargetComplete, w);
        preliminary.forEach((p, idx) => { p.vComplete = alloc[idx] || 0; });
      }
    }

    return preliminary.map(({ r, idx, imp, clk, spent, vViews, vComplete, vFirstQ, vMidpoint, vThirdQ }) => {
      const ctrVal = imp > 0 ? (clk / imp * 100) : 0;
      const cpmVal = isCpmCampaign && imp > 0 ? (spent / imp) * 1000 : 0;
      const cpcVal = isCpcCampaign
        ? (isCpcDefined ? (Number(anyCpcRate) === 0 ? 0 : (clk > 0 ? (spent / clk) : Number(anyCpcRate))) : (clk > 0 ? spent / clk : 0))
        : (clk > 0 ? spent / clk : 0);
      const spentFormatted = "₹" + spent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      const finalViews = hasVideo ? (vViews !== undefined ? vViews : 0) : 0;
      const finalComplete = hasVideo ? (vComplete !== undefined ? vComplete : 0) : 0;
      const finalFirstQ = hasVideo ? (vFirstQ !== undefined ? vFirstQ : 0) : 0;
      const finalMidpoint = hasVideo ? (vMidpoint !== undefined ? vMidpoint : 0) : 0;
      const finalThirdQ = hasVideo ? (vThirdQ !== undefined ? vThirdQ : 0) : 0;
      const cpvVal = finalViews > 0 ? spent / finalViews : 0;
      const cpcvVal = finalComplete > 0 ? spent / finalComplete : 0;

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
        rawViews: finalViews,
        rawComplete: finalComplete,
        rawFirstQ: finalFirstQ,
        rawMidpoint: finalMidpoint,
        rawThirdQ: finalThirdQ,
        cpvVal,
        cpcvVal,
        installs: inst,
        conversions: conv,
        installsFormatted: inst.toLocaleString('en-IN'),
        conversionsFormatted: conv.toLocaleString('en-IN'),
      };
    });
  }, [propData, effectiveCpm, anyCpmRate, anyCpcRate, isCpcDefined, isCpmCampaign, isCpcCampaign, hasVideo, hasAF, rawInstallsBreakdown, totalInstalls, totalConversions, targetClicks, targetSpend, globalEffectiveMetrics, effectiveTargetViews, effectiveTargetComplete, effectiveTargetFirstQ, effectiveTargetMidpoint, effectiveTargetThirdQ]);

  const totals = useMemo(() => {
    const totalImpr = (Number(globalEffectiveMetrics?.impressions || 0) > 0)
      ? Number(globalEffectiveMetrics.impressions)
      : list.reduce((a, r) => a + r.rawImp, 0);
    const totalClicks = (targetClicks > 0)
      ? targetClicks
      : list.reduce((a, r) => a + r.rawClicks, 0);
    const totalSpent = (targetSpend > 0)
      ? targetSpend
      : (hasAF 
        ? (totalImpr / 1000) * effectiveCpm 
        : list.reduce((sum, r) => sum + (r.rawSpent || 0), 0));
    const avgCtr = totalImpr > 0 ? (totalClicks / totalImpr * 100).toFixed(2) + "%" : "0.00%";
    const totalViews = (hasVideo && effectiveTargetViews > 0) ? effectiveTargetViews : list.reduce((a, r) => a + r.rawViews, 0);
    const totalComplete = (hasVideo && effectiveTargetComplete > 0) ? effectiveTargetComplete : list.reduce((a, r) => a + r.rawComplete, 0);
    const totalFirstQ = (hasVideo && effectiveTargetFirstQ > 0) ? effectiveTargetFirstQ : list.reduce((a, r) => a + r.rawFirstQ, 0);
    const totalMidpoint = (hasVideo && effectiveTargetMidpoint > 0) ? effectiveTargetMidpoint : list.reduce((a, r) => a + r.rawMidpoint, 0);
    const totalThirdQ = (hasVideo && effectiveTargetThirdQ > 0) ? effectiveTargetThirdQ : list.reduce((a, r) => a + r.rawThirdQ, 0);
    
    const avgCpm = isCpmCampaign && totalImpr > 0 ? "₹" + ((totalSpent / totalImpr) * 1000).toFixed(2) : (hasAF ? "₹" + effectiveCpm.toFixed(2) : "₹0.00");
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
  }, [list, effectiveCpm, hasAF, isCpmCampaign, isCpcCampaign, isCpcDefined, anyCpcRate, totalInstalls, totalConversions, targetClicks, targetSpend, globalEffectiveMetrics, hasVideo, effectiveTargetViews, effectiveTargetComplete, effectiveTargetFirstQ, effectiveTargetMidpoint, effectiveTargetThirdQ]);

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

"use client";
import React, { useState, useEffect, useMemo } from "react";
import { TablePagination } from "./Shared";
import { FiEye, FiExternalLink, FiX } from "react-icons/fi";

const PAGE_SIZE = 10;

export function CreativeDetails({ creativeData: propData, campaignPricing, globalEffectiveMetrics, selectedAudience }) {
  const [page, setPage] = useState(1);
  const [dbCreatives, setDbCreatives] = useState([]);
  const [selectedCreativeForModal, setSelectedCreativeForModal] = useState(null);

  const hasVideo = !!globalEffectiveMetrics?.hasVideoData;
  const hasAF = !!globalEffectiveMetrics?.hasAppsflyerData;
  const totalInstalls = Number(globalEffectiveMetrics?.installs || 0);
  const totalConversions = Number(globalEffectiveMetrics?.conversions || 0);

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

  const list = useMemo(() => {
    if (!Array.isArray(propData) || propData.length === 0) return [];
    const rawList = propData.map(r => {
      const imp = Number(r.Impressions || r.impressions || 0);
      const clk = Number(r.Clicks || r.clicks || 0);
      const rawCtr = imp > 0 && clk > 0 ? (clk / imp * 100) : Number(r.CTR || r.ctr || 0) * (Number(r.CTR || r.ctr || 0) > 1 ? 1 : 100);
      const rowCpm = effectiveCpm || Number(r.CPM || r.cpm || r.eCPM || 320);
      const spent = (imp / 1000) * rowCpm;

      const completeViews = hasVideo ? Number(r.completeViewsVideo || r.CompleteViewsVideo || r.complete_views || r.completeViews || Math.round(imp * 0.8846)) : 0;
      const vViews = hasVideo ? Number(r.Views || r.views || r.VideoViews || completeViews || Math.round(imp * 0.98836)) : 0;
      const vFirstQ = hasVideo ? Number(r.firstQuartileViewsVideo || r.FirstQuartileViewsVideo || Math.round(imp * 0.9474)) : 0;
      const vMidpoint = hasVideo ? Number(r.midpointViewsVideo || r.MidpointViewsVideo || Math.round(imp * 0.9222)) : 0;
      const vThirdQ = hasVideo ? Number(r.thirdQuartileViewsVideo || r.ThirdQuartileViewsVideo || Math.round(imp * 0.8999)) : 0;
      const cpvVal = vViews > 0 ? spent / vViews : 0;
      const cpcvVal = completeViews > 0 ? spent / completeViews : 0;

      const rawName = r.Creative || r.creative || r.CreativeName || r.name || "Creative";
      const matched = dbCreatives.find(dbC => {
        const dbName = String(dbC.creativeName || dbC.name || dbC.title || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const rowName = String(rawName).toLowerCase().replace(/[^a-z0-9]/g, "");
        return dbName && rowName && (dbName === rowName || dbName.includes(rowName) || rowName.includes(dbName));
      });

      const fileUrl = r.fileUrl || r.url || r.assetUrl || r.creativeUrl || r.image || r.video || matched?.fileUrl || matched?.url || matched?.assetUrl || "";
      const type = r.type || r.creativeType || matched?.type || matched?.creativeType || (hasVideo ? "video" : "banner");

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
        impressions: imp.toLocaleString('en-IN'),
        clicks: clk.toLocaleString('en-IN'),
        ctr: rawCtr > 0 ? rawCtr.toFixed(2) + "%" : "0.00%",
        cpmVal: rowCpm,
        cpm: "₹" + rowCpm.toFixed(2),
        rawViews: vViews,
        rawComplete: completeViews,
        rawFirstQ: vFirstQ,
        rawMidpoint: vMidpoint,
        rawThirdQ: vThirdQ,
        cpvVal,
        cpcvVal,
      };
    });

    const totalClicksSum = rawList.reduce((a, r) => a + r.rawClicks, 0);
    const totalImpSum = rawList.reduce((a, r) => a + r.rawImpressions, 0);

    return rawList.map((r) => {
      let share = 0;
      if (totalClicksSum > 0) {
        share = r.rawClicks / totalClicksSum;
      } else if (totalImpSum > 0) {
        share = r.rawImpressions / totalImpSum;
      }
      const inst = Math.round(totalInstalls * share);
      const conv = Math.round(totalConversions * share);

      return {
        ...r,
        installs: inst,
        conversions: conv,
        installsFormatted: inst.toLocaleString('en-IN'),
        conversionsFormatted: conv.toLocaleString('en-IN'),
      };
    });
  }, [propData, effectiveCpm, hasVideo, totalInstalls, totalConversions, dbCreatives]);

  const totals = useMemo(() => {
    const totalImpr = list.reduce((a, r) => a + r.rawImpressions, 0);
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
  const from = list.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, list.length);
  const rows = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: isCtvWithAF ? "1fr" : "repeat(3, 1fr)", gap: 12, margin: "0 16px" }}>
        {
          !isCtvWithAF && (<div style={{ background: "#fff", border: "1px solid #3B82F6", borderRadius: 8, padding: "10px 14px" }}>
            <div className="st-kpi-tag">TOTAL IMPRESSIONS</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginTop: 2 }}>
              {totals.totalImpr}
            </div>
          </div>)
        }

        {!isCtvWithAF && (
          <div style={{ background: "#EFF6FF", border: "1px solid #3B82F6", borderRadius: 8, padding: "10px 14px" }}>
            <div className="st-kpi-tag">TOTAL CLICKS</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginTop: 2 }}>
              {totals.totalClicks}
            </div>
          </div>
        )}
        {!isCtvWithAF && (
          <div style={{ background: "#F0FDF4", border: "1px solid #22C55E", borderRadius: 8, padding: "10px 14px" }}>
            <div className="st-kpi-tag">AVG CTR</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#166534", marginTop: 2 }}>
              {totals.avgCtr}
            </div>
          </div>
        )}
      </div>

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

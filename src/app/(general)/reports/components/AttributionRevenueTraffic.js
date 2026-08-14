"use client";

import { DonutChart } from "./Shared";

const COLORS = ["#2563EB", "#22C55E", "#F97316", "#A855F7", "#EF4444", "#06B6D4", "#EAB308"];

const cityToStateCode = {
  "agra": "up", "mumbai": "mh", "delhi": "dl", "new delhi": "dl", "bengaluru": "ka", "bangalore": "ka",
  "hyderabad": "ts", "chennai": "tn", "kolkata": "wb", "pune": "mh", "ahmedabad": "gj", "jaipur": "rj",
  "surat": "gj", "lucknow": "up", "kanpur": "up", "nagpur": "mh", "indore": "mp", "thane": "mh",
  "bhopal": "mp", "visakhapatnam": "ap", "patna": "br", "vadodara": "gj", "ghaziabad": "up",
  "ludhiana": "pb", "coimbatore": "tn", "noida": "up", "gurgaon": "hr", "faridabad": "hr",
  "aurangabad": "mh", "amritsar": "pb", "dehradun": "ut", "chandigarh": "ch", "kochi": "kl",
  "trivandrum": "kl", "nasik": "mh", "nashik": "mh", "guwahati": "as", "bhubaneswar": "od",
  "ranchi": "jh", "jamshedpur": "jh", "raipur": "cg", "udaipur": "rj", "jodhpur": "rj",
  "kota": "rj", "bikaner": "rj", "gwalior": "mp", "jabalpur": "mp", "rajkot": "gj", "karanti": "rj"
};

const stateCodeToName = {
  "rj": "Rajasthan", "mh": "Maharashtra", "ka": "Karnataka", "dl": "Delhi", "ts": "Telangana",
  "tn": "Tamil Nadu", "wb": "West Bengal", "gj": "Gujarat", "up": "Uttar Pradesh", "mp": "Madhya Pradesh",
  "ap": "Andhra Pradesh", "br": "Bihar", "pb": "Punjab", "hr": "Haryana", "ut": "Uttarakhand",
  "kl": "Kerala", "as": "Assam", "od": "Odisha", "jh": "Jharkhand", "cg": "Chhattisgarh",
  "hp": "Himachal Pradesh", "jk": "Jammu & Kashmir", "ga": "Goa", "tr": "Tripura", "ml": "Meghalaya",
  "mn": "Manipur", "nl": "Nagaland", "ar": "Arunachal Pradesh", "sk": "Sikkim", "mz": "Mizoram",
  "ch": "Chandigarh", "py": "Puducherry", "an": "Andaman & Nicobar", "ld": "Lakshadweep",
  "dn": "Dadra & Nagar Haveli", "la": "Ladakh"
};

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

const SectionHeader = ({ title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "32px 24px 16px" }}>
    <span style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.12em", textTransform: "uppercase" }}>{title}</span>
    <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
  </div>
);

function DonutCard({ title, subTitle, label, subLabel, items, tag, tagColor }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E9EEF5", borderRadius: 12, padding: "24px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", letterSpacing: "0.08em", textTransform: "uppercase" }}>{title}</div>
          {subTitle && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{subTitle}</div>}
        </div>
        {tag && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: (tagColor || "#3B82F6") + "1A", color: tagColor || "#3B82F6", height: "fit-content" }}>
            {tag}
          </span>
        )}
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <DonutChart size={140} data={items.map(it => ({ value: it.value, color: it.color }))} label={label} subLabel={subLabel} />
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                <span style={{ color: "#374151" }}>{item.label}</span>
              </div>
              <span style={{ color: "#6B7280", fontWeight: 500 }}>{item.displayVal || `${Number(item.value || 0).toFixed(1)}%`}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function buildShareItems(data, labelKey, altLabelKey) {
  if (!Array.isArray(data) || data.length === 0) return null;
  const getImp = (r) => Number(r.Impressions || r.impressions || 0);
  const total = data.reduce((s, r) => s + getImp(r), 0);
  if (total === 0) return null;
  const getLabel = (r) => r[labelKey] || r[altLabelKey] || r.name || "Other";
  return data.slice(0, 6).map((r, i) => {
    const imp = getImp(r);
    return {
      label: getLabel(r),
      value: total > 0 ? (imp / total * 100) : 0,
      displayVal: imp.toLocaleString('en-IN'),
      color: COLORS[i % COLORS.length],
    };
  });
}

function buildOperatorShareItems(operatorData, rawInstallsBreakdown, hasAF) {
  if (hasAF && rawInstallsBreakdown?.operator && Object.keys(rawInstallsBreakdown.operator).length > 0) {
    const groups = {};
    Object.entries(rawInstallsBreakdown.operator).forEach(([opKey, count]) => {
      const keyLower = opKey.toLowerCase().trim();
      if (keyLower === "unknown" || keyLower === "other" || keyLower === "none" || keyLower === "" || keyLower === "null" || keyLower === "undefined") return;
      const name = operatorNameMap[keyLower] || (opKey.charAt(0).toUpperCase() + opKey.slice(1));
      const nameLower = name.toLowerCase().trim();
      if (nameLower === "unknown" || nameLower === "other" || nameLower === "none") return;
      const val = Number(count || 0);
      if (val > 0) {
        groups[name] = (groups[name] || 0) + val;
      }
    });

    const total = Object.values(groups).reduce((s, v) => s + v, 0);
    if (total > 0) {
      return Object.entries(groups)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, val], i) => ({
          label: name,
          value: (val / total * 100),
          displayVal: val.toLocaleString('en-IN'),
          color: COLORS[i % COLORS.length],
        }));
    }
  }

  return buildShareItems(operatorData, "Operator", "operator");
}

function buildGeoShareItems(cityData, rawInstallsBreakdown, hasAF) {
  if (hasAF) {
    const groups = {};
    if (rawInstallsBreakdown?.city && Object.keys(rawInstallsBreakdown.city).length > 0) {
      Object.entries(rawInstallsBreakdown.city).forEach(([cityKey, count]) => {
        const stateCode = cityKey.toLowerCase();
        const stateName = stateCodeToName[stateCode] || cityKey.toUpperCase();
        const val = Number(count || 0);
        if (val > 0) {
          groups[stateName] = (groups[stateName] || 0) + val;
        }
      });
    }

    if (Object.keys(groups).length === 0 && Array.isArray(cityData)) {
      cityData.forEach(r => {
        const rawName = String(r.name || r.City || r.city || r.Domain || r.domain || "Unknown").trim();
        const stateCode = cityToStateCode[rawName.toLowerCase()] || rawName.toLowerCase();
        const stateName = stateCodeToName[stateCode] || rawName;
        const imp = Number(r.Impressions || r.impressions || r.Clicks || r.clicks || 0);
        if (imp > 0) {
          groups[stateName] = (groups[stateName] || 0) + imp;
        }
      });
    }

    const total = Object.values(groups).reduce((s, v) => s + v, 0);
    if (total === 0) return null;

    return Object.entries(groups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([stateName, val], i) => ({
        label: stateName,
        value: (val / total * 100),
        displayVal: val.toLocaleString('en-IN'),
        color: COLORS[i % COLORS.length],
      }));
  }

  return buildShareItems(cityData, "City", "city");
}

export function AttributionRevenueTraffic({ operatorData, browserData, cityData, globalEffectiveMetrics, selectedAudience, rawInstallsBreakdown }) {
  const hasAF = !!globalEffectiveMetrics?.hasAppsflyerData;
  const ctype = String(selectedAudience?.campaignType || selectedAudience?.campaign_type || "").toUpperCase();
  const isCtvWithAF = ctype.includes("CTV") && hasAF;
  const hasRawOperatorData = hasAF && rawInstallsBreakdown?.operator && Object.keys(rawInstallsBreakdown.operator).length > 0;

  // ── Traffic Breakdown from real API data ──────────────────────────────────
  const operatorItems = buildOperatorShareItems(operatorData, rawInstallsBreakdown, hasAF);
  const browserItems = isCtvWithAF ? null : buildShareItems(browserData, "Browser", "browser");
  const geoItems = buildGeoShareItems(cityData, rawInstallsBreakdown, hasAF);

  const countLabel = (items) => items ? `${items.length}` : "–";

  const hasTrafficData = operatorItems || browserItems || geoItems;

  return (
    <>
      {/* ── Traffic Breakdown ── */}
      {hasTrafficData && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, margin: "0 24px" }}>
            {operatorItems && (
              <DonutCard
                title="Network Operators"
                subTitle={hasRawOperatorData ? "By install" : "By impression share"}
                label={countLabel(operatorItems)}
                subLabel="Operators"
                tag="ISP"
                tagColor="#3B82F6"
                items={operatorItems}
              />
            )}
            {browserItems && (
              <DonutCard
                title="Browsers"
                subTitle="By impression share"
                label={countLabel(browserItems)}
                subLabel="Browsers"
                tag="WEB"
                tagColor="#22C55E"
                items={browserItems}
              />
            )}
            {geoItems && (
              <DonutCard
                title={hasAF ? "Top States" : "Top Cities"}
                subTitle={hasAF ? "By install" : "By impression share"}
                label={countLabel(geoItems)}
                subLabel={hasAF ? "States" : "Cities"}
                tag="GEO"
                tagColor="#F97316"
                items={geoItems}
              />
            )}
          </div>
        </>
      )}
    </>
  );
}

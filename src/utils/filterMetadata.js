/**
 * Filters out DV360 metadata rows that are mistakenly included in the report data.
 * These rows typically contain labels like "Report Time:", "Date Range:", "Group By:", etc.
 * 
 * @param {Array} data - The array of objects to filter.
 * @returns {Array} - The filtered array.
 */
export const filterMetadataRows = (data) => {
  if (!Array.isArray(data)) return [];

  const METADATA_LABELS = [
    "report time:",
    "date range:",
    "group by:",
    "reporting number:",
    "reporting numver:",
    "filterby id",
    "filter by id",
    "filter by", // Catch-all for other filters
    "reporting numbers from the previous month are finalized",
    "dv360",
    "total:",
  ];

  return data.filter((row) => {
    // Collect all possible title/name fields
    const title = (
      row.Title || row.title || 
      row.creative_name || row.Creative || 
      row.name || row.creative || 
      row.line_item_name || row.LineItem ||
      row.InsertionOrder || row.Advertiser ||
      ""
    ).toString().toLowerCase().trim();

    // Collect possible dimension fields
    const dimensionValue = (
      row.Age || row.age || 
      row.Gender || row.gender || 
      row.City || row.city || 
      row.Device || row.device || 
      row.Browser || row.browser || 
      row.OS || row.os || row.oses ||
      row.Operator || row.operator ||
      ""
    ).toString().toLowerCase().trim();

    // If we have an explicit "unknown" type label in the title or dimension, filter it out
    const isUnknown = 
      title === "unknown" || title === "null" || title === "undefined" || title === "-" ||
      dimensionValue === "unknown" || dimensionValue === "null" || dimensionValue === "undefined" || dimensionValue === "-";

    if (isUnknown) return false;

    // Check against metadata labels
    const isMetadata = METADATA_LABELS.some(label => title.includes(label));
    if (isMetadata) return false;

    // If title is empty, only keep it if it has a Date or Impressions (likely a time-series/performance row)
    if (!title) {
        return !!(row.Date || row.date || Number(row.Impressions || row.impressions || 0) > 0);
    }

    return true;
  });
};

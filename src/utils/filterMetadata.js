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
      row.Title || 
      row.title || 
      row.creative_name || 
      row.Creative || 
      row.name || 
      row.creative || 
      row.line_item_name || 
      row.LineItem ||
      row.InsertionOrder || 
      row.Advertiser || 
      row.Browser ||
      row.OS ||
      row.OperatingSystem ||
      row.Operator ||
      row.City ||
      row.Device ||
      ""
    ).toString().toLowerCase().trim();

    // If the title itself is one of the metadata labels, filter it out
    // Also filter if it *contains* specific known metadata blocks
    if (!title || title === "-" || title === "unknown") return true; // Keep these, maybe handle later

    const isMetadata = METADATA_LABELS.some(label => title.includes(label));
    return !isMetadata;
  });
};

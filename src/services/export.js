import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const parseBlobError = async (error) => {
  if (error.response?.data && error.response.data instanceof Blob) {
    try {
      const text = await error.response.data.text();
      try {
        const parsed = JSON.parse(text);
        if (parsed?.message) {
          return new Error(parsed.message);
        }
      } catch (e) {}
      if (text) return new Error(text);
    } catch (e) {}
  }
  return error;
};

export const downloadCSV = async (filters) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/export/download/all/csv`,
      {
        ...filters,
        reportName: filters.reportName,
        advertiserId: filters.advertiser,
        startDate: filters.dateRange?.startDate || filters.startDate,
        endDate: filters.dateRange?.endDate || filters.endDate,
      },
      {
        headers: {
          Authorization: token,
        },
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filters.reportName || "Report"}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    const err = await parseBlobError(error);
    console.error("Error downloading CSV:", err.message);
    throw err;
  }
};

export const downloadExcel = async (filters) => {
  try {
    console.log("filters", filters);
    const token = await getToken();

    // Sanitize uiData if present to avoid sending excessive unneeded data
    const payload = {
      ...filters,
      reportName: filters.reportName,
      advertiserId: filters.advertiser,
      startDate: filters.dateRange?.startDate || filters.startDate,
      endDate: filters.dateRange?.endDate || filters.endDate,
    };

    const res = await axios.post(
      `${API_URL}/export/download/all/excel`,
      payload,
      {
        headers: {
          Authorization: token,
        },
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filters.reportName || "Report"}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    const err = await parseBlobError(error);
    console.error("Error downloading Excel:", err.message);
    throw err;
  }
};

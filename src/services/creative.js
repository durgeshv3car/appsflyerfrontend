import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const createReportsDataCreative = async (params) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/dv360/listQueries/creative`,
      {
        audienceId: params.audienceId,
        dataRange: params.dataRange,
        startDate: params.startDate,
        endDate: params.endDate,
        campaignType: params.campaignType,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.log(
      "Error fetching audience data:",
      error.response?.data || error.message
    );
    throw error;
  }
};


// Daily reports with custom date range
export const getDailyReportsByRangeCreative = async (insertionOrderId, startDate, endDate, page = 1, limit = 10) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/creative/range`,
      {
        insertionOrderId,
        startDate,
        endDate,
        page,
        limit
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.log(
      "Error fetching daily reports by range:",
      error.response?.data || error.message
    );
    throw error;
  }
};


// Download ALL daily creative data as CSV
export const downloadAllDailyCreativeCSV = async (insertionOrderId) => {
  try {
    const token = await getToken();

    const res = await axios.post(
      `${API_URL}/creative/download/daily-all`,
      { insertionOrderId },
      {
        headers: {
          Authorization: token,
        },
        responseType: "blob", // IMPORTANT for CSV
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `creative_daily_${insertionOrderId}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log(
      "Error downloading daily creative CSV:",
      error.response?.data || error.message
    );
    throw error;
  }
};

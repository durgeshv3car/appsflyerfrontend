import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const createReportsDataAdPos = async (params) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/dv360/listQueries/ad-pos`,
      {
        audienceId: params.audienceId,
        dataRange: params.dataRange,
        startDate: params.startDate,
        endDate: params.endDate,
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
export const getDailyReportsByRangeAdPos = async (insertionOrderId, startDate, endDate, page = 1, limit = 10) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/ad-pos/range`,
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


// Download ALL daily ad-pos data as CSV
export const downloadAllDailyAdPosCSV = async (insertionOrderId) => {
  try {
    const token = await getToken();

    const res = await axios.post(
      `${API_URL}/ad-pos/download/daily-all`,
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
      `ad-pos_daily_${insertionOrderId}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log(
      "Error downloading daily ad-pos CSV:",
      error.response?.data || error.message
    );
    throw error;
  }
};

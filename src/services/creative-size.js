import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const createReportsDataCreativeSize = async (params) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/dv360/listQueries/creative-size`,
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
export const getDailyReportsByRangeCreativeSize = async (insertionOrderId, startDate, endDate) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/creative-size/range`,
      {
        insertionOrderId,
        startDate,
        endDate,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    return res.data.data;
  } catch (error) {
    console.log(
      "Error fetching daily reports by range:",
      error.response?.data || error.message
    );
    throw error;
  }
};


// Download ALL daily creative-size data as CSV
export const downloadAllDailyCreativeSizeCSV = async (insertionOrderId) => {
  try {
    const token = await getToken();

    const res = await axios.post(
      `${API_URL}/creative-size/download/daily-all`,
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
      `creative-size_daily_${insertionOrderId}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log(
      "Error downloading daily creative-size CSV:",
      error.response?.data || error.message
    );
    throw error;
  }
};

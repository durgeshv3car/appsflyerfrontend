import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const createReportsDataDevice = async (params) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/dv360/listQueries/device`,
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
export const getDailyReportsByRange = async (insertionOrderId, startDate, endDate, page = 1, limit = 10) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/device/range`,
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

// Download ALL daily device data as CSV
export const downloadAllDailyDeviceCSV = async (insertionOrderId) => {
  try {
    const token = await getToken();

    const res = await axios.post(
      `${API_URL}/device/download/daily-all`,
      { insertionOrderId },
      {
        headers: {
          Authorization: token,
        },
        responseType: "blob", // IMPORTANT
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `device_daily_${insertionOrderId}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log(
      "Error downloading daily device CSV:",
      error.response?.data || error.message
    );
    throw error;
  }
};


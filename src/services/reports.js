import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const createReportsData = async (params) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/dv360/listQueries`,
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
export const getDailyReportsByRange = async (insertionOrderId, startDate, endDate, page = 1, limit = 10) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/overview/range`,
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

// Monthly reports with filter (LAST_7_DAYS, LAST_30_DAYS, etc.)
export const getMonthlyReportsByFilter = async (insertionOrderId, filter) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/overview/monthly/filter`,
      {
        insertionOrderId,
        filter,
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
      "Error fetching monthly reports by filter:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Monthly reports with custom date range
export const getMonthlyReportsByRange = async (insertionOrderId, startDate, endDate) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/overview/monthly/range`,
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
      "Error fetching monthly reports by range:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Download ALL daily overview data as CSV
export const downloadAllDailyOverviewCSV = async (insertionOrderId) => {
  try {
    const token = await getToken();

    const res = await axios.post(
      `${API_URL}/overview/download/daily-all`,
      { insertionOrderId },
      {
        headers: {
          Authorization: token,
        },
        responseType: "blob", // VERY IMPORTANT for CSV
      }
    );

    // Create download link in browser
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `overview_daily_${insertionOrderId}.csv`
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.log(
      "Error downloading daily overview CSV:",
      error.response?.data || error.message
    );
    throw error;
  }
};


import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const createReportsDataAge = async (params) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/dv360/listQueries/age`,
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
      `${API_URL}/demographics/range`,
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

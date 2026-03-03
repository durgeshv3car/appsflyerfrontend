import axios from "axios";
const Api_Url = process.env.NEXT_PUBLIC_API_BASE_URL;
import { getToken } from "@/lib/getToken";

export const getCreativeData = async (filters,report_type) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/eskimi/get/creative`,
       {advertiserId:filters.advertiser,campaignId:filters.campaign,report_type,start_date:filters.dateRange.startDate,end_date:filters.dateRange.endDate,report_by:filters.report_by},
      {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error creating token:", error.response?.data || error.message);
    throw error;
  }
};

export const getCampaignIdData = async (filters) => {
  try {
    const token = await getToken();
    const payload = { advertiserId: filters.advertiser };

    const res = await axios.post(
      `${Api_Url}/eskimi/get/campaigns`,
      payload,
      {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching campaign IDs:", error.response?.data || error.message);
    throw error;
  }
};
export const getSiteIdData = async (filters) => {
  try {
    const token = await getToken();
    const payload = { advertiserId: filters.advertiser };

    const res = await axios.post(
      `${Api_Url}/eskimi/get/sites`,
      payload,
      {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching site IDs:", error.response?.data || error.message);
    throw error;
  }
};
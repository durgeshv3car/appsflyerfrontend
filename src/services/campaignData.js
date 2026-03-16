import axios from "axios";
const Api_Url = process.env.NEXT_PUBLIC_API_BASE_URL;
import { getToken } from "@/lib/getToken";


export const getCampaignData = async (filters,report_type) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/eskimi/get`,
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

export const getCampaignDataByAge = async (filters,report_type) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/eskimi/get/age`,
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

export const getCampaignDataByGender = async (filters,report_type) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/eskimi/get/gender`,
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

export const getCampaignDataByOses = async (filters,report_type) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/eskimi/get/oses`,
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
export const getCampaignDataByBrowser = async (filters,report_type) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/eskimi/get/browser`,
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
export const getCampaignDataByOperator = async (filters,report_type) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/eskimi/get/operator`,
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
export const getCampaignDataByPlacementPos = async (filters,report_type) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/eskimi/get/placement-pos`,
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
export const getCampaignDataByPlacementType = async (filters,report_type) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/eskimi/get/placement-type`,
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

export const getCampaignDataByDevice = async (filters,report_type) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/eskimi/get/device`,
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

export const getCampaignDataByCity = async (filters,report_type) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/eskimi/get/city`,
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
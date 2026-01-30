import axios from "axios";
const Api_Url = process.env.NEXT_PUBLIC_API_BASE_URL;
import { getToken } from "@/lib/getToken";

export const createAdvertiser = async (advertiserData) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/advertise/create`,
      {
        advertise_id: advertiserData.advertise_id,
        advertiser_name: advertiserData.advertise_name,
      },
      {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error creating token:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAdvertisers = async () => {
  try {
    const token = await getToken();
    const res = await axios.get(`${Api_Url}/advertise/get`, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching advertisers:", error);
    throw error;
  }
};

export const createAdvertiserCampaign = async (advertiserData) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/advertise/campaign/create`,
      {
        advertise_id: advertiserData.advertiser_id,
        campaign_name: advertiserData.campaign_name,
        campaign_id: advertiserData.campaign_id,
      },
      {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      "Error creating token:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAdvertisersCampaign = async () => {
  try {
    const token = await getToken();
    const res = await axios.get(`${Api_Url}/advertise/campaign/get`, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching advertisers:", error);
    throw error;
  }
};

export const getAdvertisersCampaignById = async (campaignId) => {
  try {
    const token = await getToken();
    const res = await axios.get(`${Api_Url}/advertise/campaign/get/${campaignId}`, {
      
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching advertisers:", error);
    throw error;
  }
};

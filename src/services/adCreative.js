import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

/**
 * 1. Upload creative asset directly to DV360 (No DB storage)
 * @param {FormData} formData
 */
export const uploadDV360CreativeDirect = async (formData) => {
  try {
    const token = await getToken();
    const res = await axios.post(`${API_URL}/ad-creatives/upload`, formData, {
      headers: {
        Authorization: token ? `${token}` : "",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error uploading creative directly to DV360:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 2. List live creatives from DV360 API for a given Advertiser
 * @param {Object} params { advertiserId, search, pageSize, pageToken, creativeType }
 */
export const getDV360CreativesList = async (params = {}) => {
  try {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/ad-creatives`, {
      params,
      headers: {
        Authorization: token ? `${token}` : "",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error listing DV360 creatives:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 3. Fetch single creative details directly from DV360
 * @param {string} creativeId
 * @param {string} advertiserId
 */
export const getDV360CreativeById = async (creativeId, advertiserId) => {
  try {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/ad-creatives/${creativeId}`, {
      params: { advertiserId },
      headers: {
        Authorization: token ? `${token}` : "",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching DV360 creative details:", error.response?.data || error.message);
    throw error;
  }
};

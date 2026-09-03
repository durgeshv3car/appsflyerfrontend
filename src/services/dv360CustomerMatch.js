import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

/**
 * 1. Create DV360 Customer Match Audience
 * @param {Object} payload { advertiserId, displayName, description, audienceType, membershipDurationDays, members, consent }
 */
export const createDV360CustomerMatchAudience = async (payload) => {
  try {
    const token = await getToken();
    const res = await axios.post(`${API_URL}/dv360-customer-match/create`, payload, {
      headers: {
        Authorization: token ? `${token}` : "",
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error creating DV360 Customer Match audience:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 2. Upload / Append Members to existing DV360 Audience
 * @param {Object} payload { advertiserId, dv360AudienceId, audienceType, members, consent }
 */
export const uploadDV360CustomerMatchMembers = async (payload) => {
  try {
    const token = await getToken();
    const res = await axios.post(`${API_URL}/dv360-customer-match/upload-members`, payload, {
      headers: {
        Authorization: token ? `${token}` : "",
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error uploading members to DV360 audience:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 3. List DV360 Customer Match Audiences
 * @param {Object} params { advertiserId, page, limit, search, fetchLive }
 */
export const getDV360CustomerMatchAudiences = async (params = {}) => {
  try {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/dv360-customer-match/list`, {
      params,
      headers: {
        Authorization: token ? `${token}` : "",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching DV360 audiences:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 4. Get DV360 Audience by ID
 * @param {string} id Mongo ID or DV360 ID
 * @param {string} advertiserId Optional DV360 Advertiser ID
 */
export const getDV360AudienceById = async (id, advertiserId = "") => {
  try {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/dv360-customer-match/${id}`, {
      params: { advertiserId },
      headers: {
        Authorization: token ? `${token}` : "",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching audience details:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 5. Preview & validate hashed entries locally before submitting
 * @param {Object} payload { entries: [...], audienceType: "CUSTOMER_MATCH_CONTACT_INFO" }
 */
export const previewHashedMembers = async (payload) => {
  try {
    const token = await getToken();
    const res = await axios.post(`${API_URL}/dv360-customer-match/preview-hash`, payload, {
      headers: {
        Authorization: token ? `${token}` : "",
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error previewing hash:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 6. Fetch / Search Google Audiences from DV360 (Affinity, In-Market, Demographics, Life Events)
 * @param {Object} params { advertiserId, search, googleAudienceType, pageSize, pageToken }
 */
export const getGoogleAudiences = async (params = {}) => {
  try {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/dv360-customer-match/google-audiences`, {
      params,
      headers: {
        Authorization: token ? `${token}` : "",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching Google Audiences:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 7. Create and Save Google Interest Audience / Custom Intent Profile
 * @param {Object} payload { advertiserId, displayName, description, audienceCategory, audienceType, googleAudiences, customKeywords, customUrls }
 */
export const createGoogleInterestAudience = async (payload) => {
  try {
    const token = await getToken();
    const res = await axios.post(`${API_URL}/dv360-customer-match/create-interest`, payload, {
      headers: {
        Authorization: token ? `${token}` : "",
        "Content-Type": "application/json",
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error creating Google Interest Audience:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * 8. Delete DV360 Customer Match / Google Interest Audience
 * @param {string} audienceId
 * @param {string} advertiserId
 */
export const deleteDV360CustomerMatchAudience = async (audienceId, advertiserId = "") => {
  try {
    const token = await getToken();
    const config = {
      params: { advertiserId },
      headers: {
        Authorization: token ? `${token}` : "",
      },
    };

    let res = null;
    let lastError = null;

    try {
      res = await axios.delete(
        `${API_URL}/dv360-customer-match/${encodeURIComponent(audienceId)}`,
        config
      );
    } catch (primaryErr) {
      lastError = primaryErr;
      try {
        res = await axios.delete(
          `${API_URL}/audience/${encodeURIComponent(audienceId)}`,
          config
        );
      } catch (fallbackErr) {
        lastError = fallbackErr;
      }
    }

    if (res && res.data) {
      return res.data;
    }
    if (lastError) {
      throw lastError;
    }
    return { success: true };
  } catch (error) {
    console.error("Error deleting DV360 audience:", error.response?.data || error.message);
    throw error;
  }
};


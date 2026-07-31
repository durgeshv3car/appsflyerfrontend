import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Endpoint: /api/appsflyer-audience

export const createAppsFlyerData = async (data) => {
  try {
    const token = await getToken();
    const res = await axios.post(`${API_URL}/appsflyer-audience/create`, data, {
      headers: {
        Authorization: token,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error creating AppsFlyer data:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllAppsFlyerData = async () => {
  try {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/appsflyer-audience/`, {
      headers: {
        Authorization: token,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching AppsFlyer data:", error.response?.data || error.message);
    throw error;
  }
};

export const getSingleAppsFlyerData = async (id) => {
  try {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/appsflyer-audience/${id}`, {
      headers: {
        Authorization: token,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching single AppsFlyer data:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteAppsFlyerData = async (id) => {
  try {
    const token = await getToken();
    const res = await axios.delete(`${API_URL}/appsflyer-audience/${id}`, {
      headers: {
        Authorization: token,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error deleting AppsFlyer data:", error.response?.data || error.message);
    throw error;
  }
};

// Since the user didn't provide an update route in the snippet, 
// I'll leave it as a placeholder or remove it if not used.
// However, the previous UI had an update button. 
// If the backend doesn't support it, I might have to remove the edit functionality or assume it will be added.
export const updateAppsFlyerData = async (id, data) => {
  // Placeholder - the user didn't provide an update route in the backend snippet.
  // I will check if they want to use create instead or if I should just keep it as is.
  console.warn("Update route not provided in backend snippet.");
  return { success: false, message: "Update not implemented in backend" };
};

export const getAppsFlyerByAudienceId = async (audienceId, hasEndDate) => {
  const endpoint = hasEndDate ? "appsflyer-conversion" : "appsflyer-audience";
  const fallbackEndpoint = hasEndDate ? "appsflyer-audience" : "appsflyer-conversion";
  try {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/${endpoint}/by-audience/${audienceId}`, {
      headers: {
        Authorization: token,
      },
    });
    if (res.data && res.data.success && res.data.data && res.data.data.length > 0) {
      return res.data;
    }
    // If successful but no data, try fallback
    const fallbackRes = await axios.get(`${API_URL}/${fallbackEndpoint}/by-audience/${audienceId}`, {
      headers: {
        Authorization: token,
      },
    });
    return fallbackRes.data;
  } catch (error) {
    // If primary failed, try fallback
    try {
      const token = await getToken();
      const fallbackRes = await axios.get(`${API_URL}/${fallbackEndpoint}/by-audience/${audienceId}`, {
        headers: {
          Authorization: token,
        },
      });
      return fallbackRes.data;
    } catch (fallbackError) {
      console.error(`Error fetching AppsFlyer by audience ID from both endpoints:`, fallbackError.response?.data || fallbackError.message);
      throw error;
    }
  }
};

export const getAppsFlyerSyncData = async (app_id, startDate, endDate, hasEndDate, audienceId) => {
  const endpoint = hasEndDate ? "appsflyer-conversion" : "appsflyer-audience";
  try {
    const token = await getToken();

    const res = await axios.post(
      `${API_URL}/${endpoint}/sync-data`,
      {
        app_id,
        startDate,
        endDate,
        audienceId,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error(
      `Error fetching AppsFlyer sync data from ${endpoint}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAppsFlyerRawInstallsBreakdown = async (app_id, startDate, endDate) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/appsflyer-new/installs-breakdown`,
      {
        app_id,
        startDate,
        endDate,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching AppsFlyer raw installs breakdown:", error.response?.data || error.message);
    throw error;
  }
};

export const createAppsFlyerReport = async (data) => {
  try {
    const token = await getToken();
    const res = await axios.post(`${API_URL}/appsflyer-reports/create`, data, {
      headers: {
        Authorization: token,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error creating AppsFlyer report:", error.response?.data || error.message);
    throw error;
  }
};

export const getAllAppsFlyerReports = async (search = "") => {
  try {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/appsflyer-reports/`, {
      params: { search },
      headers: {
        Authorization: token,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching AppsFlyer reports:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteAppsFlyerReport = async (id) => {
  try {
    const token = await getToken();
    const res = await axios.delete(`${API_URL}/appsflyer-reports/${id}`, {
      headers: {
        Authorization: token,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error deleting AppsFlyer report:", error.response?.data || error.message);
    throw error;
  }
};

export const getAppsFlyerReportData = async (appId, mediaSource, eventName = "", date = "") => {
  try {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/appsflyer-reports/data`, {
      params: { app_id: appId, media_source: mediaSource, eventName, date },
      headers: {
        Authorization: token,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching report data:", error.response?.data || error.message);
    throw error;
  }
};

export const syncAppsFlyerReport = async (id) => {
  try {
    const token = await getToken();
    const res = await axios.post(`${API_URL}/appsflyer-reports/${id}/sync`, {}, {
      headers: {
        Authorization: token,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error syncing report:", error.response?.data || error.message);
    throw error;
  }
};

export const getAppsFlyerRawInstalls = async (params) => {
  try {
    const token = await getToken();
    const res = await axios.post(`${API_URL}/appsflyer-new/appflyersrawinstall`, params, {
      headers: {
        Authorization: token,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching AppsFlyer raw installs:", error.response?.data || error.message);
    throw error;
  }
};

export const getAppsFlyerInstalls = getAppsFlyerRawInstalls;



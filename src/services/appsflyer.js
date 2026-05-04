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

export const getAppsFlyerByAudienceId = async (audienceId) => {
  try {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/appsflyer-audience/by-audience/${audienceId}`, {
      headers: {
        Authorization: token,
      },
    });
    return res.data;
  } catch (error) {
    console.error("Error fetching AppsFlyer by audience ID:", error.response?.data || error.message);
    throw error;
  }
};

export const getAppsFlyerSyncData = async (app_id, startDate, endDate) => {
  try {
    const token = await getToken();

    const res = await axios.post(
      `${API_URL}/appsflyer-audience/sync-data`,
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
    console.error(
      "Error fetching AppsFlyer sync data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

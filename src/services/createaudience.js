import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const createAudience = async (campaignData) => {
  try {
    const token = await getToken();
    const res = await axios.post(`${API_URL}/audience`, campaignData, {
      headers: {
        Authorization: token,
      },
    });

    return res.data;
  } catch (error) {
    console.log(
      "Error fetching audience data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getAudience = async (search = "") => {
  try {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/audiences/data`, {
      params: { search },
      headers: {
        Authorization: token,
      },
    });

    return res.data;
  } catch (error) {
    console.log(
      "Error fetching audience data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const deleteAudience = async (audienceId) => {
  try {
    const token = await getToken();
    const res = await axios.delete(`${API_URL}/audience/${audienceId}`, {
      headers: {
        Authorization: token,
      },
    });

    return res.data;
  } catch (error) {
    console.log(
      "Error fetching audience data:",
      error.response?.data || error.message
    );
    throw error;
  }
};
export const getAudienceByUser = async (userId, role) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/audiences`,
      {
        userId,
        role,
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

export const updateAudience = async (audienceId, campaignData) => {
  try {
    const token = await getToken();
    const res = await axios.put(
      `${API_URL}/audience/${audienceId}`,
      campaignData,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log(
      "Error updating audience data:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const addAudienceToUser = async (email, audienceId) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/auth/user/add`,
      { email, audienceId },
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

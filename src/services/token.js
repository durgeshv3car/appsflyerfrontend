import axios from "axios";
const Api_Url = process.env.NEXT_PUBLIC_API_BASE_URL;
import { getToken } from "@/lib/getToken";

/**
 * Create a new token
 */
export const createToken = async (campaign_name, email) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/token/create`,
      { campaign_name, email },
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

/**
 * Get all tokens
 */
export const getAllToken = async () => {
  try {
    const token = await getToken();
    const res = await axios.get(`${Api_Url}/token/get`, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data; // Array of token objects
  } catch (error) {
    console.error("Error fetching tokens:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete a token by ID
 */
export const deleteToken = async (id) => {
  try {
    const token = await getToken();
    const res = await axios.delete(`${Api_Url}/token/delete/${id}`, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data; // Success message
  } catch (error) {
    console.error("Error deleting token:", error.response?.data || error.message);
    throw error;
  }
};

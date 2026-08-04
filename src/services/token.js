import axios from "axios";
const Api_Url = process.env.NEXT_PUBLIC_API_BASE_URL;
import { getToken } from "@/lib/getToken";

/**
 * Create a new token with email and token parameters
 */
export const createToken = async (email, token) => {
  try {
    const authToken = await getToken();

    let targetEmail = "";
    let targetToken = "";

    if (typeof email === "object" && email !== null) {
      targetEmail = email.email || email.gmail || "";
      targetToken = email.token || email.campaign_name || email.reportName || "";
    } else {
      targetEmail = email || "";
      targetToken = token || "";
    }

    const payload = {
      email: targetEmail.trim(),
      gmail: targetEmail.trim(),
      token: targetToken.trim(),
      // required by old deployed backend:
      campaign_name: targetToken.trim() || targetEmail.trim() || "default",
      advertiseId: "default",
    };

    const res = await axios.post(
      `${Api_Url}/token/create`,
      payload,
      {
        headers: {
          Authorization: `${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const createdData = res.data;
    const createdId =
      createdData?._id ||
      createdData?.id ||
      createdData?.data?._id ||
      createdData?.data?.id ||
      createdData?.token?._id ||
      createdData?.token?.id;

    if (createdId && targetEmail.trim()) {
      try {
        await addEmail(createdId, targetEmail.trim());
      } catch (e) {
        console.warn("Could not attach email via add-email endpoint:", e.message);
      }
    }

    return createdData;
  } catch (error) {
    console.error("Error creating token:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update a token by ID with email and token parameters
 */
export const updateToken = async (id, email, token) => {
  try {
    const authToken = await getToken();

    let targetEmail = "";
    let targetToken = "";

    if (typeof email === "object" && email !== null) {
      targetEmail = email.email || email.gmail || "";
      targetToken = email.token || email.campaign_name || email.reportName || "";
    } else {
      targetEmail = email || "";
      targetToken = token || "";
    }

    const payload = {
      email: targetEmail.trim(),
      gmail: targetEmail.trim(),
      token: targetToken.trim(),
      // required by old deployed backend:
      campaign_name: targetToken.trim() || targetEmail.trim() || "default",
      advertiseId: "default",
    };

    const res = await axios.put(
      `${Api_Url}/token/update/${id}`,
      payload,
      {
        headers: {
          Authorization: `${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (id && targetEmail.trim()) {
      try {
        await addEmail(id, targetEmail.trim());
      } catch (e) {
        console.warn("Could not update email via add-email endpoint:", e.message);
      }
    }

    return res.data;
  } catch (error) {
    console.error("Error updating token:", error.response?.data || error.message);
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
    return res.data;
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
    return res.data;
  } catch (error) {
    console.error("Error deleting token:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Add email to token
 */
export const addEmail = async (id, email) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/token/add-email`,
      { tokenId: id, email, gmail: email },
      {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error adding email to token:", error.response?.data || error.message);
    throw error;
  }
};

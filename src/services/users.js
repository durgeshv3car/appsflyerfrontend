import axios from "axios";
const Api_Url = process.env.NEXT_PUBLIC_API_BASE_URL;
import { getToken } from "@/lib/getToken";

/**
 * Register a new user
 */
export const registerUser = async ( name, role, email, password ) => {
  try {
    console.log(name,role,email,password)
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/auth/register`,
      { name, role, email, password },
      {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data; 
  } catch (error) {
    console.error("Error registering user:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all users
 */
export const getAllUsers = async () => {
  try {
    const token = await getToken();
    const res = await axios.get(`${Api_Url}/auth/users`, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data; // Array of users
  } catch (error) {
    console.error("Error fetching users:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete user by ID
 */
export const deleteUser = async (id) => {
  try {
    const token = await getToken();
    const res = await axios.delete(`${Api_Url}/auth/delete/${id}`, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data; // success message
  } catch (error) {
    console.error("Error deleting user:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update user by ID
 */
export const updateUser = async (id, data) => {
  try {
    const token = await getToken();
    const res = await axios.put(`${Api_Url}/auth/update/${id}`, data, {
      headers: {
        Authorization: `${token}`,
        "Content-Type": "application/json",
      },
    });
    return res.data; 
  } catch (error) {
    console.error("Error updating user:", error.response?.data || error.message);
    throw error;
  }
};
/**
 * Remove campaign from user audience
 */
export const removeUserAudience = async (email, campaignId) => {
  try {
    const token = await getToken();
    const res = await axios.patch(
      `${Api_Url}/auth/audience/remove`,
      { email, audienceId:campaignId },
      {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error removing audience:", error.response?.data || error.message);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/auth/forgot-password`,
      { email },
      {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (error) {
    
  }
}

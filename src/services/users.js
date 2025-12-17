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

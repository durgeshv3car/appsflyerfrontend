import axios from "axios";
const Api_Url = process.env.NEXT_PUBLIC_API_BASE_URL;
import { getToken } from "@/lib/getToken";

export const createAdvertiser = async (advertiserData) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${Api_Url}/advertiser/create`,
      {advertise_id:advertiserData.advertise_id,
      advertise_name:advertiserData.advertise_name,
      campaign_name:advertiserData.campaign_name,
      campaign_id:advertiserData.campaign_id},
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
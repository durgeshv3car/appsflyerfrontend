import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const downloadCSV = async (filters) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/export/download/all/csv`,
      {
        ...filters,
        advertiserId: filters.advertiser,
        startDate: filters.dateRange.startDate,
        endDate: filters.dateRange.endDate,
      },
      {
        headers: {
          Authorization: token,
        },
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `report_${filters.advertiser}_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Error downloading CSV:", error.response?.data || error.message);
    throw error;
  }
};

export const downloadExcel = async (filters) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/export/download/all/excel`,
      {
        ...filters,
        advertiserId: filters.advertiser,
        startDate: filters.dateRange.startDate,
        endDate: filters.dateRange.endDate,
      },
      {
        headers: {
          Authorization: token,
        },
        responseType: "blob",
      }
    );

    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `report_${filters.advertiser}_${new Date().getTime()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Error downloading Excel:", error.response?.data || error.message);
    throw error;
  }
};

import axios from "axios";
import { getToken } from "@/lib/getToken";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


/**
 * Create a new token
 */
export const getSearchJobStatus = async (jobId) => {
  try {
    const token = await getToken();
    const res = await axios.get(`${API_URL}/query/job/${jobId}`, {
      headers: {
        Authorization: token,
      },
    });
    return res.data;
  } catch (error) {
    console.error(
      "Error fetching job status:",
      error.response?.data || error.message
    );
    throw error;
  }
};

const pollSearchJob = async (jobId, filters) => {
  const POLLING_INTERVAL = 2000;
  const MAX_ATTEMPTS = 150;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const statusData = await getSearchJobStatus(jobId);
    const status = statusData.status || statusData.job?.status;

    if (status === "completed") {
      return await getQueryResults({ ...filters, limit: 10000 });
    }

    if (status === "failed") {
      throw new Error(statusData.error?.message || "Search job failed");
    }

    await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL));
  }

  throw new Error("Search job timed out");
};

export const getYouTubeResults = async (filters) => {
  try {
    const token = await getToken();
    const res = await axios.post(
      `${API_URL}/query/search`,
      {
        query: Array.isArray(filters.query) ? filters.query : [filters.query], // send as array
        minViews: filters.minViews,
        minSubscribers: filters.minSubscribers,
        regionCode: filters.regionCode,
        sortBy: filters.sortBy,
        maxResults: filters.maxResults,
        startDate: filters.startDate,
        endDate: filters.endDate,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );

    if (res.status === 202 && res.data.jobId) {
      return await pollSearchJob(res.data.jobId, filters);
    }

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching YouTube results:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const getQueryResults = async (filters) => {
  try {
    const token = await getToken();
    const params = {
      ...filters,
      // Ensure query and channelName are strings for backend .split(",") compatibility
      query: Array.isArray(filters.query) ? filters.query.join(",") : filters.query,
      channelName: Array.isArray(filters.channelName) ? filters.channelName.join(",") : filters.channelName,
      // Prioritize explicit limit over maxResults
      limit: filters.limit || filters.maxResults || 2000,
    };
    
    const res = await axios.get(`${API_URL}/query/results`, {
      params,
      headers: {
        Authorization: token,
      },
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching query results:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const getFiltersResults = async () => {
  try {
    const token = await getToken();
    
    const res = await axios.get(`${API_URL}/query/regions`, {
      headers: {
        Authorization: token,
      },
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching query results:",
      error.response?.data || error.message
    );
    throw error;
  }
};


export const getcsvResults = async (filters) => {
   try {
    const token = await getToken();
    
    const res = await axios.get(`${API_URL}/query/download`, {
      params: filters,
      headers: {
        Authorization: token,
      },
    });

    return res.data;
  } catch (error) {
    console.error(
      "Error fetching query results:",
      error.response?.data || error.message
    );
    throw error;
  }

}

export const getLatestQueryResults = async () => {
  try {
    const token = await getToken();

    const res = await axios.get(`${API_URL}/latest-query`, {
      headers: {
        Authorization: token,
      },
    });

    return res.data.query;

  } catch (error) {
    console.error(
      "Error fetching latest query:",
      error.response?.data || error.message
    );
    throw error;
  }
};


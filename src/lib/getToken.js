export const getToken = async () => {
  try {
    const res = await fetch("/api/auth/token");
    if (!res.ok) throw new Error("Failed to get token");

    const data = await res.json();
    return data.token;
  } catch (error) {
    console.error("Error getting token:", error);
    return null;
  }
};

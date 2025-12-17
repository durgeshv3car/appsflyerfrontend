"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const LmsPage = () => {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("c_id");
  const tokenId = searchParams.get("t_id");
  useEffect(() => {
    if (campaignId && tokenId) {
      localStorage.setItem("c_id", campaignId);
      localStorage.setItem("t_id", tokenId);
    }
  }, [campaignId, tokenId]);

  // If either query param is missing, show message or empty
  if (!campaignId || !tokenId) {
    return (
      <div className="text-center mt-20 text-gray-600">
        <h2 className="text-2xl font-semibold">No data available</h2>
        <p>Please provide valid campaign and token IDs in the URL.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">LMS Page</h1>
      <p>Campaign ID: <strong>{campaignId}</strong></p>
      <p>Token ID: <strong>{tokenId}</strong></p>

      {/* Fetch and display LMS data here using c_id and t_id */}
    </div>
  );
};

export default LmsPage;

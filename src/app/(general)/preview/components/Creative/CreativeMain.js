"use client";
import React from "react";
import CreativePerformance from "./CreativePerformance";
import CreativeTable from "./CreativeTable";
import { getCreativeData } from "@/services/creativeData";

function CreativeMain() {
  const [CreativeTableData, setCreativeTableData] = React.useState([]);

  const fetchCreativeTableData = async () => {
    try {
         const res = await getCreativeData("creatives");
         console.log("Creative Table Data:", res);
         setCreativeTableData(res.report);
       } catch (error) {
         console.log(error);
       }
  };
  useEffect(() => {
    fetchCreativeTableData();
  }, []);

  return (
    <>
      <CreativePerformance CreativeTableData={CreativeTableData} />
      <CreativeTable CreativeTableData={CreativeTableData} />
    </>
  );
}

export default CreativeMain;

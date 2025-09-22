// import Footer from '@/components/shared/Footer'
// import PageHeader from '@/components/shared/pageHeader/PageHeader'
// import PageHeaderWidgets from '@/components/shared/pageHeader/PageHeaderWidgets'
// import EstimateAreaChartThree from '@/components/widgetsCharts/EstimateAreaChartThree'
// import SalesPipelineChart from '@/components/widgetsCharts/SalesPipelineChart'
// import ProjectAssingeMiscellaneous from '@/components/widgetsMiscellaneous/ProjectAssingeMiscellaneous'
// import ForecastRevenueMiscellaneous from '@/components/widgetsMiscellaneous/ForecastRevenueMiscellaneous'
// import EstimateStatisticsTwo from '@/components/widgetsStatistics/EstimateStatisticsTwo'
// import LeadsStatus from '@/components/widgetsTables/LeadsStatus'
// import React from 'react'

// const page = () => {
//   return (
//     <>
//       <PageHeader >
//         <PageHeaderWidgets />
//       </PageHeader>
//       <div className='main-content'>
//         <div className='row'>

//  <LeadsStatus title={"Contact Leads"} progressFullHeight={true} />

//           <EstimateStatisticsTwo />
//           <SalesPipelineChart isFooterShow={true} />
//           <ForecastRevenueMiscellaneous />
//           <ProjectAssingeMiscellaneous />
//           <EstimateAreaChartThree />
//           <LeadsStatus title={"Contact Leads"} progressFullHeight={true} />
//         </div>
//       </div>
//       <Footer />
//     </>
//   )
// }

// export default page



'use client'

import React, { useEffect, useState } from 'react'
import Footer from '@/components/shared/Footer'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import PageHeaderWidgets from '@/components/shared/pageHeader/PageHeaderWidgets'
import EstimateAreaChartThree from '@/components/widgetsCharts/EstimateAreaChartThree'
import SalesPipelineChart from '@/components/widgetsCharts/SalesPipelineChart'
import ProjectAssingeMiscellaneous from '@/components/widgetsMiscellaneous/ProjectAssingeMiscellaneous'
import ForecastRevenueMiscellaneous from '@/components/widgetsMiscellaneous/ForecastRevenueMiscellaneous'
import EstimateStatisticsTwo from '@/components/widgetsStatistics/EstimateStatisticsTwo'
import LeadsStatus from '@/components/widgetsTables/LeadsStatus'
import axios from 'axios'

const Page = () => {
  const [leadsData, setLeadsData] = useState([]);

  useEffect(() => {
    const fetchInitialLeads = async () => {
      try {
        const response = await axios.get("http://localhost:5000/v1/fetch-report");
        const raw = Array.isArray(response.data) ? response.data : [response.data];
        const clean = (val) => (val === "N/A" || val === undefined ? "0" : val);
        const cleaned = raw.map((item, index) => {
          const cleanedItem = {};
          Object.entries(item).forEach(([key, val]) => {
            cleanedItem[key] = clean(val);
          });
          return { id: index + 1, ...cleanedItem };
        });

        console.log("Fetched leads data:", cleaned);

        setLeadsData(cleaned);
      } catch (err) {
        console.error("Initial fetch failed:", err);
      }
    };

    fetchInitialLeads();
  }, []);

  console.log("Leads data:", leadsData);


  return (
    <>
      <PageHeader>
        <PageHeaderWidgets />
      </PageHeader>
      <div className='main-content'>
        <div className='row'>
          <LeadsStatus title="Contact Leads" progressFullHeight={true} initialData={leadsData} />
          <EstimateStatisticsTwo initialData={leadsData} />

          <SalesPipelineChart isFooterShow={true} />
          <ForecastRevenueMiscellaneous />
          <ProjectAssingeMiscellaneous />
          <EstimateAreaChartThree />
          <LeadsStatus title="Contact Leads" progressFullHeight={true} initialData={leadsData} />
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Page;

"use client";
import React, { useEffect, useRef } from "react";

const TopSitesTable = () => {
  const sites = [
    {
      name: "skelbiu.lt",
      impressions: 47703,
      clicks: 1157,
      ctr: "2.43%",
      spent: "$143.11",
    },
    {
      name: "autogidas.lt",
      impressions: 35326,
      clicks: 1213,
      ctr: "3.43%",
      spent: "$105.98",
    },
    {
      name: "draugas.lt",
      impressions: 11538,
      clicks: 202,
      ctr: "1.75%",
      spent: "$34.61",
    },
    {
      name: "madeinvilnius.lt",
      impressions: 10963,
      clicks: 214,
      ctr: "1.95%",
      spent: "$32.89",
    },
    {
      name: "ve.lt",
      impressions: 7229,
      clicks: 186,
      ctr: "2.57%",
      spent: "$21.69",
    },
    {
      name: "9gag.com",
      impressions: 4947,
      clicks: 55,
      ctr: "1.11%",
      spent: "$14.84",
    },
    {
      name: "vesselfinder.com",
      impressions: 4737,
      clicks: 1,
      ctr: "0.02%",
      spent: "$14.21",
    },
    {
      name: "lrytas.lt",
      impressions: 4325,
      clicks: 33,
      ctr: "0.76%",
      spent: "$12.98",
    },
  ];

  return (
    <>
      <h5 className="card-title mb-4">Top 10 Sites</h5>
      <div className="table-responsive">
        <table className="table table-hover table-striped align-middle">
          <thead className="table-light">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Site</th>
              <th scope="col" className="text-end">
                Impressions
              </th>
              <th scope="col" className="text-end">
                Clicks
              </th>
              <th scope="col" className="text-end">
                CTR
              </th>
              <th scope="col" className="text-end">
                Spent
              </th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td className="fw-medium">{site.name}</td>
                <td className="text-end">
                  {site.impressions.toLocaleString()}
                </td>
                <td className="text-end">{site.clicks.toLocaleString()}</td>
                <td className="text-end">{site.ctr}</td>
                <td className="text-end">{site.spent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
"use client";
import React from "react";
import { FiGlobe } from "react-icons/fi";

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

    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-0 pt-4 px-4 pb-0">
        <div className="d-flex align-items-center gap-2">
            <FiGlobe className="text-primary" size={20} />
            <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>Top 10 Sites</h5>
        </div>
      </div>
      <div className="card-body p-0 mt-3">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr className="border-bottom">
                <th className="text-secondary fw-bold small py-3 px-4 border-0">#</th>
                <th className="text-secondary fw-bold small py-3 px-4 border-0">Site</th>
                <th className="text-secondary fw-bold small py-3 px-4 border-0 text-end">Impressions</th>
                <th className="text-secondary fw-bold small py-3 px-4 border-0 text-end">Clicks</th>
                <th className="text-secondary fw-bold small py-3 px-4 border-0 text-end">CTR</th>
                <th className="text-secondary fw-bold small py-3 px-4 border-0 text-end">Spent</th>
              </tr>
            </thead>
            <tbody>
              {sites.map((site, idx) => (
                <tr key={idx} className="border-bottom">
                  <td className="py-3 px-4 text-muted small">{idx + 1}</td>
                  <td className="py-3 px-4 fw-medium text-dark small">{site.name}</td>
                  <td className="py-3 px-4 text-end text-dark small">{site.impressions.toLocaleString()}</td>
                  <td className="py-3 px-4 text-end text-dark small">{site.clicks.toLocaleString()}</td>
                  <td className="py-3 px-4 text-end text-dark small">{site.ctr}</td>
                  <td className="py-3 px-4 text-end text-dark small">{site.spent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
};
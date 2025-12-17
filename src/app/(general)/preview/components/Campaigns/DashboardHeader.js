"use client";
import React, { useEffect, useRef } from "react";

const DashboardHeader = () => (
  <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm">
    <div className="container-fluid py-3">
      <div className="w-100">
        <h1 className="display-6 mb-2">Campaign Performance Report</h1>
        <div className="text-muted">
          <div className="row g-3">
            <div className="col-md-4">
              <p className="mb-0">
                <i className="bi bi-building me-2"></i>
                <strong>Client:</strong> Intellectads - Fly Dubai (USD)
              </p>
            </div>
            <div className="col-md-4">
              <p className="mb-0">
                <i className="bi bi-calendar-event me-2"></i>
                <strong>Period:</strong> 2025-09-23 - 2025-09-29 (GMT+3)
              </p>
            </div>
            <div className="col-md-4">
              <p className="mb-0">
                <i className="bi bi-bullseye me-2"></i>
                <strong>Campaigns:</strong> Fly Dubai Moldova2, Latvia2,
                Lithuania2
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
);

export default DashboardHeader;